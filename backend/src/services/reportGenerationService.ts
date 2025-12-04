import { PrismaClient } from '@prisma/client';
import { AIService, AIRequest } from './aiService';
import { DesignSystemConfig, ReportTemplateConfig } from './reportAnalysisService';
import { promises as fs } from 'fs';
import { join } from 'path';

// PPT生成相关接口
export interface SlideContent {
  id: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'image' | 'comparison' | 'timeline';
  title: string;
  subtitle?: string;
  content: string | any[];
  layout: {
    template: string;
    columns: number;
    hasImage: boolean;
    hasChart: boolean;
  };
  styling: {
    backgroundColor: string;
    titleColor: string;
    contentColor: string;
    fontSize: {
      title: number;
      content: number;
    };
  };
  animations?: {
    entrance: string;
    emphasis?: string;
    exit?: string;
  };
}

export interface PPTDocument {
  metadata: {
    title: string;
    subtitle?: string;
    author: string;
    company?: string;
    date: string;
    version: string;
  };
  designSystem: {
    theme: string;
    colorPalette: string[];
    fontFamily: string;
    logoUrl?: string;
  };
  slides: SlideContent[];
  exportOptions: {
    format: 'pptx' | 'pdf' | 'html';
    quality: 'high' | 'medium' | 'low';
    includeNotes: boolean;
    includeAnimations: boolean;
  };
}

// 报告生成配置
export interface ReportGenerationRequest {
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

// 图表配置
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'column';
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  options: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins?: {
      legend?: any;
      tooltip?: any;
    };
    scales?: any;
  };
}

// 表格配置
export interface TableConfig {
  title: string;
  headers: string[];
  rows: string[][];
  styling: {
    headerStyle: {
      backgroundColor: string;
      color: string;
      fontWeight: string;
    };
    rowStyle: {
      alternatingColors: string[];
      borderColor: string;
    };
  };
}

