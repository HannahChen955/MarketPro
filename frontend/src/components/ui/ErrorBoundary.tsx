'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error;
  resetErrorBoundary?: () => void;
  showDetails?: boolean;
  variant?: 'page' | 'card' | 'inline';
}

export function ErrorDisplay({
  title = '出现错误',
  message = '抱歉，系统遇到了一些问题',
  error,
  resetErrorBoundary,
  showDetails = false,
  variant = 'page'
}: ErrorDisplayProps) {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent(`错误报告: ${title}`);
    const body = encodeURIComponent(`
错误标题: ${title}
错误信息: ${message}
错误详情: ${error?.message || '无详细信息'}
错误堆栈: ${error?.stack || '无堆栈信息'}
页面地址: ${window.location.href}
用户代理: ${navigator.userAgent}
时间: ${new Date().toISOString()}
    `);
    window.open(`mailto:support@marketpro.ai?subject=${subject}&body=${body}`);
  };

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">{title}</h3>
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">{title}</p>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-3 py-1 text-sm text-red-700 hover:text-red-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      </motion.div>
    );
  }

  // Page variant (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* 错误图标 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-white" />
        </motion.div>

        {/* 错误信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{message}</p>

          {error && showDetails && (
            <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                查看详细信息
              </summary>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <div>
                  <strong>错误信息:</strong>
                  <code className="block bg-white p-2 rounded border text-xs mt-1 overflow-auto">
                    {error.message}
                  </code>
                </div>
                {error.stack && (
                  <div>
                    <strong>错误堆栈:</strong>
                    <code className="block bg-white p-2 rounded border text-xs mt-1 overflow-auto max-h-32">
                      {error.stack}
                    </code>
                  </div>
                )}
              </div>
            </details>
          )}
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              重新加载
            </button>

            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>

          <button
            onClick={handleReportBug}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
          >
            <Bug className="w-4 h-4" />
            报告此问题
          </button>
        </motion.div>

        {/* 帮助信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500"
        >
          <p>如果问题持续出现，请联系技术支持:</p>
          <a
            href="mailto:support@marketpro.ai"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors mt-1"
          >
            <Mail className="w-4 h-4" />
            support@marketpro.ai
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 通用错误处理 Hook
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'Unknown'}:`, error);

    // 这里可以添加错误上报逻辑
    // 例如发送到 Sentry、LogRocket 等服务

    // 显示用户友好的错误信息
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return '网络连接失败，请检查网络设置';
    }

    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return '登录已过期，请重新登录';
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return '没有权限执行此操作';
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return '请求的资源不存在';
    }

    if (error.message.includes('500') || error.message.includes('Internal Server')) {
      return '服务器内部错误，请稍后重试';
    }

    // 默认错误信息
    return error.message || '操作失败，请稍后重试';
  };

  return { handleError };
}

// 错误边界组件
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error} />;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: undefined })}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}