'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentVariants } from '@/lib/design-system';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    animate = true,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const sizeClasses = componentVariants.button.size[size];
    const variantClasses = componentVariants.button.variant[variant];
    const widthClass = fullWidth ? 'w-full' : '';

    const buttonContent = (
      <>
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </>
    );

    const buttonElement = (
      <button
        className={cn(
          baseClasses,
          sizeClasses,
          variantClasses,
          widthClass,
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {buttonContent}
      </button>
    );

    if (animate && !disabled && !isLoading) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {buttonElement}
        </motion.div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = 'Button';

export { Button };