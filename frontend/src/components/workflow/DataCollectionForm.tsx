'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  Users,
  TrendingUp,
  FileText,
  Upload,
  X
} from 'lucide-react';
import {
  Input,
  Select,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Checkbox,
  RadioButton,
  RadioGroup
} from '@/components/ui';
import { cn } from '@/lib/utils';

// 数据收集表单的Schema定义
const dataCollectionSchema = z.object({
  // 项目基本信息
  projectName: z.string().min(1, '项目名称不能为空'),
  projectType: z.string().min(1, '请选择项目类型'),
  location: z.string().min(1, '项目位置不能为空'),
  description: z.string().optional(),

  // 财务信息
  budget: z.string().optional(),
  targetPrice: z.string().optional(),
  investmentAmount: z.string().optional(),

  // 时间信息
  projectTimeline: z.string().optional(),
  launchDate: z.string().optional(),

  // 目标受众
  targetAudience: z.array(z.string()).min(1, '请至少选择一个目标受众'),
  audienceAge: z.string().optional(),
  audienceIncome: z.string().optional(),

  // 市场分析偏好
  analysisDepth: z.string().min(1, '请选择分析深度'),
  includeCompetitors: z.boolean().default(false),
  includeMarketTrends: z.boolean().default(false),
  includePricingAnalysis: z.boolean().default(false),
  includeRiskAssessment: z.boolean().default(false),

  // 报告偏好
  reportFormat: z.string().min(1, '请选择报告格式'),
  reportStyle: z.string().min(1, '请选择报告风格'),
  includeCharts: z.boolean().default(true),
  includeImages: z.boolean().default(true),

  // 附件文件
  attachments: z.array(z.any()).optional()
});

export type DataCollectionFormData = z.infer<typeof dataCollectionSchema>;

export interface DataCollectionFormProps {
  initialData?: Partial<DataCollectionFormData>;
  onSubmit: (data: DataCollectionFormData) => void;
  onSave?: (data: Partial<DataCollectionFormData>) => void;
  isLoading?: boolean;
  className?: string;
}

