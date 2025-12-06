'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // 自动隐藏
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onHideToast: (id: string) => void;
}

function ToastContainer({ toasts, onHideToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => onHideToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgClass: 'bg-green-50 border-green-200',
        iconClass: 'text-green-600',
        titleClass: 'text-green-900',
        messageClass: 'text-green-700',
      },
      error: {
        icon: AlertCircle,
        bgClass: 'bg-red-50 border-red-200',
        iconClass: 'text-red-600',
        titleClass: 'text-red-900',
        messageClass: 'text-red-700',
      },
      warning: {
        icon: AlertTriangle,
        bgClass: 'bg-yellow-50 border-yellow-200',
        iconClass: 'text-yellow-600',
        titleClass: 'text-yellow-900',
        messageClass: 'text-yellow-700',
      },
      info: {
        icon: Info,
        bgClass: 'bg-blue-50 border-blue-200',
        iconClass: 'text-blue-600',
        titleClass: 'text-blue-900',
        messageClass: 'text-blue-700',
      },
    };
    return configs[type];
  };

  const config = getToastConfig(toast.type);
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={`${config.bgClass} border rounded-lg shadow-lg backdrop-blur-sm p-4 relative overflow-hidden`}
    >
      {/* 进度条 */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
        />
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${config.iconClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.titleClass}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`text-sm mt-1 ${config.messageClass}`}>
              {toast.message}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={`text-sm font-medium hover:underline ${config.titleClass}`}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors ${config.iconClass}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// 便捷方法
export function createToastHelpers() {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'success', title, message, ...options }),

    error: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'error', title, message, duration: 8000, ...options }),

    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'warning', title, message, ...options }),

    info: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: 'info', title, message, ...options }),

    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ): Promise<T> => {
      const loadingToast = Math.random().toString(36).substr(2, 9);

      showToast({
        type: 'info',
        title: messages.loading,
        duration: 0,
      });

      try {
        const result = await promise;
        showToast({
          type: 'success',
          title: messages.success,
        });
        return result;
      } catch (error) {
        showToast({
          type: 'error',
          title: messages.error,
          message: error instanceof Error ? error.message : '未知错误',
        });
        throw error;
      }
    },
  };
}

// Toast Hook with helpers
export function useToastHelpers() {
  const toast = useToast();

  return {
    ...toast,
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      toast.showToast({ type: 'success', title, message, ...options }),

    error: (title: string, message?: string, options?: Partial<Toast>) =>
      toast.showToast({ type: 'error', title, message, duration: 8000, ...options }),

    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      toast.showToast({ type: 'warning', title, message, ...options }),

    info: (title: string, message?: string, options?: Partial<Toast>) =>
      toast.showToast({ type: 'info', title, message, ...options }),

    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ): Promise<T> => {
      // 显示加载状态
      toast.showToast({
        type: 'info',
        title: messages.loading,
        duration: 0,
      });

      try {
        const result = await promise;
        toast.clearAllToasts(); // 清除加载状态
        toast.showToast({
          type: 'success',
          title: messages.success,
        });
        return result;
      } catch (error) {
        toast.clearAllToasts(); // 清除加载状态
        toast.showToast({
          type: 'error',
          title: messages.error,
          message: error instanceof Error ? error.message : '未知错误',
        });
        throw error;
      }
    },
  };
}