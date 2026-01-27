/**
 * 项目列表组件
 * 以网格形式展示项目列表，支持空状态和加载状态
 */

'use client';

import React from 'react';
import ProjectCard from './ProjectCard';
import { Project, ProjectCardCallbacks } from './types';

interface ProjectListProps {
    projects: Project[];
    loading?: boolean;
    error?: string | null;
    callbacks?: ProjectCardCallbacks;
    emptyMessage?: string;
    className?: string;
}

export default function ProjectList({
    projects,
    loading = false,
    error = null,
    callbacks,
    emptyMessage = '暂无项目，点击"新建项目"开始创作',
    className = '',
}: ProjectListProps) {
    // 加载状态
    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">正在加载项目...</p>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 dark:text-red-400 mb-2">加载项目失败</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
            </div>
        );
    }

    // 空状态
    if (projects.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📚</div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{emptyMessage}</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                    项目将在这里以卡片形式展示
                </p>
            </div>
        );
    }

    // 正常状态 - 网格布局
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    callbacks={callbacks}
                />
            ))}
        </div>
    );
}

/**
 * 项目列表容器组件 - 带有标题和操作按钮
 */
interface ProjectListContainerProps extends ProjectListProps {
    title?: string;
    onNewProject?: () => void;
    showNewButton?: boolean;
}

export function ProjectListContainer({
    title = '我的项目',
    projects,
    loading,
    error,
    callbacks,
    emptyMessage,
    onNewProject,
    showNewButton = true,
    className = '',
}: ProjectListContainerProps) {
    return (
        <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 ${className}`}>
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        共 {projects.length} 个项目
                    </p>
                </div>

                {showNewButton && onNewProject && (
                    <button
                        onClick={onNewProject}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                                 dark:bg-blue-500 dark:hover:bg-blue-600 
                                 text-white font-medium rounded-lg 
                                 transition-colors flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>新建项目</span>
                    </button>
                )}
            </div>

            {/* 项目列表 */}
            <ProjectList
                projects={projects}
                loading={loading}
                error={error}
                callbacks={callbacks}
                emptyMessage={emptyMessage}
            />

            {/* 底部信息 */}
            {projects.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        提示：点击项目卡片上的按钮可以进行编辑、删除等操作
                    </p>
                </div>
            )}
        </div>
    );
}