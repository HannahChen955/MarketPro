/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 编译器以提高构建性能
  swcMinify: true,

  // 启用实验性功能
  experimental: {
    // 启用 App Router
    appDir: true,

    // 启用 Server Components
    serverComponents: true,

    // 启用并发特性
    concurrentFeatures: true,

    // 启用 Turbo 模式（更快的开发构建）
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },

    // 启用增量静态再生
    incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),

    // 优化图片处理
    images: {
      allowFutureImage: true,
    },
  },

  // 编译器配置
  compiler: {
    // 移除控制台日志（生产环境）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,

    // 启用 React 编译器优化
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$']
    } : false,

    // 启用样式优化
    styledComponents: true,
  },

  // 图片优化配置
  images: {
    // 启用图片优化
    optimizeSizes: true,

    // 支持的图片格式
    formats: ['image/webp', 'image/avif'],

    // 图片尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 图片质量
    quality: 80,

    // 允许的域名
    domains: [
      'localhost',
      'example.com', // 替换为实际的图片 CDN 域名
    ],

    // 危险地允许 SVG 优化
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // 自定义加载器（如果使用 CDN）
    // loader: 'custom',
    // loaderFile: './image-loader.js',
  },

  // 输出配置
  output: 'standalone',

  // 压缩配置
  compress: true,

  // 生产优化
  productionBrowserSourceMaps: false,

  // 重定向配置
  async redirects() {
    return [
      // 重定向配置示例
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack 配置优化
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // 生产环境优化
    if (!dev) {
      // 代码分割优化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          // React 相关库单独打包
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 15,
          },
          // UI 组件库单独打包
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 12,
          },
          // 工具库单独打包
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|clsx)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 8,
          },
        },
      };

      // 压缩配置
      config.optimization.minimize = true;

      // 模块合并
      config.optimization.concatenateModules = true;

      // 副作用标记
      config.optimization.sideEffects = false;
    }

    // 别名配置
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // 忽略某些模块以减小包大小
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    // SVG 处理
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });

    // 字体优化
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
          esModule: false,
        },
      },
    });

    // Bundle 分析（开发环境）
    if (dev && process.env.ANALYZE) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analyzer-report.html',
        })
      );
    }

    return config;
  },

  // 环境变量
  env: {
    // 自定义环境变量
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 打包输出信息
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 严格模式
  reactStrictMode: true,

  // 电源偏好（开发环境性能优化）
  poweredByHeader: false,

  // 生产环境 source map
  generateBuildId: async () => {
    // 可以返回任何字符串值，用于构建 ID
    return 'my-build-id'
  },

  // 配置 basePath（如果部署在子路径）
  // basePath: '/my-app',

  // 配置 assetPrefix（如果使用 CDN）
  // assetPrefix: 'https://cdn.example.com',

  // 配置 trailingSlash
  trailingSlash: false,

  // ESLint 配置
  eslint: {
    // 生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // TypeScript 配置
  typescript: {
    // 生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // 国际化配置
  i18n: {
    locales: ['zh-CN', 'en-US'],
    defaultLocale: 'zh-CN',
  },

  // 服务端运行时配置
  serverRuntimeConfig: {
    // 仅在服务端可用的配置
    mySecret: 'secret',
  },

  // 客户端运行时配置
  publicRuntimeConfig: {
    // 客户端和服务端都可用的配置
    staticFolder: '/static',
  },

  // 自定义 404 页面
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // 代理到后端 API
      },
    ];
  },
};

module.exports = nextConfig;