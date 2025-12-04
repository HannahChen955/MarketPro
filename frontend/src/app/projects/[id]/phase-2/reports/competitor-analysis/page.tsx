'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ReportDefinition, Report } from '@/types/report';
import { getReportById } from '@/config/reportDefinitions';
import { useReportGeneration, useReportList } from '@/hooks/useReportGeneration';
import { AIAssistant, AIAssistantTrigger } from '@/components/chat/AIAssistant';

// 表单组件
const ReportFormSection = ({ section, formData, setFormData, errors }: {
  section: any;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  errors: Record<string, string>;
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        {section.required && <span className="text-red-500 text-sm">*必填</span>}
      </div>

      {section.description && (
        <p className="text-gray-600 text-sm mb-4">{section.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.fields.map((field: any) => (
          <FormField
            key={field.id}
            field={field}
            value={formData[field.id]}
            onChange={(value) => setFormData(prev => ({ ...prev, [field.id]: value }))}
            error={errors[field.id]}
          />
        ))}
      </div>
    </div>
  );
};

// 表单字段组件
const FormField = ({ field, value, onChange, error }: {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const newValue = field.type === 'multiselect'
      ? Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value)
      : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {field.type === 'select' && (
        <select
          value={value || field.defaultValue || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required={field.required}
        >
          <option value="">请选择...</option>
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'multiselect' && (
        <select
          multiple
          value={value || field.defaultValue || []}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32"
          required={field.required}
        >
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
          required={field.required}
        />
      )}

      {field.type === 'range' && (
        <div className="space-y-2">
          <input
            type="range"
            min={field.validation?.min || 0}
            max={field.validation?.max || 100}
            value={value || field.defaultValue || 50}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{field.validation?.min || 0}%</span>
            <span className="font-medium">{value || field.defaultValue || 50}%</span>
            <span>{field.validation?.max || 100}%</span>
          </div>
        </div>
      )}

      {field.description && (
        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
      )}

      {/* 显示选中选项的说明 */}
      {field.type === 'select' && field.options && value && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
          {field.options.find((opt: any) => opt.value === value)?.description}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// 进度指示器
const ProgressIndicator = ({ progress }: { progress: any }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">生成进度</h3>
        <span className="text-sm text-gray-500">{progress.progress}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <motion.div
          className="bg-indigo-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
        <span>{progress.currentStep}</span>
      </div>

      {progress.estimatedTimeRemaining && (
        <div className="text-xs text-gray-500 mt-2">
          预计剩余时间：{Math.ceil(progress.estimatedTimeRemaining / 1000)} 秒
        </div>
      )}
    </div>
  );
};

// 报告预览组件
const ReportPreview = ({ report }: { report: Report }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = report.content?.structure || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              生成完成
            </span>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              导出PPT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="block text-xs text-gray-500">总页数</span>
            <span className="font-medium">{report.content?.metadata.totalSlides}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">字数</span>
            <span className="font-medium">{report.content?.metadata.wordCount}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">质量得分</span>
            <span className="font-medium">{report.quality?.score}/100</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">生成时间</span>
            <span className="font-medium">
              {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '-'}
            </span>
          </div>
        </div>
      </div>

      {slides.length > 0 && (
        <div className="p-6">
          {/* 幻灯片导航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded disabled:opacity-50"
            >
              ← 上一页
            </button>
            <div className="flex items-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded disabled:opacity-50"
            >
              下一页 →
            </button>
          </div>

          {/* 当前幻灯片 */}
          <div className="bg-gray-50 rounded-lg p-8 min-h-96">
            <SlideRenderer slide={slides[currentSlide]} />
          </div>

          {/* 幻灯片信息 */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>第 {currentSlide + 1} 页，共 {slides.length} 页</span>
            <span>{slides[currentSlide]?.slideType}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 幻灯片渲染组件
const SlideRenderer = ({ slide }: { slide: any }) => {
  if (!slide) return null;

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-gray-600">{slide.subtitle}</p>
        )}
      </div>

      {slide.content && (
        <div className="space-y-4">
          {slide.content.type === 'text' && (
            <div className="space-y-2">
              {slide.content.paragraphs?.map((para: string, index: number) => (
                <p key={index} className="text-gray-700">{para}</p>
              ))}
            </div>
          )}

          {slide.content.type === 'list' && (
            <div className="space-y-2">
              {slide.content.items?.map((item: any, index: number) => (
                <div key={index} className={`flex items-start space-x-2 ${item.highlight ? 'font-medium' : ''}`}>
                  <span className="text-indigo-600 mt-1">•</span>
                  <div>
                    <span className="text-gray-700">{item.text}</span>
                    {item.subItems && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem: string, subIndex: number) => (
                          <li key={subIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="text-gray-400 mt-0.5">-</span>
                            <span>{subItem}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {slide.content.type === 'table' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    {slide.content.headers?.map((header: string, index: number) => (
                      <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slide.content.rows?.map((row: any[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={slide.content.highlightRows?.includes(rowIndex) ? 'bg-yellow-50' : ''}
                    >
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-700 border-t border-gray-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {slide.content.type === 'comparison' && (
            <div className="grid grid-cols-2 gap-4">
              {slide.content.items?.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4" style={{ borderColor: item.color }}>
                  <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                  <ul className="space-y-1">
                    {item.content?.map((point: string, pointIndex: number) => (
                      <li key={pointIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span style={{ color: item.color }}>•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CompetitorAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const reportDefinition = getReportById('competitor-analysis') as ReportDefinition;

  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'preview'>('form');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI助手状态管理
  const [isAIOpen, setIsAIOpen] = useState(false);

  const toggleAI = () => setIsAIOpen(!isAIOpen);
  const closeAI = () => setIsAIOpen(false);

  const { state, generateReport, resetState } = useReportGeneration();
  const { reports, addReport } = useReportList(projectId);

  // 获取项目数据
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Mock project data for demonstration
    const mockProjectData: Project = {
      id: projectId,
      name: '万科翡翠公园',
      city: '深圳',
      type: 'residential',
      status: 'active',
      currentPhase: 'phase2',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    };
    setProject(mockProjectData);
  }, [projectId]);

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.time_range) {
      newErrors.time_range = '请选择分析时间范围';
    }

    if (!formData.analysis_dimensions || formData.analysis_dimensions.length === 0) {
      newErrors.analysis_dimensions = '请至少选择一个分析维度';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 生成报告
  const handleGenerateReport = async () => {
    if (!validateForm() || !project) return;

    setCurrentStep('generating');

    try {
      await generateReport('competitor-analysis', project, formData);

      if (state.generatedReport) {
        addReport(state.generatedReport);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('Generate report error:', error);
      setCurrentStep('form');
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    resetState();
    setCurrentStep('form');
  };

  // 返回表单
  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  if (!reportDefinition) {
    return <div>报告定义未找到</div>;
  }

  if (!project) {
    return <div>项目数据加载中...</div>;
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
            <span className="mx-2">&gt;</span>
            <Link href={`/projects/${projectId}`} className="hover:text-indigo-600 transition-colors">
              项目工作空间
            </Link>
            <span className="mx-2">&gt;</span>
            <Link href={`/projects/${projectId}/phase-2`} className="hover:text-indigo-600 transition-colors">
              产品定位阶段
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">{reportDefinition.name}</span>
          </nav>
        </div>
      </div>

      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {reportDefinition.icon} {reportDefinition.name}
              </h1>
              <p className="text-gray-600 text-lg">{reportDefinition.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 mt-2">
                <span>⏱️ {reportDefinition.estimatedTime}</span>
                <span>🏢 项目：{project.name}</span>
                <span>📊 {reportDefinition.category}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentStep !== 'form' && (
                <button
                  onClick={handleBackToForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  返回设置
                </button>
              )}
              {currentStep === 'preview' && (
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  重新生成
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {reportDefinition.formConfig?.sections.map((section, index) => (
                <ReportFormSection
                  key={section.id}
                  section={section}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
              ))}

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">准备生成报告</h3>
                    <p className="text-gray-600 text-sm">
                      确认以上设置后，点击生成按钮开始创建您的竞品分析报告
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
                  >
                    🚀 生成报告
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'generating' && state.isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {state.progress && <ProgressIndicator progress={state.progress} />}

              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">正在生成报告...</h3>
                <p className="text-gray-600">
                  AI正在分析您的项目数据并生成专业的竞品分析报告，请稍候
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 'preview' && state.generatedReport && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportPreview report={state.generatedReport} />
            </motion.div>
          )}
        </AnimatePresence>

        {state.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <span>❌</span>
              <span className="font-medium">生成失败</span>
            </div>
            <p className="text-red-600 mt-1">{state.error}</p>
            <button
              onClick={() => setCurrentStep('form')}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              返回重试
            </button>
          </div>
        )}
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
          reportType: '竞品分析报告',
          currentStep: currentStep,
          projectData: project
        }}
      />
    </div>
  );
}