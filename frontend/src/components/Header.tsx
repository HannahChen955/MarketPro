'use client';

import { Search, Bell, User, Upload, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：Logo和标题 */}
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MarketPro AI</h1>
                <p className="text-xs text-gray-500">智能房地产营销报告生成平台</p>
              </div>
            </motion.div>
          </div>

          {/* 中间：搜索框 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="搜索报告类型..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                         bg-white/50 backdrop-blur-sm placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-3">
            {/* 上传分析按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">上传分析</span>
            </motion.button>

            {/* 通知按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {/* 通知红点 */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </motion.button>

            {/* 设置按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* 用户头像 */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  用户
                </span>
              </motion.button>

              {/* 用户下拉菜单 */}
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2"
                >
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    个人资料
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    使用统计
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    偏好设置
                  </a>
                  <hr className="my-2" />
                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    退出登录
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* 快速导航 */}
        <div className="flex items-center gap-6 mt-4 border-t border-gray-100 pt-3">
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
              报告生成
            </a>
            <a href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              模板管理
            </a>
            <a href="/history" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              历史记录
            </a>
            <a href="/analytics" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              使用分析
            </a>
          </nav>

          <div className="flex-1"></div>

          {/* 快速状态 */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>系统正常</span>
            </div>
            <div>
              今日已生成 <span className="font-medium text-gray-700">12</span> 份报告
            </div>
          </div>
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}