import { FastifyRequest, FastifyReply } from 'fastify';
import { AIQualityService, QualityAssessment } from '../services/aiQualityService';

const qualityService = new AIQualityService();

// Types for route parameters and bodies
interface QualityCheckBody {
  content: string;
  context: {
    requestType: string;
    projectName: string;
    originalPrompt?: string;
    expectedSections?: string[];
  };
}

interface ContentImprovementBody {
  content: string;
  assessment?: QualityAssessment;
  context: {
    requestType: string;
    projectName: string;
    originalPrompt: string;
  };
  maxRetries?: number;
}

interface SafetyCheckBody {
  content: string;
  context: {
    projectName: string;
  };
}

interface ErrorRecoveryBody {
  error: {
    message: string;
    type?: string;
    stack?: string;
  };
  context: {
    operation: string;
    requestData: any;
    attempt: number;
  };
}

interface QualityReportParams {
  projectId: string;
}

interface QualityReportQuery {
  startDate?: string;
  endDate?: string;
}

// Routes configuration
export const qualityRoutes = [
  // POST /api/quality/assess - 评估内容质量
  {
    method: 'POST' as const,
    url: '/api/quality/assess',
    schema: {
      body: {
        type: 'object',
        required: ['content', 'context'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 50000 },
          context: {
            type: 'object',
            required: ['requestType', 'projectName'],
            properties: {
              requestType: { type: 'string' },
              projectName: { type: 'string' },
              originalPrompt: { type: 'string' },
              expectedSections: {
                type: 'array',
                items: { type: 'string' }
              }
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
                overallScore: { type: 'number' },
                dimensions: {
                  type: 'object',
                  properties: {
                    coherence: { type: 'number' },
                    relevance: { type: 'number' },
                    accuracy: { type: 'number' },
                    completeness: { type: 'number' },
                    clarity: { type: 'number' },
                    professionalism: { type: 'number' }
                  }
                },
                issues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      severity: { type: 'string' },
                      description: { type: 'string' },
                      suggestion: { type: 'string' }
                    }
                  }
                },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' }
                },
                confidence: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: QualityCheckBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { content, context } = request.body;

        console.log(`🔍 收到质量评估请求: ${context.projectName}`);

        const assessment = await qualityService.assessQuality(content, {
          ...context,
          userId
        });

        reply.send({
          success: true,
          data: assessment
        });

      } catch (error) {
        console.error('Content quality assessment failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Quality assessment failed'
        });
      }
    }
  },

  // POST /api/quality/improve - 改进内容质量
  {
    method: 'POST' as const,
    url: '/api/quality/improve',
    schema: {
      body: {
        type: 'object',
        required: ['content', 'context'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 50000 },
          assessment: { type: 'object' },
          context: {
            type: 'object',
            required: ['requestType', 'projectName', 'originalPrompt'],
            properties: {
              requestType: { type: 'string' },
              projectName: { type: 'string' },
              originalPrompt: { type: 'string' }
            }
          },
          maxRetries: { type: 'number', minimum: 1, maximum: 5, default: 2 }
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
                improvedContent: { type: 'string' },
                improvements: {
                  type: 'array',
                  items: { type: 'string' }
                },
                finalAssessment: { type: 'object' },
                iterations: { type: 'number' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: ContentImprovementBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { content, assessment, context, maxRetries = 2 } = request.body;

        console.log(`🔧 收到内容改进请求: ${context.projectName}`);

        // 如果没有提供评估结果，先进行评估
        let currentAssessment = assessment;
        if (!currentAssessment) {
          currentAssessment = await qualityService.assessQuality(content, {
            ...context,
            userId
          });
        }

        const result = await qualityService.improveContent(
          content,
          currentAssessment,
          { ...context, userId },
          maxRetries
        );

        reply.send({
          success: true,
          data: result
        });

      } catch (error) {
        console.error('Content improvement failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Content improvement failed'
        });
      }
    }
  },

  // POST /api/quality/safety-check - 内容安全检查
  {
    method: 'POST' as const,
    url: '/api/quality/safety-check',
    schema: {
      body: {
        type: 'object',
        required: ['content', 'context'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 50000 },
          context: {
            type: 'object',
            required: ['projectName'],
            properties: {
              projectName: { type: 'string' }
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
                isSafe: { type: 'boolean' },
                riskLevel: { type: 'string' },
                issues: {
                  type: 'array',
                  items: { type: 'string' }
                },
                filteredContent: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: SafetyCheckBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { content, context } = request.body;

        console.log(`🛡️ 收到安全检查请求: ${context.projectName}`);

        const safetyResult = await qualityService.checkContentSafety(content, {
          ...context,
          userId
        });

        reply.send({
          success: true,
          data: safetyResult
        });

      } catch (error) {
        console.error('Content safety check failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Safety check failed'
        });
      }
    }
  },

  // POST /api/quality/recover - 错误恢复处理
  {
    method: 'POST' as const,
    url: '/api/quality/recover',
    schema: {
      body: {
        type: 'object',
        required: ['error', 'context'],
        properties: {
          error: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' },
              type: { type: 'string' },
              stack: { type: 'string' }
            }
          },
          context: {
            type: 'object',
            required: ['operation', 'requestData', 'attempt'],
            properties: {
              operation: { type: 'string' },
              requestData: { type: 'object' },
              attempt: { type: 'number', minimum: 1 }
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
                recovered: { type: 'boolean' },
                result: { type: 'object' },
                strategy: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: ErrorRecoveryBody }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { error, context } = request.body;

        console.log(`🚨 收到错误恢复请求: ${context.operation}`);

        const recoveryResult = await qualityService.handleError(error, {
          ...context,
          userId
        });

        reply.send({
          success: true,
          data: recoveryResult
        });

      } catch (recoveryError) {
        console.error('Error recovery failed:', recoveryError);
        reply.status(500).send({
          success: false,
          error: recoveryError instanceof Error ? recoveryError.message : 'Error recovery failed'
        });
      }
    }
  },

  // GET /api/quality/report/:projectId - 获取质量报告
  {
    method: 'GET' as const,
    url: '/api/quality/report/:projectId',
    schema: {
      params: {
        type: 'object',
        required: ['projectId'],
        properties: {
          projectId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
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
                summary: {
                  type: 'object',
                  properties: {
                    totalAssessments: { type: 'number' },
                    averageScore: { type: 'number' },
                    improvementRate: { type: 'number' },
                    commonIssues: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          count: { type: 'number' }
                        }
                      }
                    }
                  }
                },
                trends: {
                  type: 'object',
                  properties: {
                    scoresByDay: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          date: { type: 'string' },
                          score: { type: 'number' }
                        }
                      }
                    },
                    issuesByCategory: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          category: { type: 'string' },
                          count: { type: 'number' }
                        }
                      }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{
      Params: QualityReportParams;
      Querystring: QualityReportQuery;
    }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { projectId } = request.params;
        const { startDate, endDate } = request.query;

        // 设置时间范围
        const timeRange = {
          start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date()
        };

        console.log(`📊 生成质量报告: ${projectId}`);

        const report = await qualityService.generateQualityReport(projectId, timeRange);

        reply.send({
          success: true,
          data: report
        });

      } catch (error) {
        console.error('Quality report generation failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Quality report generation failed'
        });
      }
    }
  },

  // GET /api/quality/health - 质量服务健康检查
  {
    method: 'GET' as const,
    url: '/api/quality/health',
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
                components: {
                  type: 'object',
                  properties: {
                    validation: { type: 'boolean' },
                    aiService: { type: 'boolean' },
                    recovery: { type: 'boolean' }
                  }
                },
                metrics: {
                  type: 'object',
                  properties: {
                    rulesCount: { type: 'number' },
                    strategiesCount: { type: 'number' },
                    avgProcessingTime: { type: 'number' }
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
        const health = await qualityService.healthCheck();

        reply.send({
          success: true,
          data: health
        });

      } catch (error) {
        console.error('Quality service health check failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Health check failed'
        });
      }
    }
  },

  // POST /api/quality/batch-assess - 批量质量评估
  {
    method: 'POST' as const,
    url: '/api/quality/batch-assess',
    schema: {
      body: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            maxItems: 10,
            items: {
              type: 'object',
              required: ['id', 'content', 'context'],
              properties: {
                id: { type: 'string' },
                content: { type: 'string', maxLength: 10000 },
                context: {
                  type: 'object',
                  required: ['requestType', 'projectName'],
                  properties: {
                    requestType: { type: 'string' },
                    projectName: { type: 'string' }
                  }
                }
              }
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
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      assessment: { type: 'object' },
                      error: { type: 'string' }
                    }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    successful: { type: 'number' },
                    failed: { type: 'number' },
                    averageScore: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{
      Body: {
        items: Array<{
          id: string;
          content: string;
          context: {
            requestType: string;
            projectName: string;
          };
        }>;
      };
    }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { items } = request.body;

        console.log(`📋 收到批量质量评估请求: ${items.length} 项内容`);

        const results = [];
        const scores = [];

        for (const item of items) {
          try {
            const assessment = await qualityService.assessQuality(item.content, {
              ...item.context,
              userId
            });

            results.push({
              id: item.id,
              assessment,
              error: null
            });

            scores.push(assessment.overallScore);

          } catch (error) {
            results.push({
              id: item.id,
              assessment: null,
              error: error instanceof Error ? error.message : 'Assessment failed'
            });
          }
        }

        const summary = {
          total: items.length,
          successful: results.filter(r => !r.error).length,
          failed: results.filter(r => r.error).length,
          averageScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
        };

        console.log(`✅ 批量质量评估完成: ${summary.successful}/${summary.total} 成功`);

        reply.send({
          success: true,
          data: {
            results,
            summary
          }
        });

      } catch (error) {
        console.error('Batch quality assessment failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Batch assessment failed'
        });
      }
    }
  }
];

// 导出路由注册函数
export async function registerQualityRoutes(fastify: any) {
  for (const route of qualityRoutes) {
    fastify.route(route);
  }
}