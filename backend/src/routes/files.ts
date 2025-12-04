import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
import { createWriteStream, createReadStream } from 'fs';
import { mkdir, access, stat, unlink } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

// 配置文件存储目录
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function fileRoutes(fastify: FastifyInstance) {
  // 确保上传目录存在
  try {
    await access(UPLOAD_DIR);
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // 上传文件
  fastify.post('/api/files/upload', async (request, reply) => {
    try {
      const data = await request.file({
        limits: {
          fileSize: MAX_FILE_SIZE
        }
      });

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'NO_FILE_UPLOADED',
          message: '请选择要上传的文件'
        });
      }

      // 验证文件类型
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: '不支持的文件类型'
        });
      }

      // 生成文件哈希和路径
      const fileBuffer = await data.file.read();
      const fileHash = createHash('md5').update(fileBuffer).digest('hex');
      const fileExtension = data.filename?.split('.').pop() || 'bin';
      const storedFileName = `${fileHash}.${fileExtension}`;
      const filePath = join(UPLOAD_DIR, storedFileName);

      // 保存文件
      await pipeline(
        Buffer.from(fileBuffer),
        createWriteStream(filePath)
      );

      // 获取项目ID（如果提供）
      const projectId = data.fields?.projectId?.value;

      // 保存文件记录到数据库
      const file = await prisma.file.create({
        data: {
          originalName: data.filename || 'unknown',
          storedName: storedFileName,
          mimeType: data.mimetype,
          size: fileBuffer.length,
          path: filePath,
          hash: fileHash,
          projectId: projectId || null,
          uploadedBy: 'anonymous' // TODO: 从JWT token获取用户ID
        }
      });

      return reply.status(201).send({
        success: true,
        data: {
          id: file.id,
          originalName: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
          downloadUrl: `/api/files/${file.id}/download`
        },
        message: '文件上传成功'
      });
    } catch (error) {
      fastify.log.error('文件上传失败:', error);

      if (error.code === 'FST_FILES_LIMIT') {
        return reply.status(400).send({
          success: false,
          error: 'FILE_TOO_LARGE',
          message: '文件大小超过限制（最大50MB）'
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'UPLOAD_FAILED',
        message: '文件上传失败'
      });
    }
  });

  // 获取文件下载URL（用于生成临时下载链接）
  fastify.get('/api/files/:id/download', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        return reply.status(404).send({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: '文件不存在'
        });
      }

      // 检查文件是否存在于磁盘
      try {
        await access(file.path);
      } catch {
        return reply.status(404).send({
          success: false,
          error: 'FILE_NOT_FOUND_ON_DISK',
          message: '文件在存储中不存在'
        });
      }

      // 设置响应头
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      reply.header('Content-Type', file.mimeType);
      reply.header('Content-Length', file.size.toString());

      // 流式传输文件
      const fileStream = createReadStream(file.path);
      return reply.send(fileStream);
    } catch (error) {
      fastify.log.error('文件下载失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'DOWNLOAD_FAILED',
        message: '文件下载失败'
      });
    }
  });

  // 获取文件信息
  fastify.get('/api/files/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const file = await prisma.file.findUnique({
        where: { id },
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      });

      if (!file) {
        return reply.status(404).send({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: '文件不存在'
        });
      }

      return {
        success: true,
        data: {
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          uploadedAt: file.uploadedAt,
          project: file.project,
          downloadUrl: `/api/files/${file.id}/download`
        },
        message: '获取文件信息成功'
      };
    } catch (error) {
      fastify.log.error('获取文件信息失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_FILE_FAILED',
        message: '获取文件信息失败'
      });
    }
  });

  // 获取文件列表
  fastify.get('/api/files', async (request, reply) => {
    try {
      const query = request.query as {
        projectId?: string;
        mimeType?: string;
        page?: string;
        limit?: string;
      };

      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (query.projectId) {
        whereClause.projectId = query.projectId;
      }
      if (query.mimeType) {
        whereClause.mimeType = {
          startsWith: query.mimeType
        };
      }

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where: whereClause,
          include: {
            project: {
              select: { id: true, name: true }
            }
          },
          orderBy: { uploadedAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.file.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          files: files.map(file => ({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            uploadedAt: file.uploadedAt,
            project: file.project,
            downloadUrl: `/api/files/${file.id}/download`
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: '获取文件列表成功'
      };
    } catch (error) {
      fastify.log.error('获取文件列表失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_FILES_FAILED',
        message: '获取文件列表失败'
      });
    }
  });

  // 删除文件
  fastify.delete('/api/files/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        return reply.status(404).send({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: '文件不存在'
        });
      }

      // 删除磁盘文件
      try {
        await unlink(file.path);
      } catch (error) {
        fastify.log.warn('删除磁盘文件失败:', error);
        // 继续删除数据库记录
      }

      // 删除数据库记录
      await prisma.file.delete({
        where: { id }
      });

      return {
        success: true,
        message: '文件删除成功'
      };
    } catch (error) {
      fastify.log.error('删除文件失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'DELETE_FILE_FAILED',
        message: '删除文件失败'
      });
    }
  });

  // 批量删除文件
  fastify.delete('/api/files', async (request, reply) => {
    try {
      const data = request.body as {
        fileIds: string[];
      };

      if (!data.fileIds || !Array.isArray(data.fileIds) || data.fileIds.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '请提供要删除的文件ID列表'
        });
      }

      const files = await prisma.file.findMany({
        where: {
          id: {
            in: data.fileIds
          }
        }
      });

      // 删除磁盘文件
      const deletePromises = files.map(async (file) => {
        try {
          await unlink(file.path);
        } catch (error) {
          fastify.log.warn(`删除磁盘文件失败: ${file.path}`, error);
        }
      });

      await Promise.all(deletePromises);

      // 删除数据库记录
      const deleteResult = await prisma.file.deleteMany({
        where: {
          id: {
            in: data.fileIds
          }
        }
      });

      return {
        success: true,
        data: {
          deletedCount: deleteResult.count,
          requestedCount: data.fileIds.length
        },
        message: `成功删除 ${deleteResult.count} 个文件`
      };
    } catch (error) {
      fastify.log.error('批量删除文件失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'BATCH_DELETE_FAILED',
        message: '批量删除文件失败'
      });
    }
  });

  // 获取存储统计信息
  fastify.get('/api/files/stats', async (request, reply) => {
    try {
      const [
        totalFiles,
        totalSize,
        typeStats
      ] = await Promise.all([
        prisma.file.count(),
        prisma.file.aggregate({
          _sum: {
            size: true
          }
        }),
        prisma.file.groupBy({
          by: ['mimeType'],
          _count: {
            mimeType: true
          },
          _sum: {
            size: true
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalFiles,
          totalSize: totalSize._sum.size || 0,
          typeStats: typeStats.map(stat => ({
            mimeType: stat.mimeType,
            count: stat._count.mimeType,
            size: stat._sum.size || 0
          }))
        },
        message: '获取存储统计成功'
      };
    } catch (error) {
      fastify.log.error('获取存储统计失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_STATS_FAILED',
        message: '获取存储统计失败'
      });
    }
  });
}