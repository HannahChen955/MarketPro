'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectBasicInfo, ProjectType, HouseType } from '@/types/project';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => void;
}

export interface ProjectFormData {
  name: string;
  city: string;
  type: ProjectType;
  basicInfo: {
    location: {
      address: string;
      district: string;
    };
    scale: {
      landArea: number;
      buildingArea: number;
      plotRatio: number;
      greenRate: number;
    };
    product: {
      totalUnits: number;
      houseTypes: HouseType[];
      priceRange: {
        min: number;
        max: number;
        average: number;
        avgPricePerSqm: number;
      };
      features: string[];
    };
    timeline: {
      currentProgress: string;
      plannedLaunchDate?: Date;
      estimatedCompletionDate?: Date;
    };
  };
}

export default function ProjectCreateModal({ isOpen, onClose, onSubmit }: ProjectCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    city: '',
    type: 'residential',
    basicInfo: {
      location: {
        address: '',
        district: ''
      },
      scale: {
        landArea: 0,
        buildingArea: 0,
        plotRatio: 0,
        greenRate: 0
      },
      product: {
        totalUnits: 0,
        houseTypes: [],
        priceRange: {
          min: 0,
          max: 0,
          average: 0,
          avgPricePerSqm: 0
        },
        features: []
      },
      timeline: {
        currentProgress: '拿地前可研阶段'
      }
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, name: '基本信息', icon: '📋' },
    { id: 2, name: '地块信息', icon: '🏗️' },
    { id: 3, name: '产品信息', icon: '🏠' },
    { id: 4, name: '时间规划', icon: '📅' }
  ];

  const projectTypes = [
    { value: 'residential', label: '住宅项目', icon: '🏢' },
    { value: 'commercial', label: '商业项目', icon: '🏪' },
    { value: 'villa', label: '别墅项目', icon: '🏘️' },
    { value: 'mixed', label: '综合项目', icon: '🏛️' }
  ];

  const houseTypeOptions: HouseType[] = ['studio', 'oneBedroom', 'twoBedroom', 'threeBedroom', 'fourBedroom', 'penthouse', 'maisonette'];

  const houseTypeLabels = {
    studio: '开间',
    oneBedroom: '一居室',
    twoBedroom: '二居室',
    threeBedroom: '三居室',
    fourBedroom: '四居室',
    penthouse: '顶层公寓',
    maisonette: '复式'
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = '项目名称不能为空';
        if (!formData.city.trim()) newErrors.city = '所在城市不能为空';
        break;
      case 2:
        if (!formData.basicInfo.location.address.trim()) newErrors.address = '详细地址不能为空';
        if (!formData.basicInfo.location.district.trim()) newErrors.district = '所在区域不能为空';
        if (formData.basicInfo.scale.landArea <= 0) newErrors.landArea = '用地面积必须大于0';
        if (formData.basicInfo.scale.buildingArea <= 0) newErrors.buildingArea = '建筑面积必须大于0';
        break;
      case 3:
        if (formData.basicInfo.product.totalUnits <= 0) newErrors.totalUnits = '总套数必须大于0';
        if (formData.basicInfo.product.priceRange.min <= 0) newErrors.priceMin = '最低价格必须大于0';
        if (formData.basicInfo.product.priceRange.max <= formData.basicInfo.product.priceRange.min) {
          newErrors.priceMax = '最高价格必须大于最低价格';
        }
        break;
      case 4:
        if (!formData.basicInfo.timeline.currentProgress.trim()) {
          newErrors.currentProgress = '当前进度不能为空';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Calculate average and avgPricePerSqm before submitting
      const updatedFormData = {
        ...formData,
        basicInfo: {
          ...formData.basicInfo,
          product: {
            ...formData.basicInfo.product,
            priceRange: {
              ...formData.basicInfo.product.priceRange,
              average: (formData.basicInfo.product.priceRange.min + formData.basicInfo.product.priceRange.max) / 2,
              avgPricePerSqm: formData.basicInfo.product.priceRange.avgPricePerSqm ||
                              (formData.basicInfo.product.priceRange.min + formData.basicInfo.product.priceRange.max) / 2 * 10000 /
                              (formData.basicInfo.scale.buildingArea / formData.basicInfo.product.totalUnits)
            }
          }
        }
      };
      onSubmit(updatedFormData);
      onClose();
      // Reset form
      setCurrentStep(1);
      setFormData({
        name: '',
        city: '',
        type: 'residential',
        basicInfo: {
          location: { address: '', district: '' },
          scale: { landArea: 0, buildingArea: 0, plotRatio: 0, greenRate: 0 },
          product: {
            totalUnits: 0,
            houseTypes: [],
            priceRange: { min: 0, max: 0, average: 0, avgPricePerSqm: 0 },
            features: []
          },
          timeline: { currentProgress: '拿地前可研阶段' }
        }
      });
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.basicInfo.product.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          product: {
            ...prev.basicInfo.product,
            features: [...prev.basicInfo.product.features, newFeature.trim()]
          }
        }
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        product: {
          ...prev.basicInfo.product,
          features: prev.basicInfo.product.features.filter(f => f !== feature)
        }
      }
    }));
  };

  const toggleHouseType = (houseType: HouseType) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        product: {
          ...prev.basicInfo.product,
          houseTypes: prev.basicInfo.product.houseTypes.includes(houseType)
            ? prev.basicInfo.product.houseTypes.filter(t => t !== houseType)
            : [...prev.basicInfo.product.houseTypes, houseType]
        }
      }
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={onClose}
            />

            {/* 模态框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative"
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>

              {/* 标题 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">创建新项目</h2>
                <p className="text-gray-600">填写项目基本信息，开始您的房地产营销之旅</p>
              </div>

              {/* 步骤指示器 */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-indigo-600' : 'text-gray-400'
                      }`}>
                        步骤 {step.id}
                      </p>
                      <p className={`text-xs ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* 表单内容 */}
              <div className="min-h-[400px]">
                {/* 步骤1: 基本信息 */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        项目名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="请输入项目名称，如：万科翡翠公园"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        所在城市 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="请输入所在城市，如：深圳"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        项目类型 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {projectTypes.map(type => (
                          <motion.button
                            key={type.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value as ProjectType }))}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              formData.type === type.value
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="font-medium">{type.label}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 步骤2: 地块信息 */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          详细地址 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.basicInfo.location.address}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              location: { ...prev.basicInfo.location, address: e.target.value }
                            }
                          }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="如：南山区深南大道1001号"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所在区域 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.basicInfo.location.district}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              location: { ...prev.basicInfo.location, district: e.target.value }
                            }
                          }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.district ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="如：南山区"
                        />
                        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          用地面积 (㎡) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.basicInfo.scale.landArea || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              scale: { ...prev.basicInfo.scale, landArea: Number(e.target.value) }
                            }
                          }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.landArea ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="50000"
                        />
                        {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          建筑面积 (㎡) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.basicInfo.scale.buildingArea || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              scale: { ...prev.basicInfo.scale, buildingArea: Number(e.target.value) }
                            }
                          }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.buildingArea ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="120000"
                        />
                        {errors.buildingArea && <p className="text-red-500 text-sm mt-1">{errors.buildingArea}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">容积率</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.basicInfo.scale.plotRatio || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              scale: { ...prev.basicInfo.scale, plotRatio: Number(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="2.4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">绿化率 (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.basicInfo.scale.greenRate || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              scale: { ...prev.basicInfo.scale, greenRate: Number(e.target.value) }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="35"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 步骤3: 产品信息 */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        总套数 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.basicInfo.product.totalUnits || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          basicInfo: {
                            ...prev.basicInfo,
                            product: { ...prev.basicInfo.product, totalUnits: Number(e.target.value) }
                          }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.totalUnits ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="800"
                      />
                      {errors.totalUnits && <p className="text-red-500 text-sm mt-1">{errors.totalUnits}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">户型配置</label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {houseTypeOptions.map(houseType => (
                          <button
                            key={houseType}
                            type="button"
                            onClick={() => toggleHouseType(houseType)}
                            className={`p-3 rounded-lg border text-sm transition-colors ${
                              formData.basicInfo.product.houseTypes.includes(houseType)
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {houseTypeLabels[houseType]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">价格区间 (万元)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">最低价格 *</label>
                          <input
                            type="number"
                            value={formData.basicInfo.product.priceRange.min || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              basicInfo: {
                                ...prev.basicInfo,
                                product: {
                                  ...prev.basicInfo.product,
                                  priceRange: { ...prev.basicInfo.product.priceRange, min: Number(e.target.value) }
                                }
                              }
                            }))}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors.priceMin ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="450"
                          />
                          {errors.priceMin && <p className="text-red-500 text-xs mt-1">{errors.priceMin}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">最高价格 *</label>
                          <input
                            type="number"
                            value={formData.basicInfo.product.priceRange.max || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              basicInfo: {
                                ...prev.basicInfo,
                                product: {
                                  ...prev.basicInfo.product,
                                  priceRange: { ...prev.basicInfo.product.priceRange, max: Number(e.target.value) }
                                }
                              }
                            }))}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors.priceMax ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="680"
                          />
                          {errors.priceMax && <p className="text-red-500 text-xs mt-1">{errors.priceMax}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">均价 (元/㎡)</label>
                          <input
                            type="number"
                            value={formData.basicInfo.product.priceRange.avgPricePerSqm || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              basicInfo: {
                                ...prev.basicInfo,
                                product: {
                                  ...prev.basicInfo.product,
                                  priceRange: { ...prev.basicInfo.product.priceRange, avgPricePerSqm: Number(e.target.value) }
                                }
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="65000"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">产品特色</label>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="添加产品特色，如：精装修、智能家居等"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          添加
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.basicInfo.product.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="ml-2 text-indigo-500 hover:text-indigo-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 步骤4: 时间规划 */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前进度 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.basicInfo.timeline.currentProgress}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          basicInfo: {
                            ...prev.basicInfo,
                            timeline: { ...prev.basicInfo.timeline, currentProgress: e.target.value }
                          }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.currentProgress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="拿地前可研阶段">拿地前可研阶段</option>
                        <option value="产品定位阶段">产品定位阶段</option>
                        <option value="开盘节点阶段">开盘节点阶段</option>
                        <option value="运营期阶段">运营期阶段</option>
                        <option value="外部合作阶段">外部合作阶段</option>
                      </select>
                      {errors.currentProgress && <p className="text-red-500 text-sm mt-1">{errors.currentProgress}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">计划开盘日期</label>
                        <input
                          type="date"
                          value={formData.basicInfo.timeline.plannedLaunchDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              timeline: {
                                ...prev.basicInfo.timeline,
                                plannedLaunchDate: e.target.value ? new Date(e.target.value) : undefined
                              }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">预计完工日期</label>
                        <input
                          type="date"
                          value={formData.basicInfo.timeline.estimatedCompletionDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            basicInfo: {
                              ...prev.basicInfo,
                              timeline: {
                                ...prev.basicInfo.timeline,
                                estimatedCompletionDate: e.target.value ? new Date(e.target.value) : undefined
                              }
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-6">
                      <h4 className="font-medium text-indigo-900 mb-3">📋 项目摘要</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-indigo-600">项目名称:</span>
                          <span className="ml-2 text-gray-900">{formData.name || '未填写'}</span>
                        </div>
                        <div>
                          <span className="text-indigo-600">所在城市:</span>
                          <span className="ml-2 text-gray-900">{formData.city || '未填写'}</span>
                        </div>
                        <div>
                          <span className="text-indigo-600">项目类型:</span>
                          <span className="ml-2 text-gray-900">
                            {projectTypes.find(t => t.value === formData.type)?.label || '未选择'}
                          </span>
                        </div>
                        <div>
                          <span className="text-indigo-600">总套数:</span>
                          <span className="ml-2 text-gray-900">{formData.basicInfo.product.totalUnits || 0} 套</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  ← 上一步
                </button>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{currentStep} / {steps.length}</span>
                </div>

                {currentStep < steps.length ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    下一步 →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🚀 创建项目
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}