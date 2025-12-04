import { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { z } from 'zod';

const downloadRoutes: FastifyPluginAsync = async (fastify) => {
  // 单个报告下载
  fastify.get('/download/:reportId', {
    schema: {
      params: z.object({
        reportId: z.string()
      }),
      response: {
        200: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  }, async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    try {
      // 查询报告信息
      const report = await fastify.prisma.generatedReport.findUnique({
        where: { id: reportId },
        include: {
          project: true,
          reportType: true
        }
      });

      if (!report) {
        return reply.status(404).send({ error: '报告不存在' });
      }

      // 检查文件是否存在
      const filePath = path.join(process.cwd(), 'uploads', report.filePath);
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: '报告文件不存在' });
      }

      // 记录下载历史
      await fastify.prisma.downloadHistory.create({
        data: {
          reportId: report.id,
          projectId: report.projectId,
          downloadedAt: new Date(),
          fileSize: report.fileSize,
          downloadType: 'single'
        }
      });

      // 设置响应头
      const fileName = `${report.project.name}_${report.reportType.name}_v${report.version}.pdf`;
      reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Length', report.fileSize);

      // 发送文件
      const fileStream = fs.createReadStream(filePath);
      reply.send(fileStream);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '下载失败' });
    }
  });

  // 批量报告下载（ZIP打包）
  fastify.post('/batch-download', {
    schema: {
      body: z.object({
        reportIds: z.array(z.string()),
        fileName: z.string().optional()
      }),
      response: {
        200: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  }, async (request, reply) => {
    const { reportIds, fileName = `reports_${Date.now()}.zip` } = request.body as {
      reportIds: string[];
      fileName?: string;
    };

    try {
      // 查询所有报告
      const reports = await fastify.prisma.generatedReport.findMany({
        where: {
          id: { in: reportIds },
          status: 'completed'
        },
        include: {
          project: true,
          reportType: true
        }
      });

      if (reports.length === 0) {
        return reply.status(404).send({ error: '没有找到可下载的报告' });
      }

      // 创建ZIP文件
      const zip = new JSZip();
      let totalSize = 0;

      for (const report of reports) {
        const filePath = path.join(process.cwd(), 'uploads', report.filePath);

        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath);
          const zipFileName = `${report.project.name}_${report.reportType.name}_v${report.version}.pdf`;
          zip.file(zipFileName, fileContent);
          totalSize += report.fileSize;
        }
      }

      // 生成ZIP文件
      const zipContent = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // 记录批量下载历史
      await fastify.prisma.downloadHistory.create({
        data: {
          projectId: reports[0].projectId,
          downloadedAt: new Date(),
          fileSize: zipContent.length,
          downloadType: 'batch',
          reportCount: reports.length,
          metadata: {
            reportIds: reportIds,
            originalSize: totalSize
          }
        }
      });

      // 设置响应头
      reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Length', zipContent.length);

      // 发送ZIP文件
      reply.send(zipContent);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '批量下载失败' });
    }
  });

  // 报告预览
  fastify.get('/preview/:reportId', {
    schema: {
      params: z.object({
        reportId: z.string()
      })
    }
  }, async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    try {
      const report = await fastify.prisma.generatedReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return reply.status(404).send({ error: '报告不存在' });
      }

      const filePath = path.join(process.cwd(), 'uploads', report.filePath);
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: '报告文件不存在' });
      }

      // 设置预览响应头
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'inline');

      // 发送文件用于预览
      const fileStream = fs.createReadStream(filePath);
      reply.send(fileStream);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '预览失败' });
    }
  });

  // 生成分享链接
  fastify.post('/share', {
    schema: {
      body: z.object({
        reportId: z.string(),
        expiryDays: z.number().optional().default(7),
        password: z.string().optional(),
        allowDownload: z.boolean().optional().default(true)
      })
    }
  }, async (request, reply) => {
    const {
      reportId,
      expiryDays = 7,
      password,
      allowDownload = true
    } = request.body as {
      reportId: string;
      expiryDays?: number;
      password?: string;
      allowDownload?: boolean;
    };

    try {
      // 检查报告是否存在
      const report = await fastify.prisma.generatedReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return reply.status(404).send({ error: '报告不存在' });
      }

      // 生成分享令牌
      const shareToken = fastify.generateId();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      // 创建分享记录
      const shareRecord = await fastify.prisma.reportShare.create({
        data: {
          id: shareToken,
          reportId: reportId,
          expiryDate: expiryDate,
          password: password,
          allowDownload: allowDownload,
          createdAt: new Date(),
          accessCount: 0
        }
      });

      // 生成分享URL
      const shareUrl = `${process.env.FRONTEND_URL}/shared/reports/${shareToken}`;

      return {
        shareUrl,
        expiryDate: expiryDate.toISOString(),
        hasPassword: !!password,
        allowDownload
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '分享链接生成失败' });
    }
  });

  // 获取下载历史
  fastify.get('/download-history/:projectId', {
    schema: {
      params: z.object({
        projectId: z.string()
      }),
      querystring: z.object({
        page: z.string().optional(),
        limit: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { page = '1', limit = '20' } = request.query as {
      page?: string;
      limit?: string;
    };

    try {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const [history, total] = await Promise.all([
        fastify.prisma.downloadHistory.findMany({
          where: { projectId },
          include: {
            report: {
              include: {
                reportType: true
              }
            }
          },
          orderBy: { downloadedAt: 'desc' },
          skip,
          take: limitNumber
        }),
        fastify.prisma.downloadHistory.count({
          where: { projectId }
        })
      ]);

      return {
        data: history,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber)
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '获取下载历史失败' });
    }
  });

  // 删除分享链接
  fastify.delete('/share/:shareToken', {
    schema: {
      params: z.object({
        shareToken: z.string()
      })
    }
  }, async (request, reply) => {
    const { shareToken } = request.params as { shareToken: string };

    try {
      await fastify.prisma.reportShare.delete({
        where: { id: shareToken }
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '删除分享链接失败' });
    }
  });

  // 获取报告分享状态
  fastify.get('/shares/:reportId', {
    schema: {
      params: z.object({
        reportId: z.string()
      })
    }
  }, async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    try {
      const shares = await fastify.prisma.reportShare.findMany({
        where: {
          reportId,
          expiryDate: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        shares: shares.map(share => ({
          id: share.id,
          expiryDate: share.expiryDate,
          hasPassword: !!share.password,
          allowDownload: share.allowDownload,
          accessCount: share.accessCount,
          createdAt: share.createdAt
        }))
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: '获取分享状态失败' });
    }
  });
};

export default downloadRoutes;