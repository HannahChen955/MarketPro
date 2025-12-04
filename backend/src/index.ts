import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

// 导入路由
import { authRoutes } from './routes/auth';
import { reportRoutes } from './routes/reports';
import { taskRoutes } from './routes/tasks';
import { projectRoutes } from './routes/projects';
import { fileRoutes } from './routes/files';
import { statsRoutes } from './routes/stats';
import { healthRoutes } from './routes/health';
import { registerAIRoutes } from './routes/ai';
import { registerAnalysisRoutes } from './routes/analysis';
import { registerGenerationRoutes } from './routes/generation';
import { registerQualityRoutes } from './routes/quality';

// 导入服务
import { TaskQueueService } from './services/taskQueueService';
import { MonitoringService } from './services/monitoringService';

const port = parseInt(process.env.PORT || '9527');
const host = process.env.HOST || 'localhost';

async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty'
      } : undefined
    }
  });

  // 初始化数据库连接
  const prisma = new PrismaClient();
  fastify.decorate('prisma', prisma);

  // 初始化服务
  const taskQueue = new TaskQueueService();
  const monitoring = new MonitoringService();

  fastify.decorate('taskQueue', taskQueue);
  fastify.decorate('monitoring', monitoring);

  // 注册插件
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'development'
      ? ['http://localhost:5678', 'http://127.0.0.1:5678']
      : [process.env.FRONTEND_URL || 'https://yourdomain.com'],
    credentials: true
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    }
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production'
  });

  // 注册健康检查路由
  await fastify.register(healthRoutes);

  // API路由
  await fastify.register(authRoutes);
  await fastify.register(reportRoutes);
  await fastify.register(taskRoutes);
  await fastify.register(projectRoutes);
  await fastify.register(fileRoutes);
  await fastify.register(statsRoutes);
  await registerAIRoutes(fastify);
  await registerAnalysisRoutes(fastify);
  await registerGenerationRoutes(fastify);
  await registerQualityRoutes(fastify);

  // 全局错误处理
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // 验证错误
    if (error.validation) {
      reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation
      });
      return;
    }

    // JWT错误
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing authorization header'
      });
      return;
    }

    // 默认错误
    reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  });

  // 404处理
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`
    });
  });

  // 优雅关闭
  const shutdown = async () => {
    fastify.log.info('Shutting down server...');

    try {
      await taskQueue.close();
      await prisma.$disconnect();
      await fastify.close();
      process.exit(0);
    } catch (error) {
      fastify.log.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port, host });

    console.log(`
🚀 MarketPro AI Backend Server Started!
📍 Server: http://${host}:${port}
🏥 Health: http://${host}:${port}/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⚡ Ready to generate amazing reports!
    `);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();