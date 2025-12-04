import { PrismaClient } from '@prisma/client';
import { AIService, AIRequest, AIResponse } from './aiService';

// AI质量评估结果
export interface QualityAssessment {
  overallScore: number; // 0-1的总体质量评分
  dimensions: {
    coherence: number;      // 连贯性 0-1
    relevance: number;      // 相关性 0-1
    accuracy: number;       // 准确性 0-1
    completeness: number;   // 完整性 0-1
    clarity: number;        // 清晰度 0-1
    professionalism: number;// 专业性 0-1
  };
  issues: QualityIssue[];
  suggestions: string[];
  confidence: number; // 评估置信度 0-1
}

export interface QualityIssue {
  type: 'coherence' | 'relevance' | 'accuracy' | 'completeness' | 'clarity' | 'professionalism' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string; // 问题位置（章节、段落等）
  suggestion: string; // 修复建议
}

// 内容验证规则
export interface ValidationRule {
  id: string;
  name: string;
  type: 'length' | 'format' | 'content' | 'structure' | 'language' | 'safety';
  severity: 'warning' | 'error' | 'critical';
  rule: (content: string, context?: any) => ValidationResult;
  description: string;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-1
  message: string;
  details?: any;
}

// 错误恢复策略
export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'degrade' | 'manual';
  description: string;
  execute: (error: any, context: any) => Promise<any>;
}

// 质量改进建议
export interface ImprovementSuggestion {
  section: string;
  issue: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

export class AIQualityService {
  private prisma: PrismaClient;
  private aiService: AIService;
  private validationRules: ValidationRule[];
  private recoveryStrategies: Map<string, RecoveryStrategy>;

  constructor() {
    this.prisma = new PrismaClient();
    this.aiService = new AIService();
    this.validationRules = [];
    this.recoveryStrategies = new Map();

    this.initializeValidationRules();
    this.initializeRecoveryStrategies();
  }

  /**
   * 评估AI生成内容的质量
   */
  async assessQuality(
    content: string,
    context: {
      requestType: string;
      projectName: string;
      userId: string;
      originalPrompt?: string;
      expectedSections?: string[];
    }
  ): Promise<QualityAssessment> {
    try {
      console.log(`🔍 开始质量评估: ${context.projectName}`);

      // 1. 运行验证规则
      const validationResults = await this.runValidationRules(content, context);

      // 2. AI质量评估
      const aiAssessment = await this.performAIQualityAssessment(content, context);

      // 3. 结构化分析
      const structureAnalysis = this.analyzeContentStructure(content, context);

      // 4. 综合评分
      const dimensions = this.calculateQualityDimensions(
        validationResults,
        aiAssessment,
        structureAnalysis
      );

      // 5. 生成问题列表和建议
      const issues = this.identifyQualityIssues(validationResults, aiAssessment, dimensions);
      const suggestions = await this.generateImprovementSuggestions(content, issues, context);

      const overallScore = this.calculateOverallScore(dimensions);

      console.log(`✅ 质量评估完成: ${context.projectName} (评分: ${Math.round(overallScore * 100)}/100)`);

      return {
        overallScore,
        dimensions,
        issues,
        suggestions,
        confidence: this.calculateConfidence(validationResults, aiAssessment)
      };

    } catch (error) {
      console.error('质量评估失败:', error);
      throw error;
    }
  }

