// MarketPro 2.0 报告相关类型定义
// 包含完整的报告生成、管理和配置系统类型

import { PhaseId } from './project';

// ============== 2.0 新增类型定义 ==============

// 报告相关枚举
export type ReportStatus = 'draft' | 'generating' | 'generated' | 'error' | 'exported';
export type ReportCategory = '分析类' | '策略类' | '复盘类' | '定期类' | '模板类' | '决策类' | '计划类' | '合作类';
export type ReportPriority = 'core' | 'normal' | 'optional';
export type ReportComplexity = 'simple' | 'standard' | 'complex' | 'detailed';
export type GenerationStatus = 'idle' | 'collecting' | 'validating' | 'generating' | 'rendering' | 'completed' | 'error';

// 报告定义（配置表）- 2.0核心配置
export interface ReportDefinition {
  id: string;                      // "competitor-analysis"
  phase: PhaseId;                  // 所属阶段
  name: string;                    // "竞品分析报告"
  description: string;             // 简短说明
  category: ReportCategory;        // 报告分类
  estimatedTime: string;           // "20-25分钟"
  implemented: boolean;            // 是否已实现
  priority: ReportPriority;        // 优先级
  complexity: ReportComplexity;    // 复杂度
  icon: string;                    // 显示图标
  tags: string[];                  // 标签数组

  config?: {
    requiredDataSources: string[]; // 需要的数据源
    optionalDataSources?: string[];
    estimatedPages: number;
    supportedFormats: string[];
    templateVersion: string;
    aiModelRecommendation?: string;
  };

  formConfig?: {
    sections: ReportFormSection[];
    validationRules?: ValidationRule[];
  };
}

// 报告表单配置
export interface ReportFormSection {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  fields: ReportFormField[];
}

export interface ReportFormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'number' | 'range' | 'file';
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string; description?: string; }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: any;
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, formData: any) => boolean;
}

// 报告内容结构
export interface ReportSlide {
  slideNumber: number;
  slideType: 'cover' | 'agenda' | 'section_header' | 'content' | 'chart' | 'table' | 'comparison' | 'summary' | 'appendix';
  title: string;
  subtitle?: string;
  content?: ReportContent;
  layout?: SlideLayout;
  notes?: string;
}

export type ReportContent =
  | TextContent
  | ChartContent
  | TableContent
  | ListContent
  | ImageContent
  | ComparisonContent;

export interface TextContent {
  type: 'text';
  paragraphs: string[];
  highlights?: string[];
}

export interface ChartContent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'funnel';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  title: string;
  subtitle?: string;
}

export interface TableContent {
  type: 'table';
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  highlightRows?: number[];
  highlightCols?: number[];
}

export interface ListContent {
  type: 'list';
  listType: 'bullet' | 'numbered' | 'checklist';
  items: {
    text: string;
    subItems?: string[];
    highlight?: boolean;
  }[];
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ComparisonContent {
  type: 'comparison';
  comparisonType: 'vs' | 'grid' | 'timeline';
  items: {
    title: string;
    subtitle?: string;
    content: string[];
    score?: number;
    color?: string;
  }[];
}

export interface SlideLayout {
  template: string;
  sections: {
    id: string;
    type: 'text' | 'chart' | 'image' | 'table';
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    style?: {
      fontSize?: number;
      fontColor?: string;
      backgroundColor?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  }[];
}

// 2.0 报告实例
export interface Report {
  id: string;
  projectId: string;
  reportDefinitionId: string;
  title: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;

  generationConfig: {
    template: string;
    aiModel: string;
    language: string;
    format: string;
    complexity: ReportComplexity;
    customPrompt?: string;
  };

  inputData: {
    formData: Record<string, any>;
    dataSourceData: Record<string, any>;
    additionalContext?: string;
  };

  content?: {
    structure: ReportSlide[];
    metadata: ReportMetadata;
    rawOutput?: string;
  };

  exports?: ReportExport[];

