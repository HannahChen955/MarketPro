'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FormInput,
  Settings,
  Play,
  Eye,
  Download,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Layout,
  Sidebar,
  Monitor,
  SplitSquareHorizontal,
  X
} from 'lucide-react';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Modal,
  ConfirmModal,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { WorkflowStepper, WorkflowStep, StepContent, StepNavigation } from './WorkflowStepper';
import { DataCollectionFormData } from './DataCollectionForm';
import { defaultProgressStages, ProgressStage } from './ProgressTracker';
import { cn } from '@/lib/utils';

// 使用懒加载和性能优化工具
import { LazyDataCollectionForm, LazyAIAssistant, LazyReportPreview, LazyProgressTracker } from '@/components/lazy';
import PerformanceContainer from '@/components/optimization/PerformanceContainer';
import { useDebounce, useOptimizedCallback, usePerformanceMonitor } from '@/lib/performance';
import { useDeviceInfo, useResponsiveValue } from '@/lib/responsive';
import { CacheManager } from '@/lib/resource-optimization';

export interface ReportWorkflowOptimizedProps {
  reportTypeId: string;
  reportTypeName: string;
  initialData?: Partial<DataCollectionFormData>;
  className?: string;
}

type WorkflowStepType = 'data_collection' | 'review' | 'generation' | 'preview' | 'complete';

interface OptimizedWorkflowState {
  currentStep: number;
  formData: Partial<DataCollectionFormData>;
  isGenerating: boolean;
  generationProgress: number;
  progressStages: ProgressStage[];
  generationResult?: {
    taskId: string;
    files: { format: string; url: string }[];
  };
  errors: string[];
  // AI 助手和预览相关状态
  showAIAssistant: boolean;
  showPreview: boolean;
  aiChatHistory: any[];
  previewMode: 'compact' | 'side' | 'modal';
}

// 记忆化的工作流程步骤配置
const MemoizedWorkflowSteps = memo<{ currentStep: number }>(({ currentStep }) => {
  return useMemo(() => [
    {
      id: 'data_collection',
      title: '信息收集',
      description: '填写项目基本信息和分析需求',
      icon: <FormInput className="w-5 h-5" />,
      status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending',
      estimatedTime: '5-10分钟'
    },
    {
      id: 'review',
      title: '信息确认',
      description: '检查和确认填写的信息',
      icon: <Eye className="w-5 h-5" />,
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
      estimatedTime: '2-3分钟'
    },
    {
      id: 'generation',
      title: 'AI生成',
      description: 'AI分析数据并生成报告',
      icon: <Play className="w-5 h-5" />,
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending',
      estimatedTime: '3-8分钟'
    },
    {
      id: 'preview',
      title: '预览下载',
      description: '预览报告内容并下载',
      icon: <Download className="w-5 h-5" />,
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending',
      estimatedTime: '1-2分钟'
    }
  ] as WorkflowStep[], [currentStep]);
});

MemoizedWorkflowSteps.displayName = 'MemoizedWorkflowSteps';

