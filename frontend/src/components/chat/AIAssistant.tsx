'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  MessageSquare,
  Minimize2,
  Maximize2,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { aiApi, handleApiError, api } from '@/lib/api';
import {
  aiSystemInteraction,
  hasSystemIntent,
  formatSystemActionResult,
  type SystemAction
} from '@/lib/aiSystemInteraction';
import {
  MARKETPRO_CHATBOT_CONFIG,
  enhancePromptWithContext,
  getIntelligentSuggestions,
  detectUserIntent,
  formatSystemStatus
} from '@/lib/aiChatConfig';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
    actionType?: 'analysis' | 'generation' | 'feedback' | 'help';
    error?: boolean;
  };
}

export interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  position?: 'fixed' | 'inline';
  context?: {
    reportType?: string;
    currentStep?: string;
    projectData?: any;
  };
  onActionRequest?: (action: string, data: any) => void;
  className?: string;
}

export function AIAssistant({
  isOpen,
  onToggle,
  onClose,
  position = 'fixed',
  context,
  onActionRequest,
  className
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: MARKETPRO_CHATBOT_CONFIG.responseTemplates.greeting,
      timestamp: new Date(),
      metadata: {
        confidence: 1,
        actionType: 'help',
        suggestions: ['创建项目', '市场分析', '生成报告', '使用指南']
      }
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [systemActions, setSystemActions] = useState<SystemAction[]>([]);
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<string[]>([
    '分析当前房地产市场趋势',
    '创建新的营销项目',
    '生成专业分析报告'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息变化时更新智能建议
  useEffect(() => {
    generateIntelligentSuggestions();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // 调用真实AI API
      const response = await generateAIResponse(userMessage.content, context);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: response.metadata
      }]);

    } catch (error) {
      console.error('发送消息失败:', error);

      // 添加错误消息
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: '⚠️ 消息发送失败，请检查网络连接后重试',
        timestamp: new Date(),
        metadata: {
          confidence: 0,
          actionType: 'help' as const,
          error: true
        }
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 生成AI响应 (真实API调用 + 系统功能交互)
  const generateAIResponse = async (userInput: string, context?: any) => {
    try {
      // 1. 检查是否包含系统操作意图
      const hasSystemOps = hasSystemIntent(userInput);
      let systemOperationResults: string[] = [];

      if (hasSystemOps) {
        // 解析系统操作意图
        const systemActions = aiSystemInteraction.parseUserIntent(userInput);
        setSystemActions(systemActions);

        // 执行系统操作
        for (const action of systemActions) {
          try {
            const result = await aiSystemInteraction.executeSystemAction(action);
            const formattedResult = formatSystemActionResult(action, result);
            systemOperationResults.push(formattedResult);

            // 如果是导航操作，触发页面跳转
            if (result.success && result.data?.action === 'navigate') {
              if (onActionRequest) {
                onActionRequest('navigate', { path: result.data.path });
              }
            }
          } catch (error) {
            systemOperationResults.push(`❌ ${action.description}失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }

      // 2. 更新AI系统上下文
      aiSystemInteraction.updateContext({
        currentProject: context?.projectData,
        currentUser: context?.currentUser
      });

      // 3. 检测用户意图
      const userIntent = detectUserIntent(userInput);

      // 4. 准备增强的提示词
      const systemContext = {
        currentProject: context?.projectData,
        currentUser: context?.currentUser,
        currentTasks: aiSystemInteraction.getCurrentContext().currentTasks
      };

      const enhancedPrompt = enhancePromptWithContext(userInput, systemContext, messages);

      const requestData = {
        prompt: enhancedPrompt,
        requestType: 'chat' as const,
        temperature: 0.7,
        maxTokens: 1200,
        context: {
          reportType: context?.reportType,
          currentStep: context?.currentStep,
          projectData: context?.projectData,
          source: 'floating_chatbot',
          hasSystemOperations: hasSystemOps,
          systemOperationCount: systemOperationResults.length
        }
      };

      // 5. 调用后端AI API (修正字段名称以匹配后端)
      const backendRequestData = {
        message: enhancedPrompt,  // 后端期望 message 字段
        requestType: 'chat' as const,
        temperature: 0.7,
        maxTokens: 1200,
        context: requestData.context
      };

      const response = await api.post('/api/ai/chat', backendRequestData);

      if (response.success && response.data && typeof response.data === 'object' && 'message' in response.data) {
        let content = (response.data as any).message;

        // 6. 如果有系统操作结果，将其前置显示
        if (systemOperationResults.length > 0) {
          content = systemOperationResults.join('\n\n') + '\n\n---\n\n' + content;
        }

        // 7. 根据响应内容和系统操作推断actionType
        let actionType: 'analysis' | 'generation' | 'feedback' | 'help' = 'help';
        let suggestions: string[] = [];

        // 8. 基于用户意图和系统状态获取智能建议
        suggestions = getIntelligentSuggestions(userInput, systemContext);

        // 根据用户意图确定actionType
        switch (userIntent.type) {
          case 'market_analysis':
            actionType = 'analysis';
            break;
          case 'system_operation':
            actionType = hasSystemOps ? 'feedback' : 'generation';
            break;
          case 'help_request':
            actionType = 'help';
            break;
          default:
            actionType = 'help';
        }

        return {
          content,
          metadata: {
            confidence: (response.data as any).usage ?
              Math.min(0.95, Math.max(0.7, (response.data as any).usage.totalTokens / 1000)) : 0.85,
            actionType,
            suggestions: suggestions.length > 0 ? suggestions.slice(0, 3) : undefined,
            sources: [
              ...((response.data as any).model ? [`AI模型: ${(response.data as any).model}`] : []),
              ...(hasSystemOps ? [`系统操作: ${systemOperationResults.length} 项`] : [])
            ]
          }
        };
      } else {
        throw new Error('AI响应格式错误');
      }

    } catch (error) {
      console.error('AI API调用失败:', error);

      // 返回错误友好的响应
      const errorMessage = handleApiError(error);

      return {
        content: `${MARKETPRO_CHATBOT_CONFIG.responseTemplates.error}\n\n**具体错误**: ${errorMessage}`,
        metadata: {
          confidence: 0.0,
          actionType: 'help' as const,
          suggestions: ['重新尝试', '检查网络', '联系支持', '查看帮助'],
          error: true
        }
      };
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  // 生成智能建议
  const generateIntelligentSuggestions = () => {
    const lastMessage = messages[messages.length - 1];
    const recentContext = messages.slice(-3).map(m => m.content).join(' ');

    let contextualSuggestions: string[] = [];

    // 根据最近的对话内容生成相关建议
    if (recentContext.includes('市场分析') || recentContext.includes('市场')) {
      contextualSuggestions = [
        '深入分析具体区域的房地产市场数据',
        '对比不同区域的投资价值',
        '预测未来3-6个月的市场走势'
      ];
    } else if (recentContext.includes('项目') || recentContext.includes('开发')) {
      contextualSuggestions = [
        '制定项目的营销策略',
        '分析目标客户群体特征',
        '设计项目的定价策略'
      ];
    } else if (recentContext.includes('报告') || recentContext.includes('分析')) {
      contextualSuggestions = [
        '优化报告的数据呈现方式',
        '添加竞品对比分析',
        '生成项目风险评估报告'
      ];
    } else if (messages.length === 1) {
      // 对话刚开始时的建议
      contextualSuggestions = [
        '分析当前房地产市场趋势和机会',
        '创建新的房地产营销项目',
        '查看我的项目管理面板'
      ];
    } else {
      // 默认智能建议
      contextualSuggestions = [
        '继续深入讨论这个话题',
        '换个角度分析问题',
        '查看相关的数据报告'
      ];
    }

    setIntelligentSuggestions(contextualSuggestions);
  };

  // 复制消息
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 重新生成响应
  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (!previousUserMessage || previousUserMessage.type !== 'user') return;

    setIsTyping(true);

    try {
      const response = await generateAIResponse(previousUserMessage.content, context);

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: response.content,
          metadata: response.metadata,
          timestamp: new Date()
        };
        return newMessages;
      });

    } catch (error) {
      console.error('重新生成响应失败:', error);

      // 更新为错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: '⚠️ 重新生成失败，请稍后重试',
          metadata: {
            confidence: 0,
            actionType: 'help' as const,
            error: true
          },
          timestamp: new Date()
        };
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-white">
            <h3 className="font-semibold">AI 助手</h3>
            <p className="text-xs text-white/80">
              {isTyping ? '正在思考中...' : '在线协助'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {position === 'fixed' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onClose || onToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex gap-3',
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* 头像 */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'system'
                      ? 'bg-orange-500 text-white'
                      : 'bg-purple-500 text-white'
                  )}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.type === 'system' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className={cn(
                    'max-w-[80%] group',
                    message.type === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
                  )}>
                    <div className={cn(
                      'rounded-lg px-3 py-2 text-sm whitespace-pre-wrap relative',
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'system'
                        ? 'bg-orange-50 text-orange-900 border border-orange-200'
                        : message.metadata?.error
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900 border'
                    )}>
                      {message.type === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            // 自定义样式以适配聊天界面
                            h1: ({children}) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                            h2: ({children}) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                            strong: ({children}) => <strong className="font-bold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            ul: ({children}) => <ul className="list-disc list-inside space-y-0.5 ml-4">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside space-y-0.5 ml-4">{children}</ol>,
                            li: ({children}) => <li className="text-sm">{children}</li>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}

                      {/* 消息操作按钮 */}
                      {message.type === 'assistant' && (
                        <div className="absolute -bottom-8 right-0 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-500"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-500"
                            onClick={() => regenerateResponse(message.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 元信息 */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.metadata?.confidence && message.type === 'assistant' && (
                        <Badge
                          size="sm"
                          variant={message.metadata.confidence > 0.8 ? 'success' : 'default'}
                        >
                          {Math.round(message.metadata.confidence * 100)}% 信心度
                        </Badge>
                      )}
                    </div>

                    {/* 建议按钮 */}
                    {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 输入中指示器 */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600">AI正在思考...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="输入您的问题...（Shift+Enter 换行，Enter 发送）"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[42px] max-h-32 overflow-y-auto"
                  disabled={isTyping}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '42px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>Shift+Enter 换行，Enter 发送</span>
                  <span className="text-gray-400">{inputText.length}/1000</span>
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                className="px-3 py-2 h-[42px]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* 智能建议 */}
            {intelligentSuggestions.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  智能建议
                </div>
                <div className="flex flex-wrap gap-2">
                  {intelligentSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs max-w-[200px] truncate hover:bg-blue-50 border-blue-200 text-blue-700"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 常用快捷操作 */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<TrendingUp className="w-3 h-3" />}
                onClick={() => handleSuggestionClick('分析当前房地产市场趋势和投资机会')}
                className="text-xs"
              >
                市场分析
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<BarChart3 className="w-3 h-3" />}
                onClick={() => handleSuggestionClick('创建新的房地产项目')}
                className="text-xs"
              >
                创建项目
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FileText className="w-3 h-3" />}
                onClick={() => handleSuggestionClick('生成专业的市场分析报告')}
                className="text-xs"
              >
                生成报告
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (position === 'inline') {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="p-0 h-full">
          {chatContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20, y: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 20, y: 20 }}
          className={cn(
            'fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl border',
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
            className
          )}
        >
          {chatContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// AI助手触发按钮
export interface AIAssistantTriggerProps {
  onClick: () => void;
  hasNewMessage?: boolean;
  className?: string;
}

export function AIAssistantTrigger({
  onClick,
  hasNewMessage = false,
  className
}: AIAssistantTriggerProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <MessageSquare className="w-6 h-6" />

      {hasNewMessage && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}

      {/* 脉冲效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ opacity: 0.3 }}
      />
    </motion.button>
  );
}