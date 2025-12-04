'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { componentVariants } from '@/lib/design-system';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  animate?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hover = false,
    animate = false,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200';
    const variantClasses = componentVariants.card.variant[variant];
    const paddingClasses = componentVariants.card.padding[padding];

    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

    const cardElement = (
      <div
        className={cn(
          baseClasses,
          variantClasses,
          paddingClasses,
          hoverClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {cardElement}
        </motion.div>
      );
    }

    return cardElement;
  }
);

Card.displayName = 'Card';

// Card Header component
const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title component
const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-lg', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

// Card Description component
const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content component
const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { padding?: boolean }
>(({ className, padding = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(padding && 'pt-0', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

// Card Footer component
const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
};