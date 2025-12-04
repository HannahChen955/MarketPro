import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveConfig {
  delay?: number; // 延迟保存时间（毫秒）
  onSave: (data: any) => Promise<void>; // 保存函数
  validateData?: (data: any) => boolean; // 验证函数
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isValid: boolean;
  error: string | null;
}

export function useAutoSave<T>(
  data: T,
  config: AutoSaveConfig
): [AutoSaveState, { forceSave: () => Promise<void>; clearError: () => void }] {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    isValid: true,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);
  const { delay = 3000, onSave, validateData } = config;

  // 保存数据的内部函数
  const saveData = useCallback(async () => {
    if (!data) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSave(data);
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : '保存失败'
      }));
    }
  }, [data, onSave]);

  // 强制保存函数
  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await saveData();
  }, [saveData]);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 监听数据变化
  useEffect(() => {
    // 检查数据是否发生变化
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);

    if (hasChanged) {
      lastDataRef.current = data;

      // 验证数据
      const isValid = validateData ? validateData(data) : true;

      setState(prev => ({
        ...prev,
        hasUnsavedChanges: true,
        isValid
      }));

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 只有在数据有效时才设置自动保存
      if (isValid) {
        timeoutRef.current = setTimeout(() => {
          saveData();
        }, delay);
      }
    }
  }, [data, validateData, delay, saveData]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, { forceSave, clearError }];
}

// 表单验证工具函数
export const formValidators = {
  // 验证必填字段
  required: (value: any, fieldName: string) => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}不能为空`;
    }
    return null;
  },

  // 验证数字范围
  numberRange: (value: number, min: number, max: number, fieldName: string) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return `${fieldName}必须是有效数字`;
    }
    if (value < min || value > max) {
      return `${fieldName}必须在 ${min} 到 ${max} 之间`;
    }
    return null;
  },

  // 验证正数
  positiveNumber: (value: number, fieldName: string) => {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      return `${fieldName}必须是正数`;
    }
    return null;
  },

  // 验证字符串长度
  stringLength: (value: string, min: number, max: number, fieldName: string) => {
    if (typeof value !== 'string') {
      return `${fieldName}必须是字符串`;
    }
    if (value.length < min || value.length > max) {
      return `${fieldName}长度必须在 ${min} 到 ${max} 个字符之间`;
    }
    return null;
  },

  // 验证邮箱格式
  email: (value: string, fieldName: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName}格式不正确`;
    }
    return null;
  },

  // 验证手机号格式
  phone: (value: string, fieldName: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return `${fieldName}格式不正确`;
    }
    return null;
  }
};

// 项目基础信息验证器
export const validateProjectBasicInfo = (data: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // 验证项目名称
  if (!data.name || data.name.trim() === '') {
    errors.name = '项目名称不能为空';
  } else if (data.name.length > 100) {
    errors.name = '项目名称不能超过100个字符';
  }

  // 验证城市
  if (!data.city || data.city.trim() === '') {
    errors.city = '所在城市不能为空';
  }

  // 验证基础信息
  if (data.basicInfo) {
    // 验证位置信息
    if (data.basicInfo.location) {
      if (!data.basicInfo.location.address || data.basicInfo.location.address.trim() === '') {
        errors.address = '详细地址不能为空';
      }
      if (!data.basicInfo.location.district || data.basicInfo.location.district.trim() === '') {
        errors.district = '所在区域不能为空';
      }
    }

    // 验证规模信息
    if (data.basicInfo.scale) {
      const landAreaError = formValidators.positiveNumber(data.basicInfo.scale.landArea, '用地面积');
      if (landAreaError) errors.landArea = landAreaError;

      const buildingAreaError = formValidators.positiveNumber(data.basicInfo.scale.buildingArea, '建筑面积');
      if (buildingAreaError) errors.buildingArea = buildingAreaError;

      if (data.basicInfo.scale.plotRatio && data.basicInfo.scale.plotRatio < 0) {
        errors.plotRatio = '容积率不能为负数';
      }

      const greenRateError = formValidators.numberRange(data.basicInfo.scale.greenRate, 0, 100, '绿化率');
      if (greenRateError) errors.greenRate = greenRateError;
    }

    // 验证产品信息
    if (data.basicInfo.product) {
      const totalUnitsError = formValidators.positiveNumber(data.basicInfo.product.totalUnits, '总套数');
      if (totalUnitsError) errors.totalUnits = totalUnitsError;

      if (data.basicInfo.product.priceRange) {
        const minPriceError = formValidators.positiveNumber(data.basicInfo.product.priceRange.min, '最低价格');
        if (minPriceError) errors.priceMin = minPriceError;

        const maxPriceError = formValidators.positiveNumber(data.basicInfo.product.priceRange.max, '最高价格');
        if (maxPriceError) errors.priceMax = maxPriceError;

        if (data.basicInfo.product.priceRange.min && data.basicInfo.product.priceRange.max &&
            data.basicInfo.product.priceRange.min >= data.basicInfo.product.priceRange.max) {
          errors.priceRange = '最高价格必须大于最低价格';
        }
      }
    }

    // 验证时间进度
    if (data.basicInfo.timeline && !data.basicInfo.timeline.currentProgress) {
      errors.currentProgress = '当前进度不能为空';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 竞品信息验证器
export const validateCompetitorInfo = (data: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = '竞品名称不能为空';
  }

  if (data.location) {
    if (!data.location.address || data.location.address.trim() === '') {
      errors.address = '详细地址不能为空';
    }
    if (!data.location.district || data.location.district.trim() === '') {
      errors.district = '所在区域不能为空';
    }
    if (data.location.distance && data.location.distance < 0) {
      errors.distance = '距离不能为负数';
    }
  }

  if (data.product && data.product.priceRange) {
    const minPriceError = formValidators.positiveNumber(data.product.priceRange.min, '最低价格');
    if (minPriceError) errors.priceMin = minPriceError;

    const maxPriceError = formValidators.positiveNumber(data.product.priceRange.max, '最高价格');
    if (maxPriceError) errors.priceMax = maxPriceError;

    if (data.product.priceRange.min >= data.product.priceRange.max) {
      errors.priceRange = '最高价格必须大于最低价格';
    }
  }

  if (data.sales) {
    if (data.sales.monthlyVolume && data.sales.monthlyVolume < 0) {
      errors.monthlyVolume = '月销量不能为负数';
    }
    if (data.sales.totalSold && data.sales.totalSold < 0) {
      errors.totalSold = '总销量不能为负数';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};