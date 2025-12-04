'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { PlayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// 房地产营销流程数据
const marketingStages = [
  {
    id: 1,
    title: "拿地可研阶段",
    subtitle: "投资决策支持",
    description: "深度市场调研，为拿地决策提供全面的数据支持和风险评估",
    icon: "🔍",
    color: "from-blue-500 to-blue-600",
    services: [
      "区域市场深度调研",
      "土地价值评估分析",
      "竞品项目研究",
      "目标客群画像分析",
      "政策影响评估"
    ],
    deliverables: [
      "《项目可行性研究报告》",
      "《区域市场分析报告》",
      "《竞品调研报告》",
      "《客群画像研究报告》",
      "《拿地建议书》"
    ]
  },
  {
    id: 2,
    title: "产品定位阶段",
    subtitle: "营销策略制定",
    description: "基于市场调研结果，制定产品定位和营销策略，完成营销方案设计",
    icon: "🏗️",
    color: "from-purple-500 to-purple-600",
    services: [
      "产品定位策略制定",
      "营销策略规划",
      "推广方案设计",
      "价格策略制定",
      "渠道策略规划"
    ],
    deliverables: [
      "《产品定位策略报告》",
      "《整体营销方案》",
      "《推广策略方案》",
      "《价格策略建议》",
      "《营销预算方案》"
    ]
  },
  {
    id: 3,
    title: "开盘节点",
    subtitle: "开盘策略执行",
    description: "开盘营销活动策划执行，开盘后数据监控分析和策略优化",
    icon: "🔥",
    color: "from-red-500 to-red-600",
    services: [
      "开盘活动策划",
      "开盘数据监控",
      "销售数据分析",
      "客户反馈收集",
      "策略调整优化"
    ],
    deliverables: [
      "《开盘活动方案》",
      "《开盘数据报告》",
      "《销售分析报告》",
      "《市场反馈报告》",
      "《策略调整建议》"
    ]
  },
  {
    id: 4,
    title: "持续运营期",
    subtitle: "数据驱动优化",
    description: "持续的营销数据监控分析，销售策略动态调整和效果优化",
    icon: "📊",
    color: "from-green-500 to-green-600",
    services: [
      "销售数据监控",
      "营销效果分析",
      "竞品动态跟踪",
      "客户满意度调研",
      "营销策略优化"
    ],
    deliverables: [
      "《月度销售报告》",
      "《营销效果分析》",
      "《竞品监控报告》",
      "《客户调研报告》",
      "《优化建议报告》"
    ]
  },
  {
    id: 5,
    title: "合作伙伴协同",
    subtitle: "外部资源整合",
    description: "与设计公司、广告代理、数据服务商等合作伙伴的协同合作",
    icon: "🤝",
    color: "from-orange-500 to-orange-600",
    services: [
      "合作伙伴管理",
      "创意内容协调",
      "数据服务对接",
      "媒体投放协调",
      "第三方效果评估"
    ],
    deliverables: [
      "《合作伙伴评估》",
      "《创意执行报告》",
      "《数据对接报告》",
      "《媒体投放报告》",
      "《第三方效果评估》"
    ]
  }
];

export default function ShowcasePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              房地产营销全流程
              <br />
              <span className="text-yellow-300">智能报告体系</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-100">
              从拿地可研到运营管理，MarketPro 为房地产营销全生命周期提供专业的数据分析和报告生成服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/projects')}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                立即体验
              </Button>
              <Button
                className="border border-white bg-transparent text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-medium"
              >
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              完整的营销报告体系
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              覆盖房地产项目从拿地到销售全周期的五个关键阶段，提供结构化的数据分析和决策支持
            </p>
          </div>

          {/* Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {marketingStages.map((stage) => (
              <div
                key={stage.id}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Large Stage Number Indicator */}
                <div className="absolute -top-4 -left-4 z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stage.color} shadow-lg flex items-center justify-center border-4 border-white`}>
                    <span className="text-2xl font-black text-white">
                      {stage.id}
                    </span>
                  </div>
                </div>

                {/* Stage Header */}
                <div className={`bg-gradient-to-r ${stage.color} p-6 text-white pt-8`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          第 {stage.id} 阶段
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1">
                        {stage.title}
                      </h3>
                      <p className="text-white/90 text-sm font-medium">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage Content */}
                <div className="p-6">
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Services Section - Always Visible */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-blue-600">🔧</span>
                      服务内容
                    </h4>
                    <div className="space-y-2">
                      {stage.services.map((service, idx) => (
                        <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <span className="text-blue-800 font-medium text-sm">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Section - Always Visible */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-green-600">📋</span>
                      产出报告
                    </h4>
                    <div className="space-y-2">
                      {stage.deliverables.map((deliverable, idx) => (
                        <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <span className="text-green-800 font-medium text-sm">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            开始您的智能营销之旅
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            立即体验MarketPro，让数据驱动您的营销决策
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/reports/create')}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              免费开始使用
            </Button>
            <Button
              className="border border-white bg-transparent text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-medium"
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}