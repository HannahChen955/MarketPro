'use client';

import React, { Suspense, lazy, ComponentType, memo, useCallback, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui';

/**
 * 懒加载高阶组件
 * 用于动态导入组件以减少初始包大小
 */
export function createLazyComponent<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(componentImport);

  return memo((props: React.ComponentProps<T>) => (
    <Suspense
      fallback={
        fallback || (
          <LoadingSpinner
            variant="inline"
            message="正在加载组件..."
            stage="loading"
          />
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  ));
}

/**
 * 创建优化的记忆化组件
 * 使用 React.memo 和自定义比较函数优化重新渲染
 */
export function createMemoizedComponent<T extends ComponentType<any>>(
  Component: T,
  compareProps?: (prevProps: any, nextProps: any) => boolean
) {
  return memo(Component, compareProps);
}

/**
 * 防抖 Hook
 * 用于优化频繁触发的事件处理
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedFn = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    }) as T;
  }, [callback, delay]);

  return debouncedFn;
}

/**
 * 节流 Hook
 * 用于限制高频操作的执行频率
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledFn = useMemo(() => {
    let lastCall = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return callback(...args);
      }
    }) as T;
  }, [callback, delay]);

  return throttledFn;
}

/**
 * 优化的回调 Hook
 * 使用 useCallback 优化函数引用
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * 虚拟化列表项渲染器
 * 用于大数据集合的高性能渲染
 */
export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 图片懒加载组件
 * 支持占位符和错误处理
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  errorPlaceholder?: string;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  errorPlaceholder,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (errorPlaceholder) {
      setImageSrc(errorPlaceholder);
    }
  }, [errorPlaceholder]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}

/**
 * 性能监控工具
 * 用于测量组件渲染性能
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(name: string): string {
    const markName = `${name}-start-${Date.now()}`;
    performance.mark(markName);
    return markName;
  }

  static endMeasurement(name: string, startMark: string): number {
    const endMark = `${name}-end-${Date.now()}`;
    performance.mark(endMark);

    const measurementName = `${name}-measurement`;
    performance.measure(measurementName, startMark, endMark);

    const measurement = performance.getEntriesByName(measurementName)[0];
    const duration = measurement.duration;

    // 存储测量结果
    const measurements = this.measurements.get(name) || [];
    measurements.push(duration);
    this.measurements.set(name, measurements);

    // 清理性能标记
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measurementName);

    return duration;
  }

  static getAverageTime(name: string): number {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return 0;

    return measurements.reduce((sum, duration) => sum + duration, 0) / measurements.length;
  }

  static getReport(): Record<string, { count: number; average: number; total: number }> {
    const report: Record<string, { count: number; average: number; total: number }> = {};

    this.measurements.forEach((measurements, name) => {
      const total = measurements.reduce((sum, duration) => sum + duration, 0);
      report[name] = {
        count: measurements.length,
        average: total / measurements.length,
        total
      };
    });

    return report;
  }
}

/**
 * 性能监控 Hook
 * 自动测量组件渲染时间
 */
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startMark = PerformanceMonitor.startMeasurement(componentName);

    return () => {
      PerformanceMonitor.endMeasurement(componentName, startMark);
    };
  });

  return {
    getAverageTime: () => PerformanceMonitor.getAverageTime(componentName),
    getReport: () => PerformanceMonitor.getReport()
  };
}

/**
 * 内存使用监控
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Bundle 分析工具
 * 用于分析和优化打包大小
 */
export const BundleAnalyzer = {
  logComponentSize: (componentName: string, component: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} loaded`);
      // 可以在这里添加更多的分析逻辑
    }
  },

  logChunkLoaded: (chunkName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Chunk ${chunkName} loaded`);
    }
  }
};