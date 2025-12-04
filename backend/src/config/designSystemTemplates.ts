/**
 * 设计系统模板配置
 * 提供多种预设的设计系统模板，用于不同类型的报告
 */

export interface DesignSystemTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'tech' | 'luxury' | 'minimal' | 'creative';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    neutral: string[];
  };
  typography: {
    fontFamily: string;
    fontSize: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
      small: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      loose: number;
    };
  };
  spacing: {
    unit: number;
    sizes: number[];
  };
  layout: {
    maxWidth: number;
    columns: number;
    gutter: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  components: {
    slide: any;
    header: any;
    content: any;
    chart: any;
    table: any;
    footer: any;
  };
  suitableFor: string[]; // 适用的报告类型
  preview?: {
    thumbnail: string;
    sampleColors: string[];
  };
}

export const DESIGN_SYSTEM_TEMPLATES: DesignSystemTemplate[] = [
  // 1. 默认商务风格
  {
    id: 'default',
    name: '默认商务风格',
    description: '专业、稳重的商务风格，适用于正式的商业报告',
    category: 'business',
    colorPalette: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
      neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
    },
    typography: {
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      fontSize: { h1: 28, h2: 24, h3: 20, body: 16, small: 14 },
      fontWeight: { normal: 400, medium: 500, bold: 700 },
      lineHeight: { tight: 1.2, normal: 1.5, loose: 1.8 }
    },
    spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
    layout: {
      maxWidth: 1200, columns: 12, gutter: 16,
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    },
    components: {
      slide: { background: '#ffffff', padding: 40, borderRadius: 8 },
      header: { fontSize: 28, fontWeight: 700, color: '#2563eb', marginBottom: 24 },
      content: { fontSize: 16, lineHeight: 1.5, color: '#1f2937' },
      chart: { colors: ['#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'], background: '#f9fafb', border: '#e5e7eb' },
      table: { headerBackground: '#2563eb', headerColor: '#ffffff', borderColor: '#e5e7eb' },
      footer: { fontSize: 12, color: '#6b7280', borderTop: '#e5e7eb' }
    },
    suitableFor: ['可行性研究', '投资分析', '市场分析', '财务报告'],
    preview: {
      thumbnail: '/templates/default-preview.jpg',
      sampleColors: ['#2563eb', '#1d4ed8', '#3b82f6']
    }
  },

  // 2. 现代科技风格
  {
    id: 'modern',
    name: '现代科技风格',
    description: '时尚、现代的科技感设计，适用于创新型项目',
    category: 'tech',
    colorPalette: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f8fafc',
      text: '#0f172a',
      neutral: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b']
    },
    typography: {
      fontFamily: 'Noto Sans SC, Source Han Sans, sans-serif',
      fontSize: { h1: 32, h2: 26, h3: 22, body: 16, small: 14 },
      fontWeight: { normal: 400, medium: 500, bold: 600 },
      lineHeight: { tight: 1.25, normal: 1.6, loose: 1.8 }
    },
    spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
    layout: {
      maxWidth: 1280, columns: 12, gutter: 20,
      margins: { top: 48, bottom: 48, left: 48, right: 48 }
    },
    components: {
      slide: { background: '#f8fafc', padding: 48, borderRadius: 12 },
      header: { fontSize: 32, fontWeight: 600, color: '#059669', marginBottom: 32 },
      content: { fontSize: 16, lineHeight: 1.6, color: '#0f172a' },
      chart: { colors: ['#059669', '#047857', '#10b981', '#34d399', '#6ee7b7'], background: '#ffffff', border: '#e2e8f0' },
      table: { headerBackground: '#059669', headerColor: '#ffffff', borderColor: '#e2e8f0' },
      footer: { fontSize: 12, color: '#64748b', borderTop: '#cbd5e1' }
    },
    suitableFor: ['产品分析', '技术报告', '创新方案', '数字化转型'],
    preview: {
      thumbnail: '/templates/modern-preview.jpg',
      sampleColors: ['#059669', '#047857', '#10b981']
    }
  },

  // 3. 高端奢华风格
  {
    id: 'luxury',
    name: '高端奢华风格',
    description: '优雅、高端的奢华风格，适用于高端项目展示',
    category: 'luxury',
    colorPalette: {
      primary: '#7c2d12',
      secondary: '#92400e',
      accent: '#d97706',
      background: '#fffbeb',
      text: '#451a03',
      neutral: ['#fefce8', '#fef3c7', '#fde68a', '#f59e0b', '#d97706']
    },
    typography: {
      fontFamily: 'Playfair Display, STKaiti, serif',
      fontSize: { h1: 36, h2: 28, h3: 24, body: 18, small: 16 },
      fontWeight: { normal: 400, medium: 500, bold: 700 },
      lineHeight: { tight: 1.3, normal: 1.6, loose: 1.8 }
    },
    spacing: { unit: 6, sizes: [6, 12, 18, 24, 30, 36, 48, 60, 72, 96] },
    layout: {
      maxWidth: 1200, columns: 12, gutter: 24,
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
    },
    components: {
      slide: { background: '#fffbeb', padding: 60, borderRadius: 16 },
      header: { fontSize: 36, fontWeight: 700, color: '#7c2d12', marginBottom: 36 },
      content: { fontSize: 18, lineHeight: 1.6, color: '#451a03' },
      chart: { colors: ['#7c2d12', '#92400e', '#d97706', '#f59e0b', '#fbbf24'], background: '#fefce8', border: '#fde68a' },
      table: { headerBackground: '#7c2d12', headerColor: '#fffbeb', borderColor: '#fde68a' },
      footer: { fontSize: 14, color: '#92400e', borderTop: '#fde68a' }
    },
    suitableFor: ['豪华项目', '高端地产', '品牌策略', '投资推介'],
    preview: {
      thumbnail: '/templates/luxury-preview.jpg',
      sampleColors: ['#7c2d12', '#92400e', '#d97706']
    }
  },

  // 4. 简约清新风格
  {
    id: 'minimal',
    name: '简约清新风格',
    description: '清爽、简约的现代设计，突出内容本身',
    category: 'minimal',
    colorPalette: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#374151',
      neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
    },
    typography: {
      fontFamily: 'Inter, PingFang SC, sans-serif',
      fontSize: { h1: 30, h2: 24, h3: 20, body: 16, small: 14 },
      fontWeight: { normal: 400, medium: 500, bold: 600 },
      lineHeight: { tight: 1.2, normal: 1.5, loose: 1.7 }
    },
    spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
    layout: {
      maxWidth: 1024, columns: 12, gutter: 16,
      margins: { top: 32, bottom: 32, left: 32, right: 32 }
    },
    components: {
      slide: { background: '#ffffff', padding: 32, borderRadius: 8 },
      header: { fontSize: 30, fontWeight: 600, color: '#6366f1', marginBottom: 24 },
      content: { fontSize: 16, lineHeight: 1.5, color: '#374151' },
      chart: { colors: ['#6366f1', '#4f46e5', '#8b5cf6', '#a78bfa', '#c4b5fd'], background: '#f9fafb', border: '#e5e7eb' },
      table: { headerBackground: '#6366f1', headerColor: '#ffffff', borderColor: '#e5e7eb' },
      footer: { fontSize: 12, color: '#6b7280', borderTop: '#e5e7eb' }
    },
    suitableFor: ['产品分析', '用户研究', '设计提案', '简报汇报'],
    preview: {
      thumbnail: '/templates/minimal-preview.jpg',
      sampleColors: ['#6366f1', '#4f46e5', '#8b5cf6']
    }
  },

  // 5. 创意活力风格
  {
    id: 'creative',
    name: '创意活力风格',
    description: '充满活力的创意设计，适用于营销和品牌相关报告',
    category: 'creative',
    colorPalette: {
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#f97316',
      background: '#fdf2f8',
      text: '#831843',
      neutral: ['#fef7ff', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6']
    },
    typography: {
      fontFamily: 'Nunito, Source Han Sans, sans-serif',
      fontSize: { h1: 34, h2: 26, h3: 22, body: 17, small: 15 },
      fontWeight: { normal: 400, medium: 600, bold: 800 },
      lineHeight: { tight: 1.3, normal: 1.6, loose: 1.8 }
    },
    spacing: { unit: 6, sizes: [6, 12, 18, 24, 30, 36, 48, 60, 72, 96] },
    layout: {
      maxWidth: 1200, columns: 12, gutter: 18,
      margins: { top: 36, bottom: 36, left: 36, right: 36 }
    },
    components: {
      slide: { background: '#fdf2f8', padding: 36, borderRadius: 20 },
      header: { fontSize: 34, fontWeight: 800, color: '#ec4899', marginBottom: 24 },
      content: { fontSize: 17, lineHeight: 1.6, color: '#831843' },
      chart: { colors: ['#ec4899', '#be185d', '#f97316', '#fb923c', '#fdba74'], background: '#fef7ff', border: '#fce7f3' },
      table: { headerBackground: '#ec4899', headerColor: '#ffffff', borderColor: '#fce7f3' },
      footer: { fontSize: 13, color: '#be185d', borderTop: '#fce7f3' }
    },
    suitableFor: ['营销策略', '品牌推广', '创意提案', '活动策划'],
    preview: {
      thumbnail: '/templates/creative-preview.jpg',
      sampleColors: ['#ec4899', '#be185d', '#f97316']
    }
  },

  // 6. 专业深色风格
  {
    id: 'dark-professional',
    name: '专业深色风格',
    description: '专业的深色主题，适用于高端技术和金融报告',
    category: 'business',
    colorPalette: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#06b6d4',
      background: '#0f172a',
      text: '#f8fafc',
      neutral: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8']
    },
    typography: {
      fontFamily: 'IBM Plex Sans, Source Han Sans, sans-serif',
      fontSize: { h1: 32, h2: 26, h3: 22, body: 16, small: 14 },
      fontWeight: { normal: 400, medium: 500, bold: 600 },
      lineHeight: { tight: 1.25, normal: 1.5, loose: 1.75 }
    },
    spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
    layout: {
      maxWidth: 1280, columns: 12, gutter: 20,
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    },
    components: {
      slide: { background: '#0f172a', padding: 40, borderRadius: 12 },
      header: { fontSize: 32, fontWeight: 600, color: '#3b82f6', marginBottom: 24 },
      content: { fontSize: 16, lineHeight: 1.5, color: '#f8fafc' },
      chart: { colors: ['#3b82f6', '#1e40af', '#06b6d4', '#0ea5e9', '#38bdf8'], background: '#1e293b', border: '#334155' },
      table: { headerBackground: '#3b82f6', headerColor: '#f8fafc', borderColor: '#334155' },
      footer: { fontSize: 12, color: '#94a3b8', borderTop: '#334155' }
    },
    suitableFor: ['技术报告', '金融分析', '数据分析', '企业级方案'],
    preview: {
      thumbnail: '/templates/dark-professional-preview.jpg',
      sampleColors: ['#3b82f6', '#1e40af', '#06b6d4']
    }
  },

  // 7. 自然环保风格
  {
    id: 'eco-natural',
    name: '自然环保风格',
    description: '自然、环保的绿色主题，适用于可持续发展项目',
    category: 'minimal',
    colorPalette: {
      primary: '#16a34a',
      secondary: '#15803d',
      accent: '#eab308',
      background: '#f7fdf7',
      text: '#14532d',
      neutral: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80']
    },
    typography: {
      fontFamily: 'Lato, Source Han Sans, sans-serif',
      fontSize: { h1: 30, h2: 25, h3: 21, body: 16, small: 14 },
      fontWeight: { normal: 400, medium: 500, bold: 700 },
      lineHeight: { tight: 1.3, normal: 1.6, loose: 1.8 }
    },
    spacing: { unit: 4, sizes: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] },
    layout: {
      maxWidth: 1200, columns: 12, gutter: 16,
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    },
    components: {
      slide: { background: '#f7fdf7', padding: 40, borderRadius: 12 },
      header: { fontSize: 30, fontWeight: 700, color: '#16a34a', marginBottom: 24 },
      content: { fontSize: 16, lineHeight: 1.6, color: '#14532d' },
      chart: { colors: ['#16a34a', '#15803d', '#eab308', '#84cc16', '#a3e635'], background: '#f0fdf4', border: '#dcfce7' },
      table: { headerBackground: '#16a34a', headerColor: '#ffffff', borderColor: '#dcfce7' },
      footer: { fontSize: 12, color: '#15803d', borderTop: '#dcfce7' }
    },
    suitableFor: ['环保项目', '可持续发展', '绿色建筑', 'ESG报告'],
    preview: {
      thumbnail: '/templates/eco-natural-preview.jpg',
      sampleColors: ['#16a34a', '#15803d', '#eab308']
    }
  }
];

/**
 * 根据报告类型获取推荐的设计系统模板
 */
export function getRecommendedTemplatesForReportType(reportType: string): DesignSystemTemplate[] {
  const normalizedType = reportType.toLowerCase();

  return DESIGN_SYSTEM_TEMPLATES.filter(template =>
    template.suitableFor.some(suitableType =>
      normalizedType.includes(suitableType.toLowerCase()) ||
      suitableType.toLowerCase().includes(normalizedType)
    )
  );
}

/**
 * 根据分类获取设计系统模板
 */
export function getTemplatesByCategory(category: string): DesignSystemTemplate[] {
  return DESIGN_SYSTEM_TEMPLATES.filter(template => template.category === category);
}

/**
 * 获取默认设计系统模板
 */
export function getDefaultTemplate(): DesignSystemTemplate {
  return DESIGN_SYSTEM_TEMPLATES[0]; // 默认商务风格
}

/**
 * 根据ID获取设计系统模板
 */
export function getTemplateById(id: string): DesignSystemTemplate | undefined {
  return DESIGN_SYSTEM_TEMPLATES.find(template => template.id === id);
}

export default DESIGN_SYSTEM_TEMPLATES;