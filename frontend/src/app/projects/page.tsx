'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, ProjectQueryParams, ProjectStatus, PhaseId } from '@/types/project';
import { REPORT_STATS } from '@/config/reportDefinitions';
import ProjectCreateModal, { ProjectFormData } from '@/components/ProjectCreateModal';
import { AIAssistant, AIAssistantTrigger } from '@/components/chat/AIAssistant';
import AIAssistantDebug from '@/debug/AIAssistantDebug';

// Mock数据 - 后续替换为真实API
const mockProjects: Project[] = [
  {
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
    stats: {
      totalReportsGenerated: 8,
      lastReportGeneratedAt: new Date('2024-12-01'),
      mostUsedReportType: 'competitor-analysis'
    }
  },
  {
    id: 'project-2',
    name: '华润城市花园',
    city: '广州',
    type: 'residential',
    status: 'active',
    currentPhase: 'phase3',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-28'),
    stats: {
      totalReportsGenerated: 12,
      lastReportGeneratedAt: new Date('2024-11-28')
    }
  },
  {
    id: 'project-3',
    name: '绿地中央广场',
    city: '上海',
    type: 'commercial',
    status: 'completed',
    currentPhase: 'phase4',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-11-20'),
    stats: {
      totalReportsGenerated: 15,
      lastReportGeneratedAt: new Date('2024-11-20')
    }
  }
];

const ProjectCard = ({ project }: { project: Project }) => {
  const getPhaseDisplayName = (phase: string) => {
    const phaseNames = {
      phase1: '拿地前可研',
      phase2: '产品定位',
      phase3: '开盘节点',
      phase4: '运营期',
      phase5: '外部合作'
    };
    return phaseNames[phase as keyof typeof phaseNames] || phase;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-50',
      completed: 'text-blue-600 bg-blue-50',
      paused: 'text-yellow-600 bg-yellow-50',
      planning: 'text-gray-600 bg-gray-50'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getTypeDisplayName = (type: string) => {
    const typeNames = {
      residential: '住宅项目',
      commercial: '商业项目',
      villa: '别墅项目',
      mixed: '综合项目'
    };
    return typeNames[type as keyof typeof typeNames] || type;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <Link href={`/projects/${project.id}`}>
        <div className="space-y-4">
          {/* 项目标题 */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {project.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {project.city} · {getTypeDisplayName(project.type)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status === 'active' ? '进行中' :
                 project.status === 'completed' ? '已完成' :
                 project.status === 'paused' ? '暂停' : '规划中'}
              </span>
            </div>
          </div>

          {/* 项目信息 */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">当前阶段</p>
              <p className="text-sm font-medium text-indigo-600">
                📍 {getPhaseDisplayName(project.currentPhase)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">生成报告</p>
              <p className="text-sm font-medium text-gray-900">
                📊 {project.stats?.totalReportsGenerated || 0} 份
              </p>
            </div>
          </div>

          {/* 进度和时间 */}
          <div className="space-y-2">
            {project.basicInfo?.product.priceRange && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">价格区间</span>
                <span className="font-medium text-gray-900">
                  {project.basicInfo.product.priceRange.min}-{project.basicInfo.product.priceRange.max}万
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">最近活动</span>
              <span className="text-gray-600">
                {project.stats?.lastReportGeneratedAt
                  ? new Date(project.stats.lastReportGeneratedAt).toLocaleDateString()
                  : '暂无活动'
                }
              </span>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="flex space-x-2 pt-3 border-t border-gray-100">
            <button className="flex-1 py-2 px-3 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors">
              进入项目
            </button>
            <button className="px-3 py-2 text-gray-600 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors">
              编辑
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // AI助手状态管理
  const [isAIOpen, setIsAIOpen] = useState(false);

  const toggleAI = () => setIsAIOpen(!isAIOpen);
  const closeAI = () => setIsAIOpen(false);

  // 处理新项目创建
  const handleCreateProject = (projectData: ProjectFormData) => {
    const newProject: Project = {
      id: `project-${Date.now()}`, // 临时ID生成方式
      name: projectData.name,
      city: projectData.city,
      type: projectData.type,
      status: 'planning' as ProjectStatus, // 新项目默认为规划中
      currentPhase: 'phase1' as PhaseId, // 新项目默认从第一阶段开始
      createdAt: new Date(),
      updatedAt: new Date(),
      basicInfo: projectData.basicInfo,
      stats: {
        totalReportsGenerated: 0,
        lastReportGeneratedAt: undefined,
        mostUsedReportType: undefined
      }
    };

    setProjects(prev => [newProject, ...prev]); // 新项目添加到列表顶部
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 页头 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
              <p className="text-gray-600 mt-1">管理您的房地产营销项目和报告生成</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              ➕ 新建项目
            </motion.button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 用户引导横幅 */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎉 欢迎使用 MarketPro!</h3>
                <p className="text-indigo-100 mb-4">
                  房地产营销分析的AI智能平台，帮您快速生成专业的市场分析报告
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    AI竞品分析
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    营销策略生成
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    数据智能管理
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl"
                >
                  🚀
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 功能提示卡片 (当有项目时显示) */}
        {projects.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">💡 快速使用提示</h3>
                <p className="text-indigo-700 text-sm">
                  点击项目卡片进入工作空间，在"产品定位"阶段可生成AI竞品分析和营销策略报告
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  💬 右下角AI助手随时为您服务
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">总项目</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">可用报告</p>
                <p className="text-2xl font-bold text-gray-900">{REPORT_STATS.total}</p>
                <p className="text-xs text-green-600 mt-1">🎯 AI智能生成</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">已实现</p>
                <p className="text-2xl font-bold text-gray-900">{REPORT_STATS.implemented}</p>
                <p className="text-xs text-purple-600 mt-1">🔥 立即可用</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">即将上线</p>
                <p className="text-2xl font-bold text-gray-900">{REPORT_STATS.placeholder}</p>
                <p className="text-xs text-yellow-600 mt-1">⏰ 敬请期待</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索项目</label>
              <input
                type="text"
                placeholder="搜索项目名称或城市..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">项目类型</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部类型</option>
                <option value="residential">住宅项目</option>
                <option value="commercial">商业项目</option>
                <option value="villa">别墅项目</option>
                <option value="mixed">综合项目</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">项目状态</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部状态</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
                <option value="paused">暂停</option>
                <option value="planning">规划中</option>
              </select>
            </div>
          </div>
        </div>

        {/* 项目网格 */}
        {filteredProjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1
                    }
                  }
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? '未找到匹配的项目'
                : '还没有项目'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? '尝试调整搜索条件或筛选器'
                : '开始创建您的第一个房地产营销项目'}
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ➕ 创建新项目
            </button>
          </motion.div>
        )}
      </main>

      {/* 项目创建模态框 */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateProject}
      />

      {/* AI助手调试工具 (仅在开发环境显示) */}
      {process.env.NODE_ENV === 'development' && (
        <div id="ai-debug-panel">
          <AIAssistantDebug />
        </div>
      )}

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
          currentStep: '项目列表',
          projectData: projects
        }}
      />
    </div>
  );
}