'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  center?: boolean;
}

export function Container({
  children,
  className,
  size = 'lg',
  center = false
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        'w-full px-4 mx-auto',
        sizeClasses[size],
        center && 'text-center',
        className
      )}
    >
      {children}
    </div>
  );
}

export type { ContainerProps };