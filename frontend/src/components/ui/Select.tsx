'use client';

import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  clearable?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    className,
    options = [],
    value,
    onValueChange,
    placeholder = '请选择...',
    size = 'md',
    variant = 'default',
    label,
    error,
    success,
    helper,
    clearable = false,
    searchable = false,
    fullWidth = true,
    animate = true,
    disabled,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // 根据状态确定variant
    const actualVariant = error ? 'error' : success ? 'success' : variant;

    const sizeClasses = {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base'
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
    };

    const selectedOption = options.find(option => option.value === value);

    // 过滤选项
    const filteredOptions = searchable
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.('');
    };

    const selectContent = (
      <div className="relative" ref={ref}>
        {/* 触发器 */}
        <button
          type="button"
          className={cn(
            'w-full flex items-center justify-between rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            sizeClasses[size],
            variantClasses[actualVariant],
            fullWidth ? 'w-full' : '',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={cn(
            'flex-1 text-left',
            selectedOption ? 'text-gray-900' : 'text-gray-500'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-1 ml-2">
            {/* 清除按钮 */}
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* 下拉箭头 */}
            <ChevronDown className={cn(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </div>
        </button>

        {/* 下拉选项 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {/* 搜索框 */}
              {searchable && (
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="搜索选项..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* 选项列表 */}
              <div className="py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    没有找到匹配的选项
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                        value === option.value && 'bg-blue-50 text-blue-700'
                      )}
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      whileHover={{ scale: animate && !option.disabled ? 1.02 : 1 }}
                      whileTap={{ scale: animate && !option.disabled ? 0.98 : 1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {value === option.value && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    // 如果只有选择器，直接返回
    if (!label && !error && !success && !helper) {
      return selectContent;
    }

    // 返回完整的选择器组件（包含标签和辅助信息）
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* 标签 */}
        {label && (
          <label className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            disabled && 'text-gray-500'
          )}>
            {label}
          </label>
        )}

        {/* 选择器 */}
        {selectContent}

        {/* 辅助信息 */}
        <div className="mt-1 space-y-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600"
            >
              {success}
            </motion.p>
          )}

          {helper && !error && !success && (
            <p className="text-sm text-gray-500">
              {helper}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };