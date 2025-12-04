import { PrismaClient, Task, TaskHeartbeat } from '@prisma/client';
import { EventEmitter } from 'events';

export interface TaskProgress {
  taskId: string;
  stage: string;
  message: string;
  progress: number;
  status?: string;
  timestamp: Date;
}

export interface TaskTimeout {
  taskId: string;
  lastHeartbeat: Date;
  timeoutThreshold: number;
}

export class MonitoringService extends EventEmitter {
  private prisma: PrismaClient;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private timeoutCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_TIMEOUT = 60000; // 1分钟
  private readonly CHECK_INTERVAL = 30000; // 30秒检查一次

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  /**
   * 启动监控服务
   */
  async start(): Promise<void> {
    console.log('🔍 启动任务监控服务...');

    // 启动心跳超时检查
    this.startTimeoutCheck();

    // 启动定期清理
    this.startPeriodicCleanup();

    console.log('✅ 任务监控服务已启动');
  }

  /**
   * 停止监控服务
   */
  async stop(): Promise<void> {
    console.log('🛑 停止任务监控服务...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
    }

    await this.prisma.$disconnect();

    console.log('✅ 任务监控服务已停止');
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(progress: TaskProgress): Promise<void> {
    try {
      // 更新任务状态
      const updatedTask = await this.prisma.task.update({
        where: { id: progress.taskId },
        data: {
          stage: progress.stage,
          message: progress.message,
          status: progress.status || undefined,
          lastHeartbeat: new Date(),
          endTime: progress.status === 'completed' || progress.status === 'failed' ? new Date() : undefined
        }
      });

      // 创建心跳记录
      await this.prisma.taskHeartbeat.create({
        data: {
          taskId: progress.taskId,
          stage: progress.stage,
          message: progress.message,
          progress: progress.progress,
          metadata: {
            timestamp: progress.timestamp,
            status: progress.status
          }
        }
      });

      // 触发事件
      this.emit('taskProgress', {
        ...progress,
        task: updatedTask
      });

      // 如果任务完成或失败，触发完成事件
      if (progress.status === 'completed') {
        this.emit('taskCompleted', {
          taskId: progress.taskId,
          task: updatedTask
        });
      } else if (progress.status === 'failed') {
        this.emit('taskFailed', {
          taskId: progress.taskId,
          task: updatedTask,
          error: progress.message
        });
      }

    } catch (error) {
      console.error('更新任务进度失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务的实时状态
   */
  async getTaskStatus(taskId: string): Promise<{
    task: Task & { heartbeats: TaskHeartbeat[] };
    isTimeout: boolean;
    progress: number;
    estimatedRemaining: number;
  } | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          heartbeats: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      });

      if (!task) {
        return null;
      }

      // 检查是否超时
      const now = new Date();
      const lastHeartbeat = new Date(task.lastHeartbeat);
      const isTimeout = now.getTime() - lastHeartbeat.getTime() > this.HEARTBEAT_TIMEOUT;

      // 计算进度
      const progress = this.calculateProgress(task.stage, task.status);

      // 估算剩余时间
      const estimatedRemaining = this.calculateRemainingTime(task);

      return {
        task,
        isTimeout,
        progress,
        estimatedRemaining
      };
    } catch (error) {
      console.error('获取任务状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的活跃任务监控
   */
  async getUserActiveTasks(userId: string): Promise<Array<{
    task: Task;
    isTimeout: boolean;
    progress: number;
    estimatedRemaining: number;
  }>> {
    try {
      const activeTasks = await this.prisma.task.findMany({
        where: {
          userId,
          status: {
            in: ['pending', 'running']
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const results = await Promise.all(
        activeTasks.map(async (task) => {
          const now = new Date();
          const lastHeartbeat = new Date(task.lastHeartbeat);
          const isTimeout = now.getTime() - lastHeartbeat.getTime() > this.HEARTBEAT_TIMEOUT;

          return {
            task,
            isTimeout,
            progress: this.calculateProgress(task.stage, task.status),
            estimatedRemaining: this.calculateRemainingTime(task)
          };
        })
      );

      return results;
    } catch (error) {
      console.error('获取用户活跃任务失败:', error);
      throw error;
    }
  }

  /**
   * 标记任务为超时
   */
  async markTaskAsTimeout(taskId: string): Promise<void> {
    try {
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          message: '任务执行超时',
          endTime: new Date()
        }
      });

      // 创建超时心跳记录
      await this.prisma.taskHeartbeat.create({
        data: {
          taskId,
          stage: 'timeout',
          message: '任务执行超时，已自动终止',
          progress: 0
        }
      });

      this.emit('taskTimeout', { taskId });
    } catch (error) {
      console.error('标记任务超时失败:', error);
      throw error;
    }
  }

  /**
   * 启动超时检查
   */
  private startTimeoutCheck(): void {
    this.timeoutCheckInterval = setInterval(async () => {
      try {
        const activeTasks = await this.prisma.task.findMany({
          where: {
            status: {
              in: ['pending', 'running']
            }
          }
        });

        const now = new Date();

        for (const task of activeTasks) {
          const lastHeartbeat = new Date(task.lastHeartbeat);
          const timeSinceLastHeartbeat = now.getTime() - lastHeartbeat.getTime();

          if (timeSinceLastHeartbeat > this.HEARTBEAT_TIMEOUT) {
            console.warn(`任务 ${task.id} 心跳超时，标记为失败`);
            await this.markTaskAsTimeout(task.id);
          }
        }
      } catch (error) {
        console.error('超时检查失败:', error);
      }
    }, this.CHECK_INTERVAL);
  }

  /**
   * 启动定期清理
   */
  private startPeriodicCleanup(): void {
    // 每小时清理一次旧的心跳记录
    setInterval(async () => {
      try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        await this.prisma.taskHeartbeat.deleteMany({
          where: {
            timestamp: {
              lt: oneWeekAgo
            }
          }
        });

        console.log('清理旧心跳记录完成');
      } catch (error) {
        console.error('清理旧记录失败:', error);
      }
    }, 60 * 60 * 1000); // 1小时
  }

  /**
   * 计算任务进度百分比
   */
  private calculateProgress(stage: string, status: string): number {
    if (status === 'completed') return 100;
    if (status === 'failed' || status === 'cancelled') return 0;

    const stageProgress: Record<string, number> = {
      'initializing': 5,
      'analyzing': 15,
      'data_collection': 25,
      'content_generation': 50,
      'formatting': 75,
      'finalizing': 90,
      'completed': 100
    };

    return stageProgress[stage] || 0;
  }

  /**
   * 计算剩余时间（毫秒）
   */
  private calculateRemainingTime(task: Task): number {
    if (!task.startTime || !task.estimatedDuration) return 0;

    const elapsed = Date.now() - new Date(task.startTime).getTime();
    const remaining = task.estimatedDuration - elapsed;

    return Math.max(0, remaining);
  }

  /**
   * 获取系统监控统计
   */
  async getSystemStats(): Promise<{
    activeTasks: number;
    pendingTasks: number;
    timeoutTasks: number;
    avgProcessingTime: number;
    systemLoad: number;
  }> {
    try {
      const [
        activeTasks,
        pendingTasks,
        recentCompletedTasks
      ] = await Promise.all([
        this.prisma.task.count({
          where: { status: 'running' }
        }),
        this.prisma.task.count({
          where: { status: 'pending' }
        }),
        this.prisma.task.findMany({
          where: {
            status: 'completed',
            startTime: { not: null },
            endTime: { not: null }
          },
          take: 100,
          orderBy: { endTime: 'desc' }
        })
      ]);

      // 计算平均处理时间
      const avgProcessingTime = recentCompletedTasks.length > 0
        ? recentCompletedTasks.reduce((sum, task) => {
            if (task.startTime && task.endTime) {
              return sum + (new Date(task.endTime).getTime() - new Date(task.startTime).getTime());
            }
            return sum;
          }, 0) / recentCompletedTasks.length
        : 0;

      // 检查超时任务
      const now = new Date();
      const runningTasks = await this.prisma.task.findMany({
        where: { status: 'running' }
      });

      const timeoutTasks = runningTasks.filter(task => {
        const lastHeartbeat = new Date(task.lastHeartbeat);
        return now.getTime() - lastHeartbeat.getTime() > this.HEARTBEAT_TIMEOUT;
      }).length;

      // 简单的系统负载指标（基于活跃任务数）
      const systemLoad = Math.min((activeTasks + pendingTasks) / 10, 1);

      return {
        activeTasks,
        pendingTasks,
        timeoutTasks,
        avgProcessingTime: Math.round(avgProcessingTime),
        systemLoad: Math.round(systemLoad * 100) / 100
      };
    } catch (error) {
      console.error('获取系统统计失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    details: {
      database: boolean;
      activeMonitoring: boolean;
      timeoutChecks: boolean;
    };
  }> {
    const details = {
      database: false,
      activeMonitoring: false,
      timeoutChecks: false
    };

    try {
      // 检查数据库连接
      await this.prisma.$queryRaw`SELECT 1`;
      details.database = true;

      // 检查监控服务状态
      details.activeMonitoring = this.heartbeatInterval !== null;
      details.timeoutChecks = this.timeoutCheckInterval !== null;

      const allHealthy = Object.values(details).every(Boolean);
      const status = allHealthy ? 'healthy' : 'warning';

      return { status, details };
    } catch (error) {
      return {
        status: 'critical',
        details
      };
    }
  }
}