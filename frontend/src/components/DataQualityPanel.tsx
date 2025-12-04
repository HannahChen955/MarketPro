'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types/project';
import { useDataQuality, getQualityBadge, QualityScore } from '@/hooks/useDataQuality';

interface DataQualityPanelProps {
  project: Project;
  className?: string;
}

export default function DataQualityPanel({ project, className = '' }: DataQualityPanelProps) {
  const qualityScore = useDataQuality(project);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-6">
        {/* 总体评分 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">数据质量评分</h3>
          <QualityScoreBadge score={qualityScore.overall} />
        </div>

        {/* 分数环形图和概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 环形分数图 */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* 背景圆 */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* 进度圆 */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={qualityScore.overall >= 80 ? 'text-green-600' :
                           qualityScore.overall >= 60 ? 'text-blue-600' :
                           qualityScore.overall >= 40 ? 'text-yellow-600' : 'text-red-600'}
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 50 * (1 - qualityScore.overall / 100)
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              {/* 中心分数 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{qualityScore.overall}</div>
                  <div className="text-xs text-gray-500">总分</div>
                </div>
              </div>
            </div>
          </div>

          {/* 完整度信息 */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">数据完整度</span>
                <span className="text-sm text-gray-600">
                  {qualityScore.completeness.completed}/{qualityScore.completeness.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-indigo-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${qualityScore.completeness.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {qualityScore.completeness.percentage}% 完整
              </div>
            </div>

            {/* 快速改进建议 */}
            {qualityScore.suggestions.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 改进建议</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {qualityScore.suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                  {qualityScore.suggestions.length > 2 && (
                    <li className="font-medium">+ {qualityScore.suggestions.length - 2} 项更多建议</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 分类评分 */}
        <div className="space-y-3 mb-4">
          <CategoryScore
            label="基础信息"
            score={qualityScore.categories.basicInfo}
            icon="📋"
          />
          <CategoryScore
            label="竞品分析"
            score={qualityScore.categories.competitors}
            icon="🏢"
          />
          <CategoryScore
            label="目标客群"
            score={qualityScore.categories.targetAudience}
            icon="👥"
          />
          <CategoryScore
            label="时间规划"
            score={qualityScore.categories.timeline}
            icon="📅"
          />
        </div>

        {/* 展开/收起详细建议 */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>详细分析与建议</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg"
            >
              ↓
            </motion.span>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {qualityScore.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <div>
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  </div>
                ))}

                {qualityScore.overall < 70 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-600 text-lg">⚠️</span>
                      <div>
                        <h4 className="font-medium text-orange-800 mb-2">数据质量需要改进</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          当前数据质量偏低，可能会影响报告生成的准确性和深度。建议优先完善以下方面：
                        </p>
                        <div className="space-y-1 text-sm text-orange-700">
                          {qualityScore.categories.basicInfo < 70 && <p>• 完善项目基础信息</p>}
                          {qualityScore.categories.competitors < 70 && <p>• 增加竞品分析数据</p>}
                          {qualityScore.categories.targetAudience < 70 && <p>• 详化目标客群画像</p>}
                          {qualityScore.categories.timeline < 70 && <p>• 补充时间规划信息</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 质量评分徽章组件
function QualityScoreBadge({ score }: { score: number }) {
  const badge = getQualityBadge(score);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-gray-900">{score}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color} ${badge.bgColor}`}>
        {badge.label}
      </span>
    </div>
  );
}

// 分类评分组件
function CategoryScore({ label, score, icon }: { label: string; score: number; icon: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              score >= 80 ? 'bg-green-600' :
              score >= 60 ? 'bg-blue-600' :
              score >= 40 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <span className={`text-sm font-medium min-w-[2rem] text-right ${
          score >= 80 ? 'text-green-600' :
          score >= 60 ? 'text-blue-600' :
          score >= 40 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score}
        </span>
      </div>
    </div>
  );
}

// 数据质量快速指示器（用于其他页面）
export function DataQualityIndicator({ project, compact = false }: { project: Project; compact?: boolean }) {
  const qualityScore = useDataQuality(project);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 relative">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200" />
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className={qualityScore.overall >= 80 ? 'text-green-600' :
                       qualityScore.overall >= 60 ? 'text-blue-600' :
                       qualityScore.overall >= 40 ? 'text-yellow-600' : 'text-red-600'}
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={2 * Math.PI * 12 * (1 - qualityScore.overall / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{qualityScore.overall}</span>
          </div>
        </div>
        <span className="text-sm text-gray-600">数据质量</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">数据质量</span>
        <QualityScoreBadge score={qualityScore.overall} />
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${
            qualityScore.overall >= 80 ? 'bg-green-600' :
            qualityScore.overall >= 60 ? 'bg-blue-600' :
            qualityScore.overall >= 40 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
          style={{ width: `${qualityScore.overall}%` }}
        />
      </div>
    </div>
  );
}