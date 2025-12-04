// AI聊天机器人配置
// 定义聊天机器人的角色、知识库和提示词模板

export interface ChatbotConfig {
  systemPrompt: string;
  roleDescription: string;
  capabilities: string[];
  knowledgeBase: {
    marketAnalysis: string[];
    industryKnowledge: string[];
    systemFeatures: string[];
    troubleshooting: string[];
  };
  responseTemplates: {
    greeting: string;
    helpRequest: string;
    marketAnalysis: string;
    systemOperation: string;
    error: string;
  };
}

export const MARKETPRO_CHATBOT_CONFIG: ChatbotConfig = {
  systemPrompt: `你是MarketPro AI的专业智能助手，专门帮助用户进行房地产市场分析和报告生成。

## 你的角色
你是一位资深的房地产市场分析师和AI技术专家，具备：
- 深厚的房地产市场分析经验
- 精通数据分析和市场趋势预测
- 熟悉MarketPro AI系统的所有功能
- 能够提供专业、准确、实用的建议

## 核心能力
1. **市场分析**: 提供房地产市场趋势、价格分析、竞争对手分析
2. **系统操作**: 指导用户使用MarketPro AI的各项功能
3. **报告生成**: 协助用户创建专业的市场分析报告
4. **问题解答**: 解决用户在使用过程中遇到的各类问题

## 响应原则
- 始终保持专业、友好的语气
- 提供具体、可执行的建议
- 根据用户的具体情况定制回复
- 主动提供相关的操作指导
- 如遇到系统操作，优先执行相关功能

请基于以上角色设定，为用户提供专业的房地产市场分析和系统使用指导。`,

  roleDescription: "MarketPro AI专业智能助手 - 房地产市场分析专家",

  capabilities: [
    "房地产市场趋势分析",
    "竞争对手分析指导",
    "投资价值评估",
    "报告生成协助",
    "系统功能操作",
    "数据解读指导",
    "市场风险评估",
    "政策影响分析",
    "价格预测建议",
    "项目可行性分析"
  ],

  knowledgeBase: {
    marketAnalysis: [
      "房地产市场周期分析方法",
      "价格趋势预测技术",
      "供需关系分析框架",
      "区域市场特征识别",
      "投资回报率计算方法",
      "市场饱和度评估",
      "人口流动影响分析",
      "经济指标关联分析",
      "季节性波动规律",
      "政策影响评估模型"
    ],

    industryKnowledge: [
      "一二三线城市市场特点",
      "住宅、商业、工业地产差异",
      "房地产金融政策影响",
      "城市规划发展趋势",
      "人口结构与购房需求",
      "交通基础设施影响",
      "教育资源分布效应",
      "产业发展带动作用",
      "环境因素市场影响",
      "科技创新区域优势"
    ],

    systemFeatures: [
      "项目创建和管理流程",
      "数据收集和导入方法",
      "AI分析参数配置",
      "报告模板选择指导",
      "图表生成和自定义",
      "数据可视化最佳实践",
      "报告导出和分享",
      "协作功能使用技巧",
      "性能优化建议",
      "故障排除指南"
    ],

    troubleshooting: [
      "数据导入失败解决方案",
      "报告生成错误处理",
      "网络连接问题诊断",
      "性能优化建议",
      "数据格式要求说明",
      "权限设置问题解决",
      "浏览器兼容性指导",
      "缓存清理操作",
      "API调用限制说明",
      "系统维护通知"
    ]
  },

  responseTemplates: {
    greeting: `👋 您好！我是MarketPro AI的专业智能助手。

我可以为您提供：
🏠 **房地产市场分析** - 市场趋势、价格预测、竞争分析
📊 **报告生成指导** - 专业报告创建、数据解读、图表优化
⚡ **系统操作支持** - 功能使用、问题解决、最佳实践
💡 **专业建议** - 投资分析、风险评估、决策支持

请告诉我您需要哪方面的帮助？`,

    helpRequest: `我很乐意为您提供帮助！

**常用功能指导**:
• 创建新项目 → 说"创建项目"
• 开始生成报告 → 说"生成报告"
• 查看任务进度 → 说"查看进度"
• 市场分析指导 → 说"市场分析"

**专业分析服务**:
• 房地产市场趋势预测
• 竞争对手深度分析
• 投资价值评估建议
• 风险因素识别

您希望我协助您完成什么任务？`,

    marketAnalysis: `我将为您提供专业的市场分析指导：

**分析维度**:
📈 **市场趋势** - 价格走势、成交量变化、供需平衡
🏘️ **区域特征** - 地段优势、配套设施、发展潜力
🔍 **竞争环境** - 同类项目、价格对比、差异化优势
💰 **投资价值** - 回报预期、风险评估、持有建议

请提供您的项目信息，我将为您量身定制分析建议。`,

    systemOperation: `✅ 系统操作已完成！

基于操作结果，我建议您：
• 查看生成的数据和报告
• 验证关键指标的准确性
• 根据分析结果调整策略
• 如有疑问随时询问我

还需要其他协助吗？`,

    error: `⚠️ 遇到了一些问题，让我来帮您解决：

**常见解决方案**:
🔄 重新尝试操作
🌐 检查网络连接状态
📋 确认数据格式正确
🔧 清除浏览器缓存

如果问题持续存在，我将为您提供详细的故障排除指导。`
  }
};

