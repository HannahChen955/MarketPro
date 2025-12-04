'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentVariants } from '@/lib/design-system';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  animate?: boolean;
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    icon,
    closable = false,
    onClose,
    animate = false,
    dot = false,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 whitespace-nowrap';

    const sizeClasses = componentVariants.badge.size[size];
    const variantClasses = componentVariants.badge.variant[variant];

    // 点状徽章样式
    const dotClasses = dot ? 'w-2 h-2 p-0' : '';

    const badgeContent = (
      <>
        {/* 图标 */}
        {icon && !dot && (
          <span className={cn(
            'flex-shrink-0',
            children ? 'mr-1' : '',
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          )}>
            {icon}
          </span>
        )}

        {/* 文本内容 */}
        {!dot && children}

        {/* 关闭按钮 */}
        {closable && !dot && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className={cn(
              'ml-1 flex-shrink-0 rounded-full hover:bg-black/10 transition-colors',
              size === 'sm' ? 'w-3 h-3 p-0.5' : size === 'lg' ? 'w-5 h-5 p-1' : 'w-4 h-4 p-0.5'
            )}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </>
    );

    const badgeElement = (
      <div
        className={cn(
          baseClasses,
          sizeClasses,
          variantClasses,
          dotClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {badgeContent}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {badgeElement}
        </motion.div>
      );
    }

    return badgeElement;
  }
);

Badge.displayName = 'Badge';

// 特定用途的徽章组件
export const StatusBadge = forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  }
>(({ status, ...props }, ref) => {
  const statusMap = {
    active: { variant: 'success' as const, children: '活跃', dot: true },
    inactive: { variant: 'default' as const, children: '停用', dot: true },
    pending: { variant: 'warning' as const, children: '待处理', dot: true },
    success: { variant: 'success' as const, children: '成功', dot: true },
    error: { variant: 'error' as const, children: '错误', dot: true },
    warning: { variant: 'warning' as const, children: '警告', dot: true }
  };

  const config = statusMap[status];

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      dot={config.dot}
      {...props}
    >
      {props.children || config.children}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// 数字徽章组件
export const CountBadge = forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'children'> & {
    count: number;
    max?: number;
    showZero?: boolean;
  }
>(({ count, max = 99, showZero = false, ...props }, ref) => {
  if (!showZero && count === 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      ref={ref}
      variant="error"
      size="sm"
      {...props}
    >
      {displayCount}
    </Badge>
  );
});

CountBadge.displayName = 'CountBadge';

export { Badge };