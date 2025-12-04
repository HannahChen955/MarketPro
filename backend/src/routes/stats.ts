import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function statsRoutes(fastify: FastifyInstance) {
  // 获取仪表板统计数据
  fastify.get('/api/stats/dashboard', async (request, reply) => {
    try {
      const query = request.query as {
        userId?: string;
      };

      // 构建查询条件
      const whereClause = query.userId ? { userId: query.userId } : {};

      // 并行查询各项统计数据
      const [
        totalReports,
        monthlyReports,
        totalProjects,
        completedTasks,
        failedTasks,
        activeTasks,
        totalFiles,
        recentProjects,
        recentTasks
      ] = await Promise.all([
        // 总报告数（已完成的任务）
        prisma.task.count({
          where: {
            ...whereClause,
            status: 'completed',
            type: 'generate_report'
          }
        }),

        // 本月报告数
        prisma.task.count({
          where: {
            ...whereClause,
            status: 'completed',
            type: 'generate_report',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),

        // 项目总数
        prisma.project.count({
          where: whereClause
        }),

        // 已完成任务数
        prisma.task.count({
          where: {
            ...whereClause,
            status: 'completed'
          }
        }),

        // 失败任务数
        prisma.task.count({
          where: {
            ...whereClause,
            status: 'failed'
          }
        }),

        // 活跃任务数
        prisma.task.count({
          where: {
            ...whereClause,
            status: {
              in: ['pending', 'running']
            }
          }
        }),

        // 文件总数
        prisma.file.count({
          where: query.userId ? {
            project: {
              userId: query.userId
            }
          } : {}
        }),

        // 最近项目
        prisma.project.findMany({
          where: whereClause,
          include: {
            reportType: true,
            _count: {
              select: {
                tasks: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        }),

        // 最近任务
        prisma.task.findMany({
          where: whereClause,
          include: {
            reportType: true,
            project: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      // 计算效率指标
      const totalTasks = completedTasks + failedTasks + activeTasks;
      const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 计算节省时间（假设每个报告节省3小时）
      const timesSaved = totalReports * 3;

      return {
        success: true,
        data: {
          overview: {
            totalReports,
            monthlyIncrease: monthlyReports,
            timesSaved,
            efficiency: successRate,
            activeTemplates: 8 // 固定的模板数量
          },
          projects: {
            total: totalProjects,
            recent: recentProjects
          },
          tasks: {
            completed: completedTasks,
            failed: failedTasks,
            active: activeTasks,
            recent: recentTasks
          },
          files: {
            total: totalFiles
          }
        },
        message: '获取仪表板数据成功'
      };
    } catch (error) {
      fastify.log.error('获取仪表板数据失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_DASHBOARD_FAILED',
        message: '获取仪表板数据失败'
      });
    }
  });

  // 获取使用统计数据
  fastify.get('/api/stats/usage', async (request, reply) => {
    try {
      const query = request.query as {
        timeRange?: string;
        userId?: string;
      };

      const timeRange = query.timeRange || '7d';
      const whereClause = query.userId ? { userId: query.userId } : {};

      // 根据时间范围计算起始日期
      let startDate: Date;
      const now = new Date();

      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // 获取时间段内的数据
      const [
        reportsByTime,
        tasksByStatus,
        reportsByType,
        usageByHour
      ] = await Promise.all([
        // 按时间统计报告生成
        prisma.$queryRaw`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as count
          FROM tasks
          WHERE status = 'completed'
            AND type = 'generate_report'
            AND created_at >= ${startDate}
            ${query.userId ? prisma.$queryRaw`AND user_id = ${query.userId}` : prisma.$queryRaw``}
          GROUP BY DATE(created_at)
          ORDER BY date
        `,

        // 按状态统计任务
        prisma.task.groupBy({
          by: ['status'],
          _count: {
            status: true
          },
          where: {
            ...whereClause,
            createdAt: {
              gte: startDate
            }
          }
        }),

        // 按报告类型统计
        prisma.task.groupBy({
          by: ['reportTypeId'],
          _count: {
            reportTypeId: true
          },
          where: {
            ...whereClause,
            status: 'completed',
            type: 'generate_report',
            createdAt: {
              gte: startDate
            }
          }
        }),

        // 按小时统计使用情况（最近7天）
        prisma.$queryRaw`
          SELECT
            HOUR(created_at) as hour,
            COUNT(*) as count
          FROM tasks
          WHERE created_at >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}
            ${query.userId ? prisma.$queryRaw`AND user_id = ${query.userId}` : prisma.$queryRaw``}
          GROUP BY HOUR(created_at)
          ORDER BY hour
        `
      ]);

      // 获取报告类型名称
      const reportTypeIds = reportsByType.map(r => r.reportTypeId).filter(Boolean);
      const reportTypes = await prisma.reportType.findMany({
        where: {
          id: {
            in: reportTypeIds
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      // 组装报告类型统计数据
      const reportTypeStats = reportsByType.map(stat => ({
        reportTypeId: stat.reportTypeId,
        reportTypeName: reportTypes.find(rt => rt.id === stat.reportTypeId)?.name || '未知类型',
        count: stat._count.reportTypeId
      }));

      return {
        success: true,
        data: {
          timeRange,
          period: {
            start: startDate,
            end: now
          },
          trends: {
            reports: reportsByTime,
            tasks: tasksByStatus.map(stat => ({
              status: stat.status,
              count: stat._count.status
            })),
            reportTypes: reportTypeStats,
            hourlyUsage: usageByHour
          }
        },
        message: '获取使用统计成功'
      };
    } catch (error) {
      fastify.log.error('获取使用统计失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_USAGE_STATS_FAILED',
        message: '获取使用统计失败'
      });
    }
  });

  // 获取性能统计
  fastify.get('/api/stats/performance', async (request, reply) => {
    try {
      const query = request.query as {
        userId?: string;
      };

      const whereClause = query.userId ? { userId: query.userId } : {};

      // 获取任务性能数据
      const [
        averageDuration,
        tasksByDuration,
        successRate
      ] = await Promise.all([
        // 平均任务持续时间
        prisma.task.aggregate({
          where: {
            ...whereClause,
            status: 'completed',
            startTime: { not: null },
            endTime: { not: null }
          },
          _avg: {
            estimatedDuration: true
          }
        }),

        // 按持续时间分组统计
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN TIMESTAMPDIFF(MINUTE, start_time, end_time) < 5 THEN '<5min'
              WHEN TIMESTAMPDIFF(MINUTE, start_time, end_time) < 15 THEN '5-15min'
              WHEN TIMESTAMPDIFF(MINUTE, start_time, end_time) < 30 THEN '15-30min'
              ELSE '>30min'
            END as duration_range,
            COUNT(*) as count
          FROM tasks
          WHERE status = 'completed'
            AND start_time IS NOT NULL
            AND end_time IS NOT NULL
            ${query.userId ? prisma.$queryRaw`AND user_id = ${query.userId}` : prisma.$queryRaw``}
          GROUP BY duration_range
          ORDER BY duration_range
        `,

        // 成功率统计
        prisma.task.groupBy({
          by: ['status'],
          _count: {
            status: true
          },
          where: whereClause
        })
      ]);

      // 计算总体成功率
      const totalTasks = successRate.reduce((sum, stat) => sum + stat._count.status, 0);
      const completedTasks = successRate.find(stat => stat.status === 'completed')?._count.status || 0;
      const overallSuccessRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        success: true,
        data: {
          averageDuration: averageDuration._avg.estimatedDuration || 0,
          durationDistribution: tasksByDuration,
          successRate: {
            overall: overallSuccessRate,
            breakdown: successRate.map(stat => ({
              status: stat.status,
              count: stat._count.status,
              percentage: totalTasks > 0 ? Math.round((stat._count.status / totalTasks) * 100) : 0
            }))
          }
        },
        message: '获取性能统计成功'
      };
    } catch (error) {
      fastify.log.error('获取性能统计失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_PERFORMANCE_STATS_FAILED',
        message: '获取性能统计失败'
      });
    }
  });

  // 获取用户活跃度统计
  fastify.get('/api/stats/activity', async (request, reply) => {
    try {
      const query = request.query as {
        userId?: string;
        days?: string;
      };

      const days = parseInt(query.days || '30');
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // 获取用户活跃度数据
      const activityData = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users,
          COUNT(*) as total_actions
        FROM (
          SELECT created_at, user_id FROM tasks WHERE created_at >= ${startDate}
          UNION ALL
          SELECT created_at, user_id FROM projects WHERE created_at >= ${startDate}
        ) as user_activities
        ${query.userId ? prisma.$queryRaw`WHERE user_id = ${query.userId}` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      return {
        success: true,
        data: {
          period: days,
          startDate,
          endDate: new Date(),
          activity: activityData
        },
        message: '获取活跃度统计成功'
      };
    } catch (error) {
      fastify.log.error('获取活跃度统计失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_ACTIVITY_STATS_FAILED',
        message: '获取活跃度统计失败'
      });
    }
  });
}