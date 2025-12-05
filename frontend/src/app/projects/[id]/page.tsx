'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types/project';
import { PHASE_CONFIG, getReportsByPhase } from '@/config/reportDefinitions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { AIAssistant, AIAssistantTrigger } from '@/components/chat/AIAssistant';
import { PhaseStatusManager, PhaseStatus } from '@/components/project/PhaseStatusManager';
import { activityService, Activity } from '@/services/activityService';

// Mock数据 - 后续替换为真实API
const mockProject: Project = {
  id: 'project-1',
  name: '万科翡翠公园',
  city: '深圳',
  type: 'residential',
  status: 'active',
  currentPhase: 'phase2',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-12-01'),
  basicInfo: {
    location: {
      address: '南山区深南大道1001号',
      district: '南山区'
    },
    scale: {
      landArea: 50000,
      buildingArea: 120000,
      plotRatio: 2.4,
      greenRate: 35
    },
    product: {
      totalUnits: 800,
      houseTypes: [],
      priceRange: {
        min: 450,
        max: 680,
        average: 565,
        avgPricePerSqm: 65000
      },
      features: ['精装修', '智能家居', '双学区']
    },
    timeline: {
      currentProgress: '产品定位阶段'
    }
  },
  competitors: [
    {
      id: 'comp-1',
      name: '华润悦府',
      location: { address: '南山科技园', district: '南山区', distance: 2.5 },
      status: 'selling',
      product: {
        houseTypes: [],
        priceRange: { min: 400, max: 650, average: 525, avgPricePerSqm: 62000 },
        features: ['精装修', '地铁上盖']
      },
      sales: { monthlyVolume: 30, totalSold: 280 },
      marketing: {
        strengths: ['地铁便利', '品牌溢价'],
        weaknesses: ['户型偏小', '配套不足'],
        marketingHighlights: ['地铁上盖', '名校学区']
      },
      lastUpdated: new Date()
    }
  ],
  targetAudience: {
    primaryGroup: {
      name: '改善型购房者',
      ageRange: '28-35岁',
      income: '家庭年收入80-150万',
      occupation: ['互联网', '金融', '医疗'],
      education: '本科及以上',
      familyStructure: '三口之家为主',
      buyingMotivation: 'upgrade',
      proportion: 60
    },
    preferences: {
      locationFactors: [
        { factor: '地铁便利性', importance: 9 },
        { factor: '学区资源', importance: 8 },
        { factor: '商圈配套', importance: 7 }
      ],
      productFactors: [
        { factor: '户型实用性', importance: 9 },
        { factor: '装修品质', importance: 8 }
      ],
      priceFactors: {
        budgetRange: '总价400-600万',
        paymentPreference: '首付3成，商贷7成',
        priceSeintivity: 7
      },
      decisionFactors: [
        { factor: '学区资源', weight: 9 },
        { factor: '交通便利', weight: 8 }
      ]
    },
    behavior: {
      informationSources: ['线上平台', '朋友推荐', '实地看房'],
      decisionTimeline: '3-6个月',
      visitFrequency: '周末为主',
      decisionInfluencers: ['配偶', '父母']
    },
    painPoints: ['通勤时间长', '学位竞争激烈', '价格敏感'],
    opportunities: ['首次改善', '政策利好', '配套完善']
  },
  stats: {
    totalReportsGenerated: 0,
    lastReportGeneratedAt: null,
    mostUsedReportType: null
  }
};

