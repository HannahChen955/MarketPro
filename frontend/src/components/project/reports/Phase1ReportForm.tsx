'use client';

import React, { useState } from 'react';
import { ReportFormBase, FormSection, ReportFormData } from '../ReportFormBase';
import {
  Search,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Building2,
  Shield
} from 'lucide-react';

const formSections: FormSection[] = [
  {
    id: 'project-basic',
    title: '项目基本信息',
    description: '项目的基础信息和基本参数',
    icon: <Building2 className="w-4 h-4" />,
    fields: [
      {
        id: 'project-name',
        label: '项目名称',
        type: 'text',
        placeholder: '输入项目名称',
        required: true
      },
      {
        id: 'project-location',
        label: '项目地址',
        type: 'text',
        placeholder: '详细地址信息',
        required: true
      },
      {
        id: 'land-area',
        label: '用地面积（平方米）',
        type: 'number',
        placeholder: '输入用地面积',
        required: true
      },
      {
        id: 'plot-ratio',
        label: '容积率',
        type: 'number',
        placeholder: '容积率数值',
        required: true
      },
      {
        id: 'green-rate',
        label: '绿化率（%）',
        type: 'number',
        placeholder: '绿化率百分比'
      },
      {
        id: 'building-height',
        label: '建筑限高（米）',
        type: 'number',
        placeholder: '最大建筑高度'
      }
    ]
  },
  {
    id: 'market-research',
    title: '区域市场调研',
    description: '深入分析项目所在区域的市场状况',
    icon: <Search className="w-4 h-4" />,
    fields: [
      {
        id: 'regional-development',
        label: '区域发展现状',
        type: 'textarea',
        placeholder: '描述区域发展情况、基础设施、配套设施等',
        required: true
      },
      {
        id: 'transportation',
        label: '交通便利性',
        type: 'multiselect',
        options: [
          { value: 'subway', label: '地铁便利' },
          { value: 'bus', label: '公交便利' },
          { value: 'highway', label: '高速便利' },
          { value: 'airport', label: '机场便利' },
          { value: 'train', label: '高铁便利' }
        ],
        required: true
      },
      {
        id: 'nearby-facilities',
        label: '周边配套设施',
        type: 'multiselect',
        options: [
          { value: 'school', label: '学校' },
          { value: 'hospital', label: '医院' },
          { value: 'shopping', label: '购物中心' },
          { value: 'park', label: '公园' },
          { value: 'bank', label: '银行' },
          { value: 'restaurant', label: '餐饮' }
        ]
      },
      {
        id: 'regional-planning',
        label: '区域规划信息',
        type: 'textarea',
        placeholder: '未来区域规划、政策导向等信息'
      }
    ]
  },
  {
    id: 'market-analysis',
    title: '市场价格分析',
    description: '分析区域房地产市场价格水平',
    icon: <TrendingUp className="w-4 h-4" />,
    fields: [
      {
        id: 'avg-price-range',
        label: '区域均价范围（元/平方米）',
        type: 'text',
        placeholder: '例：50000-80000',
        required: true
      },
      {
        id: 'price-trend',
        label: '近期价格走势',
        type: 'select',
        options: [
          { value: 'rising', label: '上涨' },
          { value: 'stable', label: '稳定' },
          { value: 'declining', label: '下降' }
        ],
        required: true
      },
      {
        id: 'price-factors',
        label: '价格影响因素',
        type: 'multiselect',
        options: [
          { value: 'location', label: '地段优势' },
          { value: 'transportation', label: '交通便利' },
          { value: 'education', label: '教育资源' },
          { value: 'commercial', label: '商业配套' },
          { value: 'environment', label: '环境品质' },
          { value: 'policy', label: '政策影响' }
        ]
      },
      {
        id: 'comparable-projects',
        label: '可比项目信息',
        type: 'textarea',
        placeholder: '列出3-5个可比较项目及其价格信息'
      }
    ]
  },
  {
    id: 'target-analysis',
    title: '目标客群分析',
    description: '识别和分析潜在购房客群特征',
    icon: <Users className="w-4 h-4" />,
    fields: [
      {
        id: 'primary-customers',
        label: '主要客群类型',
        type: 'multiselect',
        options: [
          { value: 'first-time', label: '首次置业' },
          { value: 'upgrade', label: '改善置业' },
          { value: 'investment', label: '投资客户' },
          { value: 'elderly', label: '养老置业' }
        ],
        required: true
      },
      {
        id: 'age-range',
        label: '主要年龄段',
        type: 'select',
        options: [
          { value: '25-30', label: '25-30岁' },
          { value: '30-40', label: '30-40岁' },
          { value: '40-50', label: '40-50岁' },
          { value: '50+', label: '50岁以上' }
        ],
        required: true
      },
      {
        id: 'income-level',
        label: '收入水平（万元/年）',
        type: 'text',
        placeholder: '例：50-100',
        required: true
      },
      {
        id: 'occupation',
        label: '主要职业',
        type: 'multiselect',
        options: [
          { value: 'tech', label: '科技行业' },
          { value: 'finance', label: '金融行业' },
          { value: 'government', label: '公务员' },
          { value: 'teacher', label: '教师' },
          { value: 'doctor', label: '医生' },
          { value: 'business', label: '企业管理' },
          { value: 'other', label: '其他' }
        ]
      },
      {
        id: 'purchasing-motivation',
        label: '购买动机',
        type: 'textarea',
        placeholder: '分析目标客群的购买动机和需求'
      }
    ]
  },
  {
    id: 'investment-analysis',
    title: '投资价值评估',
    description: '评估项目的投资价值和风险',
    icon: <DollarSign className="w-4 h-4" />,
    fields: [
      {
        id: 'land-cost',
        label: '拿地成本（万元）',
        type: 'number',
        placeholder: '预估拿地总成本',
        required: true
      },
      {
        id: 'development-cost',
        label: '开发成本（万元）',
        type: 'number',
        placeholder: '预估开发建设成本',
        required: true
      },
      {
        id: 'expected-price',
        label: '预期销售均价（元/平方米）',
        type: 'number',
        placeholder: '项目预期销售价格',
        required: true
      },
      {
        id: 'profit-margin',
        label: '预期利润率（%）',
        type: 'number',
        placeholder: '预期利润率百分比'
      },
      {
        id: 'roi',
        label: '预期投资回报率（%）',
        type: 'number',
        placeholder: 'ROI百分比'
      },
      {
        id: 'development-cycle',
        label: '开发周期（月）',
        type: 'number',
        placeholder: '预计开发周期'
      }
    ]
  },
  {
    id: 'risk-assessment',
    title: '风险评估',
    description: '识别和评估项目潜在风险',
    icon: <Shield className="w-4 h-4" />,
    fields: [
      {
        id: 'market-risks',
        label: '市场风险',
        type: 'multiselect',
        options: [
          { value: 'price-decline', label: '房价下跌风险' },
          { value: 'demand-decrease', label: '需求下降风险' },
          { value: 'competition', label: '竞争加剧风险' },
          { value: 'supply-excess', label: '供应过剩风险' }
        ]
      },
      {
        id: 'policy-risks',
        label: '政策风险',
        type: 'multiselect',
        options: [
          { value: 'purchase-limit', label: '限购政策' },
          { value: 'loan-limit', label: '限贷政策' },
          { value: 'tax-policy', label: '税收政策' },
          { value: 'land-policy', label: '土地政策' }
        ]
      },
      {
        id: 'operational-risks',
        label: '运营风险',
        type: 'multiselect',
        options: [
          { value: 'cost-overrun', label: '成本超支' },
          { value: 'schedule-delay', label: '进度延误' },
          { value: 'quality-issues', label: '质量问题' },
          { value: 'approval-delay', label: '审批延误' }
        ]
      },
      {
        id: 'risk-mitigation',
        label: '风险缓解措施',
        type: 'textarea',
        placeholder: '针对识别的风险，提出相应的缓解和应对措施'
      }
    ]
  }
];

interface Phase1ReportFormProps {
  projectId: string;
  onSave: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
  initialData?: ReportFormData;
}

export function Phase1ReportForm({
  projectId,
  onSave,
  onGenerateReport,
  initialData = {}
}: Phase1ReportFormProps) {
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
      title="拿地可研阶段报告"
      description="深度市场调研，为拿地决策提供全面的数据支持和风险评估"
      phaseIcon="🔍"
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