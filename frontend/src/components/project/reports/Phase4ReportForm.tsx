'use client';

import React, { useState } from 'react';
import { ReportFormBase, FormSection, ReportFormData } from '../ReportFormBase';
import {
  TrendingUp,
  BarChart3,
  Users,
  Target,
  RefreshCw,
  AlertTriangle,
  Award,
  Settings
} from 'lucide-react';

const formSections: FormSection[] = [
  {
    id: 'sales-monitoring',
    title: '销售数据监控',
    description: '持续跟踪和分析销售表现',
    icon: <BarChart3 className="w-4 h-4" />,
    fields: [
      {
        id: 'monitoring-period',
        label: '监控周期',
        type: 'select',
        options: [
          { value: 'daily', label: '每日' },
          { value: 'weekly', label: '每周' },
          { value: 'monthly', label: '每月' },
          { value: 'quarterly', label: '每季度' }
        ],
        required: true
      },
      {
        id: 'sales-metrics',
        label: '关键销售指标',
        type: 'multiselect',
        options: [
          { value: 'units-sold', label: '销售套数' },
          { value: 'sales-revenue', label: '销售收入' },
          { value: 'average-price', label: '成交均价' },
          { value: 'inventory-turnover', label: '库存周转' },
          { value: 'sales-velocity', label: '销售速度' },
          { value: 'cancellation-rate', label: '退房率' }
        ],
        required: true
      },
      {
        id: 'target-achievement',
        label: '目标达成情况',
        type: 'textarea',
        placeholder: '对比原定目标的完成情况',
        required: true
      },
      {
        id: 'sales-trends',
        label: '销售趋势分析',
        type: 'textarea',
        placeholder: '分析销售数据的变化趋势',
        required: true
      },
      {
        id: 'seasonal-factors',
        label: '季节性影响因素',
        type: 'textarea',
        placeholder: '分析季节性对销售的影响'
      },
      {
        id: 'inventory-analysis',
        label: '库存结构分析',
        type: 'textarea',
        placeholder: '各户型、楼层的库存和销售情况'
      }
    ]
  },
  {
    id: 'market-analysis',
    title: '市场环境分析',
    description: '分析外部市场环境变化',
    icon: <TrendingUp className="w-4 h-4" />,
    fields: [
      {
        id: 'market-conditions',
        label: '整体市场状况',
        type: 'select',
        options: [
          { value: 'bullish', label: '牛市（上涨）' },
          { value: 'bearish', label: '熊市（下跌）' },
          { value: 'stable', label: '稳定' },
          { value: 'volatile', label: '波动' }
        ],
        required: true
      },
      {
        id: 'policy-impacts',
        label: '政策影响分析',
        type: 'textarea',
        placeholder: '新政策对项目销售的影响',
        required: true
      },
      {
        id: 'competitor-activities',
        label: '竞品动态跟踪',
        type: 'textarea',
        placeholder: '主要竞品的价格、营销、销售动态',
        required: true
      },
      {
        id: 'market-share',
        label: '市场份额变化',
        type: 'textarea',
        placeholder: '项目在区域市场中的份额变化'
      },
      {
        id: 'price-trends',
        label: '区域价格走势',
        type: 'select',
        options: [
          { value: 'rising', label: '上涨' },
          { value: 'stable', label: '稳定' },
          { value: 'declining', label: '下降' },
          { value: 'fluctuating', label: '波动' }
        ],
        required: true
      },
      {
        id: 'supply-demand',
        label: '供需关系分析',
        type: 'textarea',
        placeholder: '区域供需关系的变化情况'
      }
    ]
  },
  {
    id: 'customer-analysis',
    title: '客户行为分析',
    description: '深度分析客户特征和行为模式',
    icon: <Users className="w-4 h-4" />,
    fields: [
      {
        id: 'customer-profile',
        label: '成交客户画像',
        type: 'textarea',
        placeholder: '分析已成交客户的特征',
        required: true
      },
      {
        id: 'purchase-patterns',
        label: '购买行为模式',
        type: 'textarea',
        placeholder: '客户购买决策过程和特点',
        required: true
      },
      {
        id: 'price-sensitivity',
        label: '价格敏感度分析',
        type: 'select',
        options: [
          { value: 'high', label: '高敏感' },
          { value: 'medium', label: '中等敏感' },
          { value: 'low', label: '低敏感' }
        ],
        required: true
      },
      {
        id: 'customer-satisfaction',
        label: '客户满意度调研',
        type: 'textarea',
        placeholder: '客户满意度调研结果分析'
      },
      {
        id: 'referral-analysis',
        label: '转介绍情况',
        type: 'textarea',
        placeholder: '客户转介绍的情况和效果'
      },
      {
        id: 'complaint-analysis',
        label: '客户投诉分析',
        type: 'textarea',
        placeholder: '客户投诉的类型和处理情况'
      }
    ]
  },
  {
    id: 'marketing-effectiveness',
    title: '营销效果分析',
    description: '评估营销活动的效果和ROI',
    icon: <Target className="w-4 h-4" />,
    fields: [
      {
        id: 'campaign-performance',
        label: '营销活动效果',
        type: 'textarea',
        placeholder: '各项营销活动的效果评估',
        required: true
      },
      {
        id: 'channel-effectiveness',
        label: '渠道效果分析',
        type: 'textarea',
        placeholder: '不同营销渠道的转化效果',
        required: true
      },
      {
        id: 'marketing-roi',
        label: '营销ROI（%）',
        type: 'number',
        placeholder: '营销投资回报率',
        required: true
      },
      {
        id: 'cost-per-acquisition',
        label: '客户获取成本（元）',
        type: 'number',
        placeholder: '平均客户获取成本'
      },
      {
        id: 'brand-awareness',
        label: '品牌知名度变化',
        type: 'textarea',
        placeholder: '品牌知名度的提升情况'
      },
      {
        id: 'digital-metrics',
        label: '数字营销指标',
        type: 'textarea',
        placeholder: '网站流量、社媒互动等数字指标'
      }
    ]
  },
  {
    id: 'strategy-optimization',
    title: '策略调整优化',
    description: '基于数据分析的策略优化建议',
    icon: <RefreshCw className="w-4 h-4" />,
    fields: [
      {
        id: 'pricing-adjustments',
        label: '价格策略调整',
        type: 'textarea',
        placeholder: '基于市场反馈的价格调整建议',
        required: true
      },
      {
        id: 'product-optimization',
        label: '产品策略优化',
        type: 'textarea',
        placeholder: '产品组合、户型配比的优化建议'
      },
      {
        id: 'marketing-optimization',
        label: '营销策略优化',
        type: 'textarea',
        placeholder: '营销策略和渠道的调整建议',
        required: true
      },
      {
        id: 'sales-process-improvement',
        label: '销售流程改进',
        type: 'textarea',
        placeholder: '销售流程的优化建议'
      },
      {
        id: 'customer-service-enhancement',
        label: '客户服务提升',
        type: 'textarea',
        placeholder: '客户服务的改进措施'
      },
      {
        id: 'operational-efficiency',
        label: '运营效率提升',
        type: 'textarea',
        placeholder: '运营流程的优化建议'
      }
    ]
  },
  {
    id: 'risk-management',
    title: '风险管理',
    description: '识别和管理运营期间的风险',
    icon: <AlertTriangle className="w-4 h-4" />,
    fields: [
      {
        id: 'current-risks',
        label: '当前风险识别',
        type: 'multiselect',
        options: [
          { value: 'sales-slowdown', label: '销售放缓' },
          { value: 'price-pressure', label: '价格压力' },
          { value: 'inventory-backlog', label: '库存积压' },
          { value: 'competitor-threat', label: '竞争威胁' },
          { value: 'policy-risk', label: '政策风险' },
          { value: 'market-downturn', label: '市场下行' }
        ],
        required: true
      },
      {
        id: 'risk-assessment',
        label: '风险评估',
        type: 'textarea',
        placeholder: '对识别风险的影响程度评估',
        required: true
      },
      {
        id: 'mitigation-strategies',
        label: '风险缓解策略',
        type: 'textarea',
        placeholder: '针对各项风险的应对策略',
        required: true
      },
      {
        id: 'contingency-plans',
        label: '应急预案',
        type: 'textarea',
        placeholder: '极端情况下的应急处理预案'
      },
      {
        id: 'monitoring-mechanisms',
        label: '风险监控机制',
        type: 'textarea',
        placeholder: '持续监控风险变化的机制'
      }
    ]
  },
  {
    id: 'performance-targets',
    title: '下阶段目标设定',
    description: '设定下一阶段的目标和KPI',
    icon: <Award className="w-4 h-4" />,
    fields: [
      {
        id: 'next-period-targets',
        label: '下期销售目标',
        type: 'textarea',
        placeholder: '下一监控周期的具体销售目标',
        required: true
      },
      {
        id: 'market-objectives',
        label: '市场目标',
        type: 'textarea',
        placeholder: '市场份额、品牌目标等',
        required: true
      },
      {
        id: 'operational-goals',
        label: '运营目标',
        type: 'textarea',
        placeholder: '运营效率、客户满意度等目标'
      },
      {
        id: 'timeline-milestones',
        label: '时间节点设定',
        type: 'textarea',
        placeholder: '重要的时间节点和里程碑'
      },
      {
        id: 'success-metrics',
        label: '成功评估指标',
        type: 'textarea',
        placeholder: '衡量目标达成的具体指标'
      },
      {
        id: 'resource-requirements',
        label: '资源需求',
        type: 'textarea',
        placeholder: '实现目标所需的资源配置'
      }
    ]
  }
];

interface Phase4ReportFormProps {
  projectId: string;
  onSave: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
  initialData?: ReportFormData;
}

export function Phase4ReportForm({
  projectId,
  onSave,
  onGenerateReport,
  initialData = {}
}: Phase4ReportFormProps) {
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
      title="持续运营期报告"
      description="持续的营销数据监控分析，销售策略动态调整和效果优化"
      phaseIcon="📊"
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