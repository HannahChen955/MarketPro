'use client';

import { TextareaHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  showCount?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant = 'default',
    label,
    error,
    success,
    helper,
    autoResize = false,
    minRows = 3,
    maxRows = 8,
    maxLength,
    showCount = false,
    fullWidth = true,
    animate = true,
    disabled,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 根据状态确定variant
    const actualVariant = error ? 'error' : success ? 'success' : variant;

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
    };

    // 自动调整高度
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);

      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    };

    // 处理值变化
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // 更新字符计数
      setCharCount(newValue.length);

      // 调整高度
      adjustHeight();

      // 调用原始onChange
      props.onChange?.(e);
    };

    // 初始化时调整高度和字符计数
    useEffect(() => {
      adjustHeight();
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    // 合并refs
    const mergeRefs = (element: HTMLTextAreaElement) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const textareaElement = (
      <div className="relative">
        <textarea
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 resize-none',
            variantClasses[actualVariant],
            fullWidth ? 'w-full' : '',
            className
          )}
          ref={mergeRefs}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          rows={autoResize ? minRows : props.rows || minRows}
          {...props}
        />

        {/* 焦点动画边框 */}
        {animate && isFocused && !error && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-blue-400 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* 字符计数 */}
        {(showCount || maxLength) && (
          <div className={cn(
            'absolute bottom-2 right-2 text-xs',
            maxLength && charCount > maxLength * 0.9
              ? 'text-red-500'
              : 'text-gray-500'
          )}>
            {maxLength ? `${charCount}/${maxLength}` : charCount}
          </div>
        )}
      </div>
    );

    // 如果只有文本域，直接返回
    if (!label && !error && !success && !helper) {
      return textareaElement;
    }

    // 返回完整的文本域组件（包含标签和辅助信息）
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* 标签 */}
        {label && (
          <label className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            disabled && 'text-gray-500'
          )}>
            {label}
          </label>
        )}

        {/* 文本域 */}
        {textareaElement}

        {/* 辅助信息 */}
        <div className="mt-1 space-y-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              {success}
            </motion.p>
          )}

          {helper && !error && !success && (
            <p className="text-sm text-gray-500">
              {helper}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };