'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animate?: boolean;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({
    className,
    label,
    description,
    size = 'md',
    variant = 'default',
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

    const dotSizeClasses = {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3'
    };

    const variantClasses = {
      default: 'border-gray-300 data-[state=checked]:border-blue-600 focus:ring-blue-500',
      success: 'border-gray-300 data-[state=checked]:border-green-600 focus:ring-green-500',
      warning: 'border-gray-300 data-[state=checked]:border-yellow-600 focus:ring-yellow-500',
      error: 'border-gray-300 data-[state=checked]:border-red-600 focus:ring-red-500'
    };

    const dotVariantClasses = {
      default: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600'
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    const radioElement = (
      <div className="relative">
        <input
          type="radio"
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
            'flex items-center justify-center rounded-full border-2 bg-white transition-all duration-200 cursor-pointer',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'opacity-50 cursor-not-allowed',
            isFocused && 'ring-2 ring-offset-1',
            className
          )}
          data-state={checked ? 'checked' : 'unchecked'}
        >
          {/* 内部圆点 */}
          {animate ? (
            <motion.div
              className={cn(
                'rounded-full',
                dotSizeClasses[size],
                dotVariantClasses[variant]
              )}
              initial={false}
              animate={{
                scale: checked ? 1 : 0,
                opacity: checked ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            checked && (
              <div
                className={cn(
                  'rounded-full',
                  dotSizeClasses[size],
                  dotVariantClasses[variant]
                )}
              />
            )
          )}
        </div>

        {/* 焦点指示器 */}
        {animate && isFocused && !disabled && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full border-2 border-blue-400 pointer-events-none',
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

    // 如果没有标签，直接返回单选框
    if (!label && !description) {
      return radioElement;
    }

    // 返回带标签的单选框
    return (
      <label className={cn(
        'flex items-start gap-3 cursor-pointer',
        disabled && 'cursor-not-allowed'
      )}>
        {radioElement}

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

RadioButton.displayName = 'RadioButton';

// RadioGroup 组件
export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    value,
    onValueChange,
    children,
    className,
    orientation = 'vertical',
    disabled,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { RadioButton };