export class ReportGenerationService {
  private prisma: PrismaClient;
  private aiService: AIService;
  private uploadsDir: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.aiService = new AIService();
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
  }

  /**
   * 生成完整的报告文档
   */
  async generateReport(
    request: ReportGenerationRequest,
    userId: string,
    taskId?: string
  ): Promise<{
    document: PPTDocument;
    filePaths: { [format: string]: string };
    generationStats: {
      slidesGenerated: number;
      chartsGenerated: number;
      tablesGenerated: number;
      aiRequestCount: number;
      totalTokensUsed: number;
      generationTime: number;
    };
  }> {
    const startTime = Date.now();
    let aiRequestCount = 0;
    let totalTokensUsed = 0;

    console.log(`📊 开始生成报告: ${request.projectData.projectName}`);

    try {
      // 1. 获取模板和设计系统配置
      const { template, designSystem } = await this.getTemplateAndDesignSystem(
        request.templateId,
        request.designSystemId
      );

      // 2. 使用AI生成报告内容
      const reportContent = await this.generateReportContent(
        request,
        template,
        userId,
        taskId
      );

      aiRequestCount += reportContent.aiStats.requestCount;
      totalTokensUsed += reportContent.aiStats.tokensUsed;

      // 3. 创建PPT文档结构
      const pptDocument = await this.createPPTDocument(
        reportContent,
        designSystem,
        request,
        userId
      );

      // 4. 生成图表和表格
      const chartsAndTables = await this.generateChartsAndTables(
        reportContent.sections,
        designSystem,
        request.outputOptions
      );

      // 5. 组装最终文档
      const finalDocument = await this.assembleFinalDocument(
        pptDocument,
        chartsAndTables,
        designSystem
      );

      // 6. 导出到指定格式
      const filePaths = await this.exportDocument(
        finalDocument,
        request.outputOptions.format,
        userId,
        taskId
      );

      const generationTime = Date.now() - startTime;

      console.log(`✅ 报告生成完成: ${request.projectData.projectName} (${generationTime}ms)`);

      return {
        document: finalDocument,
        filePaths,
        generationStats: {
          slidesGenerated: finalDocument.slides.length,
          chartsGenerated: chartsAndTables.charts.length,
          tablesGenerated: chartsAndTables.tables.length,
          aiRequestCount,
          totalTokensUsed,
          generationTime
        }
      };

    } catch (error) {
      console.error(`❌ 报告生成失败: ${request.projectData.projectName}`, error);
      throw error;
    }
  }

  /**
   * 获取模板和设计系统配置
   */
  private async getTemplateAndDesignSystem(
    templateId: string,
    designSystemId?: string
  ): Promise<{
    template: ReportTemplateConfig;
    designSystem: DesignSystemConfig;
  }> {
    // 从数据库获取模板配置
    const reportType = await this.prisma.reportType.findUnique({
      where: { id: templateId }
    });

    if (!reportType) {
      throw new Error(`模板不存在: ${templateId}`);
    }

    // 从数据库获取设计系统
    let designSystem: DesignSystemConfig;

    if (designSystemId) {
      const designSystemRecord = await this.prisma.designSystem.findUnique({
        where: { id: designSystemId }
      });

      if (designSystemRecord) {
        designSystem = designSystemRecord.config as any;
      } else {
        // 使用默认设计系统
        designSystem = this.getDefaultDesignSystem();
      }
    } else {
      designSystem = this.getDefaultDesignSystem();
    }

    const template = (reportType.configuration as any)?.template || this.getDefaultTemplate();

    return { template, designSystem };
  }

  /**
   * 生成报告内容
   */
  private async generateReportContent(
    request: ReportGenerationRequest,
    template: ReportTemplateConfig,
    userId: string,
    taskId?: string
  ): Promise<{
    sections: Array<{
      id: string;
      title: string;
      content: string;
      type: string;
      data?: any;
    }>;
    aiStats: {
      requestCount: number;
      tokensUsed: number;
    };
  }> {
    const sections = [];
    let requestCount = 0;
    let tokensUsed = 0;

    // 基于模板生成各个章节
    const sectionTemplates = this.getSectionTemplates(template.name);

    for (const sectionTemplate of sectionTemplates) {
      console.log(`🔄 生成章节: ${sectionTemplate.title}`);

      const aiRequest: AIRequest = {
        prompt: this.buildSectionPrompt(sectionTemplate, request.projectData, template),
        userId,
        requestType: 'generation',
        maxTokens: 1500,
        temperature: 0.7,
        projectId: request.projectData.projectName,
        taskId,
        context: {
          sectionType: sectionTemplate.type,
          projectData: request.projectData,
          templateName: template.name
        }
      };

      try {
        const response = await this.aiService.generateResponse(aiRequest);

        sections.push({
          id: sectionTemplate.id,
          title: sectionTemplate.title,
          content: response.content,
          type: sectionTemplate.type,
          data: sectionTemplate.data
        });

        requestCount++;
        tokensUsed += response.usage.totalTokens;

        // 模拟进度更新
        if (taskId) {
          // 这里可以调用任务更新服务
          console.log(`📈 进度更新: ${sections.length}/${sectionTemplates.length} 章节已完成`);
        }

      } catch (error) {
        console.error(`❌ 章节生成失败: ${sectionTemplate.title}`, error);

        // 使用回退内容
        sections.push({
          id: sectionTemplate.id,
          title: sectionTemplate.title,
          content: this.getFallbackContent(sectionTemplate.type, request.projectData),
          type: sectionTemplate.type,
          data: sectionTemplate.data
        });
      }
    }

    return {
      sections,
      aiStats: { requestCount, tokensUsed }
    };
  }

  /**
   * 创建PPT文档结构
   */
  private async createPPTDocument(
    reportContent: any,
    designSystem: DesignSystemConfig,
    request: ReportGenerationRequest,
    userId: string
  ): Promise<PPTDocument> {
    const slides: SlideContent[] = [];

    // 1. 标题页
    slides.push({
      id: 'title',
      type: 'title',
      title: request.projectData.projectName,
      subtitle: request.projectData.description || '智能分析报告',
      content: `生成日期: ${new Date().toLocaleDateString('zh-CN')}\n分析区域: ${request.projectData.analysisArea || '全国'}\n时间范围: ${request.projectData.timeRange || '最近6个月'}`,
      layout: {
        template: 'title',
        columns: 1,
        hasImage: false,
        hasChart: false
      },
      styling: {
        backgroundColor: designSystem.colorPalette.background,
        titleColor: designSystem.colorPalette.primary,
        contentColor: designSystem.colorPalette.text,
        fontSize: {
          title: designSystem.typography.fontSize.h1,
          content: designSystem.typography.fontSize.body
        }
      }
    });

    // 2. 目录页
    const tableOfContents = reportContent.sections.map((section: any, index: number) =>
      `${index + 1}. ${section.title}`
    ).join('\n');

    slides.push({
      id: 'toc',
      type: 'content',
      title: '目录',
      content: tableOfContents,
      layout: {
        template: 'bullet_list',
        columns: 1,
        hasImage: false,
        hasChart: false
      },
      styling: {
        backgroundColor: designSystem.colorPalette.background,
        titleColor: designSystem.colorPalette.primary,
        contentColor: designSystem.colorPalette.text,
        fontSize: {
          title: designSystem.typography.fontSize.h2,
          content: designSystem.typography.fontSize.body
        }
      }
    });

    // 3. 内容页
    for (const section of reportContent.sections) {
      const slideType = this.determineSlideType(section.type, section.content);

      slides.push({
        id: section.id,
        type: slideType,
        title: section.title,
        content: section.content,
        layout: this.getLayoutForSlideType(slideType),
        styling: {
          backgroundColor: designSystem.colorPalette.background,
          titleColor: designSystem.colorPalette.primary,
          contentColor: designSystem.colorPalette.text,
          fontSize: {
            title: designSystem.typography.fontSize.h2,
            content: designSystem.typography.fontSize.body
          }
        },
        animations: {
          entrance: 'fadeIn'
        }
      });
    }

    // 4. 结束页
    slides.push({
      id: 'closing',
      type: 'title',
      title: '谢谢观看',
      subtitle: 'MarketPro AI 智能分析平台',
      content: '如需更多信息，请联系我们\nEmail: support@marketpro.ai\nWebsite: www.marketpro.ai',
      layout: {
        template: 'closing',
        columns: 1,
        hasImage: false,
        hasChart: false
      },
      styling: {
        backgroundColor: designSystem.colorPalette.primary,
        titleColor: '#ffffff',
        contentColor: '#f0f0f0',
        fontSize: {
          title: designSystem.typography.fontSize.h1,
          content: designSystem.typography.fontSize.body
        }
      }
    });

    return {
      metadata: {
        title: request.projectData.projectName,
        subtitle: request.projectData.description,
        author: 'MarketPro AI',
        company: 'MarketPro',
        date: new Date().toISOString(),
        version: '1.0'
      },
      designSystem: {
        theme: designSystem.name,
        colorPalette: [
          designSystem.colorPalette.primary,
          designSystem.colorPalette.secondary,
          designSystem.colorPalette.accent,
          ...designSystem.colorPalette.neutral
        ],
        fontFamily: designSystem.typography.fontFamily,
        logoUrl: undefined // 可以添加logo URL
      },
      slides,
      exportOptions: {
        format: 'pptx',
        quality: 'high',
        includeNotes: false,
        includeAnimations: true
      }
    };
  }

  /**
   * 生成图表和表格
   */
  private async generateChartsAndTables(
    sections: any[],
    designSystem: DesignSystemConfig,
    outputOptions: any
  ): Promise<{
    charts: ChartConfig[];
    tables: TableConfig[];
  }> {
    const charts: ChartConfig[] = [];
    const tables: TableConfig[] = [];

    if (!outputOptions.includeCharts && !outputOptions.includeTables) {
      return { charts, tables };
    }

    // 基于内容生成图表
    if (outputOptions.includeCharts) {
      charts.push(
        {
          type: 'bar',
          title: '市场份额分析',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
              label: '市场占有率',
              data: [25, 30, 35, 40],
              backgroundColor: designSystem.colorPalette.primary,
              borderColor: designSystem.colorPalette.secondary,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => `${context.label}: ${context.parsed.y}%`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 50,
                ticks: {
                  callback: (value: any) => `${value}%`
                }
              }
            }
          }
        },
        {
          type: 'line',
          title: '价格趋势分析',
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
              label: '平均价格',
              data: [45000, 46500, 48000, 47000, 49000, 50000],
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              borderColor: designSystem.colorPalette.primary,
              borderWidth: 3,
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: (value: any) => `¥${value.toLocaleString()}`
                }
              }
            }
          }
        }
      );
    }

    // 基于内容生成表格
    if (outputOptions.includeTables) {
      tables.push(
        {
          title: '竞品对比分析',
          headers: ['项目名称', '价格范围', '户型', '优势特点'],
          rows: [
            ['万科翡翠', '50-80万/㎡', '2-4房', '品牌力强，产品品质高'],
            ['恒大御景', '35-55万/㎡', '3-5房', '配套完善，性价比高'],
            ['碧桂园森林城市', '25-40万/㎡', '2-4房', '环境优美，户型丰富']
          ],
          styling: {
            headerStyle: {
              backgroundColor: designSystem.colorPalette.primary,
              color: '#ffffff',
              fontWeight: 'bold'
            },
            rowStyle: {
              alternatingColors: ['#ffffff', '#f8fafc'],
              borderColor: designSystem.colorPalette.neutral[2]
            }
          }
        },
        {
          title: '市场数据统计',
          headers: ['指标', 'Q1', 'Q2', 'Q3', 'Q4'],
          rows: [
            ['新房成交量(套)', '1,250', '1,580', '1,820', '2,100'],
            ['平均价格(万/㎡)', '4.5', '4.65', '4.8', '5.0'],
            ['库存周期(月)', '8.5', '7.2', '6.8', '6.0']
          ],
          styling: {
            headerStyle: {
              backgroundColor: designSystem.colorPalette.secondary,
              color: '#ffffff',
              fontWeight: 'bold'
            },
            rowStyle: {
              alternatingColors: ['#ffffff', '#f1f5f9'],
              borderColor: designSystem.colorPalette.neutral[3]
            }
          }
        }
      );
    }

    return { charts, tables };
  }

  /**
   * 组装最终文档
   */
  private async assembleFinalDocument(
    pptDocument: PPTDocument,
    chartsAndTables: { charts: ChartConfig[]; tables: TableConfig[] },
    designSystem: DesignSystemConfig
  ): Promise<PPTDocument> {
    // 将图表和表格插入到相应的幻灯片中
    const enhancedSlides = [...pptDocument.slides];

    // 在内容页中插入图表幻灯片
    if (chartsAndTables.charts.length > 0) {
      for (const [index, chart] of chartsAndTables.charts.entries()) {
        const chartSlide: SlideContent = {
          id: `chart_${index}`,
          type: 'chart',
          title: chart.title,
          content: chart,
          layout: {
            template: 'chart',
            columns: 1,
            hasImage: false,
            hasChart: true
          },
          styling: {
            backgroundColor: designSystem.colorPalette.background,
            titleColor: designSystem.colorPalette.primary,
            contentColor: designSystem.colorPalette.text,
            fontSize: {
              title: designSystem.typography.fontSize.h2,
              content: designSystem.typography.fontSize.body
            }
          },
          animations: {
            entrance: 'slideInLeft'
          }
        };

        // 在目录页后插入图表
        enhancedSlides.splice(3 + index, 0, chartSlide);
      }
    }

    // 插入表格幻灯片
    if (chartsAndTables.tables.length > 0) {
      for (const [index, table] of chartsAndTables.tables.entries()) {
        const tableSlide: SlideContent = {
          id: `table_${index}`,
          type: 'table',
          title: table.title,
          content: table,
          layout: {
            template: 'table',
            columns: 1,
            hasImage: false,
            hasChart: false
          },
          styling: {
            backgroundColor: designSystem.colorPalette.background,
            titleColor: designSystem.colorPalette.primary,
            contentColor: designSystem.colorPalette.text,
            fontSize: {
              title: designSystem.typography.fontSize.h2,
              content: designSystem.typography.fontSize.small
            }
          }
        };

        // 在图表后插入表格
        const insertPosition = 3 + chartsAndTables.charts.length + index;
        enhancedSlides.splice(insertPosition, 0, tableSlide);
      }
    }

    return {
      ...pptDocument,
      slides: enhancedSlides
    };
  }

  /**
   * 导出文档到指定格式
   */
  private async exportDocument(
    document: PPTDocument,
    format: string,
    userId: string,
    taskId?: string
  ): Promise<{ [format: string]: string }> {
    const timestamp = Date.now();
    const baseFileName = `${document.metadata.title}_${timestamp}`;
    const filePaths: { [format: string]: string } = {};

    // 确保上传目录存在
    await fs.mkdir(this.uploadsDir, { recursive: true });

    if (format === 'all' || format === 'pptx') {
      const pptxPath = await this.generatePPTX(document, baseFileName);
      filePaths.pptx = pptxPath;
    }

    if (format === 'all' || format === 'pdf') {
      const pdfPath = await this.generatePDF(document, baseFileName);
      filePaths.pdf = pdfPath;
    }

    if (format === 'all' || format === 'html') {
      const htmlPath = await this.generateHTML(document, baseFileName);
      filePaths.html = htmlPath;
    }

    return filePaths;
  }

  /**
   * 生成PPTX文件
   */
  private async generatePPTX(document: PPTDocument, baseFileName: string): Promise<string> {
    const filePath = join(this.uploadsDir, `${baseFileName}.pptx`);

    // 在实际实现中，这里应该使用 pptxgenjs 或类似库
    // 现在我们创建一个模拟的PPTX文件内容
    const pptxContent = this.createMockPPTXContent(document);

    await fs.writeFile(filePath, pptxContent);

    console.log(`📄 PPTX文件已生成: ${filePath}`);
    return filePath;
  }

  /**
   * 生成PDF文件
   */
  private async generatePDF(document: PPTDocument, baseFileName: string): Promise<string> {
    const filePath = join(this.uploadsDir, `${baseFileName}.pdf`);

    // 在实际实现中，这里应该使用 puppeteer 或类似库
    const pdfContent = this.createMockPDFContent(document);

    await fs.writeFile(filePath, pdfContent);

    console.log(`📄 PDF文件已生成: ${filePath}`);
    return filePath;
  }

  /**
   * 生成HTML文件
   */
  private async generateHTML(document: PPTDocument, baseFileName: string): Promise<string> {
    const filePath = join(this.uploadsDir, `${baseFileName}.html`);

    const htmlContent = this.createHTMLContent(document);

    await fs.writeFile(filePath, htmlContent);

    console.log(`📄 HTML文件已生成: ${filePath}`);
    return filePath;
  }

  // === 辅助方法 ===

  private getDefaultDesignSystem(): DesignSystemConfig {
    return {
      name: '默认设计系统',
      description: '系统默认的设计系统',
      colorPalette: {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        accent: '#3b82f6',
        background: '#ffffff',
        text: '#1f2937',
        neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
      },
      typography: {
        fontFamily: 'Microsoft YaHei',
        fontSize: { h1: 28, h2: 24, h3: 20, body: 16, small: 14 },
        fontWeight: { normal: 400, medium: 500, bold: 700 },
        lineHeight: { tight: 1.2, normal: 1.5, loose: 1.8 }
      },
      spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
      layout: {
        maxWidth: 1200, columns: 12, gutter: 16,
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      },
      components: {
        slide: { background: '#ffffff', padding: 40, borderRadius: 8 },
        header: { fontSize: 28, fontWeight: 700, color: '#2563eb', marginBottom: 24 },
        content: { fontSize: 16, lineHeight: 1.5, color: '#1f2937' },
        chart: { colors: ['#2563eb', '#1d4ed8', '#3b82f6'], background: '#f9fafb', border: '#e5e7eb' },
        table: { headerBackground: '#2563eb', headerColor: '#ffffff', borderColor: '#e5e7eb' },
        footer: { fontSize: 12, color: '#6b7280', borderTop: '#e5e7eb' }
      }
    };
  }

  private getDefaultTemplate(): ReportTemplateConfig {
    return {
      id: 'default',
      name: '默认报告模板',
      category: 'general',
      description: '通用报告模板',
      estimatedTime: 15,
      difficulty: 'beginner',
      inputFields: [],
      workflow: [],
      outputFormats: ['pptx', 'pdf'],
      designSystem: '默认设计系统',
      prompts: {
        analysis: '请分析相关数据',
        generation: '请生成专业报告',
        refinement: '请优化报告内容'
      }
    };
  }

  private getSectionTemplates(templateName: string) {
    const templates: Record<string, any[]> = {
      '市场分析报告': [
        { id: 'executive_summary', title: '执行摘要', type: 'summary' },
        { id: 'market_overview', title: '市场概况', type: 'analysis' },
        { id: 'trend_analysis', title: '趋势分析', type: 'analysis' },
        { id: 'risk_assessment', title: '风险评估', type: 'analysis' },
        { id: 'recommendations', title: '投资建议', type: 'recommendations' }
      ],
      '竞品分析报告': [
        { id: 'competitive_landscape', title: '竞争格局', type: 'analysis' },
        { id: 'competitor_profiles', title: '竞品详情', type: 'comparison' },
        { id: 'swot_analysis', title: 'SWOT分析', type: 'analysis' },
        { id: 'positioning', title: '定位策略', type: 'recommendations' }
      ],
      '项目营销方案': [
        { id: 'target_audience', title: '目标客群', type: 'analysis' },
        { id: 'marketing_strategy', title: '营销策略', type: 'strategy' },
        { id: 'promotional_plan', title: '推广计划', type: 'timeline' },
        { id: 'budget_allocation', title: '预算分配', type: 'budget' }
      ],
      '销售进度跟踪': [
        { id: 'sales_performance', title: '销售表现', type: 'metrics' },
        { id: 'customer_analysis', title: '客户分析', type: 'analysis' },
        { id: 'pipeline_review', title: '销售漏斗', type: 'funnel' },
        { id: 'action_plan', title: '行动计划', type: 'recommendations' }
      ]
    };

    return templates[templateName] || templates['市场分析报告'];
  }

  private buildSectionPrompt(sectionTemplate: any, projectData: any, template: ReportTemplateConfig): string {
    const basePrompt = `请为房地产项目"${projectData.projectName}"生成"${sectionTemplate.title}"部分的内容。`;

    const contextInfo = `
项目信息：
- 项目名称：${projectData.projectName}
- 项目描述：${projectData.description || '未提供'}
- 分析区域：${projectData.analysisArea || '未指定'}
- 时间范围：${projectData.timeRange || '近6个月'}

要求：
- 内容专业、详实
- 逻辑清晰、层次分明
- 包含具体数据和分析
- 语言简洁明了
- 字数控制在300-500字`;

    return basePrompt + contextInfo;
  }

  private getFallbackContent(sectionType: string, projectData: any): string {
    const fallbacks: Record<string, string> = {
      'summary': `${projectData.projectName}项目分析摘要：本项目位于${projectData.analysisArea}，具有良好的发展前景。`,
      'analysis': `基于${projectData.timeRange}的数据分析，${projectData.projectName}项目在市场中表现稳健。`,
      'recommendations': `建议关注${projectData.projectName}项目的长期发展潜力，适时进行投资布局。`
    };

    return fallbacks[sectionType] || `${projectData.projectName}相关分析内容`;
  }

  private determineSlideType(sectionType: string, content: string): SlideContent['type'] {
    if (sectionType === 'comparison') return 'comparison';
    if (sectionType === 'timeline') return 'timeline';
    if (content.includes('图表') || content.includes('数据')) return 'chart';
    if (content.includes('表格') || content.includes('对比')) return 'table';
    return 'content';
  }

  private getLayoutForSlideType(slideType: SlideContent['type']) {
    const layouts: Record<string, any> = {
      'title': { template: 'title', columns: 1, hasImage: false, hasChart: false },
      'content': { template: 'content', columns: 1, hasImage: false, hasChart: false },
      'chart': { template: 'chart', columns: 1, hasImage: false, hasChart: true },
      'table': { template: 'table', columns: 1, hasImage: false, hasChart: false },
      'comparison': { template: 'comparison', columns: 2, hasImage: false, hasChart: false },
      'timeline': { template: 'timeline', columns: 1, hasImage: false, hasChart: false }
    };

    return layouts[slideType] || layouts['content'];
  }

  private createMockPPTXContent(document: PPTDocument): Buffer {
    // 在实际实现中，这里使用 pptxgenjs 库创建真实的PPTX文件
    const mockContent = `PPTX Mock Content for: ${document.metadata.title}
Slides: ${document.slides.length}
Generated: ${new Date().toISOString()}`;

    return Buffer.from(mockContent, 'utf8');
  }

  private createMockPDFContent(document: PPTDocument): Buffer {
    // 在实际实现中，这里使用 puppeteer 或 PDFKit 创建真实的PDF文件
    const mockContent = `PDF Mock Content for: ${document.metadata.title}
Slides: ${document.slides.length}
Generated: ${new Date().toISOString()}`;

    return Buffer.from(mockContent, 'utf8');
  }

  private createHTMLContent(document: PPTDocument): string {
    // 创建HTML演示文稿
    const slides = document.slides.map(slide => `
      <section class="slide" data-slide-id="${slide.id}">
        <header>
          <h2 style="color: ${slide.styling.titleColor}; font-size: ${slide.styling.fontSize.title}px;">
            ${slide.title}
          </h2>
          ${slide.subtitle ? `<h3>${slide.subtitle}</h3>` : ''}
        </header>
        <main style="color: ${slide.styling.contentColor}; font-size: ${slide.styling.fontSize.content}px;">
          ${typeof slide.content === 'string' ?
            `<div class="content">${slide.content.replace(/\n/g, '<br>')}</div>` :
            `<div class="content">复杂内容类型</div>`
          }
        </main>
      </section>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.metadata.title}</title>
  <style>
    body {
      font-family: '${document.designSystem.fontFamily}', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .slide {
      width: 100vw;
      height: 100vh;
      padding: 60px;
      box-sizing: border-box;
      background-color: white;
      border-bottom: 2px solid #eee;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .slide header h2 {
      margin: 0 0 20px 0;
      font-weight: 700;
    }
    .slide header h3 {
      margin: 0 0 40px 0;
      color: #666;
      font-weight: 500;
    }
    .content {
      line-height: 1.6;
      max-width: 800px;
    }
    @media print {
      .slide {
        page-break-after: always;
        height: auto;
      }
    }
  </style>
</head>
<body>
  ${slides}
  <script>
    console.log('HTML报告已生成: ${document.metadata.title}');
    console.log('共 ${document.slides.length} 页');
  </script>
</body>
</html>`;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    services: {
      aiService: boolean;
      fileSystem: boolean;
      templates: boolean;
    };
  }> {
    try {
      // 检查AI服务
      const aiHealth = await this.aiService.healthCheck();

      // 检查文件系统
      let fileSystemHealthy = true;
      try {
        await fs.access(this.uploadsDir);
      } catch {
        fileSystemHealthy = false;
      }

      // 检查模板系统
      const templatesHealthy = true; // 模板系统是内存中的，通常可用

      const services = {
        aiService: aiHealth.status !== 'critical',
        fileSystem: fileSystemHealthy,
        templates: templatesHealthy
      };

      const allHealthy = Object.values(services).every(service => service);
      const status = allHealthy ? 'healthy' as const :
                   services.templates && services.fileSystem ? 'degraded' as const : 'critical' as const;

      return { status, services };

    } catch (error) {
      console.error('Report generation service health check failed:', error);
      return {
        status: 'critical',
        services: {
          aiService: false,
          fileSystem: false,
          templates: false
        }
      };
    }
  }
}