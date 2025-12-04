'use client';

import React, { useState } from 'react';
import { ReportFormBase, FormSection, ReportFormData } from '../ReportFormBase';
import {
  Rocket,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Activity,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const formSections: FormSection[] = [
  {
    id: 'launch-planning',
    title: '开盘策划方案',
    description: '制定详细的开盘营销活动策划',
    icon: <Rocket className="w-4 h-4" />,
    fields: [
      {
        id: 'launch-date',
        label: '计划开盘时间',
        type: 'date',
        required: true
      },
      {
        id: 'launch-theme',
        label: '开盘主题',
        type: 'text',
        placeholder: '开盘活动的主题概念',
        required: true
      },
      {
        id: 'launch-objectives',
        label: '开盘目标',
        type: 'textarea',
        placeholder: '具体的销售目标和品牌目标',
        required: true
      },
      {
        id: 'target-units',
        label: '开盘房源数量',
        type: 'number',
        placeholder: '计划开盘的房源套数',
        required: true
      },
      {
        id: 'launch-price-strategy',
        label: '开盘价格策略',
        type: 'select',
        options: [
          { value: 'aggressive', label: '激进定价（高价开盘）' },
          { value: 'moderate', label: '稳健定价（市场价开盘）' },
          { value: 'conservative', label: '保守定价（低价开盘）' },
          { value: 'tiered', label: '分层定价' }
        ],
        required: true
      },
      {
        id: 'special-offers',
        label: '开盘优惠政策',
        type: 'multiselect',
        options: [
          { value: 'early-bird', label: '早鸟优惠' },
          { value: 'payment-plan', label: '付款方式优惠' },
          { value: 'upgrade', label: '免费升级' },
          { value: 'cashback', label: '现金返还' },
          { value: 'gifts', label: '开盘礼品' },
          { value: 'lottery', label: '抽奖活动' }
        ]
      }
    ]
  },
  {
    id: 'event-execution',
    title: '活动执行方案',
    description: '开盘活动的具体执行计划',
    icon: <Calendar className="w-4 h-4" />,
    fields: [
      {
        id: 'event-timeline',
        label: '活动时间安排',
        type: 'textarea',
        placeholder: '详细的活动时间流程',
        required: true
      },
      {
        id: 'venue-setup',
        label: '现场布置方案',
        type: 'textarea',
        placeholder: '销售中心、样板间等现场布置',
        required: true
      },
      {
        id: 'guest-invitation',
        label: '邀请客户策略',
        type: 'multiselect',
        options: [
          { value: 'vip-preview', label: 'VIP预览' },
          { value: 'media-event', label: '媒体发布' },
          { value: 'public-launch', label: '公开开盘' },
          { value: 'broker-event', label: '中介专场' },
          { value: 'corporate-event', label: '企业团购' }
        ],
        required: true
      },
      {
        id: 'staff-allocation',
        label: '人员配置',
        type: 'textarea',
        placeholder: '销售人员、接待人员等配置',
        required: true
      },
      {
        id: 'materials-preparation',
        label: '物料准备',
        type: 'multiselect',
        options: [
          { value: 'brochures', label: '宣传册' },
          { value: 'price-list', label: '价目表' },
          { value: 'contracts', label: '合同文件' },
          { value: 'gifts', label: '礼品' },
          { value: 'signage', label: '标识牌' },
          { value: 'multimedia', label: '多媒体资料' }
        ]
      },
      {
        id: 'backup-plans',
        label: '应急预案',
        type: 'textarea',
        placeholder: '针对可能出现的问题制定应急预案'
      }
    ]
  },
  {
    id: 'marketing-campaign',
    title: '营销推广执行',
    description: '开盘期间的营销推广活动',
    icon: <Target className="w-4 h-4" />,
    fields: [
      {
        id: 'pre-launch-marketing',
        label: '开盘前营销活动',
        type: 'textarea',
        placeholder: '开盘前1-2个月的营销预热活动',
        required: true
      },
      {
        id: 'launch-day-promotion',
        label: '开盘当天推广',
        type: 'textarea',
        placeholder: '开盘当天的营销推广安排',
        required: true
      },
      {
        id: 'media-coverage',
        label: '媒体宣传计划',
        type: 'multiselect',
        options: [
          { value: 'traditional-media', label: '传统媒体' },
          { value: 'digital-media', label: '数字媒体' },
          { value: 'social-media', label: '社交媒体' },
          { value: 'kol-marketing', label: 'KOL营销' },
          { value: 'pr-event', label: 'PR活动' }
        ]
      },
      {
        id: 'advertising-channels',
        label: '广告投放渠道',
        type: 'multiselect',
        options: [
          { value: 'outdoor', label: '户外广告' },
          { value: 'online', label: '网络广告' },
          { value: 'print', label: '平面广告' },
          { value: 'radio', label: '广播广告' },
          { value: 'tv', label: '电视广告' }
        ]
      },
      {
        id: 'digital-strategy',
        label: '数字营销策略',
        type: 'textarea',
        placeholder: '线上营销的具体策略和执行'
      },
      {
        id: 'budget-allocation',
        label: '营销预算分配（万元）',
        type: 'number',
        placeholder: '开盘营销总预算'
      }
    ]
  },
  {
    id: 'sales-management',
    title: '销售管理',
    description: '开盘期间的销售流程和管理',
    icon: <Users className="w-4 h-4" />,
    fields: [
      {
        id: 'sales-process',
        label: '销售流程设计',
        type: 'textarea',
        placeholder: '从客户到访到成交的完整流程',
        required: true
      },
      {
        id: 'pricing-disclosure',
        label: '价格公示策略',
        type: 'select',
        options: [
          { value: 'full-disclosure', label: '全面公示' },
          { value: 'partial-disclosure', label: '部分公示' },
          { value: 'on-demand', label: '按需公示' }
        ],
        required: true
      },
      {
        id: 'sales-incentives',
        label: '销售激励政策',
        type: 'textarea',
        placeholder: '销售团队的激励机制'
      },
      {
        id: 'customer-service',
        label: '客户服务标准',
        type: 'textarea',
        placeholder: '客户接待和服务的标准流程',
        required: true
      },
      {
        id: 'contract-management',
        label: '合同签署流程',
        type: 'textarea',
        placeholder: '合同签署的具体流程和要求',
        required: true
      },
      {
        id: 'payment-processing',
        label: '付款处理流程',
        type: 'textarea',
        placeholder: '各种付款方式的处理流程'
      }
    ]
  },
  {
    id: 'performance-monitoring',
    title: '开盘数据监控',
    description: '开盘期间的关键数据监控和分析',
    icon: <BarChart3 className="w-4 h-4" />,
    fields: [
      {
        id: 'key-metrics',
        label: '关键监控指标',
        type: 'multiselect',
        options: [
          { value: 'visitor-count', label: '到访量' },
          { value: 'conversion-rate', label: '转化率' },
          { value: 'sales-volume', label: '销售套数' },
          { value: 'sales-amount', label: '销售金额' },
          { value: 'average-price', label: '成交均价' },
          { value: 'inventory-status', label: '库存状态' }
        ],
        required: true
      },
      {
        id: 'data-collection',
        label: '数据收集方法',
        type: 'textarea',
        placeholder: '如何收集和记录各项数据',
        required: true
      },
      {
        id: 'reporting-frequency',
        label: '数据报告频率',
        type: 'select',
        options: [
          { value: 'hourly', label: '每小时' },
          { value: 'daily', label: '每日' },
          { value: 'weekly', label: '每周' },
          { value: 'real-time', label: '实时' }
        ],
        required: true
      },
      {
        id: 'analysis-framework',
        label: '数据分析框架',
        type: 'textarea',
        placeholder: '如何分析和解读收集的数据'
      },
      {
        id: 'decision-triggers',
        label: '决策触发点',
        type: 'textarea',
        placeholder: '什么情况下需要调整策略或价格'
      }
    ]
  },
  {
    id: 'optimization-strategy',
    title: '策略优化调整',
    description: '基于开盘数据的策略调整方案',
    icon: <Activity className="w-4 h-4" />,
    fields: [
      {
        id: 'adjustment-scenarios',
        label: '调整场景设定',
        type: 'textarea',
        placeholder: '预设的各种市场反应场景',
        required: true
      },
      {
        id: 'pricing-adjustments',
        label: '价格调整机制',
        type: 'textarea',
        placeholder: '价格调整的条件和幅度',
        required: true
      },
      {
        id: 'marketing-optimization',
        label: '营销策略优化',
        type: 'textarea',
        placeholder: '根据市场反馈优化营销策略'
      },
      {
        id: 'inventory-management',
        label: '库存管理策略',
        type: 'textarea',
        placeholder: '不同销售情况下的库存管理'
      },
      {
        id: 'customer-feedback',
        label: '客户反馈处理',
        type: 'textarea',
        placeholder: '收集和处理客户反馈的机制'
      },
      {
        id: 'competitor-response',
        label: '竞对应对策略',
        type: 'textarea',
        placeholder: '应对竞争对手反应的策略'
      }
    ]
  }
];

interface Phase3ReportFormProps {
  projectId: string;
  onSave: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
  initialData?: ReportFormData;
}

export function Phase3ReportForm({
  projectId,
  onSave,
  onGenerateReport,
  initialData = {}
}: Phase3ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await onGenerateReport(formData);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ReportFormBase
      title="开盘节点报告"
      description="开盘营销活动策划执行，开盘后数据监控分析和策略优化"
      phaseIcon="🔥"
      sections={formSections}
      formData={formData}
      onFormChange={setFormData}
      onSave={handleSave}
      onGenerateReport={handleGenerateReport}
      isGenerating={isGenerating}
      isSaving={isSaving}
    />
  );
}