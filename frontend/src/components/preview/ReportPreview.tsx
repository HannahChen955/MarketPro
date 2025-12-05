'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  FileText,
  BarChart3,
  Image,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Modal
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { DataCollectionFormData } from '../workflow/DataCollectionForm';

export interface ReportPreviewProps {
  formData: Partial<DataCollectionFormData>;
  isGenerating?: boolean;
  generationProgress?: number;
  className?: string;
  mode?: 'compact' | 'full' | 'modal';
  showControls?: boolean;
  onRefresh?: () => void;
  onDownload?: (format: string) => void;
  onShare?: () => void;
}

interface PreviewSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'generating' | 'completed';
  progress: number;
  content?: React.ReactNode;
  estimatedPages?: number;
}

export function ReportPreview({
  formData,
  isGenerating = false,
  generationProgress = 0,
  className,
  mode = 'compact',
  showControls = true,
  onRefresh,
  onDownload,
  onShare
}: ReportPreviewProps) {
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 基于表单数据生成预览内容
  const previewSections = useMemo(() => {
    const sections: PreviewSection[] = [
      {
        id: 'overview',
        title: '项目概览',
        icon: <Eye className="w-4 h-4" />,
        status: formData.projectName ? 'completed' : 'pending',
        progress: formData.projectName ? 100 : 0,
        estimatedPages: 2,
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
              <h1 className="text-2xl font-bold mb-2">
                {formData.projectName || '项目名称待填写'}
              </h1>
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="w-4 h-4" />
                <span>{formData.location || '项目位置待填写'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={formData.projectType ? 'primary' : 'default'} size="sm">
                    {formData.projectType || '项目类型'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.projectType === 'residential' && '住宅项目'}
                  {formData.projectType === 'commercial' && '商业项目'}
                  {formData.projectType === 'mixed' && '综合项目'}
                  {!formData.projectType && '项目类型将影响分析维度'}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium">分析深度</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.analysisDepth === 'basic' && '基础分析'}
                  {formData.analysisDepth === 'comprehensive' && '全面分析'}
                  {formData.analysisDepth === 'premium' && '深度分析'}
                  {!formData.analysisDepth && '待选择分析深度'}
                </p>
              </Card>
            </div>
          </div>
        )
      },
      {
        id: 'market',
        title: '市场分析',
        icon: <BarChart3 className="w-4 h-4" />,
        status: formData.location && formData.projectType ? 'completed' : 'pending',
        progress: formData.location && formData.projectType ? 85 : 0,
        estimatedPages: 4,
        content: (
          <div className="space-y-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                区域市场概况
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                基于 {formData.location || '项目位置'} 的市场数据分析
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-bold text-lg text-green-600">85%</div>
                  <div className="text-xs text-gray-500">市场活跃度</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-bold text-lg text-blue-600">12%</div>
                  <div className="text-xs text-gray-500">年均增长</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-bold text-lg text-orange-600">7.2</div>
                  <div className="text-xs text-gray-500">竞争指数</div>
                </div>
              </div>
            </Card>

            {formData.projectType && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2">
                  {formData.projectType === 'residential' && '住宅市场趋势'}
                  {formData.projectType === 'commercial' && '商业地产趋势'}
                  {formData.projectType === 'mixed' && '综合项目趋势'}
                </h3>
                <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">市场趋势图表</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )
      },
      {
        id: 'financial',
        title: '财务分析',
        icon: <DollarSign className="w-4 h-4" />,
        status: formData.budget ? 'completed' : 'pending',
        progress: formData.budget ? 90 : 0,
        estimatedPages: 3,
        content: (
          <div className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                项目财务概览
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">总预算</p>
                  <p className="text-lg font-bold text-green-600">
                    {formData.budget ? `¥${formData.budget}万` : '待填写'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">营销预算</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formData.targetPrice ? `¥${formData.targetPrice}万` : '待填写'}
                  </p>
                </div>
              </div>
            </Card>

            {formData.budget && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2">预算分配建议</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">线上推广</span>
                    <Badge variant="primary" size="sm">40%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">线下活动</span>
                    <Badge variant="secondary" size="sm">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">品牌建设</span>
                    <Badge variant="default" size="sm">30%</Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )
      },
      {
        id: 'audience',
        title: '目标受众',
        icon: <Users className="w-4 h-4" />,
        status: formData.targetAudience?.length ? 'completed' : 'pending',
        progress: formData.targetAudience?.length ? 95 : 0,
        estimatedPages: 2,
        content: (
          <div className="space-y-4">
            {formData.targetAudience?.length ? (
              <>
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    目标客户群体
                  </h3>
                  <div className="grid gap-2">
                    {formData.targetAudience.map((audience) => (
                      <div key={audience} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <Badge variant="primary" size="sm">
                          {audience === 'first_time_buyers' && '首次购房者'}
                          {audience === 'investors' && '投资者'}
                          {audience === 'upgraders' && '置换客户'}
                          {audience === 'elderly' && '养老客户'}
                          {audience === 'young_professionals' && '年轻专业人士'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {audience === 'first_time_buyers' && '注重性价比和区域发展'}
                          {audience === 'investors' && '关注投资回报和升值空间'}
                          {audience === 'upgraders' && '追求品质和生活升级'}
                          {audience === 'elderly' && '重视便民设施和医疗配套'}
                          {audience === 'young_professionals' && '看重交通和职业发展'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">营销策略建议</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>针对主要客群制定差异化营销方案</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>重点突出产品核心卖点与客群需求匹配</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <span>选择合适的推广渠道和媒体组合</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-4 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">请先选择目标受众群体</p>
              </Card>
            )}
          </div>
        )
      }
    ];

    return sections;
  }, [formData]);

  // 自动刷新预览
  useEffect(() => {
    if (autoRefresh && !isGenerating) {
      const timer = setTimeout(() => {
        onRefresh?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formData, autoRefresh, isGenerating, onRefresh]);

  const completionRate = useMemo(() => {
    const totalFields = 10; // 主要字段数量
    const filledFields = [
      formData.projectName,
      formData.projectType,
      formData.location,
      formData.budget,
      formData.targetPrice,
      formData.analysisDepth,
      formData.reportFormat,
      formData.targetAudience?.length,
      formData.includeCompetitors,
      formData.includeCharts
    ].filter(Boolean).length;

    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  const renderPreviewContent = () => (
    <div className="space-y-6">
      {/* 预览头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">实时预览</h2>
          <p className="text-sm text-gray-600">
            基于当前输入自动生成预览 • 完成度 {completionRate}%
          </p>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              leftIcon={<RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />}
            >
              {autoRefresh ? '自动更新' : '手动更新'}
            </Button>

            {mode !== 'modal' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(true)}
                leftIcon={<Maximize2 className="w-4 h-4" />}
              >
                全屏预览
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 完成度进度条 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">信息完整度</span>
          <span className="text-sm text-gray-600">{completionRate}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {completionRate < 50 && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            继续填写信息以获得更准确的预览效果
          </p>
        )}
      </Card>

      {/* 分节预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            报告内容预览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            <TabsList className="grid grid-cols-4 w-full">
              {previewSections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {section.icon}
                  <span className="hidden sm:inline">{section.title}</span>
                  <Badge
                    size="sm"
                    variant={section.status === 'completed' ? 'success' : 'default'}
                    className="ml-1"
                  >
                    {section.status === 'completed' ? '✓' : '○'}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {previewSections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-4">
                <div className="space-y-4">
                  {/* 节标题和状态 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <div>
                        <h3 className="font-medium">{section.title}</h3>
                        <p className="text-sm text-gray-600">
                          预计 {section.estimatedPages} 页 •
                          完成度 {section.progress}%
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        section.status === 'completed' ? 'success' :
                        section.status === 'generating' ? 'primary' : 'default'
                      }
                    >
                      {section.status === 'completed' && '已完成'}
                      {section.status === 'generating' && '生成中'}
                      {section.status === 'pending' && '待完善'}
                    </Badge>
                  </div>

                  {/* 进度条 */}
                  {section.progress > 0 && (
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          section.status === 'completed' ? 'bg-green-500' :
                          section.status === 'generating' ? 'bg-blue-500' :
                          'bg-gray-400'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${section.progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  )}

                  {/* 内容预览 */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'min-h-[200px]',
                        section.status === 'pending' && 'opacity-50'
                      )}
                    >
                      {section.content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 预览操作 */}
      {showControls && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>最后更新: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>预计页数: {previewSections.reduce((sum, s) => sum + (s.estimatedPages || 0), 0)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare?.()}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                分享预览
              </Button>

              <Button
                size="sm"
                onClick={() => onDownload?.('pdf')}
                leftIcon={<Download className="w-4 h-4" />}
              >
                生成报告
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  if (mode === 'modal') {
    return (
      <Modal
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
        title="报告预览"
        size="full"
        className="max-w-6xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {renderPreviewContent()}
        </div>
      </Modal>
    );
  }

  if (mode === 'full') {
    return (
      <div className={cn('w-full', className)}>
        {renderPreviewContent()}
      </div>
    );
  }

  // Compact mode
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 紧凑模式头部 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm">实时预览</span>
              <Badge size="sm" variant="primary">
                {completionRate}%
              </Badge>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(true)}
              leftIcon={<Maximize2 className="w-3 h-3" />}
            >
              展开
            </Button>
          </div>

          {/* 紧凑进度条 */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* 预览缩略图 */}
          <div className="grid grid-cols-2 gap-2">
            {previewSections.slice(0, 4).map((section) => (
              <div
                key={section.id}
                className={cn(
                  'p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                  section.status === 'completed' ? 'border-green-200 bg-green-50' :
                  section.status === 'generating' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                )}
                onClick={() => {
                  setSelectedSection(section.id);
                  setIsFullscreen(true);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {section.icon}
                  <span className="text-xs font-medium">{section.title}</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      section.status === 'completed' ? 'bg-green-400' :
                      section.status === 'generating' ? 'bg-blue-400' :
                      'bg-gray-400'
                    )}
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* 全屏预览模态框 */}
      <Modal
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
        title="报告预览"
        size="full"
        className="max-w-6xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {renderPreviewContent()}
        </div>
      </Modal>
    </Card>
  );
}

export default ReportPreview;