export function DataCollectionForm({
  initialData,
  onSubmit,
  onSave,
  isLoading = false,
  className
}: DataCollectionFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<DataCollectionFormData>({
    resolver: zodResolver(dataCollectionSchema),
    defaultValues: {
      includeCharts: true,
      includeImages: true,
      targetAudience: [],
      ...initialData
    }
  });

  const watchedValues = watch();

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  // 移除文件
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 自动保存
  const handleAutoSave = () => {
    onSave?.(watchedValues);
  };

  const projectTypeOptions = [
    { value: 'residential', label: '住宅项目' },
    { value: 'commercial', label: '商业项目' },
    { value: 'mixed', label: '混合用途' },
    { value: 'industrial', label: '工业项目' },
    { value: 'land', label: '土地开发' }
  ];

  const audienceOptions = [
    { value: 'first_time_buyers', label: '首次购房者' },
    { value: 'investors', label: '投资客户' },
    { value: 'upgraders', label: '改善型客户' },
    { value: 'seniors', label: '银发族群' },
    { value: 'young_professionals', label: '年轻专业人士' }
  ];

  const analysisDepthOptions = [
    { value: 'basic', label: '基础分析', description: '包含基本市场概况和价格分析' },
    { value: 'comprehensive', label: '全面分析', description: '包含详细的市场研究和竞争对手分析' },
    { value: 'expert', label: '专家级分析', description: '包含深度洞察和投资建议' }
  ];

  const reportFormatOptions = [
    { value: 'pptx', label: 'PowerPoint 演示文稿' },
    { value: 'pdf', label: 'PDF 报告' },
    { value: 'both', label: '两种格式' }
  ];

  const reportStyleOptions = [
    { value: 'professional', label: '商务专业风格' },
    { value: 'modern', label: '现代简约风格' },
    { value: 'executive', label: '高管汇报风格' },
    { value: 'creative', label: '创意设计风格' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-8', className)}>
      {/* 项目基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            项目基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="项目名称"
              placeholder="请输入项目名称"
              error={errors.projectName?.message}
              {...register('projectName')}
            />

            <Select
              label="项目类型"
              placeholder="请选择项目类型"
              options={projectTypeOptions}
              error={errors.projectType?.message}
              value={watchedValues.projectType}
              onValueChange={(value) => setValue('projectType', value)}
            />
          </div>

          <Input
            label="项目位置"
            leftIcon={<MapPin className="w-4 h-4" />}
            placeholder="请输入详细地址"
            error={errors.location?.message}
            {...register('location')}
          />

          <Textarea
            label="项目描述"
            placeholder="请简要描述项目的特点、定位和优势..."
            maxLength={500}
            showCount
            autoResize
            {...register('description')}
          />
        </CardContent>
      </Card>

      {/* 财务信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            财务信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="项目预算"
              placeholder="例如：5000万"
              leftIcon={<DollarSign className="w-4 h-4" />}
              {...register('budget')}
            />

            <Input
              label="目标售价"
              placeholder="例如：3万/㎡"
              leftIcon={<TrendingUp className="w-4 h-4" />}
              {...register('targetPrice')}
            />

            <Input
              label="投资金额"
              placeholder="例如：2亿"
              leftIcon={<Target className="w-4 h-4" />}
              {...register('investmentAmount')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 时间规划 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            时间规划
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="项目周期"
              placeholder="例如：24个月"
              {...register('projectTimeline')}
            />

            <Input
              label="预计开盘时间"
              type="date"
              {...register('launchDate')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 目标受众分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            目标受众分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              主要目标客户群体 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {audienceOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={watchedValues.targetAudience?.includes(option.value)}
                  onChange={(e) => {
                    const currentAudience = watchedValues.targetAudience || [];
                    if (e.target.checked) {
                      setValue('targetAudience', [...currentAudience, option.value]);
                    } else {
                      setValue('targetAudience', currentAudience.filter(v => v !== option.value));
                    }
                  }}
                />
              ))}
            </div>
            {errors.targetAudience && (
              <p className="text-sm text-red-600 mt-1">{errors.targetAudience.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="主要年龄群体"
              placeholder="例如：25-40岁"
              {...register('audienceAge')}
            />

            <Input
              label="收入水平"
              placeholder="例如：年收入30-80万"
              {...register('audienceIncome')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 分析偏好设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            分析偏好设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              分析深度 <span className="text-red-500">*</span>
            </label>
            <RadioGroup
              value={watchedValues.analysisDepth}
              onValueChange={(value) => setValue('analysisDepth', value)}
              className="space-y-3"
            >
              {analysisDepthOptions.map((option) => (
                <RadioButton
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </RadioGroup>
            {errors.analysisDepth && (
              <p className="text-sm text-red-600 mt-1">{errors.analysisDepth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              包含的分析内容
            </label>
            <div className="space-y-3">
              <Checkbox
                label="竞争对手分析"
                description="分析同区域类似项目的优劣势"
                checked={watchedValues.includeCompetitors}
                onChange={(e) => setValue('includeCompetitors', e.target.checked)}
              />
              <Checkbox
                label="市场趋势分析"
                description="分析近期市场走势和未来预测"
                checked={watchedValues.includeMarketTrends}
                onChange={(e) => setValue('includeMarketTrends', e.target.checked)}
              />
              <Checkbox
                label="定价策略分析"
                description="提供详细的定价建议和策略"
                checked={watchedValues.includePricingAnalysis}
                onChange={(e) => setValue('includePricingAnalysis', e.target.checked)}
              />
              <Checkbox
                label="风险评估"
                description="分析项目可能面临的风险和应对策略"
                checked={watchedValues.includeRiskAssessment}
                onChange={(e) => setValue('includeRiskAssessment', e.target.checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 报告格式设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-600" />
            报告格式设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="输出格式"
              placeholder="选择报告格式"
              options={reportFormatOptions}
              value={watchedValues.reportFormat}
              onValueChange={(value) => setValue('reportFormat', value)}
              error={errors.reportFormat?.message}
            />

            <Select
              label="报告风格"
              placeholder="选择报告风格"
              options={reportStyleOptions}
              value={watchedValues.reportStyle}
              onValueChange={(value) => setValue('reportStyle', value)}
              error={errors.reportStyle?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              包含的内容元素
            </label>
            <div className="flex gap-6">
              <Checkbox
                label="图表和数据可视化"
                checked={watchedValues.includeCharts}
                onChange={(e) => setValue('includeCharts', e.target.checked)}
              />
              <Checkbox
                label="图片和示意图"
                checked={watchedValues.includeImages}
                onChange={(e) => setValue('includeImages', e.target.checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 附件上传 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-600" />
            参考资料上传
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              拖拽文件到此处，或
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
                点击选择文件
              </label>
            </p>
            <p className="text-xs text-gray-500">
              支持 PDF、Word、Excel、PPT、图片等格式，单文件不超过50MB
            </p>
          </div>

          {/* 已上传文件列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">已上传文件：</h4>
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 自动保存提示 */}
      <div className="flex justify-between items-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          表单内容将自动保存，您可以随时回来继续编辑
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAutoSave}
        >
          手动保存
        </Button>
      </div>
    </form>
  );
}

export default DataCollectionForm;