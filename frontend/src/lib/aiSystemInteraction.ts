// AI系统交互服务
// 为AI聊天机器人提供与系统原生功能的交互能力

import { reportApi, projectApi, taskApi, statsApi } from './api';

export interface SystemAction {
  type: 'project' | 'report' | 'task' | 'navigation' | 'help';
  action: string;
  data?: any;
  description: string;
}

export interface SystemContext {
  currentUser?: any;
  currentProject?: any;
  currentTasks?: any[];
  systemStatus?: any;
  userPermissions?: string[];
}

export class AISystemInteraction {
  private context: SystemContext = {};

  // 更新系统上下文
  updateContext(newContext: Partial<SystemContext>) {
    this.context = { ...this.context, ...newContext };
  }

  // 获取当前上下文
  getCurrentContext(): SystemContext {
    return this.context;
  }

  // 解析用户意图并返回可执行的系统操作
  parseUserIntent(userInput: string): SystemAction[] {
    const input = userInput.toLowerCase();
    const actions: SystemAction[] = [];

    // 项目相关操作
    if (input.includes('项目') || input.includes('创建项目')) {
      if (input.includes('创建') || input.includes('新建')) {
        actions.push({
          type: 'project',
          action: 'create',
          description: '创建新项目'
        });
      } else if (input.includes('查看') || input.includes('列表')) {
        actions.push({
          type: 'project',
          action: 'list',
          description: '查看项目列表'
        });
      }
    }

    // 报表生成相关
    if (input.includes('生成') || input.includes('报告') || input.includes('报表')) {
      if (input.includes('开始') || input.includes('生成')) {
        actions.push({
          type: 'report',
          action: 'generate',
          description: '开始生成报表'
        });
      } else if (input.includes('进度') || input.includes('状态')) {
        actions.push({
          type: 'report',
          action: 'progress',
          description: '查看生成进度'
        });
      }
    }

    // 任务管理相关
    if (input.includes('任务') || input.includes('进度')) {
      actions.push({
        type: 'task',
        action: 'list',
        description: '查看当前任务'
      });
    }

    // 导航操作
    if (input.includes('跳转') || input.includes('打开') || input.includes('页面')) {
      if (input.includes('仪表板') || input.includes('首页')) {
        actions.push({
          type: 'navigation',
          action: 'dashboard',
          description: '跳转到仪表板'
        });
      } else if (input.includes('设置')) {
        actions.push({
          type: 'navigation',
          action: 'settings',
          description: '打开设置页面'
        });
      }
    }

    return actions;
  }

