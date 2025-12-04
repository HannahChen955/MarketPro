import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function authRoutes(fastify: FastifyInstance) {
  // 登录
  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '邮箱和密码为必填项'
        });
      }

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: '邮箱或密码错误'
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: '邮箱或密码错误'
        });
      }

      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // 生成JWT token
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          },
          token
        },
        message: '登录成功'
      };
    } catch (error) {
      fastify.log.error('登录失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'LOGIN_FAILED',
        message: '登录失败，请稍后重试'
      });
    }
  });

  // 注册（简化版，实际应用可能需要邮箱验证等）
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { email, password, name } = request.body as {
        email: string;
        password: string;
        name: string;
      };

      if (!email || !password || !name) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '邮箱、密码和姓名为必填项'
        });
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.status(400).send({
          success: false,
          error: 'INVALID_EMAIL',
          message: '邮箱格式不正确'
        });
      }

      // 验证密码强度
      if (password.length < 6) {
        return reply.status(400).send({
          success: false,
          error: 'WEAK_PASSWORD',
          message: '密码长度至少6位'
        });
      }

      // 检查邮箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: 'EMAIL_EXISTS',
          message: '邮箱已被注册'
        });
      }

      // 加密密码
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'user'
        }
      });

      // 生成JWT token
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          },
          token
        },
        message: '注册成功'
      });
    } catch (error) {
      fastify.log.error('注册失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'REGISTER_FAILED',
        message: '注册失败，请稍后重试'
      });
    }
  });

  // 获取当前用户信息
  fastify.get('/api/auth/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '请先登录'
        });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              projects: true,
              tasks: true
            }
          }
        }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'USER_NOT_FOUND',
          message: '用户不存在'
        });
      }

      return {
        success: true,
        data: {
          user,
          stats: {
            projectCount: user._count.projects,
            taskCount: user._count.tasks
          }
        },
        message: '获取用户信息成功'
      };
    } catch (error) {
      fastify.log.error('获取用户信息失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_USER_FAILED',
        message: '获取用户信息失败'
      });
    }
  });

  // 更新用户信息
  fastify.put('/api/auth/profile', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '请先登录'
        });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { name, currentPassword, newPassword } = request.body as {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      };

      const updateData: any = {};

      // 更新姓名
      if (name) {
        updateData.name = name;
      }

      // 更新密码
      if (currentPassword && newPassword) {
        // 验证当前密码
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: 'USER_NOT_FOUND',
            message: '用户不存在'
          });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return reply.status(400).send({
            success: false,
            error: 'INVALID_CURRENT_PASSWORD',
            message: '当前密码错误'
          });
        }

        // 验证新密码强度
        if (newPassword.length < 6) {
          return reply.status(400).send({
            success: false,
            error: 'WEAK_PASSWORD',
            message: '新密码长度至少6位'
          });
        }

        const saltRounds = 12;
        updateData.password = await bcrypt.hash(newPassword, saltRounds);
      }

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'NO_UPDATE_DATA',
          message: '没有需要更新的数据'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLogin: true
        }
      });

      return {
        success: true,
        data: {
          user: updatedUser
        },
        message: '用户信息更新成功'
      };
    } catch (error) {
      fastify.log.error('更新用户信息失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'UPDATE_PROFILE_FAILED',
        message: '更新用户信息失败'
      });
    }
  });

  // 退出登录
  fastify.post('/api/auth/logout', async (request, reply) => {
    // 在客户端删除token即可，服务端无状态
    return {
      success: true,
      message: '退出登录成功'
    };
  });

  // 刷新token
  fastify.post('/api/auth/refresh', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: 'UNAUTHORIZED',
          message: '请先登录'
        });
      }
    }
  }, async (request, reply) => {
    try {
      const { userId, email, role } = request.user as {
        userId: string;
        email: string;
        role: string;
      };

      // 生成新的token
      const token = fastify.jwt.sign({
        userId,
        email,
        role
      });

      return {
        success: true,
        data: {
          token
        },
        message: 'Token刷新成功'
      };
    } catch (error) {
      fastify.log.error('刷新Token失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'REFRESH_TOKEN_FAILED',
        message: '刷新Token失败'
      });
    }
  });
}