'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, FileText, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsData {
  totalReports: number;
  monthlyIncrease: number;
  timesSaved: number;
  activeTemplates: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<StatsData>({
    totalReports: 0,
    monthlyIncrease: 0,
    timesSaved: 0,
    activeTemplates: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟API调用
    const fetchStats = async () => {
      // 这里应该调用真实的API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalReports: 127,
        monthlyIncrease: 23,
        timesSaved: 342,
        activeTemplates: 8
      });
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const statsConfig = [
    {
      id: 'reports',
      title: '已生成报告',
      value: stats.totalReports,
      change: `+${stats.monthlyIncrease}`,
      changeText: '本月新增',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'time',
      title: '节省时间',
      value: stats.timesSaved,
      unit: '小时',
      change: '+89',
      changeText: '本月节省',
      icon: Clock,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'templates',
      title: '活跃模板',
      value: stats.activeTemplates,
      change: '+2',
      changeText: '新增模板',
      icon: Zap,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'efficiency',
      title: '效率提升',
      value: 85,
      unit: '%',
      change: '+12%',
      changeText: '较上月',
      icon: TrendingUp,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
        >
          {/* 图标和趋势 */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
              <div className="text-xs text-gray-500">{stat.changeText}</div>
            </div>
          </div>

          {/* 数值和标题 */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <motion.span
                    className="text-2xl font-bold text-gray-900"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: (index * 0.1) + 0.3 }}
                  >
                    <CountingNumber
                      from={0}
                      to={stat.value}
                      duration={1000}
                      delay={(index * 0.1) + 0.3}
                    />
                  </motion.span>
                  {stat.unit && (
                    <span className="text-lg font-medium text-gray-600">
                      {stat.unit}
                    </span>
                  )}
                </>
              )}
            </div>

            <h3 className="text-sm font-medium text-gray-600">
              {stat.title}
            </h3>
          </div>

          {/* 进度条（某些卡片） */}
          {stat.id === 'efficiency' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// 数字动画组件
function CountingNumber({
  from,
  to,
  duration = 1000,
  delay = 0
}: {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;

        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // easing function
        const currentCount = Math.floor(from + (to - from) * easeOut);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [from, to, duration, delay]);

  return <span>{count}</span>;
}