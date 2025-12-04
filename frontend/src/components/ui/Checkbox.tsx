'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  indeterminate?: boolean;
  animate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    label,
    description,
    size = 'md',
    variant = 'default',
    indeterminate = false,
    animate = true,
    disabled,
    checked,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    const variantClasses = {
      default: 'border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 focus:ring-blue-500',
      success: 'border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 focus:ring-green-500',
      warning: 'border-gray-300 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600 focus:ring-yellow-500',
      error: 'border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 focus:ring-red-500'
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    const checkboxElement = (
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          disabled={disabled}
          checked={checked}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        <div
          className={cn(
            'flex items-center justify-center rounded border-2 bg-white transition-all duration-200 cursor-pointer',
            sizeClasses[size],
            variantClasses[variant],
            checked || indeterminate ? 'border-opacity-100' : 'border-opacity-70',
            disabled && 'opacity-50 cursor-not-allowed',
            isFocused && 'ring-2 ring-offset-1',
            className
          )}
          data-state={checked ? 'checked' : indeterminate ? 'indeterminate' : 'unchecked'}
        >
          {/* 复选标记 */}
          {animate ? (
            <motion.div
              initial={false}
              animate={{
                scale: checked || indeterminate ? 1 : 0,
                opacity: checked || indeterminate ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {indeterminate ? (
                <Minus className={cn('text-white', iconSizeClasses[size])} />
              ) : (
                <Check className={cn('text-white', iconSizeClasses[size])} />
              )}
            </motion.div>
          ) : (
            (checked || indeterminate) && (
              indeterminate ? (
                <Minus className={cn('text-white', iconSizeClasses[size])} />
              ) : (
                <Check className={cn('text-white', iconSizeClasses[size])} />
              )
            )
          )}
        </div>

        {/* 焦点指示器 */}
        {animate && isFocused && !disabled && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded border-2 border-blue-400 pointer-events-none',
              sizeClasses[size]
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );

    // 如果没有标签，直接返回复选框
    if (!label && !description) {
      return checkboxElement;
    }

    // 返回带标签的复选框
    return (
      <label className={cn(
        'flex items-start gap-3 cursor-pointer',
        disabled && 'cursor-not-allowed'
      )}>
        {checkboxElement}

        <div className="flex-1 min-w-0">
          {label && (
            <div className={cn(
              'font-medium text-gray-900',
              labelSizeClasses[size],
              disabled && 'text-gray-500'
            )}>
              {label}
            </div>
          )}
          {description && (
            <div className={cn(
              'text-gray-600 mt-0.5',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs',
              disabled && 'text-gray-400'
            )}>
              {description}
            </div>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };