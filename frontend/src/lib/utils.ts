import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并和优化 Tailwind CSS 类名
 * @param inputs - 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期
 * @param date - 日期对象或字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * 格式化相对时间
 * @param date - 日期对象或字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return formatDate(dateObj, { month: 'short', day: 'numeric' });
  }
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param limit - 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 生成随机ID
 * @param length - ID长度
 * @returns 随机ID字符串
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 检查是否为空值
 * @param value - 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.length === 0;
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * 安全的JSON解析
 * @param str - JSON字符串
 * @param defaultValue - 默认值
 * @returns 解析后的对象或默认值
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 回退方案
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 获取文件扩展名
 * @param filename - 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 格式化数字
 * @param num - 数字
 * @param options - 格式化选项
 * @returns 格式化后的数字字符串
 */
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('zh-CN', options).format(num);
}

/**
 * 计算百分比
 * @param value - 当前值
 * @param total - 总值
 * @param decimals - 小数位数
 * @returns 百分比字符串
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 1
): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 睡眠函数
 * @param ms - 毫秒数
 * @returns Promise<void>
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}