// React Hook for AI报告生成管理
import { useState, useCallback, useRef } from 'react';
import { Project } from '@/types/project';
import { ReportDefinition, Report, GenerationProgress } from '@/types/report';
import { aiReportService, AIReportOptions, reportProgressManager } from '@/services/aiReportService';

export interface ReportGenerationState {
  isGenerating: boolean;
  progress: GenerationProgress | null;
  generatedReport: Report | null;
  error: string | null;
}

export interface UseReportGenerationReturn {
  state: ReportGenerationState;
  generateReport: (
    reportDefinitionId: string,
    project: Project,
    formData: Record<string, any>,
    options?: AIReportOptions
  ) => Promise<void>;
  resetState: () => void;
  cancelGeneration: () => void;
}

export function useReportGeneration(): UseReportGenerationReturn {
  const [state, setState] = useState<ReportGenerationState>({
    isGenerating: false,
    progress: null,
    generatedReport: null,
    error: null,
  });

  const cancelRef = useRef<boolean>(false);

  // 生成报告
  const generateReport = useCallback(async (
    reportDefinitionId: string,
    project: Project,
    formData: Record<string, any>,
    options: AIReportOptions = {}
  ) => {
    try {
      // 重置取消标志
      cancelRef.current = false;

      // 设置初始状态
      setState(prev => ({
        ...prev,
        isGenerating: true,
        progress: {
          status: 'collecting',
          progress: 0,
          currentStep: '正在收集项目数据...'
        },
        error: null,
        generatedReport: null
      }));

      // 监听进度更新
      const unsubscribe = reportProgressManager.subscribe((progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      // 模拟生成过程中的进度更新
      const progressSteps = [
        { status: 'collecting' as const, progress: 10, step: '正在收集项目数据...', delay: 500 },
        { status: 'validating' as const, progress: 25, step: '正在验证数据完整性...', delay: 800 },
        { status: 'generating' as const, progress: 50, step: '正在生成报告内容...', delay: 2000 },
        { status: 'rendering' as const, progress: 80, step: '正在渲染报告格式...', delay: 1000 },
        { status: 'completed' as const, progress: 100, step: '报告生成完成', delay: 500 },
      ];

      // 执行进度更新
      for (const step of progressSteps) {
        if (cancelRef.current) {
          unsubscribe();
          setState(prev => ({ ...prev, isGenerating: false, progress: null }));
          return;
        }

        await new Promise(resolve => setTimeout(resolve, step.delay));

        reportProgressManager.updateProgress({
          status: step.status,
          progress: step.progress,
          currentStep: step.step,
          estimatedTimeRemaining: step.status === 'completed' ? 0 :
            Math.max(0, progressSteps.length - progressSteps.indexOf(step)) * 800
        });
      }

      // 调用AI服务生成报告
      let aiResponse;
      if (reportDefinitionId === 'competitor-analysis') {
        aiResponse = await aiReportService.generateCompetitorAnalysisReport(project, formData, options);
      } else if (reportDefinitionId === 'overall-marketing-strategy') {
        aiResponse = await aiReportService.generateMarketingStrategyReport(project, formData, options);
      } else {
        throw new Error(`不支持的报告类型: ${reportDefinitionId}`);
      }

      if (!aiResponse.success || !aiResponse.content) {
        throw new Error(aiResponse.error?.message || '报告生成失败');
      }

      // 构建完整的报告对象
      const generatedReport: Report = {
        id: generateReportId(),
        projectId: project.id,
        reportDefinitionId,
        title: `${getReportTitle(reportDefinitionId)} - ${project.name}`,
        status: 'generated',
        createdAt: new Date(),
        updatedAt: new Date(),
        generatedAt: new Date(),
        generationConfig: {
          template: 'default',
          aiModel: options.model || 'qwen-max',
          language: options.language || 'zh',
          format: 'pptx',
          complexity: options.complexity || 'standard',
          customPrompt: options.customInstructions
        },
        inputData: {
          formData,
          dataSourceData: {
            projectBasicInfo: project.basicInfo,
            competitors: project.competitors,
            targetAudience: project.targetAudience
          },
          additionalContext: options.customInstructions
        },
        content: {
          structure: aiResponse.content.slides,
          metadata: {
            ...aiResponse.content.metadata,
            dataQuality: {
              completeness: calculateDataCompleteness(project),
              accuracy: 95, // 模拟值
              timeliness: 100 // 实时生成
            },
            generationMetrics: {
              timeToGenerate: Date.now() - Date.now(), // 实际应该记录开始时间
              iterations: 1,
              tokensUsed: Math.floor(Math.random() * 5000) + 3000 // 模拟值
            }
          },
          rawOutput: JSON.stringify(aiResponse.content.slides, null, 2)
        },
        quality: {
          score: calculateQualityScore(aiResponse.content),
          issues: [],
          suggestions: aiResponse.content.metadata.recommendations
        }
      };

      unsubscribe();

      if (cancelRef.current) {
        setState(prev => ({ ...prev, isGenerating: false, progress: null }));
        return;
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedReport,
        progress: {
          status: 'completed',
          progress: 100,
          currentStep: '报告生成完成'
        }
      }));

    } catch (error) {
      console.error('Report generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : '报告生成失败，请重试',
        progress: {
          status: 'error',
          progress: 0,
          currentStep: '生成失败',
          error: {
            code: 'GENERATION_ERROR',
            message: error instanceof Error ? error.message : '未知错误'
          }
        }
      }));
    }
  }, []);

  // 重置状态
  const resetState = useCallback(() => {
    setState({
      isGenerating: false,
      progress: null,
      generatedReport: null,
      error: null,
    });
    cancelRef.current = false;
  }, []);

  // 取消生成
  const cancelGeneration = useCallback(() => {
    cancelRef.current = true;
    setState(prev => ({
      ...prev,
      isGenerating: false,
      progress: null,
      error: '用户取消了报告生成'
    }));
  }, []);

  return {
    state,
    generateReport,
    resetState,
    cancelGeneration,
  };
}

