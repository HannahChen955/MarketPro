import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AppLayout } from '@/components/navigation/AppLayout';
import { OnboardingProvider, OnboardingTour } from '@/components/onboarding';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MarketPro AI - 智能房地产营销报告生成平台',
  description: '使用 AI 技术自动化房地产市场分析和报告生成',
  keywords: ['房地产', 'AI', '报告生成', '市场分析', '营销'],
  authors: [{ name: 'MarketPro Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <OnboardingProvider>
              <div id="app-root">
                <AppLayout>
                  {children}
                </AppLayout>
                <OnboardingTour />
              </div>
            </OnboardingProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}