import { FastifyRequest, FastifyReply } from 'fastify';
import { AIService, AIRequest, AIResponse } from '../services/aiService';
import { PrismaClient } from '@prisma/client';

const aiService = new AIService();
const prisma = new PrismaClient();

// Types for route parameters and bodies
interface AIGenerateBody {
  prompt: string;
  requestType?: 'generation' | 'analysis' | 'chat' | 'summary';
  maxTokens?: number;
  temperature?: number;
  projectId?: string;
  taskId?: string;
  context?: Record<string, any>;
}

interface UserParams {
  userId?: string;
}

interface StatsQuery {
  timeRange?: 'hour' | 'day' | 'month';
}

// Routes configuration
export const aiRoutes = [
  // POST /api/ai/generate - 生成 AI 响应
  {
    method: 'POST' as const,
    url: '/api/ai/generate',
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string', maxLength: 50000 },
          requestType: {
            type: 'string',
            enum: ['generation', 'analysis', 'chat', 'summary'],
            default: 'chat'
          },
          maxTokens: { type: 'number', minimum: 1, maximum: 8000 },
          temperature: { type: 'number', minimum: 0, maximum: 2 },
          projectId: { type: 'string' },
          taskId: { type: 'string' },
          context: { type: 'object' }
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
                content: { type: 'string' },
                usage: {
                  type: 'object',
                  properties: {
                    promptTokens: { type: 'number' },
                    completionTokens: { type: 'number' },
                    totalTokens: { type: 'number' }
                  }
                },
                model: { type: 'string' },
                provider: { type: 'string' },
                cached: { type: 'boolean' },
                filteredInput: { type: 'boolean' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: AIGenerateBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const {
          prompt,
          requestType = 'chat',
          maxTokens,
          temperature,
          projectId,
          taskId,
          context
        } = request.body;

        const aiRequest: AIRequest = {
          prompt,
          userId,
          requestType,
          maxTokens,
          temperature,
          projectId,
          taskId,
          context
        };

        const response = await aiService.generateResponse(aiRequest);

        reply.send({
          success: true,
          data: response
        });

      } catch (error) {
        console.error('AI generation failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'AI generation failed'
        });
      }
    }
  },

  // GET /api/ai/health - AI 服务健康检查
  {
    method: 'GET' as const,
    url: '/api/ai/health',
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
                providers: { type: 'object' },
                cacheSize: { type: 'number' },
                securityStatus: { type: 'object' },
                legacy: { type: 'object' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const health = await aiService.healthCheck();

        reply.send({
          success: true,
          data: health
        });

      } catch (error) {
        console.error('AI health check failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Health check failed'
        });
      }
    }
  },

  // GET /api/ai/stats - AI 使用统计
  {
    method: 'GET' as const,
    url: '/api/ai/stats',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['hour', 'day', 'month'],
            default: 'day'
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
                period: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                totalRequests: { type: 'number' },
                totalTokens: { type: 'number' },
                totalCost: { type: 'number' },
                cacheHitRate: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Querystring: StatsQuery }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { timeRange = 'day' } = request.query;
        const stats = await aiService.getUsageStats(userId, timeRange);

        reply.send({
          success: true,
          data: stats
        });

      } catch (error) {
        console.error('AI stats fetch failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to fetch stats'
        });
      }
    }
  },

  // GET /api/ai/stats/global - 全局 AI 使用统计 (管理员)
  {
    method: 'GET' as const,
    url: '/api/ai/stats/global',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['hour', 'day', 'month'],
            default: 'day'
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
                period: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                totalRequests: { type: 'number' },
                totalTokens: { type: 'number' },
                totalCost: { type: 'number' },
                cacheHitRate: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Querystring: StatsQuery }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        // Check if user is admin (简化检查)
        // 在真实环境中应该从数据库查询用户角色
        const userRole = request.user?.role;
        if (userRole !== 'admin') {
          return reply.status(403).send({
            success: false,
            error: 'Admin access required'
          });
        }

        const { timeRange = 'day' } = request.query;
        const stats = await aiService.getUsageStats(undefined, timeRange); // 全局统计

        reply.send({
          success: true,
          data: stats
        });

      } catch (error) {
        console.error('Global AI stats fetch failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to fetch global stats'
        });
      }
    }
  },

  // POST /api/ai/chat - AI 聊天接口
  {
    method: 'POST' as const,
    url: '/api/ai/chat',
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', maxLength: 5000 },
          context: { type: 'object' },
          projectId: { type: 'string' },
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
                message: { type: 'string' },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' }
                },
                usage: { type: 'object' },
                cached: { type: 'boolean' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{
      Body: {
        message: string;
        context?: Record<string, any>;
        projectId?: string;
        taskId?: string;
      }
    }>, reply: FastifyReply) => {
      try {
        // 开发环境下允许无认证访问，使用真实的演示用户
        let userId = request.user?.id;
        if (!userId) {
          if (process.env.NODE_ENV === 'development') {
            // 查询演示用户的真实ID
            const demoUser = await prisma.user.findUnique({
              where: { email: 'demo@marketpro.ai' }
            });
            if (demoUser) {
              userId = demoUser.id;
            } else {
              return reply.status(500).send({
                success: false,
                error: 'Demo user not found. Please run: npm run db:seed'
              });
            }
          } else {
            return reply.status(401).send({
              success: false,
              error: 'Authentication required'
            });
          }
        }

        const { message, context, projectId, taskId } = request.body;

        const aiRequest: AIRequest = {
          prompt: message,
          userId,
          requestType: 'chat',
          maxTokens: 1000,
          temperature: 0.7,
          projectId,
          taskId,
          context
        };

        const response = await aiService.generateResponse(aiRequest);

        // 简化的建议生成
        const suggestions = [
          '能告诉我更多关于这个项目的信息吗？',
          '这个区域的市场趋势如何？',
          '有什么营销建议吗？',
          '竞品情况怎么样？'
        ];

        reply.send({
          success: true,
          data: {
            message: response.content,
            suggestions: suggestions.slice(0, 3),
            usage: response.usage,
            cached: response.cached
          }
        });

      } catch (error) {
        console.error('AI chat failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Chat request failed'
        });
      }
    }
  }
];

// 导出路由注册函数
export async function registerAIRoutes(fastify: any) {
  for (const route of aiRoutes) {
    fastify.route(route);
  }
}