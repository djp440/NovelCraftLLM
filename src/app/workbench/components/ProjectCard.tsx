/**
 * 项目卡片组件
 * 显示单个项目的详细信息，支持各种操作
 */

'use client';

import React, { useState } from 'react';
import { Project, ProjectCardCallbacks } from './types';

interface ProjectCardProps {
    project: Project;
    callbacks?: ProjectCardCallbacks;
    className?: string;
}

/**
 * 获取状态标签的颜色和文本
 */
function getStatusConfig(status: string) {
    switch (status) {
        case 'active':
            return {
                text: '进行中',
                bgColor: 'bg-green-100 dark:bg-green-900',
                textColor: 'text-green-800 dark:text-green-200',
                borderColor: 'border-green-300 dark:border-green-700',
            };
        case 'archived':
            return {
                text: '已归档',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
                textColor: 'text-gray-800 dark:text-gray-200',
                borderColor: 'border-gray-300 dark:border-gray-700',
            };
        case 'planning':
            return {
                text: '规划中',
                bgColor: 'bg-blue-100 dark:bg-blue-900',
                textColor: 'text-blue-800 dark:text-blue-200',
                borderColor: 'border-blue-300 dark:border-blue-700',
            };
        default:
            return {
                text: '未知',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
                textColor: 'text-gray-800 dark:text-gray-200',
                borderColor: 'border-gray-300 dark:border-gray-700',
            };
    }
}

/**
 * 格式化日期显示
 */
function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return '今天';
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)}周前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    } catch {
        return dateString;
    }
}

export default function ProjectCard({ project, callbacks, className = '' }: ProjectCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const statusConfig = getStatusConfig(project.status);

    const handleCardClick = () => {
        callbacks?.onViewDetails?.(project);
    };

    const handleButtonClick = (e: React.MouseEvent, action?: (project: Project) => void) => {
        e.stopPropagation();
        action?.(project);
    };

    return (
        <div
            className={`
                relative bg-white dark:bg-gray-800 rounded-lg shadow-sm 
                border border-gray-200 dark:border-gray-700 
                transition-all duration-200 hover:shadow-md 
                hover:border-gray-300 dark:hover:border-gray-600
                overflow-hidden cursor-pointer ${className}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            {/* 项目封面 */}
            <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-900 relative">
                {project.cover_image ? (
                    <img
                        src={project.cover_image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.placeholder-icon')?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center absolute top-0 left-0 placeholder-icon ${project.cover_image ? 'hidden' : ''}`}>
                    <div className="text-4xl text-gray-400 dark:text-gray-500">
                        📖
                    </div>
                </div>
            </div>

            {/* 项目内容区域 */}
            <div className="p-4">
                {/* 标题和状态 */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {project.title}
                    </h3>
                    <span className={`
                        px-2 py-1 text-xs font-medium rounded-full 
                        ${statusConfig.bgColor} ${statusConfig.textColor}
                        border ${statusConfig.borderColor}
                        whitespace-nowrap
                    `}>
                        {statusConfig.text}
                    </span>
                </div>

                {/* 描述 */}
                {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* 元信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>创建于 {formatDate(project.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>🔄</span>
                        <span>更新于 {formatDate(project.updated_at)}</span>
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className={`
                    flex justify-end space-x-2 pt-3 border-t 
                    border-gray-100 dark:border-gray-700
                    transition-opacity duration-200
                    ${isHovered ? 'opacity-100' : 'opacity-80'}
                `}>
                    {callbacks?.onViewDetails && (
                        <button
                            onClick={(e) => handleButtonClick(e, callbacks.onViewDetails)}
                            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 
                                     hover:text-blue-800 dark:hover:text-blue-300 
                                     hover:bg-blue-50 dark:hover:bg-blue-900/30 
                                     rounded transition-colors"
                        >
                            查看详情
                        </button>
                    )}

                    {callbacks?.onContinue && (
                        <button
                            onClick={(e) => handleButtonClick(e, callbacks.onContinue)}
                            className="px-3 py-1 text-sm text-green-600 dark:text-green-400 
                                     hover:text-green-800 dark:hover:text-green-300 
                                     hover:bg-green-50 dark:hover:bg-green-900/30 
                                     rounded transition-colors"
                        >
                            继续创作
                        </button>
                    )}

                    {callbacks?.onEdit && (
                        <button
                            onClick={(e) => handleButtonClick(e, callbacks.onEdit)}
                            className="px-3 py-1 text-sm text-yellow-600 dark:text-yellow-400 
                                     hover:text-yellow-800 dark:hover:text-yellow-300 
                                     hover:bg-yellow-50 dark:hover:bg-yellow-900/30 
                                     rounded transition-colors"
                        >
                            编辑
                        </button>
                    )}

                    {callbacks?.onDelete && (
                        <button
                            onClick={(e) => handleButtonClick(e, callbacks.onDelete)}
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 
                                     hover:text-red-800 dark:hover:text-red-300 
                                     hover:bg-red-50 dark:hover:bg-red-900/30 
                                     rounded transition-colors"
                        >
                            删除
                        </button>
                    )}
                </div>
            </div>

            {/* 悬停效果指示器 */}
            {isHovered && (
                <div className="absolute inset-0 border-2 border-blue-400 dark:border-blue-500 rounded-lg pointer-events-none opacity-30" />
            )}
        </div>
    );
}