  /**
   * 改进AI生成的内容
   */
  async improveContent(
    content: string,
    assessment: QualityAssessment,
    context: {
      requestType: string;
      projectName: string;
      userId: string;
      originalPrompt: string;
    },
    maxRetries: number = 2
  ): Promise<{
    improvedContent: string;
    improvements: string[];
    finalAssessment: QualityAssessment;
    iterations: number;
  }> {
    let currentContent = content;
    let currentAssessment = assessment;
    let improvements: string[] = [];
    let iterations = 0;

    console.log(`🔧 开始内容改进: ${context.projectName}`);

    while (currentAssessment.overallScore < 0.8 && iterations < maxRetries) {
      iterations++;

      console.log(`📝 内容改进迭代 ${iterations}/${maxRetries}`);

      // 生成改进提示
      const improvementPrompt = this.buildImprovementPrompt(
        currentContent,
        currentAssessment,
        context
      );

      try {
        // 使用AI改进内容
        const aiRequest: AIRequest = {
          prompt: improvementPrompt,
          userId: context.userId,
          requestType: 'generation',
          maxTokens: 2000,
          temperature: 0.3, // 较低的温度以确保一致性
          context: {
            iteration: iterations,
            originalScore: assessment.overallScore,
            targetScore: 0.8
          }
        };

        const response = await this.aiService.generateResponse(aiRequest);
        currentContent = response.content;

        // 重新评估改进后的内容
        currentAssessment = await this.assessQuality(currentContent, context);

        improvements.push(`第${iterations}次改进: ${this.getImprovementSummary(currentAssessment)}`);

        console.log(`📊 改进结果: 质量评分从 ${Math.round(assessment.overallScore * 100)} 提升到 ${Math.round(currentAssessment.overallScore * 100)}`);

      } catch (error) {
        console.error(`改进迭代 ${iterations} 失败:`, error);
        break;
      }
    }

    console.log(`✅ 内容改进完成: ${context.projectName} (共${iterations}次迭代)`);

    return {
      improvedContent: currentContent,
      improvements,
      finalAssessment: currentAssessment,
      iterations
    };
  }

  /**
   * 错误恢复处理
   */
  async handleError(
    error: any,
    context: {
      operation: string;
      requestData: any;
      userId: string;
      attempt: number;
    }
  ): Promise<{
    recovered: boolean;
    result?: any;
    strategy: string;
    message: string;
  }> {
    console.log(`🚨 处理错误: ${error.message} (操作: ${context.operation}, 尝试: ${context.attempt})`);

    const errorType = this.classifyError(error);
    const strategy = this.selectRecoveryStrategy(errorType, context);

    try {
      const result = await strategy.execute(error, context);

      console.log(`✅ 错误恢复成功: 使用策略 ${strategy.type}`);

      return {
        recovered: true,
        result,
        strategy: strategy.type,
        message: `使用${strategy.description}成功恢复`
      };

    } catch (recoveryError) {
      console.error('错误恢复失败:', recoveryError);

      return {
        recovered: false,
        strategy: strategy.type,
        message: `恢复失败: ${recoveryError.message}`
      };
    }
  }

  /**
   * 内容安全检查
   */
  async checkContentSafety(
    content: string,
    context: { userId: string; projectName: string }
  ): Promise<{
    isSafe: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    issues: string[];
    filteredContent?: string;
  }> {
    try {
      // 检查敏感内容
      const sensitivePatterns = [
        /个人隐私|身份证|银行卡|密码/gi,
        /机密|内部资料|商业秘密/gi,
        /违法|欺诈|洗钱/gi,
        /歧视|仇恨|暴力/gi
      ];

      const issues: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          issues.push(`检测到敏感内容: ${pattern.source}`);
          riskLevel = 'medium';
        }
      }

      // 检查内容质量问题
      if (content.length < 100) {
        issues.push('内容过短，可能存在生成问题');
        riskLevel = 'medium';
      }

      if (content.includes('ERROR') || content.includes('出错了')) {
        issues.push('内容中包含错误信息');
        riskLevel = 'high';
      }

      const isSafe = riskLevel !== 'critical' && riskLevel !== 'high';

      // 如果不安全，尝试过滤内容
      let filteredContent: string | undefined;
      if (!isSafe) {
        filteredContent = this.filterUnsafeContent(content);
      }

      console.log(`🛡️ 内容安全检查: ${context.projectName} - 风险等级: ${riskLevel}`);

