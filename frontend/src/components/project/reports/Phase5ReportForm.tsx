'use client';

import React, { useState } from 'react';
import { ReportFormBase, FormSection, ReportFormData } from '../ReportFormBase';
import {
  Users,
  Building,
  Megaphone,
  Database,
  Camera,
  Award,
  FileText,
  CheckCircle
} from 'lucide-react';

const formSections: FormSection[] = [
  {
    id: 'partner-management',
    title: '合作伙伴管理',
    description: '外部合作伙伴的选择和管理',
    icon: <Users className="w-4 h-4" />,
    fields: [
      {
        id: 'partner-types',
        label: '合作伙伴类型',
        type: 'multiselect',
        options: [
          { value: 'design-agency', label: '设计公司' },
          { value: 'advertising-agency', label: '广告代理' },
          { value: 'pr-agency', label: 'PR公司' },
          { value: 'data-service', label: '数据服务商' },
          { value: 'media-agency', label: '媒体代理' },
          { value: 'event-company', label: '活动公司' },
          { value: 'digital-marketing', label: '数字营销公司' },
          { value: 'research-company', label: '市调公司' }
        ],
        required: true
      },
      {
        id: 'selection-criteria',
        label: '合作伙伴选择标准',
        type: 'textarea',
        placeholder: '选择合作伙伴的具体标准和要求',
        required: true
      },
      {
        id: 'evaluation-process',
        label: '评估流程',
        type: 'textarea',
        placeholder: '如何评估和筛选合作伙伴',
        required: true
      },
      {
        id: 'contract-management',
        label: '合同管理',
        type: 'textarea',
        placeholder: '合同签署、条款管理等',
        required: true
      },
      {
        id: 'performance-monitoring',
        label: '表现监控机制',
        type: 'textarea',
        placeholder: '如何监控合作伙伴的工作表现'
      },
      {
        id: 'relationship-management',
        label: '关系维护策略',
        type: 'textarea',
        placeholder: '如何维护长期合作关系'
      }
    ]
  },
  {
    id: 'design-collaboration',
    title: '设计协作管理',
    description: '与设计公司的协作和管理',
    icon: <Building className="w-4 h-4" />,
    fields: [
      {
        id: 'design-scope',
        label: '设计合作范围',
        type: 'multiselect',
        options: [
          { value: 'architecture', label: '建筑设计' },
          { value: 'landscape', label: '景观设计' },
          { value: 'interior', label: '室内设计' },
          { value: 'visual-identity', label: '视觉识别' },
          { value: 'marketing-materials', label: '营销物料' },
          { value: 'digital-design', label: '数字设计' }
        ],
        required: true
      },
      {
        id: 'design-brief',
        label: '设计简报',
        type: 'textarea',
        placeholder: '向设计团队提供的设计要求和简报',
        required: true
      },
      {
        id: 'design-timeline',
        label: '设计时间计划',
        type: 'textarea',
        placeholder: '设计各阶段的时间安排',
        required: true
      },
      {
        id: 'quality-standards',
        label: '质量标准',
        type: 'textarea',
        placeholder: '设计质量的评估标准',
        required: true
      },
      {
        id: 'review-process',
        label: '审核流程',
        type: 'textarea',
        placeholder: '设计方案的审核和修改流程'
      },
      {
        id: 'intellectual-property',
        label: '知识产权管理',
        type: 'textarea',
        placeholder: '设计成果的知识产权归属和保护'
      }
    ]
  },
  {
    id: 'marketing-coordination',
    title: '营销协调管理',
    description: '与广告代理和营销服务商的协调',
    icon: <Megaphone className="w-4 h-4" />,
    fields: [
      {
        id: 'marketing-services',
        label: '营销服务范围',
        type: 'multiselect',
        options: [
          { value: 'strategy-planning', label: '策略规划' },
          { value: 'creative-development', label: '创意开发' },
          { value: 'media-planning', label: '媒体策划' },
          { value: 'digital-marketing', label: '数字营销' },
          { value: 'event-marketing', label: '活动营销' },
          { value: 'public-relations', label: '公关服务' }
        ],
        required: true
      },
      {
        id: 'campaign-coordination',
        label: '营销活动协调',
        type: 'textarea',
        placeholder: '各营销活动的协调和统筹',
        required: true
      },
      {
        id: 'creative-approval',
        label: '创意审批流程',
        type: 'textarea',
        placeholder: '营销创意的审批和修改流程',
        required: true
      },
      {
        id: 'media-coordination',
        label: '媒体投放协调',
        type: 'textarea',
        placeholder: '各媒体渠道的协调和管理'
      },
      {
        id: 'budget-management',
        label: '预算管理',
        type: 'textarea',
        placeholder: '营销预算的分配和控制'
      },
      {
        id: 'effectiveness-tracking',
        label: '效果跟踪',
        type: 'textarea',
        placeholder: '营销效果的跟踪和评估机制'
      }
    ]
  },
  {
    id: 'data-services',
    title: '数据服务对接',
    description: '与数据服务商的合作管理',
    icon: <Database className="w-4 h-4" />,
    fields: [
      {
        id: 'data-requirements',
        label: '数据需求',
        type: 'multiselect',
        options: [
          { value: 'market-research', label: '市场调研' },
          { value: 'competitor-analysis', label: '竞品分析' },
          { value: 'customer-insights', label: '客户洞察' },
          { value: 'sales-tracking', label: '销售跟踪' },
          { value: 'price-monitoring', label: '价格监控' },
          { value: 'digital-analytics', label: '数字分析' }
        ],
        required: true
      },
      {
        id: 'data-quality-standards',
        label: '数据质量标准',
        type: 'textarea',
        placeholder: '对数据准确性、时效性的要求',
        required: true
      },
      {
        id: 'reporting-requirements',
        label: '报告要求',
        type: 'textarea',
        placeholder: '数据报告的格式和频率要求',
        required: true
      },
      {
        id: 'data-integration',
        label: '数据整合',
        type: 'textarea',
        placeholder: '如何整合不同来源的数据'
      },
      {
        id: 'data-security',
        label: '数据安全',
        type: 'textarea',
        placeholder: '数据安全和隐私保护措施'
      },
      {
        id: 'analytics-tools',
        label: '分析工具',
        type: 'textarea',
        placeholder: '使用的数据分析工具和平台'
      }
    ]
  },
  {
    id: 'media-coordination',
    title: '媒体投放协调',
    description: '媒体投放的协调和管理',
    icon: <Camera className="w-4 h-4" />,
    fields: [
      {
        id: 'media-channels',
        label: '媒体渠道管理',
        type: 'multiselect',
        options: [
          { value: 'traditional-media', label: '传统媒体' },
          { value: 'digital-media', label: '数字媒体' },
          { value: 'social-media', label: '社交媒体' },
          { value: 'outdoor-advertising', label: '户外广告' },
          { value: 'print-media', label: '平面媒体' },
          { value: 'broadcast-media', label: '广播电视' }
        ],
        required: true
      },
      {
        id: 'media-planning',
        label: '媒体规划',
        type: 'textarea',
        placeholder: '媒体投放的整体规划和策略',
        required: true
      },
      {
        id: 'content-coordination',
        label: '内容协调',
        type: 'textarea',
        placeholder: '各媒体渠道内容的协调统一',
        required: true
      },
      {
        id: 'timing-coordination',
        label: '时间协调',
        type: 'textarea',
        placeholder: '各媒体投放时间的协调'
      },
      {
        id: 'performance-monitoring',
        label: '投放效果监控',
        type: 'textarea',
        placeholder: '媒体投放效果的监控和评估'
      },
      {
        id: 'crisis-management',
        label: '危机管理',
        type: 'textarea',
        placeholder: '媒体危机的应对和管理'
      }
    ]
  },
  {
    id: 'performance-evaluation',
    title: '第三方效果评估',
    description: '独立第三方的效果评估和审核',
    icon: <Award className="w-4 h-4" />,
    fields: [
      {
        id: 'evaluation-scope',
        label: '评估范围',
        type: 'multiselect',
        options: [
          { value: 'marketing-effectiveness', label: '营销效果' },
          { value: 'brand-performance', label: '品牌表现' },
          { value: 'sales-performance', label: '销售业绩' },
          { value: 'customer-satisfaction', label: '客户满意度' },
          { value: 'market-position', label: '市场地位' },
          { value: 'roi-analysis', label: 'ROI分析' }
        ],
        required: true
      },
      {
        id: 'evaluation-methodology',
        label: '评估方法',
        type: 'textarea',
        placeholder: '第三方评估使用的方法和标准',
        required: true
      },
      {
        id: 'evaluation-timeline',
        label: '评估时间安排',
        type: 'textarea',
        placeholder: '评估的时间周期和节点安排',
        required: true
      },
      {
        id: 'independence-measures',
        label: '独立性保障',
        type: 'textarea',
        placeholder: '确保评估独立性的措施'
      },
      {
        id: 'reporting-format',
        label: '报告格式',
        type: 'textarea',
        placeholder: '第三方评估报告的格式要求'
      },
      {
        id: 'action-recommendations',
        label: '改进建议',
        type: 'textarea',
        placeholder: '基于评估结果的改进建议'
      }
    ]
  },
  {
    id: 'collaboration-optimization',
    title: '协作优化',
    description: '提升合作效率和质量的措施',
    icon: <CheckCircle className="w-4 h-4" />,
    fields: [
      {
        id: 'communication-protocols',
        label: '沟通协议',
        type: 'textarea',
        placeholder: '与合作伙伴的沟通机制和协议',
        required: true
      },
      {
        id: 'project-management',
        label: '项目管理',
        type: 'textarea',
        placeholder: '跨机构项目的管理方法',
        required: true
      },
      {
        id: 'knowledge-sharing',
        label: '知识共享',
        type: 'textarea',
        placeholder: '合作伙伴间的知识共享机制'
      },
      {
        id: 'quality-assurance',
        label: '质量保证',
        type: 'textarea',
        placeholder: '确保合作质量的措施和标准'
      },
      {
        id: 'conflict-resolution',
        label: '冲突解决',
        type: 'textarea',
        placeholder: '处理合作冲突的机制'
      },
      {
        id: 'continuous-improvement',
        label: '持续改进',
        type: 'textarea',
        placeholder: '合作关系的持续改进措施'
      },
      {
        id: 'success-metrics',
        label: '成功指标',
        type: 'textarea',
        placeholder: '衡量合作成功的关键指标'
      }
    ]
  }
];

interface Phase5ReportFormProps {
  projectId: string;
  onSave: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
  initialData?: ReportFormData;
}

export function Phase5ReportForm({
  projectId,
  onSave,
  onGenerateReport,
  initialData = {}
}: Phase5ReportFormProps) {
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
      title="合作伙伴协同报告"
      description="与设计公司、广告代理、数据服务商等合作伙伴的协同合作"
      phaseIcon="🤝"
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