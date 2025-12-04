'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Save,
  Undo,
  Redo,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  History,
  Zap,
  Target,
  X,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { GeneratedReport, ReportSection } from '@/services/reportGeneration';

interface EditSession {
  id: string;
  timestamp: string;
  action: 'edit' | 'ai_suggestion' | 'manual_edit';
  sectionId?: string;
  originalContent: string;
  modifiedContent: string;
  description: string;
}

interface AISuggestion {
  id: string;
  type: 'improvement' | 'expansion' | 'correction' | 'style';
  sectionId: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number;
}

interface ReportEditorProps {
  report: GeneratedReport;
  onSave: (report: GeneratedReport) => void;
  onClose: () => void;
  isOpen: boolean;
  targetSectionId?: string;
}

export function ReportEditor({
  report,
  onSave,
  onClose,
  isOpen,
  targetSectionId
}: ReportEditorProps) {
  const [editingReport, setEditingReport] = useState<GeneratedReport>(report);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(targetSectionId || null);
  const [editHistory, setEditHistory] = useState<EditSession[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingAISuggestions, setIsGeneratingAISuggestions] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingSectionId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingSectionId]);

  const addToHistory = (session: Omit<EditSession, 'id' | 'timestamp'>) => {
    const newSession: EditSession = {
      ...session,
      id: `edit_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newSession);
    setEditHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      const session = editHistory[currentHistoryIndex];
      // 恢复到上一个状态的逻辑
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < editHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const handleSectionEdit = (sectionId: string, newContent: string) => {
    const originalSection = editingReport.sections.find(s => s.id === sectionId);
    if (!originalSection) return;

    const updatedSections = editingReport.sections.map(section =>
      section.id === sectionId
        ? { ...section, content: newContent }
        : section
    );

    const updatedReport = {
      ...editingReport,
      sections: updatedSections
    };

    setEditingReport(updatedReport);
    addToHistory({
      action: 'manual_edit',
      sectionId,
      originalContent: originalSection.content,
      modifiedContent: newContent,
      description: `手动编辑章节: ${originalSection.title}`
    });
  };

  const processNaturalLanguageEdit = async () => {
    if (!naturalLanguageInput.trim() || !editingSectionId) return;

    setIsProcessingInput(true);
    try {
      // 模拟AI处理自然语言编辑指令
      await new Promise(resolve => setTimeout(resolve, 2000));

      const targetSection = editingReport.sections.find(s => s.id === editingSectionId);
      if (!targetSection) return;

      let newContent = targetSection.content;
      const instruction = naturalLanguageInput.toLowerCase();

      // 简单的自然语言处理示例
      if (instruction.includes('添加') || instruction.includes('补充')) {
        newContent += '\n\n' + generateAdditionalContent(instruction, targetSection);
      } else if (instruction.includes('缩短') || instruction.includes('精简')) {
        newContent = shortenContent(newContent);
      } else if (instruction.includes('改写') || instruction.includes('优化')) {
        newContent = optimizeContent(newContent);
      } else if (instruction.includes('更专业') || instruction.includes('正式')) {
        newContent = makeMoreProfessional(newContent);
      }

      handleSectionEdit(editingSectionId, newContent);
      setNaturalLanguageInput('');

      addToHistory({
        action: 'ai_suggestion',
        sectionId: editingSectionId,
        originalContent: targetSection.content,
        modifiedContent: newContent,
        description: `AI处理指令: "${naturalLanguageInput}"`
      });

    } finally {
      setIsProcessingInput(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!editingSectionId) return;

    setIsGeneratingAISuggestions(true);
    try {
      // 模拟生成AI建议
      await new Promise(resolve => setTimeout(resolve, 1500));

      const targetSection = editingReport.sections.find(s => s.id === editingSectionId);
      if (!targetSection) return;

      const suggestions: AISuggestion[] = [
        {
          id: 'sugg_1',
          type: 'improvement',
          sectionId: editingSectionId,
          originalText: targetSection.content.substring(0, 100) + '...',
          suggestedText: '建议添加更多具体数据和案例支撑...',
          explanation: '通过添加具体数据可以增强报告的说服力',
          confidence: 85
        },
        {
          id: 'sugg_2',
          type: 'style',
          sectionId: editingSectionId,
          originalText: '部分语句可以更加简洁',
          suggestedText: '建议精简冗长的表述，提高可读性',
          explanation: '简洁的表达方式更容易理解',
          confidence: 78
        },
        {
          id: 'sugg_3',
          type: 'expansion',
          sectionId: editingSectionId,
          originalText: '可以添加更多细节',
          suggestedText: '建议补充具体的实施步骤和时间安排',
          explanation: '详细的实施计划有助于指导实际操作',
          confidence: 92
        }
      ];

      setAiSuggestions(suggestions);
    } finally {
      setIsGeneratingAISuggestions(false);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    const targetSection = editingReport.sections.find(s => s.id === suggestion.sectionId);
    if (!targetSection) return;

    // 这里实现具体的建议应用逻辑
    let newContent = targetSection.content;

    switch (suggestion.type) {
      case 'improvement':
        newContent = newContent + '\n\n' + generateImprovementContent(suggestion);
        break;
      case 'style':
        newContent = improveStyle(newContent);
        break;
      case 'expansion':
        newContent = expandContent(newContent, suggestion);
        break;
      case 'correction':
        newContent = correctContent(newContent, suggestion);
        break;
    }

    handleSectionEdit(suggestion.sectionId, newContent);
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  // 辅助函数
  const generateAdditionalContent = (instruction: string, section: ReportSection) => {
    return `根据指令"${instruction}"生成的补充内容：\n\n这里是基于当前章节"${section.title}"自动生成的相关内容，需要根据具体需求进一步完善。`;
  };

  const shortenContent = (content: string) => {
    const sentences = content.split('。');
    return sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('。');
  };

  const optimizeContent = (content: string) => {
    return content.replace(/(?:的){2,}/g, '的')
                  .replace(/\s+/g, ' ')
                  .trim();
  };

  const makeMoreProfessional = (content: string) => {
    return content.replace(/比较/g, '相对')
                  .replace(/很好/g, '良好')
                  .replace(/不错/g, '优秀');
  };

  const generateImprovementContent = (suggestion: AISuggestion) => {
    return `【AI优化建议】\n${suggestion.suggestedText}\n\n${suggestion.explanation}`;
  };

  const improveStyle = (content: string) => {
    return content.replace(/，/g, '，')
                  .replace(/。\s*。/g, '。')
                  .trim();
  };

  const expandContent = (content: string, suggestion: AISuggestion) => {
    return content + '\n\n【扩展内容】\n' + suggestion.suggestedText;
  };

  const correctContent = (content: string, suggestion: AISuggestion) => {
    return content.replace(suggestion.originalText, suggestion.suggestedText);
  };

  const getCurrentSection = () => {
    return editingReport.sections.find(s => s.id === editingSectionId);
  };

  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'expansion':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'correction':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'style':
        return <Target className="w-4 h-4 text-orange-500" />;
    }
  };

  const getSuggestionColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'border-purple-200 bg-purple-50';
      case 'expansion':
        return 'border-blue-200 bg-blue-50';
      case 'correction':
        return 'border-green-200 bg-green-50';
      case 'style':
        return 'border-orange-200 bg-orange-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 编辑器头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">报告智能编辑器</h2>
              <p className="text-blue-100 mt-1">使用自然语言指令编辑报告内容</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? '隐藏预览' : '显示预览'}
              </Button>

              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-2" />
                编辑历史
              </Button>

              <Button
                onClick={() => onSave(editingReport)}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Save className="w-4 h-4 mr-2" />
                保存修改
              </Button>

              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 编辑工具栏 */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={undo}
              disabled={currentHistoryIndex <= 0}
            >
              <Undo className="w-4 h-4 mr-1" />
              撤销
            </Button>

            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={redo}
              disabled={currentHistoryIndex >= editHistory.length - 1}
            >
              <Redo className="w-4 h-4 mr-1" />
              重做
            </Button>

            <div className="flex-1" />

            <div className="text-sm text-blue-100">
              编辑历史: {editHistory.length} 次修改
            </div>
          </div>
        </div>

        {/* 主要编辑区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧章节列表 */}
          <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">章节导航</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setEditingSectionId('executive-summary')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    editingSectionId === 'executive-summary'
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  执行摘要
                </button>

                {editingReport.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setEditingSectionId(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      editingSectionId === section.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{section.title}</div>
                    {section.subtitle && (
                      <div className="text-xs text-gray-500 mt-1">{section.subtitle}</div>
                    )}
                  </button>
                ))}

                <button
                  onClick={() => setEditingSectionId('conclusions')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    editingSectionId === 'conclusions'
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  主要结论
                </button>

                <button
                  onClick={() => setEditingSectionId('next-steps')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    editingSectionId === 'next-steps'
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  下一步行动
                </button>
              </div>
            </div>
          </div>

          {/* 中间编辑区域 */}
          <div className={`${showPreview ? 'w-1/2' : 'w-3/4'} flex flex-col overflow-hidden`}>
            {editingSectionId && (
              <>
                {/* 自然语言编辑界面 */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-800">自然语言编辑</h4>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={naturalLanguageInput}
                      onChange={(e) => setNaturalLanguageInput(e.target.value)}
                      placeholder="例如：添加更多数据支持、精简冗长内容、使语言更专业..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && processNaturalLanguageEdit()}
                    />
                    <Button
                      onClick={processNaturalLanguageEdit}
                      disabled={isProcessingInput || !naturalLanguageInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessingInput ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      执行
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={generateAISuggestions}
                      disabled={isGeneratingAISuggestions}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {isGeneratingAISuggestions ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      AI优化建议
                    </Button>
                  </div>
                </div>

                {/* 文本编辑区域 */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      编辑内容：{getCurrentSection()?.title || '执行摘要'}
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={
                        editingSectionId === 'executive-summary'
                          ? editingReport.executiveSummary
                          : editingSectionId === 'conclusions'
                          ? editingReport.conclusions.join('\n')
                          : editingSectionId === 'next-steps'
                          ? editingReport.nextSteps.join('\n')
                          : getCurrentSection()?.content || ''
                      }
                      onChange={(e) => {
                        if (editingSectionId === 'executive-summary') {
                          setEditingReport(prev => ({
                            ...prev,
                            executiveSummary: e.target.value
                          }));
                        } else if (editingSectionId === 'conclusions') {
                          setEditingReport(prev => ({
                            ...prev,
                            conclusions: e.target.value.split('\n').filter(line => line.trim())
                          }));
                        } else if (editingSectionId === 'next-steps') {
                          setEditingReport(prev => ({
                            ...prev,
                            nextSteps: e.target.value.split('\n').filter(line => line.trim())
                          }));
                        } else {
                          handleSectionEdit(editingSectionId, e.target.value);
                        }
                      }}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      placeholder="在这里编辑内容，或使用上方的自然语言指令..."
                    />
                  </div>

                  {/* AI建议列表 */}
                  <AnimatePresence>
                    {aiSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          AI优化建议
                        </h4>
                        {aiSuggestions.map((suggestion) => (
                          <Card key={suggestion.id} className={`border ${getSuggestionColor(suggestion.type)}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getSuggestionIcon(suggestion.type)}
                                    <span className="font-medium text-sm">
                                      {suggestion.type === 'improvement' ? '内容改进' :
                                       suggestion.type === 'expansion' ? '内容扩展' :
                                       suggestion.type === 'correction' ? '内容修正' : '文风优化'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      置信度: {suggestion.confidence}%
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">
                                    {suggestion.suggestedText}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {suggestion.explanation}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => applySuggestion(suggestion)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    应用
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* 右侧预览/历史区域 */}
          {(showPreview || showHistory) && (
            <div className="w-1/4 border-l border-gray-200 overflow-y-auto">
              {showPreview && (
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">实时预览</h3>
                  {editingSectionId && (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          {getCurrentSection()?.title || '执行摘要'}
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {editingSectionId === 'executive-summary'
                            ? editingReport.executiveSummary
                            : editingSectionId === 'conclusions'
                            ? editingReport.conclusions.join('\n')
                            : editingSectionId === 'next-steps'
                            ? editingReport.nextSteps.join('\n')
                            : getCurrentSection()?.content || ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showHistory && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">编辑历史</h3>
                  <div className="space-y-3">
                    {editHistory.slice(-10).reverse().map((session, index) => (
                      <div key={session.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(session.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-medium text-gray-700 mb-1">
                          {session.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {session.action === 'ai_suggestion' && (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {session.action === 'manual_edit' && (
                            <Edit3 className="w-3 h-3" />
                          )}
                          <span>
                            {session.action === 'ai_suggestion' ? 'AI处理' :
                             session.action === 'manual_edit' ? '手动编辑' : '编辑'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}