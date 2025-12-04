import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据填充...');

  // 清理现有数据（可选）
  // await prisma.taskHeartbeat.deleteMany();
  // await prisma.task.deleteMany();
  // await prisma.file.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.reportType.deleteMany();
  // await prisma.user.deleteMany();

  // 创建默认用户
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@marketpro.ai' },
    update: {},
    create: {
      email: 'admin@marketpro.ai',
      password: hashedPassword,
      name: 'MarketPro 管理员',
      role: 'admin'
    }
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@marketpro.ai' },
    update: {},
    create: {
      email: 'demo@marketpro.ai',
      password: await bcrypt.hash('demo123', 12),
      name: '演示用户',
      role: 'user'
    }
  });

  console.log('✅ 创建用户完成');

  // 创建报告类型
  const reportTypes = [
    // 🧱 第一阶段：拿地前（前期可研阶段）
    {
      id: 'pre-feasibility-study',
      name: '前期可行性研究报告',
      description: '判断这块地值不值得拿、拿地后的产品怎么做、市场能不能接受',
      icon: '🧱',
      status: 'active',
      category: 'stage1',
      // phase: 'pre-acquisition',
      // estimatedTime: '15-20分钟',
      configuration: {
        inputSchema: [
          {
            id: 'land_location',
            label: '地块位置',
            type: 'text',
            required: true,
            placeholder: '请输入具体地块位置'
          },
          {
            id: 'land_area',
            label: '地块面积',
            type: 'text',
            required: true,
            placeholder: '请输入地块面积（㎡）'
          },
          {
            id: 'plot_ratio',
            label: '容积率',
            type: 'text',
            required: true,
            placeholder: '请输入容积率'
          },
          {
            id: 'land_price',
            label: '土地价格',
            type: 'text',
            required: true,
            placeholder: '请输入土地价格（万元）'
          },
          {
            id: 'surrounding_projects',
            label: '周边项目',
            type: 'textarea',
            required: true,
            placeholder: '请列出周边主要项目，每行一个'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'market-competitive-research',
      name: '市场及竞品研究报告',
      description: '区域市场基础研究和竞品深度分析',
      icon: '📊',
      status: 'active',
      category: 'stage1',
      // phase: 'pre-acquisition',
      // estimatedTime: '12-15分钟',
      configuration: {
        inputSchema: [
          {
            id: 'research_area',
            label: '研究区域',
            type: 'text',
            required: true,
            placeholder: '请输入研究区域'
          },
          {
            id: 'competitor_projects',
            label: '竞品项目',
            type: 'textarea',
            required: true,
            placeholder: '请列出主要竞品项目，每行一个'
          },
          {
            id: 'time_range',
            label: '分析时间范围',
            type: 'select',
            required: true,
            options: ['最近3个月', '最近6个月', '最近1年']
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'customer-portrait-research',
      name: '客户画像研究报告',
      description: '区域客群结构、置业偏好、价格敏感度分析',
      icon: '👥',
      status: 'active',
      category: 'stage1',
      // phase: 'pre-acquisition',
      // estimatedTime: '10-12分钟',
      configuration: {
        inputSchema: [
          {
            id: 'target_area',
            label: '目标区域',
            type: 'text',
            required: true,
            placeholder: '请输入目标区域'
          },
          {
            id: 'property_type',
            label: '物业类型',
            type: 'select',
            required: true,
            options: ['住宅', '商业', '办公', '工业', '综合体']
          },
          {
            id: 'price_range',
            label: '价格区间',
            type: 'select',
            required: true,
            options: ['5万以下', '5-10万', '10-20万', '20-30万', '30万以上']
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'land-acquisition-decision',
      name: '拿地决策建议书',
      description: '综合可行性判断和拿地建议',
      icon: '📋',
      status: 'active',
      category: 'stage1',
      // phase: 'pre-acquisition',
      // estimatedTime: '8-10分钟',
      configuration: {
        inputSchema: [
          {
            id: 'project_name',
            label: '项目名称',
            type: 'text',
            required: true,
            placeholder: '请输入项目名称'
          },
          {
            id: 'expected_roi',
            label: '预期投资回报率',
            type: 'text',
            required: true,
            placeholder: '请输入预期ROI（%）'
          },
          {
            id: 'risk_factors',
            label: '风险因素',
            type: 'textarea',
            required: true,
            placeholder: '请列出主要风险因素'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },

    // 🏗️ 第二阶段：前期开发阶段（产品定位 & 超盘方案阶段）
    {
      id: 'project-overall-marketing-plan',
      name: '项目整体营销方案（超盘方案）',
      description: '产品定位+营销策略顶层设计的综合性方案',
      icon: '🏗️',
      status: 'active',
      category: 'stage2',
      // phase: 'pre-development',
      // estimatedTime: '20-25分钟',
      configuration: {
        inputSchema: [
          {
            id: 'project_name',
            label: '项目名称',
            type: 'text',
            required: true,
            placeholder: '请输入项目名称'
          },
          {
            id: 'project_positioning',
            label: '产品定位',
            type: 'textarea',
            required: true,
            placeholder: '请描述产品定位和核心卖点'
          },
          {
            id: 'target_customers',
            label: '目标客群',
            type: 'multiselect',
            required: true,
            options: ['首次置业', '改善性购房', '投资客', '高净值人群', '企业客户']
          },
          {
            id: 'marketing_budget',
            label: '营销预算',
            type: 'select',
            required: true,
            options: ['500万以下', '500-1000万', '1000-3000万', '3000万以上']
          },
          {
            id: 'launch_timeline',
            label: '推广时间线',
            type: 'text',
            required: true,
            placeholder: '如：6个月完成整体销售'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'promotion-strategy-plan',
      name: '推广策略计划书',
      description: '阶段性推广主题、渠道组合、活动规划',
      icon: '📢',
      status: 'active',
      category: 'stage2',
      // phase: 'pre-development',
      // estimatedTime: '15-18分钟',
      configuration: {
        inputSchema: [
          {
            id: 'project_name',
            label: '项目名称',
            type: 'text',
            required: true,
            placeholder: '请输入项目名称'
          },
          {
            id: 'promotion_channels',
            label: '推广渠道',
            type: 'multiselect',
            required: true,
            options: ['线上广告', '线下活动', '媒体合作', '渠道代理', 'KOL合作', '社群营销']
          },
          {
            id: 'promotion_phases',
            label: '推广阶段',
            type: 'multiselect',
            required: true,
            options: ['蓄客阶段', '开盘预热', '正式开盘', '持续销售', '尾盘清货']
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'budget-calculation-sheet',
      name: '预算测算表',
      description: '详细的营销费用预算和投入产出分析',
      icon: '💰',
      status: 'active',
      category: 'stage2',
      // phase: 'pre-development',
      // estimatedTime: '12-15分钟',
      configuration: {
        inputSchema: [
          {
            id: 'total_budget',
            label: '总营销预算',
            type: 'text',
            required: true,
            placeholder: '请输入总预算（万元）'
          },
          {
            id: 'budget_allocation',
            label: '预算分配重点',
            type: 'multiselect',
            required: true,
            options: ['推广费', '渠道费', '物料费', '人员工资', '佣金', '制作费', '活动费']
          },
          {
            id: 'expected_sales',
            label: '预期销售额',
            type: 'text',
            required: true,
            placeholder: '请输入预期销售额（万元）'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'sales-team-training-plan',
      name: '销售团队培训方案',
      description: '销售团队结构、培训体系、KPI设计',
      icon: '👨‍🏫',
      status: 'active',
      category: 'stage2',
      // phase: 'pre-development',
      // estimatedTime: '10-12分钟',
      configuration: {
        inputSchema: [
          {
            id: 'team_size',
            label: '团队规模',
            type: 'select',
            required: true,
            options: ['10人以下', '10-20人', '20-50人', '50人以上']
          },
          {
            id: 'training_focus',
            label: '培训重点',
            type: 'multiselect',
            required: true,
            options: ['产品知识', '销售技巧', '客户服务', '谈判技能', '团队协作']
          },
          {
            id: 'performance_targets',
            label: '绩效目标',
            type: 'textarea',
            required: true,
            placeholder: '请输入具体的绩效目标和考核指标'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'pricing-strategy-analysis',
      name: '定价策略分析报告',
      description: '基于市场分析和竞品对比，制定项目定价策略和优惠政策',
      icon: '💰',
      status: 'active',
      category: 'stage2',
      // phase: 'pre-development',
      // estimatedTime: '20-25分钟',
      configuration: {
        inputSchema: [
          {
            id: 'project_name',
            label: '项目名称',
            type: 'text',
            required: true,
            placeholder: '请输入项目名称'
          },
          {
            id: 'target_price_range',
            label: '目标价格区间',
            type: 'text',
            required: true,
            placeholder: '请输入目标价格区间（万元/㎡）'
          },
          {
            id: 'market_positioning',
            label: '市场定位',
            type: 'select',
            required: true,
            options: ['刚需入门', '改善入门', '中端改善', '高端改善', '豪宅产品']
          },
          {
            id: 'pricing_strategy',
            label: '定价策略',
            type: 'multiselect',
            required: true,
            options: ['成本导向定价', '竞争导向定价', '价值导向定价', '渗透定价', '撇脂定价']
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },

    // 🔥 第三阶段：开盘节点（关键里程碑报告）
    {
      id: 'opening-review-report',
      name: '开盘复盘报告',
      description: '开盘数据分析、问题诊断、表现评估',
      icon: '🔥',
      status: 'active',
      category: 'stage3',
      // phase: 'opening',
      // estimatedTime: '12-15分钟',
      configuration: {
        inputSchema: [
          {
            id: 'opening_date',
            label: '开盘日期',
            type: 'date',
            required: true,
            placeholder: '请选择开盘日期'
          },
          {
            id: 'visitor_count',
            label: '来访量',
            type: 'text',
            required: true,
            placeholder: '请输入开盘期间来访量'
          },
          {
            id: 'sales_volume',
            label: '销售套数',
            type: 'text',
            required: true,
            placeholder: '请输入开盘销售套数'
          },
          {
            id: 'sales_amount',
            label: '销售金额',
            type: 'text',
            required: true,
            placeholder: '请输入开盘销售金额（万元）'
          },
          {
            id: 'conversion_rate',
            label: '转化率',
            type: 'text',
            required: true,
            placeholder: '请输入来访转化率（%）'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'opening-summary-strategy-adjustment',
      name: '开盘总结&策略调整报告',
      description: '开盘后的策略优化和下一阶段建议',
      icon: '📈',
      status: 'active',
      category: 'stage3',
      // phase: 'opening',
      // estimatedTime: '10-12分钟',
      configuration: {
        inputSchema: [
          {
            id: 'major_issues',
            label: '主要问题',
            type: 'textarea',
            required: true,
            placeholder: '请描述开盘过程中发现的主要问题'
          },
          {
            id: 'adjustment_areas',
            label: '调整领域',
            type: 'multiselect',
            required: true,
            options: ['价格策略', '推广策略', '销售策略', '产品策略', '服务策略']
          },
          {
            id: 'next_phase_goals',
            label: '下阶段目标',
            type: 'textarea',
            required: true,
            placeholder: '请输入下一阶段的具体目标'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'competitor-dynamic-analysis',
      name: '竞品动态对比分析',
      description: '跟踪分析竞品在开盘期间的策略变化和市场表现',
      icon: '🔍',
      status: 'active',
      category: 'stage3',
      // phase: 'opening',
      // estimatedTime: '15-20分钟',
      configuration: {
        inputSchema: [
          {
            id: 'analysis_period',
            label: '分析时间段',
            type: 'text',
            required: true,
            placeholder: '如：开盘前后30天'
          },
          {
            id: 'main_competitors',
            label: '主要竞品',
            type: 'textarea',
            required: true,
            placeholder: '请列出需要重点分析的竞品项目，每行一个'
          },
          {
            id: 'analysis_dimensions',
            label: '分析维度',
            type: 'multiselect',
            required: true,
            options: ['价格策略', '促销活动', '营销手段', '客户反馈', '销售表现']
          },
          {
            id: 'focus_events',
            label: '重点关注事件',
            type: 'textarea',
            required: false,
            placeholder: '如：竞品降价、新品推出、营销活动等'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },

    // 📅 第四阶段：运营期（每周、每月、每季度）
    {
      id: 'marketing-weekly-report',
      name: '营销周报',
      description: '市场数据、竞品动态、销售表现的周度跟踪',
      icon: '📅',
      status: 'active',
      category: 'stage4',
      // phase: 'operation',
      // estimatedTime: '6-8分钟',
      configuration: {
        inputSchema: [
          {
            id: 'report_week',
            label: '报告周期',
            type: 'text',
            required: true,
            placeholder: '如：2024年第48周'
          },
          {
            id: 'weekly_visitors',
            label: '本周来访量',
            type: 'text',
            required: true,
            placeholder: '请输入本周来访量'
          },
          {
            id: 'weekly_sales',
            label: '本周成交量',
            type: 'text',
            required: true,
            placeholder: '请输入本周成交套数'
          },
          {
            id: 'main_issues',
            label: '本周问题',
            type: 'textarea',
            required: false,
            placeholder: '请描述本周遇到的主要问题'
          },
          {
            id: 'next_week_focus',
            label: '下周重点',
            type: 'textarea',
            required: true,
            placeholder: '请输入下周工作重点'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'marketing-monthly-report',
      name: '营销月报',
      description: '月度市场复盘、客户结构分析、KPI完成度评估',
      icon: '📊',
      status: 'active',
      category: 'stage4',
      // phase: 'operation',
      // estimatedTime: '10-12分钟',
      configuration: {
        inputSchema: [
          {
            id: 'report_month',
            label: '报告月份',
            type: 'text',
            required: true,
            placeholder: '如：2024年11月'
          },
          {
            id: 'monthly_target',
            label: '月度目标',
            type: 'text',
            required: true,
            placeholder: '请输入月度销售目标'
          },
          {
            id: 'monthly_achievement',
            label: '实际完成',
            type: 'text',
            required: true,
            placeholder: '请输入实际完成情况'
          },
          {
            id: 'market_changes',
            label: '市场变化',
            type: 'textarea',
            required: true,
            placeholder: '请描述本月市场主要变化'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'marketing-quarterly-report',
      name: '营销季报',
      description: '季度战略复盘、竞争格局分析、策略优化建议',
      icon: '📈',
      status: 'active',
      category: 'stage4',
      // phase: 'operation',
      // estimatedTime: '15-18分钟',
      configuration: {
        inputSchema: [
          {
            id: 'report_quarter',
            label: '报告季度',
            type: 'select',
            required: true,
            options: ['2024年Q1', '2024年Q2', '2024年Q3', '2024年Q4', '2025年Q1']
          },
          {
            id: 'quarterly_strategy',
            label: '季度策略重点',
            type: 'textarea',
            required: true,
            placeholder: '请描述本季度的主要策略重点'
          },
          {
            id: 'competitive_landscape',
            label: '竞争格局变化',
            type: 'textarea',
            required: true,
            placeholder: '请描述本季度竞争格局的主要变化'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'marketing-annual-report',
      name: '营销年报',
      description: '年度全面总结、成果评估、来年规划',
      icon: '🎯',
      status: 'active',
      category: 'stage4',
      // phase: 'operation',
      // estimatedTime: '20-25分钟',
      configuration: {
        inputSchema: [
          {
            id: 'report_year',
            label: '报告年度',
            type: 'select',
            required: true,
            options: ['2023年', '2024年', '2025年']
          },
          {
            id: 'annual_achievements',
            label: '年度成果',
            type: 'textarea',
            required: true,
            placeholder: '请总结本年度的主要成果'
          },
          {
            id: 'next_year_strategy',
            label: '来年战略',
            type: 'textarea',
            required: true,
            placeholder: '请描述来年的整体战略规划'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'action-plan-report',
      name: '行动计划报告',
      description: '下周/下月/下季度的具体行动计划和排期',
      icon: '📋',
      status: 'active',
      category: 'stage4',
      // phase: 'operation',
      // estimatedTime: '8-10分钟',
      configuration: {
        inputSchema: [
          {
            id: 'plan_type',
            label: '计划类型',
            type: 'select',
            required: true,
            options: ['周计划', '月计划', '季度计划']
          },
          {
            id: 'key_activities',
            label: '重点活动',
            type: 'textarea',
            required: true,
            placeholder: '请列出计划期间的重点活动'
          },
          {
            id: 'resource_allocation',
            label: '资源配置',
            type: 'textarea',
            required: true,
            placeholder: '请描述资源配置和预算安排'
          },
          {
            id: 'success_metrics',
            label: '成功指标',
            type: 'textarea',
            required: true,
            placeholder: '请设定成功评估指标'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },

    // 🤝 第五阶段：外部合作方的报告体系
    {
      id: 'ad-agency-proposal',
      name: '广告公司营销提案',
      description: '项目洞察、创意方向、推广渠道组合建议',
      icon: '🎨',
      status: 'active',
      category: 'stage5',
      // phase: 'external-cooperation',
      // estimatedTime: '15-20分钟',
      configuration: {
        inputSchema: [
          {
            id: 'agency_name',
            label: '合作公司',
            type: 'text',
            required: true,
            placeholder: '请输入广告公司名称'
          },
          {
            id: 'campaign_theme',
            label: '推广主题',
            type: 'text',
            required: true,
            placeholder: '请输入本次推广的核心主题'
          },
          {
            id: 'creative_direction',
            label: '创意方向',
            type: 'textarea',
            required: true,
            placeholder: '请描述创意方向和视觉风格'
          },
          {
            id: 'media_channels',
            label: '媒体渠道',
            type: 'multiselect',
            required: true,
            options: ['电视广告', '网络广告', '户外广告', '平面媒体', '社交媒体', 'KOL合作']
          },
          {
            id: 'budget_range',
            label: '预算范围',
            type: 'select',
            required: true,
            options: ['100万以下', '100-300万', '300-500万', '500万以上']
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    },
    {
      id: 'market-data-research-report',
      name: '市场数据深度研究报告',
      description: '第三方数据公司提供的专业市场分析报告',
      icon: '📊',
      status: 'active',
      category: 'stage5',
      // phase: 'external-cooperation',
      // estimatedTime: '12-15分钟',
      configuration: {
        inputSchema: [
          {
            id: 'data_provider',
            label: '数据提供方',
            type: 'select',
            required: true,
            options: ['克而瑞', '中指院', '易居', '贝壳研究院', '其他专业机构']
          },
          {
            id: 'research_scope',
            label: '研究范围',
            type: 'multiselect',
            required: true,
            options: ['区域市场', '竞品分析', '客群研究', '价格分析', '土地市场', '政策影响']
          },
          {
            id: 'data_period',
            label: '数据周期',
            type: 'select',
            required: true,
            options: ['最近1个月', '最近3个月', '最近6个月', '最近1年']
          },
          {
            id: 'focus_areas',
            label: '重点关注领域',
            type: 'textarea',
            required: true,
            placeholder: '请描述需要重点关注的市场领域'
          }
        ],
        workflowSteps: [
          {
            id: 'form',
            name: '信息收集',
            type: 'form',
            configuration: {}
          },
          {
            id: 'generation',
            name: '报告生成',
            type: 'generation',
            configuration: {}
          },
          {
            id: 'preview',
            name: '预览确认',
            type: 'preview',
            configuration: {}
          }
        ],
        designSystemId: 'default',
        outputTemplates: []
      }
    }
  ];

  for (const reportType of reportTypes) {
    await prisma.reportType.upsert({
      where: { id: reportType.id },
      update: reportType,
      create: reportType
    });
  }

  console.log('✅ 创建报告类型完成');

  // 创建示例项目
  const sampleProject = await prisma.project.create({
    data: {
      name: '北京朝阳某高端住宅项目竞品分析',
      reportTypeId: 'pre-feasibility-study',
      status: 'completed',
      inputData: {
        land_location: '北京朝阳区CBD核心区',
        land_area: '50000',
        plot_ratio: '3.5',
        land_price: '80000',
        surrounding_projects: '万科翡翠公园\n绿城誉园\n远洋天地'
      },
      userId: demoUser.id
    }
  });

  // 创建示例任务
  const sampleTask = await prisma.task.create({
    data: {
      projectId: sampleProject.id,
      type: 'generate_report',
      status: 'completed',
      stage: 'completed',
      message: '报告生成完成',
      inputData: sampleProject.inputData as any,
      startedAt: new Date(Date.now() - 600000), // 10分钟前开始
      completedAt: new Date(Date.now() - 60000), // 1分钟前完成
      lastHeartbeat: new Date(Date.now() - 60000),
      estimatedDuration: 600, // 10分钟（秒）
      userId: demoUser.id
    }
  });

  // 创建示例心跳记录
  const heartbeats = [
    { stage: 'initializing', message: '任务初始化' },
    { stage: 'analyzing', message: '分析项目配置' },
    { stage: 'data_collection', message: '收集市场数据' },
    { stage: 'content_generation', message: 'AI生成报告内容' },
    { stage: 'formatting', message: '应用报告模板' },
    { stage: 'completed', message: '报告生成完成' }
  ];

  for (let i = 0; i < heartbeats.length; i++) {
    const heartbeat = heartbeats[i];
    await prisma.taskHeartbeat.create({
      data: {
        taskId: sampleTask.id,
        stage: heartbeat.stage,
        message: heartbeat.message,
        createdAt: new Date(Date.now() - (600000 - i * 120000)) // 根据索引计算时间
      }
    });
  }

  // 创建示例输出文件
  await prisma.file.create({
    data: {
      originalName: '朝阳某高端住宅_可研报告_20241203.pptx',
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      fileSize: 2458960, // 约2.4MB
      storagePath: '/uploads/pre_feasibility_study_sample.pptx',
      projectId: sampleProject.id,
      userId: demoUser.id
    }
  });

  console.log('✅ 创建示例数据完成');

  // 创建一些统计数据（用于展示）
  const stats = {
    totalUsers: await prisma.user.count(),
    totalReports: await prisma.reportType.count(),
    totalProjects: await prisma.project.count(),
    totalTasks: await prisma.task.count(),
    totalFiles: await prisma.file.count()
  };

  console.log('\n📊 数据库统计:');
  console.log(`   用户数量: ${stats.totalUsers}`);
  console.log(`   报告类型: ${stats.totalReports}`);
  console.log(`   项目数量: ${stats.totalProjects}`);
  console.log(`   任务数量: ${stats.totalTasks}`);
  console.log(`   文件数量: ${stats.totalFiles}`);

  console.log('\n🎉 数据库种子数据填充完成!');
  console.log('\n📝 默认用户账号:');
  console.log('   管理员: admin@marketpro.ai / admin123');
  console.log('   演示用户: demo@marketpro.ai / demo123');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });