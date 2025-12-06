'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';

/**
 * 断点配置
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * 设备类型检测
 */
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isRetina: boolean;
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  currentBreakpoint: Breakpoint;
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(width: number, height: number): DeviceInfo {
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
  const isRetina = typeof window !== 'undefined' && window.devicePixelRatio > 1;
  const orientation = height > width ? 'portrait' : 'landscape';

  let currentBreakpoint: Breakpoint = 'xs';
  for (const [bp, value] of Object.entries(breakpoints)) {
    if (width >= value) {
      currentBreakpoint = bp as Breakpoint;
    }
  }

  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isRetina,
    orientation,
    width,
    height,
    currentBreakpoint
  };
}

/**
 * 响应式上下文
 */
const ResponsiveContext = createContext<DeviceInfo | null>(null);

/**
 * 响应式 Provider
 */
export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return getDeviceInfo(1024, 768); // 默认桌面尺寸
    }
    return getDeviceInfo(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo(window.innerWidth, window.innerHeight));
    };

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={deviceInfo}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/**
 * 使用设备信息的 Hook
 */
export function useDeviceInfo(): DeviceInfo {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useDeviceInfo must be used within a ResponsiveProvider');
  }
  return context;
}

/**
 * 媒体查询 Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * 断点检测 Hook
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const deviceInfo = useDeviceInfo();
  return deviceInfo.width >= breakpoints[breakpoint];
}

/**
 * 响应式值 Hook
 * 根据断点返回不同的值
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T {
  const deviceInfo = useDeviceInfo();

  return useMemo(() => {
    const sortedBreakpoints = Object.keys(breakpoints).sort(
      (a, b) => breakpoints[b as Breakpoint] - breakpoints[a as Breakpoint]
    ) as Breakpoint[];

    for (const bp of sortedBreakpoints) {
      if (deviceInfo.width >= breakpoints[bp] && values[bp] !== undefined) {
        return values[bp]!;
      }
    }

    return fallback;
  }, [deviceInfo.width, values, fallback]);
}

/**
 * 响应式组件 Props
 */
interface ResponsiveProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  breakpoint?: Breakpoint;
}

/**
 * 响应式组件
 * 根据设备类型渲染不同内容
 */
export const Responsive: React.FC<ResponsiveProps> = ({
  children,
  mobile,
  tablet,
  desktop,
  breakpoint
}) => {
  const deviceInfo = useDeviceInfo();

  if (breakpoint && deviceInfo.width < breakpoints[breakpoint]) {
    return null;
  }

  if (deviceInfo.isMobile && mobile) {
    return <>{mobile}</>;
  }

  if (deviceInfo.isTablet && tablet) {
    return <>{tablet}</>;
  }

  if (deviceInfo.isDesktop && desktop) {
    return <>{desktop}</>;
  }

  return <>{children}</>;
};

/**
 * 移动端优化工具
 */
export class MobileOptimization {
  /**
   * 禁用iOS Safari的弹性滚动
   */
  static disableBounceScrolling() {
    if (typeof document === 'undefined') return;

    document.body.style.overscrollBehavior = 'none';
  }

  /**
   * 启用平滑滚动
   */
  static enableSmoothScrolling() {
    if (typeof document === 'undefined') return;

    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /**
   * 优化触摸延迟
   */
  static optimizeTouchDelay() {
    if (typeof document === 'undefined') return;

    // 添加 touch-action 优化
    document.body.style.touchAction = 'manipulation';

    // 禁用双击缩放
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }

  /**
   * 阻止默认的拖拽行为
   */
  static preventDefaultDrag() {
    if (typeof document === 'undefined') return;

    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea')) {
        e.preventDefault();
      }
    });
  }
}

/**
 * 响应式网格系统
 */
interface GridProps {
  children: React.ReactNode;
  cols?: Partial<Record<Breakpoint, number>>;
  gap?: Partial<Record<Breakpoint, number>>;
  className?: string;
}

export const ResponsiveGrid: React.FC<GridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = { xs: 4, sm: 6, md: 8 },
  className = ''
}) => {
  const columns = useResponsiveValue(cols, 1);
  const gridGap = useResponsiveValue(gap, 4);

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gridGap * 0.25}rem`
      }}
    >
      {children}
    </div>
  );
};

/**
 * 响应式容器
 */
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: Partial<Record<Breakpoint, string>>;
  padding?: Partial<Record<Breakpoint, string>>;
  className?: string;
}

export const ResponsiveContainer: React.FC<ContainerProps> = ({
  children,
  maxWidth = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
  padding = { xs: '1rem', sm: '1.5rem', lg: '2rem' },
  className = ''
}) => {
  const containerMaxWidth = useResponsiveValue(maxWidth, '100%');
  const containerPadding = useResponsiveValue(padding, '1rem');

  return (
    <div
      className={`mx-auto ${className}`}
      style={{
        maxWidth: containerMaxWidth,
        padding: containerPadding
      }}
    >
      {children}
    </div>
  );
};

/**
 * 触摸手势处理器
 */
interface TouchGestureHandler {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  threshold?: number;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchStart,
  onPinchEnd,
  threshold = 50
}: TouchGestureHandler) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const [isPinching, setIsPinching] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      onPinchStart?.();
      return;
    }

    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isPinching) {
      setIsPinching(false);
      onPinchEnd?.();
      return;
    }

    if (!touchStart.current || e.touches.length > 0) return;

    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // 水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    // 垂直滑动
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
    isPinching
  };
}

/**
 * 安全区域适配 Hook
 * 处理刘海屏等安全区域
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}