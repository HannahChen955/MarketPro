'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  BarChart3,
  Target,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ReportFormData } from './ReportFormBase';
import {
  ReportGenerationService,
  ReportGenerationRequest,
  GeneratedReport,
  AIOptimizationSuggestion
} from '@/services/reportGeneration';

interface AIReportGeneratorProps {
  projectId: string;
  phaseId: string;
  formData: ReportFormData;
  onReportGenerated: (report: GeneratedReport) => void;
  isOpen: boolean;
  onClose: () => void;
}

type GenerationStep =
  | 'idle'
  | 'analyzing'
  | 'generating-content'
  | 'optimizing'
  | 'finalizing'
  | 'completed'
  | 'error';

interface GenerationProgress {
  step: GenerationStep;
  progress: number;
  message: string;
  details?: string;
}

export function AIReportGenerator({
  projectId,
  phaseId,
  formData,
  onReportGenerated,
  isOpen,
  onClose
}: AIReportGeneratorProps) {
  const [progress, setProgress] = useState<GenerationProgress>({
    step: 'idle',
    progress: 0,
    message: '准备生成报告...'
  });

  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<AIOptimizationSuggestion[]>([]);
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [showOptimizations, setShowOptimizations] = useState(false);

  // 生成选项
  const [generationOptions, setGenerationOptions] = useState({
    reportType: 'full' as 'full' | 'summary' | 'executive' | 'detailed',
    optimizationLevel: 'advanced' as 'basic' | 'advanced' | 'expert',
    includeCharts: true,
    includeInsights: true,
    includeRecommendations: true
  });

  const stepMessages = {
    idle: '准备开始生成...',
    analyzing: '正在分析您提供的信息...',
    'generating-content': '正在生成专业内容...',
    optimizing: '正在进行AI优化...',
    finalizing: '正在完成最后处理...',
    completed: '报告生成完成！',
    error: '生成过程中出现错误'
  };

  const stepDetails = {
    analyzing: '分析项目数据、市场环境、竞争对手等关键信息',
    'generating-content': '基于您的输入生成专业的分析内容和建议',
    optimizing: '运用AI技术优化报告结构和内容质量',
    finalizing: '添加图表、格式化文档、质量检查'
  };

  // 开始生成报告
  const startGeneration = async () => {
    try {
      setProgress({ step: 'analyzing', progress: 10, message: stepMessages.analyzing, details: stepDetails.analyzing });

      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress({ step: 'generating-content', progress: 30, message: stepMessages['generating-content'], details: stepDetails['generating-content'] });

      // 构建生成请求
      const request: ReportGenerationRequest = {
        projectId,
        phaseId,
        formData,
        reportType: generationOptions.reportType,
        optimizationLevel: generationOptions.optimizationLevel,
        language: 'zh'
      };

      // 模拟内容生成过程
      await new Promise(resolve => setTimeout(resolve, 3000));

      setProgress({ step: 'optimizing', progress: 70, message: stepMessages.optimizing, details: stepDetails.optimizing });

      // 生成报告
      const report = await ReportGenerationService.generateReport(request);

      // 模拟优化过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress({ step: 'finalizing', progress: 90, message: stepMessages.finalizing, details: stepDetails.finalizing });

      // 生成优化建议
      const suggestions = await ReportGenerationService.optimizeReport(report, formData);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 完成
      setProgress({ step: 'completed', progress: 100, message: stepMessages.completed });
      setGeneratedReport(report);
      setOptimizationSuggestions(suggestions);

      // 通知父组件
      onReportGenerated(report);

    } catch (error) {
      console.error('Report generation error:', error);
      setProgress({
        step: 'error',
        progress: 0,
        message: '生成失败，请重试',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 应用优化建议
  const applyOptimizations = async () => {
    if (!generatedReport) return;

    try {
      setProgress({ step: 'optimizing', progress: 50, message: '正在应用优化建议...' });

      const selectedSuggestions = optimizationSuggestions.filter(s =>
        selectedOptimizations.includes(s.id)
      );

      const optimizedReport = await ReportGenerationService.applyOptimizations(
        generatedReport,
        selectedSuggestions
      );

      setGeneratedReport(optimizedReport);
      setProgress({ step: 'completed', progress: 100, message: '优化完成！' });
      onReportGenerated(optimizedReport);

    } catch (error) {
      console.error('Optimization error:', error);
      setProgress({ step: 'error', progress: 0, message: '优化失败，请重试' });
    }
  };

  // 重置状态
  const resetGeneration = () => {
    setProgress({ step: 'idle', progress: 0, message: '准备生成报告...' });
    setGeneratedReport(null);
    setOptimizationSuggestions([]);
    setSelectedOptimizations([]);
    setShowOptimizations(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">AI智能报告生成</h2>
                <p className="text-blue-100 text-sm">运用前沿AI技术生成专业营销报告</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {progress.step === 'idle' && (
            <div className="space-y-6">
              {/* 生成选项 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    报告类型
                  </label>
                  <select
                    value={generationOptions.reportType}
                    onChange={(e) => setGenerationOptions(prev => ({
                      ...prev,
                      reportType: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full">完整报告</option>
                    <option value="summary">摘要报告</option>
                    <option value="executive">管理层报告</option>
                    <option value="detailed">详细分析报告</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    优化级别
                  </label>
                  <select
                    value={generationOptions.optimizationLevel}
                    onChange={(e) => setGenerationOptions(prev => ({
                      ...prev,
                      optimizationLevel: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">基础优化</option>
                    <option value="advanced">高级优化</option>
                    <option value="expert">专家级优化</option>
                  </select>
                </div>
              </div>

              {/* 功能选项 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'includeCharts', label: '包含图表', icon: <BarChart3 className="w-4 h-4" /> },
                  { key: 'includeInsights', label: '专业洞察', icon: <Lightbulb className="w-4 h-4" /> },
                  { key: 'includeRecommendations', label: '行动建议', icon: <Target className="w-4 h-4" /> }
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generationOptions[option.key as keyof typeof generationOptions] as boolean}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        [option.key]: e.target.checked
                      }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    {option.icon}
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* 开始按钮 */}
              <Button
                onClick={startGeneration}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                开始AI智能生成
              </Button>
            </div>
          )}

          {(progress.step !== 'idle' && progress.step !== 'completed') && (
            <div className="space-y-6">
              {/* 进度指示器 */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress.progress / 100)}`}
                      className="text-blue-600 transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{progress.progress}%</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{progress.message}</h3>
                {progress.details && (
                  <p className="text-sm text-gray-600">{progress.details}</p>
                )}
              </div>

              {/* 生成步骤 */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-4">
                  {(['analyzing', 'generating-content', 'optimizing', 'finalizing'] as GenerationStep[]).map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        progress.step === step
                          ? 'bg-blue-600 text-white'
                          : index < (['analyzing', 'generating-content', 'optimizing', 'finalizing'].indexOf(progress.step))
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index < (['analyzing', 'generating-content', 'optimizing', 'finalizing'].indexOf(progress.step)) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : progress.step === step ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < 3 && (
                        <div className={`w-12 h-0.5 ${
                          index < (['analyzing', 'generating-content', 'optimizing', 'finalizing'].indexOf(progress.step))
                            ? 'bg-green-600'
                            : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {progress.step === 'completed' && generatedReport && (
            <div className="space-y-6">
              {/* 成功提示 */}
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">报告生成成功！</h3>
                <p className="text-gray-600">您的专业营销报告已准备就绪</p>
              </div>

              {/* 报告质量指标 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '完整性', value: Math.round(generatedReport.metadata.qualityMetrics.completeness * 100), color: 'blue' },
                  { label: '准确性', value: Math.round(generatedReport.metadata.qualityMetrics.accuracy * 100), color: 'green' },
                  { label: '相关性', value: Math.round(generatedReport.metadata.qualityMetrics.relevance * 100), color: 'purple' },
                  { label: '可执行性', value: Math.round(generatedReport.metadata.qualityMetrics.actionability * 100), color: 'orange' }
                ].map((metric) => (
                  <div key={metric.label} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold text-${metric.color}-600`}>{metric.value}%</div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* 优化建议 */}
              {optimizationSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">AI优化建议</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOptimizations(!showOptimizations)}
                    >
                      {showOptimizations ? '隐藏建议' : '查看建议'} ({optimizationSuggestions.length})
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showOptimizations && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3"
                      >
                        {optimizationSuggestions.map((suggestion) => (
                          <label
                            key={suggestion.id}
                            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOptimizations.includes(suggestion.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOptimizations(prev => [...prev, suggestion.id]);
                                } else {
                                  setSelectedOptimizations(prev => prev.filter(id => id !== suggestion.id));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{suggestion.title}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {suggestion.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{suggestion.description}</p>
                              <p className="text-xs text-gray-500 mt-1">置信度: {Math.round(suggestion.confidence * 100)}%</p>
                            </div>
                          </label>
                        ))}

                        {selectedOptimizations.length > 0 && (
                          <Button
                            onClick={applyOptimizations}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            应用选中的优化建议 ({selectedOptimizations.length})
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // 这里应该触发报告预览
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  查看完整报告
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    // 这里应该触发下载
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载报告
                </Button>

                <Button
                  variant="outline"
                  onClick={resetGeneration}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
              </div>
            </div>
          )}

          {progress.step === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">生成失败</h3>
              <p className="text-gray-600">{progress.details || '报告生成过程中出现错误，请稍后重试'}</p>
              <Button
                onClick={resetGeneration}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新尝试
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}