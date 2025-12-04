// AI报告生成核心服务
// 负责调用AI模型生成报告内容

import { Project } from '@/types/project';
import { ReportDefinition, Report, GenerationRequest, GenerationProgress, ReportSlide } from '@/types/report';

export interface AIReportOptions {
  model?: 'qwen-max' | 'qwen-plus' | 'gpt-4';
  language?: 'zh' | 'en';
  complexity?: 'simple' | 'standard' | 'detailed';
  customInstructions?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: {
    slides: ReportSlide[];
    metadata: {
      totalSlides: number;
      wordCount: number;
      keyFindings: string[];
      recommendations: string[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class AIReportService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * 生成竞品分析报告
   */
  async generateCompetitorAnalysisReport(
    project: Project,
    formData: Record<string, any>,
    options: AIReportOptions = {}
  ): Promise<AIGenerationResponse> {
    try {
      const prompt = this.buildCompetitorAnalysisPrompt(project, formData, options);
      return await this.callAIService(prompt, options);
    } catch (error) {
      console.error('竞品分析报告生成失败:', error);
      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: '报告生成失败，请重试',
          details: error
        }
      };
    }
  }

  /**
   * 生成整体营销方案报告
   */
  async generateMarketingStrategyReport(
    project: Project,
    formData: Record<string, any>,
    options: AIReportOptions = {}
  ): Promise<AIGenerationResponse> {
    try {
      const prompt = this.buildMarketingStrategyPrompt(project, formData, options);
      return await this.callAIService(prompt, options);
    } catch (error) {
      console.error('营销方案报告生成失败:', error);
      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: '报告生成失败，请重试',
          details: error
        }
      };
    }
  }

  /**
   * 构建竞品分析报告提示词
   */
  private buildCompetitorAnalysisPrompt(
    project: Project,
    formData: Record<string, any>,
    options: AIReportOptions
  ): string {
    const timeRange = formData.time_range || '6months';
    const analysisDimensions = formData.analysis_dimensions || ['product', 'pricing', 'marketing'];
    const detailLevel = formData.detail_level || 'standard';
    const reportPurpose = formData.report_purpose || 'decision';

    // 项目基础信息
    const projectInfo = {
      name: project.name,
      city: project.city,
      type: project.type,
      location: project.basicInfo?.location,
      scale: project.basicInfo?.scale,
      product: project.basicInfo?.product
    };

    // 竞品信息
    const competitorInfo = project.competitors?.map(comp => ({
      name: comp.name,
      location: comp.location,
      product: comp.product,
      sales: comp.sales,
      marketing: comp.marketing
    })) || [];

    const prompt = `
# 房地产项目竞品分析报告生成任务

## 项目背景
项目名称：${projectInfo.name}
所在城市：${projectInfo.city}
项目类型：${projectInfo.type}
分析时间范围：${timeRange === '3months' ? '最近3个月' : timeRange === '6months' ? '最近6个月' : '最近1年'}

## 项目基本信息
${JSON.stringify(projectInfo, null, 2)}

## 竞品项目信息
${JSON.stringify(competitorInfo, null, 2)}

## 分析要求
- 重点分析维度：${analysisDimensions.map(d => {
  const dimMap: Record<string, string> = {
    product: '产品配置对比',
    pricing: '价格策略分析',
    marketing: '营销策略研究',
    sales: '销售表现分析',
    location: '区位优势对比'
  };
  return dimMap[d] || d;
}).join('、')}
- 报告详细程度：${detailLevel === 'simple' ? '简版(15页)' : detailLevel === 'standard' ? '标准版(25页)' : '详细版(35页)'}
- 报告用途：${reportPurpose === 'decision' ? '内部决策参考' : reportPurpose === 'client' ? '客户沟通材料' : '上级汇报'}

## 特殊关注点
${formData.special_attention ? `特殊关注事项：${formData.special_attention}` : '无特殊关注事项'}

## 生成要求

请生成一份专业的房地产项目竞品分析报告，要求：

### 1. 报告结构
- 封面页：项目名称、分析时间、报告用途
- 目录页：清晰的章节结构
- 执行摘要：核心发现和关键建议(1-2页)
- 市场概况：区域市场基本情况
- 竞品对比分析：按照指定维度深度分析
- SWOT分析：竞争优势劣势分析
- 策略建议：基于分析结果的actionable建议
- 附录：数据详情和补充信息

### 2. 内容要求
- 数据驱动：基于提供的竞品数据进行量化分析
- 逻辑清晰：分析逻辑严密，结论有理有据
- 实用性强：提供具体可执行的策略建议
- 专业性：使用房地产行业专业术语和分析框架

### 3. 输出格式
请以JSON格式输出，包含slides数组，每个slide包含：
- slideNumber: 页码
- slideType: 页面类型（cover/agenda/section_header/content/chart/table/comparison/summary）
- title: 页面标题
- subtitle: 副标题（可选）
- content: 页面内容（根据类型包含不同结构的数据）

### 4. 分析框架
请使用以下专业分析框架：
- 产品力分析：户型设计、装修标准、配套设施、创新亮点
- 价格策略：定价逻辑、优惠政策、性价比分析、价格敏感度
- 营销策略：推广渠道、传播主题、活动策划、品牌定位
- 销售表现：去化率、客群分析、成交周期、复购率
- 区位分析：地段价值、交通便利度、商业配套、环境质量

现在请开始生成报告内容。
`;

    return prompt;
  }

  /**
   * 构建营销策略报告提示词
   */
  private buildMarketingStrategyPrompt(
    project: Project,
    formData: Record<string, any>,
    options: AIReportOptions
  ): string {
    const currentStage = formData.current_stage || 'planning';
    const budgetRange = formData.budget_range || '100_300w';
    const marketingPeriod = formData.marketing_period || '6months';
    const targetClearanceRate = formData.target_clearance_rate || 85;

    const projectInfo = {
      name: project.name,
      city: project.city,
      type: project.type,
      status: project.status,
      currentPhase: project.currentPhase,
      basicInfo: project.basicInfo,
      competitors: project.competitors?.slice(0, 3), // 取主要竞品
      targetAudience: project.targetAudience
    };

    const prompt = `
# 房地产项目整体营销方案生成任务

## 项目基本信息
${JSON.stringify(projectInfo, null, 2)}

## 营销目标和约束
- 项目当前状态：${currentStage}
- 营销预算范围：${budgetRange}
- 营销周期：${marketingPeriod}
- 目标去化率：${targetClearanceRate}%

## 生成要求

请生成一份完整的房地产项目营销方案，包含：

### 1. 项目分析
- 项目SWOT分析
- 竞争环境分析
- 目标客群画像分析

### 2. 营销策略
- 品牌定位策略
- 产品包装策略
- 价格策略
- 推广策略
- 销售策略

### 3. 执行计划
- 营销时间轴
- 预算分配计划
- 渠道组合策略
- 活动执行方案

### 4. 效果监控
- KPI指标设定
- 数据监控体系
- 调整优化机制

请以JSON格式输出slides结构，确保内容专业、实用、可执行。
`;

    return prompt;
  }

  /**
   * 调用AI服务生成报告
   */
  private async callAIService(prompt: string, options: AIReportOptions): Promise<AIGenerationResponse> {
    // 模拟AI调用 - 实际项目中应该调用真实的AI API
    if (process.env.NODE_ENV === 'development') {
      return this.mockAIResponse(prompt, options);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/ai/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: options.model || 'qwen-max',
          language: options.language || 'zh',
          complexity: options.complexity || 'standard'
        }),
      });

      if (!response.ok) {
        throw new Error(`AI服务调用失败: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        content: result.data
      };
    } catch (error) {
      console.error('AI服务调用错误:', error);
      return {
        success: false,
        error: {
          code: 'AI_SERVICE_ERROR',
          message: 'AI服务暂时不可用，请稍后重试',
          details: error
        }
      };
    }
  }

  /**
   * 模拟AI响应（开发环境）
   */
  private async mockAIResponse(prompt: string, options: AIReportOptions): Promise<AIGenerationResponse> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (prompt.includes('竞品分析报告')) {
      return this.getMockCompetitorAnalysisResponse(options);
    } else if (prompt.includes('营销方案')) {
      return this.getMockMarketingStrategyResponse(options);
    }

    return {
      success: false,
      error: {
        code: 'UNSUPPORTED_REPORT_TYPE',
        message: '不支持的报告类型'
      }
    };
  }

  /**
   * 模拟竞品分析报告响应
   */
  private getMockCompetitorAnalysisResponse(options: AIReportOptions): AIGenerationResponse {
    const slides: ReportSlide[] = [
      {
        slideNumber: 1,
        slideType: 'cover',
        title: '竞品分析报告',
        subtitle: '深度对比分析主要竞品项目',
        content: {
          type: 'text',
          paragraphs: [
            '本报告通过多维度分析主要竞品项目',
            '为项目定位和营销策略提供数据支撑',
            `生成时间：${new Date().toLocaleDateString()}`
          ]
        }
      },
      {
        slideNumber: 2,
        slideType: 'agenda',
        title: '目录',
        content: {
          type: 'list',
          listType: 'numbered',
          items: [
            { text: '执行摘要', highlight: true },
            { text: '市场概况分析' },
            { text: '竞品产品力对比' },
            { text: '价格策略分析' },
            { text: '营销策略研究' },
            { text: 'SWOT对比分析' },
            { text: '策略建议' }
          ]
        }
      },
      {
        slideNumber: 3,
        slideType: 'section_header',
        title: '执行摘要',
        subtitle: 'Executive Summary',
        content: {
          type: 'text',
          paragraphs: [
            '核心发现与关键建议'
          ]
        }
      },
      {
        slideNumber: 4,
        slideType: 'content',
        title: '核心发现',
        content: {
          type: 'list',
          listType: 'bullet',
          items: [
            {
              text: '市场供应量适中，竞争激烈但有差异化空间',
              highlight: true
            },
            {
              text: '主要竞品在产品配置上各有特色，价格区间基本重叠'
            },
            {
              text: '营销策略趋向同质化，创新营销手段存在机会'
            },
            {
              text: '客户对品质和服务的要求不断提升'
            }
          ]
        }
      },
      {
        slideNumber: 5,
        slideType: 'chart',
        title: '竞品价格对比分析',
        content: {
          type: 'chart',
          chartType: 'bar',
          title: '主要竞品均价对比',
          data: {
            labels: ['项目A', '项目B', '项目C', '项目D', '本项目'],
            datasets: [{
              label: '均价(万元/平)',
              data: [4.2, 4.5, 3.8, 4.1, 4.0],
              backgroundColor: '#3B82F6'
            }]
          }
        }
      },
      {
        slideNumber: 6,
        slideType: 'table',
        title: '竞品产品力对比',
        content: {
          type: 'table',
          title: '主要竞品产品配置对比',
          headers: ['项目名称', '户型面积', '装修标准', '主要亮点', '价格区间'],
          rows: [
            ['项目A', '88-120㎡', '精装修', '南北通透，双卧朝南', '370-510万'],
            ['项目B', '90-140㎡', '豪装', '智能家居，进口厨电', '400-630万'],
            ['项目C', '85-110㎡', '简装', '地铁口，配套成熟', '320-420万'],
            ['本项目', '90-130㎡', '精装修', '待定产品亮点', '预估360-520万']
          ],
          highlightRows: [3]
        }
      },
      {
        slideNumber: 7,
        slideType: 'comparison',
        title: 'SWOT分析',
        content: {
          type: 'comparison',
          comparisonType: 'grid',
          items: [
            {
              title: '优势 (Strengths)',
              content: [
                '地理位置优越',
                '开发商品牌知名度高',
                '产品设计具有创新性',
                '价格具有竞争力'
              ],
              color: '#10B981'
            },
            {
              title: '劣势 (Weaknesses)',
              content: [
                '品牌影响力待提升',
                '周边配套尚在完善',
                '营销资源投入有限'
              ],
              color: '#EF4444'
            },
            {
              title: '机会 (Opportunities)',
              content: [
                '区域发展潜力巨大',
                '目标客群购买力强',
                '政策环境积极',
                '市场空白点明确'
              ],
              color: '#3B82F6'
            },
            {
              title: '威胁 (Threats)',
              content: [
                '竞品项目较多',
                '市场调控政策影响',
                '获客成本不断上升'
              ],
              color: '#F59E0B'
            }
          ]
        }
      },
      {
        slideNumber: 8,
        slideType: 'content',
        title: '核心策略建议',
        content: {
          type: 'list',
          listType: 'numbered',
          items: [
            {
              text: '产品差异化定位',
              subItems: [
                '突出户型设计优势，强调空间利用率',
                '在装修标准上寻求品质与成本的平衡点',
                '增加智能化配置，迎合年轻客群需求'
              ],
              highlight: true
            },
            {
              text: '价格策略优化',
              subItems: [
                '采用"高开低走"的价格策略',
                '通过优惠政策提升性价比认知',
                '建立分层定价体系，满足不同需求'
              ]
            },
            {
              text: '营销创新突破',
              subItems: [
                '打造特色IP活动，建立品牌记忆点',
                '加强数字化营销，提升获客效率',
                '建立客户全生命周期管理体系'
              ]
            }
          ]
        }
      }
    ];

    return {
      success: true,
      content: {
        slides,
        metadata: {
          totalSlides: slides.length,
          wordCount: 2500,
          keyFindings: [
            '市场竞争激烈但存在差异化机会',
            '价格策略需要更加精细化',
            '营销创新是突围关键'
          ],
          recommendations: [
            '强化产品差异化定位',
            '优化价格策略组合',
            '创新营销手段和渠道'
          ]
        }
      }
    };
  }

  /**
   * 模拟营销策略报告响应
   */
  private getMockMarketingStrategyResponse(options: AIReportOptions): AIGenerationResponse {
    // 营销策略报告的模拟数据
    const slides: ReportSlide[] = [
      {
        slideNumber: 1,
        slideType: 'cover',
        title: '项目整体营销方案',
        subtitle: '全方位营销策略与执行计划',
        content: {
          type: 'text',
          paragraphs: [
            '基于项目特色和市场环境',
            '制定完整的营销策略体系',
            `方案制定时间：${new Date().toLocaleDateString()}`
          ]
        }
      },
      // 更多营销策略页面...
    ];

    return {
      success: true,
      content: {
        slides,
        metadata: {
          totalSlides: slides.length,
          wordCount: 4000,
          keyFindings: [
            '目标客群特征明确',
            '营销预算配置合理',
            '执行方案具备可操作性'
          ],
          recommendations: [
            '分阶段实施营销策略',
            '建立数据驱动的优化机制',
            '强化品牌建设和口碑传播'
          ]
        }
      }
    };
  }
}

// 导出单例实例
export const aiReportService = new AIReportService();

/**
 * 报告生成进度监控
 */
export class ReportGenerationProgress {
  private listeners: ((progress: GenerationProgress) => void)[] = [];

  subscribe(callback: (progress: GenerationProgress) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  updateProgress(progress: GenerationProgress): void {
    this.listeners.forEach(callback => callback(progress));
  }
}

export const reportProgressManager = new ReportGenerationProgress();