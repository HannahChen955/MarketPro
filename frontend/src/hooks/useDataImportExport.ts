import { useState } from 'react';
import { Project, Competitor } from '@/types/project';

export interface ImportExportOptions {
  includeBasicInfo: boolean;
  includeCompetitors: boolean;
  includeTargetAudience: boolean;
  format: 'json' | 'excel' | 'csv';
}

export interface ImportResult {
  success: boolean;
  data?: Partial<Project>;
  errors?: string[];
  warnings?: string[];
}

export function useDataImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 导出数据
  const exportData = async (project: Project, options: ImportExportOptions): Promise<void> => {
    setIsExporting(true);
    try {
      const exportData = prepareExportData(project, options);

      if (options.format === 'json') {
        await exportAsJSON(exportData, project.name);
      } else if (options.format === 'csv') {
        await exportAsCSV(exportData, project.name, options);
      } else if (options.format === 'excel') {
        await exportAsExcel(exportData, project.name, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导入数据
  const importData = async (file: File, options: ImportExportOptions): Promise<ImportResult> => {
    setIsImporting(true);
    try {
      let result: ImportResult;

      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        result = await importFromJSON(file);
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        result = await importFromCSV(file, options);
      } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        result = await importFromExcel(file, options);
      } else {
        result = {
          success: false,
          errors: ['不支持的文件格式，请使用 JSON、CSV 或 Excel 文件']
        };
      }

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      return {
        success: false,
        errors: ['导入失败: ' + (error as Error).message]
      };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportData,
    importData,
    isExporting,
    isImporting
  };
}

// 准备导出数据
function prepareExportData(project: Project, options: ImportExportOptions): any {
  const exportData: any = {
    projectName: project.name,
    city: project.city,
    type: project.type,
    status: project.status,
    currentPhase: project.currentPhase,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  if (options.includeBasicInfo && project.basicInfo) {
    exportData.basicInfo = project.basicInfo;
  }

  if (options.includeCompetitors && project.competitors) {
    exportData.competitors = project.competitors;
  }

  if (options.includeTargetAudience && project.targetAudience) {
    exportData.targetAudience = project.targetAudience;
  }

  return exportData;
}

// 导出为 JSON
async function exportAsJSON(data: any, projectName: string): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}-项目数据-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出为 CSV
async function exportAsCSV(data: any, projectName: string, options: ImportExportOptions): Promise<void> {
  let csvContent = '';

  // 基础信息
  if (options.includeBasicInfo && data.basicInfo) {
    csvContent += '基础信息\n';
    csvContent += '字段,值\n';
    csvContent += `项目名称,${data.projectName || ''}\n`;
    csvContent += `所在城市,${data.city || ''}\n`;
    csvContent += `项目类型,${data.type || ''}\n`;

    if (data.basicInfo.location) {
      csvContent += `详细地址,${data.basicInfo.location.address || ''}\n`;
      csvContent += `所在区域,${data.basicInfo.location.district || ''}\n`;
    }

    if (data.basicInfo.scale) {
      csvContent += `用地面积,${data.basicInfo.scale.landArea || ''}\n`;
      csvContent += `建筑面积,${data.basicInfo.scale.buildingArea || ''}\n`;
      csvContent += `容积率,${data.basicInfo.scale.plotRatio || ''}\n`;
      csvContent += `绿化率,${data.basicInfo.scale.greenRate || ''}\n`;
    }

    csvContent += '\n';
  }

  // 竞品信息
  if (options.includeCompetitors && data.competitors && data.competitors.length > 0) {
    csvContent += '竞品信息\n';
    csvContent += '项目名称,地址,区域,最低价格,最高价格,月销量,总销量,优势,劣势\n';

    data.competitors.forEach((comp: Competitor) => {
      const advantages = comp.marketing?.strengths?.join(';') || '';
      const disadvantages = comp.marketing?.weaknesses?.join(';') || '';

      csvContent += `${comp.name || ''},${comp.location?.address || ''},${comp.location?.district || ''},${comp.product?.priceRange?.min || ''},${comp.product?.priceRange?.max || ''},${comp.sales?.monthlyVolume || ''},${comp.sales?.totalSold || ''},"${advantages}","${disadvantages}"\n`;
    });

    csvContent += '\n';
  }

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }); // BOM for Excel compatibility
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}-项目数据-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 导出为 Excel (简化版，实际应该使用库如 xlsx)
async function exportAsExcel(data: any, projectName: string, options: ImportExportOptions): Promise<void> {
  // 这里简化为导出 CSV，实际项目中应该使用 xlsx 库
  alert('Excel 导出功能需要安装 xlsx 库，当前以 CSV 格式导出');
  await exportAsCSV(data, projectName, options);
}

