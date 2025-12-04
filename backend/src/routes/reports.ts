import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const prisma = new PrismaClient();

export async function reportRoutes(fastify: FastifyInstance) {
  // 获取所有报告类型
  fastify.get('/api/reports', async (request, reply) => {
    try {
      const reports = await prisma.reportType.findMany({
        where: {
          status: {
            in: ['active', 'draft']
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: reports,
        message: '获取报告类型成功'
      };
    } catch (error) {
      fastify.log.error('获取报告类型失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_REPORTS_FAILED',
        message: '获取报告类型失败'
      });
    }
  });

  // 根据ID获取报告类型
  fastify.get('/api/reports/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const report = await prisma.reportType.findUnique({
        where: { id },
        include: {
          projects: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'REPORT_NOT_FOUND',
          message: '报告类型不存在'
        });
      }

      return {
        success: true,
        data: report,
        message: '获取报告类型详情成功'
      };
    } catch (error) {
      fastify.log.error('获取报告类型详情失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_REPORT_FAILED',
        message: '获取报告类型详情失败'
      });
    }
  });

  // 创建新的报告类型
  fastify.post('/api/reports', async (request, reply) => {
    try {
      const data = request.body as {
        name: string;
        description: string;
        icon?: string;
        category: string;
        estimatedTime?: string;
        config?: any;
      };

      // 验证必填字段
      if (!data.name || !data.description || !data.category) {
        return reply.status(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '报告名称、描述和分类为必填项'
        });
      }

      const report = await prisma.reportType.create({
        data: {
          name: data.name,
          description: data.description,
          icon: data.icon || '📄',
          category: data.category,
          estimatedTime: data.estimatedTime || '10-15分钟',
          status: 'active',
          config: data.config || {},
          version: 1
        }
      });

      return reply.status(201).send({
        success: true,
        data: report,
        message: '创建报告类型成功'
      });
    } catch (error) {
      fastify.log.error('创建报告类型失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'CREATE_REPORT_FAILED',
        message: '创建报告类型失败'
      });
    }
  });

  // 更新报告类型
  fastify.put('/api/reports/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as {
        name?: string;
        description?: string;
        icon?: string;
        category?: string;
        estimatedTime?: string;
        status?: string;
        config?: any;
      };

      // 检查报告类型是否存在
      const existingReport = await prisma.reportType.findUnique({
        where: { id }
      });

      if (!existingReport) {
        return reply.status(404).send({
          success: false,
          error: 'REPORT_NOT_FOUND',
          message: '报告类型不存在'
        });
      }

      const updatedReport = await prisma.reportType.update({
        where: { id },
        data: {
          ...data,
          version: existingReport.version + 1,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: updatedReport,
        message: '更新报告类型成功'
      };
    } catch (error) {
      fastify.log.error('更新报告类型失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'UPDATE_REPORT_FAILED',
        message: '更新报告类型失败'
      });
    }
  });

  // 删除报告类型
  fastify.delete('/api/reports/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // 检查是否有关联的项目
      const projectCount = await prisma.project.count({
        where: { reportTypeId: id }
      });

      if (projectCount > 0) {
        return reply.status(400).send({
          success: false,
          error: 'REPORT_IN_USE',
          message: '该报告类型下存在关联项目，无法删除'
        });
      }

      await prisma.reportType.delete({
        where: { id }
      });

      return {
        success: true,
        message: '删除报告类型成功'
      };
    } catch (error) {
      fastify.log.error('删除报告类型失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'DELETE_REPORT_FAILED',
        message: '删除报告类型失败'
      });
    }
  });

  // 分析上传的报告文件
  fastify.post('/api/reports/analyze', async (request, reply) => {
    try {
      // 处理文件上传
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'NO_FILE_UPLOADED',
          message: '请上传文件'
        });
      }

      // 验证文件类型
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: '仅支持 PDF 和 PPTX 文件'
        });
      }

      // TODO: 实现文件分析逻辑
      // 1. 保存文件到存储
      // 2. 调用AI分析文件内容
      // 3. 提取设计模式和内容结构
      // 4. 生成报告模板配置

      // 模拟分析结果
      const analysisResult = {
        fileName: data.filename,
        fileType: data.mimetype,
        extractedStructure: {
          sections: ['封面', '目录', '市场概览', '竞品分析', '结论与建议'],
          designPatterns: {
            colorScheme: ['#2563eb', '#1d4ed8', '#1e40af'],
            fonts: ['Microsoft YaHei', 'Arial'],
            layout: 'professional'
          }
        },
        suggestedConfig: {
          reportType: '市场分析报告',
          estimatedTime: '12-15分钟',
          requiredFields: ['项目名称', '分析区域', '竞品项目', '时间范围']
        }
      };

      return {
        success: true,
        data: analysisResult,
        message: '文件分析完成'
      };
    } catch (error) {
      fastify.log.error('文件分析失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'ANALYSIS_FAILED',
        message: '文件分析失败'
      });
    }
  });

  // 获取项目的生成报告列表
  fastify.get('/api/reports/generated/:projectId', async (request, reply) => {
    try {
      const { projectId } = request.params as { projectId: string };

      const reports = await prisma.generatedReport.findMany({
        where: { projectId },
        include: {
          reportType: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      return {
        success: true,
        data: reports,
        message: '获取生成报告列表成功'
      };
    } catch (error) {
      fastify.log.error('获取生成报告列表失败:', error);
      return reply.status(500).send({
        success: false,
        error: 'FETCH_GENERATED_REPORTS_FAILED',
        message: '获取生成报告列表失败'
      });
    }
  });

  // 单个报告下载
  fastify.get('/api/reports/download/:reportId', async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    try {
      // 查询报告信息
      const report = await prisma.generatedReport.findUnique({
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
      await prisma.downloadHistory.create({
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
  fastify.post('/api/reports/batch-download', async (request, reply) => {
    const { reportIds, fileName = `reports_${Date.now()}.zip` } = request.body as {
      reportIds: string[];
      fileName?: string;
    };

    try {
      // 查询所有报告
      const reports = await prisma.generatedReport.findMany({
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
      await prisma.downloadHistory.create({
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
  fastify.get('/api/reports/preview/:reportId', async (request, reply) => {
    const { reportId } = request.params as { reportId: string };

    try {
      const report = await prisma.generatedReport.findUnique({
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
  fastify.post('/api/reports/share', async (request, reply) => {
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
      const report = await prisma.generatedReport.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        return reply.status(404).send({ error: '报告不存在' });
      }

      // 生成分享令牌
      const shareToken = `share_${Math.random().toString(36).substring(2, 15)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      // 创建分享记录
      await prisma.reportShare.create({
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
  fastify.get('/api/reports/download-history/:projectId', async (request, reply) => {
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
        prisma.downloadHistory.findMany({
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
        prisma.downloadHistory.count({
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
}