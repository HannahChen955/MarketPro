#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const gzip = require('gzip-size');
const brotli = require('brotli-size');
const chalk = require('chalk');

/**
 * Bundle 分析和优化工具
 * 分析打包输出，提供优化建议
 */
class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.staticDir = path.join(this.buildDir, 'static');
    this.results = {
      chunks: [],
      assets: [],
      totalSize: 0,
      gzipSize: 0,
      brotliSize: 0
    };
  }

  /**
   * 分析构建输出
   */
  async analyze() {
    console.log(chalk.blue('📊 开始分析 Bundle 大小...\n'));

    try {
      await this.analyzeChunks();
      await this.analyzeAssets();
      this.generateReport();
      this.provideOptimizationSuggestions();
    } catch (error) {
      console.error(chalk.red('❌ 分析失败:'), error.message);
      process.exit(1);
    }
  }

  /**
   * 分析 JavaScript 代码块
   */
  async analyzeChunks() {
    const chunksDir = path.join(this.staticDir, 'chunks');

    if (!fs.existsSync(chunksDir)) {
      console.warn(chalk.yellow('⚠️  未找到 chunks 目录，请先执行构建'));
      return;
    }

    const files = fs.readdirSync(chunksDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    for (const file of jsFiles) {
      const filePath = path.join(chunksDir, file);
      const content = fs.readFileSync(filePath);

      const size = content.length;
      const gzipSize = await gzip(content);
      const brotliSize = await brotli(content);

      this.results.chunks.push({
        name: file,
        size,
        gzipSize,
        brotliSize,
        type: this.categorizeChunk(file)
      });

      this.results.totalSize += size;
      this.results.gzipSize += gzipSize;
      this.results.brotliSize += brotliSize;
    }
  }

  /**
   * 分析静态资源
   */
  async analyzeAssets() {
    const assetsDir = path.join(this.staticDir, 'css');

    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);

      for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const content = fs.readFileSync(filePath);

        const size = content.length;
        const gzipSize = await gzip(content);

        this.results.assets.push({
          name: file,
          size,
          gzipSize,
          type: 'css'
        });
      }
    }
  }

  /**
   * 对代码块进行分类
   */
  categorizeChunk(filename) {
    if (filename.includes('react') || filename.includes('vendor')) {
      return 'vendor';
    }
    if (filename.includes('common') || filename.includes('shared')) {
      return 'shared';
    }
    if (filename.includes('main') || filename.includes('app')) {
      return 'app';
    }
    if (filename.includes('page')) {
      return 'page';
    }
    return 'other';
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * 生成分析报告
   */
  generateReport() {
    console.log(chalk.green('📋 Bundle 分析报告\n'));
    console.log(chalk.cyan('='.repeat(80)));

    // 总体统计
    console.log(chalk.bold('\n📊 总体统计:'));
    console.log(`原始大小: ${chalk.yellow(this.formatSize(this.results.totalSize))}`);
    console.log(`Gzip 压缩: ${chalk.green(this.formatSize(this.results.gzipSize))}`);
    console.log(`Brotli 压缩: ${chalk.blue(this.formatSize(this.results.brotliSize))}`);

    const compressionRatio = ((1 - this.results.gzipSize / this.results.totalSize) * 100).toFixed(1);
    console.log(`压缩率: ${chalk.magenta(compressionRatio + '%')}\n`);

    // 代码块分析
    console.log(chalk.bold('🧩 代码块分析:'));
    console.log(chalk.cyan('-'.repeat(80)));

    const sortedChunks = this.results.chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 10); // 显示前10个最大的块

    console.log(
      chalk.bold(
        '文件名'.padEnd(40) +
        '原始大小'.padEnd(12) +
        'Gzip'.padEnd(12) +
        '类型'.padEnd(10)
      )
    );
    console.log('-'.repeat(80));

    for (const chunk of sortedChunks) {
      const sizeColor = chunk.size > 100000 ? chalk.red : chunk.size > 50000 ? chalk.yellow : chalk.green;

      console.log(
        chunk.name.substring(0, 38).padEnd(40) +
        sizeColor(this.formatSize(chunk.size).padEnd(12)) +
        chalk.green(this.formatSize(chunk.gzipSize).padEnd(12)) +
        this.getTypeColor(chunk.type)(chunk.type.padEnd(10))
      );
    }

    // 按类型统计
    console.log(chalk.bold('\n📈 按类型统计:'));
    console.log(chalk.cyan('-'.repeat(40)));

    const typeStats = this.results.chunks.reduce((acc, chunk) => {
      if (!acc[chunk.type]) {
        acc[chunk.type] = { size: 0, gzipSize: 0, count: 0 };
      }
      acc[chunk.type].size += chunk.size;
      acc[chunk.type].gzipSize += chunk.gzipSize;
      acc[chunk.type].count += 1;
      return acc;
    }, {});

    Object.entries(typeStats).forEach(([type, stats]) => {
      console.log(
        `${this.getTypeColor(type)(type.padEnd(10))} ` +
        `${stats.count} 个文件 ` +
        `${this.formatSize(stats.size)} -> ${this.formatSize(stats.gzipSize)}`
      );
    });

    // CSS 文件分析
    if (this.results.assets.length > 0) {
      console.log(chalk.bold('\n🎨 CSS 文件:'));
      console.log(chalk.cyan('-'.repeat(50)));

      this.results.assets.forEach(asset => {
        console.log(
          asset.name.padEnd(30) +
          chalk.yellow(this.formatSize(asset.size).padEnd(12)) +
          chalk.green(this.formatSize(asset.gzipSize))
        );
      });
    }
  }

  /**
   * 获取类型颜色
   */
  getTypeColor(type) {
    const colors = {
      vendor: chalk.blue,
      shared: chalk.cyan,
      app: chalk.green,
      page: chalk.yellow,
      other: chalk.gray
    };
    return colors[type] || chalk.white;
  }

  /**
   * 提供优化建议
   */
  provideOptimizationSuggestions() {
    console.log(chalk.bold('\n💡 优化建议:\n'));

    const suggestions = [];

    // 检查大型 vendor 块
    const largeVendorChunks = this.results.chunks.filter(
      chunk => chunk.type === 'vendor' && chunk.size > 100000
    );

    if (largeVendorChunks.length > 0) {
      suggestions.push({
        type: '📦 代码分割',
        message: `检测到 ${largeVendorChunks.length} 个大型第三方库文件，建议进一步拆分`,
        files: largeVendorChunks.map(c => c.name)
      });
    }

    // 检查重复的依赖
    const duplicates = this.findDuplicateDependencies();
    if (duplicates.length > 0) {
      suggestions.push({
        type: '🔄 重复依赖',
        message: '检测到可能的重复依赖，考虑使用 webpack-bundle-analyzer 详细分析',
        files: duplicates
      });
    }

    // 检查压缩效率
    const lowCompressionFiles = this.results.chunks.filter(
      chunk => (chunk.gzipSize / chunk.size) > 0.7 && chunk.size > 10000
    );

    if (lowCompressionFiles.length > 0) {
      suggestions.push({
        type: '📉 压缩效率',
        message: '某些文件压缩效率较低，可能包含重复代码或需要优化',
        files: lowCompressionFiles.map(c => c.name)
      });
    }

    // 检查总包大小
    if (this.results.gzipSize > 500000) { // 500KB
      suggestions.push({
        type: '⚠️  包大小警告',
        message: 'Gzip 压缩后的总大小超过 500KB，建议进一步优化',
        files: []
      });
    }

    // 输出建议
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.type}`);
      console.log(`   ${chalk.gray(suggestion.message)}`);
      if (suggestion.files.length > 0) {
        console.log(`   ${chalk.dim('相关文件:')} ${suggestion.files.slice(0, 3).join(', ')}`);
        if (suggestion.files.length > 3) {
          console.log(`   ${chalk.dim(`等 ${suggestion.files.length} 个文件...`)}`);
        }
      }
      console.log();
    });

    if (suggestions.length === 0) {
      console.log(chalk.green('✅ 包大小看起来很健康！\n'));
    }

    // 输出优化命令
    console.log(chalk.bold('🔧 推荐的优化命令:\n'));
    console.log(chalk.cyan('# 分析详细的包结构:'));
    console.log('npm run analyze\n');
    console.log(chalk.cyan('# 检查未使用的依赖:'));
    console.log('npx depcheck\n');
    console.log(chalk.cyan('# 更新依赖到最新版本:'));
    console.log('npm update\n');
  }

  /**
   * 查找可能的重复依赖
   */
  findDuplicateDependencies() {
    // 简单的重复检测逻辑
    const chunkNames = this.results.chunks.map(c => c.name);
    const possibleDuplicates = [];

    // 检查是否有多个 vendor 块
    const vendorChunks = chunkNames.filter(name => name.includes('vendor') || name.includes('react'));
    if (vendorChunks.length > 1) {
      possibleDuplicates.push(...vendorChunks);
    }

    return possibleDuplicates;
  }

  /**
   * 保存报告到文件
   */
  async saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSize: this.results.totalSize,
        gzipSize: this.results.gzipSize,
        brotliSize: this.results.brotliSize,
        compressionRatio: (1 - this.results.gzipSize / this.results.totalSize) * 100
      },
      chunks: this.results.chunks,
      assets: this.results.assets
    };

    const reportPath = path.join(process.cwd(), 'bundle-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    console.log(chalk.green(`📄 详细报告已保存到: ${reportPath}\n`));
  }
}

// 主函数
async function main() {
  const analyzer = new BundleAnalyzer();

  try {
    await analyzer.analyze();
    await analyzer.saveReport();
  } catch (error) {
    console.error(chalk.red('分析失败:'), error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = BundleAnalyzer;