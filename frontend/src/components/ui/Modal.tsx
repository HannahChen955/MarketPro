'use client';

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl mx-4'
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onOpenChange,
    children,
    title,
    description,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscapeKey = true,
    showCloseButton = true,
    className
  }, ref) => {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <AnimatePresence>
            {open && (
              <>
                {/* 背景遮罩 */}
                <Dialog.Overlay asChild>
                  <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={closeOnOverlayClick ? () => onOpenChange?.(false) : undefined}
                  />
                </Dialog.Overlay>

                {/* 模态框内容 */}
                <Dialog.Content asChild>
                  <motion.div
                    ref={ref}
                    className={cn(
                      'fixed left-1/2 top-1/2 z-50 w-full bg-white rounded-xl shadow-xl border border-gray-200',
                      sizeClasses[size],
                      className
                    )}
                    initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                    animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                    exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{ transform: 'translate(-50%, -50%)' }}
                    onEscapeKeyDown={!closeOnEscapeKey ? (e) => e.preventDefault() : undefined}
                  >
                    {/* 头部 */}
                    {(title || description || showCloseButton) && (
                      <div className="flex items-start justify-between p-6 pb-4">
                        <div className="space-y-1 flex-1">
                          {title && (
                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                              {title}
                            </Dialog.Title>
                          )}
                          {description && (
                            <Dialog.Description className="text-sm text-gray-600">
                              {description}
                            </Dialog.Description>
                          )}
                        </div>

                        {/* 关闭按钮 */}
                        {showCloseButton && (
                          <Dialog.Close asChild>
                            <motion.button
                              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <X className="w-5 h-5" />
                              <span className="sr-only">关闭</span>
                            </motion.button>
                          </Dialog.Close>
                        )}
                      </div>
                    )}

                    {/* 内容 */}
                    <div className={cn(
                      'px-6',
                      (title || description) ? 'pb-6' : 'py-6'
                    )}>
                      {children}
                    </div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

Modal.displayName = 'Modal';

// 确认对话框组件
export interface ConfirmModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export const ConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = '确认操作',
  description = '您确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  loading = false
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm?.();
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscapeKey={!loading}
      showCloseButton={!loading}
    >
      <div className="flex gap-3 justify-end">
        <motion.button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </motion.button>

        <motion.button
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2',
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {confirmText}
        </motion.button>
      </div>
    </Modal>
  );
};

// Modal 触发器组件
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;