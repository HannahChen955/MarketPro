// MarketPro 2.0 报告注册表 - 系统配置中心
// 所有报告定义的统一配置，控制功能的开启和关闭

import { ReportDefinition } from '../types/report';

/**
 * 完整的报告定义表
 * 包含5个营销阶段的15个核心报告类型
 * implemented: true = 已实现完整功能
 * implemented: false = 占位状态，显示"即将支持"
 */
export const REPORT_DEFINITIONS: ReportDefinition[] = [

  // ===== 阶段一：拿地前可研 =====
  {
    id: 'pre-feasibility-study',
    phase: 'phase1',
    name: '前期可研报告',
    description: '全面分析市场环境、竞争态势和投资可行性，为拿地决策提供数据支撑',
    category: '分析类',
    estimatedTime: '30-40分钟',
    implemented: true,   // ✅ 专业可研阶段核心实现
    priority: 'core',
    complexity: 'complex',
    icon: '📊',
    tags: ['可研', '市场分析', '拿地决策', '投资分析'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'marketData', 'competitors'],
      optionalDataSources: ['policyData', 'economicIndicators'],
      estimatedPages: 35,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0',
      aiModelRecommendation: 'qwen-max'
    },
    formConfig: {
      sections: [
        {
          id: 'regional_market_analysis',
          title: '区域市场基础研究',
          description: '分析区域宏观经济、房地产供需结构和市场容量',
          required: true,
          fields: [
            {
              id: 'regional_economic_overview',
              type: 'textarea',
              label: '区域宏观经济概况',
              placeholder: '请描述目标区域的经济发展水平、产业结构、人口增长等基本情况',
              required: true,
              validation: { min: 100, max: 1000 }
            },
            {
              id: 'supply_demand_structure',
              type: 'multiselect',
              label: '房地产供需结构特点',
              required: true,
              options: [
                { value: 'high_demand_low_supply', label: '需求旺盛供应不足', description: '刚需客群集中，新增供应有限' },
                { value: 'balanced_supply_demand', label: '供需相对平衡', description: '市场供应与需求基本匹配' },
                { value: 'oversupply', label: '供应过剩', description: '库存积压，去化周期较长' },
                { value: 'upgrading_demand', label: '改善性需求增长', description: '置换需求成为主要驱动力' },
                { value: 'policy_driven', label: '政策导向明显', description: '受到政策调控影响较大' }
              ]
            },
            {
              id: 'market_capacity_forecast',
              type: 'select',
              label: '未来市场容量预期',
              required: true,
              options: [
                { value: 'strong_growth', label: '强劲增长', description: '预计未来2-3年需求持续上升' },
                { value: 'steady_growth', label: '稳定增长', description: '市场需求保持平稳上升趋势' },
                { value: 'stable', label: '基本稳定', description: '需求相对稳定，无大幅波动' },
                { value: 'declining', label: '需求下降', description: '市场需求面临下行压力' }
              ]
            }
          ]
        },
        {
          id: 'competitor_landscape',
          title: '竞品分析',
          description: '深度分析周边竞品项目的产品力、价格策略和销售表现',
          required: true,
          fields: [
            {
              id: 'main_competitors',
              type: 'textarea',
              label: '主要竞品项目列表',
              placeholder: '列出3-5个主要竞品项目，包括项目名称、开发商、距离、定位等',
              required: true,
              validation: { min: 200, max: 1500 }
            },
            {
              id: 'product_positioning',
              type: 'multiselect',
              label: '竞品产品定位类型',
              required: true,
              options: [
                { value: 'luxury', label: '高端豪宅', description: '定位高净值客群，强调品质与服务' },
                { value: 'premium', label: '改善型住宅', description: '面向改善性需求，注重居住体验' },
                { value: 'mass_market', label: '刚需住宅', description: '主打性价比，满足首次置业需求' },
                { value: 'investment', label: '投资型产品', description: '注重投资回报和升值潜力' },
                { value: 'mixed_use', label: '商住混合', description: '兼顾居住与商业功能' }
              ]
            },
            {
              id: 'pricing_analysis',
              type: 'textarea',
              label: '竞品价格策略分析',
              placeholder: '分析竞品的定价逻辑、价格区间、优惠政策、付款方式等',
              required: true,
              validation: { min: 150, max: 1000 }
            },
            {
              id: 'success_factors',
              type: 'textarea',
              label: '热销项目成功因素分析',
              placeholder: '分析热销竞品的核心优势：地段、产品、价格、营销等',
              required: true,
              validation: { min: 100, max: 800 }
            }
          ]
        },
        {
          id: 'customer_research',
          title: '客群研究',
          description: '分析目标区域的客群特征、需求偏好和价格敏感度',
          required: true,
          fields: [
            {
              id: 'demographic_structure',
              type: 'multiselect',
              label: '区域人口结构特征',
              required: true,
              options: [
                { value: 'young_professionals', label: '年轻专业人士', description: '25-35岁，高学历，收入稳定' },
                { value: 'middle_class_families', label: '中产家庭', description: '35-45岁，有孩子，注重教育配套' },
                { value: 'affluent_upgraders', label: '改善型客群', description: '已有房产，寻求更好居住体验' },
                { value: 'retirees', label: '退休群体', description: '注重医疗配套和生活便利性' },
                { value: 'investors', label: '投资客群', description: '关注投资回报和增值潜力' }
              ]
            },
            {
              id: 'housing_preferences',
              type: 'multiselect',
              label: '置业偏好分析',
              required: true,
              options: [
                { value: 'location_priority', label: '地段优先', description: '重视交通便利和区位价值' },
                { value: 'education_focused', label: '教育配套', description: '关注学区和教育资源' },
                { value: 'quality_oriented', label: '品质导向', description: '注重建筑品质和物业服务' },
                { value: 'price_sensitive', label: '价格敏感', description: '对价格波动反应较强' },
                { value: 'amenity_focused', label: '配套完善', description: '看重商业、医疗等生活配套' }
              ]
            },
            {
              id: 'price_tolerance',
              type: 'select',
              label: '客群价格承受能力',
              required: true,
              options: [
                { value: 'high_end', label: '高价位承受 (>30万/㎡)', description: '购买力强，对价格不敏感' },
                { value: 'mid_high', label: '中高价位 (20-30万/㎡)', description: '有一定购买力，注重性价比' },
                { value: 'mainstream', label: '主流价位 (15-20万/㎡)', description: '市场主流客群价格区间' },
                { value: 'value_conscious', label: '性价比导向 (<15万/㎡)', description: '价格敏感度较高' }
              ]
            }
          ]
        },
        {
          id: 'product_feasibility',
          title: '产品可行性判断',
          description: '基于市场分析，判断适合的产品类型和户型配置',
          required: true,
          fields: [
            {
              id: 'recommended_product_types',
              type: 'multiselect',
              label: '建议产品类型',
              required: true,
              options: [
                { value: 'high_rise', label: '高层住宅', description: '容积率较高，适合刚需和首改客群' },
                { value: 'mid_rise', label: '小高层', description: '平衡密度与居住体验' },
                { value: 'townhouse', label: '联排别墅', description: '改善型产品，注重私密性' },
                { value: 'villa', label: '独栋别墅', description: '高端产品，满足顶级需求' },
                { value: 'mixed_type', label: '多种业态组合', description: '不同产品满足多元化需求' }
              ]
            },
            {
              id: 'unit_mix_strategy',
              type: 'multiselect',
              label: '户型面积段配置策略',
              required: true,
              options: [
                { value: 'compact_units', label: '紧凑型 (60-80㎡)', description: '刚需主力，一房两房为主' },
                { value: 'standard_units', label: '标准型 (80-120㎡)', description: '改善入门，两房三房配置' },
                { value: 'premium_units', label: '舒适型 (120-160㎡)', description: '改善主力，三房四房布局' },
                { value: 'luxury_units', label: '豪华型 (>160㎡)', description: '高端改善，大户型配置' }
              ]
            },
            {
              id: 'positioning_focus',
              type: 'select',
              label: '产品定位重点',
              required: true,
              options: [
                { value: 'cost_effective', label: '性价比主导', description: '强调实用功能和价格优势' },
                { value: 'quality_premium', label: '品质溢价', description: '突出建筑品质和居住体验' },
                { value: 'location_value', label: '地段价值', description: '依托区位优势定价' },
                { value: 'lifestyle_concept', label: '生活方式', description: '营造特定生活理念和社区文化' }
              ]
            }
          ]
        },
        {
          id: 'investment_recommendation',
          title: '营销价值判断',
          description: '评估项目营销潜力和投资价值，提出拿地建议',
          required: true,
          fields: [
            {
              id: 'market_acceptance_price',
              type: 'number',
              label: '市场可接受价格区间 (万元/㎡)',
              placeholder: '基于市场分析，预估合理售价区间',
              required: true,
              validation: { min: 5, max: 100 }
            },
            {
              id: 'competitive_pressure',
              type: 'select',
              label: '未来竞争压力评估',
              required: true,
              options: [
                { value: 'low', label: '竞争压力较小', description: '区域供应有限，竞品较少' },
                { value: 'moderate', label: '竞争压力适中', description: '有一定竞争，但产品差异化可行' },
                { value: 'high', label: '竞争压力较大', description: '同质化竞争激烈，需要强差异化' },
                { value: 'very_high', label: '竞争极为激烈', description: '红海市场，营销难度极大' }
              ]
            },
            {
              id: 'risk_factors',
              type: 'textarea',
              label: '主要风险点识别',
              placeholder: '识别项目可能面临的市场风险、政策风险、竞争风险等',
              required: true,
              validation: { min: 100, max: 800 }
            },
            {
              id: 'acquisition_recommendation',
              type: 'select',
              label: '拿地建议结论',
              required: true,
              options: [
                { value: 'strongly_recommend', label: '强烈建议拿地', description: '市场前景良好，投资价值突出' },
                { value: 'recommend', label: '建议拿地', description: '总体可行，具备投资价值' },
                { value: 'conditional_recommend', label: '条件性建议', description: '需要满足特定条件后考虑' },
                { value: 'not_recommend', label: '不建议拿地', description: '风险较大，投资价值有限' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'market-competitor-research',
    phase: 'phase1',
    name: '市场及竞品研究报告',
    description: '深度分析区域房地产市场现状、供需关系和主要竞品项目对比',
    category: '分析类',
    estimatedTime: '25-30分钟',
    implemented: true,   // ✅ 可研阶段市场分析实现
    priority: 'core',
    complexity: 'standard',
    icon: '🏪',
    tags: ['市场研究', '竞品分析', '供需分析'],
    config: {
      requiredDataSources: ['competitors', 'marketData'],
      optionalDataSources: ['salesData', 'priceHistory'],
      estimatedPages: 25,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    },
    formConfig: {
      sections: [
        {
          id: 'market_overview',
          title: '区域市场现状分析',
          description: '分析目标区域的整体房地产市场环境和趋势',
          required: true,
          fields: [
            {
              id: 'market_cycle_phase',
              type: 'select',
              label: '当前市场周期阶段',
              required: true,
              options: [
                { value: 'recovery', label: '复苏期', description: '市场回暖，成交量逐步上升' },
                { value: 'growth', label: '增长期', description: '需求旺盛，价格稳步上涨' },
                { value: 'peak', label: '高峰期', description: '市场过热，价格达到高点' },
                { value: 'adjustment', label: '调整期', description: '政策调控，市场降温' }
              ]
            },
            {
              id: 'supply_situation',
              type: 'multiselect',
              label: '区域供应情况特征',
              required: true,
              options: [
                { value: 'sufficient_land', label: '土地供应充足', description: '未来有较多项目入市' },
                { value: 'limited_land', label: '土地供应稀缺', description: '新增供应有限' },
                { value: 'concentration', label: '供应相对集中', description: '主要集中在特定区域' },
                { value: 'dispersed', label: '供应较为分散', description: '分布在多个板块' },
                { value: 'phased_release', label: '分期释放', description: '开发商控制推盘节奏' }
              ]
            },
            {
              id: 'demand_characteristics',
              type: 'multiselect',
              label: '市场需求特征',
              required: true,
              options: [
                { value: 'rigid_demand', label: '刚需为主', description: '首次置业需求占主导' },
                { value: 'improvement_demand', label: '改善性需求', description: '换房需求增长明显' },
                { value: 'investment_demand', label: '投资性需求', description: '资产配置需求活跃' },
                { value: 'policy_driven', label: '政策导向需求', description: '受政策影响较大' }
              ]
            }
          ]
        },
        {
          id: 'price_trend_analysis',
          title: '价格趋势分析',
          description: '分析区域房价走势和影响因素',
          required: true,
          fields: [
            {
              id: 'price_trend_direction',
              type: 'select',
              label: '近期价格趋势',
              required: true,
              options: [
                { value: 'rising', label: '稳步上涨', description: '价格持续温和上升' },
                { value: 'stable', label: '基本稳定', description: '价格波动不大' },
                { value: 'fluctuating', label: '波动调整', description: '价格有涨有跌' },
                { value: 'declining', label: '下行压力', description: '价格面临调整' }
              ]
            },
            {
              id: 'price_range_analysis',
              type: 'textarea',
              label: '主流价格区间分析',
              placeholder: '分析不同产品类型的价格区间分布，包括刚需、改善、高端等细分市场',
              required: true,
              validation: { min: 100, max: 800 }
            },
            {
              id: 'price_influencing_factors',
              type: 'multiselect',
              label: '价格影响因素',
              required: true,
              options: [
                { value: 'land_cost', label: '土地成本', description: '地价对房价的影响' },
                { value: 'construction_cost', label: '建设成本', description: '原材料和人工成本' },
                { value: 'policy_impact', label: '政策调控', description: '限价、限售等政策' },
                { value: 'supply_demand', label: '供需关系', description: '市场供需平衡情况' },
                { value: 'location_premium', label: '地段溢价', description: '区位价值差异' },
                { value: 'infrastructure', label: '配套设施', description: '交通、教育等配套' }
              ]
            }
          ]
        },
        {
          id: 'competitor_landscape_detailed',
          title: '重点竞品深度分析',
          description: '选择3-5个主要竞品进行详细对比分析',
          required: true,
          fields: [
            {
              id: 'competitor_selection_criteria',
              type: 'multiselect',
              label: '竞品选择标准',
              required: true,
              options: [
                { value: 'location_proximity', label: '地理位置相近', description: '距离项目3公里内' },
                { value: 'similar_positioning', label: '产品定位相似', description: '目标客群基本一致' },
                { value: 'price_range_overlap', label: '价格区间重叠', description: '存在价格竞争关系' },
                { value: 'launch_timing', label: '上市时间相近', description: '同期竞争项目' },
                { value: 'developer_level', label: '开发商层级', description: '品牌影响力相当' }
              ]
            },
            {
              id: 'competitor_comparison_matrix',
              type: 'textarea',
              label: '竞品对比矩阵',
              placeholder: '制作详细的竞品对比表格，包括：项目名称、开发商、价格、户型、卖点、优劣势等',
              required: true,
              validation: { min: 200, max: 1500 }
            },
            {
              id: 'competitive_advantages',
              type: 'textarea',
              label: '我方竞争优势分析',
              placeholder: '相对于主要竞品，分析我方项目的差异化优势和独特卖点',
              required: true,
              validation: { min: 150, max: 1000 }
            }
          ]
        },
        {
          id: 'market_positioning_recommendation',
          title: '市场定位建议',
          description: '基于市场和竞品分析，提出项目市场定位建议',
          required: true,
          fields: [
            {
              id: 'target_market_segment',
              type: 'select',
              label: '建议目标市场细分',
              required: true,
              options: [
                { value: 'entry_level', label: '刚需入门市场', description: '首次置业，注重性价比' },
                { value: 'mainstream', label: '主流改善市场', description: '换房需求，平衡品质与价格' },
                { value: 'premium', label: '高端改善市场', description: '品质优先，价格不敏感' },
                { value: 'luxury', label: '豪宅市场', description: '顶级需求，强调稀缺性' }
              ]
            },
            {
              id: 'differentiation_strategy',
              type: 'multiselect',
              label: '差异化策略方向',
              required: true,
              options: [
                { value: 'location_advantage', label: '地段优势', description: '突出区位价值' },
                { value: 'product_innovation', label: '产品创新', description: '户型、配置创新' },
                { value: 'service_excellence', label: '服务品质', description: '物业服务差异化' },
                { value: 'lifestyle_concept', label: '生活方式', description: '社区文化和生活理念' },
                { value: 'cost_performance', label: '性价比', description: '价格优势明显' },
                { value: 'brand_premium', label: '品牌溢价', description: '开发商品牌价值' }
              ]
            },
            {
              id: 'marketing_focus_points',
              type: 'textarea',
              label: '营销重点建议',
              placeholder: '基于市场分析结果，建议营销推广的重点方向和关键信息',
              required: true,
              validation: { min: 100, max: 800 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'customer-persona-study',
    phase: 'phase1',
    name: '客户画像研究报告',
    description: '分析目标客群特征、购房需求、决策行为和价格敏感度',
    category: '分析类',
    estimatedTime: '20-25分钟',
    implemented: true,   // ✅ 可研阶段客群分析实现
    priority: 'normal',
    complexity: 'standard',
    icon: '👥',
    tags: ['客群画像', '需求分析', '行为研究'],
    config: {
      requiredDataSources: ['targetAudience', 'marketData'],
      estimatedPages: 20,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    },
    formConfig: {
      sections: [
        {
          id: 'demographic_analysis',
          title: '人口统计学特征分析',
          description: '分析目标区域的人口结构、年龄分布、教育水平等基础特征',
          required: true,
          fields: [
            {
              id: 'age_distribution',
              type: 'multiselect',
              label: '主要年龄段分布',
              required: true,
              options: [
                { value: 'young_single', label: '年轻单身 (25-30岁)', description: '职场新人，初次置业' },
                { value: 'new_family', label: '新组家庭 (30-35岁)', description: '新婚夫妇，刚需住房' },
                { value: 'growing_family', label: '成长家庭 (35-42岁)', description: '有小孩，改善需求' },
                { value: 'mature_family', label: '成熟家庭 (42-50岁)', description: '事业稳定，高端改善' },
                { value: 'empty_nesters', label: '空巢家庭 (50-65岁)', description: '子女独立，养老置业' }
              ]
            },
            {
              id: 'income_levels',
              type: 'multiselect',
              label: '收入水平分布',
              required: true,
              options: [
                { value: 'entry_level', label: '入门级 (8-15万/年)', description: '刚性需求，价格敏感' },
                { value: 'middle_income', label: '中等收入 (15-30万/年)', description: '改善入门，平衡型选择' },
                { value: 'upper_middle', label: '中高收入 (30-50万/年)', description: '改善主力，品质导向' },
                { value: 'high_income', label: '高收入 (50万+/年)', description: '高端需求，品牌偏好' }
              ]
            },
            {
              id: 'education_background',
              type: 'multiselect',
              label: '教育背景构成',
              required: true,
              options: [
                { value: 'high_school', label: '高中及以下', description: '传统观念，重视实用性' },
                { value: 'vocational', label: '职业技术教育', description: '技能导向，稳定就业' },
                { value: 'bachelor', label: '本科学历', description: '主流群体，理性决策' },
                { value: 'postgraduate', label: '研究生及以上', description: '高知群体，品质要求高' }
              ]
            }
          ]
        },
        {
          id: 'housing_needs_analysis',
          title: '住房需求深度分析',
          description: '深入分析不同客群的住房需求特点和偏好',
          required: true,
          fields: [
            {
              id: 'housing_purpose',
              type: 'multiselect',
              label: '购房目的分析',
              required: true,
              options: [
                { value: 'self_residence', label: '自住需求', description: '改善居住条件为主' },
                { value: 'investment', label: '投资需求', description: '资产保值增值' },
                { value: 'education', label: '教育需求', description: '为子女教育考虑' },
                { value: 'elderly_care', label: '养老需求', description: '为父母养老安排' },
                { value: 'marriage_preparation', label: '结婚准备', description: '新婚住房需求' }
              ]
            },
            {
              id: 'unit_preferences',
              type: 'multiselect',
              label: '户型面积偏好',
              required: true,
              options: [
                { value: 'compact_1br', label: '紧凑一房 (50-70㎡)', description: '单身或新婚过渡' },
                { value: 'standard_2br', label: '标准两房 (70-90㎡)', description: '小家庭首选' },
                { value: 'comfort_3br', label: '舒适三房 (90-120㎡)', description: '改善型主力' },
                { value: 'spacious_3br', label: '大三房 (120-140㎡)', description: '舒适型改善' },
                { value: 'luxury_4br', label: '四房及以上 (140㎡+)', description: '高端改善需求' }
              ]
            },
            {
              id: 'location_priorities',
              type: 'multiselect',
              label: '区位选择优先级',
              required: true,
              options: [
                { value: 'work_proximity', label: '工作便利性', description: '通勤时间和便利度' },
                { value: 'education_resources', label: '教育资源', description: '学区和教育配套' },
                { value: 'transportation_hub', label: '交通枢纽', description: '地铁、高铁等交通' },
                { value: 'commercial_amenities', label: '商业配套', description: '购物、餐饮便利度' },
                { value: 'healthcare_facilities', label: '医疗配套', description: '医院、诊所便利性' },
                { value: 'natural_environment', label: '自然环境', description: '公园、绿化、空气质量' }
              ]
            }
          ]
        },
        {
          id: 'buying_behavior_analysis',
          title: '购房决策行为分析',
          description: '分析客群的购房决策过程、影响因素和行为特点',
          required: true,
          fields: [
            {
              id: 'decision_timeline',
              type: 'select',
              label: '典型决策周期',
              required: true,
              options: [
                { value: 'quick_decision', label: '快速决策 (1-2个月)', description: '需求明确，决策果断' },
                { value: 'standard_process', label: '常规决策 (3-6个月)', description: '充分比较，理性选择' },
                { value: 'extended_search', label: '长期考察 (6个月+)', description: '高度谨慎，反复比较' }
              ]
            },
            {
              id: 'influence_factors',
              type: 'multiselect',
              label: '关键影响因素',
              required: true,
              options: [
                { value: 'price_value', label: '价格性价比', description: '总价和性价比考量' },
                { value: 'location_convenience', label: '地段便利性', description: '交通和生活便利' },
                { value: 'product_quality', label: '产品品质', description: '建筑质量和设计' },
                { value: 'developer_reputation', label: '开发商品牌', description: '开发商信誉度' },
                { value: 'community_environment', label: '社区环境', description: '邻里关系和氛围' },
                { value: 'future_potential', label: '升值潜力', description: '投资回报预期' }
              ]
            },
            {
              id: 'information_sources',
              type: 'multiselect',
              label: '信息获取渠道',
              required: true,
              options: [
                { value: 'online_platforms', label: '在线平台', description: '房产网站、APP' },
                { value: 'social_media', label: '社交媒体', description: '微信、短视频等' },
                { value: 'referrals', label: '亲友推荐', description: '熟人介绍和推荐' },
                { value: 'sales_center', label: '售楼处', description: '实地考察和咨询' },
                { value: 'real_estate_agent', label: '房产中介', description: '专业中介服务' },
                { value: 'traditional_media', label: '传统媒体', description: '报纸、户外广告等' }
              ]
            }
          ]
        },
        {
          id: 'price_sensitivity_analysis',
          title: '价格敏感度分析',
          description: '分析不同客群对价格变化的反应和承受能力',
          required: true,
          fields: [
            {
              id: 'budget_distribution',
              type: 'textarea',
              label: '主流预算分布',
              placeholder: '详细分析目标客群的购房预算分布情况，包括总价区间、首付能力、月供承受力等',
              required: true,
              validation: { min: 150, max: 1000 }
            },
            {
              id: 'price_elasticity',
              type: 'select',
              label: '价格弹性特征',
              required: true,
              options: [
                { value: 'high_sensitivity', label: '高度价格敏感', description: '价格是决定性因素' },
                { value: 'moderate_sensitivity', label: '中等价格敏感', description: '价格与品质并重' },
                { value: 'low_sensitivity', label: '价格不敏感', description: '更关注品质和服务' }
              ]
            },
            {
              id: 'payment_preferences',
              type: 'multiselect',
              label: '支付方式偏好',
              required: true,
              options: [
                { value: 'mortgage_loan', label: '银行按揭', description: '传统贷款购房' },
                { value: 'full_payment', label: '一次性付款', description: '现金购房' },
                { value: 'installment_payment', label: '分期付款', description: '开发商分期' },
                { value: 'combination_loan', label: '组合贷款', description: '商贷+公积金' },
                { value: 'parents_support', label: '家庭支持', description: '父母资助购房' }
              ]
            }
          ]
        },
        {
          id: 'marketing_insights',
          title: '营销策略洞察',
          description: '基于客群分析，提出针对性的营销建议',
          required: true,
          fields: [
            {
              id: 'segmentation_strategy',
              type: 'textarea',
              label: '客群细分策略',
              placeholder: '根据分析结果，建议如何对客群进行细分，以及针对不同细分市场的差异化策略',
              required: true,
              validation: { min: 100, max: 800 }
            },
            {
              id: 'messaging_recommendations',
              type: 'textarea',
              label: '营销信息建议',
              placeholder: '针对主要客群特征，建议关键营销信息和价值主张',
              required: true,
              validation: { min: 100, max: 800 }
            },
            {
              id: 'channel_strategy',
              type: 'multiselect',
              label: '推荐营销渠道',
              required: true,
              options: [
                { value: 'digital_marketing', label: '数字营销', description: '线上平台精准投放' },
                { value: 'community_events', label: '社区活动', description: '深入目标社区推广' },
                { value: 'referral_program', label: '推荐计划', description: '老客户推荐奖励' },
                { value: 'partnership_marketing', label: '合作营销', description: '与相关行业合作' },
                { value: 'content_marketing', label: '内容营销', description: '专业内容吸引客户' },
                { value: 'experiential_marketing', label: '体验营销', description: '样板房展示体验' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'land-acquisition-recommendation',
    phase: 'phase1',
    name: '拿地决策建议书',
    description: '基于前期分析结果，提供拿地建议、风险提示和投资回报预测',
    category: '决策类',
    estimatedTime: '15-20分钟',
    implemented: true,   // ✅ 可研阶段决策建议实现
    priority: 'core',
    complexity: 'standard',
    icon: '📋',
    tags: ['决策建议', '风险评估', '投资分析'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'marketData', 'competitors'],
      estimatedPages: 15,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    },
    formConfig: {
      sections: [
        {
          id: 'executive_summary',
          title: '决策概要',
          description: '基于前期分析，提供拿地决策的核心建议和关键结论',
          required: true,
          fields: [
            {
              id: 'overall_recommendation',
              type: 'select',
              label: '总体建议结论',
              required: true,
              options: [
                { value: 'strongly_recommend', label: '强烈建议拿地', description: '机会优质，建议积极争取' },
                { value: 'recommend_with_conditions', label: '有条件推荐', description: '在满足特定条件下建议拿地' },
                { value: 'neutral_cautious', label: '中性谨慎', description: '机会一般，需要慎重考虑' },
                { value: 'not_recommend', label: '不建议拿地', description: '风险较大，不建议投资' }
              ]
            },
            {
              id: 'key_success_factors',
              type: 'multiselect',
              label: '项目成功关键因素',
              required: true,
              options: [
                { value: 'location_advantage', label: '地段优势明显', description: '区位价值突出' },
                { value: 'market_timing', label: '入市时机良好', description: '市场周期位置合适' },
                { value: 'product_differentiation', label: '产品差异化潜力', description: '能够形成竞争优势' },
                { value: 'cost_advantage', label: '成本优势', description: '土地价格相对合理' },
                { value: 'policy_support', label: '政策支持', description: '符合政府发展规划' },
                { value: 'infrastructure_development', label: '配套发展', description: '基础设施不断完善' }
              ]
            },
            {
              id: 'investment_highlights',
              type: 'textarea',
              label: '投资亮点总结',
              placeholder: '总结项目最具吸引力的投资亮点，为决策提供有力支撑',
              required: true,
              validation: { min: 150, max: 800 }
            }
          ]
        },
        {
          id: 'financial_analysis',
          title: '财务分析与投资回报',
          description: '分析项目的财务可行性和投资回报预期',
          required: true,
          fields: [
            {
              id: 'land_cost_analysis',
              type: 'number',
              label: '土地成本预算 (万元)',
              placeholder: '预估土地总投资金额',
              required: true,
              validation: { min: 1000, max: 1000000 }
            },
            {
              id: 'development_cost_estimate',
              type: 'number',
              label: '开发成本预估 (万元)',
              placeholder: '包括建安成本、配套费用等',
              required: true,
              validation: { min: 2000, max: 2000000 }
            },
            {
              id: 'expected_sales_price',
              type: 'number',
              label: '预期销售均价 (元/㎡)',
              placeholder: '基于市场分析的合理售价预期',
              required: true,
              validation: { min: 5000, max: 200000 }
            },
            {
              id: 'profit_margin_estimate',
              type: 'select',
              label: '预期利润率水平',
              required: true,
              options: [
                { value: 'high_return', label: '高回报 (>25%)', description: '优质投资机会' },
                { value: 'good_return', label: '良好回报 (15-25%)', description: '符合投资预期' },
                { value: 'moderate_return', label: '适中回报 (10-15%)', description: '基本达标' },
                { value: 'low_return', label: '偏低回报 (<10%)', description: '回报有限' }
              ]
            },
            {
              id: 'payback_period',
              type: 'select',
              label: '预期投资回收周期',
              required: true,
              options: [
                { value: 'short_term', label: '短期回收 (2-3年)', description: '快速回笼资金' },
                { value: 'medium_term', label: '中期回收 (3-5年)', description: '合理开发周期' },
                { value: 'long_term', label: '长期回收 (5年+)', description: '需要长期持有' }
              ]
            }
          ]
        },
        {
          id: 'risk_assessment',
          title: '风险评估与应对',
          description: '识别项目主要风险点并提出应对策略',
          required: true,
          fields: [
            {
              id: 'market_risks',
              type: 'multiselect',
              label: '市场风险识别',
              required: true,
              options: [
                { value: 'market_downturn', label: '市场下行', description: '房地产市场降温' },
                { value: 'oversupply_risk', label: '供应过剩', description: '区域新增供应过多' },
                { value: 'price_competition', label: '价格竞争', description: '竞品降价冲击' },
                { value: 'demand_shift', label: '需求变化', description: '客群偏好改变' },
                { value: 'economic_uncertainty', label: '经济不确定性', description: '宏观经济影响' }
              ]
            },
            {
              id: 'policy_risks',
              type: 'multiselect',
              label: '政策风险评估',
              required: true,
              options: [
                { value: 'regulation_tightening', label: '调控政策收紧', description: '限购限贷政策' },
                { value: 'land_policy_change', label: '土地政策变化', description: '出让条件调整' },
                { value: 'tax_policy_impact', label: '税收政策影响', description: '房产税等新政' },
                { value: 'planning_adjustment', label: '规划调整', description: '城市规划变更' },
                { value: 'environmental_requirements', label: '环保要求', description: '环境标准提升' }
              ]
            },
            {
              id: 'operational_risks',
              type: 'multiselect',
              label: '运营风险因素',
              required: true,
              options: [
                { value: 'construction_delays', label: '建设延期', description: '工期延误风险' },
                { value: 'cost_overrun', label: '成本超支', description: '开发成本上升' },
                { value: 'sales_challenges', label: '销售困难', description: '去化不达预期' },
                { value: 'financing_difficulty', label: '融资困难', description: '资金链压力' },
                { value: 'team_capacity', label: '团队能力', description: '执行能力限制' }
              ]
            },
            {
              id: 'risk_mitigation_strategies',
              type: 'textarea',
              label: '风险应对策略',
              placeholder: '针对识别的主要风险，提出具体的预防和应对措施',
              required: true,
              validation: { min: 200, max: 1200 }
            }
          ]
        },
        {
          id: 'strategic_considerations',
          title: '战略考量与建议',
          description: '从战略角度分析拿地的意义和价值',
          required: true,
          fields: [
            {
              id: 'strategic_value',
              type: 'multiselect',
              label: '战略价值评估',
              required: true,
              options: [
                { value: 'market_expansion', label: '市场拓展', description: '进入新的市场区域' },
                { value: 'brand_building', label: '品牌建设', description: '提升品牌影响力' },
                { value: 'portfolio_balance', label: '产品组合', description: '丰富产品类型' },
                { value: 'resource_integration', label: '资源整合', description: '优化资源配置' },
                { value: 'long_term_layout', label: '长期布局', description: '战略性占位' },
                { value: 'competitive_positioning', label: '竞争定位', description: '强化市场地位' }
              ]
            },
            {
              id: 'timing_analysis',
              type: 'select',
              label: '入市时机分析',
              required: true,
              options: [
                { value: 'optimal_timing', label: '最佳时机', description: '市场条件非常有利' },
                { value: 'good_timing', label: '较好时机', description: '时机选择合适' },
                { value: 'acceptable_timing', label: '可接受时机', description: '时机一般但可行' },
                { value: 'poor_timing', label: '时机不佳', description: '建议延后考虑' }
              ]
            },
            {
              id: 'competitive_positioning',
              type: 'textarea',
              label: '竞争定位建议',
              placeholder: '基于竞品分析，建议项目的市场定位和差异化策略',
              required: true,
              validation: { min: 150, max: 1000 }
            }
          ]
        },
        {
          id: 'implementation_recommendations',
          title: '实施建议',
          description: '提出具体的实施建议和注意事项',
          required: true,
          fields: [
            {
              id: 'bidding_strategy',
              type: 'select',
              label: '竞拍策略建议',
              required: true,
              options: [
                { value: 'aggressive_bidding', label: '积极竞拍', description: '志在必得，可适当溢价' },
                { value: 'strategic_bidding', label: '策略性竞拍', description: '合理报价，控制风险' },
                { value: 'conservative_bidding', label: '保守竞拍', description: '严控成本，理性出价' },
                { value: 'conditional_participation', label: '条件性参与', description: '在特定条件下参与' }
              ]
            },
            {
              id: 'max_bid_price',
              type: 'number',
              label: '建议最高报价 (万元)',
              placeholder: '基于财务分析的合理报价上限',
              required: true,
              validation: { min: 1000, max: 1000000 }
            },
            {
              id: 'key_conditions',
              type: 'textarea',
              label: '关键前置条件',
              placeholder: '拿地前需要满足的关键条件或需要确认的重要事项',
              required: false,
              validation: { min: 0, max: 800 }
            },
            {
              id: 'next_steps',
              type: 'textarea',
              label: '后续行动计划',
              placeholder: '如果决定拿地，需要立即启动的关键工作',
              required: true,
              validation: { min: 100, max: 800 }
            }
          ]
        }
      ]
    }
  },

  // ===== 阶段二：产品定位 & 超盘方案（核心实现区域）=====
  {
    id: 'project-overall-marketing-plan',
    phase: 'phase2',
    name: '项目整体营销方案（超盘方案）',
    description: '产品定位+营销策略顶层设计的综合性方案',
    category: '策略类',
    estimatedTime: '20-25分钟',
    implemented: true,   // ✅ 已在后端配置
    priority: 'core',
    complexity: 'complex',
    icon: '🏗️',
    tags: ['营销策略', '推广方案', '销售策略', '品牌定位'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'competitors'],
      optionalDataSources: ['salesData', 'marketingCampaigns'],
      estimatedPages: 25,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0',
      aiModelRecommendation: 'qwen-max'
    },
    formConfig: {
      sections: [
        {
          id: 'analysis_scope',
          title: '分析范围设置',
          description: '设定竞品分析的时间范围和重点维度',
          required: true,
          fields: [
            {
              id: 'time_range',
              type: 'select',
              label: '分析时间范围',
              required: true,
              defaultValue: '6months',
              options: [
                { value: '3months', label: '最近3个月', description: '适合快速分析当前市场动态' },
                { value: '6months', label: '最近6个月', description: '平衡时效性和数据完整性' },
                { value: '1year', label: '最近1年', description: '全面了解市场趋势变化' },
                { value: 'custom', label: '自定义', description: '指定特定时间段' }
              ]
            },
            {
              id: 'analysis_dimensions',
              type: 'multiselect',
              label: '重点分析维度',
              required: true,
              defaultValue: ['product', 'pricing', 'marketing'],
              options: [
                { value: 'product', label: '产品配置对比', description: '户型、装修、配套等产品力对比' },
                { value: 'pricing', label: '价格策略分析', description: '定价逻辑、优惠政策、性价比分析' },
                { value: 'marketing', label: '营销策略研究', description: '推广手段、品牌包装、渠道策略' },
                { value: 'sales', label: '销售表现分析', description: '去化率、客群结构、成交特点' },
                { value: 'location', label: '区位优势对比', description: '地段价值、交通配套、周边环境' }
              ]
            }
          ]
        },
        {
          id: 'special_focus',
          title: '特殊关注点',
          description: '补充需要特别关注的竞品动态或市场变化',
          required: false,
          fields: [
            {
              id: 'special_attention',
              type: 'textarea',
              label: '特殊关注事项',
              placeholder: '例如：某竞品的最新降价活动、新推出的户型产品、重大营销事件等',
              required: false
            },
            {
              id: 'report_purpose',
              type: 'select',
              label: '报告主要用途',
              required: true,
              defaultValue: 'decision',
              options: [
                { value: 'decision', label: '内部决策参考', description: '为项目定位和策略制定提供依据' },
                { value: 'client', label: '客户沟通材料', description: '向合作方或投资方展示市场分析' },
                { value: 'management', label: '上级汇报', description: '向管理层汇报竞争态势' }
              ]
            },
            {
              id: 'detail_level',
              type: 'select',
              label: '报告详细程度',
              required: true,
              defaultValue: 'standard',
              options: [
                { value: 'simple', label: '简版 (15页)', description: '突出重点，适合快速决策' },
                { value: 'standard', label: '标准版 (25页)', description: '信息全面，逻辑清晰' },
                { value: 'detailed', label: '详细版 (35页)', description: '深度分析，数据详实' }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'promotion-strategy-plan',
    phase: 'phase2',
    name: '推广策略计划书',
    description: '阶段性推广主题、渠道组合、活动规划',
    category: '策略类',
    estimatedTime: '15-18分钟',
    implemented: true,   // ✅ 已在后端配置
    priority: 'core',
    complexity: 'standard',
    icon: '📢',
    tags: ['推广策略', '渠道规划', '预算分配', '内容营销'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'competitors', 'targetAudience'],
      optionalDataSources: ['marketData', 'budgetConstraints'],
      estimatedPages: 40,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0',
      aiModelRecommendation: 'qwen-max'
    },
    formConfig: {
      sections: [
        {
          id: 'project_status',
          title: '项目现状',
          required: true,
          fields: [
            {
              id: 'current_stage',
              type: 'select',
              label: '项目当前状态',
              required: true,
              options: [
                { value: 'planning', label: '前期策划阶段', description: '产品方案确定，准备营销策略' },
                { value: 'pre_launch', label: '即将开盘', description: '产品已定，准备市场推广' },
                { value: 'selling', label: '销售中', description: '已开盘，需要策略优化' },
                { value: 'final_stage', label: '尾盘阶段', description: '库存较少，需要去化策略' }
              ]
            }
          ]
        },
        {
          id: 'marketing_objectives',
          title: '营销目标',
          required: true,
          fields: [
            {
              id: 'budget_range',
              type: 'select',
              label: '营销预算范围',
              required: true,
              options: [
                { value: 'under_100w', label: '100万以下', description: '精准投放，注重效果' },
                { value: '100_300w', label: '100-300万', description: '平衡覆盖面和效果' },
                { value: '300_500w', label: '300-500万', description: '多渠道覆盖，品牌建设' },
                { value: 'over_500w', label: '500万以上', description: '全面营销，市场领导者' }
              ]
            },
            {
              id: 'marketing_period',
              type: 'select',
              label: '营销周期',
              required: true,
              options: [
                { value: '3months', label: '3个月', description: '快速启动，集中爆发' },
                { value: '6months', label: '6个月', description: '稳健推进，持续发力' },
                { value: '12months', label: '12个月', description: '长期布局，品牌积累' }
              ]
            },
            {
              id: 'target_clearance_rate',
              type: 'range',
              label: '目标去化率',
              required: true,
              defaultValue: 85,
              validation: { min: 60, max: 95 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'budget-calculation-sheet',
    phase: 'phase2',
    name: '预算测算表',
    description: '详细的营销费用预算和投入产出分析',
    category: '策略类',
    estimatedTime: '12-15分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'core',
    complexity: 'standard',
    icon: '💰',
    tags: ['预算分配', '成本分析', '投入产出', 'ROI计算'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'budgetData'],
      estimatedPages: 20,
      supportedFormats: ['pptx', 'pdf', 'xlsx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'sales-team-training-plan',
    phase: 'phase2',
    name: '销售团队培训方案',
    description: '销售团队结构、培训体系、KPI设计',
    category: '策略类',
    estimatedTime: '10-12分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'standard',
    icon: '👨‍🏫',
    tags: ['团队培训', '销售技能', 'KPI设计', '绩效管理'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'teamData'],
      estimatedPages: 15,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'pricing-strategy-analysis',
    phase: 'phase2',
    name: '定价策略分析报告',
    description: '基于市场分析和竞品对比，制定项目定价策略和优惠政策',
    category: '策略类',
    estimatedTime: '20-25分钟',
    implemented: true,  // ✅ 激活报告
    priority: 'core',
    complexity: 'standard',
    icon: '💰',
    tags: ['定价策略', '价格分析', '优惠政策'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'competitors', 'marketData'],
      estimatedPages: 22,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    }
  },

  // ===== 阶段三：开盘节点 =====
  {
    id: 'opening-review-report',
    phase: 'phase3',
    name: '开盘复盘报告',
    description: '开盘数据分析、问题诊断、表现评估',
    category: '复盘类',
    estimatedTime: '12-15分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'core',
    complexity: 'standard',
    icon: '🔥',
    tags: ['开盘复盘', '数据分析', '问题诊断'],
    config: {
      requiredDataSources: ['salesData', 'customerData'],
      estimatedPages: 25,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'opening-summary-strategy-adjustment',
    phase: 'phase3',
    name: '开盘总结&策略调整报告',
    description: '开盘后的策略优化和下一阶段建议',
    category: '策略类',
    estimatedTime: '10-12分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'core',
    complexity: 'standard',
    icon: '📈',
    tags: ['策略调整', '优化方案', '下阶段规划'],
    config: {
      requiredDataSources: ['salesData', 'marketFeedback'],
      estimatedPages: 18,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'competitor-dynamic-analysis',
    phase: 'phase3',
    name: '竞品动态对比分析',
    description: '跟踪分析竞品在开盘期间的策略变化和市场表现',
    category: '分析类',
    estimatedTime: '15-20分钟',
    implemented: true,  // ✅ 激活报告
    priority: 'normal',
    complexity: 'simple',
    icon: '🔍',
    tags: ['竞品跟踪', '动态分析', '市场变化'],
    config: {
      requiredDataSources: ['competitors', 'marketData'],
      estimatedPages: 15,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    }
  },

  // ===== 阶段四：运营期管理 =====
  {
    id: 'marketing-weekly-report',
    phase: 'phase4',
    name: '营销周报',
    description: '市场数据、竞品动态、销售表现的周度跟踪',
    category: '定期类',
    estimatedTime: '6-8分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'core',
    complexity: 'simple',
    icon: '📅',
    tags: ['周报', '市场动态', '销售数据', '工作计划'],
    config: {
      requiredDataSources: ['salesData', 'marketData'],
      estimatedPages: 10,
      supportedFormats: ['pptx', 'pdf'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'marketing-monthly-report',
    phase: 'phase4',
    name: '营销月报',
    description: '月度市场复盘、客户结构分析、KPI完成度评估',
    category: '定期类',
    estimatedTime: '10-12分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'standard',
    icon: '📊',
    tags: ['月报', '业绩分析', '客户分析', 'KPI评估'],
    config: {
      requiredDataSources: ['salesData', 'marketData', 'customerData'],
      estimatedPages: 25,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'marketing-quarterly-report',
    phase: 'phase4',
    name: '营销季报',
    description: '季度战略复盘、竞争格局分析、策略优化建议',
    category: '定期类',
    estimatedTime: '15-18分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'standard',
    icon: '📈',
    tags: ['季报', '战略复盘', '竞争分析', '策略优化'],
    config: {
      requiredDataSources: ['salesData', 'marketData', 'competitorData'],
      estimatedPages: 30,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'marketing-annual-report',
    phase: 'phase4',
    name: '营销年报',
    description: '年度全面总结、成果评估、来年规划',
    category: '定期类',
    estimatedTime: '20-25分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'complex',
    icon: '🎯',
    tags: ['年报', '全面总结', '成果评估', '来年规划'],
    config: {
      requiredDataSources: ['salesData', 'marketData', 'budgetData'],
      estimatedPages: 40,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'action-plan-report',
    phase: 'phase4',
    name: '行动计划报告',
    description: '下周/下月/下季度的具体行动计划和排期',
    category: '计划类',
    estimatedTime: '8-10分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'simple',
    icon: '📋',
    tags: ['行动计划', '排期安排', '目标设定', '资源配置'],
    config: {
      requiredDataSources: ['projectData', 'resourceData'],
      estimatedPages: 15,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },

  // ===== 阶段五：外部合作管理 =====
  {
    id: 'ad-agency-proposal',
    phase: 'phase5',
    name: '广告公司营销提案',
    description: '项目洞察、创意方向、推广渠道组合建议',
    category: '合作类',
    estimatedTime: '15-20分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'standard',
    icon: '🎨',
    tags: ['营销提案', '创意方向', '渠道建议', '合作方案'],
    config: {
      requiredDataSources: ['projectBasicInfo', 'marketingGoals'],
      estimatedPages: 25,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  },
  {
    id: 'market-data-research-report',
    phase: 'phase5',
    name: '市场数据深度研究报告',
    description: '第三方数据公司提供的专业市场分析报告',
    category: '分析类',
    estimatedTime: '12-15分钟',
    implemented: true,  // ✅ 已在后端配置
    priority: 'normal',
    complexity: 'standard',
    icon: '📊',
    tags: ['市场数据', '专业分析', '第三方报告', '数据洞察'],
    config: {
      requiredDataSources: ['marketData', 'competitorData', 'industryData'],
      estimatedPages: 30,
      supportedFormats: ['pptx', 'pdf', 'docx'],
      templateVersion: '2.0'
    }
  }
];

/**
 * 辅助函数：根据阶段获取报告定义
 */
export const getReportsByPhase = (phase: string): ReportDefinition[] => {
  return REPORT_DEFINITIONS.filter(report => report.phase === phase);
};

/**
 * 辅助函数：根据ID获取报告定义
 */
export const getReportById = (id: string): ReportDefinition | undefined => {
  return REPORT_DEFINITIONS.find(report => report.id === id);
};

/**
 * 辅助函数：获取已实现的报告
 */
export const getImplementedReports = (): ReportDefinition[] => {
  return REPORT_DEFINITIONS.filter(report => report.implemented);
};

/**
 * 辅助函数：获取占位报告
 */
export const getPlaceholderReports = (): ReportDefinition[] => {
  return REPORT_DEFINITIONS.filter(report => !report.implemented);
};

/**
 * 辅助函数：获取核心报告
 */
export const getCoreReports = (): ReportDefinition[] => {
  return REPORT_DEFINITIONS.filter(report => report.priority === 'core');
};

/**
 * 统计信息
 */
export const REPORT_STATS = {
  total: REPORT_DEFINITIONS.length,
  implemented: getImplementedReports().length,
  placeholder: getPlaceholderReports().length,
  byPhase: {
    phase1: getReportsByPhase('phase1').length,
    phase2: getReportsByPhase('phase2').length,
    phase3: getReportsByPhase('phase3').length,
    phase4: getReportsByPhase('phase4').length,
    phase5: getReportsByPhase('phase5').length,
  },
  byPriority: {
    core: getCoreReports().length,
    normal: REPORT_DEFINITIONS.filter(r => r.priority === 'normal').length,
    optional: REPORT_DEFINITIONS.filter(r => r.priority === 'optional').length,
  }
};

/**
 * 阶段配置信息
 */
export const PHASE_CONFIG = {
  phase1: {
    name: '拿地前可研',
    description: '市场分析、竞品研究、可行性评估，为投资决策提供依据',
    keyObjectives: ['市场环境分析', '竞争态势评估', '投资可行性判断', '拿地决策建议'],
    estimatedDuration: '2-3周'
  },
  phase2: {
    name: '产品定位 & 超盘方案',
    description: '确定产品定位、制定营销策略、设计推广方案',
    keyObjectives: ['产品定位确定', '营销策略制定', '推广方案设计', '预算计划制定'],
    estimatedDuration: '3-4周'
  },
  phase3: {
    name: '开盘节点',
    description: '开盘执行、数据跟踪、效果评估、策略调整',
    keyObjectives: ['开盘活动执行', '销售数据监控', '客户反馈收集', '策略及时调整'],
    estimatedDuration: '1-2周'
  },
  phase4: {
    name: '运营期管理',
    description: '持续营销、数据分析、效果优化、客户维护',
    keyObjectives: ['日常营销管理', '定期数据分析', '营销效果优化', '客户关系维护'],
    estimatedDuration: '持续进行'
  },
  phase5: {
    name: '外部合作管理',
    description: '供应商管理、合作评估、资源整合、效果监控',
    keyObjectives: ['供应商选择', '合作效果评估', '资源优化配置', '服务质量监控'],
    estimatedDuration: '持续进行'
  }
};