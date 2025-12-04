import { Project } from '@/types/project';

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'AI智能音箱产品',
    description: '针对家庭用户的智能语音助手产品，支持多种音频格式和智能家居控制',
    industry: '消费电子',
    targetMarket: '中国大陆',
    stage: 'database',
    budget: 500000,
    timeline: 90,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    database: {
      basicInfo: {
        productName: 'AI智能音箱',
        productDescription: '基于AI技术的智能语音助手，支持音乐播放、智能家居控制、语音交互等功能',
        targetMarket: '中国大陆家庭用户市场',
        productCategory: '消费电子 - 智能家居',
        developmentStage: '产品设计阶段',
        expectedLaunchDate: '2024-06-01',
        estimatedBudget: 500000,
        timeline: 90,
        keyFeatures: [
          '高质量音频播放',
          '语音识别与控制',
          '智能家居集成',
          '多平台兼容',
          '云端AI助手'
        ]
      },
      competitors: [
        {
          id: '1',
          name: '小米音箱',
          description: '小米生态链智能音箱产品',
          marketShare: 25,
          priceRange: { min: 199, max: 499 },
          strengths: ['生态链完整', '价格优势', '品牌认知度高'],
          weaknesses: ['音质一般', '语音识别准确度有限'],
          keyFeatures: ['小爱同学', '智能家居控制', '蓝牙音箱']
        },
        {
          id: '2',
          name: 'Amazon Echo',
          description: '亚马逊智能音箱系列',
          marketShare: 15,
          priceRange: { min: 299, max: 999 },
          strengths: ['技术领先', 'Alexa生态', '音质优秀'],
          weaknesses: ['价格较高', '本土化不足'],
          keyFeatures: ['Alexa语音助手', '多房间音频', '智能家居控制']
        }
      ],
      targetAudience: [
        {
          id: '1',
          name: '年轻家庭用户',
          description: '25-35岁，有一定消费能力的年轻家庭',
          characteristics: ['科技敏感', '重视生活品质', '接受新产品快'],
          painPoints: ['现有产品功能单一', '语音识别不够准确', '缺乏个性化服务'],
          preferences: ['简洁设计', '多功能集成', '智能化程度高'],
          demographics: {
            ageRange: '25-35',
            income: '月收入8K-20K',
            location: '一二线城市',
            education: '本科以上'
          }
        }
      ],
      timeline: {
        phases: [
          {
            id: '1',
            name: '市场调研阶段',
            duration: 30,
            startDate: '2024-02-01',
            endDate: '2024-03-01',
            milestones: ['竞品分析', '用户调研', '市场定位'],
            status: 'completed'
          },
          {
            id: '2',
            name: '产品设计阶段',
            duration: 45,
            startDate: '2024-03-01',
            endDate: '2024-04-15',
            milestones: ['功能规划', '技术方案', '原型设计'],
            status: 'in_progress'
          },
          {
            id: '3',
            name: '开发测试阶段',
            duration: 60,
            startDate: '2024-04-15',
            endDate: '2024-06-15',
            milestones: ['技术开发', '功能测试', '用户测试'],
            status: 'pending'
          }
        ]
      },
      marketData: {
        marketSize: 85000000000,
        growthRate: 18.5,
        marketTrends: [
          '智能家居市场快速增长',
          '语音交互技术日趋成熟',
          '消费者对AI产品接受度提高',
          '个性化服务需求增强'
        ],
        opportunities: [
          '5G技术普及带来新机遇',
          '老龄化社会对智能助手需求增长',
          'IoT设备增长推动智能音箱需求'
        ],
        threats: [
          '市场竞争激烈',
          '技术更新快',
          '用户隐私关注度提升'
        ]
      }
    }
  },
  {
    id: 'project-2',
    name: '在线教育平台',
    description: '面向K12学生的在线教育平台，提供个性化学习方案',
    industry: '在线教育',
    targetMarket: '中国大陆',
    stage: 'phase-2',
    budget: 800000,
    timeline: 120,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    database: {
      basicInfo: {
        productName: '智学在线',
        productDescription: 'K12在线教育平台，提供个性化学习路径和智能辅导',
        targetMarket: '中国K12教育市场',
        productCategory: '在线教育 - K12',
        developmentStage: '产品规划阶段',
        expectedLaunchDate: '2024-08-01',
        estimatedBudget: 800000,
        timeline: 120,
        keyFeatures: [
          '个性化学习路径',
          'AI智能辅导',
          '实时学习分析',
          '家长监控系统',
          '多媒体课程内容'
        ]
      }
    }
  },
  {
    id: 'sample-project-id',
    name: '示例项目',
    description: '用于测试路由的示例项目',
    industry: '测试',
    targetMarket: '全球',
    stage: 'database',
    budget: 100000,
    timeline: 30,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    database: {
      basicInfo: {
        productName: '测试产品',
        productDescription: '这是一个用于测试的产品',
        targetMarket: '测试市场',
        productCategory: '测试分类',
        developmentStage: '测试阶段',
        expectedLaunchDate: '2024-12-31',
        estimatedBudget: 100000,
        timeline: 30,
        keyFeatures: ['测试功能1', '测试功能2']
      }
    }
  }
];

export const mockReports = [
  {
    id: 'report-1',
    projectId: 'project-1',
    type: 'competitor-analysis',
    title: 'AI智能音箱竞品分析报告',
    status: 'completed',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

// 导出类型
export type { Project };