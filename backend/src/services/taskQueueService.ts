import Queue from 'bull';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from './monitoringService';
import { ReportGenerationService, ReportGenerationRequest } from './reportGenerationService';
import { ReportAnalysisService } from './reportAnalysisService';

export interface TaskJobData {
  taskId: string;
  type: 'report_generation' | 'file_analysis';
  data: any;
  userId: string;
  metadata?: Record<string, any>;
}

export interface TaskCreationData {
  type: 'report_generation' | 'file_analysis';
  data: any;
  userId: string;
  metadata?: Record<string, any>;
}

export interface ReportGenerationConfig {
  projectName: string;
  reportType: string;
  parameters: Record<string, any>;
  outputFormat: 'pptx' | 'pdf' | 'both';
  templateConfig?: any;
}

export class TaskQueueService {
  private prisma: PrismaClient;
  private monitoring: MonitoringService;
  private reportGenerationQueue: Queue.Queue<TaskJobData>;
  private fileAnalysisQueue: Queue.Queue<TaskJobData>;
  private reportGenerationService: ReportGenerationService;
  private reportAnalysisService: ReportAnalysisService;

  constructor() {
    this.prisma = new PrismaClient();
    this.monitoring = new MonitoringService();
    this.reportGenerationService = new ReportGenerationService();
    this.reportAnalysisService = new ReportAnalysisService();

    // 创建任务队列（使用内存模式，生产环境应使用Redis）
    const redisConfig = process.env.REDIS_URL
      ? { redis: process.env.REDIS_URL }
      : { redis: { host: 'localhost', port: 6379 } };

    this.reportGenerationQueue = new Queue('report generation', redisConfig);
    this.fileAnalysisQueue = new Queue('file analysis', redisConfig);

    this.setupQueueProcessors();
    this.setupQueueEvents();
  }

  /**
   * 启动队列服务
   */
  async start(): Promise<void> {
    console.log('🚀 启动任务队列服务...');

    // 启动监控服务
    await this.monitoring.start();

    console.log('✅ 任务队列服务已启动');
  }

  /**
   * 停止队列服务
   */
  async close(): Promise<void> {
    console.log('🛑 停止任务队列服务...');

    await this.reportGenerationQueue.close();
    await this.fileAnalysisQueue.close();
    await this.monitoring.stop();
    await this.prisma.$disconnect();

    console.log('✅ 任务队列服务已停止');
  }

  /**
   * 添加任务（通用方法）
   */
  async addTask(taskCreationData: TaskCreationData): Promise<{ id: string; status: string }> {
    try {
      // 在数据库中创建任务记录
      const task = await this.prisma.task.create({
        data: {
          type: taskCreationData.type,
          inputData: taskCreationData.data,
          userId: taskCreationData.userId,
          status: 'pending',
          stage: 'submitted',
          progress: 0,
          message: '任务已提交，等待处理',
          metadata: taskCreationData.metadata
        }
      });

      const taskJobData: TaskJobData = {
        taskId: task.id,
        type: taskCreationData.type,
        data: taskCreationData.data,
        userId: taskCreationData.userId,
        metadata: taskCreationData.metadata
      };

      // 根据任务类型加入相应队列
      switch (taskCreationData.type) {
        case 'report_generation':
          await this.addReportGenerationTask(taskJobData);
          break;
        case 'file_analysis':
          await this.addFileAnalysisTask(taskJobData);
          break;
        default:
          throw new Error(`不支持的任务类型: ${taskCreationData.type}`);
      }

      return { id: task.id, status: 'pending' };
    } catch (error) {
      console.error('添加任务失败:', error);
      throw error;
    }
  }

