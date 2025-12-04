'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types/project';
import { useDataImportExport, ImportExportOptions, generateImportTemplate } from '@/hooks/useDataImportExport';

interface DataImportExportProps {
  project: Project;
  onImportComplete?: (data: Partial<Project>) => void;
  className?: string;
}

export default function DataImportExport({ project, onImportComplete, className = '' }: DataImportExportProps) {
  const [activeMode, setActiveMode] = useState<'export' | 'import' | null>(null);
  const [exportOptions, setExportOptions] = useState<ImportExportOptions>({
    includeBasicInfo: true,
    includeCompetitors: true,
    includeTargetAudience: true,
    format: 'json'
  });
  const [importOptions, setImportOptions] = useState<ImportExportOptions>({
    includeBasicInfo: true,
    includeCompetitors: true,
    includeTargetAudience: true,
    format: 'json'
  });
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { exportData, importData, isExporting, isImporting } = useDataImportExport();

  const handleExport = async () => {
    try {
      await exportData(project, exportOptions);
      setActiveMode(null);
    } catch (error) {
      alert('导出失败: ' + (error as Error).message);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importData(file, importOptions);
    setImportResult(result);

    if (result.success && result.data && onImportComplete) {
      onImportComplete(result.data);
    }
  };

  const downloadTemplate = () => {
    generateImportTemplate(importOptions);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 主要操作按钮 */}
      <div className="flex items-center justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode('export')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>📤</span>
          <span>导出数据</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode('import')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>📥</span>
          <span>导入数据</span>
        </motion.button>
      </div>

      {/* 导出界面 */}
      <AnimatePresence>
        {activeMode === 'export' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">导出项目数据</h3>
              <button
                onClick={() => setActiveMode(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 导出选项 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">选择导出内容</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBasicInfo}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeBasicInfo: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">📋 基础信息</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCompetitors}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeCompetitors: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">🏢 竞品信息</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTargetAudience}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeTargetAudience: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">👥 目标客群</span>
                  </label>
                </div>
              </div>

              {/* 导出格式 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">选择导出格式</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="json"
                      checked={exportOptions.format === 'json'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700">JSON 格式</span>
                      <p className="text-xs text-gray-500">完整数据结构，推荐用于备份</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportOptions.format === 'csv'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700">CSV 格式</span>
                      <p className="text-xs text-gray-500">适合 Excel 等表格软件</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="excel"
                      checked={exportOptions.format === 'excel'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm text-gray-700">Excel 格式</span>
                      <p className="text-xs text-gray-500">多工作表结构（即将支持）</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActiveMode(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExporting && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border border-white border-t-transparent rounded-full"
                  />
                )}
                <span>{isExporting ? '导出中...' : '开始导出'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 导入界面 */}
      <AnimatePresence>
        {activeMode === 'import' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">导入项目数据</h3>
              <button
                onClick={() => setActiveMode(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 导入选项 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">导入设置</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={importOptions.includeBasicInfo}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, includeBasicInfo: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">📋 覆盖基础信息</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={importOptions.includeCompetitors}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, includeCompetitors: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">🏢 覆盖竞品信息</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={importOptions.includeTargetAudience}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, includeTargetAudience: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">👥 覆盖目标客群</span>
                  </label>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">
                    ⚠️ 导入数据将覆盖当前选中的部分，请确保已备份重要数据
                  </p>
                </div>
              </div>

              {/* 文件上传区域 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">选择文件</h4>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {isImporting ? (
                    <div className="flex flex-col items-center space-y-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full"
                      />
                      <p className="text-sm text-gray-600">处理文件中...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📁</div>
                      <p className="text-sm text-gray-600">点击选择文件或拖拽文件到此处</p>
                      <p className="text-xs text-gray-500">支持 JSON、CSV、Excel 格式</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full px-4 py-2 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                >
                  📥 下载导入模板
                </button>
              </div>
            </div>

            {/* 导入结果 */}
            <AnimatePresence>
              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 pt-4 border-t border-gray-200"
                >
                  {importResult.success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-600">✅</span>
                        <span className="font-medium text-green-800">导入成功</span>
                      </div>
                      {importResult.warnings && importResult.warnings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-green-700 mb-1">注意事项:</p>
                          <ul className="text-xs text-green-600 space-y-1">
                            {importResult.warnings.map((warning: string, index: number) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-red-600">❌</span>
                        <span className="font-medium text-red-800">导入失败</span>
                      </div>
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-2">
                          <ul className="text-sm text-red-600 space-y-1">
                            {importResult.errors.map((error: string, index: number) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setActiveMode(null);
                  setImportResult(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 使用说明</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>导出</strong>: 将当前项目数据保存为文件，用于备份或迁移</p>
          <p>• <strong>导入</strong>: 从文件中恢复项目数据，可选择性覆盖特定部分</p>
          <p>• <strong>格式支持</strong>: JSON（完整数据）、CSV（表格数据）、Excel（即将支持）</p>
          <p>• <strong>安全提示</strong>: 导入前请确保已备份当前重要数据</p>
        </div>
      </div>
    </div>
  );
}