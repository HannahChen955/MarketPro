'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getReportsByPhase, PHASE_CONFIG } from '@/config/reportDefinitions';
import { ReportDefinition } from '@/types/report';

// 报告卡片组件
const ReportCard = ({ report, projectId, phaseId }: {
  report: ReportDefinition;
  projectId: string;
  phaseId: string;
}) => {
  const handleCardClick = () => {
    if (report.implemented) {
      window.location.href = `/projects/${projectId}/${phaseId}/reports/${report.id}`;
    } else {
      alert('该报告模板尚未开通，当前版本仅支持结构展示。');
    }
  };

  return (
    <motion.div
      whileHover={report.implemented ? { scale: 1.02 } : {}}
      whileTap={report.implemented ? { scale: 0.98 } : {}}
      className={`rounded-xl p-6 shadow-sm border cursor-pointer transition-all ${
        report.implemented
          ? 'bg-white/90 backdrop-blur-sm border-gray-100 hover:shadow-md'
          : 'bg-gray-50/90 backdrop-blur-sm border-gray-200 opacity-75'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${
            report.implemented
              ? 'bg-indigo-100 text-indigo-600'
              : 'bg-gray-200 text-gray-500'
          }`}>
            <span className="text-2xl">{report.icon}</span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              report.implemented ? 'text-gray-900' : 'text-gray-600'
            }`}>
              {report.name}
            </h3>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs ${
                report.implemented
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.implemented ? '已实现' : '即将支持'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className={`text-sm mb-4 ${
        report.implemented ? 'text-gray-600' : 'text-gray-500'
      }`}>
        {report.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <span>⏱️ {report.estimatedTime}</span>
          <span>📊 {report.category}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {report.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            report.implemented
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!report.implemented}
        >
          {report.implemented ? '立即生成' : '即将支持'}
        </button>
      </div>
    </motion.div>
  );
};

interface PhasePageTemplateProps {
  projectId: string;
  phaseId: string;
}

export default function PhasePageTemplate({ projectId, phaseId }: PhasePageTemplateProps) {
  const phaseConfig = PHASE_CONFIG[phaseId as keyof typeof PHASE_CONFIG];
  const phaseReports = getReportsByPhase(phaseId);

  const implementedReports = phaseReports.filter(r => r.implemented);
  const placeholderReports = phaseReports.filter(r => !r.implemented);

  if (!phaseConfig) {
    return <div>阶段配置不存在</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 面包屑 */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link href="/projects" className="hover:text-indigo-600 transition-colors">
              项目管理
            </Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/projects/${projectId}`} className="hover:text-indigo-600 transition-colors">
              项目工作空间
            </Link>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-900">{phaseConfig.name}</span>
          </nav>
        </div>
      </div>

      {/* 阶段头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 {phaseConfig.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">{phaseConfig.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>📅 预计周期：{phaseConfig.estimatedDuration}</span>
                <span>📊 可用报告：{phaseReports.length} 个</span>
                <span>✅ 已实现：{implementedReports.length} 个</span>
              </div>
            </div>
            <div className="text-right">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium mb-2"
                disabled={implementedReports.length === 0}
              >
                📤 批量导出报告
              </motion.button>
              <div className="text-sm text-gray-500">
                已完成 {implementedReports.length}/{phaseReports.length} 个报告类型
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要目标 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 阶段主要目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phaseConfig.keyObjectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-700">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 报告列表 */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              📋 阶段报告
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                已实现 ({implementedReports.length})
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                即将支持 ({placeholderReports.length})
              </span>
              {implementedReports.length > 0 && (
                <button className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  批量生成报告
                </button>
              )}
            </div>
          </div>

          {phaseReports.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {phaseReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }
                  }}
                >
                  <ReportCard report={report} projectId={projectId} phaseId={phaseId} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                该阶段暂无可用报告
              </h3>
              <p className="text-gray-600">
                报告模板正在开发中，敬请期待
              </p>
            </div>
          )}
        </section>

        {/* 帮助信息 */}
        <div className="mt-12 bg-indigo-50/80 backdrop-blur-sm rounded-xl p-8 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                阶段使用指南
              </h3>
              <div className="text-indigo-700 text-sm space-y-2">
                <p>• <strong>循序渐进</strong>：建议按照报告优先级依次完成</p>
                <p>• <strong>数据准备</strong>：确保项目基础信息完整，提高生成质量</p>
                <p>• <strong>持续优化</strong>：可以根据实际情况随时更新和重新生成报告</p>
                <p>• <strong>团队协作</strong>：生成的报告可以导出分享给团队成员</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}