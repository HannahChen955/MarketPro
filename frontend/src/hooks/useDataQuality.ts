import { useState, useEffect } from 'react';
import { Project, Competitor } from '@/types/project';

export interface QualityScore {
  overall: number; // 总体得分 0-100
  categories: {
    basicInfo: number;
    competitors: number;
    targetAudience: number;
    timeline: number;
  };
  suggestions: string[];
  completeness: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface QualityCheck {
  field: string;
  weight: number; // 权重
  score: number; // 得分 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  suggestion?: string;
}

// 数据质量评分计算器
export function useDataQuality(project: Project): QualityScore {
  const [qualityScore, setQualityScore] = useState<QualityScore>({
    overall: 0,
    categories: {
      basicInfo: 0,
      competitors: 0,
      targetAudience: 0,
      timeline: 0
    },
    suggestions: [],
    completeness: {
      total: 0,
      completed: 0,
      percentage: 0
    }
  });

  useEffect(() => {
    const score = calculateQualityScore(project);
    setQualityScore(score);
  }, [project]);

  return qualityScore;
}

// 计算数据质量得分
function calculateQualityScore(project: Project): QualityScore {
  const checks: QualityCheck[] = [];
  const suggestions: string[] = [];

  // 1. 基础信息检查
  const basicInfoChecks = checkBasicInfo(project, checks);

  // 2. 竞品信息检查
  const competitorChecks = checkCompetitors(project, checks);

  // 3. 目标客群检查
  const targetAudienceChecks = checkTargetAudience(project, checks);

  // 4. 时间线检查
  const timelineChecks = checkTimeline(project, checks);

  // 计算各类别得分
  const basicInfoScore = calculateCategoryScore(basicInfoChecks);
  const competitorsScore = calculateCategoryScore(competitorChecks);
  const targetAudienceScore = calculateCategoryScore(targetAudienceChecks);
  const timelineScore = calculateCategoryScore(timelineChecks);

  // 计算总体得分 (加权平均)
  const weights = {
    basicInfo: 0.3,
    competitors: 0.3,
    targetAudience: 0.25,
    timeline: 0.15
  };

  const overallScore = Math.round(
    basicInfoScore * weights.basicInfo +
    competitorsScore * weights.competitors +
    targetAudienceScore * weights.targetAudience +
    timelineScore * weights.timeline
  );

  // 生成改进建议
  const improvementSuggestions = generateSuggestions(checks);

  // 计算完整度
  const completeness = calculateCompleteness(checks);

  return {
    overall: overallScore,
    categories: {
      basicInfo: basicInfoScore,
      competitors: competitorsScore,
      targetAudience: targetAudienceScore,
      timeline: timelineScore
    },
    suggestions: improvementSuggestions,
    completeness
  };
}

// 检查基础信息
function checkBasicInfo(project: Project, checks: QualityCheck[]): QualityCheck[] {
  const basicInfoChecks: QualityCheck[] = [];

  // 项目名称
  basicInfoChecks.push({
    field: 'projectName',
    weight: 10,
    score: project.name && project.name.trim() ? 100 : 0,
    status: project.name && project.name.trim() ? 'excellent' : 'missing',
    suggestion: !project.name ? '请添加项目名称' : undefined
  });

  // 所在城市
  basicInfoChecks.push({
    field: 'city',
    weight: 8,
    score: project.city && project.city.trim() ? 100 : 0,
    status: project.city && project.city.trim() ? 'excellent' : 'missing',
    suggestion: !project.city ? '请添加项目所在城市' : undefined
  });

  // 地址信息
  const addressScore = project.basicInfo?.location?.address ? 100 : 0;
  basicInfoChecks.push({
    field: 'address',
    weight: 15,
    score: addressScore,
    status: addressScore === 100 ? 'excellent' : 'missing',
    suggestion: addressScore === 0 ? '请添加详细地址信息' : undefined
  });

  // 规模信息
  const scaleScore = calculateScaleScore(project);
  basicInfoChecks.push({
    field: 'scale',
    weight: 20,
    score: scaleScore,
    status: getScoreStatus(scaleScore),
    suggestion: scaleScore < 80 ? '请完善项目规模信息（用地面积、建筑面积等）' : undefined
  });

  // 产品信息
  const productScore = calculateProductScore(project);
  basicInfoChecks.push({
    field: 'product',
    weight: 25,
    score: productScore,
    status: getScoreStatus(productScore),
    suggestion: productScore < 80 ? '请完善产品信息（总套数、户型、价格区间等）' : undefined
  });

  checks.push(...basicInfoChecks);
  return basicInfoChecks;
}

// 检查竞品信息
function checkCompetitors(project: Project, checks: QualityCheck[]): QualityCheck[] {
  const competitorChecks: QualityCheck[] = [];

  // 竞品数量
  const competitorCount = project.competitors?.length || 0;
  let countScore = 0;
  if (competitorCount === 0) countScore = 0;
  else if (competitorCount < 3) countScore = 50;
  else if (competitorCount < 5) countScore = 80;
  else countScore = 100;

  competitorChecks.push({
    field: 'competitorCount',
    weight: 30,
    score: countScore,
    status: getScoreStatus(countScore),
    suggestion: competitorCount < 3 ? '建议添加至少3个竞品项目进行分析' : undefined
  });

  // 竞品信息完整性
  const completenessScore = calculateCompetitorCompleteness(project.competitors || []);
  competitorChecks.push({
    field: 'competitorCompleteness',
    weight: 40,
    score: completenessScore,
    status: getScoreStatus(completenessScore),
    suggestion: completenessScore < 80 ? '请完善竞品的价格、销售、营销等详细信息' : undefined
  });

  // 竞品分析深度
  const depthScore = calculateCompetitorDepth(project.competitors || []);
  competitorChecks.push({
    field: 'competitorDepth',
    weight: 30,
    score: depthScore,
    status: getScoreStatus(depthScore),
    suggestion: depthScore < 70 ? '请添加竞品的优势、劣势、营销亮点分析' : undefined
  });

  checks.push(...competitorChecks);
  return competitorChecks;
}

// 检查目标客群信息
function checkTargetAudience(project: Project, checks: QualityCheck[]): QualityCheck[] {
  const audienceChecks: QualityCheck[] = [];

  // 主要客群定义
  const primaryGroupScore = project.targetAudience?.primaryGroup ? 85 : 0;
  audienceChecks.push({
    field: 'primaryGroup',
    weight: 25,
    score: primaryGroupScore,
    status: getScoreStatus(primaryGroupScore),
    suggestion: primaryGroupScore === 0 ? '请定义主要目标客群特征' : undefined
  });

  // 客户偏好分析
  const preferencesScore = calculatePreferencesScore(project);
  audienceChecks.push({
    field: 'preferences',
    weight: 30,
    score: preferencesScore,
    status: getScoreStatus(preferencesScore),
    suggestion: preferencesScore < 70 ? '请完善客户的位置、产品偏好因子分析' : undefined
  });

  // 行为分析
  const behaviorScore = project.targetAudience?.behavior ? 75 : 0;
  audienceChecks.push({
    field: 'behavior',
    weight: 25,
    score: behaviorScore,
    status: getScoreStatus(behaviorScore),
    suggestion: behaviorScore === 0 ? '请添加客户购买行为分析' : undefined
  });

  // 痛点和机会
  const insightsScore = calculateInsightsScore(project);
  audienceChecks.push({
    field: 'insights',
    weight: 20,
    score: insightsScore,
    status: getScoreStatus(insightsScore),
    suggestion: insightsScore < 60 ? '请分析客户痛点和市场机会' : undefined
  });

  checks.push(...audienceChecks);
  return audienceChecks;
}

// 检查时间线信息
function checkTimeline(project: Project, checks: QualityCheck[]): QualityCheck[] {
  const timelineChecks: QualityCheck[] = [];

  // 当前进度
  const progressScore = project.basicInfo?.timeline?.currentProgress ? 100 : 0;
  timelineChecks.push({
    field: 'currentProgress',
    weight: 40,
    score: progressScore,
    status: getScoreStatus(progressScore),
    suggestion: progressScore === 0 ? '请设置项目当前进度' : undefined
  });

  // 关键时间节点
  const milestonesScore = calculateMilestonesScore(project);
  timelineChecks.push({
    field: 'milestones',
    weight: 60,
    score: milestonesScore,
    status: getScoreStatus(milestonesScore),
    suggestion: milestonesScore < 70 ? '请添加项目关键时间节点（开盘、完工等）' : undefined
  });

  checks.push(...timelineChecks);
  return timelineChecks;
}

// 辅助计算函数
function calculateCategoryScore(checks: QualityCheck[]): number {
  if (checks.length === 0) return 0;

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const weightedScore = checks.reduce((sum, check) => sum + (check.score * check.weight), 0);

  return Math.round(weightedScore / totalWeight);
}

function calculateScaleScore(project: Project): number {
  const scale = project.basicInfo?.scale;
  if (!scale) return 0;

  let score = 0;
  if (scale.landArea > 0) score += 25;
  if (scale.buildingArea > 0) score += 25;
  if (scale.plotRatio > 0) score += 25;
  if (scale.greenRate > 0) score += 25;

  return score;
}

function calculateProductScore(project: Project): number {
  const product = project.basicInfo?.product;
  if (!product) return 0;

  let score = 0;
  if (product.totalUnits > 0) score += 20;
  if (product.houseTypes && product.houseTypes.length > 0) score += 20;
  if (product.priceRange && product.priceRange.min > 0 && product.priceRange.max > 0) score += 30;
  if (product.features && product.features.length > 0) score += 20;
  if (product.priceRange && product.priceRange.avgPricePerSqm > 0) score += 10;

  return score;
}

function calculateCompetitorCompleteness(competitors: Competitor[]): number {
  if (competitors.length === 0) return 0;

  const scores = competitors.map(comp => {
    let score = 0;
    if (comp.name) score += 15;
    if (comp.location?.address) score += 15;
    if (comp.product?.priceRange?.min && comp.product?.priceRange?.max) score += 25;
    if (comp.sales?.monthlyVolume !== undefined) score += 20;
    if (comp.marketing?.strengths?.length) score += 15;
    if (comp.marketing?.weaknesses?.length) score += 10;
    return score;
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / competitors.length);
}

function calculateCompetitorDepth(competitors: Competitor[]): number {
  if (competitors.length === 0) return 0;

  const scores = competitors.map(comp => {
    let score = 0;
    if (comp.marketing?.strengths?.length > 0) score += 30;
    if (comp.marketing?.weaknesses?.length > 0) score += 30;
    if (comp.marketing?.marketingHighlights?.length > 0) score += 25;
    if (comp.product?.features?.length > 0) score += 15;
    return score;
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / competitors.length);
}

function calculatePreferencesScore(project: Project): number {
  const preferences = project.targetAudience?.preferences;
  if (!preferences) return 0;

  let score = 0;
  if (preferences.locationFactors?.length > 0) score += 30;
  if (preferences.productFactors?.length > 0) score += 30;
  if (preferences.priceFactors?.budgetRange) score += 20;
  if (preferences.decisionFactors?.length > 0) score += 20;

  return score;
}

function calculateInsightsScore(project: Project): number {
  let score = 0;
  if (project.targetAudience?.painPoints?.length > 0) score += 50;
  if (project.targetAudience?.opportunities?.length > 0) score += 50;
  return score;
}

function calculateMilestonesScore(project: Project): number {
  const timeline = project.basicInfo?.timeline;
  if (!timeline) return 0;

  let score = 0;
  if ((timeline as any).plannedLaunchDate) score += 50;
  if ((timeline as any).estimatedCompletionDate) score += 50;

  return score;
}

function getScoreStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'missing' {
  if (score === 0) return 'missing';
  if (score < 40) return 'poor';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  return 'excellent';
}

function generateSuggestions(checks: QualityCheck[]): string[] {
  return checks
    .filter(check => check.suggestion)
    .map(check => check.suggestion!)
    .slice(0, 5); // 最多显示5条建议
}

function calculateCompleteness(checks: QualityCheck[]): { total: number; completed: number; percentage: number } {
  const total = checks.length;
  const completed = checks.filter(check => check.score > 60).length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, percentage };
}

// 获取质量等级标签和颜色
export function getQualityBadge(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 90) return { label: '优秀', color: 'text-green-700', bgColor: 'bg-green-100' };
  if (score >= 80) return { label: '良好', color: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (score >= 60) return { label: '一般', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  if (score >= 40) return { label: '较差', color: 'text-orange-700', bgColor: 'bg-orange-100' };
  return { label: '很差', color: 'text-red-700', bgColor: 'bg-red-100' };
}