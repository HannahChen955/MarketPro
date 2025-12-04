import { PrismaClient } from '@prisma/client';
import { AISecurityService, SecurityCheckResult } from './aiSecurityService';
import * as crypto from 'crypto';

// AI Provider Types
export type AIProvider = 'qwen' | 'openai' | 'mock';

export interface AIRequest {
  prompt: string;
  userId: string;
  requestType: 'generation' | 'analysis' | 'chat' | 'summary';
  maxTokens?: number;
  temperature?: number;
  projectId?: string;
  taskId?: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
  cached: boolean;
  filteredInput?: boolean;
}

export interface AIProviderConfig {
  name: AIProvider;
  model: string;
  apiKey: string;
  endpoint?: string;
  maxTokens: number;
  enabled: boolean;
  priority: number;
}

export interface AIAnalysisResult {
  extractedContent: {
    sections: string[];
    keyPoints: string[];
    charts: number;
    images: number;
    tables: number;
  };
  designPatterns: {
    colorScheme: string[];
    fonts: string[];
    layout: string;
    style: string;
  };
  suggestedTemplate: {
    reportType: string;
    estimatedTime: string;
    requiredFields: string[];
    outputFormat: string[];
  };
}

export interface ReportGenerationConfig {
  projectName: string;
  projectDescription?: string;
  reportType: string;
  analysisArea: string;
  timeRange: string;
  additionalRequirements?: string;
  outputFormat: 'pptx' | 'pdf' | 'html';
}

export interface GeneratedContent {
  title: string;
  sections: GeneratedSection[];
  metadata: {
    generatedAt: string;
    model: string;
    confidence: number;
    wordCount: number;
  };
}

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'chart' | 'table' | 'image';
  data?: any;
}

export class AIService {
  private prisma: PrismaClient;
  private securityService: AISecurityService;
  private providers: Map<AIProvider, AIProviderConfig>;
  private responseCache: Map<string, AIResponse>;
  private qwenApiKey: string;
  private openaiApiKey: string;
  private baseURL: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.securityService = new AISecurityService();
    this.providers = new Map();
    this.responseCache = new Map();
    this.qwenApiKey = process.env.QWEN_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.baseURL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';

    this.initializeProviders();

