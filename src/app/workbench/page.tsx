/**
 * 工作台页面 - 受保护路由
 * 需要有效的JWT令牌才能访问
 * 集成侧边栏和项目列表功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ProjectListContainer } from './components/ProjectList';
import NewProjectModal from './components/NewProjectModal';
import ConfirmDialog from './components/ConfirmDialog';
import { Project, NewProjectData } from './components/types';
import { fetchProjects, createProject, deleteProject } from './utils/api';
import { useRouter } from 'next/navigation';

export default function WorkbenchPage() {
    const router = useRouter();
    // 状态管理
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 模态框状态
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    // 操作状态
    const [creatingProject, setCreatingProject] = useState(false);

    // 加载项目数据
    useEffect(() => {
        loadProjects();
    }, []);

    /**
     * 加载项目列表
     */
    const loadProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProjects();
            setProjects(data);
        } catch (err) {
            console.error('加载项目失败:', err);
            setError(err instanceof Error ? err.message : '加载项目失败');
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理新建项目
     */
    const handleCreateProject = async (projectData: NewProjectData) => {
        try {
            setCreatingProject(true);
            const newProject = await createProject(projectData);

            // 更新项目列表
            setProjects(prev => [newProject, ...prev]);

            // 显示成功提示
            console.log('项目创建成功:', newProject.title);
        } catch (err) {
            console.error('创建项目失败:', err);
            throw err; // 让模态框处理错误
        } finally {
            setCreatingProject(false);
        }
    };

    /**
     * 处理删除项目
     */
    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            await deleteProject(projectToDelete.id);

            // 从列表中移除项目
            setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));

            // 显示成功提示
            console.log('项目删除成功:', projectToDelete.title);
        } catch (err) {
            console.error('删除项目失败:', err);
            alert('删除项目失败，请重试');
        } finally {
            setProjectToDelete(null);
            setShowConfirmDialog(false);
        }
    };

    /**
     * 打开删除确认对话框
     */
    const openDeleteConfirm = (project: Project) => {
        setProjectToDelete(project);
        setShowConfirmDialog(true);
    };

    /**
     * 项目卡片操作回调
     */
    const projectCallbacks = {
        onViewDetails: (project: Project) => {
            console.log('查看项目详情:', project.title);
            router.push(`/workbench/${project.id}`);
        },
        onContinue: (project: Project) => {
            console.log('继续创作项目:', project.title);
            // 跳转到章节管理页，之后有了编辑器再改
            router.push(`/workbench/${project.id}/chapters`);
        },
        onEdit: (project: Project) => {
            console.log('编辑项目:', project.title);
            router.push(`/workbench/${project.id}`);
        },
        onDelete: openDeleteConfirm,
    };

    // 获取最近创建的项目
    const getRecentProjects = () => {
        return [...projects]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex">
                {/* 左侧侧边栏 */}
                <Sidebar className="h-screen sticky top-0" />

                {/* 主内容区域 */}
                <main className="flex-1 p-6 lg:p-8">
                    {/* 页面头部 */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            NovelCraft 工作台
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            欢迎使用小说创作工作台，这里提供完整的创作工具链
                        </p>
                    </header>

                    {/* 统计卡片区域 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* 项目概览卡片 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                项目概览
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">进行中项目</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {projects.filter(p => p.status === 'active').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">已归档项目</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {projects.filter(p => p.status === 'archived').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">总项目数</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {projects.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 快速操作卡片 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                快速操作
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowNewProjectModal(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 
                                             dark:bg-blue-500 dark:hover:bg-blue-600 
                                             text-white py-2 px-4 rounded transition-colors"
                                >
                                    新建项目
                                </button>
                                <button
                                    onClick={() => {
                                        const activeProject = projects.find(p => p.status === 'active');
                                        if (activeProject) {
                                            projectCallbacks.onContinue?.(activeProject);
                                        } else {
                                            alert('暂无进行中的项目');
                                        }
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 
                                             dark:bg-green-500 dark:hover:bg-green-600 
                                             text-white py-2 px-4 rounded transition-colors"
                                >
                                    继续创作
                                </button>
                                <button
                                    onClick={() => console.log('管理角色')}
                                    className="w-full bg-purple-600 hover:bg-purple-700 
                                             dark:bg-purple-500 dark:hover:bg-purple-600 
                                             text-white py-2 px-4 rounded transition-colors"
                                >
                                    管理角色
                                </button>
                            </div>
                        </div>

                        {/* 最近活动卡片 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                最近活动
                            </h2>
                            <div className="space-y-3">
                                {projects.length > 0 ? (
                                    <>
                                        {getRecentProjects().map((project) => (
                                            <div key={project.id} className="border-l-4 border-blue-500 pl-3">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    创建了项目 “{project.title}”
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(project.created_at).toLocaleDateString('zh-CN')}
                                                </p>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            暂无最近活动
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            创建第一个项目后这里会显示活动记录
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 项目列表区域 */}
                    <ProjectListContainer
                        title="我的项目"
                        projects={projects}
                        loading={loading}
                        error={error}
                        callbacks={projectCallbacks}
                        emptyMessage="暂无项目，点击'新建项目'开始创作"
                        onNewProject={() => setShowNewProjectModal(true)}
                        showNewButton={true}
                        className="mb-8"
                    />

                    {/* 安全提示 */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">安全访问</h3>
                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                    <p>此页面受JWT令牌保护，只有认证用户才能访问。您的会话信息已通过middleware验证。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* 新建项目模态框 */}
            <NewProjectModal
                isOpen={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
                onSubmit={handleCreateProject}
                loading={creatingProject}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                title="确认删除项目"
                message={`确定要删除项目 "${projectToDelete?.title}" 吗？此操作会将项目移至回收站，您可以在回收站中恢复。`}
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleDeleteProject}
                onCancel={() => {
                    setProjectToDelete(null);
                    setShowConfirmDialog(false);
                }}
                onClose={() => {
                    setProjectToDelete(null);
                    setShowConfirmDialog(false);
                }}
                destructive={true}
            />
        </div>
    );
}
