'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Edit3,
  Download,
  Share2,
  Eye,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { GeneratedReport, ReportSection } from '@/services/reportGeneration';

interface ReportPreviewProps {
  report: GeneratedReport;
  onEdit: (sectionId?: string) => void;
  onExport: (format: 'pdf' | 'word' | 'excel') => void;
  onShare: () => void;
  isEditable?: boolean;
  showMetadata?: boolean;
}

export function ReportPreview({
  report,
  onEdit,
  onExport,
  onShare,
  isEditable = true,
  showMetadata = true
}: ReportPreviewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'print'>('preview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <Star className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 报告头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">{report.title}</h1>
                <p className="text-blue-100 text-lg mt-1">{report.subtitle}</p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => setViewMode(viewMode === 'preview' ? 'print' : 'preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              {viewMode === 'preview' ? '打印视图' : '预览视图'}
            </Button>

            {isEditable && (
              <Button
                onClick={() => onEdit()}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑报告
              </Button>
            )}

            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>

            <div className="relative group">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="p-2">
                  <button
                    onClick={() => onExport('pdf')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                  >
                    PDF 格式
                  </button>
                  <button
                    onClick={() => onExport('word')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                  >
                    Word 文档
                  </button>
                  <button
                    onClick={() => onExport('excel')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
                  >
                    Excel 表格
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 报告元数据 */}
        {showMetadata && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div>
                <p className="text-xs text-blue-100">生成时间</p>
                <p className="text-sm font-medium">{formatDate(report.metadata.generatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div>
                <p className="text-xs text-blue-100">生成方式</p>
                <p className="text-sm font-medium">
                  {report.metadata.generatedBy === 'ai' ? 'AI生成' :
                   report.metadata.generatedBy === 'user' ? '手动创建' : 'AI+人工'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>
                <p className="text-xs text-blue-100">字数统计</p>
                <p className="text-sm font-medium">{report.metadata.wordCount.toLocaleString()} 字</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <p className="text-xs text-blue-100">置信度分数</p>
                <p className="text-sm font-medium">{report.metadata.confidenceScore}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 质量指标 */}
      {showMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              报告质量评估
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getQualityColor(report.metadata.qualityMetrics.completeness)}`}>
                  {getQualityIcon(report.metadata.qualityMetrics.completeness)}
                  <span className="font-medium">{report.metadata.qualityMetrics.completeness}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">完整性</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getQualityColor(report.metadata.qualityMetrics.accuracy)}`}>
                  {getQualityIcon(report.metadata.qualityMetrics.accuracy)}
                  <span className="font-medium">{report.metadata.qualityMetrics.accuracy}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">准确性</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getQualityColor(report.metadata.qualityMetrics.relevance)}`}>
                  {getQualityIcon(report.metadata.qualityMetrics.relevance)}
                  <span className="font-medium">{report.metadata.qualityMetrics.relevance}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">相关性</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getQualityColor(report.metadata.qualityMetrics.actionability)}`}>
                  {getQualityIcon(report.metadata.qualityMetrics.actionability)}
                  <span className="font-medium">{report.metadata.qualityMetrics.actionability}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">可操作性</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 执行摘要 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              执行摘要
            </CardTitle>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit('executive-summary')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                编辑
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-gray-700">
              {report.executiveSummary.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 报告章节 */}
      <div className="space-y-6">
        {report.sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setActiveSection(section.id)}
            onMouseLeave={() => setActiveSection(null)}
          >
            <Card className={`transition-all duration-200 ${
              activeSection === section.id ? 'shadow-lg border-blue-200' : ''
            }`}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {section.icon && (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {section.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </div>
                    {section.subtitle && (
                      <div className="text-sm text-gray-600 font-normal">
                        {section.subtitle}
                      </div>
                    )}
                  </div>
                </CardTitle>
                {isEditable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(section.id)}
                    className={`text-blue-600 border-blue-200 hover:bg-blue-50 transition-opacity ${
                      activeSection === section.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="prose max-w-none text-gray-700">
                      <p>{paragraph}</p>
                    </div>
                  ))}

                  {/* 数据表格 */}
                  {section.data && section.data.length > 0 && (
                    <div className="mt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              {Object.keys(section.data[0]).map((key) => (
                                <th key={key} className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.data.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50">
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-gray-700">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 关键要点 */}
                  {section.keyPoints && section.keyPoints.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-3">关键要点：</h4>
                      <ul className="space-y-2">
                        {section.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 结论和下一步 */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                主要结论
              </CardTitle>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit('conclusions')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  编辑
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.conclusions.map((conclusion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{conclusion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                下一步行动
              </CardTitle>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit('next-steps')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  编辑
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 页脚信息 */}
      <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>
          由 MarketPro AI 生成 · 版本 {report.metadata.version} ·
          最后更新: {formatDate(report.metadata.generatedAt)}
        </p>
      </div>
    </div>
  );
}