  // 执行系统操作
  async executeSystemAction(action: SystemAction): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      switch (action.type) {
        case 'project':
          return await this.handleProjectAction(action);
        case 'report':
          return await this.handleReportAction(action);
        case 'task':
          return await this.handleTaskAction(action);
        case 'navigation':
          return await this.handleNavigationAction(action);
        default:
          return {
            success: false,
            message: '不支持的操作类型'
          };
      }
    } catch (error) {
      console.error('系统操作执行失败:', error);
      return {
        success: false,
        message: `操作失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 处理项目操作
  private async handleProjectAction(action: SystemAction): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    switch (action.action) {
      case 'list':
        try {
          const response = await projectApi.getByUser();
          if (response.success) {
            this.context.currentProject = response.data;
            return {
              success: true,
              data: response.data,
              message: `找到 ${(response.data as any)?.length || 0} 个项目`
            };
          }
          return { success: false, message: '获取项目列表失败' };
        } catch (error) {
          return { success: false, message: '网络错误，无法获取项目列表' };
        }

      case 'create':
        return {
          success: true,
          message: '正在为您准备项目创建界面...',
          data: { action: 'navigate', path: '/projects/new' }
        };

      default:
        return { success: false, message: '不支持的项目操作' };
    }
  }

  // 处理报表操作
  private async handleReportAction(action: SystemAction): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    switch (action.action) {
      case 'generate':
        if (!this.context.currentProject) {
          return {
            success: false,
            message: '请先选择或创建一个项目'
          };
        }
        try {
          const response = await projectApi.startGeneration(this.context.currentProject.id);
          if (response.success) {
            return {
              success: true,
              data: response.data,
              message: '报表生成已开始，预计需要3-5分钟'
            };
          }
          return { success: false, message: '启动报表生成失败' };
        } catch (error) {
          return { success: false, message: '网络错误，无法启动生成' };
        }

      case 'progress':
        try {
          // 获取用户的所有任务
          const response = await taskApi.getByUser();
          if (response.success) {
            const activeTasks = (response.data as any)?.filter((task: any) =>
              task.status === 'running' || task.status === 'pending'
            );
            return {
              success: true,
              data: activeTasks,
              message: `当前有 ${activeTasks?.length || 0} 个任务正在运行`
            };
          }
          return { success: false, message: '获取任务进度失败' };
        } catch (error) {
          return { success: false, message: '网络错误，无法获取进度' };
        }

      default:
        return { success: false, message: '不支持的报表操作' };
    }
  }

  // 处理任务操作
  private async handleTaskAction(action: SystemAction): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    switch (action.action) {
      case 'list':
        try {
          const response = await taskApi.getByUser();
          if (response.success) {
            this.context.currentTasks = response.data as any;
            return {
              success: true,
              data: response.data,
              message: `当前有 ${(response.data as any)?.length || 0} 个任务`
            };
          }
          return { success: false, message: '获取任务列表失败' };
        } catch (error) {
          return { success: false, message: '网络错误，无法获取任务' };
        }

      default:
        return { success: false, message: '不支持的任务操作' };
    }
  }

  // 处理导航操作
  private async handleNavigationAction(action: SystemAction): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    const navigationMap: Record<string, string> = {
      'dashboard': '/',
      'projects': '/projects',
      'reports': '/reports',
      'settings': '/settings',
      'analytics': '/analytics'
    };

    const path = navigationMap[action.action];
    if (path) {
      return {
        success: true,
        data: { action: 'navigate', path },
        message: `正在为您跳转到${action.description}...`
      };
    }

    return { success: false, message: '无法识别的页面' };
  }

  // 生成系统状态摘要
  async generateSystemSummary(): Promise<string> {
    try {
      const summary: string[] = [];

      // 项目信息
      if (this.context.currentProject) {
        summary.push(`📋 **当前项目**: ${this.context.currentProject.name || '未命名项目'}`);
      } else {
        summary.push('📋 **当前项目**: 无（建议先创建项目）');
      }

      // 任务状态
      if (this.context.currentTasks?.length) {
        const runningTasks = this.context.currentTasks.filter(task => task.status === 'running').length;
        summary.push(`⚡ **运行中任务**: ${runningTasks} 个`);
      } else {
        summary.push('⚡ **运行中任务**: 无');
      }

      // 系统状态
      summary.push('🟢 **系统状态**: 正常运行');

      return summary.join('\n');
    } catch (error) {
      return '❌ **系统状态**: 获取信息失败';
    }
  }

  // 获取操作建议
  getActionSuggestions(userInput?: string): string[] {
    const suggestions: string[] = [];

    // 基于上下文的建议
    if (!this.context.currentProject) {
      suggestions.push('创建新项目');
    } else {
      suggestions.push('开始生成报表', '查看项目详情');
    }

    if (this.context.currentTasks?.length) {
      suggestions.push('查看任务进度');
    }

    // 基于用户输入的建议
    if (userInput) {
      const input = userInput.toLowerCase();
      if (input.includes('帮助') || input.includes('怎么')) {
        suggestions.push('查看使用指南', '联系技术支持');
      }
    }

    // 通用建议
    suggestions.push('查看系统状态', '打开仪表板');

    return suggestions.slice(0, 4); // 限制建议数量
  }
}

// 创建全局实例
export const aiSystemInteraction = new AISystemInteraction();

// 工具函数：格式化系统操作结果为聊天消息
export function formatSystemActionResult(
  action: SystemAction,
  result: { success: boolean; data?: any; message: string }
): string {
  if (!result.success) {
    return `❌ **${action.description}失败**\n\n${result.message}`;
  }

  let message = `✅ **${action.description}成功**\n\n${result.message}`;

  // 根据操作类型添加额外信息
  if (action.type === 'project' && result.data) {
    if (Array.isArray(result.data)) {
      message += `\n\n📋 **项目列表**:\n${result.data.map((p: any, i: number) =>
        `${i + 1}. ${p.name} (${p.status})`).join('\n')}`;
    }
  }

  if (action.type === 'task' && result.data) {
    if (Array.isArray(result.data)) {
      const runningTasks = result.data.filter((t: any) => t.status === 'running');
      if (runningTasks.length > 0) {
        message += `\n\n⚡ **运行中任务**:\n${runningTasks.map((t: any, i: number) =>
          `${i + 1}. ${t.type} - ${t.progress}%`).join('\n')}`;
      }
    }
  }

  return message;
}

// 工具函数：检查用户输入是否包含系统操作意图
export function hasSystemIntent(userInput: string): boolean {
  const input = userInput.toLowerCase();
  const keywords = [
    '项目', '创建', '生成', '报告', '报表', '任务', '进度',
    '状态', '跳转', '打开', '页面', '仪表板', '设置'
  ];

  return keywords.some(keyword => input.includes(keyword));
}