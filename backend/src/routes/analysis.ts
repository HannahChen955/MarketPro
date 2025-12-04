import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportAnalysisService } from '../services/reportAnalysisService';
import { Readable } from 'stream';

const analysisService = new ReportAnalysisService();

// Types for route parameters and bodies
interface AnalyzeFileBody {
  file: any; // Multipart file
}

interface AnalysisParams {
  analysisId: string;
}

// Routes configuration
export const analysisRoutes = [
  // POST /api/analysis/upload - 上传文件进行分析
  {
    method: 'POST' as const,
    url: '/api/analysis/upload',
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                analysisId: { type: 'string' },
                fileName: { type: 'string' },
                reportTypeId: { type: 'string' },
                designSystemId: { type: 'string' },
                analysis: { type: 'object' },
                designSystem: { type: 'object' },
                template: { type: 'object' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        // 获取上传的文件
        const data = await request.file();
        if (!data) {
          return reply.status(400).send({
            success: false,
            error: 'No file uploaded'
          });
        }

        const { filename, mimetype } = data;

        // 验证文件类型
        if (!mimetype.includes('pdf') && !mimetype.includes('presentation') && !mimetype.includes('powerpoint')) {
          return reply.status(400).send({
            success: false,
            error: 'Only PDF and PowerPoint files are supported'
          });
        }

        // 读取文件内容到Buffer
        const fileBuffer = await streamToBuffer(data.file);

        // 检查文件大小 (最大 50MB)
        if (fileBuffer.length > 50 * 1024 * 1024) {
          return reply.status(400).send({
            success: false,
            error: 'File too large. Maximum size is 50MB'
          });
        }

        console.log(`📄 开始分析文件: ${filename}, 类型: ${mimetype}, 大小: ${fileBuffer.length} bytes`);

        // 分析文档并生成配置
        const result = await analysisService.analyzeDocumentAndGenerateConfig(
          fileBuffer,
          filename || 'uploaded_file',
          mimetype,
          userId
        );

        // 保存分析结果到数据库
        const savedResult = await analysisService.saveAnalysisResult(
          userId,
          filename || 'uploaded_file',
          result.analysis,
          result.designSystem,
          result.template
        );

        console.log(`✅ 文件分析完成: ${filename}`);

        reply.send({
          success: true,
          data: {
            analysisId: savedResult.reportTypeId,
            fileName: filename,
            reportTypeId: savedResult.reportTypeId,
            designSystemId: savedResult.designSystemId,
            analysis: result.analysis,
            designSystem: result.designSystem,
            template: result.template
          }
        });

      } catch (error) {
        console.error('File analysis failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'File analysis failed'
        });
      }
    }
  },

  // GET /api/analysis/health - 分析服务健康检查
  {
    method: 'GET' as const,
    url: '/api/analysis/health',
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
                    parsing: { type: 'boolean' },
                    aiAnalysis: { type: 'boolean' },
                    database: { type: 'boolean' }
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
        const health = await analysisService.healthCheck();

        reply.send({
          success: true,
          data: health
        });

      } catch (error) {
        console.error('Analysis service health check failed:', error);
        reply.status(500).send({
          success: false,
          error: 'Health check failed'
        });
      }
    }
  },

  // POST /api/analysis/demo - 演示分析功能（使用预设内容）
  {
    method: 'POST' as const,
    url: '/api/analysis/demo',
    schema: {
      body: {
        type: 'object',
        properties: {
          reportType: {
            type: 'string',
            enum: ['market_analysis', 'competitor_analysis', 'marketing_plan', 'sales_tracking'],
            default: 'market_analysis'
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
                analysis: { type: 'object' },
                designSystem: { type: 'object' },
                template: { type: 'object' }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{
      Body: {
        reportType?: 'market_analysis' | 'competitor_analysis' | 'marketing_plan' | 'sales_tracking';
      }
    }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const { reportType = 'market_analysis' } = request.body;

        // 创建演示用的文档内容
        const demoContent = generateDemoContent(reportType);
        const demoBuffer = Buffer.from(demoContent, 'utf8');
        const fileName = `demo_${reportType}_report.txt`;

        console.log(`🎯 生成演示分析: ${reportType}`);

        // 分析演示文档
        const result = await analysisService.analyzeDocumentAndGenerateConfig(
          demoBuffer,
          fileName,
          'text/plain',
          userId
        );

        console.log(`✅ 演示分析完成: ${reportType}`);

        reply.send({
          success: true,
          data: {
            analysis: result.analysis,
            designSystem: result.designSystem,
            template: result.template
          }
        });

      } catch (error) {
        console.error('Demo analysis failed:', error);
        reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Demo analysis failed'
        });
      }
    }
  },

  // GET /api/analysis/templates - 获取生成的模板列表
  {
    method: 'GET' as const,
    url: '/api/analysis/templates',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  configuration: { type: 'object' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.status(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        // 从数据库获取用户创建的模板
        const prisma = (request.server as any).prisma;

        const templates = await prisma.reportType.findMany({
          where: {
            createdBy: userId,
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            status: true,
            configuration: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        reply.send({
          success: true,
          data: templates
        });

      } catch (error) {
        console.error('Failed to fetch templates:', error);
        reply.status(500).send({
          success: false,
          error: 'Failed to fetch templates'
        });
      }
    }
  }
];

// Helper function to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: any[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Helper function to generate demo content
function generateDemoContent(reportType: string): string {
  const contentMap = {
    market_analysis: `
# 房地产市场分析报告

## 执行摘要
本报告分析了2024年第一季度的房地产市场表现，重点关注一二线城市的发展趋势。

## 市场概况
### 整体表现
- 新房销售量同比增长15%
- 平均价格上涨8%
- 库存周期缩短至6个月

### 区域分析
#### 一线城市
一线城市继续保持稳定增长态势，北京、上海、深圳表现强劲。

#### 二线城市
二线城市成为新的增长点，杭州、南京、苏州领涨。

## 市场趋势
1. 政策支持力度加大
2. 购买需求旺盛
3. 供给结构优化
4. 投资热度提升

## 风险分析
- 政策调控风险
- 市场波动风险
- 流动性风险

## 投资建议
基于以上分析，建议在一二线核心区域重点布局。
`,

    competitor_analysis: `
# 竞品分析报告

## 项目概述
本报告对标杆项目进行深度竞品分析。

## 主要竞争对手
### 1. 万科·翡翠系列
- 位置：核心地段
- 价格：50,000-80,000元/㎡
- 产品：高端住宅
- 优势：品牌力强，产品品质高

### 2. 恒大·御景系列
- 位置：新兴区域
- 价格：35,000-55,000元/㎡
- 产品：大体量社区
- 优势：配套完善，性价比高

### 3. 碧桂园·森林城市
- 位置：远郊区域
- 价格：25,000-40,000元/㎡
- 产品：生态住宅
- 优势：环境优美，户型丰富

## 竞争力对比
1. 产品力对比
2. 价格策略对比
3. 营销策略对比
4. 服务水平对比

## 差异化策略
建议在设计、服务、营销等方面形成差异化竞争优势。
`,

    marketing_plan: `
# 项目营销方案

## 项目背景
针对高端住宅项目制定的全面营销策略。

## 目标客群分析
### 主力客群
- 年龄：30-45岁
- 收入：年收入100万以上
- 职业：企业高管、专业人士
- 需求：品质居住、投资保值

### 潜在客群
- 年轻高收入群体
- 改善型购房者
- 投资客户

## 营销策略
### 1. 品牌定位
高端品质生活的引领者

### 2. 产品策略
- 精装修标准
- 智能家居配置
- 高端物业服务

### 3. 价格策略
- 稳中有升的定价策略
- 灵活的付款方式
- 限时优惠政策

### 4. 推广策略
- 数字化营销
- 高端媒体投放
- KOL合作推广
- 线下活动营销

## 实施计划
第一阶段：品牌预热（2个月）
第二阶段：正式开盘（3个月）
第三阶段：销售冲刺（4个月）

## 预期效果
预计6个月内销售去化率达到80%以上。
`,

    sales_tracking: `
# 销售进度跟踪报告

## 项目概况
项目：xx住宅
总货值：50亿元
总套数：1000套

## 销售进度
### 本月销售情况
- 成交套数：85套
- 成交金额：4.2亿元
- 成交均价：49,500元/㎡
- 去化率：8.5%

### 累计销售情况
- 累计成交：320套
- 累计金额：15.8亿元
- 累计去化率：32%

## 客户来访分析
### 来访数据
- 本月来访：450组
- 有效来访：360组
- 成交转化率：23.6%

### 客户构成
- 首次置业：30%
- 改善换房：50%
- 投资需求：20%

## 销售团队表现
### 个人业绩排行
1. 张销售：12套
2. 李顾问：10套
3. 王经理：8套

### 团队KPI达成
- 目标完成率：106%
- 平均成交周期：15天
- 客户满意度：4.7/5

## 市场反馈
客户普遍认为产品品质高，但价格偏高。

## 改进建议
1. 优化价格策略
2. 加强营销推广
3. 提升服务质量
4. 完善客户跟进
`
  };

  return contentMap[reportType] || contentMap.market_analysis;
}

// 导出路由注册函数
export async function registerAnalysisRoutes(fastify: any) {
  for (const route of analysisRoutes) {
    fastify.route(route);
  }
}