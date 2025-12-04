'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  status: 'pending' | 'current' | 'completed' | 'error';
  optional?: boolean;
  estimatedTime?: string;
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  allowSkipToCompleted?: boolean;
  className?: string;
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  allowSkipToCompleted = false,
  className
}: WorkflowStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleStepClick = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.status === 'pending' && !allowSkipToCompleted) return;
    onStepClick?.(stepIndex);
  };

  const getStepStyles = (step: WorkflowStep, index: number) => {
    const isClickable = step.status !== 'pending' || allowSkipToCompleted;
    const isHovered = hoveredStep === index;

    const baseClasses = 'flex items-center transition-all duration-300';
    const clickableClasses = isClickable
      ? 'cursor-pointer hover:scale-105'
      : 'cursor-not-allowed opacity-60';

    return cn(baseClasses, clickableClasses);
  };

  const getIconStyles = (step: WorkflowStep, index: number) => {
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300';

    switch (step.status) {
      case 'completed':
        return cn(baseClasses, 'bg-green-500 border-green-500 text-white');
      case 'current':
        return cn(baseClasses, 'bg-blue-500 border-blue-500 text-white animate-pulse');
      case 'error':
        return cn(baseClasses, 'bg-red-500 border-red-500 text-white');
      default:
        return cn(baseClasses, 'bg-white border-gray-300 text-gray-500');
    }
  };

  const renderStepIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <Check className="w-5 h-5" />;
    }
    if (step.status === 'error') {
      return <AlertCircle className="w-5 h-5" />;
    }
    if (step.icon) {
      return <span className="w-5 h-5">{step.icon}</span>;
    }
    return <span className="text-sm font-semibold">{index + 1}</span>;
  };

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;

    const isCompleted = steps[index].status === 'completed';
    const connectorClasses = orientation === 'horizontal'
      ? 'flex-1 h-0.5 mx-4 transition-colors duration-300'
      : 'w-0.5 h-8 my-2 mx-auto transition-colors duration-300';

    return (
      <div
        className={cn(
          connectorClasses,
          isCompleted ? 'bg-green-500' : 'bg-gray-300'
        )}
      />
    );
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id}>
            <motion.div
              className={getStepStyles(step, index)}
              onClick={() => handleStepClick(index)}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              whileHover={{ x: step.status !== 'pending' ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={getIconStyles(step, index)}>
                {renderStepIcon(step, index)}
              </div>

              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    'font-medium',
                    step.status === 'current' ? 'text-blue-600' : 'text-gray-900',
                    step.status === 'pending' && 'text-gray-500'
                  )}>
                    {step.title}
                    {step.optional && (
                      <span className="ml-1 text-xs text-gray-400">(可选)</span>
                    )}
                  </h3>
                  {step.estimatedTime && step.status === 'current' && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {step.estimatedTime}
                    </div>
                  )}
                </div>
                <p className={cn(
                  'text-sm mt-1',
                  step.status === 'current' ? 'text-blue-500' : 'text-gray-600',
                  step.status === 'pending' && 'text-gray-400'
                )}>
                  {step.description}
                </p>
              </div>

              {step.status === 'current' && (
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-5 h-5 text-blue-500" />
                </motion.div>
              )}
            </motion.div>

            {renderConnector(index)}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <motion.div
            className={getStepStyles(step, index)}
            onClick={() => handleStepClick(index)}
            onMouseEnter={() => setHoveredStep(index)}
            onMouseLeave={() => setHoveredStep(null)}
            whileHover={{ scale: step.status !== 'pending' ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={getIconStyles(step, index)}>
                {renderStepIcon(step, index)}
              </div>

              <div className="mt-3 max-w-[120px]">
                <h3 className={cn(
                  'text-sm font-medium truncate',
                  step.status === 'current' ? 'text-blue-600' : 'text-gray-900',
                  step.status === 'pending' && 'text-gray-500'
                )}>
                  {step.title}
                </h3>
                <p className={cn(
                  'text-xs mt-1 line-clamp-2',
                  step.status === 'current' ? 'text-blue-500' : 'text-gray-600',
                  step.status === 'pending' && 'text-gray-400'
                )}>
                  {step.description}
                </p>
                {step.estimatedTime && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    {step.estimatedTime}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {renderConnector(index)}
        </div>
      ))}
    </div>
  );
}

// 步骤内容容器组件
export interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className }: StepContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('mt-8', className)}
    >
      {children}
    </motion.div>
  );
}

// 步骤导航按钮组件
export interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextDisabled?: boolean;
  nextText?: string;
  previousText?: string;
  skipText?: string;
  showSkip?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSkip,
  nextDisabled = false,
  nextText = '下一步',
  previousText = '上一步',
  skipText = '跳过',
  showSkip = false,
  isLastStep = false,
  isLoading = false,
  className
}: StepNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between mt-8', className)}>
      <div className="flex items-center gap-3">
        {currentStep > 0 && (
          <motion.button
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            onClick={onPrevious}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {previousText}
          </motion.button>
        )}

        {showSkip && !isLastStep && (
          <motion.button
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {skipText}
          </motion.button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* 进度指示器 */}
        <div className="text-sm text-gray-500">
          {currentStep + 1} / {totalSteps}
        </div>

        <motion.button
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            nextDisabled || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            isLastStep && 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          )}
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          whileHover={{ scale: nextDisabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: nextDisabled || isLoading ? 1 : 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              处理中...
            </div>
          ) : (
            isLastStep ? '完成' : nextText
          )}
        </motion.button>
      </div>
    </div>
  );
}