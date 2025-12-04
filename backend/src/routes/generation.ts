import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportGenerationService, ReportGenerationRequest } from '../services/reportGenerationService';
import { TaskQueueService } from '../services/taskQueueService';

const generationService = new ReportGenerationService();

// Types for route parameters and bodies
interface GenerateReportBody {
  templateId: string;
  designSystemId?: string;
  projectData: {
    projectName: string;
    description?: string;
    analysisArea?: string;
    timeRange?: string;
    targetAudience?: string;
    additionalInputs: Record<string, any>;
  };
  outputOptions: {
    format: 'pptx' | 'pdf' | 'html' | 'all';
    includeCharts: boolean;
    includeTables: boolean;
    includeImages: boolean;
    customSections?: string[];
  };
  aiOptions: {
    useAdvancedAnalysis: boolean;
    includeRecommendations: boolean;
    generateCharts: boolean;
    customPrompts?: Record<string, string>;
  };
}

interface GenerationParams {
  taskId: string;
}

interface QuickGenerateBody {
  reportType: 'market_analysis' | 'competitor_analysis' | 'marketing_plan' | 'sales_tracking';
  projectName: string;
  analysisArea?: string;
  timeRange?: string;
  outputFormat?: 'pptx' | 'pdf' | 'html';
}

// Routes configuration
export const generationRoutes = [
  // POST /api/generation/create - 创建报告生成任务
  {
    method: 'POST' as const,
    url: '/api/generation/create',
    schema: {
      body: {
        type: 'object',
        required: ['templateId', 'projectData', 'outputOptions', 'aiOptions'],
        properties: {
          templateId: { type: 'string' },
          designSystemId: { type: 'string' },
          projectData: {
            type: 'object',
            required: ['projectName', 'additionalInputs'],
            properties: {
              projectName: { type: 'string', minLength: 1, maxLength: 100 },
              description: { type: 'string', maxLength: 500 },
              analysisArea: { type: 'string', maxLength: 100 },
              timeRange: { type: 'string' },
              targetAudience: { type: 'string', maxLength: 200 },
              additionalInputs: { type: 'object' }
            }
          },
          outputOptions: {
            type: 'object',
            required: ['format', 'includeCharts', 'includeTables', 'includeImages'],
            properties: {
              format: { type: 'string', enum: ['pptx', 'pdf', 'html', 'all'] },
              includeCharts: { type: 'boolean' },
              includeTables: { type: 'boolean' },
              includeImages: { type: 'boolean' },
              customSections: { type: 'array', items: { type: 'string' } }
            }
          },
          aiOptions: {
            type: 'object',
            required: ['useAdvancedAnalysis', 'includeRecommendations', 'generateCharts'],
            properties: {
              useAdvancedAnalysis: { type: 'boolean' },
              includeRecommendations: { type: 'boolean' },
              generateCharts: { type: 'boolean' },
              customPrompts: { type: 'object' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                status: { type: 'string' },
                estimatedTime: { type: 'number' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: GenerateReportBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const generationRequest = request.body;

        console.log(`📊 收到报告生成请求: ${generationRequest.projectData.projectName}`);

        // 创建生成任务
        const taskQueue = (request.server as any).taskQueue as TaskQueueService;

        const task = await taskQueue.addTask({
          type: 'report_generation',
          data: {
            ...generationRequest,
            userId
          },
          userId,
          metadata: {
            projectName: generationRequest.projectData.projectName,
            templateId: generationRequest.templateId,
            format: generationRequest.outputOptions.format
          }
        });

        console.log(`✅ 报告生成任务已创建: ${task.id}`);

        reply.send({
          success: true,
          data: {
            taskId: task.id,
            status: 'pending',
            estimatedTime: 15, // 默认预估15分钟
            message: '报告生成任务已创建，正在处理中...'
          }
        });

      } catch (error) {
        console.error('Failed to create report generation task:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create generation task'
        });
      }
    }
  },

  // POST /api/generation/quick - 快速生成报告（使用预设模板）
  {
    method: 'POST' as const,
    url: '/api/generation/quick',
    schema: {
      body: {
        type: 'object',
        required: ['reportType', 'projectName'],
        properties: {
          reportType: {
            type: 'string',
            enum: ['market_analysis', 'competitor_analysis', 'marketing_plan', 'sales_tracking']
          },
          projectName: { type: 'string', minLength: 1, maxLength: 100 },
          analysisArea: { type: 'string', maxLength: 100 },
          timeRange: { type: 'string' },
          outputFormat: { type: 'string', enum: ['pptx', 'pdf', 'html'], default: 'pptx' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                status: { type: 'string' },
                estimatedTime: { type: 'number' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: QuickGenerateBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { reportType, projectName, analysisArea, timeRange, outputFormat = 'pptx' } = request.body;

        console.log(`⚡ 快速报告生成: ${reportType} - ${projectName}`);

        // 构建标准化的生成请求
        const generationRequest: GenerateReportBody = {
          templateId: getTemplateIdByType(reportType),
          projectData: {
            projectName,
            description: `快速生成的${getReportTypeDisplayName(reportType)}`,
            analysisArea,
            timeRange,
            additionalInputs: {
              quickGeneration: true,
              reportType
            }
          },
          outputOptions: {
            format: outputFormat,
            includeCharts: true,
            includeTables: true,
            includeImages: false
          },
          aiOptions: {
            useAdvancedAnalysis: false, // 快速生成使用基础分析
            includeRecommendations: true,
            generateCharts: true
          }
        };

        // 创建生成任务
        const taskQueue = (request.server as any).taskQueue as TaskQueueService;

        const task = await taskQueue.addTask({
          type: 'report_generation',
          data: {
            ...generationRequest,
            userId
          },
          userId,
          metadata: {
            projectName,
            templateId: generationRequest.templateId,
            format: outputFormat,
            quickGeneration: true
          }
        });

        console.log(`✅ 快速报告生成任务已创建: ${task.id}`);

        reply.send({
          success: true,
          data: {
            taskId: task.id,
            status: 'pending',
            estimatedTime: getEstimatedTimeByType(reportType),
            message: `正在生成${getReportTypeDisplayName(reportType)}，请稍候...`
          }
        });

      } catch (error) {
        console.error('Failed to create quick report generation:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create quick generation'
        });
      }
    }
  },

  // GET /api/generation/status/:taskId - 获取生成任务状态
  {
    method: 'GET' as const,
    url: '/api/generation/status/:taskId',
    schema: {
      params: {
        type: 'object',
        required: ['taskId'],
        properties: {
          taskId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                status: { type: 'string' },
                progress: { type: 'number' },
                stage: { type: 'string' },
                message: { type: 'string' },
                result: { type: 'object' },
                error: { type: 'string' },
                startedAt: { type: 'string' },
                completedAt: { type: 'string' },
                estimatedTimeRemaining: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Params: GenerationParams }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { taskId } = request.params;

        // 获取任务状态
        const prisma = (request.server as any).prisma;

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            heartbeats: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });

        if (!task) {
          return reply.status(404).send({
            success: false,
            error: 'Task not found'
          });
        }

        // 检查任务是否属于当前用户
        if (task.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: 'Access denied'
          });
        }

        const latestHeartbeat = task.heartbeats[0];
        const estimatedTimeRemaining = calculateEstimatedTimeRemaining(task);

        reply.send({
          success: true,
          data: {
            taskId: task.id,
            status: task.status,
            progress: task.progress,
            stage: task.stage,
            message: task.message || latestHeartbeat?.message || '处理中...',
            result: task.resultData ? JSON.parse(task.resultData as string) : null,
            error: task.errorMessage,
            startedAt: task.startedAt?.toISOString(),
            completedAt: task.completedAt?.toISOString(),
            estimatedTimeRemaining
          }
        });

      } catch (error) {
        console.error('Failed to get task status:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to get task status'
        });
      }
    }
  },

  // GET /api/generation/download/:taskId - 下载生成的报告文件
  {
    method: 'GET' as const,
    url: '/api/generation/download/:taskId',
    schema: {
      params: {
        type: 'object',
        required: ['taskId'],
        properties: {
          taskId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['pptx', 'pdf', 'html'] }
        }
      }
    },
    handler: async (request: FastifyRequest<{
      Params: GenerationParams;
      Querystring: { format?: string };
    }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { taskId } = request.params;
        const { format = 'pptx' } = request.query;

        // 获取任务信息
        const prisma = (request.server as any).prisma;

        const task = await prisma.task.findUnique({
          where: { id: taskId }
        });

        if (!task) {
          return reply.status(404).send({
            success: false,
            error: 'Task not found'
          });
        }

        // 检查任务是否属于当前用户
        if (task.userId !== userId) {
          return reply.status(403).send({
            success: false,
            error: 'Access denied'
          });
        }

        // 检查任务是否已完成
        if (task.status !== 'completed') {
          return reply.status(400).send({
            success: false,
            error: 'Task not completed yet'
          });
        }

        // 获取文件路径
        const result = task.resultData ? JSON.parse(task.resultData as string) : null;
        if (!result || !result.filePaths || !result.filePaths[format]) {
          return reply.status(404).send({
            success: false,
            error: `File not found for format: ${format}`
          });
        }

        const filePath = result.filePaths[format];

        // 检查文件是否存在
        const fs = require('fs').promises;
        try {
          await fs.access(filePath);
        } catch {
          return reply.status(404).send({
            success: false,
            error: 'File not found on server'
          });
        }

        // 设置响应头
        const fileName = `${task.inputData?.projectData?.projectName || 'report'}_${Date.now()}.${format}`;
        const contentTypes: Record<string, string> = {
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          pdf: 'application/pdf',
          html: 'text/html'
        };

        reply.header('Content-Type', contentTypes[format] || 'application/octet-stream');
        reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

        // 发送文件
        const fileStream = require('fs').createReadStream(filePath);
        reply.send(fileStream);

      } catch (error) {
        console.error('Failed to download file:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to download file'
        });
      }
    }
  },

  // DELETE /api/generation/cancel/:taskId - 取消生成任务
  {
    method: 'DELETE' as const,
    url: '/api/generation/cancel/:taskId',
    schema: {
      params: {
        type: 'object',
        required: ['taskId'],
        properties: {
          taskId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Params: GenerationParams }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { taskId } = request.params;

        // 取消任务
        const taskQueue = (request.server as any).taskQueue as TaskQueueService;

        await taskQueue.cancelTask(taskId, userId);

        console.log(`🚫 任务已取消: ${taskId}`);

        reply.send({
          success: true,
          message: 'Task cancelled successfully'
        });

      } catch (error) {
        console.error('Failed to cancel task:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel task'
        });
      }
    }
  },

  // GET /api/generation/health - 生成服务健康检查
  {
    method: 'GET' as const,
    url: '/api/generation/health',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                services: {
                  type: 'object',
                  properties: {
                    aiService: { type: 'boolean' },
                    fileSystem: { type: 'boolean' },
                    templates: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const health = await generationService.healthCheck();

        reply.send({
          success: true,
          data: health
        });

      } catch (error) {
        console.error('Generation service health check failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Health check failed'
        });
      }
    }
  }
];