// 项目信息顶部栏组件
const ProjectInfoBar = ({ project, currentPhase }: { project: Project; currentPhase: string }) => {
  const getPhaseDisplayName = (phase: string) => {
    const phaseNames = {
      'new': '新增',
      'phase1': '拿地前可研',
      'phase2': '产品定位',
      'phase3': '开盘节点',
      'phase4': '运营期',
      'phase5': '外部合作'
    };
    return phaseNames[phase as keyof typeof phaseNames] || '未知阶段';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 项目基本信息 */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>📍 {project.city} · {project.basicInfo?.location.district}</span>
                <span>🏠 住宅项目</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  📊 {getPhaseDisplayName(currentPhase)}
                </span>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="flex items-center space-x-3">
            <Link href={`/projects/${project.id}/database`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📊 项目数据库
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ⚙️ 项目设置
            </motion.button>
            <motion.button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(`activities_${project.id}`);
                  console.log('🧹 已清除测试数据');
                  window.location.reload();
                }
              }}
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🧹 清除测试数据
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📤 导出所有报告
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 阶段概览卡片组件
const PhaseOverviewCard = ({ phaseId, project }: { phaseId: string; project: Project }) => {
  const phaseConfig = PHASE_CONFIG[phaseId as keyof typeof PHASE_CONFIG];
  const phaseReports = getReportsByPhase(phaseId);
  const implementedReports = phaseReports.filter(r => r.implemented);
  const placeholderReports = phaseReports.filter(r => !r.implemented);

  const isCurrentPhase = project.currentPhase === phaseId;

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border ${
      isCurrentPhase ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold mb-2 ${isCurrentPhase ? 'text-indigo-900' : 'text-gray-900'}`}>
            {phaseConfig?.name}
            {isCurrentPhase && <span className="ml-2 text-indigo-600">🎯 当前阶段</span>}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{phaseConfig?.description}</p>
        </div>
      </div>

      {/* 报告统计 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{phaseReports.length}</p>
          <p className="text-xs text-gray-500">总报告</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{implementedReports.length}</p>
          <p className="text-xs text-gray-500">已实现</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{placeholderReports.length}</p>
          <p className="text-xs text-gray-500">即将支持</p>
        </div>
      </div>

      {/* 主要目标 */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">主要目标：</p>
        <div className="flex flex-wrap gap-2">
          {phaseConfig?.keyObjectives.map((objective, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
            >
              {objective}
            </span>
          ))}
        </div>
      </div>

      {/* 进入阶段按钮 */}
      <Link href={`/projects/${project.id}/${phaseId}`}>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg transform ${
            isCurrentPhase
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:shadow-xl'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:shadow-xl'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            ✨ 进入阶段
          </span>
        </motion.button>
      </Link>
    </div>
  );
};

// 项目仪表板组件
const ProjectDashboard = ({
  project,
  phases,
  onStatusChange,
  onDateChange,
  onEstimatedDaysChange
}: {
  project: Project;
  phases: any[];
  onStatusChange: (phaseId: number, newStatus: PhaseStatus) => void;
  onDateChange?: (phaseId: number, startDate?: string, endDate?: string) => void;
  onEstimatedDaysChange?: (phaseId: number, estimatedDays: number) => void;
}) => {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [dataCompleteness, setDataCompleteness] = useState(0);

  // 计算数据完整度和生成最近活动
  React.useEffect(() => {
    const completeness = calculateDataCompleteness(project, phases);
    setDataCompleteness(completeness);

    const activities = generateRecentActivities(project, phases);
    setRecentActivities(activities);
  }, [project, phases]);

  // 计算实际的报告生成数量
  const actualReportCount = React.useMemo(() => {
    return activityService.getActivities(project.id).filter(a => a.type === 'report_generated').length;
  }, [project.id, recentActivities]);

  // 格式化时间显示
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}小时前`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}天前`;
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 项目概览 */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">项目概览</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">项目地址</p>
              <p className="font-medium text-gray-900">{project.basicInfo?.location.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">项目规模</p>
              <p className="font-medium text-gray-900">
                {project.basicInfo?.product.totalUnits} 套住宅
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">价格区间</p>
              <p className="font-medium text-gray-900">
                {project.basicInfo?.product.priceRange.min}-{project.basicInfo?.product.priceRange.max}万
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">当前进度</p>
              <p className="font-medium text-gray-900">{project.basicInfo?.timeline.currentProgress}</p>
            </div>
          </div>
        </div>

        {/* 项目阶段状态管理 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <PhaseStatusManager
            phases={phases}
            onStatusChange={onStatusChange}
            onDateChange={onDateChange}
            onEstimatedDaysChange={onEstimatedDaysChange}
          />
        </div>

        {/* 最近活动 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                    <span className="text-sm text-gray-600 flex-1">{activity.description}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">暂无活动记录</p>
                <p className="text-xs mt-1">开始使用系统后将显示活动历史</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">项目统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">生成报告</span>
              <span className="text-xl font-bold text-indigo-600">
                {actualReportCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">竞品项目</span>
              <span className="text-xl font-bold text-green-600">
                {project.competitors?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">数据完整度</span>
              <span className={`text-xl font-bold ${
                dataCompleteness >= 80 ? 'text-green-600' :
                dataCompleteness >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {dataCompleteness}%
              </span>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 快速直达</h3>
          <div className="space-y-3">
            <Link href={`/projects/${project.id}/database`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all text-sm font-medium shadow-md"
              >
                📊 项目数据库
                <span className="block text-xs text-purple-100 mt-1">编辑项目基础数据、竞品、客群</span>
              </motion.button>
            </Link>
            <Link href={`/reports/create?projectId=${project.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all text-sm font-medium shadow-md"
              >
                🎯 生成AI报告
                <span className="block text-xs text-indigo-100 mt-1">选择报告类型并立即生成</span>
              </motion.button>
            </Link>
            <Link href={`/projects/${project.id}/phase-2`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium shadow-md"
              >
                🚀 产品定位阶段
                <span className="block text-xs text-green-100 mt-1">进入当前项目阶段工作台</span>
              </motion.button>
            </Link>
          </div>

          {/* 使用提示 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 flex items-center">
              💡 <span className="ml-1">建议按顺序：完善数据 → 生成报告 → 进入阶段工作</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 数据完整度计算函数
const calculateDataCompleteness = (project: Project, phases: any[]) => {
  let totalFields = 0;
  let completedFields = 0;

  // 基础信息完整度
  const basicInfo = project.basicInfo;
  if (basicInfo) {
    // 位置信息
    totalFields += 2; // address, district
    if (basicInfo.location?.address) completedFields++;
    if (basicInfo.location?.district) completedFields++;

    // 规模信息
    totalFields += 4; // landArea, buildingArea, plotRatio, greenRate
    if (basicInfo.scale?.landArea) completedFields++;
    if (basicInfo.scale?.buildingArea) completedFields++;
    if (basicInfo.scale?.plotRatio) completedFields++;
    if (basicInfo.scale?.greenRate) completedFields++;

    // 产品信息
    totalFields += 4; // totalUnits, priceRange.min, priceRange.max, features
    if (basicInfo.product?.totalUnits) completedFields++;
    if (basicInfo.product?.priceRange?.min) completedFields++;
    if (basicInfo.product?.priceRange?.max) completedFields++;
    if (basicInfo.product?.features?.length) completedFields++;
  }

  // 竞品信息完整度
  totalFields += 1;
  if (project.competitors && project.competitors.length > 0) {
    completedFields++;
  }

  // 目标客群完整度
  totalFields += 1;
  if (project.targetAudience?.primaryGroup?.name) completedFields++;

  // 阶段状态完整度
  totalFields += 1;
  const activePhases = phases.filter(p => p.status !== '未开始');
  if (activePhases.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// 生成最近活动数据
const generateRecentActivities = (project: Project, phases: any[]): Activity[] => {
  // 从activityService读取活动历史
  const activities = activityService.getActivities(project.id);

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
};

// 智能阶段管理 - 根据报告生成情况自动判断当前阶段
const getSmartCurrentPhase = (projectId: string): string => {
  const activities = activityService.getActivities(projectId);
  const reportActivities = activities.filter(a => a.type === 'report_generated');

  // 调试信息
  console.log('🔍 智能阶段检测:');
  console.log('  所有活动:', activities);
  console.log('  报告活动:', reportActivities);

  // 如果没有生成任何报告，返回"新增"状态
  if (reportActivities.length === 0) {
    console.log('  ✅ 检测到新增状态 (无报告)');
    return 'new';
  }

  // 根据最近生成的报告类型判断当前阶段
  const reportTypeToPhase: Record<string, string> = {
    'pre-feasibility-study': 'phase1',           // 拿地前可研
    'market-competitor-research': 'phase1',      // 市场及竞品研究
    'competitor-analysis': 'phase2',             // 竞品分析 → 产品定位
    'overall-marketing-strategy': 'phase2',      // 营销策略 → 产品定位
    'launch-strategy': 'phase3',                 // 开盘策略 → 开盘节点
    'sales-optimization': 'phase4',              // 销售优化 → 运营期
    'partner-collaboration': 'phase5'            // 合作伙伴 → 外部合作
  };

  // 查找最高阶段（最新进展）
  let maxPhase = 'new';
  let maxPhaseNumber = 0;

  reportActivities.forEach(activity => {
    // 从活动描述中提取报告类型
    const description = activity.description;
    let reportType = '';

    if (description.includes('竞品分析')) {
      reportType = 'competitor-analysis';
    } else if (description.includes('营销策略')) {
      reportType = 'overall-marketing-strategy';
    } else if (description.includes('可行性')) {
      reportType = 'pre-feasibility-study';
    } else if (description.includes('市场研究')) {
      reportType = 'market-competitor-research';
    } else if (description.includes('开盘')) {
      reportType = 'launch-strategy';
    } else if (description.includes('销售')) {
      reportType = 'sales-optimization';
    } else if (description.includes('合作')) {
      reportType = 'partner-collaboration';
    }

    const phase = reportTypeToPhase[reportType];
    if (phase) {
      const phaseNumber = parseInt(phase.replace('phase', ''));
      if (phaseNumber > maxPhaseNumber) {
        maxPhaseNumber = phaseNumber;
        maxPhase = phase;
      }
    }
  });

  console.log('  🎯 最终检测阶段:', maxPhase);
  return maxPhase;
};

export default function ProjectWorkspacePage() {
  const [project] = useState<Project>(mockProject);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 智能阶段检测 - 只在客户端运行避免hydration错误
  const [smartCurrentPhase, setSmartCurrentPhase] = useState<string>('new'); // 默认新增状态

  useEffect(() => {
    // 只在客户端运行智能阶段检测
    if (typeof window !== 'undefined') {
      const detectedPhase = getSmartCurrentPhase(project.id);
      setSmartCurrentPhase(detectedPhase);
    }
  }, [project.id]);

  // 临时：清除测试数据的函数
  const clearTestData = () => {
    if (typeof window !== 'undefined') {
      // 清除活动数据
      localStorage.removeItem(`activities_${project.id}`);
      console.log('🧹 已清除测试数据');
      window.location.reload();
    }
  };

  // 阶段状态管理 - 使用localStorage持久化用户编辑
  const getInitialPhases = () => {
    const defaultPhases = [
      {
        id: 1,
        title: '拿地可研阶段',
        description: '深度市场调研，为拿地决策提供全面的数据支持和风险评估',
        status: '结束' as PhaseStatus,
        startDate: '2024-01-15',
        endDate: '2024-02-28',
        estimatedDays: 45
      },
      {
        id: 2,
        title: '产品定位阶段',
        description: '基于市场调研结果，制定产品定位和营销策略，完成营销方案设计',
        status: '结束' as PhaseStatus,
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        estimatedDays: 46
      },
      {
        id: 3,
        title: '开盘节点',
        description: '开盘营销活动策划执行，开盘后数据监控分析和策略优化',
        status: '进行中' as PhaseStatus,
        startDate: '2024-04-16',
        endDate: undefined,
        estimatedDays: 30
      },
      {
        id: 4,
        title: '持续运营期',
        description: '持续的营销数据监控分析，销售策略动态调整和效果优化',
        status: '未开始' as PhaseStatus,
        startDate: undefined,
        endDate: undefined,
        estimatedDays: 180
      },
      {
        id: 5,
        title: '合作伙伴协同',
        description: '与设计公司、广告代理、数据服务商等合作伙伴的协同合作',
        status: '未开始' as PhaseStatus,
        startDate: undefined,
        endDate: undefined,
        estimatedDays: 90
      }
    ];

    // 尝试从localStorage读取保存的数据
    if (typeof window !== 'undefined') {
      try {
        const savedPhases = localStorage.getItem(`phases_${project.id}`);
        if (savedPhases) {
          return JSON.parse(savedPhases);
        }
      } catch (error) {
        console.warn('无法读取保存的阶段数据:', error);
      }
    }

    return defaultPhases;
  };

  const [phases, setPhases] = useState(getInitialPhases);

  const handleStatusChange = (phaseId: number, newStatus: PhaseStatus) => {
    setPhases(prev => {
      const phase = prev.find(p => p.id === phaseId);
      const updatedPhases = prev.map(phase =>
        phase.id === phaseId
          ? {
              ...phase,
              status: newStatus,
              // 自动设置开始时间（如果从"未开始"变为"进行中"）
              startDate: newStatus === '进行中' && !phase.startDate
                ? new Date().toISOString().split('T')[0]
                : phase.startDate,
              // 自动设置结束时间（如果变为"结束"）
              endDate: newStatus === '结束' && !phase.endDate
                ? new Date().toISOString().split('T')[0]
                : phase.endDate
            }
          : phase
      );

      // 保存到localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`phases_${project.id}`, JSON.stringify(updatedPhases));
        } catch (error) {
          console.warn('无法保存阶段数据:', error);
        }
      }

      // 记录活动
      if (phase) {
        activityService.recordPhaseChange(project.id, phase.title, newStatus);
      }

      return updatedPhases;
    });
  };

  const handleDateChange = (phaseId: number, startDate?: string, endDate?: string) => {
    setPhases(prev => {
      const updatedPhases = prev.map(phase =>
        phase.id === phaseId
          ? { ...phase, startDate, endDate }
          : phase
      );

      // 保存到localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`phases_${project.id}`, JSON.stringify(updatedPhases));
        } catch (error) {
          console.warn('无法保存阶段数据:', error);
        }
      }

      // 记录活动
      const phase = prev.find(p => p.id === phaseId);
      if (phase) {
        activityService.recordDataUpdate(project.id, `${phase.title}时间安排`);
      }

      return updatedPhases;
    });
  };

  const handleEstimatedDaysChange = (phaseId: number, estimatedDays: number) => {
    setPhases(prev => {
      const updatedPhases = prev.map(phase =>
        phase.id === phaseId
          ? { ...phase, estimatedDays }
          : phase
      );

      // 保存到localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`phases_${project.id}`, JSON.stringify(updatedPhases));
        } catch (error) {
          console.warn('无法保存阶段数据:', error);
        }
      }

      // 记录活动
      const phase = prev.find(p => p.id === phaseId);
      if (phase) {
        activityService.recordDataUpdate(project.id, `${phase.title}预估时间`);
      }

      return updatedPhases;
    });
  };

  // AI助手状态管理
  const [isAIOpen, setIsAIOpen] = useState(false);

  const toggleAI = () => setIsAIOpen(!isAIOpen);
  const closeAI = () => setIsAIOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 面包屑 */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link href="/projects" className="hover:text-indigo-600 transition-colors">
              项目管理
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">{project.name}</span>
          </nav>
        </div>
      </div>

      {/* 项目信息栏 */}
      <ProjectInfoBar project={project} currentPhase={smartCurrentPhase} />

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full p-3 h-16">
            <TabsTrigger
              value="dashboard"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'new'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              📊 概览
            </TabsTrigger>
            <TabsTrigger
              value="phase1"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'phase1'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              拿地前可研
            </TabsTrigger>
            <TabsTrigger
              value="phase2"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'phase2'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              产品定位
            </TabsTrigger>
            <TabsTrigger
              value="phase3"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'phase3'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              开盘节点
            </TabsTrigger>
            <TabsTrigger
              value="phase4"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'phase4'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              运营期
            </TabsTrigger>
            <TabsTrigger
              value="phase5"
              className={`flex items-center justify-center h-full px-6 py-4 rounded-full font-medium transition-all duration-300 hover:bg-gray-100 text-gray-700 data-[state=active]:border-0 ${
                smartCurrentPhase === 'phase5'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm'
                  : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105'
              }`}
            >
              外部合作
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <ProjectDashboard
              project={project}
              phases={phases}
              onStatusChange={handleStatusChange}
              onDateChange={handleDateChange}
              onEstimatedDaysChange={handleEstimatedDaysChange}
            />
          </TabsContent>

          <TabsContent value="phase1" className="mt-8">
            <PhaseOverviewCard phaseId="phase1" project={project} />
          </TabsContent>

          <TabsContent value="phase2" className="mt-8">
            <PhaseOverviewCard phaseId="phase2" project={project} />
          </TabsContent>

          <TabsContent value="phase3" className="mt-8">
            <PhaseOverviewCard phaseId="phase3" project={project} />
          </TabsContent>

          <TabsContent value="phase4" className="mt-8">
            <PhaseOverviewCard phaseId="phase4" project={project} />
          </TabsContent>

          <TabsContent value="phase5" className="mt-8">
            <PhaseOverviewCard phaseId="phase5" project={project} />
          </TabsContent>
        </Tabs>
      </main>

      {/* AI助手触发按钮 */}
      <AIAssistantTrigger
        onClick={toggleAI}
        hasNewMessage={false}
      />

      {/* AI助手聊天界面 */}
      <AIAssistant
        isOpen={isAIOpen}
        onToggle={toggleAI}
        onClose={closeAI}
        position="fixed"
        context={{
          currentStep: '项目工作空间',
          projectData: project
        }}
      />
    </div>
  );
}