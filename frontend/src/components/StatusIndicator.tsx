'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  isValid?: boolean;
  error?: string | null;
  className?: string;
}

export default function StatusIndicator({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  isValid = true,
  error = null,
  className = ''
}: StatusIndicatorProps) {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '刚刚保存';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前保存`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前保存`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
    }
  };

  const getStatusContent = () => {
    if (error) {
      return {
        icon: '❌',
        text: '保存失败',
        detail: error,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }

    if (isSaving) {
      return {
        icon: '💾',
        text: '正在保存...',
        detail: null,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      };
    }

    if (!isValid) {
      return {
        icon: '⚠️',
        text: '数据验证失败',
        detail: '请检查表单中的错误信息',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: '📝',
        text: '有未保存的更改',
        detail: '系统将自动保存',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      };
    }

    if (lastSaved) {
      return {
        icon: '✅',
        text: '已保存',
        detail: formatLastSaved(lastSaved),
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }

    return {
      icon: '💤',
      text: '准备就绪',
      detail: '开始编辑数据',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    };
  };

  const status = getStatusContent();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${isSaving}-${hasUnsavedChanges}-${!!error}-${isValid}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`
          inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium
          ${status.bgColor} ${status.textColor} ${status.borderColor} ${className}
        `}
      >
        <span className="text-base">{status.icon}</span>
        <div>
          <span>{status.text}</span>
          {status.detail && (
            <div className="text-xs opacity-75 mt-0.5">
              {status.detail}
            </div>
          )}
        </div>

        {isSaving && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// 简化的固定状态指示器组件
export function SaveStatusBar({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  isValid = true,
  onRetry
}: {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  isValid?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 min-w-[280px]"
      >
        <div className="flex items-center justify-between">
          <StatusIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
            error={error}
            isValid={isValid}
          />

          {error && onRetry && (
            <button
              onClick={onRetry}
              className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              重试
            </button>
          )}
        </div>

        {!isValid && (
          <div className="mt-2 text-xs text-gray-600">
            <p>⚠️ 请修正表单中的错误后再保存</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// 表单字段错误提示组件
export function FieldError({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center space-x-1 text-red-600 text-sm mt-1"
    >
      <span className="text-xs">⚠️</span>
      <span>{error}</span>
    </motion.div>
  );
}

// 批量操作状态指示器
export function BatchOperationStatus({
  operations
}: {
  operations: { id: string; name: string; status: 'pending' | 'processing' | 'completed' | 'failed'; error?: string }[]
}) {
  const completedCount = operations.filter(op => op.status === 'completed').length;
  const failedCount = operations.filter(op => op.status === 'failed').length;
  const processingCount = operations.filter(op => op.status === 'processing').length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">批量操作进度</h4>
        <span className="text-sm text-gray-500">
          {completedCount + failedCount}/{operations.length}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-green-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / operations.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {operations.map(operation => (
          <div key={operation.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{operation.name}</span>
            <div className="flex items-center space-x-1">
              {operation.status === 'pending' && <span className="text-gray-500">⏳ 等待</span>}
              {operation.status === 'processing' && (
                <div className="flex items-center space-x-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full"
                  />
                  <span className="text-blue-600">处理中</span>
                </div>
              )}
              {operation.status === 'completed' && <span className="text-green-600">✅ 完成</span>}
              {operation.status === 'failed' && (
                <span className="text-red-600" title={operation.error}>❌ 失败</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}