  quality?: {
    score: number;
    issues: QualityIssue[];
    suggestions: string[];
  };
}

export interface ReportMetadata {
  totalSlides: number;
  wordCount?: number;
  chartCount?: number;
  tableCount?: number;
  keyFindings: string[];
  recommendations: string[];
  dataQuality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
  generationMetrics: {
    timeToGenerate: number;
    tokensUsed?: number;
    iterations: number;
  };
}

export interface ReportExport {
  id: string;
  format: 'pptx' | 'pdf' | 'docx' | 'html';
  fileName: string;
  filePath?: string;
  fileSize?: number;
  exportedAt: Date;
  downloadCount: number;
  settings?: {
    quality: 'low' | 'medium' | 'high';
    includeNotes: boolean;
    includeMetadata: boolean;
    customStyling?: Record<string, any>;
  };
}

export interface QualityIssue {
  type: 'data_missing' | 'logic_error' | 'formatting_issue' | 'content_repetition' | 'factual_inconsistency';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string;
  suggestion?: string;
}

// 生成相关
export interface GenerationRequest {
  projectId: string;
  reportDefinitionId: string;
  inputData: Record<string, any>;
  options?: {
    template?: string;
    complexity?: ReportComplexity;
    language?: string;
    format?: string;
    customInstructions?: string;
  };
}

export interface GenerationProgress {
  status: GenerationStatus;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ============== 1.0 兼容类型 ==============

export interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'placeholder' | 'coming_soon' | 'draft';
  category: 'market' | 'project' | 'investment' | 'sales';
  estimatedTime?: string;
  configuration?: ReportConfiguration;
  createdBy?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportConfiguration {
  inputSchema: InputField[];
  workflowSteps: WorkflowStep[];
  designSystemId: string;
  outputTemplates: LayoutTemplate[];
}

export interface InputField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file' | 'date' | 'number' | 'email' | 'url';
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  validation?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'form' | 'generation' | 'preview' | 'refinement';
  config: StepConfiguration;
}

export interface StepConfiguration {
  [key: string]: any;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'image';
  slots: TemplateSlot[];
}

export interface TemplateSlot {
  id: string;
  type: 'text' | 'image' | 'chart' | 'table';
  required: boolean;
  description?: string;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  reportTypeId: string;
  reportType?: ReportType;
  designSystemId?: string;
  inputData: Record<string, any>;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 任务相关类型
export enum TaskStage {
  SUBMITTED = 'submitted',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  AI_ANALYZING = 'ai_analyzing',
  AI_GENERATING = 'ai_generating',
  FORMATTING = 'formatting',
  EXPORTING = 'exporting',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Task {
  id: string;
  type: string;
  stage: TaskStage;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  stageStartedAt: string;
  lastHeartbeat: string;
  estimatedDuration?: number;
  message?: string;
  inputData: Record<string, any>;
  resultData?: Record<string, any>;
  errorMessage?: string;
  projectId: string;
  userId: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TaskMonitoringData {
  id: string;
  stage: TaskStage;
  stageStartedAt: Date;
  lastHeartbeat: Date;
  estimatedDuration?: number;
  message?: string;
  details?: any;
  isStuck: boolean;
  healthStatus: 'healthy' | 'warning' | 'error';
  progress: number;
  status: string;
}

// 设计系统类型
export interface DesignSystem {
  id: string;
  name: string;
  description?: string;
  config: DesignSystemConfig;
  version: number;
  isDefault: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface DesignSystemConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    title: TypographyStyle;
    heading: TypographyStyle;
    body: TypographyStyle;
  };
  spacing: Record<string, number>;
  components: Record<string, any>;
}

export interface TypographyStyle {
  font: string;
  size: number;
  weight: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 文件相关类型
export interface FileInfo {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  downloadUrl?: string;
  urlExpiresAt?: string;
  createdAt: string;
}

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences: Record<string, any>;
  createdAt: string;
}

// 统计数据类型
export interface StatsData {
  totalReports: number;
  monthlyReports: number;
  timesSaved: number; // 小时
  activeTemplates: number;
  recentActivity: {
    type: string;
    message: string;
    timestamp: string;
  }[];
}

// 表单相关类型
export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// 组件属性类型
export interface ReportCardProps {
  report: ReportType;
  onStart?: (report: ReportType) => void;
  onConfigure?: (report: ReportType) => void;
}