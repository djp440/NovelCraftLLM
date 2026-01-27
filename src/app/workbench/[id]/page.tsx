'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '../components/types';
import { getProject, updateProject } from '../utils/api';

export default function ProjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id) : null;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cover_image: '',
    });

    useEffect(() => {
        if (id) {
            loadProject(id);
        }
    }, [id]);

    const loadProject = async (projectId: number) => {
        try {
            setLoading(true);
            const data = await getProject(projectId);
            setProject(data);
            setFormData({
                title: data.title,
                description: data.description || '',
                cover_image: data.cover_image || '',
            });
        } catch (error) {
            console.error('Failed to load project:', error);
            // alert('加载项目失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setSaving(true);
            const updated = await updateProject(id, {
                title: formData.title,
                description: formData.description,
                cover_image: formData.cover_image,
            });
            setProject(updated);
            alert('保存成功');
        } catch (error) {
            console.error('Failed to update project:', error);
            alert('保存失败');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">加载中...</div>;
    }

    if (!project) {
        return <div className="p-8 text-center text-red-500">项目不存在或无法加载</div>;
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        项目详情
                    </h1>
                    <button
                        onClick={() => router.push('/workbench')}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        返回工作台
                    </button>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            封面图片 URL
                        </label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={formData.cover_image}
                                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                    placeholder="https://example.com/cover.jpg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    请输入图片链接。
                                </p>
                            </div>
                            {formData.cover_image && (
                                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img
                                        src={formData.cover_image}
                                        alt="封面预览"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x300?text=No+Image';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            小说标题
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            简介
                        </label>
                        <textarea
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {saving ? '保存中...' : '保存更改'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => router.push(`/workbench/${id}/chapters`)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">章节管理</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">管理分卷与章节内容</p>
                </div>
                <div
                    onClick={() => router.push(`/workbench/${id}/characters`)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">角色卡</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">管理小说角色设定</p>
                </div>
                <div
                    onClick={() => router.push(`/workbench/${id}/world`)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">世界书</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">设定世界观与大纲</p>
                </div>
            </div>
        </div>
    );
}
