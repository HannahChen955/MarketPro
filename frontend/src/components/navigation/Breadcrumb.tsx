'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb items if not provided
  const defaultItems = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: '首页', href: '/', icon: <Home className="w-4 h-4" /> }
    ];

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Generate labels based on path segments
      let label = segment;

      // Handle special cases
      if (segment === 'projects') {
        label = '项目管理';
      } else if (segment === 'showcase') {
        label = '系统能力展示';
      } else if (segment === 'reports') {
        label = '报告';
      } else if (segment === 'create') {
        label = '创建';
      } else if (segment.startsWith('phase-')) {
        const phaseNumber = segment.split('-')[1];
        const phaseNames = {
          '1': '拿地前可研',
          '2': '产品定位',
          '3': '开盘节点',
          '4': '运营期',
          '5': '外部合作'
        };
        label = `阶段${phaseNumber}: ${phaseNames[phaseNumber as keyof typeof phaseNames] || '未知'}`;
      } else if (segment === 'overall-marketing-strategy') {
        label = '整体营销策略';
      } else if (segment === 'competitor-analysis') {
        label = '竞品分析';
      } else if (segment === 'database') {
        label = '数据库';
      } else if (segment === 'workflow') {
        label = '工作流程';
      } else if (/^[a-f0-9-]{36}$/i.test(segment)) {
        // UUID pattern - likely a project ID
        label = '项目详情';
      }

      breadcrumbItems.push({
        label,
        href: currentPath
      });
    });

    return breadcrumbItems;
  }, [pathname]);

  const finalItems = items || defaultItems;

  if (finalItems.length <= 1) {
    return null; // Don't show breadcrumb if only home
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      {finalItems.map((item, index) => {
        const isLast = index === finalItems.length - 1;

        return (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}

            {isLast ? (
              <span className="flex items-center gap-1 text-gray-900 font-medium">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}