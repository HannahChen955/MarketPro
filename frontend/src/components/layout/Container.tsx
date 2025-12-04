'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
  xl: 'px-12'
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    size = 'xl',
    padding = 'md',
    center = true,
    children,
    ...props
  }, ref) => {
    return (
      <div
        className={cn(
          'w-full',
          sizeClasses[size],
          paddingClasses[padding],
          center && 'mx-auto',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };