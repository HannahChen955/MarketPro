'use client';

import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Save, FileText, Sparkles, Download } from 'lucide-react';
import { AIReportGenerator } from './AIReportGenerator';
import { ReportManager } from './ReportManager';
import { GeneratedReport } from '@/services/reportGeneration';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  fields: FormField[];
}

export interface ReportFormData {
  [key: string]: any;
}

interface ReportFormBaseProps {
  title: string;
  description: string;
  phaseIcon: ReactNode;
  phaseId: string;
  projectId: string;
  sections: FormSection[];
  formData: ReportFormData;
  onFormChange: (data: ReportFormData) => void;
  onSave: () => void;
  onGenerateReport?: () => void;
  onReportGenerated?: (report: GeneratedReport) => void;
  isGenerating?: boolean;
  isSaving?: boolean;
}

export function ReportFormBase({
  title,
  description,
  phaseIcon,
  phaseId,
  projectId,
  sections,
  formData,
  onFormChange,
  onSave,
  onGenerateReport,
  onReportGenerated,
  isGenerating = false,
  isSaving = false
}: ReportFormBaseProps) {
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [showReportManager, setShowReportManager] = useState(false);

  const handleAIGenerate = () => {
    setIsAIGeneratorOpen(true);
  };

  const handleReportGenerated = (report: GeneratedReport) => {
    console.log('Report generated:', report);
    setIsAIGeneratorOpen(false);
    setGeneratedReport(report);
    setShowReportManager(true);
    if (onReportGenerated) {
      onReportGenerated(report);
    }
  };

  const handleReportSave = async (report: GeneratedReport) => {
    // 这里可以添加保存报告到后端的逻辑
    console.log('Saving report:', report);
    setGeneratedReport(report);
  };

  const handleReportExport = async (report: GeneratedReport, format: 'pdf' | 'word' | 'excel') => {
    // 这里可以添加导出报告的逻辑
    console.log('Exporting report as:', format, report);
  };

  const handleReportShare = async (report: GeneratedReport) => {
    // 这里可以添加分享报告的逻辑
    console.log('Sharing report:', report);
  };

  const updateField = (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value };
    onFormChange(newData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">请选择...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      updateField(field.id, [...currentValues, option.value]);
                    } else {
                      updateField(field.id, currentValues.filter(v => v !== option.value));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              updateField(field.id, file);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        );

      default:
        return null;
    }
  };

  // If a report is generated and ReportManager is open, show ReportManager instead
  if (showReportManager && generatedReport) {
    return (
      <ReportManager
        initialReport={generatedReport}
        projectId={projectId}
        phaseId={phaseId}
        onSave={handleReportSave}
        onExport={handleReportExport}
        onShare={handleReportShare}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 表单头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {phaseIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-blue-100 mt-1">{description}</p>
          </div>
        </div>

        {/* 快速操作按钮 */}
        <div className="flex gap-4">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>

          <Button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'AI生成中...' : 'AI智能生成报告'}
          </Button>

          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            导出模板
          </Button>
        </div>
      </div>

      {/* 表单内容区域 */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {section.icon && (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {section.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </div>
                    <div className="text-sm text-gray-600 font-normal">
                      {section.description}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {renderField(field)}

                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 底部操作区 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💡 提示：填写完整信息后，AI将为您生成更准确的专业报告
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              保存草稿
            </Button>

            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'AI生成中...' : '生成专业报告'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI报告生成器 */}
      <AIReportGenerator
        projectId={projectId}
        phaseId={phaseId}
        formData={formData}
        onReportGenerated={handleReportGenerated}
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
      />
    </div>
  );
}