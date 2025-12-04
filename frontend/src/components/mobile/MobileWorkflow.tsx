'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Eye,
  Save,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Clock,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';

import {
  Container,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ConfirmModal
} from '@/components/ui';

import { DataCollectionFormData } from '../workflow/DataCollectionForm';
import { defaultProgressStages, ProgressStage } from '../workflow/ProgressTracker';
import { cn } from '@/lib/utils';

// 响应式和性能优化
import {
  useDeviceInfo,
  useResponsiveValue,
  useTouchGestures,
  ResponsiveContainer,
  ResponsiveGrid,
  MobileOptimization
} from '@/lib/responsive';
import PerformanceContainer from '../optimization/PerformanceContainer';
import { LazyDataCollectionForm, LazyAIAssistant, LazyReportPreview } from '../lazy';
import { useDebounce, useOptimizedCallback } from '@/lib/performance';
import { CacheManager } from '@/lib/resource-optimization';

interface MobileWorkflowProps {
  reportTypeId: string;
  reportTypeName: string;
  initialData?: Partial<DataCollectionFormData>;
  className?: string;
}

interface MobileWorkflowState {
  currentStep: number;
  formData: Partial<DataCollectionFormData>;
  isGenerating: boolean;
  generationProgress: number;
  progressStages: ProgressStage[];
  errors: string[];
  // 移动端特有状态
  showMobileMenu: boolean;
  showBottomSheet: boolean;
  bottomSheetContent: 'ai' | 'preview' | 'settings' | null;
  isFullscreen: boolean;
  swipeDirection: 'left' | 'right' | null;
}

// 移动端步骤配置
const mobileSteps = [
  {
    id: 'data_collection',
    title: '信息收集',
    shortTitle: '收集',
    description: '填写项目基本信息',
    color: 'blue',
    progress: 0
  },
  {
    id: 'review',
    title: '信息确认',
    shortTitle: '确认',
    description: '检查信息准确性',
    color: 'yellow',
    progress: 0
  },
  {
    id: 'generation',
    title: 'AI生成',
    shortTitle: '生成',
    description: 'AI智能分析',
    color: 'purple',
    progress: 0
  },
  {
    id: 'complete',
    title: '完成',
    shortTitle: '完成',
    description: '下载和分享',
    color: 'green',
    progress: 0
  }
];

