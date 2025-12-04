'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Tabs Context
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Tabs Root Component
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue = '',
  value,
  onValueChange,
  children,
  className
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  const contextValue = {
    activeTab: value || activeTab,
    setActiveTab: handleTabChange
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tabs List Component
interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
        className
      )}
    >
      {children}
    </div>
  );
}

// Tabs Trigger Component
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled = false }: TabsTriggerProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-white text-gray-950 shadow-sm'
          : 'text-gray-600 hover:text-gray-900',
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// Tabs Content Component
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  );
}

// Export types
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };