/**
 * 演示模式配置
 * 在没有后端的情况下提供Mock数据
 */

export const isDemoMode = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_BASE_URL?.includes('backend');

export const demoConfig = {
  // 模拟用户数据
  mockUser: {
    id: 'demo-user',
    name: '演示用户',
    email: 'demo@marketpro.com',
    role: 'user'
  },

  // 模拟项目数据
  mockProjects: [
    {
      id: 'demo-project-1',
      name: '万科·翡翠湾项目',
      reportTypeId: 'pre-feasibility-study',
      status: 'completed',
      progress: 85,
      createdAt: new Date('2024-12-01').toISOString(),
      inputData: {
        projectName: '万科·翡翠湾',
        location: '上海市浦东新区',
        projectType: '高端住宅',
        totalArea: '150000',
        plannedUnits: '800'
      }
    },
    {
      id: 'demo-project-2',
      name: '碧桂园·贵安府',
      reportTypeId: 'market-analysis',
      status: 'processing',
      progress: 45,
      createdAt: new Date('2024-11-28').toISOString(),
      inputData: {
        projectName: '碧桂园·贵安府',
        location: '福建省福州市',
        projectType: '刚需住宅',
        totalArea: '200000',
        plannedUnits: '1200'
      }
    },
    {
      id: 'demo-project-3',
      name: '华润·悦府',
      reportTypeId: 'competitor-analysis',
      status: 'draft',
      progress: 15,
      createdAt: new Date('2024-12-03').toISOString(),
      inputData: {
        projectName: '华润·悦府',
        location: '广州市天河区',
        projectType: '豪宅',
        totalArea: '80000',
        plannedUnits: '300'
      }
    }
  ],

  // 模拟生成的报告
  mockReports: [
    {
      id: 'report-1',
      projectId: 'demo-project-1',
      reportTypeId: 'pre-feasibility-study',
      title: '万科·翡翠湾项目预可行性研究报告',
      status: 'completed',
      version: 1,
      designSystem: 'default',
      filePath: '/demo/reports/report-1.pdf',
      fileSize: 2048576,
      createdAt: new Date('2024-12-01T10:30:00Z').toISOString(),
      updatedAt: new Date('2024-12-01T10:30:00Z').toISOString()
    },
    {
      id: 'report-2',
      projectId: 'demo-project-2',
      reportTypeId: 'market-analysis',
      title: '碧桂园·贵安府市场调研与分析报告',
      status: 'completed',
      version: 2,
      designSystem: 'modern',
      filePath: '/demo/reports/report-2.pdf',
      fileSize: 3145728,
      createdAt: new Date('2024-11-28T14:20:00Z').toISOString(),
      updatedAt: new Date('2024-12-02T09:15:00Z').toISOString()
    }
  ]
};

// Mock API响应函数
export const mockApi = {
  getProjects: () => Promise.resolve({
    success: true,
    data: demoConfig.mockProjects
  }),

  getProject: (id: string) => Promise.resolve({
    success: true,
    data: demoConfig.mockProjects.find(p => p.id === id)
  }),

  getReports: (projectId: string) => Promise.resolve({
    success: true,
    data: demoConfig.mockReports.filter(r => r.projectId === projectId)
  }),

  generateReport: (data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: 'new-report-' + Date.now(),
            status: 'completed',
            content: {
              executive_summary: '这是一个演示报告的执行摘要...',
              market_analysis: '市场分析显示该区域具有良好的发展潜力...',
              financial_projections: '财务预测表明项目具有较好的投资回报率...'
            }
          }
        });
      }, 3000); // 模拟3秒生成时间
    });
  }
};

// 演示提示信息
export const demoMessages = {
  apiNotAvailable: '当前为演示模式，使用模拟数据展示功能',
  generationDemo: 'AI生成功能演示中，实际部署需要配置AI服务',
  downloadDemo: '下载功能演示，实际文件需要后端支持',
  shareDemo: '分享功能演示，实际分享需要后端服务'
};