  /**
   * 添加报告生成任务
   */
  async addReportGenerationTask(taskData: TaskJobData): Promise<Queue.Job<TaskJobData>> {
    try {
      const job = await this.reportGenerationQueue.add('generateReport', taskData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 50,
        removeOnFail: 20
      });

      console.log(`📝 报告生成任务已加入队列: ${taskData.taskId}`);
      return job;
    } catch (error) {
      console.error('添加报告生成任务失败:', error);
      throw error;
    }
  }

  /**
   * 添加文件分析任务
   */
  async addFileAnalysisTask(taskData: TaskJobData): Promise<Queue.Job<TaskJobData>> {
    try {
      const job = await this.fileAnalysisQueue.add('analyzeFile', taskData, {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000
        },
        removeOnComplete: 30,
        removeOnFail: 10
      });

      console.log(`📄 文件分析任务已加入队列: ${taskData.taskId}`);
      return job;
    } catch (error) {
      console.error('添加文件分析任务失败:', error);
      throw error;
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, userId: string): Promise<boolean> {
    try {
      // 查找并取消报告生成任务
      const reportJobs = await this.reportGenerationQueue.getJobs(['active', 'waiting', 'delayed']);
      const reportJob = reportJobs.find(job => job.data.taskId === taskId);

      if (reportJob) {
        await reportJob.remove();
        console.log(`❌ 取消报告生成任务: ${taskId}`);
        return true;
      }

      // 查找并取消文件分析任务
      const fileJobs = await this.fileAnalysisQueue.getJobs(['active', 'waiting', 'delayed']);
      const fileJob = fileJobs.find(job => job.data.taskId === taskId);

      if (fileJob) {
        await fileJob.remove();
        console.log(`❌ 取消文件分析任务: ${taskId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('取消任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取队列状态
   */
  async getQueueStats(): Promise<{
    reportGeneration: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    fileAnalysis: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  }> {
    try {
      const [reportStats, fileStats] = await Promise.all([
        this.reportGenerationQueue.getJobCounts(),
        this.fileAnalysisQueue.getJobCounts()
      ]);

      return {
        reportGeneration: reportStats,
        fileAnalysis: fileStats
      };
    } catch (error) {
      console.error('获取队列状态失败:', error);
      throw error;
    }
  }

  /**
   * 设置队列处理器
   */
  private setupQueueProcessors(): void {
    // 报告生成处理器
    this.reportGenerationQueue.process('generateReport', 3, async (job: Queue.Job<TaskJobData>) => {
      const { taskId, data, userId } = job.data;

      try {
        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'started',
          message: '开始生成报告',
          progress: 5,
          status: 'running',
          timestamp: new Date()
        });

        // 使用真正的报告生成服务
        const generationRequest: ReportGenerationRequest = data as ReportGenerationRequest;

        const result = await this.reportGenerationService.generateReport(
          generationRequest,
          userId,
          taskId
        );

        // 保存结果到任务记录
        await this.prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'completed',
            progress: 100,
            stage: 'completed',
            message: '报告生成完成',
            resultData: JSON.stringify({
              document: result.document,
              filePaths: result.filePaths,
              stats: result.generationStats
            }),
            completedAt: new Date()
          }
        });

        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'completed',
          message: '报告生成完成',
          progress: 100,
          status: 'completed',
          timestamp: new Date()
        });

        return { success: true, taskId, result };
      } catch (error: any) {
        await this.prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'failed',
            stage: 'failed',
            errorMessage: error?.message || '生成失败',
            completedAt: new Date()
          }
        });

        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'failed',
          message: `生成失败: ${error?.message || '未知错误'}`,
          progress: 0,
          status: 'failed',
          timestamp: new Date()
        });

        throw error;
      }
    });

    // 文件分析处理器
    this.fileAnalysisQueue.process('analyzeFile', 2, async (job) => {
      const { taskId } = job.data;

      try {
        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'analyzing',
          message: '开始分析文件内容',
          progress: 20,
          status: 'running',
          timestamp: new Date()
        });

        // 模拟文件分析过程
        await this.processFileAnalysis(job.data);

        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'completed',
          message: '文件分析完成',
          progress: 100,
          status: 'completed',
          timestamp: new Date()
        });

        return { success: true, taskId };
      } catch (error) {
        await this.monitoring.updateTaskProgress({
          taskId,
          stage: 'failed',
          message: `分析失败: ${error.message}`,
          progress: 0,
          status: 'failed',
          timestamp: new Date()
        });

        throw error;
      }
    });
  }

  /**
   * 设置队列事件监听
   */
  private setupQueueEvents(): void {
    // 报告生成队列事件
    this.reportGenerationQueue.on('completed', (job, result) => {
      console.log(`✅ 报告生成任务完成: ${job.data.taskId}`);
    });

    this.reportGenerationQueue.on('failed', (job, err) => {
      console.error(`❌ 报告生成任务失败: ${job.data.taskId}`, err.message);
    });

    this.reportGenerationQueue.on('stalled', (job) => {
      console.warn(`⏱️ 报告生成任务停滞: ${job.data.taskId}`);
    });

    // 文件分析队列事件
    this.fileAnalysisQueue.on('completed', (job, result) => {
      console.log(`✅ 文件分析任务完成: ${job.data.taskId}`);
    });

    this.fileAnalysisQueue.on('failed', (job, err) => {
      console.error(`❌ 文件分析任务失败: ${job.data.taskId}`, err.message);
    });
  }

  /**
   * 处理报告生成
   */
  private async processReportGeneration(taskData: TaskJobData): Promise<void> {
    const { taskId, projectId, reportTypeId, config } = taskData;

    // 获取项目和报告类型信息
    const [project, reportType] = await Promise.all([
      projectId ? this.prisma.project.findUnique({ where: { id: projectId } }) : null,
      this.prisma.reportType.findUnique({ where: { id: reportTypeId } })
    ]);

    if (!reportType) {
      throw new Error('报告类型不存在');
    }

    // 阶段1: 数据收集
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'data_collection',
      message: '收集项目数据和市场信息',
      progress: 25,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(2000);

    // 阶段2: 内容生成
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'content_generation',
      message: '使用AI生成报告内容',
      progress: 50,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(3000);

    // 阶段3: 格式化
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'formatting',
      message: '应用模板格式化报告',
      progress: 75,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(2000);

    // 阶段4: 完成
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'finalizing',
      message: '完成最终检查和优化',
      progress: 90,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(1000);

    // 创建输出文件记录（模拟）
    const outputFileName = `${project?.name || 'report'}_${reportType.name}_${Date.now()}.pptx`;

    await this.prisma.file.create({
      data: {
        originalName: outputFileName,
        storedName: outputFileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB随机大小
        path: `/outputs/${outputFileName}`,
        hash: Math.random().toString(36),
        projectId: projectId,
        taskId: taskId,
        uploadedBy: taskData.userId
      }
    });
  }

  /**
   * 处理文件分析
   */
  private async processFileAnalysis(taskData: TaskJobData): Promise<void> {
    const { taskId, config } = taskData;

    // 阶段1: 文件解析
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'parsing',
      message: '解析文件结构',
      progress: 30,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(1500);

    // 阶段2: 内容提取
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'extraction',
      message: '提取文本和图像内容',
      progress: 60,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(2000);

    // 阶段3: 模式识别
    await this.monitoring.updateTaskProgress({
      taskId,
      stage: 'pattern_recognition',
      message: 'AI分析设计模式和内容结构',
      progress: 85,
      timestamp: new Date()
    });

    await this.simulateAsyncWork(1500);

    // 存储分析结果
    const analysisResult = {
      extractedSections: ['封面', '目录', '概述', '分析', '结论'],
      designPatterns: {
        colorScheme: ['#2563eb', '#1d4ed8'],
        fonts: ['Microsoft YaHei', 'Arial'],
        layout: 'professional'
      },
      contentStructure: {
        charts: 3,
        images: 5,
        tables: 2
      }
    };

    // 更新任务配置（存储分析结果）
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        config: {
          ...config,
          analysisResult
        }
      }
    });
  }

  /**
   * 模拟异步工作
   */
  private simulateAsyncWork(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    queues: {
      reportGeneration: string;
      fileAnalysis: string;
    };
    monitoring: any;
  }> {
    try {
      const [reportHealth, fileHealth] = await Promise.all([
        this.reportGenerationQueue.checkHealth(),
        this.fileAnalysisQueue.checkHealth()
      ]);

      const monitoringHealth = await this.monitoring.healthCheck();

      const overallHealthy = reportHealth.status === 'healthy' &&
                            fileHealth.status === 'healthy' &&
                            monitoringHealth.status === 'healthy';

      return {
        status: overallHealthy ? 'healthy' : 'warning',
        queues: {
          reportGeneration: reportHealth.status || 'unknown',
          fileAnalysis: fileHealth.status || 'unknown'
        },
        monitoring: monitoringHealth
      };
    } catch (error) {
      console.error('队列健康检查失败:', error);
      return {
        status: 'critical',
        queues: {
          reportGeneration: 'critical',
          fileAnalysis: 'critical'
        },
        monitoring: { status: 'critical' }
      };
    }
  }
}