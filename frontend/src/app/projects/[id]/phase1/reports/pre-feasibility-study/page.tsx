'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentArrowDownIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

// 定义类型
interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  landArea?: number;
  buildingArea?: number;
  estimatedInvestment?: number;
}

interface DesignSystem {
  id: string;
  name: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
    };
  };
  preview?: {
    thumbnail: string;
    sampleColors: string[];
  };
}

interface FormData {
  'project-name': string;
  'project-description': string;
  'analysis-area': string;
  'time-range': string;
  'target-audience': string;
  'land-area': string;
  'building-area': string;
  'estimated-investment': string;
  'investment-budget': string;
  'market-positioning': string;
  'risk-tolerance': string;
  [key: string]: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  sections: ReportSection[];
  metadata: {
    generatedAt: string;
    generatedBy: string;
    version: string;
    wordCount: number;
    confidenceScore: number;
  };
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'chart' | 'table' | 'comparison';
  confidence: number;
}

// 生成状态枚举
type GenerationStep = 'form' | 'generating' | 'preview';

interface GenerationProgress {
  progress: number;
  currentStep: string;
  estimatedTimeRemaining: number;
}

export default function PreFeasibilityStudyPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  // 状态管理
  const [currentStep, setCurrentStep] = useState<GenerationStep>('form');
  const [formData, setFormData] = useState<FormData>({
    'project-name': '',
    'project-description': '',
    'analysis-area': '',
    'time-range': 'recent_6m',
    'target-audience': '',
    'land-area': '',
    'building-area': '',
    'estimated-investment': '',
    'investment-budget': 'medium',
    'market-positioning': 'high_end',
    'risk-tolerance': 'moderate'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    progress: 0,
    currentStep: '准备生成',
    estimatedTimeRemaining: 0
  });
  const [project, setProject] = useState<Project | null>(null);
  const [availableDesignSystems, setAvailableDesignSystems] = useState<DesignSystem[]>([]);
  const [selectedDesignSystemId, setSelectedDesignSystemId] = useState<string>('default');

  // 加载项目信息和设计系统
  useEffect(() => {
    loadProjectData();
    loadDesignSystems();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // 模拟加载项目数据
      const mockProject: Project = {
        id: projectId,
        name: '万科翡翠公园',
        description: '深圳核心区高端住宅项目',
        location: '深圳市福田区',
        landArea: 50000,
        buildingArea: 120000,
        estimatedInvestment: 2000000000
      };

      setProject(mockProject);
      setFormData(prev => ({
        ...prev,
        'project-name': mockProject.name,
        'project-description': mockProject.description,
        'analysis-area': mockProject.location,
        'land-area': mockProject.landArea?.toString() || '',
        'building-area': mockProject.buildingArea?.toString() || '',
        'estimated-investment': mockProject.estimatedInvestment?.toString() || ''
      }));
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  const loadDesignSystems = async () => {
    try {
      // 动态导入设计系统模板
      const { DESIGN_SYSTEM_TEMPLATES, getRecommendedTemplatesForReportType } = await import('@/config/designSystemTemplates');

      // 获取适用于可行性研究的推荐模板
      const recommendedTemplates = getRecommendedTemplatesForReportType('可行性研究');

      // 转换为组件需要的格式
      const designSystems: DesignSystem[] = DESIGN_SYSTEM_TEMPLATES.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        colorPalette: {
          primary: template.colorPalette.primary,
          secondary: template.colorPalette.secondary,
          accent: template.colorPalette.accent,
          background: template.colorPalette.background,
          text: template.colorPalette.text
        },
        typography: {
          fontFamily: template.typography.fontFamily,
          fontSize: template.typography.fontSize
        },
        preview: template.preview
      }));

      setAvailableDesignSystems(designSystems);
    } catch (error) {
      console.error('Failed to load design systems:', error);
      // 如果加载失败，使用备用的简化列表
      const fallbackDesignSystems: DesignSystem[] = [
        {
          id: 'default',
          name: '默认商务风格',
          description: '专业、简洁的商务风格设计系统',
          colorPalette: {
            primary: '#2563eb',
            secondary: '#1d4ed8',
            accent: '#3b82f6',
            background: '#ffffff',
            text: '#1f2937'
          },
          typography: {
            fontFamily: 'Microsoft YaHei',
            fontSize: { h1: 28, h2: 24, h3: 20, body: 16 }
          }
        }
      ];
      setAvailableDesignSystems(fallbackDesignSystems);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData['project-name']?.trim()) {
      errors['project-name'] = '请输入项目名称';
    }
    if (!formData['project-description']?.trim()) {
      errors['project-description'] = '请输入项目描述';
    }
    if (!formData['analysis-area']?.trim()) {
      errors['analysis-area'] = '请输入分析区域';
    }
    if (!formData['target-audience']?.trim()) {
      errors['target-audience'] = '请输入目标客群';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单输入
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误信息
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 模拟报告生成（应用设计系统）
  const generateReport = async (): Promise<GeneratedReport> => {
    const selectedDesignSystem = availableDesignSystems.find(ds => ds.id === selectedDesignSystemId);
    // 模拟生成进度
    const steps = [
      { step: '数据预处理', duration: 2000 },
      { step: '市场分析', duration: 3000 },
      { step: '投资价值分析', duration: 3000 },
      { step: '风险评估', duration: 2000 },
      { step: '生成报告', duration: 2000 },
      { step: '质量检查', duration: 1000 }
    ];

    let totalTime = 0;
    for (const step of steps) {
      totalTime += step.duration;
    }

    let currentTime = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setGenerationProgress({
        progress: Math.floor((currentTime / totalTime) * 100),
        currentStep: step.step,
        estimatedTimeRemaining: totalTime - currentTime
      });

      await new Promise(resolve => setTimeout(resolve, step.duration));
      currentTime += step.duration;
    }

    // 模拟生成的报告
    const report: GeneratedReport = {
      id: `report-${Date.now()}`,
      title: `${formData['project-name']} 拿地可研报告`,
      sections: [
        {
          id: 'executive_summary',
          title: '执行摘要',
          content: `${formData['project-name']}位于${formData['analysis-area']}，总投资约${formData['estimated-investment'] ? (parseInt(formData['estimated-investment']) / 100000000).toFixed(1) + '亿元' : 'N/A'}。基于对当前市场环境的深入分析，该项目具有良好的投资价值和发展前景。项目定位为${formData['market-positioning'] === 'high_end' ? '高端' : formData['market-positioning'] === 'mid_high' ? '中高端' : '刚需'}物业，主要面向${formData['target-audience']}客群。`,
          type: 'text',
          confidence: 0.85
        },
        {
          id: 'market_analysis',
          title: '市场分析',
          content: `${formData['analysis-area']}房地产市场在${formData['time-range'] === 'recent_6m' ? '最近6个月' : formData['time-range'] === 'recent_1y' ? '最近一年' : '最近3个月'}表现稳健。区域内新房供应量适中，二手房成交活跃。目标客群${formData['target-audience']}对该区域接受度较高，市场需求相对稳定。基于当前市场趋势分析，项目具备良好的去化前景。`,
          type: 'text',
          confidence: 0.80
        },
        {
          id: 'investment_value',
          title: '投资价值分析',
          content: `项目总建筑面积${formData['building-area'] || 'N/A'}平方米，地块面积${formData['land-area'] || 'N/A'}平方米。基于${formData['investment-budget'] === 'high' ? '充足' : formData['investment-budget'] === 'medium' ? '适中' : '有限'}的投资预算，项目预期投资回报率在行业合理区间内。考虑到区域发展潜力和项目定位，预计项目IRR约为8-12%，投资回收期约6-8年。`,
          type: 'text',
          confidence: 0.88
        },
        {
          id: 'risk_assessment',
          title: '风险评估',
          content: `基于${formData['risk-tolerance'] === 'high' ? '较高' : formData['risk-tolerance'] === 'moderate' ? '适中' : '较低'}的风险承受能力评估，项目主要风险包括：市场波动风险、政策调控风险、建设成本上涨风险等。建议建立完善的风险管控机制，确保项目稳健推进。总体而言，项目风险可控，在合理范围内。`,
          type: 'text',
          confidence: 0.82
        },
        {
          id: 'conclusion',
          title: '结论与建议',
          content: `综合分析，${formData['project-name']}项目具备较好的投资价值。建议：1）深化市场调研，优化产品定位；2）合理控制建设成本，提升产品竞争力；3）制定灵活的销售策略，确保去化率；4）建立完善的风险预警机制。项目具备推进条件，建议启动后续工作。`,
          type: 'text',
          confidence: 0.90
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'ai',
        version: '1.0',
        wordCount: 1250,
        confidenceScore: 0.85
      }
    };

    setGenerationProgress({
      progress: 100,
      currentStep: '生成完成',
      estimatedTimeRemaining: 0
    });

    return report;
  };

  // 处理生成报告
  const handleGenerateReport = async () => {
    if (!validateForm()) {
      return;
    }

    setCurrentStep('generating');

    try {
      const report = await generateReport();
      setGeneratedReport(report);
      setCurrentStep('preview');
    } catch (error) {
      console.error('报告生成失败:', error);
      alert('报告生成失败，请重试');
      setCurrentStep('form');
    }
  };

  // 处理下载
  const handleDownload = async (format: string) => {
    if (!generatedReport) return;

    try {
      // 模拟下载
      alert(`正在下载 ${format.toUpperCase()} 格式报告...`);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载项目信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部导航 */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/projects/${projectId}/phase1`}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>返回阶段一</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <nav className="text-sm text-gray-600">
                <span className="hover:text-indigo-600 transition-colors">项目管理</span>
                <span className="mx-2">{'>'}</span>
                <span className="hover:text-indigo-600 transition-colors">阶段一</span>
                <span className="mx-2">{'>'}</span>
                <span className="text-gray-900">前置可研报告</span>
              </nav>
            </div>

            {/* 步骤指示器 */}
            <div className="flex items-center space-x-4">
              {(['form', 'generating', 'preview'] as const).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-indigo-600 text-white'
                      : index < (['form', 'generating', 'preview'] as const).indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < (['form', 'generating', 'preview'] as const).indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 表单步骤 */}
        {currentStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                📊 前置可研报告生成
              </h1>
              <p className="text-gray-600">
                为 <strong>{project.name}</strong> 生成专业的拿地可研分析报告
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['project-name']}
                    onChange={(e) => handleInputChange('project-name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors['project-name'] ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="请输入项目名称"
                  />
                  {formErrors['project-name'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['project-name']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData['project-description']}
                    onChange={(e) => handleInputChange('project-description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors['project-description'] ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="请描述项目的基本情况、位置特点等"
                  />
                  {formErrors['project-description'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['project-description']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分析区域 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['analysis-area']}
                    onChange={(e) => handleInputChange('analysis-area', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors['analysis-area'] ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="请输入详细的项目位置"
                  />
                  {formErrors['analysis-area'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['analysis-area']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分析时间范围
                  </label>
                  <select
                    value={formData['time-range']}
                    onChange={(e) => handleInputChange('time-range', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="recent_3m">近3个月</option>
                    <option value="recent_6m">近6个月</option>
                    <option value="recent_1y">最近1年</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标客群 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData['target-audience']}
                    onChange={(e) => handleInputChange('target-audience', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors['target-audience'] ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="如：首次置业者、改善型客户、高净值人群等"
                  />
                  {formErrors['target-audience'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['target-audience']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    地块面积 (平方米)
                  </label>
                  <input
                    type="number"
                    value={formData['land-area']}
                    onChange={(e) => handleInputChange('land-area', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入地块面积"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    规划建筑面积 (平方米)
                  </label>
                  <input
                    type="number"
                    value={formData['building-area']}
                    onChange={(e) => handleInputChange('building-area', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入规划建筑面积"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预估投资总额 (元)
                  </label>
                  <input
                    type="number"
                    value={formData['estimated-investment']}
                    onChange={(e) => handleInputChange('estimated-investment', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请输入预估投资总额"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    投资预算水平
                  </label>
                  <select
                    value={formData['investment-budget']}
                    onChange={(e) => handleInputChange('investment-budget', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">有限</option>
                    <option value="medium">适中</option>
                    <option value="high">充足</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    市场定位
                  </label>
                  <select
                    value={formData['market-positioning']}
                    onChange={(e) => handleInputChange('market-positioning', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="mass_market">刚需</option>
                    <option value="mid_high">中高端</option>
                    <option value="high_end">高端</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    风险承受能力
                  </label>
                  <select
                    value={formData['risk-tolerance']}
                    onChange={(e) => handleInputChange('risk-tolerance', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">较低</option>
                    <option value="moderate">适中</option>
                    <option value="high">较高</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 设计系统选择区域 */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 选择设计系统</h3>
              <p className="text-gray-600 mb-6">选择报告的视觉风格，影响颜色、字体和整体设计</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDesignSystems.map((designSystem) => (
                  <motion.div
                    key={designSystem.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDesignSystemId === designSystem.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDesignSystemId(designSystem.id)}
                  >
                    {/* 选中指示器 */}
                    {selectedDesignSystemId === designSystem.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}

                    {/* 设计系统信息 */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-1">{designSystem.name}</h4>
                      <p className="text-sm text-gray-600">{designSystem.description}</p>
                    </div>

                    {/* 颜色预览 */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs text-gray-500">配色：</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: designSystem.colorPalette.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: designSystem.colorPalette.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: designSystem.colorPalette.accent }}
                        />
                      </div>
                    </div>

                    {/* 字体预览 */}
                    <div className="text-xs text-gray-500">
                      <span>字体：{designSystem.typography.fontFamily}</span>
                    </div>

                    {/* 示例预览 */}
                    <div className="mt-3 p-3 rounded-lg border" style={{
                      backgroundColor: designSystem.colorPalette.background,
                      borderColor: designSystem.colorPalette.primary + '30'
                    }}>
                      <h5
                        className="text-sm font-medium mb-1"
                        style={{
                          color: designSystem.colorPalette.primary,
                          fontFamily: designSystem.typography.fontFamily,
                          fontSize: designSystem.typography.fontSize.h3 - 6
                        }}
                      >
                        报告标题预览
                      </h5>
                      <p
                        className="text-xs"
                        style={{
                          color: designSystem.colorPalette.text,
                          fontFamily: designSystem.typography.fontFamily
                        }}
                      >
                        这是正文内容的预览效果
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 实时预览面板 */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ 实时预览</h3>
              <p className="text-gray-600 mb-6">预览报告在选定设计系统下的外观效果</p>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="bg-white rounded-lg p-6 shadow-sm" style={{
                  backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.background,
                  borderColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary + '20',
                  border: `1px solid`
                }}>
                  {/* 预览标题 */}
                  <h4 className="font-bold mb-3" style={{
                    color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary,
                    fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                    fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.h2
                  }}>
                    {formData['project-name'] || '项目名称'} 拿地可研报告
                  </h4>

                  {/* 预览章节 */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary,
                        fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                        fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.h3
                      }}>
                        1. 执行摘要
                      </h5>
                      <p className="text-sm leading-relaxed" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.text,
                        fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                        fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.body - 2
                      }}>
                        {formData['project-description'] || '项目描述将显示在这里...'}
                        {formData['analysis-area'] && ` 位于${formData['analysis-area']}`}
                        {formData['target-audience'] && `，主要面向${formData['target-audience']}客群。`}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-2" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary,
                        fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                        fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.h3
                      }}>
                        2. 市场分析
                      </h5>
                      <p className="text-sm leading-relaxed" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.text,
                        fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                        fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.body - 2
                      }}>
                        基于对{formData['analysis-area'] || '目标区域'}的深入调研，该区域市场表现良好...
                      </p>
                    </div>

                    {/* 颜色配色示例 */}
                    <div className="mt-4 pt-4 border-t" style={{
                      borderColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary + '20'
                    }}>
                      <div className="flex items-center space-x-2 text-xs" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.text + 'aa'
                      }}>
                        <span>应用的设计系统配色：</span>
                        <div className="flex space-x-1">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.secondary }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.accent }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateReport}
                className="px-8 py-3 text-white rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary
                }}
              >
                🚀 生成可研报告
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 生成中步骤 */}
        {currentStep === 'generating' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">AI 正在分析生成报告</h2>
                <p className="text-gray-600">正在基于您提供的信息进行深度分析...</p>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-indigo-600 h-3 rounded-full"
                    style={{ width: `${generationProgress.progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{generationProgress.currentStep}</span>
                  <span>{generationProgress.progress}%</span>
                </div>

                {generationProgress.estimatedTimeRemaining > 0 && (
                  <p className="text-sm text-gray-500">
                    预计还需要 {Math.ceil(generationProgress.estimatedTimeRemaining / 1000)} 秒
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 预览步骤 */}
        {currentStep === 'preview' && generatedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 报告头部信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{
              borderColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary + '30'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2" style={{
                    color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary,
                    fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily
                  }}>
                    {generatedReport.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📄 {generatedReport.sections.length} 个章节</span>
                    <span>📝 约 {generatedReport.metadata.wordCount} 字</span>
                    <span>🎯 AI 置信度: {Math.round(generatedReport.metadata.confidenceScore * 100)}%</span>
                    <span>⏰ {new Date(generatedReport.metadata.generatedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleDownload('pptx')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>下载 PPT</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleDownload('pdf')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>下载 PDF</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentStep('form')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    重新生成
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 报告内容 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8" style={{
              backgroundColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.background,
              borderColor: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary + '30'
            }}>
              <div className="prose max-w-none">
                {generatedReport.sections.map((section, index) => (
                  <motion.section
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-8 pb-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold" style={{
                        color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.primary,
                        fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily
                      }}>
                        {index + 1}. {section.title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">置信度</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${section.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(section.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="leading-relaxed whitespace-pre-line" style={{
                      color: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.colorPalette.text,
                      fontFamily: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontFamily,
                      fontSize: availableDesignSystems.find(ds => ds.id === selectedDesignSystemId)?.typography.fontSize.body
                    }}>
                      {section.content}
                    </div>
                  </motion.section>
                ))}
              </div>
            </div>

            {/* 操作建议 */}
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                    后续建议
                  </h3>
                  <div className="text-indigo-700 text-sm space-y-1">
                    <p>• <strong>深度调研</strong>：基于报告建议进行更详细的市场调研</p>
                    <p>• <strong>财务模型</strong>：建立详细的财务预测模型</p>
                    <p>• <strong>风险预案</strong>：针对识别的风险制定应对方案</p>
                    <p>• <strong>项目规划</strong>：进入详细的产品规划和设计阶段</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}