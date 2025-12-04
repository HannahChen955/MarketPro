'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadSingleFile, generateShareLink, type DownloadableReport } from '@/utils/downloadUtils';

interface ReportShareDialogProps {
  report: DownloadableReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportShareDialog({ report, isOpen, onClose }: ReportShareDialogProps) {
  const [shareSettings, setShareSettings] = useState({
    expiryDays: 7,
    password: '',
    allowDownload: true,
    allowComments: true
  });
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const url = await generateShareLink(report.id, {
        expiryDays: shareSettings.expiryDays,
        password: shareSettings.password || undefined,
        allowDownload: shareSettings.allowDownload
      });
      setShareUrl(url);
    } catch (error) {
      console.error('生成分享链接失败:', error);
      alert('生成分享链接失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  const handleDirectDownload = async () => {
    try {
      await downloadSingleFile(report);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  const expiryOptions = [
    { value: 1, label: '1天' },
    { value: 3, label: '3天' },
    { value: 7, label: '7天' },
    { value: 14, label: '14天' },
    { value: 30, label: '30天' },
    { value: 0, label: '永久' }
  ];

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
            className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">分享报告</h2>
                <p className="text-gray-600 mt-1">{report.title}</p>
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
            <div className="p-6 space-y-6">
              {/* 快速操作 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDirectDownload}
                  className="flex items-center justify-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-blue-700 font-medium">直接下载</span>
                </button>

                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="flex items-center justify-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-green-700 font-medium">
                    {isGenerating ? '生成中...' : '生成分享链接'}
                  </span>
                </button>
              </div>

              {/* 分享设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">分享设置</h3>

                {/* 过期时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    链接有效期
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expiryOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setShareSettings(prev => ({ ...prev, expiryDays: option.value }))}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          shareSettings.expiryDays === option.value
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 访问密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    访问密码（可选）
                  </label>
                  <input
                    type="password"
                    value={shareSettings.password}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="留空表示不设置密码"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* 权限设置 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    权限设置
                  </label>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900">允许下载</span>
                      <p className="text-xs text-gray-600">用户可以下载报告文件</p>
                    </div>
                    <button
                      onClick={() => setShareSettings(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareSettings.allowDownload ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shareSettings.allowDownload ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-900">允许评论</span>
                      <p className="text-xs text-gray-600">用户可以添加评论和反馈</p>
                    </div>
                    <button
                      onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareSettings.allowComments ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shareSettings.allowComments ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 分享链接结果 */}
              {shareUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <h4 className="text-sm font-semibold text-green-900 mb-3">分享链接生成成功！</h4>

                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        copySuccess
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {copySuccess ? '已复制!' : '复制'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-green-700">
                    <span>📅 有效期：{shareSettings.expiryDays === 0 ? '永久' : `${shareSettings.expiryDays}天`}</span>
                    {shareSettings.password && <span>🔒 已设置密码</span>}
                    {shareSettings.allowDownload && <span>📥 允许下载</span>}
                    {shareSettings.allowComments && <span>💬 允许评论</span>}
                  </div>
                </motion.div>
              )}

              {/* 分享提示 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 分享提示</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 分享链接支持在微信、邮件等各种平台使用</li>
                  <li>• 设置密码可以提高分享安全性</li>
                  <li>• 您可以随时撤销分享链接的访问权限</li>
                  <li>• 支持查看访问统计和下载记录</li>
                </ul>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              {!shareUrl && (
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : '生成分享链接'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}