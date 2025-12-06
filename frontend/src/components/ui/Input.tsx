'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentVariants } from '@/lib/design-system';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  /** Native input size attribute is exposed separately to avoid clashing with visual size */
  inputSize?: InputHTMLAttributes<HTMLInputElement>['size'];
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    inputSize,
    type = 'text',
    label,
    error,
    success,
    helper,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    fullWidth = true,
    animate = true,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // 根据状态确定variant
    const actualVariant = error ? 'error' : success ? 'success' : variant;

    const baseClasses = 'block w-full rounded-lg border bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50';

    const sizeClasses = componentVariants.input.size[size];
    const variantClasses = componentVariants.input.variant[actualVariant];
    const widthClass = fullWidth ? 'w-full' : '';

    // 计算padding以为图标留出空间
    let paddingClasses = '';
    if (leftIcon && rightIcon) {
      paddingClasses = size === 'sm' ? 'pl-8 pr-8' : size === 'lg' ? 'pl-12 pr-12' : 'pl-10 pr-10';
    } else if (leftIcon) {
      paddingClasses = size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10';
    } else if (rightIcon || showPasswordToggle || error || success) {
      paddingClasses = size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-12' : 'pr-10';
    }

    const inputElement = (
      <div className="relative">
        {/* 左侧图标 */}
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500',
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
          )}>
            {leftIcon}
          </div>
        )}

        {/* 输入框 */}
        <input
          type={inputType}
          className={cn(
            baseClasses,
            sizeClasses,
            variantClasses,
            paddingClasses,
            widthClass,
            className
          )}
          ref={ref}
          disabled={disabled}
          size={inputSize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* 右侧图标区域 */}
        <div className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {/* 状态图标 */}
          {error && (
            <AlertCircle className={cn(
              'text-red-500',
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            )} />
          )}

          {success && !error && (
            <Check className={cn(
              'text-green-500',
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            )} />
          )}

          {/* 密码显示切换 */}
          {isPassword && showPasswordToggle && !error && !success && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className={cn(
                  size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
                )} />
              ) : (
                <Eye className={cn(
                  size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
                )} />
              )}
            </button>
          )}

          {/* 自定义右侧图标 */}
          {rightIcon && !error && !success && (!isPassword || !showPasswordToggle) && rightIcon}
        </div>

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
      </div>
    );

    // 如果只有输入框，直接返回
    if (!label && !error && !success && !helper) {
      return inputElement;
    }

    // 返回完整的输入组件（包含标签和辅助信息）
    return (
      <div className={widthClass}>
        {/* 标签 */}
        {label && (
          <label className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            disabled && 'text-gray-500'
          )}>
            {label}
          </label>
        )}

        {/* 输入框 */}
        {inputElement}

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

Input.displayName = 'Input';

export { Input };
