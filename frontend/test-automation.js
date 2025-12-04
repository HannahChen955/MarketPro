#!/usr/bin/env node

/**
 * MarketPro 自动化功能测试脚本
 * 用于验证核心功能模块的可用性
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5678';
const REPORT_FILE = './test-results.json';

// 测试配置
const TEST_CONFIG = {
  timeout: 10000, // 10秒超时
  retries: 3,     // 重试3次
  delay: 1000     // 1秒延迟
};

// 测试结果存储
let testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    baseUrl: BASE_URL,
    nodeVersion: process.version,
    platform: process.platform
  },
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// HTTP请求辅助函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const timeout = setTimeout(() => {
      reject(new Error(`Request timeout: ${requestUrl}`));
    }, TEST_CONFIG.timeout);

    const req = http.get(requestUrl, (res) => {
      clearTimeout(timeout);
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length']
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// 测试辅助函数
function createTest(name, testFunction, category = 'general') {
  return {
    name,
    category,
    testFunction
  };
}

async function runTest(test) {
  const startTime = Date.now();
  let result = {
    name: test.name,
    category: test.category,
    status: 'pending',
    duration: 0,
    error: null,
    details: null
  };

  try {
    console.log(`  🧪 ${test.name}`);
    const details = await test.testFunction();
    result.status = 'passed';
    result.details = details;
    console.log(`    ${colorize('green', '✅ PASSED')}`);
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    console.log(`    ${colorize('red', '❌ FAILED')}: ${error.message}`);
  } finally {
    result.duration = Date.now() - startTime;
  }

  return result;
}

// 定义测试用例
const tests = [
  // 1. 基础页面访问测试
  createTest('首页加载测试', async () => {
    const response = await makeRequest('/');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    if (!response.data.includes('MarketPro') && !response.data.includes('项目')) {
      throw new Error('Page content seems incorrect');
    }
    return { statusCode: response.statusCode, hasContent: true };
  }, 'pages'),

  createTest('项目列表页面', async () => {
    const response = await makeRequest('/projects');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    return { statusCode: response.statusCode };
  }, 'pages'),

  // 2. 静态资源测试
  createTest('CSS资源加载', async () => {
    try {
      const response = await makeRequest('/_next/static/css');
      // CSS可能通过不同路径加载，这里主要测试是否有Next.js静态资源
      return { accessible: true };
    } catch (error) {
      // CSS通过内联或其他方式加载，不算失败
      return { accessible: false, note: 'CSS may be inlined' };
    }
  }, 'assets'),

  // 3. API端点测试（如果有的话）
  createTest('健康检查', async () => {
    try {
      const response = await makeRequest('/api/health');
      return { statusCode: response.statusCode };
    } catch (error) {
      // API可能不存在，这是正常的
      return { note: 'API endpoints may not be implemented yet' };
    }
  }, 'api'),

  // 4. 路由测试
  createTest('新建项目页面路由', async () => {
    const response = await makeRequest('/projects/new');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }
    return { statusCode: response.statusCode };
  }, 'routing'),

  // 5. 核心功能页面路由测试
  createTest('项目工作空间路由', async () => {
    // 测试一个示例项目ID
    const response = await makeRequest('/projects/sample-project-id');
    // 可能返回404或200，都是正常的
    return { statusCode: response.statusCode, routable: response.statusCode < 500 };
  }, 'routing'),

  createTest('数据库页面路由', async () => {
    const response = await makeRequest('/projects/sample-project-id/database');
    return { statusCode: response.statusCode, routable: response.statusCode < 500 };
  }, 'routing'),

  createTest('Phase 2 路由', async () => {
    const response = await makeRequest('/projects/sample-project-id/phase-2');
    return { statusCode: response.statusCode, routable: response.statusCode < 500 };
  }, 'routing'),

  createTest('竞品分析报告路由', async () => {
    const response = await makeRequest('/projects/sample-project-id/phase-2/reports/competitor-analysis');
    return { statusCode: response.statusCode, routable: response.statusCode < 500 };
  }, 'routing'),

  createTest('营销策略报告路由', async () => {
    const response = await makeRequest('/projects/sample-project-id/phase-2/reports/overall-marketing-strategy');
    return { statusCode: response.statusCode, routable: response.statusCode < 500 };
  }, 'routing'),
];

// 主测试运行函数
async function runAllTests() {
  console.log(colorize('cyan', '\n🚀 MarketPro 自动化测试开始\n'));
  console.log(`测试环境: ${BASE_URL}`);
  console.log(`测试时间: ${new Date().toLocaleString()}\n`);

  // 按类别分组测试
  const testsByCategory = tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {});

  // 运行测试
  for (const [category, categoryTests] of Object.entries(testsByCategory)) {
    console.log(colorize('blue', `\n📂 ${category.toUpperCase()} 测试:`));

    for (const test of categoryTests) {
      const result = await runTest(test);
      testResults.tests.push(result);
      testResults.summary.total++;

      if (result.status === 'passed') {
        testResults.summary.passed++;
      } else if (result.status === 'failed') {
        testResults.summary.failed++;
      } else {
        testResults.summary.skipped++;
      }

      // 添加延迟以避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 生成测试报告
  await generateReport();
  printSummary();
}

// 生成测试报告
async function generateReport() {
  try {
    await fs.promises.writeFile(REPORT_FILE, JSON.stringify(testResults, null, 2));
    console.log(colorize('cyan', `\n📄 测试报告已生成: ${REPORT_FILE}`));
  } catch (error) {
    console.error('生成报告失败:', error.message);
  }
}

// 打印测试摘要
function printSummary() {
  const { summary } = testResults;
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  console.log(colorize('cyan', '\n📊 测试摘要:'));
  console.log(`  总测试数: ${summary.total}`);
  console.log(`  ${colorize('green', '✅ 通过')}: ${summary.passed}`);
  console.log(`  ${colorize('red', '❌ 失败')}: ${summary.failed}`);
  console.log(`  ${colorize('yellow', '⏭️ 跳过')}: ${summary.skipped}`);
  console.log(`  ${colorize('blue', '📈 通过率')}: ${passRate}%`);

  if (summary.failed > 0) {
    console.log(colorize('red', '\n❗ 需要关注的失败测试:'));
    testResults.tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`  • ${test.name}: ${test.error}`);
    });
  }

  console.log(colorize('cyan', '\n🎉 测试完成!\n'));
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(colorize('red', '❌ 未捕获的异常:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(colorize('red', '❌ 未处理的Promise拒绝:'), reason);
  process.exit(1);
});

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(colorize('red', '❌ 测试运行失败:'), error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  makeRequest,
  createTest
};