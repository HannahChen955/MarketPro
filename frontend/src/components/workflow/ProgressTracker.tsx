'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Database,
  FileText,
  Sparkles,
  Download,
  Eye,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ProgressStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  estimatedTime?: number;
  actualTime?: number;
  details?: string[];
  metrics?: {
    processed?: number;
    total?: number;
    rate?: number;
  };
}

export interface ProgressTrackerProps {
  stages: ProgressStage[];
  overallProgress: number;
  isRunning: boolean;
  canPause?: boolean;
  canRetry?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onViewResult?: () => void;
  estimatedTimeRemaining?: number;
  className?: string;
}

export function ProgressTracker({
  stages,
  overallProgress,
  isRunning,
  canPause = false,
  canRetry = false,
  onPause,
  onResume,
  onRetry,
  onCancel,
  onViewResult,
  estimatedTimeRemaining,
  className
}: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageIcon = (stage: ProgressStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 text-blue-500"
          >
            {stage.icon}
          </motion.div>
        );
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 text-gray-400">{stage.icon}</div>;
    }
  };

  const getStageStatus = (stage: ProgressStage) => {
    switch (stage.status) {
      case 'completed':
        return <Badge variant="success" size="sm">已完成</Badge>;
      case 'running':
        return <Badge variant="primary" size="sm">进行中</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">错误</Badge>;
      case 'paused':
        return <Badge variant="warning" size="sm">已暂停</Badge>;
      default:
        return <Badge variant="default" size="sm">等待中</Badge>;
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  const isCompleted = overallProgress >= 100;
  const hasError = stages.some(stage => stage.status === 'error');

  return (
    <div className={cn('space-y-6', className)}>
      {/* 总体进度卡片 */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI 报告生成进度
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              已用时: {formatTime(elapsedTime)}
              {estimatedTimeRemaining && !isCompleted && (
                <span className="ml-2">
                  剩余: {formatTime(estimatedTimeRemaining)}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">整体进度</span>
              <span className="text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  hasError
                    ? 'bg-red-500'
                    : isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canPause && !isCompleted && !hasError && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePauseResume}
                  leftIcon={isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                >
                  {isPaused ? '继续' : '暂停'}
                </Button>
              )}

              {canRetry && (hasError || isCompleted) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  重新生成
                </Button>
              )}

              {isRunning && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                >
                  取消
                </Button>
              )}
            </div>

            {isCompleted && !hasError && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={onViewResult}
                >
                  预览结果
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  下载报告
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 详细阶段进度 */}
      <Card>
        <CardHeader>
          <CardTitle>详细进度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-lg border transition-all duration-300',
                stage.status === 'running'
                  ? 'border-blue-200 bg-blue-50'
                  : stage.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : stage.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* 图标 */}
                <div className="flex-shrink-0 mt-1">
                  {getStageIcon(stage)}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{stage.name}</h3>
                    {getStageStatus(stage)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{stage.description}</p>

                  {/* 进度条 */}
                  {stage.status !== 'pending' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>进度</span>
                        <span>{Math.round(stage.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            stage.status === 'error'
                              ? 'bg-red-400'
                              : stage.status === 'completed'
                              ? 'bg-green-400'
                              : 'bg-blue-400'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 指标信息 */}
                  {stage.metrics && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      {stage.metrics.processed !== undefined && stage.metrics.total !== undefined && (
                        <span>已处理: {stage.metrics.processed}/{stage.metrics.total}</span>
                      )}
                      {stage.metrics.rate !== undefined && (
                        <span>速率: {stage.metrics.rate}/s</span>
                      )}
                      {stage.estimatedTime && stage.status === 'running' && (
                        <span>预计耗时: {Math.round(stage.estimatedTime)}s</span>
                      )}
                      {stage.actualTime && stage.status === 'completed' && (
                        <span>实际耗时: {Math.round(stage.actualTime)}s</span>
                      )}
                    </div>
                  )}

                  {/* 详细信息 */}
                  {stage.details && stage.details.length > 0 && stage.status === 'running' && (
                    <div className="mt-3 text-xs text-gray-600">
                      <AnimatePresence mode="wait">
                        {stage.details.map((detail, detailIndex) => (
                          <motion.div
                            key={detailIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2"
                          >
                            <Zap className="w-3 h-3 text-blue-400" />
                            {detail}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* 时间信息 */}
                <div className="flex-shrink-0 text-right text-xs text-gray-500">
                  {stage.status === 'completed' && stage.actualTime && (
                    <div>{Math.round(stage.actualTime)}s</div>
                  )}
                  {stage.status === 'running' && stage.estimatedTime && (
                    <div className="text-blue-500">~{Math.round(stage.estimatedTime)}s</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* 完成状态 */}
      <AnimatePresence>
        {isCompleted && !hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">报告生成完成！</h3>
            <p className="text-gray-600 mb-6">
              您的AI报告已经成功生成，总耗时 {formatTime(elapsedTime)}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button leftIcon={<Eye className="w-4 h-4" />} onClick={onViewResult}>
                预览报告
              </Button>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                下载报告
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误状态 */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">生成过程中出现错误</h3>
            <p className="text-gray-600 mb-6">
              请检查错误信息并重试，或联系技术支持
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button leftIcon={<RotateCcw className="w-4 h-4" />} onClick={onRetry}>
                重新生成
              </Button>
              <Button variant="outline">
                联系支持
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProgressTracker;

// 预设的进度阶段配置
export const defaultProgressStages: ProgressStage[] = [
  {
    id: 'data_validation',
    name: '数据验证',
    description: '验证输入数据的完整性和准确性',
    icon: <Database className="w-5 h-5" />,
    status: 'pending',
    progress: 0
  },
  {
    id: 'market_analysis',
    name: '市场分析',
    description: '分析市场数据和竞争环境',
    icon: <TrendingUp className="w-5 h-5" />,
    status: 'pending',
    progress: 0
  },
  {
    id: 'content_generation',
    name: 'AI内容生成',
    description: '使用AI生成报告内容和洞察',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'pending',
    progress: 0
  },
  {
    id: 'document_creation',
    name: '文档生成',
    description: '创建最终的报告文档',
    icon: <FileText className="w-5 h-5" />,
    status: 'pending',
    progress: 0
  }
];