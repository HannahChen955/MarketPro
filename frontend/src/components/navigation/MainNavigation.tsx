'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Menu,
  X,
  Home,
  FolderKanban,
  Eye,
  FileText,
  Search,
  Zap,
  Plus,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    label: '首页',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    description: '返回主页'
  },
  {
    label: '系统能力',
    href: '/showcase',
    icon: <Eye className="w-5 h-5" />,
    description: '了解MarketPro的完整能力'
  },
  {
    label: '项目管理',
    href: '/projects',
    icon: <FolderKanban className="w-5 h-5" />,
    description: '管理您的房地产项目'
  },
  {
    label: '创建报告',
    href: '/reports/create',
    icon: <FileText className="w-5 h-5" />,
    description: '快速创建新的营销报告'
  },
  {
    label: '联系我们',
    href: '/contact',
    icon: <Mail className="w-5 h-5" />,
    description: '联系MarketPro团队'
  }
];

const quickActions = [
  {
    label: '新建项目',
    href: '/projects?action=create',
    icon: <Plus className="w-4 h-4" />,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
    onboardingId: 'create-project-btn'
  },
  {
    label: 'AI 分析',
    href: '/reports/create?type=ai-analysis',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    onboardingId: 'ai-assistant-btn'
  }
];

export function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200" data-onboarding="main-navigation">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <BarChart3 className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80"></div>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                MarketPro
              </span>
              <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }
                `}
                title={item.description}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Actions & Search */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="搜索项目..."
                    className="w-32 sm:w-40 md:w-48 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="搜索项目"
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  size="sm"
                  className={`${action.color} text-white shadow-sm`}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Search on mobile */}
              <div className="px-2 mb-4">
                <input
                  type="text"
                  placeholder="搜索项目..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Navigation items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {item.icon}
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              ))}

              {/* Quick actions on mobile */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        className={`w-full justify-start ${action.color} text-white`}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}