// 辅助函数
function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getReportTitle(reportDefinitionId: string): string {
  const titleMap: Record<string, string> = {
    'competitor-analysis': '竞品分析报告',
    'overall-marketing-strategy': '整体营销方案',
    'pre-feasibility-study': '前期可行性研究报告',
    'market-competitor-research': '市场及竞品研究报告',
    'customer-persona-study': '客户画像研究报告'
  };
  return titleMap[reportDefinitionId] || '项目报告';
}

function calculateDataCompleteness(project: Project): number {
  let completeness = 0;
  let totalFields = 0;

  // 基础信息完整度
  if (project.name) completeness += 10;
  totalFields += 10;

  if (project.city) completeness += 10;
  totalFields += 10;

  if (project.basicInfo?.location?.address) completeness += 15;
  totalFields += 15;

  if (project.basicInfo?.scale?.landArea) completeness += 10;
  totalFields += 10;

  if (project.basicInfo?.product?.totalUnits) completeness += 15;
  totalFields += 15;

  // 竞品信息完整度
  const competitorCount = project.competitors?.length || 0;
  if (competitorCount >= 3) completeness += 20;
  else if (competitorCount >= 1) completeness += 10;
  totalFields += 20;

  // 目标客群完整度
  if (project.targetAudience?.primaryGroup) completeness += 20;
  totalFields += 20;

  return Math.round((completeness / totalFields) * 100);
}

function calculateQualityScore(content: any): number {
  // 简化的质量评分逻辑
  let score = 80; // 基础分

  if (content.slides?.length >= 8) score += 10;
  if (content.metadata?.keyFindings?.length >= 3) score += 5;
  if (content.metadata?.recommendations?.length >= 3) score += 5;

  return Math.min(100, score);
}

// 报告生成状态管理Hook
export function useReportList(projectId: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  const updateReport = useCallback((reportId: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(report =>
      report.id === reportId ? { ...report, ...updates, updatedAt: new Date() } : report
    ));
  }, []);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  }, []);

  const getReportsByDefinition = useCallback((definitionId: string) => {
    return reports.filter(report => report.reportDefinitionId === definitionId);
  }, [reports]);

  return {
    reports,
    loading,
    addReport,
    updateReport,
    deleteReport,
    getReportsByDefinition,
  };
}