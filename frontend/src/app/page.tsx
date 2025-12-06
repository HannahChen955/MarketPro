'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp, Target, Zap, Eye, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">MarketPro AI</span>
            </div>
            <Link href="/projects">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                进入项目管理
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* 产品定位标签 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs sm:text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            房地产营销全流程智能化解决方案
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6">
            重新定义
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              房地产营销
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            从拿地可研到运营管理，MarketPro 运用前沿AI技术，为房地产项目全生命周期提供
            <span className="font-semibold text-indigo-600">智能化数据分析</span>和
            <span className="font-semibold text-purple-600">专业营销策略</span>
          </p>

          {/* 价值主张亮点 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">5分钟生成专业报告</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">覆盖营销全流程</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">AI智能分析</span>
            </div>
          </div>


          {/* 信任信号 */}
          <p className="text-sm text-gray-500">
            已为<span className="font-semibold text-indigo-600">100+</span>个房地产项目提供专业分析服务
          </p>
        </motion.div>

        {/* System Capabilities Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
                  <Eye className="w-8 h-8" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                探索完整的房地产营销解决方案
              </h2>

              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                深入了解从拿地可研到运营管理的五个关键阶段，看看MarketPro如何为每个环节提供专业支持
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm font-medium">拿地可研</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="text-sm font-medium">产品定位</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-sm font-medium">开盘节点</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-sm font-medium">运营期</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="text-sm font-medium">外部合作</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/showcase">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    <Layers className="mr-2 h-5 w-5" />
                    查看系统能力展示
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button
                    className="border border-white bg-transparent text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-medium"
                  >
                    直接开始体验
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 核心特性介绍 */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择 MarketPro？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们深耕房地产行业多年，深度理解每个营销环节的痛点，用AI技术重新定义行业标准
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 特性卡片1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能市场分析</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AI深度分析区域市场数据，精准识别投资机会和风险点，为决策提供科学依据
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>房价趋势预测</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>供需平衡分析</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>政策影响评估</span>
                </li>
              </ul>
            </motion.div>

            {/* 特性卡片2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">精准竞品研究</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                全方位竞品分析体系，深度挖掘市场空白点，制定差异化竞争策略
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>产品定位对比</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>营销策略分析</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>客群画像研究</span>
                </li>
              </ul>
            </motion.div>

            {/* 特性卡片3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">一键报告生成</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                5分钟生成专业级营销报告，覆盖全流程分析，让专业变得简单高效
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>可研报告生成</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>营销方案制定</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>数据可视化</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* 行业数据展示 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-white"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">值得信赖的行业数据</h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                真实的使用数据，证明MarketPro在房地产营销领域的专业能力
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">100+</div>
                <div className="text-gray-300 text-sm">服务项目</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-300 text-sm">客户满意度</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">5min</div>
                <div className="text-gray-300 text-sm">报告生成时间</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-gray-300 text-sm">智能服务</div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <span className="ml-2 text-lg font-semibold">MarketPro AI</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            © 2024 MarketPro AI. 专业的房地产市场分析平台
          </p>
        </div>
      </footer>
    </div>
  );
}