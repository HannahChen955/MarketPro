/**
 * 下载工具类
 * 处理单个文件和批量文件下载
 */

export interface DownloadableReport {
  id: string;
  title: string;
  filePath: string;
  fileSize: number;
  type: string;
}

/**
 * 下载单个文件
 */
export async function downloadSingleFile(report: DownloadableReport): Promise<void> {
  try {
    const response = await fetch(`/api/reports/download/${report.id}`);

    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 从文件路径中提取文件名，或者使用报告标题
    const fileName = report.filePath.split('/').pop() || `${report.title}.pdf`;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
}

/**
 * 批量下载文件（打包为ZIP）
 */
export async function downloadBatchFiles(
  reports: DownloadableReport[],
  onProgress?: (progress: number) => void
): Promise<void> {
  if (reports.length === 0) {
    throw new Error('没有选择要下载的报告');
  }

  try {
    onProgress?.(0);

    // 准备批量下载请求
    const downloadRequest = {
      reportIds: reports.map(r => r.id),
      fileName: `项目报告合集_${new Date().toLocaleDateString('zh-CN')}.zip`
    };

    const response = await fetch('/api/reports/batch-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(downloadRequest)
    });

    if (!response.ok) {
      throw new Error(`批量下载失败: ${response.statusText}`);
    }

    onProgress?.(50);

    const blob = await response.blob();
    onProgress?.(80);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadRequest.fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onProgress?.(100);
  } catch (error) {
    console.error('批量下载失败:', error);
    throw error;
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 预览文件
 */
export async function previewFile(reportId: string): Promise<string> {
  try {
    const response = await fetch(`/api/reports/preview/${reportId}`);

    if (!response.ok) {
      throw new Error(`预览失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('预览失败:', error);
    throw error;
  }
}

/**
 * 生成分享链接
 */
export async function generateShareLink(
  reportId: string,
  options: {
    expiryDays?: number;
    password?: string;
    allowDownload?: boolean;
  } = {}
): Promise<string> {
  try {
    const response = await fetch('/api/reports/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportId,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`分享链接生成失败: ${response.statusText}`);
    }

    const { shareUrl } = await response.json();
    return shareUrl;
  } catch (error) {
    console.error('分享链接生成失败:', error);
    throw error;
  }
}

/**
 * 获取下载历史
 */
export async function getDownloadHistory(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/projects/${projectId}/download-history`);

    if (!response.ok) {
      throw new Error(`获取下载历史失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取下载历史失败:', error);
    throw error;
  }
}

/**
 * 计算预计下载时间
 */
export function estimateDownloadTime(totalSize: number, connectionSpeed: number = 1024 * 1024): string {
  const seconds = totalSize / connectionSpeed;

  if (seconds < 60) {
    return `约 ${Math.ceil(seconds)} 秒`;
  } else if (seconds < 3600) {
    return `约 ${Math.ceil(seconds / 60)} 分钟`;
  } else {
    return `约 ${Math.ceil(seconds / 3600)} 小时`;
  }
}

/**
 * 检查浏览器下载支持
 */
export function checkDownloadSupport(): boolean {
  return typeof document.createElement === 'function' &&
         typeof window.URL === 'object' &&
         typeof window.URL.createObjectURL === 'function';
}

/**
 * 下载进度管理器
 */
export class DownloadProgressManager {
  private callbacks: Map<string, (progress: number) => void> = new Map();

  addProgress(downloadId: string, callback: (progress: number) => void): void {
    this.callbacks.set(downloadId, callback);
  }

  updateProgress(downloadId: string, progress: number): void {
    const callback = this.callbacks.get(downloadId);
    callback?.(progress);
  }

  removeProgress(downloadId: string): void {
    this.callbacks.delete(downloadId);
  }

  clear(): void {
    this.callbacks.clear();
  }
}