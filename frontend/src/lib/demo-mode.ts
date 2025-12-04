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
      // 模拟真实的AI生成过程，包含多个阶段
      const stages = [
        '正在分析项目基础信息...',
        '正在进行市场调研分析...',
        '正在分析竞品情况...',
        '正在进行财务建模...',
        '正在生成报告内容...',
        '正在优化报告格式...'
      ];

      let currentStage = 0;
      const stageInterval = setInterval(() => {
        currentStage++;
        if (currentStage >= stages.length) {
          clearInterval(stageInterval);
        }
      }, 800);

      setTimeout(() => {
        clearInterval(stageInterval);
        resolve({
          success: true,
          data: {
            id: 'new-report-' + Date.now(),
            status: 'completed',
            content: {
              executive_summary: '这是一个演示报告的执行摘要，展示AI生成的专业分析内容...',
              market_analysis: '市场分析显示该区域具有良好的发展潜力，供需关系相对平衡...',
              financial_projections: '财务预测表明项目具有较好的投资回报率，预计IRR达15-18%...',
              risk_assessment: '风险评估显示项目整体风险可控，主要风险点已识别...',
              recommendations: '建议按计划推进项目开发，重点关注产品定位和营销策略...'
            },
            metadata: {
              generated_at: new Date().toISOString(),
              ai_model: 'Qwen-Max (Demo Mode)',
              processing_time: '5.2秒',
              confidence_score: 0.92
            }
          }
        });
      }, 5000); // 模拟5秒生成时间
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