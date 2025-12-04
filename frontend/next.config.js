/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no need for experimental.appDir
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9527',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9527'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;