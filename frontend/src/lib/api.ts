// API客户端配置

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9527';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiError {
  error: string;
  message: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // 清除认证token
  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  // 私有方法：发送请求
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        ...this.headers,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // 检查响应状态
      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: 'Network Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
          } as any;
        }

        throw new ApiError(errorData.message || errorData.error, response.status);
      }

      // 解析响应数据
      const data = await response.json();
      return data;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // 网络错误或其他错误
      throw new ApiError('网络连接失败，请检查网络设置', 0);
    }
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers = { ...this.headers };
    delete headers['Content-Type']; // Let browser set Content-Type for FormData

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// 自定义错误类
class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// 导出API实例
export const api = new ApiClient(BASE_URL);

// 导出具体的API方法
export const reportApi = {
  // 报告类型管理
  getAll: () => api.get('/api/reports'),
  getById: (id: string) => api.get(`/api/reports/${id}`),
  create: (data: any) => api.post('/api/reports', data),
  update: (id: string, data: any) => api.put(`/api/reports/${id}`, data),
  delete: (id: string) => api.delete(`/api/reports/${id}`),

  // 报告分析
  analyzeUpload: (file: File) => api.uploadFile('/api/reports/analyze', file),
};

export const taskApi = {
  // 任务管理
  create: (data: any) => api.post('/api/tasks', data),
  getStatus: (id: string) => api.get(`/api/tasks/${id}`),
  getByUser: (userId?: string) => api.get('/api/tasks', { userId }),
  cancel: (id: string) => api.post(`/api/tasks/${id}/cancel`),

  // 任务监控
  getMonitoring: (id: string) => api.get(`/api/tasks/${id}/monitoring`),
};

export const projectApi = {
  // 项目管理
  create: (data: any) => api.post('/api/projects', data),
  getById: (id: string) => api.get(`/api/projects/${id}`),
  update: (id: string, data: any) => api.put(`/api/projects/${id}`, data),
  getByUser: () => api.get('/api/projects'),

  // 项目工作流
  startGeneration: (id: string) => api.post(`/api/projects/${id}/generate`),
  getGeneratedReports: (id: string) => api.get(`/api/projects/${id}/reports`),
};

export const fileApi = {
  // 文件管理
  upload: (file: File, projectId?: string) =>
    api.uploadFile('/api/files/upload', file, projectId ? { projectId } : {}),
  getDownloadUrl: (id: string) => api.get(`/api/files/${id}/download`),
  delete: (id: string) => api.delete(`/api/files/${id}`),
};

export const authApi = {
  // 认证（简化版）
  getCurrentUser: () => api.get('/api/auth/me'),
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
};

export const statsApi = {
  // 统计数据
  getDashboard: () => api.get('/api/stats/dashboard'),
  getUsage: (timeRange?: string) => api.get('/api/stats/usage', { timeRange }),
};

// AI API接口
export const aiApi = {
  // AI聊天接口
  chat: (data: {
    prompt: string;
    requestType?: 'generation' | 'analysis' | 'chat' | 'summary';
    maxTokens?: number;
    temperature?: number;
    context?: {
      reportType?: string;
      currentStep?: string;
      projectData?: any;
      source?: string;
    };
  }) => api.post('/api/ai/chat', data),

  // AI内容生成
  generate: (data: {
    prompt: string;
    requestType: 'generation' | 'analysis' | 'chat' | 'summary';
    maxTokens?: number;
    temperature?: number;
    projectId?: string;
    taskId?: string;
    context?: Record<string, any>;
  }) => api.post('/api/ai/generate', data),

  // AI服务健康检查
  health: () => api.get('/api/ai/health'),

  // AI使用统计
  getStats: () => api.get('/api/ai/stats'),

  // 全局AI统计（管理员）
  getGlobalStats: () => api.get('/api/ai/stats/global'),
};

// 错误处理工具
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return '操作失败，请稍后重试';
};

// 请求拦截器（用于全局错误处理）
export const setupApiInterceptors = () => {
  // 在应用启动时检查API连接
  api.healthCheck().then(isHealthy => {
    if (!isHealthy) {
      console.warn('后端服务连接异常，部分功能可能不可用');
    }
  });
};

export { ApiError };