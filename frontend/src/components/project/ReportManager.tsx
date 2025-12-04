'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Edit3,
  Download,
  Share2,
  Eye,
  History,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { GeneratedReport } from '@/services/reportGeneration';
import { ReportPreview } from './ReportPreview';
import { ReportEditor } from './ReportEditor';
import ReportExportService, { ExportOptions, ExportProgress } from '@/services/reportExport';

interface ReportVersion {
  id: string;
  version: string;
  timestamp: string;
  changes: string[];
  author: string;
  report: GeneratedReport;
}

interface ReportManagerProps {
  initialReport: GeneratedReport;
  projectId: string;
  phaseId: string;
  onSave: (report: GeneratedReport) => void;
  onExport: (report: GeneratedReport, format: 'pdf' | 'word' | 'excel') => void;
  onShare: (report: GeneratedReport) => void;
}

export function ReportManager({
  initialReport,
  projectId,
  phaseId,
  onSave,
  onExport,
  onShare
}: ReportManagerProps) {
  const [currentReport, setCurrentReport] = useState<GeneratedReport>(initialReport);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | undefined>();
  const [reportVersions, setReportVersions] = useState<ReportVersion[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 初始化版本历史
  useEffect(() => {
    const initialVersion: ReportVersion = {
      id: `version_${Date.now()}`,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      changes: ['初始报告生成'],
      author: 'AI Assistant',
      report: initialReport
    };
    setReportVersions([initialVersion]);
    setLastSaved(new Date());
  }, [initialReport]);

  // 自动保存功能
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30秒后自动保存

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, currentReport]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;

    setIsAutoSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟保存
      await onSave(currentReport);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('自动保存失败:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleManualSave = async () => {
    setIsAutoSaving(true);
    try {
      await onSave(currentReport);

      // 创建新版本
      const newVersion: ReportVersion = {
        id: `version_${Date.now()}`,
        version: getNextVersion(),
        timestamp: new Date().toISOString(),
        changes: generateChangeLog(),
        author: '用户手动保存',
        report: { ...currentReport }
      };

      setReportVersions(prev => [newVersion, ...prev]);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const getNextVersion = () => {
    const latestVersion = reportVersions[0]?.version || '1.0.0';
    const parts = latestVersion.split('.').map(Number);
    parts[2] += 1; // 增加修订版本号
    return parts.join('.');
  };

  const generateChangeLog = () => {
    // 这里可以实现更智能的变更检测
    return ['手动保存修改'];
  };

  const handleEdit = (sectionId?: string) => {
    setTargetSectionId(sectionId);
    setIsEditorOpen(true);
  };

  const handleEditorSave = (updatedReport: GeneratedReport) => {
    setCurrentReport(updatedReport);
    setHasUnsavedChanges(true);
    setIsEditorOpen(false);
    setTargetSectionId(undefined);
  };

  const handleRevert = (version: ReportVersion) => {
    setCurrentReport({ ...version.report });
    setHasUnsavedChanges(true);
    setShowVersionHistory(false);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '未保存';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚保存';
    if (minutes < 60) return `${minutes}分钟前保存`;
    return lastSaved.toLocaleString('zh-CN');
  };

  const handleReportExport = async (report: GeneratedReport, format: 'pdf' | 'word' | 'excel') => {
    setIsExporting(true);
    setExportProgress(null);

    try {
      const exportService = ReportExportService.getInstance();
      const options: ExportOptions = {
        format,
        includeMetadata: true,
        includeCharts: true,
        customStyles: true
      };

      await exportService.exportReport(report, options, (progress) => {
        setExportProgress(progress);
      });

      // 清理进度状态
      setTimeout(() => {
        setExportProgress(null);
        setIsExporting(false);
      }, 2000);

    } catch (error) {
      console.error('导出失败:', error);
      setExportProgress({
        stage: 'error',
        progress: 0,
        message: `导出失败: ${error instanceof Error ? error.message : '未知错误'}`
      });

      setTimeout(() => {
        setExportProgress(null);
        setIsExporting(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部状态栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="font-semibold text-gray-900">{currentReport.title}</h1>
                  <p className="text-sm text-gray-600">{currentReport.subtitle}</p>
                </div>
              </div>

              {/* 保存状态指示器 */}
              <div className="flex items-center gap-2">
                {isAutoSaving ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">保存中...</span>
                  </div>
                ) : hasUnsavedChanges ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">有未保存的修改</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{formatLastSaved()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowVersionHistory(true)}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <History className="w-4 h-4 mr-2" />
                版本历史
              </Button>

              <Button
                onClick={handleManualSave}
                disabled={isAutoSaving || !hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>

              <Button
                onClick={() => handleEdit()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-6xl mx-auto p-6">
        <ReportPreview
          report={currentReport}
          onEdit={handleEdit}
          onExport={(format) => handleReportExport(currentReport, format)}
          onShare={() => onShare(currentReport)}
          isEditable={true}
          showMetadata={true}
        />
      </div>

      {/* 报告编辑器 */}
      <ReportEditor
        report={currentReport}
        onSave={handleEditorSave}
        onClose={() => {
          setIsEditorOpen(false);
          setTargetSectionId(undefined);
        }}
        isOpen={isEditorOpen}
        targetSectionId={targetSectionId}
      />

      {/* 导出进度模态框 */}
      <AnimatePresence>
        {exportProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">导出报告</h2>
                    <p className="text-green-100 mt-1">正在处理您的报告...</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{exportProgress.message}</span>
                    <span>{exportProgress.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full transition-colors ${
                        exportProgress.stage === 'error'
                          ? 'bg-red-500'
                          : exportProgress.stage === 'completed'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${
                    exportProgress.stage === 'preparing' || exportProgress.stage === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {exportProgress.stage === 'preparing' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : exportProgress.stage === 'completed' || exportProgress.progress > 10 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>准备导出文件</span>
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${
                    exportProgress.stage === 'processing' || exportProgress.stage === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {exportProgress.stage === 'processing' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : exportProgress.stage === 'completed' || exportProgress.progress > 50 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>生成文档内容</span>
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${
                    exportProgress.stage === 'generating' || exportProgress.stage === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {exportProgress.stage === 'generating' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : exportProgress.stage === 'completed' || exportProgress.progress > 80 ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>打包下载文件</span>
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${
                    exportProgress.stage === 'downloading' || exportProgress.stage === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {exportProgress.stage === 'downloading' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : exportProgress.stage === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>开始下载</span>
                  </div>

                  {exportProgress.stage === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>导出失败</span>
                    </div>
                  )}
                </div>

                {exportProgress.stage === 'completed' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">导出成功！</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">文件已开始下载到您的设备</p>
                  </div>
                )}

                {exportProgress.stage === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">导出失败</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{exportProgress.message}</p>
                    <Button
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setExportProgress(null)}
                    >
                      关闭
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 版本历史模态框 */}
      <AnimatePresence>
        {showVersionHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">版本历史</h2>
                    <p className="text-blue-100 mt-1">查看和管理报告的历史版本</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setShowVersionHistory(false)}
                  >
                    关闭
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {reportVersions.map((version, index) => (
                    <Card key={version.id} className={`
                      ${index === 0 ? 'border-blue-200 bg-blue-50' : ''}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`} />
                                <span className="font-medium text-gray-900">
                                  版本 {version.version}
                                  {index === 0 && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      当前版本
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(version.timestamp).toLocaleString('zh-CN')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{version.author}</span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <h4 className="font-medium text-gray-800 mb-1">更改内容：</h4>
                              <ul className="space-y-1">
                                {version.changes.map((change, changeIndex) => (
                                  <li key={changeIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="text-sm text-gray-500">
                              字数: {version.report.metadata.wordCount.toLocaleString()} ·
                              置信度: {version.report.metadata.confidenceScore}%
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              预览
                            </Button>

                            {index !== 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevert(version)}
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                恢复
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {reportVersions.length === 0 && (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">暂无版本历史</h3>
                    <p className="text-gray-500">当您保存修改时，这里将显示版本历史记录</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 快捷键提示 */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          快捷操作
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>编辑报告</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + E</kbd>
          </div>
          <div className="flex justify-between">
            <span>保存</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + S</kbd>
          </div>
          <div className="flex justify-between">
            <span>版本历史</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + H</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}