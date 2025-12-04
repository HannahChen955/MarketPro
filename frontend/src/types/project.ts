// MarketPro 2.0 项目相关类型定义

// 基础枚举类型
export type PhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5';

export type ProjectType = 'residential' | 'commercial' | 'villa' | 'mixed';

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'planning';

export type BuyingMotivation = 'first' | 'upgrade' | 'investment';

export type CompetitorStatus = 'presale' | 'selling' | 'soldout' | 'paused';

// 户型相关
export interface HouseType {
  id: string;
  name: string;                    // "三房两厅"
  rooms: number;                   // 房间数
  halls: number;                   // 厅数
  bathrooms: number;               // 卫生间数
  area: number;                    // 建筑面积（平方米）
  layout?: string;                 // 户型布局描述
  features?: string[];             // ["南北通透", "双阳台"]
  quantity?: number;               // 该户型总数量
  pricePerSqm?: number;            // 单价（元/平方米）
  totalPrice?: number;             // 总价（万元）
}

// 项目基础信息
export interface ProjectBasicInfo {
  location: {
    address: string;               // "南山区深南大道XXX号"
    district: string;              // "南山区"
    coordinates?: [number, number]; // [经度, 纬度]
    nearbyLandmarks?: string[];    // ["地铁站", "学校", "商场"]
    transportation?: string[];     // ["地铁1号线", "公交XXX"]
  };
  scale: {
    landArea: number;              // 占地面积（平方米）
    buildingArea: number;          // 总建筑面积（平方米）
    plotRatio: number;             // 容积率
    greenRate: number;             // 绿化率（%）
    buildingHeight?: number;       // 建筑高度（层）
    parkingSpaces?: number;        // 停车位数量
  };
  product: {
    totalUnits: number;            // 总户数
    houseTypes: HouseType[];       // 户型配比
    priceRange: {
      min: number;                 // 最低价（万元）
      max: number;                 // 最高价（万元）
      average: number;             // 均价（万元/套）
      avgPricePerSqm: number;      // 均价（元/平方米）
    };
    features: string[];            // ["智能家居", "精装修", "双学区"]
    amenities?: string[];          // 社区配套
    developerGrade?: string;       // 开发商等级："一线" | "二线" | "本地"
  };
  timeline: {
    landAcquisitionDate?: Date;    // 拿地时间
    constructionStartDate?: Date;  // 开工时间
    presaleDate?: Date;            // 预售时间
    launchDate?: Date;             // 开盘时间
    deliveryDate?: Date;           // 交房时间
    currentProgress: string;       // "基础施工阶段"
    milestones?: {
      date: Date;
      event: string;
      status: 'completed' | 'planned' | 'delayed';
    }[];
  };
}

// 竞品信息
export interface Competitor {
  id: string;
  name: string;                    // "华润悦府"
  developer?: string;              // 开发商
  location: {
    address: string;
    district: string;
    distance: number;              // 距离本项目公里数
  };
  status: CompetitorStatus;
  product: {
    totalUnits?: number;
    houseTypes: HouseType[];
    priceRange: {
      min: number;
      max: number;
      average: number;
      avgPricePerSqm: number;
    };
    features: string[];
    amenities?: string[];
  };
  sales: {
    launchDate?: Date;             // 开盘时间
    monthlyVolume?: number;        // 月销量（套）
    totalSold?: number;            // 累计销量（套）
    inventoryUnits?: number;       // 剩余房源（套）
    salesRate?: number;            // 去化率（%）
    avgDaysToSell?: number;        // 平均去化天数
  };
  marketing: {
    strengths: string[];           // 优势点
    weaknesses: string[];          // 劣势点
    marketingHighlights: string[]; // 营销亮点
    promotionStrategy?: string[];  // 推广策略
    salesChannels?: string[];      // 销售渠道
  };
  financials?: {
    totalInvestment?: number;      // 总投资（亿元）
    landCost?: number;             // 拿地成本
    constructionCost?: number;     // 建设成本
  };
  lastUpdated: Date;
}

