import { createHash } from 'crypto';
import { createWriteStream, createReadStream } from 'fs';
import { mkdir, access, stat, unlink, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { PrismaClient } from '@prisma/client';

export interface FileUploadResult {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  hash: string;
  downloadUrl: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export class FileService {
  private prisma: PrismaClient;
  private uploadDir: string;
  private maxFileSize: number;
  private allowedTypes: Set<string>;
  private allowedExtensions: Set<string>;

  constructor() {
    this.prisma = new PrismaClient();
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB default

    // 支持的文件类型
    this.allowedTypes = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]);

    // 支持的文件扩展名
    this.allowedExtensions = new Set([
      '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt',
      '.jpg', '.jpeg', '.png', '.gif', '.webp'
    ]);

    this.ensureUploadDirExists();
  }

  /**
   * 确保上传目录存在
   */
  private async ensureUploadDirExists(): Promise<void> {
    try {
      await access(this.uploadDir);
    } catch {
      await mkdir(this.uploadDir, { recursive: true });
      console.log(`📁 创建上传目录: ${this.uploadDir}`);
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    options: {
      projectId?: string;
      taskId?: string;
      uploadedBy?: string;
      validation?: FileValidationOptions;
    } = {}
  ): Promise<FileUploadResult> {
    try {
      // 验证文件
      await this.validateFile(fileBuffer, originalName, mimeType, options.validation);

      // 生成文件哈希和存储路径
      const fileHash = this.generateFileHash(fileBuffer);
      const fileExtension = extname(originalName);
      const storedName = `${fileHash}${fileExtension}`;
      const filePath = join(this.uploadDir, storedName);

      // 检查文件是否已存在
      const existingFile = await this.findFileByHash(fileHash);
      if (existingFile) {
        console.log(`📄 文件已存在，返回现有记录: ${originalName}`);
        return {
          id: existingFile.id,
          originalName: existingFile.originalName,
          storedName: existingFile.storedName,
          mimeType: existingFile.mimeType,
          size: existingFile.size,
          hash: existingFile.hash,
          downloadUrl: `/api/files/${existingFile.id}/download`
        };
      }

      // 保存文件到磁盘
      await this.saveFileToDisk(fileBuffer, filePath);

      // 保存文件记录到数据库
      const file = await this.saveFileRecord({
        originalName,
        storedName,
        mimeType,
        size: fileBuffer.length,
        path: filePath,
        hash: fileHash,
        projectId: options.projectId,
        taskId: options.taskId,
        uploadedBy: options.uploadedBy || 'anonymous'
      });

      console.log(`✅ 文件上传成功: ${originalName} -> ${storedName}`);

      return {
        id: file.id,
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        size: file.size,
        hash: file.hash,
        downloadUrl: `/api/files/${file.id}/download`
      };

    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<any> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    });

    if (!file) {
      throw new Error('文件不存在');
    }

    return file;
  }

  /**
   * 获取文件流
   */
  async getFileStream(fileId: string): Promise<{
    stream: any;
    file: any;
  }> {
    const file = await this.getFileInfo(fileId);

    try {
      await access(file.path);
    } catch {
      throw new Error('文件在存储中不存在');
    }

    const stream = createReadStream(file.path);

    return { stream, file };
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.getFileInfo(fileId);

    try {
      // 删除磁盘文件
      await unlink(file.path);
    } catch (error) {
      console.warn(`删除磁盘文件失败: ${file.path}`, error);
    }

    // 删除数据库记录
    await this.prisma.file.delete({
      where: { id: fileId }
    });

    console.log(`🗑️  文件删除成功: ${file.originalName}`);
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(fileIds: string[]): Promise<{
    deleted: number;
    failed: string[];
  }> {
    const failed: string[] = [];
    let deleted = 0;

    for (const fileId of fileIds) {
      try {
        await this.deleteFile(fileId);
        deleted++;
      } catch (error) {
        console.error(`删除文件失败: ${fileId}`, error);
        failed.push(fileId);
      }
    }

    return { deleted, failed };
  }

  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(olderThanDays: number = 30): Promise<{
    cleaned: number;
    errors: number;
  }> {
    const expireDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const expiredFiles = await this.prisma.file.findMany({
      where: {
        uploadedAt: {
          lt: expireDate
        },
        // 不删除关联到已完成项目的文件
        OR: [
          { projectId: null },
          {
            project: {
              status: {
                notIn: ['completed']
              }
            }
          }
        ]
      }
    });

    let cleaned = 0;
    let errors = 0;

    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file.id);
        cleaned++;
      } catch (error) {
        console.error(`清理过期文件失败: ${file.id}`, error);
        errors++;
      }
    }

    console.log(`🧹 清理过期文件完成: 清理 ${cleaned} 个文件, ${errors} 个失败`);

    return { cleaned, errors };
  }

  /**
   * 获取存储统计
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Array<{
      mimeType: string;
      count: number;
      size: number;
    }>;
    filesByDate: Array<{
      date: string;
      count: number;
      size: number;
    }>;
  }> {
    const [totalFiles, totalSizeResult, filesByType] = await Promise.all([
      this.prisma.file.count(),
      this.prisma.file.aggregate({
        _sum: { size: true }
      }),
      this.prisma.file.groupBy({
        by: ['mimeType'],
        _count: { mimeType: true },
        _sum: { size: true }
      })
    ]);

    // 获取按日期统计的文件（最近30天）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filesByDate = await this.prisma.$queryRaw`
      SELECT
        DATE(uploaded_at) as date,
        COUNT(*) as count,
        SUM(size) as size
      FROM "File"
      WHERE uploaded_at >= ${thirtyDaysAgo}
      GROUP BY DATE(uploaded_at)
      ORDER BY date DESC
    `;

    return {
      totalFiles,
      totalSize: totalSizeResult._sum.size || 0,
      filesByType: filesByType.map(stat => ({
        mimeType: stat.mimeType,
        count: stat._count.mimeType,
        size: stat._sum.size || 0
      })),
      filesByDate: filesByDate as any[]
    };
  }

  /**
   * 验证文件
   */
  private async validateFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: FileValidationOptions = {}
  ): Promise<void> {
    const maxSize = options.maxSize || this.maxFileSize;
    const allowedTypes = options.allowedTypes || Array.from(this.allowedTypes);
    const allowedExtensions = options.allowedExtensions || Array.from(this.allowedExtensions);

    // 检查文件大小
    if (buffer.length > maxSize) {
      throw new Error(`文件大小超过限制 (最大 ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // 检查文件类型
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`不支持的文件类型: ${mimeType}`);
    }

    // 检查文件扩展名
    const extension = extname(originalName).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`不支持的文件扩展名: ${extension}`);
    }

    // 检查文件名
    if (!originalName || originalName.trim().length === 0) {
      throw new Error('文件名不能为空');
    }

    // 检查文件内容（防止恶意文件）
    await this.validateFileContent(buffer, mimeType);
  }

  /**
   * 验证文件内容
   */
  private async validateFileContent(buffer: Buffer, mimeType: string): Promise<void> {
    // 检查文件头部签名
    const signatures: Record<string, Buffer[]> = {
      'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
      'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF]),
      ],
      'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
    };

    const expectedSignatures = signatures[mimeType];
    if (expectedSignatures) {
      const matchesSignature = expectedSignatures.some(signature =>
        buffer.subarray(0, signature.length).equals(signature)
      );

      if (!matchesSignature) {
        throw new Error('文件内容与声明的类型不符');
      }
    }
  }

  /**
   * 生成文件哈希
   */
  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * 根据哈希查找文件
   */
  private async findFileByHash(hash: string): Promise<any> {
    return await this.prisma.file.findFirst({
      where: { hash }
    });
  }

  /**
   * 保存文件到磁盘
   */
  private async saveFileToDisk(buffer: Buffer, filePath: string): Promise<void> {
    const writeStream = createWriteStream(filePath);
    writeStream.write(buffer);
    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  /**
   * 保存文件记录到数据库
   */
  private async saveFileRecord(fileData: {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    path: string;
    hash: string;
    projectId?: string;
    taskId?: string;
    uploadedBy: string;
  }): Promise<any> {
    return await this.prisma.file.create({
      data: fileData
    });
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    storage: {
      available: boolean;
      totalFiles: number;
      totalSize: number;
    };
  }> {
    try {
      // 检查存储目录
      await access(this.uploadDir);

      // 获取统计信息
      const stats = await this.getStorageStats();

      return {
        status: 'healthy',
        storage: {
          available: true,
          totalFiles: stats.totalFiles,
          totalSize: stats.totalSize
        }
      };
    } catch (error) {
      console.error('文件服务健康检查失败:', error);
      return {
        status: 'error',
        storage: {
          available: false,
          totalFiles: 0,
          totalSize: 0
        }
      };
    }
  }
}