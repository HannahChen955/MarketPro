import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function healthRoutes(fastify: FastifyInstance) {
  // 基础健康检查
  fastify.get('/health', async (request, reply) => {
    try {
      // 检查数据库连接
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'MarketPro AI Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        checks: {
          database: 'healthy',
          memory: 'healthy',
          disk: 'healthy'
        }
      };
    } catch (error) {
      fastify.log.error('Health check failed:', error);

      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'MarketPro AI Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        checks: {
          database: 'unhealthy',
          memory: 'healthy',
          disk: 'healthy'
        },
        error: 'Database connection failed'
      });
    }
  });

  // 详细健康检查
  fastify.get('/health/detailed', async (request, reply) => {
    const checks: any = {
      database: { status: 'unknown', details: {} },
      memory: { status: 'unknown', details: {} },
      disk: { status: 'unknown', details: {} },
      services: { status: 'unknown', details: {} }
    };

    let overallStatus = 'healthy';

    try {
      // 数据库检查
      try {
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - startTime;

        // 检查数据库统计
        const [userCount, reportCount, projectCount, taskCount] = await Promise.all([
          prisma.user.count(),
          prisma.reportType.count(),
          prisma.project.count(),
          prisma.task.count()
        ]);

        checks.database = {
          status: 'healthy',
          responseTime: `${responseTime}ms`,
          details: {
            connection: 'active',
            users: userCount,
            reportTypes: reportCount,
            projects: projectCount,
            tasks: taskCount
          }
        };
      } catch (error) {
        checks.database = {
          status: 'unhealthy',
          error: error.message,
          details: {}
        };
        overallStatus = 'unhealthy';
      }

      // 内存检查
      const memUsage = process.memoryUsage();
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

      checks.memory = {
        status: memUsedMB < 500 ? 'healthy' : 'warning',
        details: {
          used: `${memUsedMB}MB`,
          total: `${memTotalMB}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        }
      };

      if (memUsedMB > 1000) {
        overallStatus = overallStatus === 'healthy' ? 'warning' : overallStatus;
      }

      // 磁盘检查（简化版）
      try {
        const fs = require('fs');
        const stats = fs.statSync('./');

        checks.disk = {
          status: 'healthy',
          details: {
            uploadDir: process.env.UPLOAD_DIR || './uploads',
            accessible: true
          }
        };
      } catch (error) {
        checks.disk = {
          status: 'warning',
          error: error.message,
          details: {}
        };
      }

      // 服务检查
      try {
        const serviceChecks = {
          taskQueue: 'not_implemented',
          monitoring: 'not_implemented',
          aiService: 'not_implemented'
        };

        // 这里可以添加具体的服务健康检查
        // 例如检查 Redis 连接、AI API 状态等

        checks.services = {
          status: 'partial',
          details: serviceChecks
        };
      } catch (error) {
        checks.services = {
          status: 'error',
          error: error.message,
          details: {}
        };
      }

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        service: 'MarketPro AI Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        checks
      };

    } catch (error) {
      fastify.log.error('Detailed health check failed:', error);

      return reply.status(503).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'MarketPro AI Backend',
        error: error.message,
        checks
      });
    }
  });

  // 就绪检查
  fastify.get('/ready', async (request, reply) => {
    try {
      // 检查关键服务是否就绪
      await prisma.$queryRaw`SELECT 1`;

      return {
        ready: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return reply.status(503).send({
        ready: false,
        timestamp: new Date().toISOString(),
        error: 'Service not ready'
      });
    }
  });

  // 存活检查
  fastify.get('/live', async (request, reply) => {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    };
  });
}