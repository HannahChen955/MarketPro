'use client';

import React, { useState } from 'react';
import { ReportFormBase, FormSection, ReportFormData } from '../ReportFormBase';
import {
  Target,
  Palette,
  TrendingUp,
  Users,
  Star,
  MessageSquare,
  PieChart,
  Zap
} from 'lucide-react';

const formSections: FormSection[] = [
  {
    id: 'product-positioning',
    title: '产品定位策略',
    description: '确定项目的市场定位和产品特色',
    icon: <Target className="w-4 h-4" />,
    fields: [
      {
        id: 'product-category',
        label: '产品类型定位',
        type: 'select',
        options: [
          { value: 'luxury', label: '豪宅' },
          { value: 'high-end', label: '高端住宅' },
          { value: 'mid-high', label: '中高端住宅' },
          { value: 'mass-market', label: '刚需住宅' },
          { value: 'affordable', label: '经济型住宅' }
        ],
        required: true
      },
      {
        id: 'target-market',
        label: '目标市场定位',
        type: 'multiselect',
        options: [
          { value: 'first-home', label: '首置客群' },
          { value: 'upgrade', label: '改善客群' },
          { value: 'investment', label: '投资客群' },
          { value: 'high-net-worth', label: '高净值客群' }
        ],
        required: true
      },
      {
        id: 'positioning-statement',
        label: '产品定位描述',
        type: 'textarea',
        placeholder: '用一段话描述项目的核心定位',
        required: true
      },
      {
        id: 'unique-selling-points',
        label: '核心卖点',
        type: 'multiselect',
        options: [
          { value: 'location', label: '地段优势' },
          { value: 'transportation', label: '交通便利' },
          { value: 'education', label: '教育资源' },
          { value: 'landscape', label: '景观资源' },
          { value: 'design', label: '建筑设计' },
          { value: 'smart-home', label: '智能化' },
          { value: 'luxury', label: '豪华配置' },
          { value: 'community', label: '社区配套' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'product-design',
    title: '产品设计方案',
    description: '制定具体的产品设计和户型配置',
    icon: <Palette className="w-4 h-4" />,
    fields: [
      {
        id: 'unit-types',
        label: '户型配置',
        type: 'textarea',
        placeholder: '详细描述户型面积、房型配置等',
        required: true
      },
      {
        id: 'area-distribution',
        label: '面积段分布',
        type: 'textarea',
        placeholder: '各面积段的比例分配',
        required: true
      },
      {
        id: 'architectural-style',
        label: '建筑风格',
        type: 'select',
        options: [
          { value: 'modern', label: '现代简约' },
          { value: 'new-chinese', label: '新中式' },
          { value: 'european', label: '欧式' },
          { value: 'art-deco', label: 'Art Deco' },
          { value: 'industrial', label: '工业风' },
          { value: 'neo-classical', label: '新古典' }
        ],
        required: true
      },
      {
        id: 'design-highlights',
        label: '设计亮点',
        type: 'multiselect',
        options: [
          { value: 'high-ceiling', label: '挑高设计' },
          { value: 'large-windows', label: '大面积采光' },
          { value: 'balcony', label: '景观阳台' },
          { value: 'storage', label: '收纳设计' },
          { value: 'flexible-space', label: '灵活空间' },
          { value: 'master-suite', label: '套房设计' }
        ]
      },
      {
        id: 'finishing-standard',
        label: '装修标准',
        type: 'select',
        options: [
          { value: 'luxury', label: '精装豪华' },
          { value: 'high-end', label: '高端精装' },
          { value: 'standard', label: '标准精装' },
          { value: 'basic', label: '简装' },
          { value: 'shell', label: '毛坯' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'competitor-analysis',
    title: '竞品分析',
    description: '分析主要竞争对手的产品策略',
    icon: <PieChart className="w-4 h-4" />,
    fields: [
      {
        id: 'main-competitors',
        label: '主要竞品项目',
        type: 'textarea',
        placeholder: '列出3-5个主要竞争项目',
        required: true
      },
      {
        id: 'competitor-positioning',
        label: '竞品定位分析',
        type: 'textarea',
        placeholder: '分析主要竞品的市场定位',
        required: true
      },
      {
        id: 'competitor-pricing',
        label: '竞品价格分析',
        type: 'textarea',
        placeholder: '对比分析竞品价格策略',
        required: true
      },
      {
        id: 'competitive-advantages',
        label: '我方竞争优势',
        type: 'multiselect',
        options: [
          { value: 'location', label: '地段更优' },
          { value: 'price', label: '价格优势' },
          { value: 'design', label: '设计领先' },
          { value: 'brand', label: '品牌优势' },
          { value: 'service', label: '服务优势' },
          { value: 'timing', label: '入市时机' }
        ]
      },
      {
        id: 'differentiation-strategy',
        label: '差异化策略',
        type: 'textarea',
        placeholder: '如何与竞品形成差异化',
        required: true
      }
    ]
  },
  {
    id: 'pricing-strategy',
    title: '价格策略制定',
    description: '制定合理的定价策略和销售策略',
    icon: <TrendingUp className="w-4 h-4" />,
    fields: [
      {
        id: 'target-price-range',
        label: '目标价格区间（元/平方米）',
        type: 'text',
        placeholder: '例：65000-85000',
        required: true
      },
      {
        id: 'pricing-factors',
        label: '定价影响因素',
        type: 'multiselect',
        options: [
          { value: 'cost', label: '成本因素' },
          { value: 'competitor', label: '竞品价格' },
          { value: 'market', label: '市场接受度' },
          { value: 'location', label: '地段价值' },
          { value: 'timing', label: '市场时机' },
          { value: 'product', label: '产品价值' }
        ],
        required: true
      },
      {
        id: 'pricing-strategy-type',
        label: '定价策略类型',
        type: 'select',
        options: [
          { value: 'premium', label: '高价策略' },
          { value: 'competitive', label: '竞争性定价' },
          { value: 'penetration', label: '渗透性定价' },
          { value: 'skimming', label: '撇脂定价' }
        ],
        required: true
      },
      {
        id: 'payment-plans',
        label: '付款方式设计',
        type: 'multiselect',
        options: [
          { value: 'full-payment', label: '一次性付款' },
          { value: 'installment', label: '分期付款' },
          { value: 'mortgage', label: '按揭贷款' },
          { value: 'corporate', label: '企业团购' }
        ]
      },
      {
        id: 'pricing-adjustments',
        label: '价格调整机制',
        type: 'textarea',
        placeholder: '描述价格调整的条件和机制'
      }
    ]
  },
  {
    id: 'marketing-strategy',
    title: '营销策略规划',
    description: '制定全面的营销推广策略',
    icon: <MessageSquare className="w-4 h-4" />,
    fields: [
      {
        id: 'marketing-objectives',
        label: '营销目标',
        type: 'textarea',
        placeholder: '明确的营销目标和预期效果',
        required: true
      },
      {
        id: 'target-audience',
        label: '目标客户画像',
        type: 'textarea',
        placeholder: '详细描述目标客户的特征',
        required: true
      },
      {
        id: 'marketing-channels',
        label: '营销渠道',
        type: 'multiselect',
        options: [
          { value: 'digital', label: '数字营销' },
          { value: 'traditional', label: '传统媒体' },
          { value: 'events', label: '活动营销' },
          { value: 'referral', label: '口碑推荐' },
          { value: 'partnership', label: '合作营销' },
          { value: 'direct', label: '直销' }
        ],
        required: true
      },
      {
        id: 'key-messages',
        label: '核心营销信息',
        type: 'textarea',
        placeholder: '主要的营销卖点和传播信息',
        required: true
      },
      {
        id: 'campaign-timeline',
        label: '营销时间规划',
        type: 'textarea',
        placeholder: '各阶段营销活动的时间安排'
      },
      {
        id: 'marketing-budget',
        label: '营销预算（万元）',
        type: 'number',
        placeholder: '预估营销总预算'
      }
    ]
  },
  {
    id: 'success-metrics',
    title: '成功指标设定',
    description: '设定可衡量的成功指标和KPI',
    icon: <Star className="w-4 h-4" />,
    fields: [
      {
        id: 'sales-targets',
        label: '销售目标',
        type: 'textarea',
        placeholder: '具体的销售目标（数量、金额、时间）',
        required: true
      },
      {
        id: 'market-share-target',
        label: '市场份额目标（%）',
        type: 'number',
        placeholder: '预期在区域市场中的份额'
      },
      {
        id: 'customer-satisfaction',
        label: '客户满意度目标（%）',
        type: 'number',
        placeholder: '目标客户满意度得分'
      },
      {
        id: 'brand-awareness',
        label: '品牌知名度目标（%）',
        type: 'number',
        placeholder: '目标品牌知名度提升'
      },
      {
        id: 'roi-target',
        label: '营销ROI目标（%）',
        type: 'number',
        placeholder: '营销投资回报率目标'
      },
      {
        id: 'timeline-milestones',
        label: '关键时间节点',
        type: 'textarea',
        placeholder: '重要的时间节点和里程碑'
      }
    ]
  }
];

interface Phase2ReportFormProps {
  projectId: string;
  onSave: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
  initialData?: ReportFormData;
}

export function Phase2ReportForm({
  projectId,
  onSave,
  onGenerateReport,
  initialData = {}
}: Phase2ReportFormProps) {
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
      title="产品定位阶段报告"
      description="基于市场调研结果，制定产品定位和营销策略，完成营销方案设计"
      phaseIcon="🏗️"
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