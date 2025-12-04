'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportVersion {
  id: string;
  version: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  fileSize: number;
  designSystem: string;
  changes?: string[];
  status: 'completed' | 'generating' | 'failed';
}

interface ReportVersionComparisonProps {
  reportId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportVersionComparison({ reportId, isOpen, onClose }: ReportVersionComparisonProps) {
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | []>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setVersions([
          {
            id: '1',
            version: 3,
            title: '万科·翡翠湾项目预可行性研究报告',
            createdAt: '2024-12-04T11:30:00Z',
            updatedAt: '2024-12-04T11:30:00Z',
            fileSize: 2560000,
            designSystem: 'modern',
            status: 'completed',
            changes: ['更新了市场分析数据', '添加了竞品对比图表', '优化了财务预测模型']
          },
          {
            id: '2',
            version: 2,
            title: '万科·翡翠湾项目预可行性研究报告',
            createdAt: '2024-12-03T15:20:00Z',
            updatedAt: '2024-12-03T15:20:00Z',
            fileSize: 2048000,
            designSystem: 'default',
            status: 'completed',
            changes: ['修正了投资回报率计算', '补充了风险评估章节']
          },
          {
            id: '3',
            version: 1,
            title: '万科·翡翠湾项目预可行性研究报告',
            createdAt: '2024-12-02T09:15:00Z',
            updatedAt: '2024-12-02T09:15:00Z',
            fileSize: 1800000,
            designSystem: 'default',
            status: 'completed',
            changes: ['初始版本']
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, reportId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.length === 0) {
      setSelectedVersions([versionId]);
    } else if (selectedVersions.length === 1) {
      if (selectedVersions[0] === versionId) {
        setSelectedVersions([]);
      } else {
        setSelectedVersions([selectedVersions[0], versionId]);
      }
    } else {
      setSelectedVersions([versionId]);
    }
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;

    setIsComparing(true);
    try {
      // Mock comparison API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const version1 = versions.find(v => v.id === selectedVersions[0]);
      const version2 = versions.find(v => v.id === selectedVersions[1]);

      setComparisonResult({
        version1,
        version2,
        differences: {
          content: [
            { type: 'added', section: '市场分析', content: '新增了2024年最新市场数据' },
            { type: 'modified', section: '财务分析', content: '更新了投资回报率计算方法' },
            { type: 'removed', section: '附录', content: '移除了过时的法规引用' }
          ],
          design: [
            { type: 'modified', item: '配色方案', old: 'default', new: 'modern' },
            { type: 'added', item: '图表样式', content: '新增了数据可视化图表' }
          ],
          metadata: {
            sizeChange: version1!.fileSize - version2!.fileSize,
            timeSpan: new Date(version1!.createdAt).getTime() - new Date(version2!.createdAt).getTime()
          }
        }
      });
    } catch (error) {
      console.error('版本比较失败:', error);
      alert('版本比较失败，请重试');
    } finally {
      setIsComparing(false);
    }
  };

  const getDifferenceIcon = (type: string) => {
    switch (type) {
      case 'added': return '➕';
      case 'modified': return '📝';
      case 'removed': return '➖';
      default: return '📄';
    }
  };

  const getDifferenceColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-700 bg-green-50 border-green-200';
      case 'modified': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'removed': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 对话框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">版本对比</h2>
                <p className="text-gray-600 mt-1">选择两个版本进行详细对比分析</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">加载版本信息中...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 版本列表 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        版本历史 ({versions.length} 个版本)
                      </h3>
                      {selectedVersions.length === 2 && (
                        <button
                          onClick={handleCompare}
                          disabled={isComparing}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {isComparing ? '对比中...' : '开始对比'}
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {versions.map((version) => (
                        <motion.div
                          key={version.id}
                          whileHover={{ scale: 1.01 }}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedVersions.includes(version.id)
                              ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => handleVersionSelect(version.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  version.version === Math.max(...versions.map(v => v.version))
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  v{version.version}
                                  {version.version === Math.max(...versions.map(v => v.version)) && ' (最新)'}
                                </span>
                                <span className="text-sm text-gray-600">{version.designSystem}</span>
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {version.title}
                              </h4>
                              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                                <span>📅 {formatDate(version.createdAt)}</span>
                                <span>💾 {formatFileSize(version.fileSize)}</span>
                                <span className={`px-2 py-1 rounded ${
                                  version.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : version.status === 'generating'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {version.status === 'completed' ? '已完成' :
                                   version.status === 'generating' ? '生成中' : '失败'}
                                </span>
                              </div>
                              {version.changes && (
                                <div className="space-y-1">
                                  <span className="text-sm font-medium text-gray-700">主要变更：</span>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {version.changes.map((change, index) => (
                                      <li key={index} className="flex items-start space-x-2">
                                        <span className="text-gray-400 mt-1">•</span>
                                        <span>{change}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {selectedVersions.includes(version.id) && (
                                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm">
                                  {selectedVersions.indexOf(version.id) + 1}
                                </div>
                              )}
                              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                                预览
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {selectedVersions.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          已选择 {selectedVersions.length} 个版本
                          {selectedVersions.length === 1 && '，请再选择一个版本进行对比'}
                          {selectedVersions.length === 2 && '，点击"开始对比"查看详细差异'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 对比结果 */}
                  {comparisonResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 border-t border-gray-200 pt-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">对比结果</h3>

                      {/* 版本信息对比 */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            版本 {comparisonResult.version1.version}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>📅 {formatDate(comparisonResult.version1.createdAt)}</p>
                            <p>💾 {formatFileSize(comparisonResult.version1.fileSize)}</p>
                            <p>🎨 {comparisonResult.version1.designSystem}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            版本 {comparisonResult.version2.version}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>📅 {formatDate(comparisonResult.version2.createdAt)}</p>
                            <p>💾 {formatFileSize(comparisonResult.version2.fileSize)}</p>
                            <p>🎨 {comparisonResult.version2.designSystem}</p>
                          </div>
                        </div>
                      </div>

                      {/* 内容差异 */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">内容差异</h4>
                        <div className="space-y-3">
                          {comparisonResult.differences.content.map((diff: any, index: number) => (
                            <div
                              key={index}
                              className={`p-3 border rounded-lg ${getDifferenceColor(diff.type)}`}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-lg">{getDifferenceIcon(diff.type)}</span>
                                <div>
                                  <h5 className="font-medium">{diff.section}</h5>
                                  <p className="text-sm mt-1">{diff.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 设计差异 */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">设计差异</h4>
                        <div className="space-y-3">
                          {comparisonResult.differences.design.map((diff: any, index: number) => (
                            <div
                              key={index}
                              className={`p-3 border rounded-lg ${getDifferenceColor(diff.type)}`}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-lg">{getDifferenceIcon(diff.type)}</span>
                                <div className="flex-1">
                                  <h5 className="font-medium">{diff.item}</h5>
                                  {diff.old && diff.new ? (
                                    <p className="text-sm mt-1">
                                      从 <code className="bg-red-100 px-1 rounded">{diff.old}</code>
                                      变更为 <code className="bg-green-100 px-1 rounded">{diff.new}</code>
                                    </p>
                                  ) : (
                                    <p className="text-sm mt-1">{diff.content}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">变更统计</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">文件大小变化:</span>
                            <span className={`ml-2 font-medium ${
                              comparisonResult.differences.metadata.sizeChange > 0
                                ? 'text-green-600'
                                : comparisonResult.differences.metadata.sizeChange < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}>
                              {comparisonResult.differences.metadata.sizeChange > 0 ? '+' : ''}
                              {formatFileSize(Math.abs(comparisonResult.differences.metadata.sizeChange))}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">版本间隔:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {Math.round(comparisonResult.differences.metadata.timeSpan / (1000 * 60 * 60 * 24))} 天
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                关闭
              </button>
              {comparisonResult && (
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  导出对比报告
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}