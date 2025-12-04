'use client';

import { createLazyComponent } from '@/lib/performance';
import { LoadingSpinner } from '@/components/ui';

// 懒加载工作流组件
export const LazyReportWorkflow = createLazyComponent(
  () => import('@/components/workflow/ReportWorkflow'),
  <LoadingSpinner
    variant="page"
    message="正在加载工作流程..."
    stage="loading"
  />
);

export const LazyDataCollectionForm = createLazyComponent(
  () => import('@/components/workflow/DataCollectionForm'),
  <LoadingSpinner
    variant="inline"
    message="正在加载数据收集表单..."
    stage="loading"
  />
);

export const LazyProgressTracker = createLazyComponent(
  () => import('@/components/workflow/ProgressTracker'),
  <LoadingSpinner
    variant="inline"
    message="正在加载进度追踪器..."
    stage="loading"
  />
);

export const LazyWorkflowStepper = createLazyComponent(
  () => import('@/components/workflow/WorkflowStepper'),
  <LoadingSpinner
    variant="inline"
    message="正在加载步骤器..."
    stage="loading"
  />
);

// 懒加载 AI 助手组件
export const LazyAIAssistant = createLazyComponent(
  () => import('@/components/chat/AIAssistant'),
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
      <span className="text-sm text-gray-600">AI 助手加载中...</span>
    </div>
  </div>
);

// 懒加载预览组件
export const LazyReportPreview = createLazyComponent(
  () => import('@/components/preview/ReportPreview'),
  <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="animate-pulse w-5 h-5 bg-blue-500 rounded-full" />
      <span className="text-sm text-gray-600">预览组件加载中...</span>
    </div>
  </div>
);

// 懒加载图表组件（如果有）
export const LazyChart = createLazyComponent(
  () => import('@/components/ui/Chart'), // 假设的图表组件
  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <span className="text-gray-500">图表加载中...</span>
  </div>
);

// 懒加载大型表格组件
export const LazyDataTable = createLazyComponent(
  () => import('@/components/ui/DataTable'), // 假设的数据表格组件
  <div className="h-32 bg-gray-50 rounded border flex items-center justify-center">
    <span className="text-gray-500">表格加载中...</span>
  </div>
);

// 懒加载富文本编辑器组件
export const LazyRichEditor = createLazyComponent(
  () => import('@/components/ui/RichEditor'), // 假设的富文本编辑器
  <div className="h-48 bg-gray-50 rounded border flex items-center justify-center">
    <span className="text-gray-500">编辑器加载中...</span>
  </div>
);

// 懒加载文件上传组件
export const LazyFileUpload = createLazyComponent(
  () => import('@/components/ui/FileUpload'), // 假设的文件上传组件
  <div className="h-24 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
    <span className="text-gray-500">上传组件加载中...</span>
  </div>
);

// 懒加载设置页面组件
export const LazySettingsPage = createLazyComponent(
  () => import('@/app/settings/page'), // 假设的设置页面
  <LoadingSpinner
    variant="page"
    message="正在加载设置页面..."
    stage="loading"
  />
);

// 懒加载报告列表页面
export const LazyReportsListPage = createLazyComponent(
  () => import('@/app/reports/page'), // 假设的报告列表页面
  <LoadingSpinner
    variant="page"
    message="正在加载报告列表..."
    stage="loading"
  />
);

// 导出所有懒加载组件
export {
  // 工作流相关
  LazyReportWorkflow,
  LazyDataCollectionForm,
  LazyProgressTracker,
  LazyWorkflowStepper,
  // AI 和预览
  LazyAIAssistant,
  LazyReportPreview,
  // UI 组件
  LazyChart,
  LazyDataTable,
  LazyRichEditor,
  LazyFileUpload,
  // 页面组件
  LazySettingsPage,
  LazyReportsListPage
};