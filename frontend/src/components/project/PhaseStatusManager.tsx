'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Play,
  CheckCircle,
  SkipForward,
  ChevronDown,
  Calendar,
  Timer
} from 'lucide-react';

export type PhaseStatus = '未开始' | '进行中' | '结束' | '跳过';

interface PhaseInfo {
  id: number;
  title: string;
  description: string;
  status: PhaseStatus;
  startDate?: string;
  endDate?: string;
  estimatedDays?: number;
}

interface PhaseStatusManagerProps {
  phases: PhaseInfo[];
  onStatusChange: (phaseId: number, newStatus: PhaseStatus) => void;
  onDateChange?: (phaseId: number, startDate?: string, endDate?: string) => void;
  onEstimatedDaysChange?: (phaseId: number, estimatedDays: number) => void;
}

interface StatusConfig {
  label: PhaseStatus;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const statusConfigs: StatusConfig[] = [
  {
    label: '未开始',
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700'
  },
  {
    label: '进行中',
    icon: <Play className="w-4 h-4" />,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  {
    label: '结束',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  },
  {
    label: '跳过',
    icon: <SkipForward className="w-4 h-4" />,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  }
];

export function PhaseStatusManager({ phases, onStatusChange, onDateChange, onEstimatedDaysChange }: PhaseStatusManagerProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{ phaseId: number; field: string } | null>(null);

  const getStatusConfig = (status: PhaseStatus): StatusConfig => {
    return statusConfigs.find(config => config.label === status) || statusConfigs[0];
  };

  const handleStatusChange = (phaseId: number, newStatus: PhaseStatus) => {
    onStatusChange(phaseId, newStatus);
    setOpenDropdown(null);
  };

  const handleDateChange = (phaseId: number, field: 'startDate' | 'endDate', value: string) => {
    const phase = phases.find(p => p.id === phaseId);
    if (phase && onDateChange) {
      const newStartDate = field === 'startDate' ? value : phase.startDate;
      const newEndDate = field === 'endDate' ? value : phase.endDate;
      onDateChange(phaseId, newStartDate, newEndDate);
    }
    setEditingField(null);
  };

  const handleEstimatedDaysChange = (phaseId: number, value: number) => {
    if (onEstimatedDaysChange) {
      onEstimatedDaysChange(phaseId, value);
    }
    setEditingField(null);
  };

  const isEditing = (phaseId: number, field: string) => {
    return editingField?.phaseId === phaseId && editingField?.field === field;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">项目阶段管理</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>点击状态、日期、天数可编辑</span>
        </div>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => {
          const statusConfig = getStatusConfig(phase.status);
          const isDropdownOpen = openDropdown === phase.id;

          return (
            <motion.div
              key={phase.id}
              className={`relative rounded-xl border-2 p-6 transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor}`}
              whileHover={{ scale: 1.01 }}
              layout
            >
              {/* 阶段标题和状态 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-700">
                      {phase.id}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">{phase.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{phase.description}</p>
                </div>

                {/* 状态选择器 */}
                <div className="relative">
                  <motion.button
                    onClick={() => setOpenDropdown(isDropdownOpen ? null : phase.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${statusConfig.color} text-white hover:opacity-90`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {statusConfig.icon}
                    <span className="font-medium">{phase.status}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* 下拉菜单 */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
                      >
                        {statusConfigs.map((config) => (
                          <motion.button
                            key={config.label}
                            onClick={() => handleStatusChange(phase.id, config.label)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                              config.label === phase.status ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                            <span className="font-medium text-gray-700">{config.label}</span>
                            {config.label === phase.status && (
                              <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 时间信息 - 可编辑 */}
              <div className="ml-11 flex items-center gap-6 text-sm text-gray-500">
                {/* 预计天数 - 可编辑 */}
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span>预计</span>
                  {isEditing(phase.id, 'estimatedDays') ? (
                    <input
                      type="number"
                      min="1"
                      defaultValue={phase.estimatedDays || 7}
                      onBlur={(e) => handleEstimatedDaysChange(phase.id, parseInt(e.target.value) || 7)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEstimatedDaysChange(phase.id, parseInt((e.target as HTMLInputElement).value) || 7);
                        } else if (e.key === 'Escape') {
                          setEditingField(null);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => setEditingField({ phaseId: phase.id, field: 'estimatedDays' })}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      {phase.estimatedDays || 7}
                    </span>
                  )}
                  <span>天</span>
                </div>

                {/* 开始时间 - 可编辑 */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>开始:</span>
                  {isEditing(phase.id, 'startDate') ? (
                    <input
                      type="date"
                      defaultValue={phase.startDate || ''}
                      onBlur={(e) => handleDateChange(phase.id, 'startDate', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDateChange(phase.id, 'startDate', (e.target as HTMLInputElement).value);
                        } else if (e.key === 'Escape') {
                          setEditingField(null);
                        }
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => setEditingField({ phaseId: phase.id, field: 'startDate' })}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      {phase.startDate || '未设置'}
                    </span>
                  )}
                </div>

                {/* 结束时间 - 可编辑 */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>结束:</span>
                  {isEditing(phase.id, 'endDate') ? (
                    <input
                      type="date"
                      defaultValue={phase.endDate || ''}
                      onBlur={(e) => handleDateChange(phase.id, 'endDate', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleDateChange(phase.id, 'endDate', (e.target as HTMLInputElement).value);
                        } else if (e.key === 'Escape') {
                          setEditingField(null);
                        }
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => setEditingField({ phaseId: phase.id, field: 'endDate' })}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                      {phase.endDate || '未设置'}
                    </span>
                  )}
                </div>
              </div>

              {/* 状态指示器 */}
              <div className="absolute top-4 left-4">
                <div className={`w-2 h-16 rounded-full ${statusConfig.color}`}></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 状态统计 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">项目进度概览</h4>
        <div className="grid grid-cols-4 gap-4">
          {statusConfigs.map((config) => {
            const count = phases.filter(phase => phase.status === config.label).length;
            return (
              <div key={config.label} className={`text-center p-4 rounded-lg ${config.bgColor}`}>
                <div className={`mx-auto mb-2 w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white`}>
                  {config.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 点击外部关闭下拉菜单的Hook
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}