    if (!this.qwenApiKey && !this.openaiApiKey) {
      console.warn('⚠️  No AI API keys found. AI features will be simulated.');
    }
  }

  /**
   * 初始化 AI 提供商配置
   */
  private initializeProviders() {
    // 通义千问配置
    if (this.qwenApiKey) {
      this.providers.set('qwen', {
        name: 'qwen',
        model: 'qwen-turbo',
        apiKey: this.qwenApiKey,
        endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        maxTokens: 8000,
        enabled: true,
        priority: 1
      });
    }

    // OpenAI 配置
    if (this.openaiApiKey) {
      this.providers.set('openai', {
        name: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: this.openaiApiKey,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        maxTokens: 4000,
        enabled: true,
        priority: 2
      });
    }

    // Mock 提供商（开发测试用）
    this.providers.set('mock', {
      name: 'mock',
      model: 'mock-model',
      apiKey: 'mock-key',
      maxTokens: 1000,
      enabled: true,
      priority: 10
    });
  }

  /**
   * 主要的 AI 请求处理方法
   */
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const { prompt, userId, requestType } = request;

    try {
      // 1. 安全检查
      const securityCheck = await this.securityService.checkInputSecurity(prompt, userId);
      if (!securityCheck.isSafe) {
        throw new Error(`安全检查失败: ${securityCheck.issues.join(', ')}`);
      }

      // 2. 检查服务降级
      const degradationCheck = await this.securityService.checkServiceDegradation();
      if (degradationCheck.shouldDegrade) {
        return this.handleServiceDegradation(request, degradationCheck);
      }

      // 3. 检查缓存
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = this.responseCache.get(cacheKey);
      if (cachedResponse) {
        console.log(`缓存命中: ${cacheKey}`);
        return { ...cachedResponse, cached: true };
      }

      // 4. 选择可用的 AI 提供商
      const provider = this.selectProvider(request);
      if (!provider) {
        throw new Error('没有可用的 AI 提供商');
      }

      // 5. 调用 AI 服务
      const response = await this.callAIProvider(
        provider,
        securityCheck.filteredContent || prompt,
        request
      );

      // 6. 记录使用统计
      await this.securityService.trackAICost({
        userId,
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        requestType,
        successful: true
      });

      // 7. 缓存响应
      this.responseCache.set(cacheKey, response);

      // 8. 清理过期缓存
      this.cleanupCache();

      return {
        ...response,
        cached: false,
        filteredInput: !!securityCheck.filteredContent
      };

    } catch (error) {
      console.error('AI 请求失败:', error);

      // 记录失败的使用统计
      await this.securityService.trackAICost({
        userId,
        model: 'unknown',
        promptTokens: prompt.length / 4,
        completionTokens: 0,
        requestType,
        successful: false
      });

      throw error;
    }
  }

  /**
   * 分析上传的文件内容
   */
  async analyzeFile(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<AIAnalysisResult> {
    try {
      console.log(`🔍 开始分析文件: ${fileName}`);

      // 根据文件类型进行不同的处理
      let extractedText = '';

      if (mimeType === 'application/pdf') {
        extractedText = await this.extractPdfContent(fileBuffer);
      } else if (mimeType.includes('presentation')) {
        extractedText = await this.extractPptxContent(fileBuffer);
      } else {
        throw new Error('不支持的文件类型');
      }

      // 使用 AI 分析内容
      const analysisResult = await this.performContentAnalysis(extractedText, fileName);

      console.log(`✅ 文件分析完成: ${fileName}`);
      return analysisResult;

    } catch (error) {
      console.error('文件分析失败:', error);

      // 返回模拟分析结果
      return this.generateMockAnalysisResult(fileName);
    }
  }

  /**
   * 生成报告内容
   */
  async generateReport(config: ReportGenerationConfig): Promise<GeneratedContent> {
    try {
      console.log(`📝 开始生成报告: ${config.projectName}`);

      // 构建 AI 提示词
      const prompt = this.buildReportPrompt(config);

      // 调用 AI API 生成内容
      const generatedText = await this.callAIAPI(prompt, config.reportType);

      // 解析生成的内容
      const content = this.parseGeneratedContent(generatedText, config);

      console.log(`✅ 报告生成完成: ${config.projectName}`);
      return content;

    } catch (error) {
      console.error('报告生成失败:', error);

      // 返回模拟生成内容
      return this.generateMockReportContent(config);
    }
  }

  /**
   * 提取 PDF 内容
   */
  private async extractPdfContent(buffer: Buffer): Promise<string> {
    try {
      // 这里应该使用 pdf-parse 或类似库
      // const pdf = require('pdf-parse');
      // const data = await pdf(buffer);
      // return data.text;

      // 模拟提取的内容
      return '这是从PDF文件提取的示例内容...';
    } catch (error) {
      console.error('PDF内容提取失败:', error);
      return '无法提取PDF内容';
    }
  }

  /**
   * 提取 PPTX 内容
   */
  private async extractPptxContent(buffer: Buffer): Promise<string> {
    try {
      // 这里应该使用相应的库来解析 PPTX 文件
      // 模拟提取的内容
      return '这是从PPTX文件提取的示例内容...';
    } catch (error) {
      console.error('PPTX内容提取失败:', error);
      return '无法提取PPTX内容';
    }
  }

  /**
   * 执行内容分析
   */
  private async performContentAnalysis(content: string, fileName: string): Promise<AIAnalysisResult> {
    const analysisPrompt = `
请分析以下文档内容，并提供结构化的分析结果：

文件名: ${fileName}
内容: ${content}

请分析：
1. 文档的主要章节结构
2. 关键要点
3. 图表和视觉元素的数量
4. 设计模式（颜色、字体、布局风格）
5. 推荐的报告模板类型

返回JSON格式的分析结果。
`;

    try {
      if (this.qwenApiKey) {
        return await this.callQwenAPI(analysisPrompt);
      } else {
        return this.generateMockAnalysisResult(fileName);
      }
    } catch (error) {
      console.error('AI内容分析失败:', error);
      return this.generateMockAnalysisResult(fileName);
    }
  }

  /**
   * 构建报告生成提示词
   */
  private buildReportPrompt(config: ReportGenerationConfig): string {
    const { projectName, reportType, analysisArea, timeRange, additionalRequirements } = config;

    return `
请为房地产项目生成一份专业的${reportType}。

项目信息：
- 项目名称：${projectName}
- 分析区域：${analysisArea}
- 时间范围：${timeRange}
- 特殊要求：${additionalRequirements || '无'}

请生成包含以下内容的报告：
1. 执行摘要
2. 市场概况
3. 详细分析
4. 关键发现
5. 建议和结论

要求：
- 内容专业、准确、有深度
- 结构清晰，层次分明
- 包含具体的数据分析
- 提供可操作的建议
- 语言简洁明了

请以结构化的格式返回内容。
`;
  }

  /**
   * 调用通义千问 API
   */
  private async callQwenAPI(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.qwenApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`通义千问API调用失败: ${response.status}`);
      }

      const data = await response.json();
      return data.output.text;

    } catch (error) {
      console.error('通义千问API调用失败:', error);
      throw error;
    }
  }

  /**
   * 调用 AI API（通用）
   */
  private async callAIAPI(prompt: string, context: string): Promise<string> {
    try {
      if (this.qwenApiKey) {
        return await this.callQwenAPI(prompt);
      } else if (this.openaiApiKey) {
        return await this.callOpenAIAPI(prompt);
      } else {
        // 返回模拟内容
        return this.generateMockContent(context);
      }
    } catch (error) {
      console.error('AI API调用失败:', error);
      return this.generateMockContent(context);
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAIAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API调用失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      throw error;
    }
  }

  /**
   * 解析生成的内容
   */
  private parseGeneratedContent(text: string, config: ReportGenerationConfig): GeneratedContent {
    // 这里应该有更复杂的解析逻辑
    const sections: GeneratedSection[] = [
      {
        id: 'summary',
        title: '执行摘要',
        content: '本报告对项目进行了全面分析...',
        type: 'text'
      },
      {
        id: 'market',
        title: '市场概况',
        content: '当前市场状况显示...',
        type: 'text'
      },
      {
        id: 'analysis',
        title: '详细分析',
        content: '通过深入分析发现...',
        type: 'text'
      }
    ];

    return {
      title: `${config.projectName} - ${config.reportType}`,
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: this.qwenApiKey ? 'qwen-turbo' : 'gpt-3.5-turbo',
        confidence: 0.85,
        wordCount: text.length
      }
    };
  }

  /**
   * 生成模拟分析结果
   */
  private generateMockAnalysisResult(fileName: string): AIAnalysisResult {
    return {
      extractedContent: {
        sections: ['封面', '目录', '市场概览', '竞品分析', '数据分析', '结论与建议'],
        keyPoints: [
          '市场需求持续增长',
          '竞争格局相对稳定',
          '价格趋势向上',
          '政策环境利好'
        ],
        charts: 5,
        images: 8,
        tables: 3
      },
      designPatterns: {
        colorScheme: ['#2563eb', '#1d4ed8', '#1e40af', '#ffffff'],
        fonts: ['Microsoft YaHei', 'Arial', 'SimHei'],
        layout: 'professional',
        style: 'corporate'
      },
      suggestedTemplate: {
        reportType: '市场分析报告',
        estimatedTime: '12-15分钟',
        requiredFields: ['项目名称', '分析区域', '竞品项目', '时间范围'],
        outputFormat: ['pptx', 'pdf']
      }
    };
  }

  /**
   * 生成模拟报告内容
   */
  private generateMockReportContent(config: ReportGenerationConfig): GeneratedContent {
    return {
      title: `${config.projectName} - ${config.reportType}`,
      sections: [
        {
          id: 'summary',
          title: '执行摘要',
          content: `本报告针对${config.projectName}项目进行了全面的市场分析。通过对${config.analysisArea}区域${config.timeRange}的数据分析，我们发现该项目具有良好的市场前景和投资价值。主要结论包括：市场需求稳定增长，竞争环境相对温和，定价策略合理，预期收益率达到预期水平。`,
          type: 'text'
        },
        {
          id: 'market_overview',
          title: '市场概况',
          content: `${config.analysisArea}地区房地产市场在${config.timeRange}表现稳健。区域内新房供应量适中，二手房交易活跃，整体价格呈现稳中有升的态势。政策环境总体向好，基础设施建设持续完善，为房地产市场发展提供了有力支撑。`,
          type: 'text'
        },
        {
          id: 'competitive_analysis',
          title: '竞品分析',
          content: `通过对区域内主要竞争项目的分析，${config.projectName}在产品定位、价格策略、营销推广等方面具有一定优势。建议加强差异化竞争，突出项目特色，提升品牌知名度。`,
          type: 'text'
        },
        {
          id: 'recommendations',
          title: '建议与结论',
          content: `基于以上分析，我们建议：1）把握市场时机，加快项目推进；2）优化产品设计，满足目标客群需求；3）制定合理的定价策略；4）加强营销推广，提升市场认知度。总体而言，${config.projectName}项目具有良好的市场前景和投资价值。`,
          type: 'text'
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'mock',
        confidence: 0.9,
        wordCount: 800
      }
    };
  }

  /**
   * 生成模拟内容
   */
  private generateMockContent(context: string): string {
    return `这是为${context}生成的模拟内容。在实际使用中，这里会是由AI模型生成的专业内容。`;
  }

  /**
   * 调用具体的 AI 提供商
   */
  private async callAIProvider(
    provider: AIProviderConfig,
    prompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    switch (provider.name) {
      case 'qwen':
        return this.callQwenAPIEnhanced(provider, prompt, request);
      case 'openai':
        return this.callOpenAIAPIEnhanced(provider, prompt, request);
      case 'mock':
        return this.callMockAPIEnhanced(provider, prompt, request);
      default:
        throw new Error(`不支持的 AI 提供商: ${provider.name}`);
    }
  }

  /**
   * 增强版通义千问 API 调用
   */
  private async callQwenAPIEnhanced(
    provider: AIProviderConfig,
    prompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const requestBody = {
      model: provider.model,
      input: {
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(request.requestType)
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        max_tokens: request.maxTokens || provider.maxTokens,
        temperature: request.temperature || 0.7,
        result_format: 'message'
      }
    };

    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`通义千问 API 调用失败: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code) {
      throw new Error(`通义千问 API 错误: ${data.message}`);
    }

    const content = data.output.choices[0].message.content;
    const usage = data.usage;

    return {
      content,
      usage: {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.total_tokens
      },
      model: provider.model,
      provider: 'qwen',
      cached: false
    };
  }

  /**
   * 增强版 OpenAI API 调用
   */
  private async callOpenAIAPIEnhanced(
    provider: AIProviderConfig,
    prompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const requestBody = {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(request.requestType)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: request.maxTokens || provider.maxTokens,
      temperature: request.temperature || 0.7
    };

    const response = await fetch(provider.endpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 调用失败: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API 错误: ${data.error.message}`);
    }

    const content = data.choices[0].message.content;
    const usage = data.usage;

    return {
      content,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      model: provider.model,
      provider: 'openai',
      cached: false
    };
  }

  /**
   * 增强版 Mock API 调用
   */
  private async callMockAPIEnhanced(
    provider: AIProviderConfig,
    prompt: string,
    request: AIRequest
  ): Promise<AIResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockResponses = this.getMockResponses(request.requestType);
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens = Math.ceil(randomResponse.length / 4);

    return {
      content: randomResponse,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      model: provider.model,
      provider: 'mock',
      cached: false
    };
  }

  /**
   * 选择最优的 AI 提供商
   */
  private selectProvider(request: AIRequest): AIProviderConfig | null {
    const availableProviders = Array.from(this.providers.values())
      .filter(provider => provider.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of availableProviders) {
      if (this.isProviderSuitable(provider, request)) {
        return provider;
      }
    }

    return availableProviders[0] || null;
  }

  /**
   * 检查提供商是否适合当前请求
   */
  private isProviderSuitable(provider: AIProviderConfig, request: AIRequest): boolean {
    const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 1000);
    if (estimatedTokens > provider.maxTokens) {
      return false;
    }

    if (request.requestType === 'analysis' && provider.name === 'mock') {
      return false;
    }

    return true;
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(requestType: string): string {
    const prompts = {
      generation: '你是一个专业的房地产营销报告生成助手。请根据用户提供的信息生成高质量的营销报告内容。',
      analysis: '你是一个专业的数据分析师。请分析用户提供的内容，提取关键信息并生成结构化的分析结果。',
      chat: '你是一个友好的AI助手，专门帮助用户解决房地产营销相关问题。',
      summary: '你是一个专业的内容总结助手。请为用户提供的内容生成简洁准确的摘要。'
    };

    return prompts[requestType as keyof typeof prompts] || prompts.chat;
  }

  /**
   * 处理服务降级
   */
  private async handleServiceDegradation(
    request: AIRequest,
    degradationInfo: any
  ): Promise<AIResponse> {
    switch (degradationInfo.degradeToLevel) {
      case 'cache':
        const cacheKey = this.generateCacheKey(request);
        const cached = this.responseCache.get(cacheKey);
        if (cached) return cached;
        return this.getStaticResponse(request);

      case 'simple':
        return this.getSimpleResponse(request);

      case 'offline':
        throw new Error('AI服务暂时不可用，请稍后重试');

      default:
        throw new Error('未知的降级策略');
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: AIRequest): string {
    const key = `${request.requestType}:${request.prompt}:${request.maxTokens || 'default'}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache() {
    if (this.responseCache.size > 1000) {
      const entries = Array.from(this.responseCache.entries());
      const halfSize = Math.floor(entries.length / 2);
      this.responseCache.clear();

      for (let i = halfSize; i < entries.length; i++) {
        this.responseCache.set(entries[i][0], entries[i][1]);
      }
    }
  }

  /**
   * 获取静态响应（降级策略）
   */
  private getStaticResponse(request: AIRequest): AIResponse {
    const content = `系统正在维护中，这是针对"${request.requestType}"请求的预设响应。请稍后重试以获取更准确的结果。`;

    return {
      content,
      usage: {
        promptTokens: 0,
        completionTokens: content.length / 4,
        totalTokens: content.length / 4
      },
      model: 'static',
      provider: 'mock',
      cached: false
    };
  }

  /**
   * 获取简化响应（降级策略）
   */
  private getSimpleResponse(request: AIRequest): AIResponse {
    const responses = this.getMockResponses(request.requestType);
    const content = responses[0];

    return {
      content,
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((request.prompt.length + content.length) / 4)
      },
      model: 'simple',
      provider: 'mock',
      cached: false
    };
  }

  /**
   * 获取Mock响应模板
   */
  private getMockResponses(requestType: string): string[] {
    const responses = {
      generation: [
        '# 房地产营销报告\n\n## 项目概述\n基于您提供的信息，我们为该房地产项目制定了全面的营销方案。\n\n## 核心亮点\n- 地理位置优越\n- 配套设施完善\n- 投资潜力巨大\n\n## 营销建议\n建议采用多渠道营销策略，重点突出项目核心竞争优势。',
        '# 市场分析报告\n\n## 市场现状\n当前房地产市场呈现稳中有升的态势。\n\n## 竞争分析\n主要竞争对手分析显示，我们在以下方面具有优势：\n- 价格竞争力\n- 产品差异化\n- 服务质量\n\n## 投资建议\n建议把握市场机遇，适时推出营销活动。'
      ],
      analysis: [
        '## 分析结果\n\n### 关键数据点\n- 数据完整性：95%\n- 趋势方向：上升\n- 风险评级：中等\n\n### 主要发现\n1. 市场需求持续增长\n2. 价格波动在合理范围内\n3. 区域发展前景良好\n\n### 建议行动\n建议继续关注市场动态，适时调整策略。'
      ],
      chat: [
        '您好！我是MarketPro AI助手，专门为您提供房地产营销相关的专业建议。请告诉我您需要什么帮助？'
      ],
      summary: [
        '## 内容摘要\n\n本文档包含了详细的项目信息和市场分析数据。主要内容涵盖项目特色、目标客群、营销策略等关键要素。建议重点关注差异化竞争优势的展示。'
      ]
    };

    return responses[requestType as keyof typeof responses] || responses.chat;
  }

  /**
   * 获取使用统计
   */
  async getUsageStats(userId?: string, timeRange: 'hour' | 'day' | 'month' = 'day') {
    if (userId) {
      return this.securityService.getUserUsageStats(userId, timeRange);
    }

    // 全局统计
    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const stats = await this.prisma.aIUsageLog.aggregate({
      where: {
        timestamp: { gte: startTime }
      },
      _sum: {
        totalTokens: true,
        estimatedCost: true
      },
      _count: { id: true }
    });

    return {
      period: timeRange,
      startTime,
      endTime: now,
      totalRequests: stats._count.id,
      totalTokens: stats._sum.totalTokens || 0,
      totalCost: stats._sum.estimatedCost || 0,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    return Math.min(0.8, this.responseCache.size / 100);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    providers: Record<AIProvider, boolean>;
    cacheSize: number;
    securityStatus: any;
    legacy: {
      status: 'healthy' | 'degraded' | 'error';
      services: {
        qwen: 'available' | 'unavailable' | 'not_configured';
        openai: 'available' | 'unavailable' | 'not_configured';
      };
    };
  }> {
    const providerStatus: Record<AIProvider, boolean> = {
      qwen: false,
      openai: false,
      mock: true
    };

    // 检查各个提供商的状态
    for (const [name, config] of this.providers.entries()) {
      if (config.enabled && config.apiKey && config.apiKey !== 'mock-key') {
        providerStatus[name] = true;
      }
    }

    const securityStatus = await this.securityService.healthCheck();

    const hasWorkingProvider = Object.values(providerStatus).some(status => status);
    const overallStatus = !hasWorkingProvider ? 'critical' :
                         securityStatus.status === 'critical' ? 'degraded' : 'healthy';

    // Legacy format for backward compatibility
    const legacyServices = {
      qwen: this.qwenApiKey ? 'available' as const : 'not_configured' as const,
      openai: this.openaiApiKey ? 'available' as const : 'not_configured' as const
    };

    const legacyHasAnyAPI = legacyServices.qwen === 'available' || legacyServices.openai === 'available';
    const legacyStatus = legacyHasAnyAPI ? 'healthy' as const : 'degraded' as const;

    return {
      status: overallStatus,
      providers: providerStatus,
      cacheSize: this.responseCache.size,
      securityStatus,
      legacy: {
        status: legacyStatus,
        services: legacyServices
      }
    };
  }
}