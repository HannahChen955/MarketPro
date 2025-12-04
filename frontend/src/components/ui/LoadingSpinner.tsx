'use client';

import { motion } from 'framer-motion';
import { Loader2, FileText, Database, Zap } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'page' | 'inline' | 'overlay';
  message?: string;
  stage?: string;
  progress?: number;
  showProgress?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  message,
  stage,
  progress,
  showProgress = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const containerClasses = {
    default: '',
    page: 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center',
    inline: 'inline-flex items-center gap-2',
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
  };

  if (variant === 'page') {
    return (
      <div className={containerClasses.page}>
        <div className="text-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto"
            >
              <Loader2 className="w-8 h-8 text-white" />
            </motion.div>

            {/* 装饰性圆环 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-200 border-r-purple-200"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {message || '正在加载...'}
            </h3>
            {stage && (
              <p className="text-sm text-gray-600">
                当前阶段：{getStageDisplayName(stage)}
              </p>
            )}
            {showProgress && typeof progress === 'number' && (
              <div className="w-64 mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {progress}% 完成
                </div>
              </div>
            )}
          </div>

          {/* 装饰性图标 */}
          <div className="flex justify-center gap-4 text-gray-300">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              <FileText className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              <Database className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={containerClasses.overlay}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 text-center max-w-md mx-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Loader2 className="w-6 h-6 text-white" />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message || '正在处理...'}
          </h3>

          {stage && (
            <p className="text-sm text-gray-600 mb-3">
              {getStageDisplayName(stage)}
            </p>
          )}

          {showProgress && typeof progress === 'number' && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-sm text-gray-500">
                {progress}% 完成
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={containerClasses.inline}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={sizeClasses[size]} />
        </motion.div>
        {message && (
          <span className="text-sm text-gray-600">{message}</span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={sizeClasses[size]} />
      </motion.div>
    </div>
  );
}

// 阶段显示名称映射
function getStageDisplayName(stage: string): string {
  const stageMap: Record<string, string> = {
    'initializing': '初始化中',
    'analyzing': '分析配置',
    'data_collection': '收集数据',
    'content_generation': 'AI生成内容',
    'formatting': '格式化报告',
    'finalizing': '完成处理',
    'parsing': '解析文件',
    'extraction': '提取内容',
    'pattern_recognition': 'AI模式识别',
    'uploading': '上传文件',
    'processing': '处理中'
  };

  return stageMap[stage] || stage;
}