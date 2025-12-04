import { PrismaClient } from '@prisma/client';

export interface SecurityCheckResult {
  isSafe: boolean;
  issues: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  filteredContent?: string;
}

export interface CostTracking {
  tokenUsed: number;
  estimatedCost: number;
  requestCount: number;
  userId: string;
  model: string;
  timestamp: Date;
}

export class AISecurityService {
  private prisma: PrismaClient;
  private dangerousPatterns: RegExp[];
  private sensitiveKeywords: string[];

  constructor() {
    this.prisma = new PrismaClient();

    // 危险模式检测
    this.dangerousPatterns = [
      /(?:exec|eval|system|shell|cmd)/gi,
      /(?:script|javascript|vbscript)/gi,
      /(?:delete|drop|truncate)\s+(?:table|database|from)/gi,
      /(?:select|insert|update)\s+.*(?:union|or|and)\s+/gi,
      /(?:<script|<iframe|<object|<embed)/gi,
      /(?:file:\/\/|ftp:\/\/|data:)/gi,
      /(?:\.\.\/|\.\.\\|%2e%2e)/gi,
    ];

    // 敏感关键词
    this.sensitiveKeywords = [
      '身份证', '密码', '银行卡', '信用卡', '手机号',
      'password', 'token', 'secret', 'key', 'auth',
      '私钥', '公钥', '证书', '签名', '加密'
    ];
  }

  /**
   * 安全检查用户输入内容
   */
  async checkInputSecurity(content: string, userId: string): Promise<SecurityCheckResult> {
    let issues: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let filteredContent = content;

    try {
      // 1. 检测危险模式
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(content)) {
          issues.push(`检测到潜在的恶意代码模式: ${pattern.source}`);
          riskLevel = 'high';
          // 过滤危险内容
          filteredContent = filteredContent.replace(pattern, '[已过滤]');
        }
      }

      // 2. 检测敏感信息
      for (const keyword of this.sensitiveKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          issues.push(`检测到敏感信息: ${keyword}`);
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }

      // 3. 检测超长内容（防止token滥用）
      if (content.length > 50000) {
        issues.push('输入内容过长，可能导致过度消耗AI资源');
        riskLevel = 'medium';
        // 截断内容
        filteredContent = content.substring(0, 50000) + '...[内容已截断]';
      }

      // 4. 检测重复请求（防止刷量）
      const recentRequests = await this.checkRecentRequests(userId, content);
      if (recentRequests > 5) {
        issues.push('检测到短时间内大量重复请求');
        riskLevel = 'high';
      }

      // 5. 检测用户频率限制
      const userRequestCount = await this.getUserRequestCount(userId);
      if (userRequestCount.hourly > 100) {
        issues.push('用户请求频率过高');
        riskLevel = 'critical';
      }

      // 记录安全检查日志
      await this.logSecurityCheck(userId, content, issues, riskLevel);

      const isSafe = riskLevel !== 'critical' && !issues.some(issue =>
        issue.includes('恶意代码') || issue.includes('频率过高')
      );

