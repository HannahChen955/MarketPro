'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, BookOpen, Users, BarChart3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from './OnboardingContext';
import { getAvailableTours } from './tours';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const { startTour, hideWelcomeScreen } = useOnboarding();
  const [selectedTour, setSelectedTour] = useState('welcome-tour');
  const availableTours = getAvailableTours();

  const handleStartTour = () => {
    startTour(selectedTour);
    onOpenChange(false);
  };

  const handleSkipTour = () => {
    hideWelcomeScreen();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      closeOnOverlayClick={false}
      closeOnEscapeKey={false}
      showCloseButton={false}
      className="overflow-hidden"
    >
      <div className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            欢迎使用 MarketPro AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/90 max-w-2xl mx-auto"
          >
            房地产营销全流程智能化解决方案，让我们一起开启您的智能营销之旅
          </motion.p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Value Propositions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">智能数据分析</h3>
              <p className="text-sm text-gray-600">AI驱动的市场分析和趋势预测</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50">
              <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">专业报告生成</h3>
              <p className="text-sm text-gray-600">5分钟自动生成专业营销报告</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">全程专业支持</h3>
              <p className="text-sm text-gray-600">24/7 AI助手和专业团队服务</p>
            </div>
          </motion.div>

          {/* Tour Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">选择引导方式</h3>
            <div className="space-y-3">
              {availableTours.map((tour) => (
                <div
                  key={tour.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTour === tour.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                  onClick={() => setSelectedTour(tour.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{tour.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tour.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedTour === tour.id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTour === tour.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full rounded-full bg-white border-2 border-indigo-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-end"
          >
            <Button
              variant="ghost"
              onClick={handleSkipTour}
              className="text-gray-600 hover:text-gray-800"
            >
              跳过引导
            </Button>

            <Button
              onClick={handleStartTour}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            >
              开始引导
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500"
          >
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>已服务 100+ 项目</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>95% 客户满意度</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>5分钟快速上手</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}