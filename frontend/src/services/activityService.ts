// 活动记录服务
export interface Activity {
  id: string;
  type: 'report_generated' | 'data_updated' | 'competitor_added' | 'phase_changed' | 'database_edited';
  description: string;
  timestamp: Date;
  color: string;
}

class ActivityService {
  // 保存活动到localStorage
  saveActivity(projectId: string, activity: Activity) {
    if (typeof window !== 'undefined') {
      try {
        const existingActivities = localStorage.getItem(`activities_${projectId}`);
        const activities = existingActivities ? JSON.parse(existingActivities) : [];
        activities.unshift(activity);
        localStorage.setItem(`activities_${projectId}`, JSON.stringify(activities.slice(0, 20))); // 只保存最近20条
        console.log('活动已记录:', activity.description);
      } catch (error) {
        console.warn('无法保存活动记录:', error);
      }
    }
  }

  // 读取活动历史
  getActivities(projectId: string): Activity[] {
    if (typeof window !== 'undefined') {
      try {
        const savedActivities = localStorage.getItem(`activities_${projectId}`);
        if (savedActivities) {
          const parsed = JSON.parse(savedActivities);
          return parsed.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }));
        }
      } catch (error) {
        console.warn('无法读取活动历史:', error);
      }
    }
    return [];
  }

  // 记录报告生成活动
  recordReportGeneration(projectId: string, reportType: string, reportTitle: string) {
    const activity: Activity = {
      id: `report_${Date.now()}`,
      type: 'report_generated',
      description: `生成了${reportType === 'competitor-analysis' ? '竞品分析' : reportType === 'overall-marketing-strategy' ? '营销策略' : '研究'}报告：${reportTitle}`,
      timestamp: new Date(),
      color: 'bg-green-500'
    };
    this.saveActivity(projectId, activity);
  }

  // 记录数据更新活动
  recordDataUpdate(projectId: string, dataType: string) {
    const activity: Activity = {
      id: `data_${Date.now()}`,
      type: 'data_updated',
      description: `更新了${dataType}`,
      timestamp: new Date(),
      color: 'bg-blue-500'
    };
    this.saveActivity(projectId, activity);
  }

  // 记录竞品添加活动
  recordCompetitorAdded(projectId: string, competitorName: string) {
    const activity: Activity = {
      id: `competitor_${Date.now()}`,
      type: 'competitor_added',
      description: `添加了新的竞品项目：${competitorName}`,
      timestamp: new Date(),
      color: 'bg-purple-500'
    };
    this.saveActivity(projectId, activity);
  }

  // 记录阶段变更活动
  recordPhaseChange(projectId: string, phaseName: string, newStatus: string) {
    const activity: Activity = {
      id: `phase_${Date.now()}`,
      type: 'phase_changed',
      description: `将${phaseName}状态更改为"${newStatus}"`,
      timestamp: new Date(),
      color: 'bg-indigo-500'
    };
    this.saveActivity(projectId, activity);
  }

  // 记录数据库编辑活动
  recordDatabaseEdit(projectId: string, section: string) {
    const activity: Activity = {
      id: `db_${Date.now()}`,
      type: 'database_edited',
      description: `编辑了${section}数据`,
      timestamp: new Date(),
      color: 'bg-yellow-500'
    };
    this.saveActivity(projectId, activity);
  }
}

export const activityService = new ActivityService();