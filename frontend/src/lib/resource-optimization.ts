'use client';

/**
 * 资源预加载管理器
 */
export class ResourcePreloader {
  private static loadedResources = new Set<string>();
  private static loadingPromises = new Map<string, Promise<void>>();

  /**
   * 预加载图片
   */
  static async preloadImage(src: string): Promise<void> {
    if (this.loadedResources.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });

    this.loadingPromises.set(src, promise);

    try {
      await promise;
    } finally {
      this.loadingPromises.delete(src);
    }
  }

  /**
   * 批量预加载图片
   */
  static async preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  /**
   * 预加载字体
   */
  static preloadFont(fontUrl: string, fontFamily: string): void {
    if (this.loadedResources.has(fontUrl)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';

    link.onload = () => {
      this.loadedResources.add(fontUrl);
      // 添加字体到样式表
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    };

    document.head.appendChild(link);
  }

  /**
   * 预加载关键 CSS
   */
  static preloadCSS(href: string): void {
    if (this.loadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';

    link.onload = () => {
      this.loadedResources.add(href);
      link.rel = 'stylesheet';
    };

    document.head.appendChild(link);
  }

  /**
   * 预加载 JavaScript 模块
   */
  static preloadModule(src: string): void {
    if (this.loadedResources.has(src)) return;

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = src;

    link.onload = () => {
      this.loadedResources.add(src);
    };

    document.head.appendChild(link);
  }

  /**
   * 清理已加载的资源记录
   */
  static clearCache(): void {
    this.loadedResources.clear();
    this.loadingPromises.clear();
  }
}

/**
 * 图片优化工具
 */
export class ImageOptimizer {
  /**
   * 生成响应式图片 srcset
   */
  static generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=80 ${size}w`)
      .join(', ');
  }

  /**
   * 生成 WebP 格式的图片 URL（如果支持）
   */
  static getOptimizedImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}): string {
    const {
      width,
      height,
      quality = 80,
      format = 'auto'
    } = options;

    const params = new URLSearchParams();

    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());

    if (format !== 'auto') {
      params.set('fm', format);
    }

    return `${url}?${params.toString()}`;
  }

  /**
   * 检查浏览器对现代图片格式的支持
   */
  static async checkFormatSupport(): Promise<{
    webp: boolean;
    avif: boolean;
  }> {
    const testImages = {
      webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };

    const results = { webp: false, avif: false };

    for (const [format, dataUrl] of Object.entries(testImages)) {
      try {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 1000); // 超时处理
        });
        results[format as keyof typeof results] = true;
      } catch {
        // 格式不支持
      }
    }

    return results;
  }
}

/**
 * 代码分割管理器
 */
export class CodeSplittingManager {
  private static chunkCache = new Map<string, Promise<any>>();

  /**
   * 动态导入并缓存组件
   */
  static async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string
  ): Promise<T> {
    const cacheKey = chunkName || importFn.toString();

    if (!this.chunkCache.has(cacheKey)) {
      this.chunkCache.set(cacheKey, importFn().then(module => module.default));
    }

    return this.chunkCache.get(cacheKey)!;
  }

  /**
   * 预加载代码块
   */
  static preloadChunk(importFn: () => Promise<any>, chunkName?: string): void {
    const cacheKey = chunkName || importFn.toString();

    if (!this.chunkCache.has(cacheKey)) {
      this.chunkCache.set(cacheKey, importFn());
    }
  }

  /**
   * 清理代码块缓存
   */
  static clearCache(): void {
    this.chunkCache.clear();
  }
}

/**
 * 资源压缩工具
 */
export class AssetCompressionUtils {
  /**
   * 压缩 JSON 数据
   */
  static compressJSON(obj: any): string {
    return JSON.stringify(obj, null, 0);
  }

  /**
   * 使用 Base64 编码小图片
   */
  static async encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 移除未使用的 CSS 类名（简单版本）
   */
  static removeUnusedCSS(css: string, usedClasses: Set<string>): string {
    return css
      .split('}')
      .filter(rule => {
        const selector = rule.split('{')[0]?.trim();
        if (!selector) return false;

        // 检查选择器中的类名是否被使用
        const classMatches = selector.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g);
        if (!classMatches) return true; // 保留非类选择器

        return classMatches.some(className =>
          usedClasses.has(className.substring(1))
        );
      })
      .join('}');
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private static readonly CACHE_PREFIX = 'marketpro_';
  private static readonly DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

  /**
   * 设置缓存
   */
  static set(key: string, value: any, ttl = this.DEFAULT_TTL): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };

    try {
      localStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  /**
   * 获取缓存
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const isExpired = Date.now() - parsed.timestamp > parsed.ttl;

      if (isExpired) {
        this.remove(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * 移除缓存
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Failed to remove cache:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  static cleanExpired(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
            if (isExpired) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }

  /**
   * 清理所有缓存
   */
  static clear(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getStats(): {
    count: number;
    totalSize: number;
    items: Array<{ key: string; size: number; age: number }>;
  } {
    const items: Array<{ key: string; size: number; age: number }> = [];
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const size = item.length * 2; // Approximate bytes
            const parsed = JSON.parse(item);
            const age = Date.now() - parsed.timestamp;

            items.push({
              key: key.substring(this.CACHE_PREFIX.length),
              size,
              age
            });

            totalSize += size;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return {
      count: items.length,
      totalSize,
      items
    };
  }
}

/**
 * 网络优化工具
 */
export class NetworkOptimization {
  /**
   * 检测网络连接质量
   */
  static getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (!connection) {
      return {
        effectiveType: 'unknown',
        downlink: Infinity,
        rtt: 0,
        saveData: false
      };
    }

    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || Infinity,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }

  /**
   * 根据网络质量调整资源加载策略
   */
  static getOptimalStrategy(): {
    shouldPreload: boolean;
    imageQuality: number;
    enableAnimations: boolean;
    chunkSize: 'small' | 'medium' | 'large';
  } {
    const { effectiveType, downlink, saveData } = this.getConnectionInfo();

    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return {
        shouldPreload: false,
        imageQuality: 50,
        enableAnimations: false,
        chunkSize: 'small'
      };
    }

    if (effectiveType === '3g' || downlink < 1.5) {
      return {
        shouldPreload: false,
        imageQuality: 70,
        enableAnimations: true,
        chunkSize: 'medium'
      };
    }

    return {
      shouldPreload: true,
      imageQuality: 85,
      enableAnimations: true,
      chunkSize: 'large'
    };
  }

  /**
   * 实现请求去重
   */
  private static pendingRequests = new Map<string, Promise<Response>>();

  static async fetchWithDeduplication(url: string, options?: RequestInit): Promise<Response> {
    const key = `${url}-${JSON.stringify(options || {})}`;

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!.then(response => response.clone());
    }

    const promise = fetch(url, options);
    this.pendingRequests.set(key, promise);

    try {
      const response = await promise;
      return response.clone();
    } finally {
      this.pendingRequests.delete(key);
    }
  }
}