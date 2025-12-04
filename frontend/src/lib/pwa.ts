'use client';

/**
 * PWA (Progressive Web App) 管理器
 * 提供离线支持、安装提示和推送通知功能
 */
export class PWAManager {
  private static instance: PWAManager;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  /**
   * 初始化 PWA 功能
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // 注册 Service Worker
      await this.registerServiceWorker();

      // 监听安装提示
      this.setupInstallPrompt();

      // 监听在线/离线状态
      this.setupOnlineOfflineHandlers();

      // 检查更新
      this.checkForUpdates();

      console.log('PWA initialized successfully');
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  /**
   * 注册 Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.serviceWorker);

        // 监听 Service Worker 状态变化
        this.serviceWorker.addEventListener('updatefound', () => {
          const newWorker = this.serviceWorker?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                // 新版本可用，显示更新提示
                this.notifyUpdate();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * 设置安装提示
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
    });
  }

  /**
   * 设置在线/离线状态处理
   */
  private setupOnlineOfflineHandlers(): void {
    window.addEventListener('online', () => {
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.notifyOnlineStatus(false);
    });
  }

  /**
   * 检查应用更新
   */
  private async checkForUpdates(): Promise<void> {
    if (this.serviceWorker) {
      try {
        await this.serviceWorker.update();
      } catch (error) {
        console.error('Update check failed:', error);
      }
    }
  }

  /**
   * 显示安装按钮
   */
  private showInstallButton(): void {
    const event = new CustomEvent('pwa-install-available', {
      detail: { canInstall: true }
    });
    window.dispatchEvent(event);
  }

  /**
   * 隐藏安装按钮
   */
  private hideInstallButton(): void {
    const event = new CustomEvent('pwa-install-available', {
      detail: { canInstall: false }
    });
    window.dispatchEvent(event);
  }

  /**
   * 提示安装 PWA
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * 通知更新可用
   */
  private notifyUpdate(): void {
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  /**
   * 通知在线状态变化
   */
  private notifyOnlineStatus(isOnline: boolean): void {
    const event = new CustomEvent('pwa-online-status', {
      detail: { isOnline }
    });
    window.dispatchEvent(event);
  }

  /**
   * 应用更新
   */
  async applyUpdate(): Promise<void> {
    if (this.serviceWorker) {
      try {
        const newWorker = this.serviceWorker.waiting;
        if (newWorker) {
          newWorker.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Apply update failed:', error);
      }
    }
  }

  /**
   * 检查是否可以安装
   */
  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  /**
   * 检查是否已安装
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * 获取网络状态
   */
  getNetworkStatus(): {
    isOnline: boolean;
    connection?: any;
  } {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      } : undefined
    };
  }
}

/**
 * PWA Hook
 * React Hook for PWA functionality
 */
export function usePWA() {
  const [canInstall, setCanInstall] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [isInstalled, setIsInstalled] = React.useState(false);

  const pwa = PWAManager.getInstance();

  React.useEffect(() => {
    // 初始化 PWA
    pwa.initialize();

    // 检查初始状态
    setIsInstalled(pwa.isInstalled());
    setIsOnline(navigator.onLine);

    // 监听 PWA 事件
    const handleInstallAvailable = (e: CustomEvent) => {
      setCanInstall(e.detail.canInstall);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleOnlineStatus = (e: CustomEvent) => {
      setIsOnline(e.detail.isOnline);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable as EventListener);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('pwa-online-status', handleOnlineStatus as EventListener);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable as EventListener);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('pwa-online-status', handleOnlineStatus as EventListener);
    };
  }, [pwa]);

  return {
    canInstall,
    updateAvailable,
    isOnline,
    isInstalled,
    promptInstall: () => pwa.promptInstall(),
    applyUpdate: () => pwa.applyUpdate(),
    networkStatus: pwa.getNetworkStatus()
  };
}

/**
 * 离线存储管理器
 */
export class OfflineStorageManager {
  private dbName = 'MarketProOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象存储
        if (!db.objectStoreNames.contains('drafts')) {
          const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async saveDraft(id: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');

      const draft = {
        id,
        data,
        timestamp: Date.now()
      };

      const request = store.put(draft);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getDraft(id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data);
    });
  }

  async getAllDrafts(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteDraft(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cacheData(key: string, data: any, ttl = 3600000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const cacheItem = {
        key,
        data,
        expiry: Date.now() + ttl
      };

      const request = store.put(cacheItem);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

// 导入 React（仅在使用 hook 时需要）
import React from 'react';