// 客群画像
export interface TargetAudience {
  primaryGroup: {
    name: string;                  // "改善型购房者"
    ageRange: string;              // "28-35岁"
    income: string;                // "家庭年收入80-150万"
    occupation: string[];          // ["互联网", "金融", "医疗"]
    education: string;             // "本科及以上"
    familyStructure: string;       // "三口之家为主"
    buyingMotivation: BuyingMotivation;
    proportion: number;            // 占比（%）
  };
  secondaryGroup?: {
    name: string;
    ageRange: string;
    income: string;
    occupation: string[];
    education: string;
    familyStructure: string;
    buyingMotivation: BuyingMotivation;
    proportion: number;
  };
  preferences: {
    locationFactors: {
      factor: string;              // "地铁便利性"
      importance: number;          // 重要性评分 1-10
    }[];
    productFactors: {
      factor: string;              // "户型实用性"
      importance: number;
    }[];
    priceFactors: {
      budgetRange: string;         // "总价400-600万"
      paymentPreference: string;   // "首付3成，商贷7成"
      priceSeintivity: number;     // 价格敏感度 1-10
    };
    decisionFactors: {
      factor: string;              // "学区资源"
      weight: number;              // 权重 1-10
    }[];
  };
  behavior: {
    informationSources: string[];  // ["线上平台", "朋友推荐", "实地看房"]
    decisionTimeline: string;      // "3-6个月"
    visitFrequency: string;        // "周末为主"
    decisionInfluencers: string[]; // ["配偶", "父母", "朋友"]
  };
  painPoints: string[];            // ["通勤时间", "学位紧张", "价格敏感"]
  opportunities: string[];         // ["首次改善", "政策利好", "配套完善"]
}

// 项目主实体
export interface Project {
  id: string;
  name: string;                    // "万科翡翠公园"
  alias?: string;                  // 项目别名或推广名
  city: string;                    // "深圳"
  type: ProjectType;
  status: ProjectStatus;
  currentPhase: PhaseId;           // 当前营销阶段

  // 时间戳
  createdAt: Date;
  updatedAt: Date;

  // 项目团队信息
  team?: {
    projectManager?: string;       // 项目经理
    marketingManager?: string;     // 营销经理
    salesManager?: string;         // 销售经理
    contacts?: {
      name: string;
      role: string;
      email?: string;
      phone?: string;
    }[];
  };

  // 项目数据库（核心数据）
  basicInfo?: ProjectBasicInfo;
  competitors?: Competitor[];
  targetAudience?: TargetAudience;

  // 项目配置
  settings?: {
    reportTemplatePreferences?: string[];  // 偏好的报告模板风格
    dataQualityScore?: number;             // 数据完整度评分 0-100
    lastDataReview?: Date;                 // 最后一次数据审核时间
    autoUpdateEnabled?: boolean;           // 是否启用数据自动更新
  };

  // 统计信息
  stats?: {
    totalReportsGenerated?: number;       // 累计生成报告数
    lastReportGeneratedAt?: Date;         // 最近生成报告时间
    mostUsedReportType?: string;          // 最常用报告类型
  };
}

// 项目创建/编辑表单数据
export interface ProjectFormData {
  name: string;
  city: string;
  type: ProjectType;
  currentPhase: PhaseId;

  // 基础信息（可选，创建后补充）
  address?: string;
  district?: string;
  landArea?: number;
  totalUnits?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

// 项目列表查询参数
export interface ProjectQueryParams {
  city?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  phase?: PhaseId;
  search?: string;                 // 搜索项目名称
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'city';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 项目统计信息
export interface ProjectStats {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByPhase: Record<PhaseId, number>;
  projectsByType: Record<ProjectType, number>;
  recentActivity: {
    projectId: string;
    projectName: string;
    activity: string;
    timestamp: Date;
  }[];
}