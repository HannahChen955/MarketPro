'use client';

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ReportWorkflow } from '@/components/workflow';
import { LoadingSpinner } from '@/components/ui';
import { useReportStore } from '@/stores/useReportStore';

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const resolvedParams = use(params);
  const [reportType, setReportType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { reports } = useReportStore();

  useEffect(() => {
    // 从store中获取报告类型信息
    const loadReportType = async () => {
      setIsLoading(true);

      // 模拟异步加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const foundReport = reports.find(r => r.id === resolvedParams.id);

      if (!foundReport) {
        notFound();
        return;
      }

      setReportType(foundReport);
      setIsLoading(false);
    };

    loadReportType();
  }, [resolvedParams.id, reports]);

  if (isLoading) {
    return (
      <LoadingSpinner
        variant="page"
        message="正在加载工作流程..."
        stage="initializing"
      />
    );
  }

  if (!reportType) {
    notFound();
  }

  return (
    <ReportWorkflow
      reportTypeId={reportType.id}
      reportTypeName={reportType.name}
      // 可以传入初始数据，比如从草稿中恢复的数据
      initialData={{
        projectType: 'residential',
        analysisDepth: 'comprehensive',
        reportFormat: 'both',
        reportStyle: 'professional',
        includeCharts: true,
        includeImages: true,
        targetAudience: ['first_time_buyers']
      }}
    />
  );
}