export const ReportWorkflowOptimized = memo<ReportWorkflowOptimizedProps>(({
  reportTypeId,
  reportTypeName,
  initialData,
  className
}) => {
  const router = useRouter();
  const deviceInfo = useDeviceInfo();
  const performanceMonitor = usePerformanceMonitor('ReportWorkflow');

  // 缓存键
  const cacheKey = `workflow_${reportTypeId}`;

  // 从缓存加载初始状态
  const getInitialState = useCallback((): OptimizedWorkflowState => {
    const cached = CacheManager.get<Partial<OptimizedWorkflowState>>(cacheKey);
    return {
      currentStep: cached?.currentStep || 0,
      formData: cached?.formData || initialData || {},
      isGenerating: false,
      generationProgress: 0,
      progressStages: defaultProgressStages,
      errors: [],
      showAIAssistant: cached?.showAIAssistant ?? deviceInfo.isDesktop,
      showPreview: cached?.showPreview ?? deviceInfo.isDesktop,
      aiChatHistory: cached?.aiChatHistory || [],
      previewMode: cached?.previewMode || (deviceInfo.isMobile ? 'modal' : 'side')
    };
  }, [cacheKey, initialData, deviceInfo]);

  const [state, setState] = useState<OptimizedWorkflowState>(getInitialState);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // 响应式配置
  const sidebarCols = useResponsiveValue(
    { lg: 8, xl: 8, '2xl': 9 },
    12
  );

  const assistantCols = useResponsiveValue(
    { lg: 4, xl: 4, '2xl': 3 },
    12
  );

  // 优化的回调函数
  const debouncedSave = useDebounce(
    useOptimizedCallback((data: Partial<DataCollectionFormData>) => {
      CacheManager.set(cacheKey, { ...state, formData: data }, 1000 * 60 * 30); // 30分钟缓存
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, [cacheKey, state]),
    2000
  );

  const handleFormDataUpdate = useOptimizedCallback((data: Partial<DataCollectionFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));

    setAutoSaveStatus('saving');
    debouncedSave(data);
  }, [debouncedSave]);

  // 工作流步骤记忆化
  const workflowSteps = useMemo(() => {
    return [
      {
        id: 'data_collection',
        title: '信息收集',
        description: '填写项目基本信息和分析需求',
        icon: <FormInput className="w-5 h-5" />,
        status: state.currentStep === 0 ? 'current' : state.currentStep > 0 ? 'completed' : 'pending',
        estimatedTime: '5-10分钟'
      },
      {
        id: 'review',
        title: '信息确认',
        description: '检查和确认填写的信息',
        icon: <Eye className="w-5 h-5" />,
        status: state.currentStep === 1 ? 'current' : state.currentStep > 1 ? 'completed' : 'pending',
        estimatedTime: '2-3分钟'
      },
      {
        id: 'generation',
        title: 'AI生成',
        description: 'AI分析数据并生成报告',
        icon: <Play className="w-5 h-5" />,
        status: state.currentStep === 2 ? 'current' : state.currentStep > 2 ? 'completed' : 'pending',
        estimatedTime: '3-8分钟'
      },
      {
        id: 'preview',
        title: '预览下载',
        description: '预览报告内容并下载',
        icon: <Download className="w-5 h-5" />,
        status: state.currentStep === 3 ? 'current' : state.currentStep > 3 ? 'completed' : 'pending',
        estimatedTime: '1-2分钟'
      }
    ] as WorkflowStep[];
  }, [state.currentStep]);

  // 处理表单提交 - 优化版本
  const handleFormSubmit = useOptimizedCallback((data: DataCollectionFormData) => {
    setState(prev => ({
      ...prev,
      formData: data,
      currentStep: 1
    }));
  }, []);

  // 处理信息确认 - 优化版本
  const handleReviewConfirm = useOptimizedCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 2
    }));
    startGeneration();
  }, []);

  // 开始生成报告 - 优化版本
  const startGeneration = useOptimizedCallback(async () => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      generationProgress: 0,
      progressStages: prev.progressStages.map(stage => ({ ...stage, status: 'pending', progress: 0 }))
    }));

    // 模拟生成过程 - 在实际应用中这里会调用真实的API
    const stages = ['data_validation', 'market_analysis', 'content_generation', 'document_creation'];

    for (let i = 0; i < stages.length; i++) {
      const stageId = stages[i];

      setState(prev => ({
        ...prev,
        progressStages: prev.progressStages.map(stage =>
          stage.id === stageId
            ? { ...stage, status: 'running', progress: 0 }
            : stage
        )
      }));

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));

        setState(prev => ({
          ...prev,
          generationProgress: ((i * 100 + progress) / stages.length),
          progressStages: prev.progressStages.map(stage =>
            stage.id === stageId
              ? { ...stage, progress, details: [`正在处理: ${progress}%`] }
              : stage
          )
        }));
      }

      setState(prev => ({
        ...prev,
        progressStages: prev.progressStages.map(stage =>
          stage.id === stageId
            ? { ...stage, status: 'completed', progress: 100, actualTime: Math.random() * 30 + 10 }
            : stage
        )
      }));
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
      currentStep: 3,
      generationResult: {
        taskId: 'task_' + Date.now(),
        files: [
          { format: 'pptx', url: '/downloads/report.pptx' },
          { format: 'pdf', url: '/downloads/report.pdf' }
        ]
      }
    }));
  }, []);

  // 步骤导航处理 - 优化版本
  const handleStepChange = useOptimizedCallback((stepIndex: number) => {
    if (stepIndex < state.currentStep || (stepIndex === state.currentStep + 1 && canProceed())) {
      setState(prev => ({ ...prev, currentStep: stepIndex }));
    }
  }, [state.currentStep]);

  // 检查是否可以进行下一步
  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 0:
        return Object.keys(state.formData).length > 0;
      case 1:
        return true;
      case 2:
        return !state.isGenerating;
      default:
        return true;
    }
  }, [state.currentStep, state.formData, state.isGenerating]);

  // 自动保存效果 - 优化版本
  useEffect(() => {
    if (Object.keys(state.formData).length > 0) {
      const saveTimer = setTimeout(() => {
        CacheManager.set(cacheKey, state, 1000 * 60 * 30);
      }, 5000);

      return () => clearTimeout(saveTimer);
    }
  }, [state, cacheKey]);

  // 渲染步骤内容 - 记忆化版本
  const renderStepContent = useMemo(() => {
    switch (state.currentStep) {
      case 0:
        return (
          <PerformanceContainer name="DataCollectionStep" enableMonitoring={process.env.NODE_ENV === 'development'}>
            <StepContent>
              <div className="space-y-6">
                <LazyDataCollectionForm
                  initialData={state.formData}
                  onSubmit={handleFormSubmit}
                  onSave={handleFormDataUpdate}
                />

                {state.showPreview && state.previewMode !== 'side' && (
                  <Card className="lg:hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        实时预览
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LazyReportPreview
                        formData={state.formData}
                        mode="compact"
                        showControls={false}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </StepContent>
          </PerformanceContainer>
        );

      case 1:
        return (
          <PerformanceContainer name="ReviewStep" enableMonitoring={process.env.NODE_ENV === 'development'}>
            <StepContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    信息确认
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">请确认以下信息：</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div>• 项目名称: {state.formData.projectName || '未填写'}</div>
                      <div>• 项目类型: {state.formData.projectType || '未选择'}</div>
                      <div>• 项目位置: {state.formData.location || '未填写'}</div>
                      <div>• 分析深度: {state.formData.analysisDepth || '未选择'}</div>
                      <div>• 报告格式: {state.formData.reportFormat || '未选择'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">
                      信息确认无误后，将开始生成您的专属AI报告
                    </span>
                  </div>

                  <StepNavigation
                    currentStep={state.currentStep}
                    totalSteps={workflowSteps.length}
                    onPrevious={() => setState(prev => ({ ...prev, currentStep: 0 }))}
                    onNext={handleReviewConfirm}
                    nextText="开始生成"
                    isLastStep={false}
                  />
                </CardContent>
              </Card>
            </StepContent>
          </PerformanceContainer>
        );

      case 2:
        return (
          <PerformanceContainer name="GenerationStep" enableMonitoring={process.env.NODE_ENV === 'development'}>
            <StepContent>
              <LazyProgressTracker
                stages={state.progressStages}
                overallProgress={state.generationProgress}
                isRunning={state.isGenerating}
                canPause={false}
                canRetry={!state.isGenerating}
                onRetry={startGeneration}
                onCancel={() => setState(prev => ({ ...prev, isGenerating: false, currentStep: 1 }))}
              />
            </StepContent>
          </PerformanceContainer>
        );

      case 3:
        return (
          <PerformanceContainer name="PreviewStep" enableMonitoring={process.env.NODE_ENV === 'development'}>
            <StepContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-600" />
                    报告生成完成
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">报告生成成功！</span>
                    </div>
                    <p className="text-sm text-green-800">
                      您的AI报告已经成功生成，包含了详细的市场分析和专业建议。
                    </p>
                  </div>

                  {state.generationResult && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">可下载文件：</h3>
                      <div className="space-y-2">
                        {state.generationResult.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600 uppercase">
                                  {file.format}
                                </span>
                              </div>
                              <span className="text-sm text-gray-700">
                                {reportTypeName} - {file.format.toUpperCase()} 格式
                              </span>
                            </div>
                            <Button size="sm" leftIcon={<Download className="w-4 h-4" />}>
                              下载
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      预览报告
                    </Button>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/reports')}
                      >
                        返回报告列表
                      </Button>
                      <Button onClick={() => router.push('/reports/new')}>
                        生成新报告
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StepContent>
          </PerformanceContainer>
        );

      default:
        return null;
    }
  }, [
    state.currentStep,
    state.formData,
    state.progressStages,
    state.generationProgress,
    state.isGenerating,
    state.generationResult,
    state.showPreview,
    state.previewMode,
    handleFormSubmit,
    handleFormDataUpdate,
    handleReviewConfirm,
    startGeneration,
    workflowSteps.length,
    reportTypeName,
    router
  ]);

  return (
    <PerformanceContainer
      name="ReportWorkflowMain"
      enableMonitoring={process.env.NODE_ENV === 'development'}
      className={cn('min-h-screen bg-gray-50', className)}
    >
      <Container className="py-8">
        {/* 页面头部 - 优化版本 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setShowExitModal(true)}
            >
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{reportTypeName}</h1>
              <p className="text-sm text-gray-600">AI智能报告生成</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 自动保存状态 */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {autoSaveStatus === 'saving' && (
                <>
                  <motion.div
                    className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  正在保存...
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  已保存
                </>
              )}
            </div>

            {/* AI助手和预览控制 */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={state.showAIAssistant ? "default" : "outline"}
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4" />}
                onClick={() => setState(prev => ({ ...prev, showAIAssistant: !prev.showAIAssistant }))}
                className="h-8"
              >
                AI助手
              </Button>

              <Button
                variant={state.showPreview ? "default" : "outline"}
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => setState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
                className="h-8"
              >
                预览
              </Button>

              {state.showPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={
                    state.previewMode === 'side' ? <Sidebar className="w-4 h-4" /> :
                    state.previewMode === 'modal' ? <Monitor className="w-4 h-4" /> :
                    <Layout className="w-4 h-4" />
                  }
                  onClick={() => setState(prev => ({
                    ...prev,
                    previewMode:
                      prev.previewMode === 'side' ? 'modal' :
                      prev.previewMode === 'modal' ? 'compact' : 'side'
                  }))}
                  className="h-8"
                />
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => setShowSaveModal(true)}
            >
              保存草稿
            </Button>
          </div>
        </div>

        {/* 主要内容区域 - 响应式优化版本 */}
        <div className={cn(
          'flex gap-6',
          (state.showAIAssistant || state.showPreview) && state.previewMode === 'side' ? 'lg:grid lg:grid-cols-12' : 'flex-col'
        )}>
          {/* 主要工作流内容 */}
          <div className={cn(
            'flex-1',
            (state.showAIAssistant || state.showPreview) && state.previewMode === 'side' ? `lg:col-span-${sidebarCols}` : 'w-full'
          )}>
            {/* 工作流程步骤 */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <WorkflowStepper
                  steps={workflowSteps}
                  currentStep={state.currentStep}
                  onStepClick={handleStepChange}
                  orientation="horizontal"
                  allowSkipToCompleted={false}
                />
              </CardContent>
            </Card>

            {/* 步骤内容 */}
            <AnimatePresence mode="wait">
              {renderStepContent}
            </AnimatePresence>
          </div>

          {/* 侧边栏 - AI助手和预览 - 响应式优化版本 */}
          {((state.showAIAssistant || state.showPreview) && state.previewMode === 'side') && (
            <div className={`lg:col-span-${assistantCols} space-y-6`}>
              {state.showPreview && state.showAIAssistant && (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      实时预览
                    </TabsTrigger>
                    <TabsTrigger value="assistant" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      AI助手
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <LazyReportPreview
                      formData={state.formData}
                      isGenerating={state.isGenerating}
                      generationProgress={state.generationProgress}
                      mode="compact"
                      showControls={false}
                      onRefresh={() => {
                        setState(prev => ({ ...prev, formData: { ...prev.formData } }));
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="assistant" className="mt-4">
                    <LazyAIAssistant
                      mode="inline"
                      context={{
                        page: 'workflow',
                        step: state.currentStep,
                        formData: state.formData,
                        reportType: reportTypeName
                      }}
                      onSendMessage={(message) => {
                        setState(prev => ({
                          ...prev,
                          aiChatHistory: [...prev.aiChatHistory, { type: 'user', content: message, timestamp: new Date() }]
                        }));
                      }}
                      className="h-[600px]"
                    />
                  </TabsContent>
                </Tabs>
              )}

              {state.showPreview && !state.showAIAssistant && (
                <LazyReportPreview
                  formData={state.formData}
                  isGenerating={state.isGenerating}
                  generationProgress={state.generationProgress}
                  mode="full"
                  onRefresh={() => {
                    setState(prev => ({ ...prev, formData: { ...prev.formData } }));
                  }}
                  onDownload={(format) => {
                    console.log(`下载报告: ${format}`);
                  }}
                />
              )}

              {!state.showPreview && state.showAIAssistant && (
                <LazyAIAssistant
                  mode="inline"
                  context={{
                    page: 'workflow',
                    step: state.currentStep,
                    formData: state.formData,
                    reportType: reportTypeName
                  }}
                  onSendMessage={(message) => {
                    setState(prev => ({
                      ...prev,
                      aiChatHistory: [...prev.aiChatHistory, { type: 'user', content: message, timestamp: new Date() }]
                    }));
                  }}
                  className="h-[700px]"
                />
              )}
            </div>
          )}
        </div>

        {/* 紧凑模式预览 */}
        {state.showPreview && state.previewMode === 'compact' && (
          <LazyReportPreview
            formData={state.formData}
            isGenerating={state.isGenerating}
            generationProgress={state.generationProgress}
            mode="compact"
            className="mt-8"
            onRefresh={() => {
              setState(prev => ({ ...prev, formData: { ...prev.formData } }));
            }}
            onDownload={(format) => {
              console.log(`下载报告: ${format}`);
            }}
          />
        )}

        {/* 错误提示 */}
        {state.errors.length > 0 && (
          <Card className="mt-6 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-2">处理过程中出现错误：</h3>
                  <ul className="space-y-1 text-sm text-red-800">
                    {state.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* 模态框 - 优化版本 */}
      <ConfirmModal
        open={showExitModal}
        onOpenChange={setShowExitModal}
        title="确认退出"
        description="您的更改可能尚未保存，确定要退出吗？"
        confirmText="退出"
        cancelText="取消"
        variant="default"
        onConfirm={() => router.push('/reports')}
      />

      <Modal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        title="保存成功"
        description="您的草稿已保存，可以随时回来继续编辑。"
        size="sm"
      >
        <div className="flex justify-end">
          <Button onClick={() => setShowSaveModal(false)}>
            知道了
          </Button>
        </div>
      </Modal>

      {/* 模态框模式预览 */}
      <Modal
        open={state.showPreview && state.previewMode === 'modal'}
        onOpenChange={(open) => {
          if (!open) {
            setState(prev => ({ ...prev, previewMode: 'side' }));
          }
        }}
        title="报告实时预览"
        size="full"
        className="max-w-6xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <LazyReportPreview
            formData={state.formData}
            isGenerating={state.isGenerating}
            generationProgress={state.generationProgress}
            mode="full"
            onRefresh={() => {
              setState(prev => ({ ...prev, formData: { ...prev.formData } }));
            }}
            onDownload={(format) => {
              console.log(`下载报告: ${format}`);
            }}
            onShare={() => {
              console.log('分享预览');
            }}
          />
        </div>
      </Modal>

      {/* 浮动 AI 助手 */}
      {state.showAIAssistant && state.previewMode !== 'side' && (
        <LazyAIAssistant
          mode="floating"
          context={{
            page: 'workflow',
            step: state.currentStep,
            formData: state.formData,
            reportType: reportTypeName
          }}
          onSendMessage={(message) => {
            setState(prev => ({
              ...prev,
              aiChatHistory: [...prev.aiChatHistory, { type: 'user', content: message, timestamp: new Date() }]
            }));
          }}
          onClose={() => setState(prev => ({ ...prev, showAIAssistant: false }))}
          className="z-50"
        />
      )}
    </PerformanceContainer>
  );
});

ReportWorkflowOptimized.displayName = 'ReportWorkflowOptimized';