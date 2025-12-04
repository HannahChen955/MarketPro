#!/usr/bin/env node

/**
 * 通义千问 API 测试脚本
 * 用于验证 API Key 配置是否正确
 */

const https = require('https');
require('dotenv').config({ path: './.env.local' });

const API_KEY = process.env.QWEN_API_KEY;
const API_BASE = process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/api/v1';
const MODEL = process.env.QWEN_MODEL || 'qwen-max';

console.log('🧪 通义千问 API 测试');
console.log('====================\n');

if (!API_KEY) {
  console.error('❌ 错误: 未找到 QWEN_API_KEY');
  console.log('请确保在 .env.local 文件中配置了正确的 API Key\n');
  console.log('配置方法:');
  console.log('1. 复制 .env.example 为 .env.local');
  console.log('2. 编辑 .env.local，填入你的 QWEN_API_KEY');
  console.log('3. 重新运行此脚本');
  process.exit(1);
}

console.log(`📍 API 端点: ${API_BASE}`);
console.log(`🤖 模型: ${MODEL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 5)}\n`);

// 测试数据
const testData = {
  model: MODEL,
  input: {
    messages: [
      {
        role: 'user',
        content: '你好，请简单介绍一下你自己。'
      }
    ]
  },
  parameters: {
    result_format: 'message'
  }
};

console.log('🔄 正在测试 API 连接...\n');

const postData = JSON.stringify(testData);

const options = {
  hostname: new URL(API_BASE).hostname,
  port: 443,
  path: '/services/aigc/text-generation/generation',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ API 连接成功！');
        console.log('\n📤 发送内容:', testData.input.messages[0].content);
        console.log('📥 AI 回复:');
        
        if (response.output && response.output.choices && response.output.choices[0]) {
          const reply = response.output.choices[0].message.content;
          console.log(`💬 ${reply}\n`);
          
          console.log('🎉 通义千问 API 配置成功！');
          console.log('现在你可以在 MarketPro AI 中使用通义千问了。');
        } else {
          console.log('⚠️  API 响应格式异常，但连接成功');
          console.log('响应数据:', JSON.stringify(response, null, 2));
        }
      } else {
        console.error(`❌ API 请求失败 (状态码: ${res.statusCode})`);
        console.error('错误信息:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 401) {
          console.log('\n🔧 解决方案:');
          console.log('- 检查 API Key 是否正确');
          console.log('- 确认 API Key 未过期');
          console.log('- 确认账号有调用权限');
        } else if (res.statusCode === 429) {
          console.log('\n🔧 解决方案:');
          console.log('- API 调用频率过高，请稍后重试');
          console.log('- 检查账号套餐限制');
        } else if (res.statusCode === 400) {
          console.log('\n🔧 解决方案:');
          console.log('- 检查模型名称是否正确');
          console.log('- 确认请求参数格式');
        }
      }
    } catch (error) {
      console.error('❌ 解析响应失败:', error.message);
      console.error('原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 网络请求失败:', error.message);
  
  console.log('\n🔧 解决方案:');
  console.log('- 检查网络连接');
  console.log('- 确认防火墙设置');
  console.log('- 尝试更换网络环境');
});

req.write(postData);
req.end();

// 设置超时
setTimeout(() => {
  console.error('⏰ 请求超时');
  process.exit(1);
}, 15000);