// 提示词增强函数
export function enhancePromptWithContext(
  userInput: string,
  systemContext: any = {},
  conversationHistory: any[] = []
): string {
  const contextInfo = [];

  // 添加系统状态信息
  if (systemContext.currentProject) {
    contextInfo.push(`当前项目: ${systemContext.currentProject.name || '未命名项目'}`);
    contextInfo.push(`项目类型: ${systemContext.currentProject.type || '住宅'}`);
    contextInfo.push(`所在区域: ${systemContext.currentProject.location || '未指定'}`);
  }

  // 添加用户历史偏好
  if (conversationHistory.length > 0) {
    const recentTopics = conversationHistory
      .slice(-3)
      .map(msg => msg.type === 'user' ? msg.content : null)
      .filter(Boolean);

    if (recentTopics.length > 0) {
      contextInfo.push(`近期关注: ${recentTopics.join(', ')}`);
    }
  }

  // 构建增强提示词
  const enhancedPrompt = [
    MARKETPRO_CHATBOT_CONFIG.systemPrompt,
    '',
    '## 当前上下文',
    contextInfo.length > 0 ? contextInfo.join('\n') : '暂无项目信息',
    '',
    '## 用户请求',
    userInput,
    '',
    '请基于以上信息，提供专业、准确、实用的回复。如果涉及系统操作，请优先执行相关功能。'
  ].join('\n');

  return enhancedPrompt;
}

// 获取智能建议
export function getIntelligentSuggestions(
  userInput: string,
  systemContext: any = {}
): string[] {
  const suggestions: string[] = [];
  const input = userInput.toLowerCase();

  // 基于用户输入内容的建议
  if (input.includes('市场') || input.includes('分析')) {
    suggestions.push('深入市场趋势分析', '竞争对手对比', '价格预测模型');
  }

  if (input.includes('报告') || input.includes('生成')) {
    suggestions.push('开始生成报告', '选择报告模板', '自定义分析维度');
  }

  if (input.includes('项目') || input.includes('创建')) {
    suggestions.push('创建新项目', '导入历史数据', '设置分析参数');
  }

  if (input.includes('帮助') || input.includes('怎么')) {
    suggestions.push('功能使用指南', '最佳实践建议', '联系技术支持');
  }

  // 基于系统状态的建议
  if (!systemContext.currentProject) {
    suggestions.push('创建第一个项目');
  } else {
    suggestions.push('优化项目配置', '查看历史分析');
  }

  // 通用专业建议
  const professionalSuggestions = [
    '市场风险评估',
    '投资价值分析',
    '政策影响预测',
    '区域发展潜力',
    '资金配置建议'
  ];

  suggestions.push(...professionalSuggestions.slice(0, 2));

  // 去重并限制数量
  return [...new Set(suggestions)].slice(0, 4);
}

// 检测用户意图类型
export function detectUserIntent(userInput: string): {
  type: 'market_analysis' | 'system_operation' | 'help_request' | 'general_chat';
  confidence: number;
  keywords: string[];
} {
  const input = userInput.toLowerCase();

  // 市场分析意图
  const marketKeywords = ['市场', '分析', '趋势', '价格', '投资', '竞争', '预测'];
  const marketMatches = marketKeywords.filter(keyword => input.includes(keyword));

  if (marketMatches.length >= 2) {
    return {
      type: 'market_analysis',
      confidence: Math.min(0.9, marketMatches.length * 0.3),
      keywords: marketMatches
    };
  }

  // 系统操作意图
  const systemKeywords = ['创建', '生成', '报告', '项目', '设置', '导入', '导出'];
  const systemMatches = systemKeywords.filter(keyword => input.includes(keyword));

  if (systemMatches.length >= 1) {
    return {
      type: 'system_operation',
      confidence: Math.min(0.85, systemMatches.length * 0.4),
      keywords: systemMatches
    };
  }

  // 帮助请求意图
  const helpKeywords = ['帮助', '怎么', '如何', '问题', '不会', '教我'];
  const helpMatches = helpKeywords.filter(keyword => input.includes(keyword));

  if (helpMatches.length >= 1) {
    return {
      type: 'help_request',
      confidence: 0.8,
      keywords: helpMatches
    };
  }

  // 通用对话
  return {
    type: 'general_chat',
    confidence: 0.5,
    keywords: []
  };
}

// 格式化系统状态摘要
export function formatSystemStatus(systemContext: any): string {
  const status = [];

  if (systemContext.currentProject) {
    status.push(`📋 当前项目: ${systemContext.currentProject.name}`);
    status.push(`🏠 项目类型: ${systemContext.currentProject.type || '住宅项目'}`);
    status.push(`📍 项目位置: ${systemContext.currentProject.location || '未指定'}`);
  } else {
    status.push('📋 当前项目: 暂无（建议先创建项目）');
  }

  if (systemContext.currentTasks?.length > 0) {
    const runningTasks = systemContext.currentTasks.filter((task: any) => task.status === 'running').length;
    status.push(`⚡ 运行任务: ${runningTasks} 个正在进行`);
  } else {
    status.push('⚡ 运行任务: 暂无');
  }

  status.push('🟢 系统状态: 正常运行');
  status.push('🤖 AI服务: QWEN Max模型在线');

  return status.join('\n');
}