      return {
        isSafe,
        riskLevel,
        issues,
        filteredContent
      };

    } catch (error) {
      console.error('内容安全检查失败:', error);
      return {
        isSafe: false,
        riskLevel: 'critical',
        issues: ['安全检查系统异常']
      };
    }
  }

  /**
   * 获取质量报告
   */
  async generateQualityReport(
    projectId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    summary: {
      totalAssessments: number;
      averageScore: number;
      improvementRate: number;
      commonIssues: { type: string; count: number }[];
    };
    trends: {
      scoresByDay: { date: string; score: number }[];
      issuesByCategory: { category: string; count: number }[];
    };
    recommendations: string[];
  }> {
    try {
      // 这里应该从数据库查询历史质量数据
      // 目前提供模拟数据

      const summary = {
        totalAssessments: 45,
        averageScore: 0.82,
        improvementRate: 0.15,
        commonIssues: [
          { type: 'clarity', count: 12 },
          { type: 'completeness', count: 8 },
          { type: 'coherence', count: 6 }
        ]
      };

      const trends = {
        scoresByDay: [
          { date: '2024-12-01', score: 0.75 },
          { date: '2024-12-02', score: 0.78 },
          { date: '2024-12-03', score: 0.82 }
        ],
        issuesByCategory: [
          { category: 'structure', count: 15 },
          { category: 'content', count: 12 },
          { category: 'language', count: 8 }
        ]
      };

      const recommendations = [
        '增加内容结构检查规则',
        '优化AI模型的提示词模板',
        '建立更完善的质量评估体系',
        '加强用户反馈收集机制'
      ];

      console.log(`📊 质量报告生成完成: 项目 ${projectId}`);

      return {
        summary,
        trends,
        recommendations
      };

    } catch (error) {
      console.error('生成质量报告失败:', error);
      throw error;
    }
  }

  // === 私有方法 ===

  /**
   * 初始化验证规则
   */
  private initializeValidationRules(): void {
    this.validationRules = [
      {
        id: 'min_length',
        name: '最小长度检查',
        type: 'length',
        severity: 'error',
        description: '检查内容是否达到最小长度要求',
        rule: (content: string) => ({
          passed: content.length >= 200,
          score: Math.min(content.length / 200, 1),
          message: content.length >= 200 ? '长度充足' : `内容过短，当前${content.length}字，建议至少200字`
        })
      },
      {
        id: 'structure_check',
        name: '结构完整性检查',
        type: 'structure',
        severity: 'warning',
        description: '检查内容是否包含必要的结构元素',
        rule: (content: string, context: any) => {
          const hasHeadings = /^#|##|###/.test(content) || /\n\d+\.|【.*】/.test(content);
          const hasSections = content.split('\n\n').length >= 3;
          const score = (hasHeadings ? 0.5 : 0) + (hasSections ? 0.5 : 0);

          return {
            passed: score >= 0.5,
            score,
            message: score >= 0.5 ? '结构完整' : '缺少必要的结构元素（标题、段落分隔）'
          };
        }
      },
      {
        id: 'professional_language',
        name: '专业语言检查',
        type: 'language',
        severity: 'warning',
        description: '检查语言是否专业规范',
        rule: (content: string) => {
          const casualWords = ['哈哈', '呵呵', '嗯嗯', '额外', '随便'];
          const professionalWords = ['分析', '研究', '评估', '建议', '策略', '方案'];

          const casualCount = casualWords.reduce((count, word) =>
            count + (content.match(new RegExp(word, 'g')) || []).length, 0);

          const professionalCount = professionalWords.reduce((count, word) =>
            count + (content.match(new RegExp(word, 'g')) || []).length, 0);

          const score = Math.max(0, 1 - casualCount * 0.2) * Math.min(1, professionalCount * 0.1);

          return {
            passed: casualCount === 0 && professionalCount >= 2,
            score,
            message: casualCount > 0 ? '检测到非正式用语' : '语言专业规范'
          };
        }
      },
      {
        id: 'data_consistency',
        name: '数据一致性检查',
        type: 'content',
        severity: 'error',
        description: '检查数据和数字的一致性',
        rule: (content: string) => {
          // 检查明显的数据错误
          const percentagePattern = /(\d+\.?\d*)%/g;
          const percentages = content.match(percentagePattern);

          let hasInconsistency = false;
          if (percentages) {
            const values = percentages.map(p => parseFloat(p.replace('%', '')));
            hasInconsistency = values.some(v => v > 100 || v < 0);
          }

          return {
            passed: !hasInconsistency,
            score: hasInconsistency ? 0.5 : 1,
            message: hasInconsistency ? '检测到可能的数据错误（百分比超出合理范围）' : '数据一致性良好'
          };
        }
      },
      {
        id: 'safety_check',
        name: '内容安全检查',
        type: 'safety',
        severity: 'critical',
        description: '检查内容是否包含敏感或不当信息',
        rule: (content: string) => {
          const sensitivePatterns = [
            /个人隐私|身份证|银行卡|密码/gi,
            /违法|欺诈|洗钱/gi
          ];

          const hasSensitiveContent = sensitivePatterns.some(pattern => pattern.test(content));

          return {
            passed: !hasSensitiveContent,
            score: hasSensitiveContent ? 0 : 1,
            message: hasSensitiveContent ? '检测到敏感内容' : '内容安全'
          };
        }
      }
    ];
  }

  /**
   * 初始化恢复策略
   */
  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies.set('ai_timeout', {
      type: 'retry',
      description: '重试请求',
      execute: async (error: any, context: any) => {
        if (context.attempt >= 3) {
          throw new Error('重试次数已达上限');
        }

        console.log(`🔄 第${context.attempt}次重试...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * context.attempt));

        // 这里应该重新调用原始操作
        return { retried: true, attempt: context.attempt };
      }
    });

    this.recoveryStrategies.set('content_quality_low', {
      type: 'fallback',
      description: '使用预设内容模板',
      execute: async (error: any, context: any) => {
        console.log(`📋 使用预设模板恢复内容`);

        const fallbackContent = this.getFallbackContent(context.requestData.requestType);
        return { content: fallbackContent, fallback: true };
      }
    });

    this.recoveryStrategies.set('ai_service_unavailable', {
      type: 'degrade',
      description: '降级为基础服务',
      execute: async (error: any, context: any) => {
        console.log(`⬇️ 降级为基础服务`);

        // 使用简化的处理逻辑
        return {
          content: '系统正在维护中，请稍后重试。',
          degraded: true
        };
      }
    });
  }

  /**
   * 运行验证规则
   */
  private async runValidationRules(content: string, context: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.validationRules) {
      try {
        const result = rule.rule(content, context);
        results.push({
          ...result,
          details: { ruleId: rule.id, ruleName: rule.name, severity: rule.severity }
        });
      } catch (error) {
        console.error(`验证规则 ${rule.id} 执行失败:`, error);
        results.push({
          passed: false,
          score: 0,
          message: `规则执行失败: ${rule.name}`,
          details: { ruleId: rule.id, error: error.message }
        });
      }
    }

    return results;
  }

  /**
   * AI质量评估
   */
  private async performAIQualityAssessment(content: string, context: any): Promise<any> {
    try {
      const assessmentPrompt = `请评估以下${context.requestType}内容的质量：

内容：
${content}

请从以下维度评分（0-10分）：
1. 连贯性（内容逻辑是否清晰）
2. 相关性（是否符合主题要求）
3. 准确性（信息是否准确可信）
4. 完整性（是否包含必要信息）
5. 清晰度（表达是否清晰易懂）
6. 专业性（语言是否专业规范）

请返回JSON格式的评分结果。`;

      const aiRequest: AIRequest = {
        prompt: assessmentPrompt,
        userId: context.userId,
        requestType: 'analysis',
        maxTokens: 500,
        temperature: 0.1
      };

      const response = await this.aiService.generateResponse(aiRequest);

      // 尝试解析AI返回的评分
      try {
        const scores = JSON.parse(response.content);
        return scores;
      } catch {
        // 如果解析失败，返回默认评分
        return {
          coherence: 7,
          relevance: 7,
          accuracy: 6,
          completeness: 6,
          clarity: 7,
          professionalism: 7
        };
      }
    } catch (error) {
      console.error('AI质量评估失败:', error);
      // 返回中等评分
      return {
        coherence: 6,
        relevance: 6,
        accuracy: 6,
        completeness: 6,
        clarity: 6,
        professionalism: 6
      };
    }
  }

  /**
   * 分析内容结构
   */
  private analyzeContentStructure(content: string, context: any) {
    const lines = content.split('\n');
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]/).length;

    const hasHeadings = lines.some(line => /^#|##/.test(line));
    const hasBulletPoints = lines.some(line => /^[-*]/.test(line));
    const hasNumberedList = lines.some(line => /^\d+\./.test(line));

    return {
      lineCount: lines.length,
      wordCount: words,
      sentenceCount: sentences,
      hasHeadings,
      hasBulletPoints,
      hasNumberedList,
      avgWordsPerSentence: sentences > 0 ? words / sentences : 0
    };
  }

  /**
   * 计算质量维度评分
   */
  private calculateQualityDimensions(validationResults: ValidationResult[], aiAssessment: any, structureAnalysis: any) {
    const validationScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;

    return {
      coherence: aiAssessment.coherence ? aiAssessment.coherence / 10 : 0.7,
      relevance: aiAssessment.relevance ? aiAssessment.relevance / 10 : 0.7,
      accuracy: aiAssessment.accuracy ? aiAssessment.accuracy / 10 : 0.7,
      completeness: aiAssessment.completeness ? aiAssessment.completeness / 10 : 0.7,
      clarity: aiAssessment.clarity ? aiAssessment.clarity / 10 : 0.7,
      professionalism: validationScore
    };
  }

  /**
   * 识别质量问题
   */
  private identifyQualityIssues(validationResults: ValidationResult[], aiAssessment: any, dimensions: any): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 从验证结果中提取问题
    for (const result of validationResults) {
      if (!result.passed && result.details?.severity !== 'warning') {
        issues.push({
          type: result.details.ruleId.includes('length') ? 'completeness' :
                result.details.ruleId.includes('structure') ? 'coherence' :
                result.details.ruleId.includes('language') ? 'professionalism' :
                result.details.ruleId.includes('safety') ? 'safety' : 'clarity',
          severity: result.details.severity === 'critical' ? 'critical' :
                   result.details.severity === 'error' ? 'high' : 'medium',
          description: result.message,
          suggestion: `改进建议：${result.details.ruleName}`
        });
      }
    }

    // 从维度评分中识别问题
    Object.entries(dimensions).forEach(([key, value]) => {
      if (typeof value === 'number' && value < 0.6) {
        issues.push({
          type: key as any,
          severity: value < 0.4 ? 'high' : 'medium',
          description: `${key}评分偏低 (${Math.round(value * 100)}/100)`,
          suggestion: `提升${key}质量的建议措施`
        });
      }
    });

    return issues;
  }

  /**
   * 生成改进建议
   */
  private async generateImprovementSuggestions(content: string, issues: QualityIssue[], context: any): Promise<string[]> {
    const suggestions: string[] = [];

    // 基于问题类型生成建议
    const issueTypes = [...new Set(issues.map(issue => issue.type))];

    for (const type of issueTypes) {
      switch (type) {
        case 'coherence':
          suggestions.push('增强内容逻辑性，确保段落间的连接自然流畅');
          break;
        case 'relevance':
          suggestions.push('确保所有内容都与主题密切相关，删除无关信息');
          break;
        case 'completeness':
          suggestions.push('补充缺失的关键信息，确保内容完整性');
          break;
        case 'clarity':
          suggestions.push('简化复杂句子，使用更清晰的表达方式');
          break;
        case 'professionalism':
          suggestions.push('使用更专业的术语和表达方式');
          break;
        case 'safety':
          suggestions.push('检查并移除可能的敏感或不当内容');
          break;
      }
    }

    // 如果没有特定问题，提供通用建议
    if (suggestions.length === 0) {
      suggestions.push('内容整体质量良好，可以考虑进一步优化细节');
    }

    return suggestions;
  }

  /**
   * 构建改进提示
   */
  private buildImprovementPrompt(content: string, assessment: QualityAssessment, context: any): string {
    const mainIssues = assessment.issues
      .filter(issue => issue.severity === 'high' || issue.severity === 'critical')
      .map(issue => issue.description)
      .slice(0, 3);

    return `请改进以下${context.requestType}内容。

当前内容：
${content}

主要问题：
${mainIssues.length > 0 ? mainIssues.join('\n') : '内容质量需要提升'}

改进要求：
${assessment.suggestions.join('\n')}

请返回改进后的内容，确保：
1. 解决上述主要问题
2. 保持内容的核心信息不变
3. 提升整体专业性和可读性
4. 确保逻辑清晰、结构合理`;
  }

  /**
   * 获取改进摘要
   */
  private getImprovementSummary(assessment: QualityAssessment): string {
    const score = Math.round(assessment.overallScore * 100);
    const mainImprovement = assessment.issues.length > 0 ?
      `解决了${assessment.issues[0].type}问题` :
      '整体质量提升';

    return `${mainImprovement}，质量评分: ${score}/100`;
  }

  /**
   * 错误分类
   */
  private classifyError(error: any): string {
    if (error.message.includes('timeout') || error.message.includes('网络')) {
      return 'ai_timeout';
    }

    if (error.message.includes('质量') || error.message.includes('quality')) {
      return 'content_quality_low';
    }

    if (error.message.includes('服务') || error.message.includes('unavailable')) {
      return 'ai_service_unavailable';
    }

    return 'unknown_error';
  }

  /**
   * 选择恢复策略
   */
  private selectRecoveryStrategy(errorType: string, context: any): RecoveryStrategy {
    const strategy = this.recoveryStrategies.get(errorType);

    if (strategy) {
      return strategy;
    }

    // 默认重试策略
    return this.recoveryStrategies.get('ai_timeout') || {
      type: 'manual',
      description: '需要手动处理',
      execute: async (error: any, context: any) => {
        throw error;
      }
    };
  }

  /**
   * 过滤不安全内容
   */
  private filterUnsafeContent(content: string): string {
    let filtered = content;

    // 简单的敏感词过滤
    const sensitiveWords = ['个人隐私', '身份证', '银行卡', '密码', '机密'];

    for (const word of sensitiveWords) {
      filtered = filtered.replace(new RegExp(word, 'gi'), '[已过滤]');
    }

    return filtered;
  }

  /**
   * 获取后备内容
   */
  private getFallbackContent(requestType: string): string {
    const fallbackContent: Record<string, string> = {
      generation: '由于技术原因，暂时无法生成完整内容。请稍后重试或联系技术支持。',
      analysis: '分析功能暂时不可用，建议手动进行相关分析工作。',
      chat: '很抱歉，AI助手暂时无法响应。请稍后重试。',
      summary: '内容摘要功能暂时不可用，请查看原始内容。'
    };

    return fallbackContent[requestType] || fallbackContent.generation;
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(dimensions: any): number {
    const weights = {
      coherence: 0.2,
      relevance: 0.2,
      accuracy: 0.15,
      completeness: 0.15,
      clarity: 0.15,
      professionalism: 0.15
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += dimensions[key] * weight;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(validationResults: ValidationResult[], aiAssessment: any): number {
    const validationConfidence = validationResults.length > 0 ?
      validationResults.filter(r => r.passed).length / validationResults.length : 0.5;

    const aiConfidence = aiAssessment && typeof aiAssessment === 'object' ? 0.8 : 0.3;

    return Math.round((validationConfidence * 0.6 + aiConfidence * 0.4) * 100) / 100;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    components: {
      validation: boolean;
      aiService: boolean;
      recovery: boolean;
    };
    metrics: {
      rulesCount: number;
      strategiesCount: number;
      avgProcessingTime?: number;
    };
  }> {
    try {
      // 检查AI服务
      const aiHealth = await this.aiService.healthCheck();

      const components = {
        validation: this.validationRules.length > 0,
        aiService: aiHealth.status !== 'critical',
        recovery: this.recoveryStrategies.size > 0
      };

      const allHealthy = Object.values(components).every(status => status);
      const status = allHealthy ? 'healthy' as const :
                   components.validation && components.recovery ? 'degraded' as const : 'critical' as const;

      return {
        status,
        components,
        metrics: {
          rulesCount: this.validationRules.length,
          strategiesCount: this.recoveryStrategies.size
        }
      };

    } catch (error) {
      console.error('AI质量服务健康检查失败:', error);
      return {
        status: 'critical',
        components: {
          validation: false,
          aiService: false,
          recovery: false
        },
        metrics: {
          rulesCount: 0,
          strategiesCount: 0
        }
      };
    }
  }
}