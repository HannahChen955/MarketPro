'use client';

import React from 'react';
import { MainNavigation } from './MainNavigation';
import { Breadcrumb } from './Breadcrumb';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Pages that should not show navigation (like the homepage with its own header)
const NO_NAV_PAGES = ['/'];

// Pages that should not show breadcrumbs
const NO_BREADCRUMB_PAGES = ['/', '/projects', '/showcase'];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const showNavigation = !NO_NAV_PAGES.includes(pathname);
  const showBreadcrumb = !NO_BREADCRUMB_PAGES.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation */}
      {showNavigation && <MainNavigation />}

      {/* Main Content */}
      <main className={`${showNavigation ? '' : ''}`}>
        {/* Breadcrumb Navigation */}
        {showBreadcrumb && showNavigation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Breadcrumb />
          </div>
        )}

        {/* Page Content */}
        <div className={`${showBreadcrumb && showNavigation ? '' : ''}`}>
          {children}
        </div>
      </main>

      {/* Quick Access Floating Menu (for deep pages) */}
      {pathname.includes('/projects/') && pathname.split('/').length > 3 && (
        <QuickAccessMenu />
      )}
    </div>
  );
}

// Quick access floating menu for project pages
function QuickAccessMenu() {
  const pathname = usePathname();

  // Extract project ID from URL
  const projectId = pathname.split('/')[2];

  if (!projectId) return null;

  const quickLinks = [
    { label: '项目概览', href: `/projects/${projectId}` },
    { label: '阶段1', href: `/projects/${projectId}/phase-1` },
    { label: '阶段2', href: `/projects/${projectId}/phase-2` },
    { label: '阶段3', href: `/projects/${projectId}/phase-3` },
    { label: '阶段4', href: `/projects/${projectId}/phase-4` },
    { label: '阶段5', href: `/projects/${projectId}/phase-5` },
    { label: '数据库', href: `/projects/${projectId}/database` }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="text-sm font-medium text-gray-900 mb-2">项目快捷导航</div>
        <div className="space-y-1">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`
                block px-3 py-2 text-xs rounded-lg transition-colors
                ${pathname === link.href
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }
              `}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}