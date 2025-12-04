'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Report, ReportSlide, ReportContent } from '@/types/report';

interface ReportEditorProps {
  report: Report;
  onSave: (updatedReport: Report) => void;
  onClose: () => void;
}

interface EditableSlide extends ReportSlide {
  isEditing?: boolean;
}

export default function ReportEditor({ report, onSave, onClose }: ReportEditorProps) {
  const [slides, setSlides] = useState<EditableSlide[]>(report.content?.structure || []);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 更新幻灯片内容
  const updateSlideContent = (slideIndex: number, updates: Partial<ReportSlide>) => {
    setSlides(prev => prev.map((slide, index) =>
      index === slideIndex ? { ...slide, ...updates } : slide
    ));
    setHasChanges(true);
  };

  // 添加新幻灯片
  const addNewSlide = (afterIndex: number) => {
    const newSlide: EditableSlide = {
      slideNumber: afterIndex + 2,
      slideType: 'content',
      title: '新页面',
      content: {
        type: 'text',
        paragraphs: ['点击编辑此内容...']
      }
    };

    setSlides(prev => {
      const newSlides = [...prev];
      newSlides.splice(afterIndex + 1, 0, newSlide);
      // 重新编号后续页面
      return newSlides.map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));
    });
    setHasChanges(true);
    setSelectedSlideIndex(afterIndex + 1);
  };

  // 删除幻灯片
  const deleteSlide = (slideIndex: number) => {
    if (slides.length <= 1) return;

    setSlides(prev => {
      const newSlides = prev.filter((_, index) => index !== slideIndex);
      return newSlides.map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));
    });
    setHasChanges(true);
    if (selectedSlideIndex >= slides.length - 1) {
      setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
    }
  };

  // 移动幻灯片
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setSlides(prev => {
      const newSlides = [...prev];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);
      return newSlides.map((slide, index) => ({
        ...slide,
        slideNumber: index + 1
      }));
    });
    setHasChanges(true);
    setSelectedSlideIndex(toIndex);
  };

  // 保存报告
  const handleSave = () => {
    const updatedReport: Report = {
      ...report,
      content: {
        ...report.content!,
        structure: slides,
        metadata: {
          ...report.content!.metadata,
          totalSlides: slides.length,
          // 重新计算字数等统计
        }
      },
      updatedAt: new Date(),
    };

    onSave(updatedReport);
    setHasChanges(false);
  };

  // 导出功能
  const handleExport = (format: string) => {
    // 实际项目中应该调用导出API
    alert(`导出${format}格式功能开发中...`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="h-full flex">
        {/* 侧边栏 - 幻灯片缩略图 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">编辑报告</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{report.title}</p>
          </div>

          {/* 工具栏 */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => addNewSlide(selectedSlideIndex)}
                className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                title="添加页面"
              >
                ➕
              </button>
              <button
                onClick={() => deleteSlide(selectedSlideIndex)}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                title="删除页面"
                disabled={slides.length <= 1}
              >
                🗑️
              </button>
              <button
                onClick={() => setIsFullPreview(!isFullPreview)}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                title="全屏预览"
              >
                {isFullPreview ? '📝' : '👁️'}
              </button>
            </div>
          </div>

          {/* 幻灯片列表 */}
          <div className="flex-1 overflow-y-auto">
            {slides.map((slide, index) => (
              <SlideThumbnail
                key={index}
                slide={slide}
                index={index}
                isSelected={selectedSlideIndex === index}
                onClick={() => setSelectedSlideIndex(index)}
                onMove={(fromIndex, toIndex) => moveSlide(fromIndex, toIndex)}
              />
            ))}
          </div>

          {/* 底部操作 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {slides.length} 个页面
              </span>
              {hasChanges && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  有未保存更改
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
              <div className="relative group">
                <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                  导出
                </button>
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={() => handleExport('pptx')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    PowerPoint (.pptx)
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Word (.docx)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主编辑区域 */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          {isFullPreview ? (
            <FullScreenPreview
              slides={slides}
              currentSlide={selectedSlideIndex}
              onSlideChange={setSelectedSlideIndex}
              onExit={() => setIsFullPreview(false)}
            />
          ) : (
            <SlideEditor
              slide={slides[selectedSlideIndex]}
              onUpdate={(updates) => updateSlideContent(selectedSlideIndex, updates)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// 幻灯片缩略图组件
const SlideThumbnail = ({ slide, index, isSelected, onClick, onMove }: {
  slide: EditableSlide;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        // 实现拖拽排序逻辑
        setIsDragging(false);
      }}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
          isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {slide.slideNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {slide.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {slide.slideType === 'cover' ? '封面' :
             slide.slideType === 'agenda' ? '目录' :
             slide.slideType === 'section_header' ? '章节标题' :
             slide.slideType === 'content' ? '内容' :
             slide.slideType === 'chart' ? '图表' :
             slide.slideType === 'table' ? '表格' :
             slide.slideType === 'comparison' ? '对比' : '其他'}
          </p>
        </div>
      </div>
    </div>
  );
};

// 幻灯片编辑器
const SlideEditor = ({ slide, onUpdate }: {
  slide: EditableSlide;
  onUpdate: (updates: Partial<ReportSlide>) => void;
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);

  const handleTitleEdit = () => {
    if (titleRef.current) {
      onUpdate({ title: titleRef.current.value });
      setEditingField(null);
    }
  };

  const handleSubtitleEdit = () => {
    if (subtitleRef.current) {
      onUpdate({ subtitle: subtitleRef.current.value });
      setEditingField(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              第 {slide.slideNumber} 页
            </h3>
            <select
              value={slide.slideType}
              onChange={(e) => onUpdate({ slideType: e.target.value as any })}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="cover">封面</option>
              <option value="agenda">目录</option>
              <option value="section_header">章节标题</option>
              <option value="content">内容</option>
              <option value="chart">图表</option>
              <option value="table">表格</option>
              <option value="comparison">对比</option>
            </select>
          </div>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }}>
          <div className="h-full p-8 flex flex-col">
            {/* 标题编辑 */}
            <div className="mb-6">
              {editingField === 'title' ? (
                <input
                  ref={titleRef}
                  type="text"
                  defaultValue={slide.title}
                  onBlur={handleTitleEdit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleEdit()}
                  className="text-3xl font-bold text-gray-900 w-full border-0 outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-3xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={() => setEditingField('title')}
                >
                  {slide.title}
                </h1>
              )}

              {slide.subtitle !== undefined && (
                editingField === 'subtitle' ? (
                  <input
                    ref={subtitleRef}
                    type="text"
                    defaultValue={slide.subtitle}
                    onBlur={handleSubtitleEdit}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubtitleEdit()}
                    className="text-lg text-gray-600 w-full border-0 outline-none bg-transparent mt-2"
                    autoFocus
                  />
                ) : (
                  <p
                    className="text-lg text-gray-600 cursor-text hover:bg-gray-50 px-2 py-1 rounded mt-2"
                    onClick={() => setEditingField('subtitle')}
                  >
                    {slide.subtitle || '点击添加副标题...'}
                  </p>
                )
              )}
            </div>

            {/* 内容编辑 */}
            <div className="flex-1">
              <ContentEditor
                content={slide.content}
                onUpdate={(content) => onUpdate({ content })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 内容编辑器
const ContentEditor = ({ content, onUpdate }: {
  content?: ReportContent;
  onUpdate: (content: ReportContent) => void;
}) => {
  if (!content) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>选择内容类型开始编辑</p>
        <div className="mt-4 space-x-2">
          <button
            onClick={() => onUpdate({ type: 'text', paragraphs: ['新段落内容...'] })}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
          >
            文本
          </button>
          <button
            onClick={() => onUpdate({ type: 'list', listType: 'bullet', items: [{ text: '新列表项' }] })}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
          >
            列表
          </button>
        </div>
      </div>
    );
  }

  // 根据内容类型渲染不同的编辑器
  if (content.type === 'text') {
    return <TextContentEditor content={content} onUpdate={onUpdate} />;
  }

  if (content.type === 'list') {
    return <ListContentEditor content={content} onUpdate={onUpdate} />;
  }

  // 其他类型的编辑器...
  return (
    <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
      {content.type} 类型编辑器开发中...
    </div>
  );
};

// 文本内容编辑器
const TextContentEditor = ({ content, onUpdate }: {
  content: any;
  onUpdate: (content: ReportContent) => void;
}) => {
  const [paragraphs, setParagraphs] = useState(content.paragraphs || ['']);

  const updateParagraph = (index: number, text: string) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = text;
    setParagraphs(newParagraphs);
    onUpdate({ ...content, paragraphs: newParagraphs });
  };

  const addParagraph = () => {
    const newParagraphs = [...paragraphs, ''];
    setParagraphs(newParagraphs);
    onUpdate({ ...content, paragraphs: newParagraphs });
  };

  const removeParagraph = (index: number) => {
    if (paragraphs.length > 1) {
      const newParagraphs = paragraphs.filter((_, i) => i !== index);
      setParagraphs(newParagraphs);
      onUpdate({ ...content, paragraphs: newParagraphs });
    }
  };

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <div key={index} className="flex items-start space-x-2">
          <textarea
            value={paragraph}
            onChange={(e) => updateParagraph(index, e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="输入段落内容..."
            rows={3}
          />
          <button
            onClick={() => removeParagraph(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            disabled={paragraphs.length <= 1}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={addParagraph}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        + 添加段落
      </button>
    </div>
  );
};

// 列表内容编辑器
const ListContentEditor = ({ content, onUpdate }: {
  content: any;
  onUpdate: (content: ReportContent) => void;
}) => {
  const [items, setItems] = useState(content.items || [{ text: '' }]);

  const updateItem = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text };
    setItems(newItems);
    onUpdate({ ...content, items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, { text: '' }];
    setItems(newItems);
    onUpdate({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      onUpdate({ ...content, items: newItems });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium text-gray-700">列表类型：</label>
        <select
          value={content.listType}
          onChange={(e) => onUpdate({ ...content, listType: e.target.value as any })}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="bullet">无序列表</option>
          <option value="numbered">有序列表</option>
          <option value="checklist">检查列表</option>
        </select>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-2">
          <span className="text-gray-400 pt-3">
            {content.listType === 'numbered' ? `${index + 1}.` :
             content.listType === 'checklist' ? '☐' : '•'}
          </span>
          <textarea
            value={item.text}
            onChange={(e) => updateItem(index, e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="输入列表项内容..."
            rows={2}
          />
          <button
            onClick={() => removeItem(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            disabled={items.length <= 1}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        + 添加列表项
      </button>
    </div>
  );
};

// 全屏预览组件
const FullScreenPreview = ({ slides, currentSlide, onSlideChange, onExit }: {
  slides: EditableSlide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onExit: () => void;
}) => {
  return (
    <div className="h-full bg-black flex flex-col">
      {/* 顶部控制栏 */}
      <div className="bg-black/80 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
          >
            ← 上一页
          </button>
          <span className="text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-3 py-1 bg-white/20 rounded disabled:opacity-50"
          >
            下一页 →
          </button>
        </div>
        <button
          onClick={onExit}
          className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
        >
          退出预览
        </button>
      </div>

      {/* 幻灯片展示区 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl" style={{ aspectRatio: '16/9' }}>
          <div className="h-full p-12 flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {slides[currentSlide]?.title}
            </h1>
            {slides[currentSlide]?.subtitle && (
              <p className="text-xl text-gray-600 mb-8">
                {slides[currentSlide]?.subtitle}
              </p>
            )}
            <div className="flex-1">
              {/* 渲染幻灯片内容 */}
              {/* 这里可以复用之前的 SlideRenderer 组件 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};