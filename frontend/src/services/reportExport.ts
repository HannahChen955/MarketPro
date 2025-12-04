'use client';

import { GeneratedReport } from './reportGeneration';

export type ExportFormat = 'pdf' | 'word' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeCharts?: boolean;
  customStyles?: boolean;
}

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
}

export class ReportExportService {
  private static instance: ReportExportService;

  public static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService();
    }
    return ReportExportService.instance;
  }

  /**
   * Export report to specified format
   */
  async exportReport(
    report: GeneratedReport,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        stage: 'preparing',
        progress: 10,
        message: '准备导出文件...'
      });

      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(report, options, onProgress);
          break;
        case 'word':
          await this.exportToWord(report, options, onProgress);
          break;
        case 'excel':
          await this.exportToExcel(report, options, onProgress);
          break;
        default:
          throw new Error(`不支持的导出格式: ${options.format}`);
      }

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: '导出完成'
      });
    } catch (error) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `导出失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
      throw error;
    }
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(
    report: GeneratedReport,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: '生成PDF文档...'
    });

    // 动态导入 jsPDF 库
    const { jsPDF } = await import('jspdf');

    // 创建PDF文档
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 设置中文字体支持
    // 注意: 在实际项目中需要加载中文字体文件
    doc.setFont('helvetica');

    let yPosition = 20;
    const pageWidth = 210; // A4宽度
    const margins = { left: 20, right: 20, top: 20, bottom: 20 };
    const contentWidth = pageWidth - margins.left - margins.right;

    // 添加标题
    doc.setFontSize(20);
    doc.text(report.title, margins.left, yPosition);
    yPosition += 15;

    if (report.subtitle) {
      doc.setFontSize(14);
      doc.text(report.subtitle, margins.left, yPosition);
      yPosition += 10;
    }

    onProgress?.({
      stage: 'processing',
      progress: 50,
      message: '添加报告内容...'
    });

    // 添加执行摘要
    if (report.executiveSummary) {
      yPosition += 10;
      doc.setFontSize(16);
      doc.text('执行摘要', margins.left, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const summaryLines = this.splitTextToLines(report.executiveSummary, contentWidth, doc);
      summaryLines.forEach(line => {
        if (yPosition > 280) { // 接近页面底部时换页
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margins.left, yPosition);
        yPosition += 5;
      });
    }

    // 添加报告章节
    report.sections.forEach((section, index) => {
      yPosition += 15;

      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // 章节标题
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${section.title}`, margins.left, yPosition);
      yPosition += 10;

      // 章节内容
      doc.setFontSize(10);
      const contentLines = this.splitTextToLines(section.content, contentWidth, doc);
      contentLines.forEach(line => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margins.left, yPosition);
        yPosition += 5;
      });

      // 添加关键发现
      if (section.keyFindings && section.keyFindings.length > 0) {
        yPosition += 5;
        doc.setFontSize(11);
        doc.text('关键发现:', margins.left, yPosition);
        yPosition += 8;

        section.keyFindings.forEach(finding => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(9);
          doc.text(`• ${finding}`, margins.left + 5, yPosition);
          yPosition += 6;
        });
      }
    });

    // 添加结论和下一步行动
    if (report.conclusions.length > 0) {
      yPosition += 15;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('结论', margins.left, yPosition);
      yPosition += 10;

      report.conclusions.forEach(conclusion => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(10);
        doc.text(`• ${conclusion}`, margins.left, yPosition);
        yPosition += 6;
      });
    }

    if (report.nextSteps.length > 0) {
      yPosition += 15;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('下一步行动', margins.left, yPosition);
      yPosition += 10;

      report.nextSteps.forEach(step => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(10);
        doc.text(`• ${step}`, margins.left, yPosition);
        yPosition += 6;
      });
    }

    // 添加元数据（如果启用）
    if (options.includeMetadata) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.text('报告元数据', margins.left, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`生成时间: ${new Date(report.metadata.generatedAt).toLocaleString('zh-CN')}`, margins.left, yPosition);
      yPosition += 6;
      doc.text(`生成方式: ${report.metadata.generatedBy === 'ai' ? 'AI生成' : report.metadata.generatedBy === 'user' ? '用户创建' : '混合模式'}`, margins.left, yPosition);
      yPosition += 6;
      doc.text(`字数: ${report.metadata.wordCount.toLocaleString()}`, margins.left, yPosition);
      yPosition += 6;
      doc.text(`置信度: ${report.metadata.confidenceScore}%`, margins.left, yPosition);
      yPosition += 6;
      doc.text(`版本: ${report.metadata.version}`, margins.left, yPosition);
    }

    onProgress?.({
      stage: 'generating',
      progress: 90,
      message: '生成下载文件...'
    });

    // 下载文件
    const fileName = `${this.sanitizeFileName(report.title)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    onProgress?.({
      stage: 'downloading',
      progress: 100,
      message: '开始下载...'
    });
  }

  /**
   * Export to Word format
   */
  private async exportToWord(
    report: GeneratedReport,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: '生成Word文档...'
    });

    // 动态导入 docx 库
    const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } = await import('docx');

    const doc = new Document({
      sections: [{
        children: [
          // 标题
          new Paragraph({
            text: report.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),

          // 副标题
          ...(report.subtitle ? [new Paragraph({
            text: report.subtitle,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          })] : []),

          // 空行
          new Paragraph({ text: '' }),

          // 执行摘要
          ...(report.executiveSummary ? [
            new Paragraph({
              text: '执行摘要',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun(report.executiveSummary)],
            }),
            new Paragraph({ text: '' }),
          ] : []),

          // 报告章节
          ...report.sections.flatMap((section, index) => [
            new Paragraph({
              text: `${index + 1}. ${section.title}`,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun(section.content)],
            }),
            ...(section.keyFindings && section.keyFindings.length > 0 ? [
              new Paragraph({
                text: '关键发现:',
                heading: HeadingLevel.HEADING_2,
              }),
              ...section.keyFindings.map(finding =>
                new Paragraph({
                  children: [new TextRun(`• ${finding}`)],
                })
              ),
            ] : []),
            new Paragraph({ text: '' }),
          ]),

          // 结论
          ...(report.conclusions.length > 0 ? [
            new Paragraph({
              text: '结论',
              heading: HeadingLevel.HEADING_1,
            }),
            ...report.conclusions.map(conclusion =>
              new Paragraph({
                children: [new TextRun(`• ${conclusion}`)],
              })
            ),
            new Paragraph({ text: '' }),
          ] : []),

          // 下一步行动
          ...(report.nextSteps.length > 0 ? [
            new Paragraph({
              text: '下一步行动',
              heading: HeadingLevel.HEADING_1,
            }),
            ...report.nextSteps.map(step =>
              new Paragraph({
                children: [new TextRun(`• ${step}`)],
              })
            ),
            new Paragraph({ text: '' }),
          ] : []),

          // 元数据
          ...(options.includeMetadata ? [
            new Paragraph({
              text: '报告元数据',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun(`生成时间: ${new Date(report.metadata.generatedAt).toLocaleString('zh-CN')}`)],
            }),
            new Paragraph({
              children: [new TextRun(`生成方式: ${report.metadata.generatedBy === 'ai' ? 'AI生成' : report.metadata.generatedBy === 'user' ? '用户创建' : '混合模式'}`)],
            }),
            new Paragraph({
              children: [new TextRun(`字数: ${report.metadata.wordCount.toLocaleString()}`)],
            }),
            new Paragraph({
              children: [new TextRun(`置信度: ${report.metadata.confidenceScore}%`)],
            }),
            new Paragraph({
              children: [new TextRun(`版本: ${report.metadata.version}`)],
            }),
          ] : []),
        ],
      }],
    });

    onProgress?.({
      stage: 'generating',
      progress: 70,
      message: '打包Word文档...'
    });

    // 生成文档
    const buffer = await Packer.toBuffer(doc);

    onProgress?.({
      stage: 'downloading',
      progress: 90,
      message: '准备下载...'
    });

    // 下载文件
    const fileName = `${this.sanitizeFileName(report.title)}_${new Date().toISOString().split('T')[0]}.docx`;
    this.downloadBuffer(buffer, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  /**
   * Export to Excel format
   */
  private async exportToExcel(
    report: GeneratedReport,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: '生成Excel文档...'
    });

    // 动态导入 xlsx 库
    const XLSX = await import('xlsx');

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 创建概览工作表
    const overviewData = [
      ['报告标题', report.title],
      ['副标题', report.subtitle || ''],
      ['生成时间', new Date(report.metadata.generatedAt).toLocaleString('zh-CN')],
      ['生成方式', report.metadata.generatedBy === 'ai' ? 'AI生成' : report.metadata.generatedBy === 'user' ? '用户创建' : '混合模式'],
      ['字数', report.metadata.wordCount],
      ['置信度', `${report.metadata.confidenceScore}%`],
      ['版本', report.metadata.version],
      [],
      ['执行摘要'],
      [report.executiveSummary || ''],
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, '概览');

    onProgress?.({
      stage: 'processing',
      progress: 50,
      message: '添加章节数据...'
    });

    // 为每个章节创建工作表
    report.sections.forEach((section, index) => {
      const sectionData = [
        ['章节标题', section.title],
        ['章节内容'],
        [section.content],
        [],
        ['关键发现'],
        ...(section.keyFindings || []).map(finding => [finding]),
        [],
        ['数据分析'],
        ...(section.dataPoints || []).map(point => [
          point.metric,
          point.value,
          point.unit || '',
          point.trend || '',
          point.analysis || ''
        ])
      ];

      const sectionSheet = XLSX.utils.aoa_to_sheet(sectionData);
      const sheetName = `第${index + 1}章_${this.sanitizeSheetName(section.title)}`;
      XLSX.utils.book_append_sheet(workbook, sectionSheet, sheetName);
    });

    // 创建结论和行动计划工作表
    const conclusionData = [
      ['结论'],
      ...report.conclusions.map(conclusion => [conclusion]),
      [],
      ['下一步行动'],
      ...report.nextSteps.map(step => [step]),
    ];

    const conclusionSheet = XLSX.utils.aoa_to_sheet(conclusionData);
    XLSX.utils.book_append_sheet(workbook, conclusionSheet, '结论与行动');

    onProgress?.({
      stage: 'generating',
      progress: 80,
      message: '生成Excel文件...'
    });

    // 生成文件
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    onProgress?.({
      stage: 'downloading',
      progress: 90,
      message: '准备下载...'
    });

    // 下载文件
    const fileName = `${this.sanitizeFileName(report.title)}_${new Date().toISOString().split('T')[0]}.xlsx`;
    this.downloadBuffer(excelBuffer, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  /**
   * Split text into lines that fit within the given width
   */
  private splitTextToLines(text: string, width: number, doc: any): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth > width && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Sanitize filename for download
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '_') // 空格替换为下划线
      .substring(0, 50); // 限制长度
  }

  /**
   * Sanitize sheet name for Excel
   */
  private sanitizeSheetName(name: string): string {
    return name
      .replace(/[^\w\s]/g, '') // 移除特殊字符
      .replace(/\s+/g, '_') // 空格替换为下划线
      .substring(0, 20); // 限制长度
  }

  /**
   * Download buffer as file
   */
  private downloadBuffer(buffer: ArrayBuffer, fileName: string, mimeType: string): void {
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

export default ReportExportService;