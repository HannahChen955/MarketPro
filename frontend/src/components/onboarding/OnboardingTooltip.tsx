'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OnboardingStep } from './types';
import { cn } from '@/lib/utils';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  isVisible: boolean;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onSkipTour: () => void;
  onAction?: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export function OnboardingTooltip({
  step,
  isVisible,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onSkipTour,
  onAction
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    placement: 'center'
  });

  useEffect(() => {
    if (!isVisible || !step.target) {
      if (step.position === 'center') {
        setPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 200,
          placement: 'center'
        });
      }
      return;
    }

    const calculatePosition = () => {
      const element = document.querySelector(step.target!) as HTMLElement;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const gap = 16;

      let top = 0;
      let left = 0;
      let placement: 'top' | 'bottom' | 'left' | 'right' | 'center' = step.position || 'bottom';

      switch (placement) {
        case 'top':
          top = rect.top + scrollTop - tooltipHeight - gap;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
          break;

        case 'bottom':
          top = rect.bottom + scrollTop + gap;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
          break;

        case 'left':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left + scrollLeft - tooltipWidth - gap;
          break;

        case 'right':
          top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + scrollLeft + gap;
          break;

        case 'center':
          top = window.innerHeight / 2 - tooltipHeight / 2 + scrollTop;
          left = window.innerWidth / 2 - tooltipWidth / 2 + scrollLeft;
          break;

        default:
          placement = 'bottom';
          top = rect.bottom + scrollTop + gap;
          left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
      }

      // Ensure tooltip stays within viewport
      const minLeft = 16;
      const maxLeft = window.innerWidth - tooltipWidth - 16;
      left = Math.max(minLeft, Math.min(maxLeft, left));

      const minTop = 16;
      const maxTop = window.innerHeight - tooltipHeight - 16;

      if (top < minTop + scrollTop) {
        top = minTop + scrollTop;
        if (placement === 'top') placement = 'bottom';
      } else if (top > maxTop + scrollTop) {
        top = maxTop + scrollTop;
        if (placement === 'bottom') placement = 'top';
      }

      setPosition({ top, left, placement });
    };

    calculatePosition();

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [step.target, step.position, isVisible]);

  if (!isVisible) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "fixed bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md",
          position.placement === 'center' ? 'max-w-lg' : 'max-w-md'
        )}
        style={{
          top: position.top,
          left: position.left,
          zIndex: 10000,
          width: position.placement === 'center' ? '512px' : '384px',
        }}
      >
        {/* Tooltip Arrow */}
        {position.placement !== 'center' && (
          <div
            className={cn(
              "absolute w-3 h-3 bg-white border transform rotate-45",
              {
                'top-[-7px] left-1/2 -translate-x-1/2 border-b-0 border-r-0': position.placement === 'top',
                'bottom-[-7px] left-1/2 -translate-x-1/2 border-t-0 border-l-0': position.placement === 'bottom',
                'left-[-7px] top-1/2 -translate-y-1/2 border-t-0 border-r-0': position.placement === 'left',
                'right-[-7px] top-1/2 -translate-y-1/2 border-b-0 border-l-0': position.placement === 'right',
              }
            )}
          />
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-indigo-600">
                  步骤 {currentStepIndex + 1} / {totalSteps}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
            </div>

            <button
              onClick={onSkipTour}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              {step.description}
            </p>

            {step.content && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {step.content}
              </div>
            )}

            {step.action && (
              <div className="mb-4">
                <Button
                  onClick={() => {
                    step.action?.onClick();
                    onAction?.();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {step.action.label}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrev}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  上一步
                </Button>
              )}

              {step.skipable && !isLastStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  leftIcon={<SkipForward className="w-4 h-4" />}
                  className="text-gray-600"
                >
                  跳过
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={isLastStep ? onNext : onNext}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                rightIcon={isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {isLastStep ? '完成' : '下一步'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}