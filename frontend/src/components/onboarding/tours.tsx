import React from 'react';
import { OnboardingTour } from './types';
import { Rocket, BarChart3, Users, FileText, Settings, Brain } from 'lucide-react';

export const onboardingTours: OnboardingTour[] = [
  {
    id: 'welcome-tour',
    name: '欢迎使用 MarketPro',
    description: '让我们一起了解房地产营销智能平台的强大功能',
    steps: [
      {
        id: 'welcome-intro',
        title: '欢迎来到 MarketPro! 👋',
        description: '这是您的房地产营销智能化助手，我们将帮助您快速掌握平台的核心功能。',
        position: 'center',
        content: (
          <div className="text-center py-4">
            <Rocket className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">开启智能营销之旅</h3>
            <p className="text-gray-600 mb-4">
              MarketPro 为您提供从拿地可研到运营管理的全生命周期营销支持
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="bg-blue-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                智能市场分析
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 mx-auto text-green-600 mb-1" />
                自动报告生成
              </div>
            </div>
          </div>
        ),
        skipable: false,
      },
      {
        id: 'navigation-overview',
        title: '导航栏功能',
        description: '了解平台的主要导航功能，快速访问您需要的工具。',
        target: '[data-onboarding="main-navigation"]',
        position: 'bottom',
        content: (
          <div className="space-y-2">
            <p className="text-gray-700">主导航栏包含：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>项目管理</strong>：创建和管理房地产项目</li>
              <li>• <strong>系统能力</strong>：查看平台功能概览</li>
              <li>• <strong>AI助手</strong>：获得智能分析支持</li>
            </ul>
          </div>
        ),
        skipable: true,
      },
      {
        id: 'project-creation',
        title: '创建第一个项目',
        description: '点击"创建项目"开始您的第一个房地产营销项目。',
        target: '[data-onboarding="create-project-btn"]',
        position: 'bottom',
        content: (
          <div className="space-y-2">
            <p className="text-gray-700">创建项目后，您可以：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 设置项目基本信息</li>
              <li>• 配置营销阶段</li>
              <li>• 开始数据收集和分析</li>
            </ul>
          </div>
        ),
        action: {
          label: '创建项目',
          onClick: () => {
            const btn = document.querySelector('[data-onboarding="create-project-btn"]') as HTMLElement;
            btn?.click();
          },
        },
        skipable: true,
      },
      {
        id: 'ai-assistant',
        title: 'AI智能助手',
        description: 'AI助手可以帮您分析数据、生成报告、回答问题。',
        target: '[data-onboarding="ai-assistant-btn"]',
        position: 'left',
        content: (
          <div className="space-y-2">
            <Brain className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-gray-700">AI助手能力包括：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 数据分析和洞察</li>
              <li>• 市场趋势预测</li>
              <li>• 自动报告生成</li>
              <li>• 策略建议</li>
            </ul>
          </div>
        ),
        skipable: true,
      },
      {
        id: 'system-capabilities',
        title: '系统能力展示',
        description: '查看完整的营销流程和报告体系，了解平台的全部功能。',
        target: '[data-onboarding="showcase-link"]',
        position: 'bottom',
        content: (
          <div className="space-y-2">
            <p className="text-gray-700">系统能力页面展示：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 五个关键营销阶段</li>
              <li>• 专业报告类型</li>
              <li>• 核心产出物</li>
              <li>• 最佳实践案例</li>
            </ul>
          </div>
        ),
        skipable: true,
      },
    ],
  },
  {
    id: 'project-workflow-tour',
    name: '项目工作流程',
    description: '深入了解房地产营销项目的完整工作流程',
    steps: [
      {
        id: 'phase-overview',
        title: '营销阶段概览',
        description: '房地产营销分为五个关键阶段，每个阶段都有特定的目标和产出。',
        position: 'center',
        content: (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <BarChart3 className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
              <h4 className="font-semibold text-gray-900">五大营销阶段</h4>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>阶段1: 拿地前可研阶段</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>阶段2: 前期开发阶段</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>阶段3: 开盘节点</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>阶段4: 运营期</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>阶段5: 外部合作</span>
              </div>
            </div>
          </div>
        ),
        skipable: false,
      },
      {
        id: 'phase-navigation',
        title: '阶段导航',
        description: '使用侧边栏或快捷导航在不同阶段间切换。',
        target: '[data-onboarding="phase-navigation"]',
        position: 'right',
        skipable: true,
      },
      {
        id: 'data-collection',
        title: '数据收集',
        description: '每个阶段都有对应的数据收集表单，填写项目相关信息。',
        target: '[data-onboarding="data-collection-form"]',
        position: 'top',
        skipable: true,
      },
      {
        id: 'report-generation',
        title: '报告生成',
        description: '基于收集的数据，系统将自动生成专业的营销报告。',
        target: '[data-onboarding="generate-report-btn"]',
        position: 'top',
        skipable: true,
      },
    ],
  },
  {
    id: 'ai-features-tour',
    name: 'AI功能深度体验',
    description: '探索MarketPro强大的AI分析和生成功能',
    steps: [
      {
        id: 'ai-chat-intro',
        title: 'AI对话助手',
        description: '与AI助手对话，获取专业的营销建议和数据分析。',
        target: '[data-onboarding="ai-chat"]',
        position: 'left',
        content: (
          <div className="space-y-2">
            <p className="text-gray-700">您可以询问：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "当前项目的市场前景如何？"</li>
              <li>• "推荐最佳的定价策略"</li>
              <li>• "生成竞品分析报告"</li>
            </ul>
          </div>
        ),
        skipable: true,
      },
      {
        id: 'ai-suggestions',
        title: 'AI智能建议',
        description: '系统会根据您的项目数据提供智能化的营销建议。',
        target: '[data-onboarding="ai-suggestions"]',
        position: 'right',
        skipable: true,
      },
      {
        id: 'auto-reports',
        title: '自动报告生成',
        description: 'AI可以基于您的数据自动生成专业报告，节省大量时间。',
        target: '[data-onboarding="auto-report-btn"]',
        position: 'top',
        skipable: true,
      },
    ],
  },
];

// Helper function to get tour by ID
export function getTourById(tourId: string): OnboardingTour | undefined {
  return onboardingTours.find(tour => tour.id === tourId);
}

// Helper function to get all available tours
export function getAvailableTours(): OnboardingTour[] {
  return onboardingTours;
}