      return {
        isSafe,
        issues,
        riskLevel,
        filteredContent: isSafe ? filteredContent : undefined
      };

    } catch (error) {
      console.error('安全检查失败:', error);
      return {
        isSafe: false,
        issues: ['安全检查系统异常'],
        riskLevel: 'critical'
      };
    }
  }

  /**
   * AI成本跟踪
   */
  async trackAICost(params: {
    userId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    requestType: string;
    successful: boolean;
  }): Promise<CostTracking> {
    const { userId, model, promptTokens, completionTokens, requestType, successful } = params;

    // 计算成本（基于不同模型的定价）
    const costPerToken = this.getModelCostPerToken(model);
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = totalTokens * costPerToken;

    // 记录到数据库
    const costRecord = await this.prisma.aIUsageLog.create({
      data: {
        userId,
        model,
        requestType,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost,
        successful,
        timestamp: new Date(),
        metadata: {
          userAgent: 'MarketPro-AI',
          version: '1.0.0'
        }
      }
    });

    // 检查用户成本限额
    await this.checkUserCostLimits(userId);

    return {
      tokenUsed: totalTokens,
      estimatedCost,
      requestCount: 1,
      userId,
      model,
      timestamp: new Date()
    };
  }

  /**
   * 获取用户AI使用统计
   */
  async getUserUsageStats(userId: string, timeRange: 'hour' | 'day' | 'month' = 'day') {
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
        userId,
        timestamp: {
          gte: startTime
        }
      },
      _sum: {
        totalTokens: true,
        estimatedCost: true
      },
      _count: {
        id: true
      }
    });

    return {
      period: timeRange,
      startTime,
      endTime: now,
      totalRequests: stats._count.id,
      totalTokens: stats._sum.totalTokens || 0,
      totalCost: stats._sum.estimatedCost || 0,
      averageCostPerRequest: stats._count.id > 0
        ? (stats._sum.estimatedCost || 0) / stats._count.id
        : 0
    };
  }

  /**
   * 检查AI服务降级策略
   */
  async checkServiceDegradation(): Promise<{
    shouldDegrade: boolean;
    degradeToLevel: 'cache' | 'simple' | 'offline';
    reason: string;
  }> {
    try {
      // 检查系统负载
      const systemLoad = await this.getSystemLoad();

      // 检查AI服务可用性
      const aiServiceHealth = await this.checkAIServiceHealth();

      // 检查成本阈值
      const costThresholdExceeded = await this.checkGlobalCostThreshold();

      if (systemLoad > 0.9) {
        return {
          shouldDegrade: true,
          degradeToLevel: 'simple',
          reason: '系统负载过高'
        };
      }

      if (!aiServiceHealth.qwen && !aiServiceHealth.openai) {
        return {
          shouldDegrade: true,
          degradeToLevel: 'offline',
          reason: 'AI服务不可用'
        };
      }

      if (costThresholdExceeded) {
        return {
          shouldDegrade: true,
          degradeToLevel: 'cache',
          reason: '成本阈值超标'
        };
      }

      return {
        shouldDegrade: false,
        degradeToLevel: 'cache',
        reason: '服务正常'
      };

    } catch (error) {
      console.error('降级策略检查失败:', error);
      return {
        shouldDegrade: true,
        degradeToLevel: 'offline',
        reason: '系统异常'
      };
    }
  }

  /**
   * 私有方法：检查最近的重复请求
   */
  private async checkRecentRequests(userId: string, content: string): Promise<number> {
    const contentHash = this.hashContent(content);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await this.prisma.securityLog.count({
      where: {
        userId,
        contentHash,
        timestamp: {
          gte: oneHourAgo
        }
      }
    });

    return count;
  }

  /**
   * 私有方法：获取用户请求计数
   */
  private async getUserRequestCount(userId: string): Promise<{
    hourly: number;
    daily: number;
    monthly: number;
  }> {
    const now = new Date();

    const [hourly, daily, monthly] = await Promise.all([
      this.prisma.aIUsageLog.count({
        where: {
          userId,
          timestamp: {
            gte: new Date(now.getTime() - 60 * 60 * 1000)
          }
        }
      }),
      this.prisma.aIUsageLog.count({
        where: {
          userId,
          timestamp: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      this.prisma.aIUsageLog.count({
        where: {
          userId,
          timestamp: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return { hourly, daily, monthly };
  }

  /**
   * 私有方法：记录安全检查日志
   */
  private async logSecurityCheck(userId: string, content: string, issues: string[], riskLevel: string) {
    await this.prisma.securityLog.create({
      data: {
        userId,
        contentHash: this.hashContent(content),
        issues: issues.join('; '),
        riskLevel,
        timestamp: new Date(),
        blocked: riskLevel === 'critical'
      }
    });
  }

  /**
   * 私有方法：获取模型成本
   */
  private getModelCostPerToken(model: string): number {
    const costMap: Record<string, number> = {
      'qwen-turbo': 0.000008,    // 通义千问 Turbo
      'qwen-plus': 0.000020,     // 通义千问 Plus
      'gpt-3.5-turbo': 0.000015, // OpenAI GPT-3.5
      'gpt-4': 0.000060,         // OpenAI GPT-4
      'mock': 0.000001           // 模拟模型（测试用）
    };

    return costMap[model] || 0.000010; // 默认成本
  }

  /**
   * 私有方法：检查用户成本限额
   */
  private async checkUserCostLimits(userId: string) {
    const monthlyUsage = await this.getUserUsageStats(userId, 'month');

    // 普通用户月限额 $10
    const monthlyLimit = 10.0;

    if (monthlyUsage.totalCost > monthlyLimit) {
      console.warn(`用户 ${userId} 超出月成本限额: $${monthlyUsage.totalCost}`);

      // 这里可以触发通知或限制用户访问
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            costLimitExceeded: true,
            limitExceededDate: new Date().toISOString()
          }
        }
      });
    }
  }

  /**
   * 私有方法：获取系统负载
   */
  private async getSystemLoad(): Promise<number> {
    // 简化的系统负载检查
    const memUsage = process.memoryUsage();
    const usedMemoryMB = memUsage.heapUsed / 1024 / 1024;

    // 假设系统内存限制为 1GB
    const memoryLimit = 1024;
    const memoryUsageRatio = usedMemoryMB / memoryLimit;

    // 检查活跃任务数
    const activeTasks = await this.prisma.task.count({
      where: {
        status: {
          in: ['pending', 'running']
        }
      }
    });

    // 假设最大并发任务为 50
    const taskLoadRatio = activeTasks / 50;

    return Math.max(memoryUsageRatio, taskLoadRatio);
  }

  /**
   * 私有方法：检查AI服务健康状态
   */
  private async checkAIServiceHealth(): Promise<{
    qwen: boolean;
    openai: boolean;
  }> {
    // 这里应该实际调用AI服务的健康检查端点
    // 简化实现，基于环境变量判断
    return {
      qwen: !!process.env.QWEN_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    };
  }

  /**
   * 私有方法：检查全局成本阈值
   */
  private async checkGlobalCostThreshold(): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dailyCost = await this.prisma.aIUsageLog.aggregate({
      where: {
        timestamp: {
          gte: startOfDay
        }
      },
      _sum: {
        estimatedCost: true
      }
    });

    // 每日全局成本限制为 $100
    const dailyLimit = 100.0;
    return (dailyCost._sum.estimatedCost || 0) > dailyLimit;
  }

  /**
   * 私有方法：内容哈希
   */
  private hashContent(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    checks: {
      security: boolean;
      costTracking: boolean;
      degradation: any;
    };
  }> {
    try {
      const degradationCheck = await this.checkServiceDegradation();

      const checks = {
        security: true, // 安全模块始终可用
        costTracking: true, // 成本跟踪始终可用
        degradation: degradationCheck
      };

      const status = degradationCheck.shouldDegrade
        ? (degradationCheck.degradeToLevel === 'offline' ? 'critical' : 'degraded')
        : 'healthy';

      return { status, checks };
    } catch (error) {
      return {
        status: 'critical',
        checks: {
          security: false,
          costTracking: false,
          degradation: { shouldDegrade: true, degradeToLevel: 'offline', reason: '系统异常' }
        }
      };
    }
  }
}