// MarketPro AI Design System Configuration
// 统一的设计token和主题配置

export const designTokens = {
  // 颜色系统
  colors: {
    // 主要品牌色
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // 主色调
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // 次要色（紫色）
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea', // 次要色
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764'
    },

    // 成功色
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // 成功色
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },

    // 警告色
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // 警告色
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },

    // 错误色
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // 错误色
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },

    // 中性色
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    }
  },

  // 间距系统 (rem单位)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  // 字体系统
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      mono: [
        'JetBrains Mono',
        'SF Mono',
        'Monaco',
        'Inconsolata',
        'Roboto Mono',
        'source-code-pro',
        'Menlo',
        'monospace'
      ]
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },

    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },

  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
    full: '9999px'
  },

  // 阴影系统
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },

  // z-index层级
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    modal: '100',
    popover: '200',
    tooltip: '300',
    toast: '400'
  },

  // 动画时长
  transitionDuration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },

  // 缓动函数
  transitionTiming: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};

// 组件变体配置
export const componentVariants = {
  // 按钮变体
  button: {
    size: {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-8 text-base',
      xl: 'h-12 px-10 text-lg'
    },
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
      warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
      error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
      outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
      ghost: 'text-neutral-700 hover:bg-neutral-100',
      link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline'
    }
  },

  // 输入框变体
  input: {
    size: {
      sm: 'h-8 px-2 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base'
    },
    variant: {
      default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
      error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
      success: 'border-success-500 focus:border-success-500 focus:ring-success-500'
    }
  },

  // 卡片变体
  card: {
    variant: {
      default: 'bg-white border border-neutral-200 shadow-sm',
      elevated: 'bg-white border border-neutral-200 shadow-lg',
      outlined: 'bg-white border-2 border-neutral-300',
      glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-lg'
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    }
  },

  // 徽章变体
  badge: {
    size: {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    },
    variant: {
      default: 'bg-neutral-100 text-neutral-700',
      primary: 'bg-primary-100 text-primary-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      success: 'bg-success-100 text-success-700',
      warning: 'bg-warning-100 text-warning-700',
      error: 'bg-error-100 text-error-700'
    }
  }
};

// 语义化颜色
export const semanticColors = {
  text: {
    primary: designTokens.colors.neutral[900],
    secondary: designTokens.colors.neutral[700],
    tertiary: designTokens.colors.neutral[500],
    disabled: designTokens.colors.neutral[400],
    inverse: designTokens.colors.neutral[0]
  },
  background: {
    primary: designTokens.colors.neutral[0],
    secondary: designTokens.colors.neutral[50],
    tertiary: designTokens.colors.neutral[100],
    elevated: designTokens.colors.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  border: {
    default: designTokens.colors.neutral[200],
    subtle: designTokens.colors.neutral[100],
    strong: designTokens.colors.neutral[300],
    interactive: designTokens.colors.primary[300]
  }
};

// 断点系统
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// 网格系统
export const grid = {
  container: {
    center: true,
    padding: '1rem',
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px'
    }
  },
  columns: 12,
  gap: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  }
};

// 导出默认主题
export const defaultTheme = {
  ...designTokens,
  componentVariants,
  semanticColors,
  breakpoints,
  grid
};

// 类型定义
export type ColorScale = keyof typeof designTokens.colors.primary;
export type ColorName = keyof typeof designTokens.colors;
export type SpacingKey = keyof typeof designTokens.spacing;
export type FontSizeKey = keyof typeof designTokens.typography.fontSize;
export type ComponentVariant = keyof typeof componentVariants;