export const MobileWorkflow = memo<MobileWorkflowProps>(({
  reportTypeId,
  reportTypeName,
  initialData,
  className
}) => {
  const router = useRouter();
  const deviceInfo = useDeviceInfo();

  // 初始化移动端优化
  useEffect(() => {
    MobileOptimization.disableBounceScrolling();
    MobileOptimization.optimizeTouchDelay();
    MobileOptimization.preventDefaultDrag();
    MobileOptimization.enableSmoothScrolling();
  }, []);

  const [state, setState] = useState<MobileWorkflowState>(() => {
    const cached = CacheManager.get<Partial<MobileWorkflowState>>(`mobile_workflow_${reportTypeId}`);
    return {
      currentStep: cached?.currentStep || 0,
      formData: cached?.formData || initialData || {},
      isGenerating: false,
      generationProgress: 0,
      progressStages: defaultProgressStages,
      errors: [],
      showMobileMenu: false,
      showBottomSheet: false,
      bottomSheetContent: null,
      isFullscreen: false,
      swipeDirection: null
    };
  });

  // 响应式配置
  const containerPadding = useResponsiveValue(
    { xs: '0.5rem', sm: '1rem', md: '1.5rem' },
    '1rem'
  );

  const headerHeight = useResponsiveValue(
    { xs: '60px', sm: '64px', md: '72px' },
    '64px'
  );

  // 触摸手势处理
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (state.currentStep < mobileSteps.length - 1) {
        setState(prev => ({ ...prev, currentStep: prev.currentStep + 1, swipeDirection: 'left' }));
      }
    },
    onSwipeRight: () => {
      if (state.currentStep > 0) {
        setState(prev => ({ ...prev, currentStep: prev.currentStep - 1, swipeDirection: 'right' }));
      }
    },
    threshold: 75
  });

  // 防抖保存
  const debouncedSave = useDebounce(
    useOptimizedCallback((data: Partial<DataCollectionFormData>) => {
      CacheManager.set(`mobile_workflow_${reportTypeId}`, { ...state, formData: data });
    }, [state, reportTypeId]),
    1000
  );

  // 处理表单数据更新
  const handleFormDataUpdate = useOptimizedCallback((data: Partial<DataCollectionFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
    debouncedSave(data);
  }, [debouncedSave]);

  // 步骤导航
  const handleStepChange = useOptimizedCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      swipeDirection: stepIndex > prev.currentStep ? 'left' : 'right'
    }));
  }, []);

  // 下拉菜单处理
  const handleBottomSheet = useOptimizedCallback((content: 'ai' | 'preview' | 'settings' | null) => {
    setState(prev => ({
      ...prev,
      showBottomSheet: !!content,
      bottomSheetContent: content
    }));
  }, []);

  // 计算步骤完成度
  const stepProgress = useMemo(() => {
    const progress = [
      Object.keys(state.formData).length > 3 ? 100 : Math.min(Object.keys(state.formData).length * 25, 100),
      state.currentStep > 0 ? 100 : 0,
      state.generationProgress,
      state.currentStep >= 3 ? 100 : 0
    ];
    return progress;
  }, [state.formData, state.currentStep, state.generationProgress]);

  // 渲染移动端步骤指示器
  const renderMobileStepIndicator = () => (
    <div className="relative">
      {/* 步骤进度条 */}
      <div className="flex items-center justify-between mb-4">
        {mobileSteps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            {/* 连接线 */}
            {index < mobileSteps.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 transform -translate-y-1/2">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: state.currentStep > index ? '100%' : '0%' }}
                />
              </div>
            )}

            {/* 步骤圆圈 */}
            <div className="relative flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold relative z-10',
                  index === state.currentStep
                    ? 'bg-blue-500 text-white'
                    : index < state.currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === state.currentStep ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {index < state.currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>

              {/* 步骤标题 */}
              <span className={cn(
                'text-xs mt-2 text-center',
                index === state.currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
              )}>
                {deviceInfo.width < 360 ? step.shortTitle : step.title}
              </span>

              {/* 进度指示 */}
              {stepProgress[index] > 0 && (
                <div className="w-12 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${stepProgress[index]}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染步骤内容
  const renderStepContent = () => {
    const slideVariants = {
      hidden: (direction: string) => ({
        x: direction === 'left' ? '100%' : '-100%',
        opacity: 0
      }),
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30
        }
      },
      exit: (direction: string) => ({
        x: direction === 'left' ? '-100%' : '100%',
        opacity: 0,
        transition: {
          duration: 0.2
        }
      })
    };

    const currentStepData = mobileSteps[state.currentStep];

    return (
      <AnimatePresence mode="wait" custom={state.swipeDirection}>
        <motion.div
          key={state.currentStep}
          custom={state.swipeDirection}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
          {...touchGestures}
        >
          {state.currentStep === 0 && (
            <PerformanceContainer name="MobileDataCollection" enableVirtualization={true}>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`w-3 h-3 rounded-full bg-${currentStepData.color}-500`} />
                    {currentStepData.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{currentStepData.description}</p>
                </CardHeader>
                <CardContent>
                  <LazyDataCollectionForm
                    initialData={state.formData}
                    onSubmit={(data) => {
                      handleFormDataUpdate(data);
                      handleStepChange(1);
                    }}
                    onSave={handleFormDataUpdate}
                    mobileOptimized={true}
                  />
                </CardContent>
              </Card>
            </PerformanceContainer>
          )}

          {state.currentStep === 1 && (
            <PerformanceContainer name="MobileReview">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`w-3 h-3 rounded-full bg-${currentStepData.color}-500`} />
                    {currentStepData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">确认以下信息：</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">项目名称:</span>
                        <span className="text-gray-900">{state.formData.projectName || '未填写'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">项目类型:</span>
                        <span className="text-gray-900">{state.formData.projectType || '未选择'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">项目位置:</span>
                        <span className="text-gray-900">{state.formData.location || '未填写'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      信息确认后将开始AI分析
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStepChange(0)}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      返回编辑
                    </Button>
                    <Button
                      onClick={() => {
                        handleStepChange(2);
                        // 这里会启动AI生成流程
                      }}
                      className="flex-1"
                    >
                      开始生成
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PerformanceContainer>
          )}

          {state.currentStep === 2 && (
            <PerformanceContainer name="MobileGeneration">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`w-3 h-3 rounded-full bg-${currentStepData.color}-500`} />
                    {currentStepData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 移动端优化的进度显示 */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - state.generationProgress / 100) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-purple-600">
                          {Math.round(state.generationProgress)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 正在分析中...</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      预计还需要 {Math.max(0, Math.round((100 - state.generationProgress) / 10))} 分钟
                    </p>
                  </div>

                  {/* 简化的阶段显示 */}
                  <div className="space-y-3">
                    {state.progressStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all',
                          stage.status === 'running' ? 'bg-blue-50 border border-blue-200' :
                          stage.status === 'completed' ? 'bg-green-50 border border-green-200' :
                          'bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs',
                          stage.status === 'running' ? 'bg-blue-500 text-white' :
                          stage.status === 'completed' ? 'bg-green-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        )}>
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : stage.status === 'running' ? (
                            <motion.div
                              className="w-3 h-3 bg-white rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{stage.name}</h4>
                          {stage.status === 'running' && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <motion.div
                                className="bg-blue-500 h-1 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            stage.status === 'completed' ? 'success' :
                            stage.status === 'running' ? 'primary' : 'default'
                          }
                          size="sm"
                        >
                          {stage.status === 'completed' ? '完成' :
                           stage.status === 'running' ? '进行中' : '等待'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </PerformanceContainer>
          )}

          {state.currentStep === 3 && (
            <PerformanceContainer name="MobileComplete">
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <CardTitle className="text-xl text-green-900">报告生成完成！</CardTitle>
                  <p className="text-sm text-green-700">您的专属AI报告已准备就绪</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 文件列表 */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">下载文件：</h3>
                    <div className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PDF</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reportTypeName}</p>
                            <p className="text-xs text-gray-600">完整版报告</p>
                          </div>
                        </div>
                        <Button size="sm">下载</Button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PPT</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reportTypeName}</p>
                            <p className="text-xs text-gray-600">演示文稿</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">下载</Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <ResponsiveGrid cols={{ xs: 1, sm: 2 }} gap={{ xs: 3, sm: 4 }}>
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      预览报告
                    </Button>
                    <Button className="flex-1">
                      生成新报告
                    </Button>
                  </ResponsiveGrid>
                </CardContent>
              </Card>
            </PerformanceContainer>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* 移动端头部 */}
      <div
        className="sticky top-0 z-40 bg-white border-b border-gray-200"
        style={{ height: headerHeight }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg leading-tight">{reportTypeName}</h1>
              <p className="text-xs text-gray-500">步骤 {state.currentStep + 1} / {mobileSteps.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBottomSheet('preview')}
              className="p-2"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBottomSheet('ai')}
              className="p-2"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showMobileMenu: true }))}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <ResponsiveContainer padding={{ xs: '1rem', sm: '1.5rem' }}>
        <div className="space-y-6">
          {/* 步骤指示器 */}
          {renderMobileStepIndicator()}

          {/* 步骤内容 */}
          <div className="pb-20">
            {renderStepContent()}
          </div>
        </div>
      </ResponsiveContainer>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            disabled={state.currentStep === 0}
            onClick={() => handleStepChange(state.currentStep - 1)}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一步
          </Button>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              预计还需 {Math.max(0, (mobileSteps.length - state.currentStep - 1) * 3)} 分钟
            </span>
          </div>

          <Button
            disabled={state.currentStep === mobileSteps.length - 1 || state.isGenerating}
            onClick={() => handleStepChange(state.currentStep + 1)}
            className="flex-1"
          >
            下一步
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 底部抽屉 */}
      <AnimatePresence>
        {state.showBottomSheet && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => handleBottomSheet(null)}
            />

            {/* 抽屉内容 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {state.bottomSheetContent === 'ai' && 'AI助手'}
                    {state.bottomSheetContent === 'preview' && '实时预览'}
                    {state.bottomSheetContent === 'settings' && '设置'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBottomSheet(null)}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                {state.bottomSheetContent === 'ai' && (
                  <LazyAIAssistant
                    mode="inline"
                    context={{
                      page: 'mobile-workflow',
                      step: state.currentStep,
                      formData: state.formData,
                      reportType: reportTypeName
                    }}
                    onSendMessage={(message) => {
                      // 处理AI消息
                    }}
                    className="h-96"
                  />
                )}

                {state.bottomSheetContent === 'preview' && (
                  <div className="p-4">
                    <LazyReportPreview
                      formData={state.formData}
                      isGenerating={state.isGenerating}
                      generationProgress={state.generationProgress}
                      mode="compact"
                      showControls={false}
                    />
                  </div>
                )}

                {state.bottomSheetContent === 'settings' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">自动保存</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">离线模式</span>
                      <input type="checkbox" />
                    </div>
                    <Button className="w-full" onClick={() => handleBottomSheet(null)}>
                      保存设置
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 移动端菜单 */}
      <Modal
        open={state.showMobileMenu}
        onOpenChange={(open) => setState(prev => ({ ...prev, showMobileMenu: open }))}
        title="菜单"
        size="sm"
      >
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            leftIcon={<Save className="w-4 h-4" />}
          >
            保存草稿
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            leftIcon={<Smartphone className="w-4 h-4" />}
          >
            切换设备视图
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/reports')}
          >
            返回报告列表
          </Button>
        </div>
      </Modal>
    </div>
  );
});

MobileWorkflow.displayName = 'MobileWorkflow';