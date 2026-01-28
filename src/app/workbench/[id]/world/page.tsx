'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWorldBook, upsertWorldBook } from '../../utils/api';

export default function WorldBookPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id) : null;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [content, setContent] = useState('');
    const [outlineJson, setOutlineJson] = useState('');

    useEffect(() => {
        if (id) {
            loadWorldBook(id);
        }
    }, [id]);

    const loadWorldBook = async (projectId: number) => {
        try {
            setLoading(true);
            const data = await getWorldBook(projectId);
            if (data) {
                setContent(data.content);
                setOutlineJson(data.outline ? JSON.stringify(data.outline, null, 2) : '');
            }
        } catch (error) {
            console.error('Failed to load world book:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!id) return;

        let outline = null;
        if (outlineJson.trim()) {
            try {
                outline = JSON.parse(outlineJson);
            } catch {
                alert('大纲配置必须是有效的 JSON 格式');
                return;
            }
        }

        try {
            setSaving(true);
            const result = await upsertWorldBook(id, {
                content,
                outline
            });
            void result;
            alert('保存成功');
        } catch (error) {
            const message = error instanceof Error ? error.message : '未知错误';
            console.error('保存失败:', error);
            alert(`保存失败: ${message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">加载中...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">世界书设定</h1>
                    <p className="text-sm text-gray-500 mt-1">构建小说的世界观与底层设定</p>
                </div>
                <div className="space-x-3">
                    <button
                        onClick={() => router.push(`/workbench/${id}`)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        返回详情
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${saving ? 'opacity-50' : ''}`}
                    >
                        {saving ? '保存中...' : '保存设定'}
                    </button>
                </div>
            </header>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                        世界观详情
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        在这里详细描述你的世界背景、力量体系、地理环境等。
                    </p>
                    <textarea
                        rows={15}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="很久很久以前..."
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                        结构化大纲 (JSON)
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        高级选项：使用 JSON 格式存储结构化数据。
                    </p>
                    <textarea
                        rows={8}
                        value={outlineJson}
                        onChange={(e) => setOutlineJson(e.target.value)}
                        className="w-full px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="{
  &quot;eras&quot;: [],
  &quot;factions&quot;: []
}"
                    />
                </div>
            </div>
        </div>
    );
}
