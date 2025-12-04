import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function taskRoutes(fastify: FastifyInstance) {
  // 创建任务
  fastify.post('/api/tasks', async (request, reply) => {
    try {
      const data = request.body as {
        projectId?: string;
        reportTypeId: string;
        type: string;
        config: any;
        userId?: string;
      };

      if (!data.reportTypeId || !data.type) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '报告类型ID和任务类型为必填项'
        });
      }

      // 验证报告类型是否存在
      const reportType = await prisma.reportType.findUnique({
        where: { id: data.reportTypeId }
      });

      if (!reportType) {
        return reply.status(404).send({
          success: false,
          error: 'REPORT_TYPE_NOT_FOUND',
          message: '报告类型不存在'
        });
      }

      // 估算任务持续时间（基于报告类型）
      const estimatedDuration = getEstimatedDuration(reportType.estimatedTime);

      const task = await prisma.task.create({
        data: {
          projectId: data.projectId,
          reportTypeId: data.reportTypeId,
          type: data.type,
          status: 'pending',
          stage: 'initializing',
          config: data.config,
          estimatedDuration,
          startTime: new Date(),
          lastHeartbeat: new Date(),
          userId: data.userId || 'anonymous'
        }
      });

      // 创建初始心跳记录
      await prisma.taskHeartbeat.create({
        data: {
          taskId: task.id,
          stage: 'initializing',
          message: '任务已创建，准备开始处理',
          progress: 0
        }
      });

      // TODO: 将任务加入队列
      // await taskQueue.add('generateReport', { taskId: task.id });

      return reply.status(201).send({
        success: true,
        data: task,
        message: '任务创建成功'
      });
    } catch (error) {
      fastify.log.error('创建任务失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'CREATE_TASK_FAILED',
        message: '创建任务失败'
      });
    }
  });

  // 获取任务状态
  fastify.get('/api/tasks/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          reportType: true,
          project: true,
          heartbeats: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'TASK_NOT_FOUND',
          message: '任务不存在'
        });
      }

      // 计算进度百分比
      const progress = calculateProgress(task.stage, task.status);

      return {
        success: true,
        data: {
          ...task,
          progress,
          isActive: ['pending', 'running'].includes(task.status),
          timeElapsed: task.startTime ? Date.now() - new Date(task.startTime).getTime() : 0
        },
        message: '获取任务状态成功'
      };
    } catch (error) {
      fastify.log.error('获取任务状态失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_TASK_FAILED',
        message: '获取任务状态失败'
      });
    }
  });

  // 获取用户的任务列表
  fastify.get('/api/tasks', async (request, reply) => {
    try {
      const query = request.query as {
        userId?: string;
        status?: string;
        page?: string;
        limit?: string;
      };

      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (query.userId) {
        whereClause.userId = query.userId;
      }
      if (query.status) {
        whereClause.status = query.status;
      }

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where: whereClause,
          include: {
            reportType: true,
            project: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.task.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          tasks: tasks.map(task => ({
            ...task,
            progress: calculateProgress(task.stage, task.status)
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: '获取任务列表成功'
      };
    } catch (error) {
      fastify.log.error('获取任务列表失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_TASKS_FAILED',
        message: '获取任务列表失败'
      });
    }
  });

  // 取消任务
  fastify.post('/api/tasks/:id/cancel', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const task = await prisma.task.findUnique({
        where: { id }
      });

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'TASK_NOT_FOUND',
          message: '任务不存在'
        });
      }

      if (!['pending', 'running'].includes(task.status)) {
        return reply.status(400).send({
          success: false,
          error: 'TASK_NOT_CANCELLABLE',
          message: '任务当前状态无法取消'
        });
      }

      await prisma.task.update({
        where: { id },
        data: {
          status: 'cancelled',
          endTime: new Date(),
          lastHeartbeat: new Date()
        }
      });

      // 记录取消心跳
      await prisma.taskHeartbeat.create({
        data: {
          taskId: id,
          stage: 'cancelled',
          message: '任务已被用户取消',
          progress: 0
        }
      });

      // TODO: 从队列中移除任务
      // await taskQueue.removeJob(id);

      return {
        success: true,
        message: '任务取消成功'
      };
    } catch (error) {
      fastify.log.error('取消任务失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'CANCEL_TASK_FAILED',
        message: '取消任务失败'
      });
    }
  });

  // 获取任务监控信息（轮询端点）
  fastify.get('/api/tasks/:id/monitoring', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const task = await prisma.task.findUnique({
        where: { id }
      });

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'TASK_NOT_FOUND',
          message: '任务不存在'
        });
      }

      // 获取最近的心跳记录
      const recentHeartbeats = await prisma.taskHeartbeat.findMany({
        where: { taskId: id },
        orderBy: { timestamp: 'desc' },
        take: 5
      });

      // 检查任务是否超时
      const now = new Date();
      const lastHeartbeat = new Date(task.lastHeartbeat);
      const isTimeout = now.getTime() - lastHeartbeat.getTime() > 60000; // 1分钟超时

      const progress = calculateProgress(task.stage, task.status);

      return {
        success: true,
        data: {
          taskId: id,
          status: task.status,
          stage: task.stage,
          progress,
          message: task.message,
          isTimeout,
          lastHeartbeat: task.lastHeartbeat,
          estimatedRemaining: calculateRemainingTime(task),
          recentHeartbeats: recentHeartbeats.slice(0, 3), // 只返回最近3次心跳
          logs: recentHeartbeats.map(hb => ({
            timestamp: hb.timestamp,
            stage: hb.stage,
            message: hb.message,
            progress: hb.progress
          }))
        },
        message: '获取监控信息成功'
      };
    } catch (error) {
      fastify.log.error('获取监控信息失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_MONITORING_FAILED',
        message: '获取监控信息失败'
      });
    }
  });

  // 内部API：更新任务心跳（由工作进程调用）
  fastify.post('/api/tasks/:id/heartbeat', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as {
        stage: string;
        message: string;
        progress?: number;
        status?: string;
      };

      await prisma.task.update({
        where: { id },
        data: {
          stage: data.stage,
          message: data.message,
          status: data.status || undefined,
          lastHeartbeat: new Date(),
          endTime: data.status === 'completed' || data.status === 'failed' ? new Date() : undefined
        }
      });

      await prisma.taskHeartbeat.create({
        data: {
          taskId: id,
          stage: data.stage,
          message: data.message,
          progress: data.progress || calculateProgress(data.stage, data.status || 'running')
        }
      });

      return {
        success: true,
        message: '心跳更新成功'
      };
    } catch (error) {
      fastify.log.error('更新心跳失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'UPDATE_HEARTBEAT_FAILED',
        message: '更新心跳失败'
      });
    }
  });
}

// 辅助函数
function getEstimatedDuration(timeStr?: string): number {
  if (!timeStr) return 600000; // 默认10分钟

  const match = timeStr.match(/(\d+)-(\d+)分钟/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return ((min + max) / 2) * 60 * 1000; // 转换为毫秒
  }

  return 600000; // 默认10分钟
}

function calculateProgress(stage: string, status: string): number {
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

function calculateRemainingTime(task: any): number {
  if (!task.startTime || !task.estimatedDuration) return 0;

  const elapsed = Date.now() - new Date(task.startTime).getTime();
  const remaining = task.estimatedDuration - elapsed;

  return Math.max(0, remaining);
}