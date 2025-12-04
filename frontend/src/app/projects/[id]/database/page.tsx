'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Project, Competitor, TargetAudience, ProjectBasicInfo } from '@/types/project';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useAutoSave, validateProjectBasicInfo, validateCompetitorInfo } from '@/hooks/useAutoSave';
import StatusIndicator, { SaveStatusBar, FieldError } from '@/components/StatusIndicator';
import DataQualityPanel from '@/components/DataQualityPanel';
import DataImportExport from '@/components/DataImportExport';
import { AIAssistant, AIAssistantTrigger } from '@/components/chat/AIAssistant';

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
      houseTypes: ['twoBedroom', 'threeBedroom'],
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
    totalReportsGenerated: 8,
    lastReportGeneratedAt: new Date('2024-12-01'),
    mostUsedReportType: 'competitor-analysis'
  }
};

// 项目基础信息管理组件
const ProjectBasicInfoSection = ({ project }: { project: Project }) => {
  const [editedProject, setEditedProject] = useState(project);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-save configuration
  const [autoSaveState, { forceSave, clearError }] = useAutoSave(editedProject, {
    delay: 2000, // 2秒延迟保存
    onSave: async (data: Project) => {
      // Mock保存API调用 - 后续替换为真实API
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
      console.log('保存项目基础信息:', data);
      // 这里可以调用API保存数据
    },
    validateData: (data: Project) => {
      const validation = validateProjectBasicInfo(data);
      setValidationErrors(validation.errors);
      return validation.isValid;
    }
  });

  return (
    <div className="space-y-6">
      {/* 标题和状态指示器 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">项目基础信息</h2>
        <div className="flex items-center space-x-4">
          <StatusIndicator
            isSaving={autoSaveState.isSaving}
            lastSaved={autoSaveState.lastSaved}
            hasUnsavedChanges={autoSaveState.hasUnsavedChanges}
            error={autoSaveState.error}
            isValid={autoSaveState.isValid}
          />
          {autoSaveState.error && (
            <button
              onClick={clearError}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              重试
            </button>
          )}
        </div>
      </div>

      {/* 基础信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 位置信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">📍 位置信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">详细地址</label>
              <input
                type="text"
                value={editedProject.basicInfo?.location?.address || ''}
                onChange={(e) => setEditedProject(prev => ({
                  ...prev,
                  basicInfo: {
                    ...prev.basicInfo,
                    location: { ...prev.basicInfo?.location, address: e.target.value }
                  }
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  validationErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="请输入详细地址"
              />
              <FieldError error={validationErrors.address} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所在区域</label>
              {false ? (
                <input
                  type="text"
                  value={editedBasicInfo.location?.district || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    location: { ...prev.location, district: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.location?.district || '未填写'}</p>
              )}
            </div>
          </div>
        </div>

        {/* 规模信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🏗️ 规模信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用地面积 (㎡)</label>
              {false ? (
                <input
                  type="number"
                  value={editedBasicInfo.scale?.landArea || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    scale: { ...prev.scale, landArea: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.scale?.landArea?.toLocaleString() || '未填写'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">建筑面积 (㎡)</label>
              {false ? (
                <input
                  type="number"
                  value={editedBasicInfo.scale?.buildingArea || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    scale: { ...prev.scale, buildingArea: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.scale?.buildingArea?.toLocaleString() || '未填写'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">容积率</label>
              {false ? (
                <input
                  type="number"
                  step="0.1"
                  value={editedBasicInfo.scale?.plotRatio || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    scale: { ...prev.scale, plotRatio: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.scale?.plotRatio || '未填写'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">绿化率 (%)</label>
              {false ? (
                <input
                  type="number"
                  value={editedBasicInfo.scale?.greenRate || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    scale: { ...prev.scale, greenRate: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.scale?.greenRate}%</p>
              )}
            </div>
          </div>
        </div>

        {/* 产品信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🏠 产品信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">总套数</label>
              {false ? (
                <input
                  type="number"
                  value={editedBasicInfo.product?.totalUnits || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    product: { ...prev.product, totalUnits: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{project.basicInfo?.product?.totalUnits || '未填写'} 套</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格区间 (万元)</label>
              <p className="text-gray-900">
                {project.basicInfo?.product?.priceRange?.min || '未填写'}-{project.basicInfo?.product?.priceRange?.max || '未填写'}万
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">产品特色</label>
              <div className="flex flex-wrap gap-2">
                {project.basicInfo?.product?.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm"
                  >
                    {feature}
                  </span>
                )) || <span className="text-gray-500">未填写</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 进度信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">📅 时间进度</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前进度</label>
              {false ? (
                <select
                  value={editedBasicInfo.timeline?.currentProgress || ''}
                  onChange={(e) => setEditedBasicInfo(prev => ({
                    ...prev,
                    timeline: { ...prev.timeline, currentProgress: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="拿地前可研阶段">拿地前可研阶段</option>
                  <option value="产品定位阶段">产品定位阶段</option>
                  <option value="开盘节点阶段">开盘节点阶段</option>
                  <option value="运营期阶段">运营期阶段</option>
                  <option value="外部合作阶段">外部合作阶段</option>
                </select>
              ) : (
                <p className="text-gray-900">{project.basicInfo?.timeline?.currentProgress || '未填写'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
              <p className="text-gray-900">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {project.status === 'active' ? '进行中' :
                   project.status === 'completed' ? '已完成' :
                   project.status === 'paused' ? '暂停' : '规划中'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
              <p className="text-gray-900">{project.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 竞品管理组件
const CompetitorManagementSection = ({ project }: { project: Project }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>(project.competitors || []);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [editingCompetitorId, setEditingCompetitorId] = useState<string | null>(null);

  const addNewCompetitor = () => {
    const newCompetitor: Competitor = {
      id: `comp-${Date.now()}`,
      name: '新竞品项目',
      location: { address: '', district: '', distance: 0 },
      status: 'selling',
      product: {
        houseTypes: [],
        priceRange: { min: 0, max: 0, average: 0, avgPricePerSqm: 0 },
        features: []
      },
      sales: { monthlyVolume: 0, totalSold: 0 },
      marketing: {
        strengths: [],
        weaknesses: [],
        marketingHighlights: []
      },
      lastUpdated: new Date()
    };
    setCompetitors([...competitors, newCompetitor]);
    setEditingCompetitorId(newCompetitor.id);
    setIsAddingCompetitor(false);
  };

  const deleteCompetitor = (competitorId: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== competitorId));
  };

  return (
    <div className="space-y-6">
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">竞品项目管理</h2>
          <p className="text-gray-600 text-sm mt-1">管理和分析竞争对手项目信息</p>
        </div>
        <button
          onClick={addNewCompetitor}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ 添加竞品
        </button>
      </div>

      {/* 竞品列表 */}
      {competitors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitors.map((competitor) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{competitor.name}</h3>
                  <p className="text-sm text-gray-600">
                    📍 {competitor.location.address} · 距离 {competitor.location.distance}km
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCompetitorId(competitor.id)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteCompetitor(competitor.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">价格区间</p>
                  <p className="font-medium text-gray-900">
                    {competitor.product.priceRange.min}-{competitor.product.priceRange.max}万
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">销售情况</p>
                  <p className="font-medium text-gray-900">
                    月销量 {competitor.sales.monthlyVolume} 套 · 总销售 {competitor.sales.totalSold} 套
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">营销亮点</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {competitor.marketing.marketingHighlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">优势 vs 劣势</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-xs text-green-600 mb-1">优势</p>
                      {competitor.marketing.strengths.map((strength, index) => (
                        <p key={index} className="text-xs text-gray-700">• {strength}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-red-600 mb-1">劣势</p>
                      {competitor.marketing.weaknesses.map((weakness, index) => (
                        <p key={index} className="text-xs text-gray-700">• {weakness}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  更新于 {competitor.lastUpdated.toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  competitor.status === 'selling' ? 'bg-green-100 text-green-700' :
                  competitor.status === 'presale' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {competitor.status === 'selling' ? '销售中' :
                   competitor.status === 'presale' ? '预售' :
                   competitor.status === 'construction' ? '建设中' :
                   competitor.status === 'planning' ? '规划中' : '已售罄'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">暂无竞品项目</h3>
          <p className="text-gray-600 mb-6">开始添加竞争对手项目进行深度分析</p>
          <button
            onClick={addNewCompetitor}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ 添加第一个竞品
          </button>
        </div>
      )}
    </div>
  );
};

// 目标客群管理组件
const TargetAudienceSection = ({ project }: { project: Project }) => {
  const [targetAudience, setTargetAudience] = useState(project.targetAudience);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">目标客群画像</h2>
        <p className="text-gray-600 text-sm mt-1">定义和管理项目的目标客户群体特征</p>
      </div>

      {/* 主要客群 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">👥 主要客群特征</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客群名称</label>
            <p className="text-gray-900 font-medium">{targetAudience?.primaryGroup.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄范围</label>
            <p className="text-gray-900">{targetAudience?.primaryGroup.ageRange}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">收入水平</label>
            <p className="text-gray-900">{targetAudience?.primaryGroup.income}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">教育背景</label>
            <p className="text-gray-900">{targetAudience?.primaryGroup.education}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">家庭结构</label>
            <p className="text-gray-900">{targetAudience?.primaryGroup.familyStructure}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">购房动机</label>
            <p className="text-gray-900">
              {targetAudience?.primaryGroup.buyingMotivation === 'firstTime' ? '首次置业' :
               targetAudience?.primaryGroup.buyingMotivation === 'upgrade' ? '改善型' :
               targetAudience?.primaryGroup.buyingMotivation === 'investment' ? '投资型' : '其他'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">主要职业</label>
          <div className="flex flex-wrap gap-2">
            {targetAudience?.primaryGroup.occupation.map((job, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm"
              >
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 客户偏好 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🎯 位置偏好因子</h3>
          <div className="space-y-3">
            {targetAudience?.preferences.locationFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{factor.factor}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(factor.importance / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-indigo-600">{factor.importance}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🏠 产品偏好因子</h3>
          <div className="space-y-3">
            {targetAudience?.preferences.productFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{factor.factor}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(factor.importance / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600">{factor.importance}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 购买行为 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">🔍 信息获取渠道</h3>
          <div className="space-y-2">
            {targetAudience?.behavior.informationSources.map((source, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{source}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">⏰ 决策时间轴</h3>
          <p className="text-gray-700 mb-2">{targetAudience?.behavior.decisionTimeline}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">看房频率:</span> {targetAudience?.behavior.visitFrequency}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">👨‍👩‍👧‍👦 决策影响者</h3>
          <div className="space-y-2">
            {targetAudience?.behavior.decisionInfluencers.map((influencer, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">{influencer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 痛点和机会 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">😰 客户痛点</h3>
          <div className="space-y-2">
            {targetAudience?.painPoints.map((painPoint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">{painPoint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">💡 市场机会</h3>
          <div className="space-y-2">
            {targetAudience?.opportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectDatabasePage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project] = useState<Project>(mockProject);
  const [activeTab, setActiveTab] = useState('basic-info');

  // AI助手状态管理
  const [isAIOpen, setIsAIOpen] = useState(false);

  const toggleAI = () => setIsAIOpen(!isAIOpen);
  const closeAI = () => setIsAIOpen(false);

  // Global auto-save state for the database page
  const [globalAutoSaveState, { forceSave: globalForceSave }] = useAutoSave(project, {
    delay: 3000,
    onSave: async (data: Project) => {
      // Mock global save API
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('全局保存项目数据:', data);
    },
    validateData: (data: Project) => {
      const validation = validateProjectBasicInfo(data);
      return validation.isValid;
    }
  });

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
            <Link href={`/projects/${projectId}`} className="hover:text-indigo-600 transition-colors">
              {project.name}
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">项目数据库</span>
          </nav>
        </div>
      </div>

      {/* 页面标题 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 项目数据库</h1>
              <p className="text-gray-600 mt-1">管理 {project.name} 的完整项目信息和数据</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                📤 导出数据
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                💾 保存所有更改
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic-info">📋 基础信息</TabsTrigger>
            <TabsTrigger value="competitors">🏢 竞品管理</TabsTrigger>
            <TabsTrigger value="target-audience">👥 目标客群</TabsTrigger>
            <TabsTrigger value="data-quality">🎯 数据质量</TabsTrigger>
            <TabsTrigger value="import-export">💾 导入导出</TabsTrigger>
            <TabsTrigger value="market-data">📊 市场数据</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info" className="mt-8">
            <ProjectBasicInfoSection project={project} />
          </TabsContent>

          <TabsContent value="competitors" className="mt-8">
            <CompetitorManagementSection project={project} />
          </TabsContent>

          <TabsContent value="target-audience" className="mt-8">
            <TargetAudienceSection project={project} />
          </TabsContent>

          <TabsContent value="data-quality" className="mt-8">
            <DataQualityPanel project={project} />
          </TabsContent>

          <TabsContent value="import-export" className="mt-8">
            <DataImportExport
              project={project}
              onImportComplete={(data) => {
                console.log('导入完成:', data);
                // 这里可以更新项目数据
                // setProject(prev => ({ ...prev, ...data }));
              }}
            />
          </TabsContent>

          <TabsContent value="market-data" className="mt-8">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">市场数据模块</h3>
              <p className="text-gray-600">市场研究、财务数据等功能正在开发中...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 全局自动保存状态指示器 */}
      <SaveStatusBar
        isSaving={globalAutoSaveState.isSaving}
        lastSaved={globalAutoSaveState.lastSaved}
        hasUnsavedChanges={globalAutoSaveState.hasUnsavedChanges}
        error={globalAutoSaveState.error}
        isValid={globalAutoSaveState.isValid}
        onRetry={globalForceSave}
      />

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
          currentStep: '项目数据库',
          projectData: project
        }}
      />
    </div>
  );
}