import { PrismaClient } from '@prisma/client';
import { AIService, AIRequest } from './aiService';
import { Buffer } from 'buffer';

// PDF 解析相关（占位符，实际需要安装 pdf-parse）
interface PDFParseResult {
  text: string;
  numpages: number;
  info?: any;
  metadata?: any;
}

// PPTX 解析相关（占位符，实际需要安装相关库）
interface PPTXParseResult {
  slides: Array<{
    text: string;
    notes?: string;
    layout?: string;
  }>;
  metadata?: any;
}

// 文档分析结果
export interface DocumentAnalysisResult {
  documentType: 'pdf' | 'pptx' | 'unknown';
  extractedText: string;
  structure: {
    sections: Array<{
      title: string;
      content: string;
      type: 'header' | 'body' | 'chart' | 'table' | 'image';
      confidence: number;
    }>;
    pageCount: number;
    wordCount: number;
  };
  designSystem: {
    colorScheme: string[];
    typography: {
      primaryFont: string;
      secondaryFont?: string;
      headerStyles: string[];
    };
    layout: {
      type: 'single-column' | 'multi-column' | 'slides' | 'mixed';
      spacing: 'tight' | 'normal' | 'loose';
      alignment: 'left' | 'center' | 'justified';
    };
    branding: {
      hasLogo: boolean;
      colorConsistency: number;
      styleConsistency: number;
    };
  };
  reportType: {
    detected: string;
    confidence: number;
    suggestedTemplate: string;
    requiredFields: string[];
    estimatedGenerationTime: number; // 分钟
  };
  quality: {
    textQuality: number;
    structureQuality: number;
    designQuality: number;
    overallScore: number;
  };
}

// 设计系统生成配置
export interface DesignSystemConfig {
  name: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    neutral: string[];
  };
  typography: {
    fontFamily: string;
    fontSize: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
      small: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      loose: number;
    };
  };
  spacing: {
    unit: number;
    sizes: number[];
  };
  layout: {
    maxWidth: number;
    columns: number;
    gutter: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  components: {
    slide: any;
    header: any;
    content: any;
    chart: any;
    table: any;
    footer: any;
  };
}

// 报告模板配置
export interface ReportTemplateConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  inputFields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
    required: boolean;
    label: string;
    placeholder?: string;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  workflow: Array<{
    step: number;
    name: string;
    description: string;
    type: 'data_collection' | 'ai_analysis' | 'content_generation' | 'design_application' | 'review' | 'export';
    estimatedTime: number;
    dependencies?: number[];
  }>;
  outputFormats: string[];
  designSystem: string; // 关联的设计系统ID
  prompts: {
    analysis: string;
    generation: string;
    refinement: string;
  };
}

export class ReportAnalysisService {
  private prisma: PrismaClient;
  private aiService: AIService;

  constructor() {
    this.prisma = new PrismaClient();
    this.aiService = new AIService();
  }

