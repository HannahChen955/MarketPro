import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function projectRoutes(fastify: FastifyInstance) {
  // 创建项目
  fastify.post('/api/projects', async (request, reply) => {
    try {
      const data = request.body as {
        name: string;
        description?: string;
        reportTypeId: string;
        config: any;
        userId?: string;
      };

      if (!data.name || !data.reportTypeId) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '项目名称和报告类型为必填项'
        });
      }

      // 验证报告类型是否存在
      const reportType = await prisma.reportType.findUnique({
        where: { id: data.reportTypeId }
      });

      if (!reportType) {
        return reply.status(404).send({
          success: false,
          error: 'REPORT_TYPE_NOT_FOUND',
          message: '报告类型不存在'
        });
      }

      const project = await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          reportTypeId: data.reportTypeId,
          config: data.config,
          status: 'draft',
          userId: data.userId || 'anonymous'
        },
        include: {
          reportType: true
        }
      });

      return reply.status(201).send({
        success: true,
        data: project,
        message: '项目创建成功'
      });
    } catch (error) {
      fastify.log.error('创建项目失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'CREATE_PROJECT_FAILED',
        message: '创建项目失败'
      });
    }
  });

  // 根据ID获取项目
  fastify.get('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          reportType: true,
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          files: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      if (!project) {
        return reply.status(404).send({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: '项目不存在'
        });
      }

      // 计算项目统计信息
      const stats = {
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter(t => t.status === 'completed').length,
        failedTasks: project.tasks.filter(t => t.status === 'failed').length,
        totalFiles: project.files.length
      };

      return {
        success: true,
        data: {
          ...project,
          stats
        },
        message: '获取项目详情成功'
      };
    } catch (error) {
      fastify.log.error('获取项目详情失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_PROJECT_FAILED',
        message: '获取项目详情失败'
      });
    }
  });

  // 获取用户的项目列表
  fastify.get('/api/projects', async (request, reply) => {
    try {
      const query = request.query as {
        userId?: string;
        status?: string;
        reportTypeId?: string;
        page?: string;
        limit?: string;
      };

      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (query.userId) {
        whereClause.userId = query.userId;
      }
      if (query.status) {
        whereClause.status = query.status;
      }
      if (query.reportTypeId) {
        whereClause.reportTypeId = query.reportTypeId;
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          include: {
            reportType: true,
            tasks: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            _count: {
              select: {
                tasks: true,
                files: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.project.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          projects: projects.map(project => ({
            ...project,
            stats: {
              totalTasks: project._count.tasks,
              totalFiles: project._count.files
            },
            lastTask: project.tasks[0] || null
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: '获取项目列表成功'
      };
    } catch (error) {
      fastify.log.error('获取项目列表失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_PROJECTS_FAILED',
        message: '获取项目列表失败'
      });
    }
  });

  // 更新项目
  fastify.put('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as {
        name?: string;
        description?: string;
        config?: any;
        status?: string;
      };

      const existingProject = await prisma.project.findUnique({
        where: { id }
      });

      if (!existingProject) {
        return reply.status(404).send({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: '项目不存在'
        });
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          reportType: true
        }
      });

      return {
        success: true,
        data: updatedProject,
        message: '项目更新成功'
      };
    } catch (error) {
      fastify.log.error('更新项目失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'UPDATE_PROJECT_FAILED',
        message: '更新项目失败'
      });
    }
  });

  // 开始生成报告
  fastify.post('/api/projects/:id/generate', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          reportType: true
        }
      });

      if (!project) {
        return reply.status(404).send({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: '项目不存在'
        });
      }

      // 检查是否有正在进行的任务
      const activeTasks = await prisma.task.count({
        where: {
          projectId: id,
          status: {
            in: ['pending', 'running']
          }
        }
      });

      if (activeTasks > 0) {
        return reply.status(400).send({
          success: false,
          error: 'TASK_IN_PROGRESS',
          message: '该项目有任务正在进行中'
        });
      }

      // 创建生成任务
      const task = await prisma.task.create({
        data: {
          projectId: id,
          reportTypeId: project.reportTypeId,
          type: 'generate_report',
          status: 'pending',
          stage: 'initializing',
          config: project.config,
          estimatedDuration: getEstimatedDuration(project.reportType.estimatedTime),
          startTime: new Date(),
          lastHeartbeat: new Date(),
          userId: project.userId
        }
      });

      // 更新项目状态
      await prisma.project.update({
        where: { id },
        data: {
          status: 'processing',
          updatedAt: new Date()
        }
      });

      // 创建初始心跳
      await prisma.taskHeartbeat.create({
        data: {
          taskId: task.id,
          stage: 'initializing',
          message: '开始生成报告',
          progress: 0
        }
      });

      // TODO: 将任务加入队列
      // await taskQueue.add('generateReport', { taskId: task.id, projectId: id });

      return {
        success: true,
        data: {
          taskId: task.id,
          project: {
            id: project.id,
            name: project.name,
            status: 'processing'
          }
        },
        message: '报告生成任务已启动'
      };
    } catch (error) {
      fastify.log.error('启动报告生成失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'START_GENERATION_FAILED',
        message: '启动报告生成失败'
      });
    }
  });

  // 获取项目的生成报告列表
  fastify.get('/api/projects/:id/reports', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return reply.status(404).send({
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: '项目不存在'
        });
      }

      // 获取已完成的任务（表示已生成的报告）
      const completedTasks = await prisma.task.findMany({
        where: {
          projectId: id,
          status: 'completed',
          type: 'generate_report'
        },
        include: {
          files: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const reports = completedTasks.map(task => ({
        id: task.id,
        createdAt: task.createdAt,
        endTime: task.endTime,
        config: task.config,
        files: task.files,
        downloadUrl: task.files.length > 0 ? `/api/files/${task.files[0].id}/download` : null
      }));

      return {
        success: true,
        data: {
          projectId: id,
          projectName: project.name,
          reports,
          total: reports.length
        },
        message: '获取生成报告列表成功'
      };
    } catch (error) {
      fastify.log.error('获取生成报告列表失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_REPORTS_FAILED',
        message: '获取生成报告列表失败'
      });
    }
  });

  // 删除项目
  fastify.delete('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // 检查是否有正在进行的任务
      const activeTasks = await prisma.task.count({
        where: {
          projectId: id,
          status: {
            in: ['pending', 'running']
          }
        }
      });

      if (activeTasks > 0) {
        return reply.status(400).send({
          success: false,
          error: 'ACTIVE_TASKS_EXIST',
          message: '项目有正在进行的任务，无法删除'
        });
      }

      // 删除相关数据
      await prisma.$transaction(async (tx) => {
        // 删除任务心跳记录
        await tx.taskHeartbeat.deleteMany({
          where: {
            task: {
              projectId: id
            }
          }
        });

        // 删除任务
        await tx.task.deleteMany({
          where: { projectId: id }
        });

        // 删除项目文件
        await tx.file.deleteMany({
          where: { projectId: id }
        });

        // 删除项目
        await tx.project.delete({
          where: { id }
        });
      });

      return {
        success: true,
        message: '项目删除成功'
      };
    } catch (error) {
      fastify.log.error('删除项目失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'DELETE_PROJECT_FAILED',
        message: '删除项目失败'
      });
    }
  });
}

// 辅助函数
function getEstimatedDuration(timeStr?: string): number {
  if (!timeStr) return 600000; // 默认10分钟

  const match = timeStr.match(/(\d+)-(\d+)分钟/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return ((min + max) / 2) * 60 * 1000; // 转换为毫秒
  }

  return 600000; // 默认10分钟
}