'use client';

import React, {
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  PropsWithChildren
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  usePerformanceMonitor,
  useMemoryMonitor,
  useDebounce,
  useThrottle
} from '@/lib/performance';
import { cn } from '@/lib/utils';

interface PerformanceContainerProps extends PropsWithChildren {
  name: string;
  enableMonitoring?: boolean;
  enableMemoryTracking?: boolean;
  enableVirtualization?: boolean;
  className?: string;
  optimizeScrolling?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
}

/**
 * 高性能容器组件
 * 集成性能监控、内存跟踪和优化功能
 */
const PerformanceContainer = memo<PerformanceContainerProps>(({
  name,
  children,
  enableMonitoring = true,
  enableMemoryTracking = false,
  enableVirtualization = false,
  className,
  optimizeScrolling = true,
  debounceDelay = 300,
  throttleDelay = 16
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // 性能监控
  const performanceMonitor = usePerformanceMonitor(enableMonitoring ? name : '');
  const memoryInfo = useMemoryMonitor();

  // 防抖和节流的滚动处理
  const debouncedScrollHandler = useDebounce(
    useCallback((event: Event) => {
      const target = event.target as HTMLElement;
      setScrollPosition({
        x: target.scrollLeft,
        y: target.scrollTop
      });
    }, []),
    debounceDelay
  );

  const throttledScrollHandler = useThrottle(
    useCallback((event: Event) => {
      // 实时滚动处理，用于性能关键的操作
      const target = event.target as HTMLElement;
      // 这里可以添加实时滚动效果
    }, []),
    throttleDelay
  );

  // 视口可见性检测
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 滚动优化
  useEffect(() => {
    if (!optimizeScrolling || !containerRef.current) return;

    const element = containerRef.current;

    element.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    element.addEventListener('scroll', throttledScrollHandler, { passive: true });

    return () => {
      element.removeEventListener('scroll', debouncedScrollHandler);
      element.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [optimizeScrolling, debouncedScrollHandler, throttledScrollHandler]);

  // 内存泄漏检测
  useEffect(() => {
    if (!enableMemoryTracking) return;

    const checkMemoryUsage = () => {
      if (memoryInfo && memoryInfo.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
        console.warn(`High memory usage detected in ${name}:`, memoryInfo);
      }
    };

    const interval = setInterval(checkMemoryUsage, 10000);
    return () => clearInterval(interval);
  }, [enableMemoryTracking, memoryInfo, name]);

  // 渲染优化：只在可见时渲染内容
  const optimizedChildren = useMemo(() => {
    if (!isVisible && enableVirtualization) {
      return (
        <div className="flex items-center justify-center p-8 text-gray-500">
          内容未在视口中，已暂停渲染以优化性能
        </div>
      );
    }
    return children;
  }, [isVisible, enableVirtualization, children]);

  // 开发环境下的性能报告
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && enableMonitoring) {
      const logPerformance = () => {
        const avgTime = performanceMonitor.getAverageTime();
        if (avgTime > 0) {
          console.log(`Performance [${name}]: Average render time ${avgTime.toFixed(2)}ms`);
        }
      };

      const timer = setTimeout(logPerformance, 5000);
      return () => clearTimeout(timer);
    }
  }, [enableMonitoring, name, performanceMonitor]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'performance-container',
        'will-change-auto', // 优化 CSS 渲染
        className
      )}
      initial={enableVirtualization ? { opacity: 0 } : undefined}
      animate={enableVirtualization ? { opacity: isVisible ? 1 : 0.3 } : undefined}
      transition={{ duration: 0.2 }}
      data-performance-name={name}
      data-memory-tracking={enableMemoryTracking}
      style={{
        // 启用硬件加速
        transform: 'translateZ(0)',
        // 优化滚动性能
        scrollBehavior: optimizeScrolling ? 'smooth' : 'auto'
      }}
    >
      <AnimatePresence mode="wait">
        {optimizedChildren}
      </AnimatePresence>

      {/* 开发环境性能指示器 */}
      {process.env.NODE_ENV === 'development' && enableMonitoring && (
        <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>组件: {name}</div>
          <div>平均渲染: {performanceMonitor.getAverageTime().toFixed(2)}ms</div>
          {enableMemoryTracking && memoryInfo && (
            <div>
              内存: {Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB
            </div>
          )}
          <div>可见: {isVisible ? '是' : '否'}</div>
          <div>滚动: x{scrollPosition.x}, y{scrollPosition.y}</div>
        </div>
      )}
    </motion.div>
  );
});

PerformanceContainer.displayName = 'PerformanceContainer';

/**
 * 网格虚拟化容器
 * 用于大量数据的网格布局
 */
interface VirtualGridProps<T> extends PropsWithChildren {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  columns: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export const VirtualGrid = memo(<T extends any>({
  items,
  itemWidth,
  itemHeight,
  columns,
  containerWidth,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualGridProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const visibleRange = useMemo(() => {
    const rowHeight = itemHeight;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      Math.ceil(items.length / columns),
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const startCol = Math.max(0, Math.floor(scrollLeft / itemWidth) - overscan);
    const endCol = Math.min(columns, Math.ceil((scrollLeft + containerWidth) / itemWidth) + overscan);

    return { startRow, endRow, startCol, endCol };
  }, [scrollTop, scrollLeft, itemHeight, itemWidth, containerHeight, containerWidth, items.length, columns, overscan]);

  const visibleItems = useMemo(() => {
    const items_visible = [];
    for (let row = visibleRange.startRow; row < visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col < visibleRange.endCol; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          items_visible.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }
    return items_visible;
  }, [items, visibleRange, columns]);

  const totalWidth = columns * itemWidth;
  const totalHeight = Math.ceil(items.length / columns) * itemHeight;

  const throttledScrollHandler = useThrottle(
    useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      setScrollLeft(e.currentTarget.scrollLeft);
    }, []),
    16 // 60 FPS
  );

  return (
    <div
      className={cn('virtual-grid overflow-auto', className)}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={throttledScrollHandler}
    >
      <div
        style={{
          width: totalWidth,
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: col * itemWidth,
              top: row * itemHeight,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualGrid.displayName = 'VirtualGrid';

/**
 * 响应式图片容器
 * 支持懒加载和自适应尺寸
 */
interface ResponsiveImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export const ResponsiveImageContainer = memo<ResponsiveImageContainerProps>(({
  src,
  alt,
  className,
  aspectRatio = '16/9',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{ aspectRatio }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse w-8 h-8 bg-gray-300 rounded" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading={priority ? 'eager' : 'lazy'}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-sm">图片加载失败</span>
        </div>
      )}
    </div>
  );
});

ResponsiveImageContainer.displayName = 'ResponsiveImageContainer';

export default PerformanceContainer;