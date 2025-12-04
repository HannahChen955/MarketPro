'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Clock, Settings, Play, Plus, AlertCircle } from 'lucide-react';
import { ReportType } from '@/types/report';

interface ReportCardProps {
  report: ReportType;
}

export function ReportCard({ report }: ReportCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    if (report.status === 'placeholder') {
      router.push(`/reports/create?template=${report.id}`);
    } else if (report.status === 'active') {
      router.push(`/workflow/${report.id}`);
    }
  };

  const handleConfigClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/reports/${report.id}/edit`);
  };

  const getStatusConfig = () => {
    switch (report.status) {
      case 'active':
        return {
          bgClass: 'bg-white/90 border-transparent hover:border-blue-200 hover:shadow-lg',
          textClass: 'text-gray-900',
          badgeClass: 'bg-green-100 text-green-700',
          badge: '✅ 可用'
        };
      case 'placeholder':
        return {
          bgClass: 'bg-white/60 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/80',
          textClass: 'text-gray-600',
          badgeClass: 'bg-blue-100 text-blue-700',
          badge: '⚙️ 待配置'
        };
      case 'coming_soon':
        return {
          bgClass: 'bg-gradient-to-br from-purple-100 to-pink-100 border-transparent cursor-default',
          textClass: 'text-gray-700',
          badgeClass: 'bg-yellow-100 text-yellow-700',
          badge: '🚀 即将推出'
        };
      default:
        return {
          bgClass: 'bg-white/90 border-gray-200',
          textClass: 'text-gray-900',
          badgeClass: 'bg-gray-100 text-gray-700',
          badge: '草稿'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      className={`relative rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer group ${statusConfig.bgClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* 状态徽章 */}
      <div className="absolute -top-2 -right-2 z-10">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}>
          {statusConfig.badge}
        </span>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {/* 图标和标题区域 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`text-2xl sm:text-3xl md:text-4xl transition-all duration-300 ${
              report.status === 'placeholder' ? 'opacity-50' : ''
            } ${isHovered ? 'scale-110' : ''}`}>
              {report.status === 'placeholder' ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
              ) : (
                report.icon
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-base sm:text-lg leading-tight ${statusConfig.textClass}`}>
                {report.name}
              </h3>
              <p className={`text-sm mt-1 line-clamp-2 ${
                report.status === 'placeholder' ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {report.description}
              </p>
            </div>
          </div>

          {/* 配置按钮 */}
          {report.status === 'active' && (
            <motion.button
              onClick={handleConfigClick}
              className="opacity-60 hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </div>

        {/* 分类标签 */}
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {getCategoryName(report.category)}
          </span>
        </div>

        {/* 底部行动区域 */}
        <div className="space-y-3">
          {report.status === 'active' && (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{report.estimatedTime || '5-10分钟'}</span>
                </div>
                <div className="text-xs text-gray-400">
                  v{report.version || 1}
                </div>
              </div>

              <motion.button
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4" />
                开始生成
              </motion.button>
            </>
          )}

          {report.status === 'placeholder' && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 text-center">
                点击配置此报告类型
              </div>
              <motion.button
                className="w-full px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                配置模块
              </motion.button>
            </div>
          )}

          {report.status === 'coming_soon' && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>即将推出...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 悬停光效 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && report.status !== 'coming_soon' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* 激活状态的脉冲效果 */}
      {report.status === 'active' && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.05, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// 辅助函数
function getCategoryName(category: string): string {
  const categoryMap = {
    'market': '市场分析',
    'project': '项目研究',
    'investment': '投资分析',
    'sales': '销售报告'
  };
  return categoryMap[category] || category;
}