  /**
   * 分析上传的文档并生成设计系统和模板配置
   */
  async analyzeDocumentAndGenerateConfig(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<{
    analysis: DocumentAnalysisResult;
    designSystem: DesignSystemConfig;
    template: ReportTemplateConfig;
  }> {
    try {
      console.log(`📄 开始分析文档: ${fileName}`);

      // 1. 解析文档内容
      const analysis = await this.analyzeDocument(fileBuffer, fileName, mimeType, userId);

      // 2. 基于分析结果生成设计系统
      const designSystem = await this.generateDesignSystem(analysis, userId);

      // 3. 生成报告模板配置
      const template = await this.generateReportTemplate(analysis, designSystem, userId);

      console.log(`✅ 文档分析完成: ${fileName}`);

      return {
        analysis,
        designSystem,
        template
      };

    } catch (error) {
      console.error(`❌ 文档分析失败: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * 分析文档内容
   */
  private async analyzeDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<DocumentAnalysisResult> {
    let documentType: 'pdf' | 'pptx' | 'unknown' = 'unknown';
    let extractedText = '';
    let pageCount = 0;

    // 根据MIME类型解析文档
    if (mimeType === 'application/pdf') {
      documentType = 'pdf';
      const pdfResult = await this.parsePDF(fileBuffer);
      extractedText = pdfResult.text;
      pageCount = pdfResult.numpages;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      documentType = 'pptx';
      const pptxResult = await this.parsePPTX(fileBuffer);
      extractedText = pptxResult.slides.map(slide => slide.text).join('\n\n');
      pageCount = pptxResult.slides.length;
    } else {
      throw new Error(`不支持的文件类型: ${mimeType}`);
    }

    // 使用AI分析文档结构和内容
    const structuralAnalysis = await this.performStructuralAnalysis(extractedText, userId);
    const designAnalysis = await this.performDesignAnalysis(extractedText, documentType, userId);
    const typeAnalysis = await this.performTypeAnalysis(extractedText, userId);

    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;

    return {
      documentType,
      extractedText,
      structure: {
        sections: structuralAnalysis.sections,
        pageCount,
        wordCount
      },
      designSystem: designAnalysis,
      reportType: typeAnalysis,
      quality: this.calculateQualityScore(extractedText, structuralAnalysis, designAnalysis)
    };
  }

  /**
   * 解析PDF文档（模拟实现）
   */
  private async parsePDF(buffer: Buffer): Promise<PDFParseResult> {
    // 在实际实现中，这里应该使用 pdf-parse 库
    // const pdfParse = require('pdf-parse');
    // return await pdfParse(buffer);

    // 模拟PDF解析结果
    return {
      text: `这是从PDF文档解析的示例文本内容。

# 房地产市场分析报告

## 执行摘要
本报告分析了2024年第一季度的房地产市场表现...

## 市场概况
### 1. 整体市场趋势
- 新房销售量同比增长15%
- 平均价格上涨8%
- 库存周期缩短至6个月

### 2. 区域分析
#### 2.1 一线城市
一线城市继续保持稳定增长态势...

#### 2.2 二线城市
二线城市成为新的增长点...

## 竞品分析
### 主要竞争对手
1. 万科地产
2. 恒大地产
3. 碧桂园

## 投资建议
基于以上分析，我们建议...

## 附录
数据来源和计算方法...`,
      numpages: 24,
      info: {
        Title: fileName,
        Author: 'MarketPro Analysis',
        CreationDate: new Date()
      }
    };
  }

  /**
   * 解析PPTX文档（模拟实现）
   */
  private async parsePPTX(buffer: Buffer): Promise<PPTXParseResult> {
    // 在实际实现中，这里应该使用相关的PPTX解析库
    // 例如: officegen, pptx-parser, 或自定义解析器

    // 模拟PPTX解析结果
    return {
      slides: [
        {
          text: "房地产营销方案\n2024年度策略规划",
          layout: "title"
        },
        {
          text: "目录\n1. 市场分析\n2. 竞品研究\n3. 营销策略\n4. 实施计划",
          layout: "content"
        },
        {
          text: "市场分析\n• 市场规模：5000亿元\n• 增长率：12%\n• 主要驱动因素\n  - 政策支持\n  - 人口增长\n  - 城市化进程",
          layout: "bullet_points"
        },
        {
          text: "竞品分析\n主要竞争对手分析表格\n[图表数据]",
          layout: "chart"
        },
        {
          text: "营销策略\n1. 数字化营销\n2. 线下活动\n3. 合作伙伴推广\n4. 品牌建设",
          layout: "content"
        },
        {
          text: "实施计划\n第一季度：品牌定位\n第二季度：市场推广\n第三季度：销售冲刺\n第四季度：总结优化",
          layout: "timeline"
        },
        {
          text: "谢谢观看\n联系方式：contact@marketpro.ai",
          layout: "closing"
        }
      ],
      metadata: {
        slideCount: 7,
        template: "corporate",
        theme: "professional"
      }
    };
  }

  /**
   * 执行结构化分析
   */
  private async performStructuralAnalysis(text: string, userId: string): Promise<{
    sections: Array<{
      title: string;
      content: string;
      type: 'header' | 'body' | 'chart' | 'table' | 'image';
      confidence: number;
    }>;
  }> {
    const prompt = `请分析以下文档的结构，识别主要章节和内容类型：

${text.substring(0, 3000)}...

请返回JSON格式的结构分析，包含：
1. 主要章节标题
2. 每个章节的内容类型（header/body/chart/table/image）
3. 置信度评分（0-1）

格式：
{
  "sections": [
    {
      "title": "章节标题",
      "content": "章节摘要",
      "type": "内容类型",
      "confidence": 0.95
    }
  ]
}`;

    try {
      const response = await this.aiService.generateResponse({
        prompt,
        userId,
        requestType: 'analysis',
        maxTokens: 1000
      });

      // 尝试解析AI返回的JSON
      try {
        return JSON.parse(response.content);
      } catch {
        // 如果解析失败，返回默认结构
        return this.getDefaultStructuralAnalysis(text);
      }
    } catch (error) {
      console.error('AI结构分析失败:', error);
      return this.getDefaultStructuralAnalysis(text);
    }
  }

  /**
   * 执行设计分析
   */
  private async performDesignAnalysis(text: string, documentType: string, userId: string): Promise<{
    colorScheme: string[];
    typography: {
      primaryFont: string;
      secondaryFont?: string;
      headerStyles: string[];
    };
    layout: {
      type: 'single-column' | 'multi-column' | 'slides' | 'mixed';
      spacing: 'tight' | 'normal' | 'loose';
      alignment: 'left' | 'center' | 'justified';
    };
    branding: {
      hasLogo: boolean;
      colorConsistency: number;
      styleConsistency: number;
    };
  }> {
    // 基于文档类型和内容推断设计特征
    const isSlideFormat = documentType === 'pptx';
    const hasCharts = text.includes('图表') || text.includes('chart') || text.includes('数据');
    const hasStructure = text.includes('#') || text.includes('章节') || text.includes('目录');

    return {
      colorScheme: ['#2563eb', '#1d4ed8', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
      typography: {
        primaryFont: isSlideFormat ? 'Microsoft YaHei' : 'SimSun',
        secondaryFont: 'Arial',
        headerStyles: ['bold', 'large', 'colored']
      },
      layout: {
        type: isSlideFormat ? 'slides' : hasStructure ? 'single-column' : 'mixed',
        spacing: 'normal',
        alignment: 'left'
      },
      branding: {
        hasLogo: text.includes('logo') || text.includes('品牌') || text.includes('标志'),
        colorConsistency: 0.8,
        styleConsistency: 0.75
      }
    };
  }

  /**
   * 执行类型分析
   */
  private async performTypeAnalysis(text: string, userId: string): Promise<{
    detected: string;
    confidence: number;
    suggestedTemplate: string;
    requiredFields: string[];
    estimatedGenerationTime: number;
  }> {
    // 基于关键词分析文档类型
    const marketKeywords = ['市场', '分析', '趋势', '增长', '数据'];
    const competitorKeywords = ['竞品', '对手', '比较', '优势', '劣势'];
    const marketingKeywords = ['营销', '推广', '策略', '方案', '活动'];
    const salesKeywords = ['销售', '业绩', '目标', '进度', '成交'];

    let detectedType = '市场分析报告';
    let confidence = 0.7;

    const marketScore = this.calculateKeywordScore(text, marketKeywords);
    const competitorScore = this.calculateKeywordScore(text, competitorKeywords);
    const marketingScore = this.calculateKeywordScore(text, marketingKeywords);
    const salesScore = this.calculateKeywordScore(text, salesKeywords);

    const maxScore = Math.max(marketScore, competitorScore, marketingScore, salesScore);

    if (maxScore === competitorScore && competitorScore > 0.3) {
      detectedType = '竞品分析报告';
      confidence = competitorScore;
    } else if (maxScore === marketingScore && marketingScore > 0.3) {
      detectedType = '项目营销方案';
      confidence = marketingScore;
    } else if (maxScore === salesScore && salesScore > 0.3) {
      detectedType = '销售进度跟踪';
      confidence = salesScore;
    } else {
      confidence = marketScore;
    }

    return {
      detected: detectedType,
      confidence: Math.min(confidence, 0.95),
      suggestedTemplate: detectedType,
      requiredFields: this.getRequiredFieldsForType(detectedType),
      estimatedGenerationTime: this.getEstimatedTimeForType(detectedType)
    };
  }

  /**
   * 生成设计系统配置
   */
  private async generateDesignSystem(
    analysis: DocumentAnalysisResult,
    userId: string
  ): Promise<DesignSystemConfig> {
    const { designSystem } = analysis;

    return {
      name: `${analysis.reportType.detected.replace('报告', '').replace('方案', '')}设计系统`,
      description: `基于上传文档自动生成的${analysis.reportType.detected}设计系统`,
      colorPalette: {
        primary: designSystem.colorScheme[0] || '#2563eb',
        secondary: designSystem.colorScheme[1] || '#1d4ed8',
        accent: designSystem.colorScheme[2] || '#3b82f6',
        background: '#ffffff',
        text: '#1f2937',
        neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
      },
      typography: {
        fontFamily: designSystem.typography.primaryFont,
        fontSize: {
          h1: 28,
          h2: 24,
          h3: 20,
          body: 16,
          small: 14
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          bold: 700
        },
        lineHeight: {
          tight: 1.2,
          normal: 1.5,
          loose: 1.8
        }
      },
      spacing: {
        unit: 4,
        sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
      },
      layout: {
        maxWidth: 1200,
        columns: 12,
        gutter: 16,
        margins: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        }
      },
      components: {
        slide: {
          background: '#ffffff',
          padding: 40,
          borderRadius: 8
        },
        header: {
          fontSize: 28,
          fontWeight: 700,
          color: designSystem.colorScheme[0],
          marginBottom: 24
        },
        content: {
          fontSize: 16,
          lineHeight: 1.5,
          color: '#1f2937'
        },
        chart: {
          colors: designSystem.colorScheme,
          background: '#f9fafb',
          border: '#e5e7eb'
        },
        table: {
          headerBackground: designSystem.colorScheme[0],
          headerColor: '#ffffff',
          borderColor: '#e5e7eb'
        },
        footer: {
          fontSize: 12,
          color: '#6b7280',
          borderTop: '#e5e7eb'
        }
      }
    };
  }

  /**
   * 生成报告模板配置
   */
  private async generateReportTemplate(
    analysis: DocumentAnalysisResult,
    designSystem: DesignSystemConfig,
    userId: string
  ): Promise<ReportTemplateConfig> {
    const reportType = analysis.reportType.detected;
    const templateId = `template_${Date.now()}`;

    return {
      id: templateId,
      name: reportType,
      category: this.getCategoryForType(reportType),
      description: `基于上传文档自动生成的${reportType}模板`,
      estimatedTime: analysis.reportType.estimatedGenerationTime,
      difficulty: analysis.quality.overallScore > 0.8 ? 'advanced' :
                 analysis.quality.overallScore > 0.6 ? 'intermediate' : 'beginner',
      inputFields: this.generateInputFields(reportType),
      workflow: this.generateWorkflow(reportType),
      outputFormats: ['pptx', 'pdf', 'html'],
      designSystem: designSystem.name,
      prompts: {
        analysis: this.generateAnalysisPrompt(reportType),
        generation: this.generateGenerationPrompt(reportType),
        refinement: this.generateRefinementPrompt(reportType)
      }
    };
  }

  /**
   * 保存分析结果到数据库
   */
  async saveAnalysisResult(
    userId: string,
    fileName: string,
    analysis: DocumentAnalysisResult,
    designSystem: DesignSystemConfig,
    template: ReportTemplateConfig
  ): Promise<{
    reportTypeId: string;
    designSystemId: string;
  }> {
    try {
      // 1. 创建设计系统记录
      const createdDesignSystem = await this.prisma.designSystem.create({
        data: {
          name: designSystem.name,
          description: designSystem.description,
          config: designSystem as any,
          version: 1,
          isDefault: false,
          createdBy: userId
        }
      });

      // 2. 创建报告类型记录
      const createdReportType = await this.prisma.reportType.create({
        data: {
          name: template.name,
          description: template.description,
          icon: this.getIconForType(template.category),
          status: 'active',
          category: template.category,
          configuration: {
            template,
            analysis: {
              sourceFile: fileName,
              quality: analysis.quality,
              extractedText: analysis.extractedText.substring(0, 1000) // 截断保存
            }
          } as any,
          version: 1,
          createdBy: userId
        }
      });

      console.log(`✅ 分析结果已保存到数据库`);

      return {
        reportTypeId: createdReportType.id,
        designSystemId: createdDesignSystem.id
      };

    } catch (error) {
      console.error('保存分析结果失败:', error);
      throw error;
    }
  }

  // === 辅助方法 ===

  private getDefaultStructuralAnalysis(text: string) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const sections = [];

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') || line.length < 100) {
        sections.push({
          title: line.replace(/^#+\s*/, ''),
          content: lines[i + 1] ? lines[i + 1].substring(0, 200) : '',
          type: 'header' as const,
          confidence: 0.8
        });
      }
    }

    if (sections.length === 0) {
      sections.push({
        title: '文档内容',
        content: text.substring(0, 500),
        type: 'body' as const,
        confidence: 0.6
      });
    }

    return { sections };
  }

  private calculateKeywordScore(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      const count = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      score += count;
    }

    return Math.min(score / text.length * 1000, 1);
  }

  private getRequiredFieldsForType(type: string): string[] {
    const fieldMap: Record<string, string[]> = {
      '市场分析报告': ['项目名称', '分析区域', '时间范围', '数据源'],
      '竞品分析报告': ['项目名称', '分析区域', '竞品项目', '对比维度'],
      '项目营销方案': ['项目名称', '目标客群', '营销预算', '推广渠道'],
      '销售进度跟踪': ['项目名称', '销售团队', '目标设定', '统计周期']
    };

    return fieldMap[type] || ['项目名称', '项目描述', '分析要求'];
  }

  private getEstimatedTimeForType(type: string): number {
    const timeMap: Record<string, number> = {
      '市场分析报告': 15,
      '竞品分析报告': 12,
      '项目营销方案': 18,
      '销售进度跟踪': 10
    };

    return timeMap[type] || 12;
  }

  private getCategoryForType(type: string): string {
    if (type.includes('市场') || type.includes('分析')) return 'analysis';
    if (type.includes('营销') || type.includes('方案')) return 'marketing';
    if (type.includes('销售') || type.includes('跟踪')) return 'sales';
    return 'general';
  }

  private getIconForType(category: string): string {
    const iconMap: Record<string, string> = {
      analysis: 'TrendingUp',
      marketing: 'Target',
      sales: 'DollarSign',
      general: 'FileText'
    };

    return iconMap[category] || 'FileText';
  }

  private calculateQualityScore(
    text: string,
    structural: any,
    design: any
  ): {
    textQuality: number;
    structureQuality: number;
    designQuality: number;
    overallScore: number;
  } {
    // 文本质量评分
    const textQuality = Math.min(1, text.length / 5000) * 0.5 +
                       (text.includes('数据') ? 0.2 : 0) +
                       (text.includes('分析') ? 0.2 : 0) +
                       (structural.sections.length > 3 ? 0.1 : 0);

    // 结构质量评分
    const structureQuality = Math.min(1, structural.sections.length / 8) * 0.5 +
                            (structural.sections.some((s: any) => s.type === 'header') ? 0.3 : 0) +
                            (structural.sections.length > 1 ? 0.2 : 0);

    // 设计质量评分
    const designQuality = design.branding.colorConsistency * 0.4 +
                         design.branding.styleConsistency * 0.4 +
                         (design.branding.hasLogo ? 0.2 : 0);

    const overallScore = (textQuality + structureQuality + designQuality) / 3;

    return {
      textQuality: Math.round(textQuality * 100) / 100,
      structureQuality: Math.round(structureQuality * 100) / 100,
      designQuality: Math.round(designQuality * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100
    };
  }

  private generateInputFields(reportType: string) {
    const baseFields = [
      {
        name: 'projectName',
        type: 'text' as const,
        required: true,
        label: '项目名称',
        placeholder: '请输入项目名称'
      },
      {
        name: 'description',
        type: 'textarea' as const,
        required: false,
        label: '项目描述',
        placeholder: '简要描述项目背景和目标'
      }
    ];

    const typeSpecificFields: Record<string, any[]> = {
      '市场分析报告': [
        {
          name: 'analysisArea',
          type: 'text',
          required: true,
          label: '分析区域',
          placeholder: '如：北京朝阳区'
        },
        {
          name: 'timeRange',
          type: 'select',
          required: true,
          label: '时间范围',
          options: ['近3个月', '近6个月', '近1年', '自定义']
        }
      ],
      '竞品分析报告': [
        {
          name: 'competitorProjects',
          type: 'textarea',
          required: true,
          label: '竞品项目',
          placeholder: '请列出主要竞争对手项目名称'
        }
      ]
    };

    return [...baseFields, ...(typeSpecificFields[reportType] || [])];
  }

  private generateWorkflow(reportType: string) {
    return [
      {
        step: 1,
        name: '信息收集',
        description: '收集项目基本信息和用户需求',
        type: 'data_collection' as const,
        estimatedTime: 2
      },
      {
        step: 2,
        name: 'AI分析',
        description: '使用AI分析市场数据和项目信息',
        type: 'ai_analysis' as const,
        estimatedTime: 3,
        dependencies: [1]
      },
      {
        step: 3,
        name: '内容生成',
        description: '根据分析结果生成报告内容',
        type: 'content_generation' as const,
        estimatedTime: 5,
        dependencies: [2]
      },
      {
        step: 4,
        name: '设计应用',
        description: '应用设计系统，生成最终报告',
        type: 'design_application' as const,
        estimatedTime: 3,
        dependencies: [3]
      }
    ];
  }

  private generateAnalysisPrompt(reportType: string): string {
    return `请分析以下${reportType}相关的项目信息和数据，提供专业的分析和洞察。`;
  }

  private generateGenerationPrompt(reportType: string): string {
    return `请基于分析结果生成一份专业的${reportType}，包含详细的分析、结论和建议。`;
  }

  private generateRefinementPrompt(reportType: string): string {
    return `请优化和完善${reportType}的内容，确保逻辑清晰、数据准确、建议可行。`;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    services: {
      parsing: boolean;
      aiAnalysis: boolean;
      database: boolean;
    };
  }> {
    try {
      // 检查AI服务
      const aiHealth = await this.aiService.healthCheck();

      // 检查数据库连接
      await this.prisma.$queryRaw`SELECT 1`;

      const services = {
        parsing: true, // 文档解析功能
        aiAnalysis: aiHealth.status !== 'critical',
        database: true
      };

      const allHealthy = Object.values(services).every(service => service);
      const status = allHealthy ? 'healthy' as const :
                   services.database ? 'degraded' as const : 'critical' as const;

      return { status, services };

    } catch (error) {
      console.error('Report analysis service health check failed:', error);
      return {
        status: 'critical',
        services: {
          parsing: false,
          aiAnalysis: false,
          database: false
        }
      };
    }
  }
}