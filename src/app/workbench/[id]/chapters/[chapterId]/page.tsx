
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { ConfirmDialogConfig } from '../../../components/types';

interface Chapter {
    id: number;
    title: string;
    content: string;
    word_count: number;
    project_id: number;
    updated_at: string;
}

interface ChapterVersion {
    id: number;
    version_number: number;
    content: string;
    created_at: string;
}

export default function ChapterEditorPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const chapterId = params.chapterId as string;

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [content, setContent] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [versions, setVersions] = useState<ChapterVersion[]>([]);
    const [showVersions, setShowVersions] = useState(false);
    
    // Confirm Dialog State
    const [confirmConfig, setConfirmConfig] = useState<ConfirmDialogConfig>({
        title: '',
        message: '',
        onConfirm: () => {},
    });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Load Chapter Data
    const fetchChapter = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/chapters/${chapterId}`);
            if (!res.ok) throw new Error('Failed to load chapter');
            const data = await res.json();
            setChapter(data);
            setContent(data.content || '');
            setWordCount(data.word_count || 0);
        } catch (error) {
            console.error(error);
            alert('加载章节失败');
        }
    }, [projectId, chapterId]);

    // Load Versions
    const fetchVersions = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/chapters/${chapterId}/versions`);
            if (!res.ok) throw new Error('Failed to load versions');
            const data = await res.json();
            setVersions(data);
        } catch (error) {
            console.error(error);
        }
    }, [projectId, chapterId]);

    useEffect(() => {
        fetchChapter();
        fetchVersions();
    }, [fetchChapter, fetchVersions]);

    // Save Function
    const saveContent = useCallback(async (newContent: string, createVersion: boolean = false) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/chapters/${chapterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newContent,
                    create_version: createVersion
                }),
            });
            
            if (!res.ok) throw new Error('Save failed');
            
            const updated = await res.json();
            setLastSavedAt(new Date());
            setWordCount(updated.word_count);
            
            if (createVersion) {
                fetchVersions(); // Refresh versions list
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    }, [projectId, chapterId, fetchVersions]);

    // Auto-save Debounce
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        setWordCount(newContent.length);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Auto-save after 2 seconds of inactivity (Draft only)
        saveTimeoutRef.current = setTimeout(() => {
            saveContent(newContent, false);
        }, 2000);
    };

    // Save on Blur
    const handleBlur = () => {
        // Immediate save on blur if changed?
        // Actually the debounce might still be pending.
        // Let's force save if there's pending change?
        // Ideally we just let debounce handle it, or force call.
        // For simplicity, we rely on debounce or manual triggers mostly.
        // But user requirement says "Mouse blur... trigger save".
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveContent(content, false);
        }
    };

    // Manual "Save Version"
    const handleCreateVersion = () => {
        saveContent(content, true);
    };

    // Restore Version
    const handleRollback = (version: ChapterVersion) => {
        setConfirmConfig({
            title: '确认回滚',
            message: `确定要回滚到版本 #${version.version_number} 吗？当前未保存的内容将丢失（建议先保存一个版本）。`,
            confirmText: '回滚',
            destructive: true,
            onConfirm: async () => {
                setContent(version.content);
                setWordCount(version.content.length);
                // Immediately save the rolled back content as current draft
                await saveContent(version.content, false); 
            }
        });
        setIsConfirmOpen(true);
    };

    if (!chapter) return <div className="p-8 text-center text-gray-500">加载中...</div>;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Header */}
                <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center">
                         <button 
                            onClick={() => router.back()}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md">
                                {chapter.title}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                字数: {wordCount} · {isSaving ? '保存中...' : (lastSavedAt ? `已保存 ${lastSavedAt.toLocaleTimeString()}` : '未保存')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                         <button
                            onClick={handleCreateVersion}
                            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors flex items-center"
                            disabled={isSaving}
                        >
                            <span>💾 存为版本</span>
                        </button>
                        <button
                            onClick={() => setShowVersions(!showVersions)}
                            className={`px-4 py-2 text-sm border rounded-md shadow-sm transition-colors flex items-center ${
                                showVersions 
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                            }`}
                        >
                            <span>🕒 历史版本</span>
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 relative overflow-hidden">
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        onBlur={handleBlur}
                        className="w-full h-full p-8 resize-none focus:outline-none text-lg leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent font-serif"
                        placeholder="开始创作..."
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Version History Sidebar */}
            {showVersions && (
                <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg transition-all">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">版本历史</h2>
                        <p className="text-xs text-gray-500 mt-1">最近 10 个版本</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {versions.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">暂无历史版本</div>
                        ) : (
                            versions.map((version) => (
                                <div 
                                    key={version.id} 
                                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-700 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-blue-600 dark:text-blue-400 text-sm">
                                            v{version.version_number}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(version.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 font-serif">
                                        {version.content.substring(0, 50)}...
                                    </div>
                                    <button
                                        onClick={() => handleRollback(version)}
                                        className="w-full py-1.5 text-xs text-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                                    >
                                        回滚到此版本
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                {...confirmConfig}
            />
        </div>
    );
}
