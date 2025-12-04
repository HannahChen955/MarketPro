'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';

export default function AIAssistantDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testAPICall = async () => {
    setLoading(true);
    setLogs([]);

    try {
      addLog('🚀 开始AI助手API调试测试');

      // 1. 检查BASE_URL
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9527';
      addLog(`📍 API Base URL: ${BASE_URL}`);

      // 2. 准备测试数据
      const testMessage = '你好，这是一个调试测试消息';
      const requestData = {
        message: testMessage,
        requestType: 'chat' as const,
        temperature: 0.7,
        maxTokens: 1200,
        context: { source: 'debug_test' }
      };

      addLog(`📤 发送请求数据: ${JSON.stringify(requestData, null, 2)}`);

      // 3. 调用API
      addLog('🔄 正在调用 /api/ai/chat...');

      const startTime = performance.now();
      const response = await api.post('/api/ai/chat', requestData);
      const endTime = performance.now();

      addLog(`⏱️ 请求耗时: ${Math.round(endTime - startTime)}ms`);
      addLog(`📥 响应状态: ${response ? '成功' : '失败'}`);
      addLog(`📥 响应数据: ${JSON.stringify(response, null, 2)}`);

      if (response.success) {
        addLog('✅ AI助手API调用成功！');
        addLog(`🤖 AI回复: ${response.data?.message || '无回复内容'}`);
      } else {
        addLog(`❌ API调用失败: ${response.error || '未知错误'}`);
      }

    } catch (error) {
      addLog(`💥 调用过程中发生异常:`);
      addLog(`错误类型: ${error.constructor.name}`);
      addLog(`错误信息: ${error.message}`);
      addLog(`错误堆栈: ${error.stack}`);

      // 检查是否是网络错误
      if (error.message.includes('fetch')) {
        addLog('🌐 这看起来是网络连接问题');
        addLog('请检查:');
        addLog('1. 后端服务是否在 http://localhost:9527 运行');
        addLog('2. 是否存在CORS问题');
        addLog('3. 防火墙或代理设置');
      }
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    try {
      addLog('🔍 测试健康检查端点...');
      const response = await api.get('/api/ai/health');
      addLog(`🏥 健康检查结果: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addLog(`❌ 健康检查失败: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-red-500 rounded-lg shadow-xl p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-red-600">🔧 AI助手调试工具</h3>
        <button
          onClick={() => {
            const debugPanel = document.getElementById('ai-debug-panel');
            if (debugPanel) debugPanel.style.display = 'none';
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <Button
          onClick={testAPICall}
          disabled={loading}
          className="w-full"
        >
          {loading ? '🔄 测试中...' : '🧪 测试AI聊天API'}
        </Button>

        <Button
          onClick={testHealthCheck}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          🏥 测试健康检查
        </Button>

        <Button
          onClick={clearLogs}
          variant="outline"
          className="w-full"
        >
          🗑️ 清除日志
        </Button>
      </div>

      <div className="border rounded p-3 h-64 overflow-y-auto bg-gray-50 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500">点击测试按钮开始调试...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 break-words">
              {log}
            </div>
          ))
        )}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        💡 如果看到错误，请复制日志内容并检查具体问题
      </div>
    </div>
  );
}

// 全局调试函数，可以在浏览器控制台调用
if (typeof window !== 'undefined') {
  window.showAIDebugPanel = () => {
    const existingPanel = document.getElementById('ai-debug-panel');
    if (existingPanel) {
      existingPanel.style.display = 'block';
    } else {
      // 如果面板不存在，提示用户如何添加
      console.log('请在页面上添加 <AIAssistantDebug /> 组件');
    }
  };
}