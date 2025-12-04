'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            联系
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              MarketPro
            </span>
            团队
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们专业的团队随时为您提供房地产营销分析服务支持，让我们一起探讨如何用AI技术提升您的业务效率
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                联系方式
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">邮箱</h3>
                    <p className="text-gray-600">contact@marketpro.ai</p>
                    <p className="text-gray-600">support@marketpro.ai</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">客服热线</h3>
                    <p className="text-gray-600">400-888-0001</p>
                    <p className="text-gray-600">021-6888-0001</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">办公地址</h3>
                    <p className="text-gray-600">
                      上海市浦东新区<br />
                      陆家嘴环路1000号<br />
                      恒生银行大厦25楼
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">服务时间</h3>
                    <p className="text-gray-600">
                      周一至周五: 9:00 - 18:00<br />
                      周末: 10:00 - 17:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Highlights */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">团队优势</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-600">10+年房地产行业经验</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">专业AI技术团队</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">24/7客户服务支持</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {!isSubmitted ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    留下您的联系方式
                  </h2>
                  <p className="text-gray-600 mb-8">
                    填写下面的表单，我们的专业团队将在24小时内与您取得联系，为您提供个性化的房地产营销解决方案
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          姓名 *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="请输入您的姓名"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱 *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="请输入您的邮箱"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司名称
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="请输入您的公司名称"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          联系电话
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="请输入您的联系电话"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        咨询主题
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">请选择咨询主题</option>
                        <option value="product-demo">产品演示</option>
                        <option value="pricing">价格咨询</option>
                        <option value="technical-support">技术支持</option>
                        <option value="partnership">合作洽谈</option>
                        <option value="custom-solution">定制解决方案</option>
                        <option value="other">其他问题</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        详细描述 *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="请详细描述您的需求或问题，我们将为您提供专业的解决方案"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          发送中...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="mr-2 h-5 w-5" />
                          发送消息
                        </div>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    感谢您的联系！
                  </h3>
                  <p className="text-gray-600 mb-8">
                    我们已收到您的消息，我们的专业团队将在24小时内与您取得联系。
                    在此期间，您也可以查看我们的系统能力展示或直接开始体验产品功能。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      发送新消息
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/showcase'}
                      className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3"
                    >
                      查看系统能力
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              准备开始您的AI营销之旅？
            </h2>
            <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
              立即体验MarketPro强大的房地产营销分析功能，让专业的AI助手为您的项目创造更大价值
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/projects'}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                免费开始体验
              </Button>
              <Button
                onClick={() => window.location.href = '/showcase'}
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg"
              >
                查看产品演示
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}