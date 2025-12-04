'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Upload,
  Settings,
  FileText,
  Palette,
  Zap,
  Plus,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { reportApi, fileApi, handleApiError } from '@/lib/api';
import { InputField, ReportConfiguration } from '@/types/report';

interface ReportForm {
  name: string;
  description: string;
  icon: string;
  category: 'market' | 'project' | 'investment' | 'sales';
  estimatedTime: string;
  configuration: ReportConfiguration;
}

export default function CreateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [step, setStep] = useState<'basic' | 'fields' | 'workflow' | 'preview'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [form, setForm] = useState<ReportForm>({
    name: '',
    description: '',
    icon: '📊',
    category: 'market',
    estimatedTime: '10-15分钟',
    configuration: {
      inputSchema: [],
      workflowSteps: [
        {
          id: 'form',
          name: '信息收集',
          type: 'form',
          config: {}
        },
        {
          id: 'generation',
          name: '报告生成',
          type: 'generation',
          config: {}
        },
        {
          id: 'preview',
          name: '预览确认',
          type: 'preview',
          config: {}
        }
      ],
      designSystemId: 'default',
      outputTemplates: []
    }
  });

  // 可用的图标选项
  const iconOptions = [
    '📊', '📈', '📋', '💰', '🎯', '📄', '🏢', '📱',
    '💡', '🔍', '📊', '⚡', '🚀', '📈', '💻', '📝'
  ];

  // 分类选项
  const categoryOptions = [
    { value: 'market', label: '市场分析' },
    { value: 'project', label: '项目研究' },
    { value: 'investment', label: '投资分析' },
    { value: 'sales', label: '销售报告' }
  ];

  // 字段类型选项
  const fieldTypeOptions = [
    { value: 'text', label: '单行文本' },
    { value: 'textarea', label: '多行文本' },
    { value: 'select', label: '下拉选择' },
    { value: 'multiselect', label: '多项选择' },
    { value: 'date', label: '日期' },
    { value: 'number', label: '数字' },
    { value: 'file', label: '文件上传' }
  ];

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setUploadedFile(file);

      // 上传并分析文件
      const analysisResponse = await reportApi.analyzeUpload(file);
      setAnalysisResult(analysisResponse.data);

      // 根据分析结果预填表单
      const result = analysisResponse.data;
      setForm(prev => ({
        ...prev,
        name: result.suggestedConfig.reportType,
        estimatedTime: result.suggestedConfig.estimatedTime,
        configuration: {
          ...prev.configuration,
          inputSchema: result.suggestedConfig.requiredFields.map((field: string, index: number) => ({
            id: `field_${index}`,
            label: field,
            type: 'text' as const,
            required: true,
            description: `请输入${field}相关信息`,
            placeholder: `请输入${field}...`
          }))
        }
      }));

    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // 添加字段
  const addField = () => {
    const newField: InputField = {
      id: `field_${Date.now()}`,
      label: '新字段',
      type: 'text',
      required: false,
      description: '',
      placeholder: ''
    };

    setForm(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        inputSchema: [...prev.configuration.inputSchema, newField]
      }
    }));
  };

  // 更新字段
  const updateField = (fieldId: string, updates: Partial<InputField>) => {
    setForm(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        inputSchema: prev.configuration.inputSchema.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    }));
  };

  // 删除字段
  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        inputSchema: prev.configuration.inputSchema.filter(field => field.id !== fieldId)
      }
    }));
  };

  // 保存报告类型
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!form.name || !form.description) {
        setError('请填写报告名称和描述');
        return;
      }

      if (form.configuration.inputSchema.length === 0) {
        setError('请至少添加一个输入字段');
        return;
      }

      await reportApi.create({
        name: form.name,
        description: form.description,
        icon: form.icon,
        category: form.category,
        estimatedTime: form.estimatedTime,
        config: form.configuration
      });

      router.push('/');

    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">配置报告类型</h1>
                <p className="text-sm text-gray-600">创建自定义报告模板或分析现有报告</p>
              </div>
            </div>

            {/* 步骤指示器 */}
            <div className="flex items-center gap-4">
              {[
                { id: 'basic', label: '基本信息', icon: Settings },
                { id: 'fields', label: '输入字段', icon: FileText },
                { id: 'workflow', label: '工作流程', icon: Zap },
                { id: 'preview', label: '预览保存', icon: Eye }
              ].map((s, index) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    step === s.id
                      ? 'bg-blue-100 text-blue-700'
                      : index < ['basic', 'fields', 'workflow', 'preview'].indexOf(step)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4">配置步骤</h3>

              <nav className="space-y-2">
                {[
                  { id: 'basic', label: '基本信息', desc: '设置报告基础属性' },
                  { id: 'fields', label: '输入字段', desc: '定义所需输入项' },
                  { id: 'workflow', label: '工作流程', desc: '配置处理流程' },
                  { id: 'preview', label: '预览保存', desc: '检查并保存配置' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id as any)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      step === s.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
                  </button>
                ))}
              </nav>

              {/* 文件上传分析 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">智能分析</h4>
                <p className="text-sm text-gray-600 mb-3">
                  上传现有报告，AI将自动分析并生成配置
                </p>

                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer text-sm">
                    <Upload className="w-4 h-4" />
                    {loading ? '分析中...' : '上传分析'}
                  </div>
                </label>

                {uploadedFile && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <FileText className="w-4 h-4" />
                      已上传：{uploadedFile.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-3">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              </motion.div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
              {step === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        报告名称 *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例：竞品分析报告"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分类 *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      报告描述 *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="详细描述这个报告的用途和特点..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        图标
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {iconOptions.map(icon => (
                          <button
                            key={icon}
                            onClick={() => setForm(prev => ({ ...prev, icon }))}
                            className={`text-2xl p-2 rounded-lg transition-colors ${
                              form.icon === icon
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        预估时间
                      </label>
                      <input
                        type="text"
                        value={form.estimatedTime}
                        onChange={(e) => setForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例：10-15分钟"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep('fields')}
                      disabled={!form.name || !form.description}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一步：配置字段
                    </button>
                  </div>
                </div>
              )}

              {step === 'fields' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">输入字段配置</h2>
                    <button
                      onClick={addField}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加字段
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.configuration.inputSchema.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              字段标签
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="字段显示名称"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              字段类型
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {fieldTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              必填字段
                            </label>

                            <button
                              onClick={() => removeField(field.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              占位符文本
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="输入提示文本"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              字段描述
                            </label>
                            <input
                              type="text"
                              value={field.description || ''}
                              onChange={(e) => updateField(field.id, { description: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="字段说明"
                            />
                          </div>
                        </div>

                        {(field.type === 'select' || field.type === 'multiselect') && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              选项列表（每行一个）
                            </label>
                            <textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => updateField(field.id, {
                                options: e.target.value.split('\n').filter(Boolean)
                              })}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="选项1&#10;选项2&#10;选项3"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {form.configuration.inputSchema.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        还没有添加任何字段，点击上方按钮开始添加
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('basic')}
                      className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      上一步
                    </button>

                    <button
                      onClick={() => setStep('workflow')}
                      disabled={form.configuration.inputSchema.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一步：工作流程
                    </button>
                  </div>
                </div>
              )}

              {step === 'workflow' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">工作流程配置</h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">默认工作流程</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      系统将使用标准的三步工作流程：信息收集 → AI生成 → 预览确认
                    </p>
                  </div>

                  <div className="space-y-3">
                    {form.configuration.workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.name}</h4>
                          <p className="text-sm text-gray-600">
                            {step.type === 'form' && '收集用户输入的信息'}
                            {step.type === 'generation' && '使用AI分析并生成报告内容'}
                            {step.type === 'preview' && '用户预览和确认最终报告'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('fields')}
                      className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      上一步
                    </button>

                    <button
                      onClick={() => setStep('preview')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      下一步：预览保存
                    </button>
                  </div>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">预览配置</h2>

                  {/* 基本信息预览 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">基本信息</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">名称：</span>
                        <span className="font-medium">{form.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">分类：</span>
                        <span className="font-medium">
                          {categoryOptions.find(c => c.value === form.category)?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">图标：</span>
                        <span className="text-lg">{form.icon}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">预估时间：</span>
                        <span className="font-medium">{form.estimatedTime}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">描述：</span>
                      <p className="text-sm mt-1">{form.description}</p>
                    </div>
                  </div>

                  {/* 字段预览 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">输入字段 ({form.configuration.inputSchema.length}个)</h3>
                    <div className="space-y-2">
                      {form.configuration.inputSchema.map(field => (
                        <div key={field.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <span className="font-medium text-sm">{field.label}</span>
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            <div className="text-xs text-gray-500">
                              {fieldTypeOptions.find(t => t.value === field.type)?.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep('workflow')}
                      className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      上一步
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? '保存中...' : '保存配置'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}