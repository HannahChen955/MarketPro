import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ReportType } from '@/types/report';
import { api } from '@/lib/api';

interface ReportState {
  // 状态
  reports: ReportType[];
  loading: boolean;
  error: string | null;

  // 操作
  fetchReports: () => Promise<void>;
  createReport: (report: Partial<ReportType>) => Promise<ReportType>;
  updateReport: (id: string, updates: Partial<ReportType>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  clearError: () => void;
}

// 初始化8个报告类型（包括占位符）
const initialReports: ReportType[] = [
  {
    id: '1',
    name: '竞品分析报告',
    description: '深度分析竞争项目的产品定位、价格策略、销售表现等关键指标',
    icon: '📊',
    status: 'active',
    category: 'market',
    estimatedTime: '8-12分钟',
    version: 1
  },
  {
    id: '2',
    name: '市场研究报告',
    description: '全面分析区域市场供需状况、价格趋势、政策影响等市场要素',
    icon: '📈',
    status: 'active',
    category: 'market',
    estimatedTime: '10-15分钟',
    version: 1
  },
  {
    id: '3',
    name: '项目营销方案',
    description: '制定针对性的营销策略、渠道规划、推广节点安排等营销计划',
    icon: '🎯',
    status: 'active',
    category: 'project',
    estimatedTime: '12-18分钟',
    version: 1
  },
  {
    id: '4',
    name: '销售进度跟踪',
    description: '监控项目销售表现、来访转化、客储情况等关键销售指标',
    icon: '📋',
    status: 'active',
    category: 'sales',
    estimatedTime: '5-8分钟',
    version: 1
  },
  {
    id: '5',
    name: '投资收益分析',
    description: '评估项目投资价值、收益预期、风险评估等投资决策要素',
    icon: '💰',
    status: 'placeholder',
    category: 'investment',
    estimatedTime: '待配置'
  },
  {
    id: '6',
    name: '客户画像分析',
    description: '分析目标客群特征、需求偏好、购买行为等客户洞察',
    icon: '👥',
    status: 'placeholder',
    category: 'market',
    estimatedTime: '待配置'
  },
  {
    id: '7',
    name: '媒体投放效果',
    description: '评估广告投放效果、ROI分析、渠道优化建议等营销数据',
    icon: '📺',
    status: 'coming_soon',
    category: 'project',
    estimatedTime: '即将推出'
  },
  {
    id: '8',
    name: '政策影响分析',
    description: '分析最新政策对市场的影响、机遇与挑战、应对策略建议',
    icon: '📜',
    status: 'coming_soon',
    category: 'market',
    estimatedTime: '即将推出'
  }
];

export const useReportStore = create<ReportState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      reports: initialReports,
      loading: false,
      error: null,

      // 获取所有报告类型
      fetchReports: async () => {
        set({ loading: true, error: null });

        try {
          const response = await api.get('/reports');
          const fetchedReports = (response.data as any).data;

          // 合并获取的数据和占位符，确保总是有8个
          const allReports = [...fetchedReports];

          // 如果不足8个，用占位符补充
          while (allReports.length < 8) {
            allReports.push({
              id: `placeholder_${allReports.length + 1}`,
              name: `报告类型 ${allReports.length + 1}`,
              description: '点击配置此报告模块，或上传现有报告让AI学习生成',
              icon: '⚙️',
              status: 'placeholder' as const,
              category: 'project' as const,
              estimatedTime: '待配置'
            });
          }

          set({ reports: allReports, loading: false });
        } catch (error) {
          console.warn('获取报告类型失败，使用默认数据:', error);
          // 如果API调用失败，使用初始数据
          set({ reports: initialReports, loading: false });
        }
      },

      // 创建新报告类型
      createReport: async (reportData) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post('/reports', reportData);
          const newReport = (response.data as any).data;

          set((state) => ({
            reports: state.reports.map((report, index) =>
              report.status === 'placeholder' && index === state.reports.findIndex(r => r.status === 'placeholder')
                ? newReport
                : report
            ),
            loading: false
          }));

          return newReport;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '创建报告类型失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // 更新报告类型
      updateReport: async (id, updates) => {
        set({ loading: true, error: null });

        try {
          const response = await api.put(`/reports/${id}`, updates);
          const updatedReport = (response.data as any).data;

          set((state) => ({
            reports: state.reports.map((report) =>
              report.id === id ? { ...report, ...updatedReport } : report
            ),
            loading: false
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '更新报告类型失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // 删除报告类型
      deleteReport: async (id) => {
        set({ loading: true, error: null });

        try {
          await api.delete(`/reports/${id}`);

          set((state) => ({
            reports: state.reports.filter((report) => report.id !== id),
            loading: false
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || '删除报告类型失败';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // 清除错误
      clearError: () => set({ error: null })
    }),
    {
      name: 'report-store'
    }
  )
);