// Helper functions
function getTemplateIdByType(reportType: string): string {
  const templateMap: Record<string, string> = {
    'market_analysis': 'template_market_analysis',
    'competitor_analysis': 'template_competitor_analysis',
    'marketing_plan': 'template_marketing_plan',
    'sales_tracking': 'template_sales_tracking'
  };

  return templateMap[reportType] || 'template_market_analysis';
}

function getReportTypeDisplayName(reportType: string): string {
  const displayNames: Record<string, string> = {
    'market_analysis': '市场分析报告',
    'competitor_analysis': '竞品分析报告',
    'marketing_plan': '项目营销方案',
    'sales_tracking': '销售进度跟踪'
  };

  return displayNames[reportType] || '市场分析报告';
}

function getEstimatedTimeByType(reportType: string): number {
  const timeMap: Record<string, number> = {
    'market_analysis': 15,
    'competitor_analysis': 12,
    'marketing_plan': 18,
    'sales_tracking': 10
  };

  return timeMap[reportType] || 12;
}

function calculateEstimatedTimeRemaining(task: any): number {
  if (task.status === 'completed') return 0;
  if (task.status === 'failed') return 0;

  const progress = task.progress || 0;
  const estimatedTotal = task.estimatedDuration || 15 * 60; // 默认15分钟
  const elapsed = task.startedAt ?
    (Date.now() - new Date(task.startedAt).getTime()) / 1000 : 0;

  if (progress > 0) {
    const estimatedTotal = elapsed / (progress / 100);
    return Math.max(0, estimatedTotal - elapsed);
  }

  return estimatedTotal;
}

// 导出路由注册函数
export async function registerGenerationRoutes(fastify: any) {
  for (const route of generationRoutes) {
    fastify.route(route);
  }
}