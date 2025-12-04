'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ReportShareDialog from '@/components/ReportShareDialog';
import ReportVersionComparison from '@/components/ReportVersionComparison';
import { downloadSingleFile, downloadBatchFiles, previewFile } from '@/utils/downloadUtils';

interface GeneratedReport {
  id: string;
  reportType: {
    id: string;
    name: string;
    category: string;
    icon: string;
  };
  title: string;
  status: 'generating' | 'completed' | 'failed';
  version: number;
  designSystem: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectReportsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; report?: GeneratedReport }>({ isOpen: false });
  const [versionComparison, setVersionComparison] = useState<{ isOpen: boolean; reportId?: string }>({ isOpen: false });
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports([
        {
          id: '1',
          reportType: {
            id: 'pre-feasibility-study',
            name: '项目预可行性研究',
            category: '可行性分析',
            icon: '📊'
          },
          title: '万科·翡翠湾项目预可行性研究报告',
          status: 'completed',
          version: 1,
          designSystem: 'default',
          filePath: '/reports/project1_pre-feasibility_v1.pdf',
          fileSize: 2048576,
          createdAt: '2024-12-04T10:30:00Z',
          updatedAt: '2024-12-04T10:30:00Z'
        },
        {
          id: '2',
          reportType: {
            id: 'market-analysis',
            name: '市场调研与分析',
            category: '市场研究',
            icon: '📈'
          },
          title: '万科·翡翠湾市场调研与分析报告',
          status: 'completed',
          version: 2,
          designSystem: 'modern',
          filePath: '/reports/project1_market-analysis_v2.pdf',
          fileSize: 3145728,
          createdAt: '2024-12-03T14:20:00Z',
          updatedAt: '2024-12-04T09:15:00Z'
        },
        {
          id: '3',
          reportType: {
            id: 'financial-analysis',
            name: '财务分析报告',
            category: '财务分析',
            icon: '💰'
          },
          title: '万科·翡翠湾财务分析报告',
          status: 'generating',
          version: 1,
          designSystem: 'luxury',
          filePath: '',
          fileSize: 0,
          createdAt: '2024-12-04T11:00:00Z',
          updatedAt: '2024-12-04T11:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReports.size === reports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(reports.map(r => r.id)));
    }
  };

  const handleBatchDownload = async () => {
    const selectedReportsList = reports.filter(r => selectedReports.has(r.id) && r.status === 'completed');

    if (selectedReportsList.length === 0) {
      alert('请选择要下载的报告');
      return;
    }

    try {
      const downloadableReports = selectedReportsList.map(report => ({
        id: report.id,
        title: report.title,
        filePath: report.filePath,
        fileSize: report.fileSize,
        type: report.reportType.category
      }));

      await downloadBatchFiles(downloadableReports, (progress) => {
        setDownloadProgress(prev => ({ ...prev, batch: progress }));
      });

      // 清除选择
      setSelectedReports(new Set());
    } catch (error) {
      console.error('批量下载失败:', error);
      alert('批量下载失败，请重试');
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress.batch;
        return newProgress;
      });
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('确定要删除这个报告吗？此操作不可撤销。')) {
      setReports(reports.filter(r => r.id !== reportId));
      setSelectedReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handlePreviewReport = async (reportId: string) => {
    try {
      const previewUrl = await previewFile(reportId);
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('预览失败:', error);
      alert('预览失败，请重试');
    }
  };

  const handleDownloadReport = async (report: GeneratedReport) => {
    try {
      const downloadableReport = {
        id: report.id,
        title: report.title,
        filePath: report.filePath,
        fileSize: report.fileSize,
        type: report.reportType.category
      };

      setDownloadProgress(prev => ({ ...prev, [report.id]: 0 }));

      await downloadSingleFile(downloadableReport);

      setDownloadProgress(prev => ({ ...prev, [report.id]: 100 }));

      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[report.id];
          return newProgress;
        });
      }, 2000);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[report.id];
        return newProgress;
      });
    }
  };

  const handleShareReport = (report: GeneratedReport) => {
    setShareDialog({ isOpen: true, report });
  };

  const handleVersionComparison = (reportId: string) => {
    setVersionComparison({ isOpen: true, reportId });
  };

  const filteredAndSortedReports = reports
    .filter(report => {
      if (filterStatus !== 'all' && report.status !== filterStatus) return false;
      if (filterCategory !== 'all' && report.reportType.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'type':
          return a.reportType.name.localeCompare(b.reportType.name);
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const categories = Array.from(new Set(reports.map(r => r.reportType.category)));
  const completedCount = reports.filter(r => r.status === 'completed').length;
  const totalSize = reports.reduce((sum, r) => sum + r.fileSize, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载报告列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 面包屑导航 */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link href="/projects" className="hover:text-indigo-600 transition-colors">
              项目管理
            </Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/projects/${projectId}`} className="hover:text-indigo-600 transition-colors">
              项目工作空间
            </Link>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-900">报告管理</span>
          </nav>
        </div>
      </div>

      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📁 报告管理中心
              </h1>
              <p className="text-gray-600 text-lg mb-4">管理和组织您的项目报告</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>📊 总报告数：{reports.length}</span>
                <span>✅ 已完成：{completedCount}</span>
                <span>💾 总大小：{formatFileSize(totalSize)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {selectedReports.size > 0 && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={handleBatchDownload}
                  disabled={!!downloadProgress.batch}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadProgress.batch !== undefined
                    ? `下载中 ${Math.round(downloadProgress.batch)}%`
                    : `📥 批量下载 (${selectedReports.size})`}
                </motion.button>
              )}
              <Link
                href={`/projects/${projectId}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                ➕ 生成新报告
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 过滤和排序控制 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">状态筛选：</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">全部</option>
                  <option value="completed">已完成</option>
                  <option value="generating">生成中</option>
                  <option value="failed">失败</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">分类筛选：</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">全部分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">排序方式：</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="date">更新时间</option>
                  <option value="name">报告名称</option>
                  <option value="type">报告类型</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {selectedReports.size === reports.length ? '取消全选' : '全选'}
              </button>
              <span className="text-sm text-gray-500">
                显示 {filteredAndSortedReports.length} 个报告
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 报告列表 */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {filteredAndSortedReports.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedReports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedReports.has(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                      className="mt-1 rounded border-gray-300"
                      disabled={report.status !== 'completed'}
                    />

                    <div className={`p-3 rounded-lg ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : report.status === 'generating'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <span className="text-xl">{report.reportType.icon}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : report.status === 'generating'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {report.status === 'completed' ? '已完成' :
                           report.status === 'generating' ? '生成中' : '生成失败'}
                        </span>
                        {report.version > 1 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            v{report.version}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <span>📋 {report.reportType.name}</span>
                        <span>🎨 {report.designSystem}</span>
                        {report.fileSize > 0 && <span>📊 {formatFileSize(report.fileSize)}</span>}
                        <span>🕒 {formatDate(report.updatedAt)}</span>
                      </div>

                      {report.status === 'generating' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {report.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handlePreviewReport(report.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          👁️ 预览
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          disabled={!!downloadProgress[report.id]}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {downloadProgress[report.id] !== undefined ? '下载中...' : '📥 下载'}
                        </button>
                        <button
                          onClick={() => handleShareReport(report)}
                          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                        >
                          🔗 分享
                        </button>
                        <button
                          onClick={() => handleVersionComparison(report.id)}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          📊 版本对比
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              暂无符合条件的报告
            </h3>
            <p className="text-gray-600 mb-6">
              请尝试调整筛选条件或生成新的报告
            </p>
            <Link
              href={`/projects/${projectId}`}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ➕ 生成第一个报告
            </Link>
          </div>
        )}
      </main>

      {/* 存储使用情况 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-indigo-50/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <span className="text-2xl">💾</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                存储使用情况
              </h3>
              <div className="text-indigo-700 text-sm space-y-1">
                <p>• <strong>已使用</strong>：{formatFileSize(totalSize)} / 1GB</p>
                <p>• <strong>报告数量</strong>：{reports.length} / 100 个</p>
                <p>• <strong>自动清理</strong>：30天未访问的报告将被归档</p>
              </div>
              <div className="w-64 bg-indigo-200 rounded-full h-2 mt-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min((totalSize / (1024*1024*1024)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分享对话框 */}
      {shareDialog.report && (
        <ReportShareDialog
          report={{
            id: shareDialog.report.id,
            title: shareDialog.report.title,
            filePath: shareDialog.report.filePath,
            fileSize: shareDialog.report.fileSize,
            type: shareDialog.report.reportType.category
          }}
          isOpen={shareDialog.isOpen}
          onClose={() => setShareDialog({ isOpen: false })}
        />
      )}

      {/* 版本对比对话框 */}
      <ReportVersionComparison
        reportId={versionComparison.reportId || ''}
        isOpen={versionComparison.isOpen}
        onClose={() => setVersionComparison({ isOpen: false })}
      />
    </div>
  );
}