'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOnboarding } from './OnboardingContext';
import { getAvailableTours, getTourById } from './tours';

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedTourId: string;
}

export function CompletionModal({ open, onOpenChange, completedTourId }: CompletionModalProps) {
  const { state, startTour, restartTour } = useOnboarding();
  const [selectedNextTour, setSelectedNextTour] = useState<string>('');

  const completedTour = getTourById(completedTourId);
  const availableTours = getAvailableTours();
  const uncompletedTours = availableTours.filter(
    tour => !state.completedTours.includes(tour.id) && tour.id !== completedTourId
  );

  const handleStartNextTour = () => {
    if (selectedNextTour) {
      startTour(selectedNextTour);
      onOpenChange(false);
    }
  };

  const handleRestartTour = () => {
    restartTour(completedTourId);
    onOpenChange(false);
  };

  const getProgressStats = () => {
    const totalTours = availableTours.length;
    const completedCount = state.completedTours.filter(id =>
      availableTours.some(tour => tour.id === id)
    ).length;

    // Add current completed tour if not already counted
    const actualCompleted = state.completedTours.includes(completedTourId)
      ? completedCount
      : completedCount + 1;

    return {
      completed: actualCompleted,
      total: totalTours,
      percentage: Math.round((actualCompleted / totalTours) * 100)
    };
  };

  const progressStats = getProgressStats();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      className="overflow-hidden"
    >
      <div className="p-0">
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white p-8 text-center relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 200,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: Math.random() * 200 - 50,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 relative z-10"
          >
            <Trophy className="w-10 h-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-2"
          >
            🎉 恭喜完成！
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/90"
          >
            您已成功完成 "{completedTour?.name}" 引导
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">学习进度: {progressStats.percentage}%</span>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Progress Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">学习进度</h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                <span>已完成 {progressStats.completed} / {progressStats.total} 个引导</span>
              </div>

              <div className="max-w-md mx-auto bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressStats.percentage}%` }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
            </div>

            {progressStats.percentage === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-bold text-gray-900 mb-1">完美掌握！</h4>
                <p className="text-sm text-gray-600">您已完成所有引导教程，现在可以熟练使用MarketPro的所有功能了！</p>
              </motion.div>
            )}
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">接下来您可以：</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Restart current tour */}
              <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <RotateCcw className="w-6 h-6 text-indigo-600 mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">重新学习</h4>
                <p className="text-sm text-gray-600 mb-3">重新体验当前教程，巩固学习效果</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestartTour}
                  className="w-full"
                >
                  重新开始
                </Button>
              </div>

              {/* Continue with next tour */}
              {uncompletedTours.length > 0 && (
                <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">继续学习</h4>
                  <p className="text-sm text-gray-600 mb-3">探索更多功能和高级技巧</p>

                  <select
                    value={selectedNextTour}
                    onChange={(e) => setSelectedNextTour(e.target.value)}
                    className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">选择下一个教程</option>
                    {uncompletedTours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    size="sm"
                    onClick={handleStartNextTour}
                    disabled={!selectedNextTour}
                    className="w-full"
                  >
                    开始学习
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Close Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex justify-center"
          >
            <Button
              onClick={() => onOpenChange(false)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            >
              开始使用 MarketPro
            </Button>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}