// 从 JSON 导入
async function importFromJSON(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // 验证数据结构
        const validationResult = validateImportedData(data);
        if (!validationResult.isValid) {
          resolve({
            success: false,
            errors: validationResult.errors
          });
          return;
        }

        resolve({
          success: true,
          data: data,
          warnings: validationResult.warnings
        });
      } catch (error) {
        resolve({
          success: false,
          errors: ['JSON 文件格式错误，请检查文件内容']
        });
      }
    };
    reader.readAsText(file);
  });
}

// 从 CSV 导入
async function importFromCSV(file: File, options: ImportExportOptions): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');

        // 解析 CSV 数据
        const data = parseCSVContent(lines, options);

        resolve({
          success: true,
          data: data,
          warnings: ['CSV 导入可能丢失部分复杂数据结构，建议检查导入结果']
        });
      } catch (error) {
        resolve({
          success: false,
          errors: ['CSV 文件解析失败: ' + (error as Error).message]
        });
      }
    };
    reader.readAsText(file);
  });
}

// 从 Excel 导入 (简化版)
async function importFromExcel(file: File, options: ImportExportOptions): Promise<ImportResult> {
  // 这里简化处理，实际应该使用 xlsx 库
  return {
    success: false,
    errors: ['Excel 导入功能需要安装 xlsx 库，请使用 JSON 或 CSV 格式']
  };
}

// 验证导入数据
function validateImportedData(data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 基本必需字段验证
  if (!data.projectName || typeof data.projectName !== 'string') {
    errors.push('项目名称是必需的');
  }

  if (data.city && typeof data.city !== 'string') {
    warnings.push('城市字段格式可能不正确');
  }

  if (data.competitors && !Array.isArray(data.competitors)) {
    warnings.push('竞品数据格式可能不正确');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 解析 CSV 内容
function parseCSVContent(lines: string[], options: ImportExportOptions): Partial<Project> {
  const data: any = {};

  let currentSection = '';
  let isDataRow = false;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line === '基础信息') {
      currentSection = 'basic';
      isDataRow = false;
      return;
    }

    if (line === '竞品信息') {
      currentSection = 'competitors';
      isDataRow = false;
      data.competitors = [];
      return;
    }

    if (line === '字段,值' || line.includes('项目名称,地址')) {
      isDataRow = true;
      return;
    }

    if (isDataRow && currentSection === 'basic') {
      const [field, value] = line.split(',');
      if (field === '项目名称') data.projectName = value;
      if (field === '所在城市') data.city = value;
      // 添加更多字段解析...
    }

    if (isDataRow && currentSection === 'competitors') {
      const values = line.split(',');
      if (values.length >= 8) {
        const competitor = {
          name: values[0],
          location: {
            address: values[1],
            district: values[2]
          },
          product: {
            priceRange: {
              min: parseFloat(values[3]) || 0,
              max: parseFloat(values[4]) || 0
            }
          },
          sales: {
            monthlyVolume: parseInt(values[5]) || 0,
            totalSold: parseInt(values[6]) || 0
          }
        };
        data.competitors.push(competitor);
      }
    }
  });

  return data;
}

// 生成导入模板
export function generateImportTemplate(options: ImportExportOptions): void {
  const template: any = {
    projectName: "示例项目名称",
    city: "示例城市",
    type: "residential",
    status: "planning",
    currentPhase: "phase1"
  };

  if (options.includeBasicInfo) {
    template.basicInfo = {
      location: {
        address: "示例地址",
        district: "示例区域"
      },
      scale: {
        landArea: 50000,
        buildingArea: 120000,
        plotRatio: 2.4,
        greenRate: 35
      },
      product: {
        totalUnits: 800,
        priceRange: {
          min: 400,
          max: 600,
          average: 500,
          avgPricePerSqm: 50000
        },
        features: ["精装修", "智能家居"]
      }
    };
  }

  if (options.includeCompetitors) {
    template.competitors = [
      {
        name: "示例竞品项目",
        location: {
          address: "竞品地址",
          district: "竞品区域",
          distance: 2.5
        },
        product: {
          priceRange: {
            min: 450,
            max: 650
          }
        },
        sales: {
          monthlyVolume: 30,
          totalSold: 280
        },
        marketing: {
          strengths: ["地理位置佳", "品牌知名度高"],
          weaknesses: ["价格偏高", "户型选择少"]
        }
      }
    ];
  }

  const jsonString = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = '项目数据导入模板.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}