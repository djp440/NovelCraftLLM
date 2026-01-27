'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chapter, NewChapterData, ChapterType } from '../../components/types';
import { getChapters, createChapter, updateChapter, deleteChapter } from '../../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ChaptersPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id) : null;

    const [volumes, setVolumes] = useState<Chapter[]>([]);
    const [looseChapters, setLooseChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalType, setModalType] = useState<ChapterType>('chapter'); // 'volume' or 'chapter'
    const [parentId, setParentId] = useState<number | null>(null);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [editingItem, setEditingItem] = useState<Chapter | null>(null);

    // Delete Confirmation State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            loadChapters(id);
        }
    }, [id]);

    const loadChapters = async (projectId: number) => {
        try {
            setLoading(true);
            const data = await getChapters(projectId);
            setVolumes(data.volumes || []);
            setLooseChapters(data.chapters || []);
        } catch (error) {
            console.error('Failed to load chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!id || !newItemTitle.trim()) return;

        try {
            const newData: NewChapterData = {
                title: newItemTitle,
                type: modalType,
                parent_id: parentId,
                content: '',
                order_index: 0 // Backend handles order usually, or we can calculate
            };
            await createChapter(id, newData);
            setNewItemTitle('');
            setShowCreateModal(false);
            loadChapters(id);
        } catch (error: any) {
            console.error('Failed to create:', error);
            alert(`创建失败: ${error.message}`);
        }
    };

    const handleUpdate = async () => {
        if (!id || !editingItem || !newItemTitle.trim()) return;

        try {
            await updateChapter(id, editingItem.id, {
                title: newItemTitle
            });
            setEditingItem(null);
            setNewItemTitle('');
            loadChapters(id);
        } catch (error: any) {
            console.error('Failed to update:', error);
            alert(`更新失败: ${error.message}`);
        }
    };

    const handleDeleteClick = (chapterId: number) => {
        setItemToDelete(chapterId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!id || !itemToDelete) return;

        try {
            await deleteChapter(id, itemToDelete);
            loadChapters(id);
        } catch (error: any) {
            console.error('Failed to delete:', error);
            alert(`删除失败: ${error.message}`);
        } finally {
            setShowDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    const openCreateModal = (type: ChapterType, pId: number | null = null) => {
        setModalType(type);
        setParentId(pId);
        setNewItemTitle('');
        setEditingItem(null);
        setShowCreateModal(true);
    };

    const openEditModal = (item: Chapter) => {
        setEditingItem(item);
        setNewItemTitle(item.title);
        setShowCreateModal(true); // Reusing the same modal UI roughly
    };

    if (loading) return <div className="p-8 text-center">加载中...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">章节管理</h1>
                    <p className="text-sm text-gray-500 mt-1">管理小说分卷与章节结构</p>
                </div>
                <div className="space-x-3">
                    <button
                        onClick={() => openCreateModal('volume')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        新建分卷
                    </button>
                    <button
                        onClick={() => openCreateModal('chapter')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        新建章节 (未分类)
                    </button>
                    <button
                        onClick={() => router.push(`/workbench/${id}`)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        返回详情
                    </button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Volumes List */}
                {volumes.map(volume => (
                    <div key={volume.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {volume.title}
                            </h3>
                            <div className="space-x-2 text-sm">
                                <button
                                    onClick={() => openCreateModal('chapter', volume.id)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                >
                                    + 添加章节
                                </button>
                                <button
                                    onClick={() => openEditModal(volume)}
                                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                >
                                    重命名
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(volume.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                        <div className="p-0">
                            {volume.children && volume.children.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {volume.children.map(chapter => (
                                        <li key={chapter.id} className="group p-4 pl-8 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div className="flex items-center">
                                                <span className="text-gray-400 mr-3">📄</span>
                                                <span className="text-gray-700 dark:text-gray-200">{chapter.title}</span>
                                                <span className="ml-4 text-xs text-gray-400">{chapter.word_count} 字</span>
                                            </div>
                                            <div className="space-x-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/workbench/${id}/chapters/${chapter.id}`)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                >
                                                    编辑内容
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(chapter)}
                                                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                                >
                                                    重命名
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(chapter.id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-sm text-gray-400 text-center">
                                    暂无章节
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loose Chapters */}
                {looseChapters.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">未分卷章节</h3>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {looseChapters.map(chapter => (
                                <li key={chapter.id} className="group p-4 pl-8 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mr-3">📄</span>
                                        <span className="text-gray-700 dark:text-gray-200">{chapter.title}</span>
                                        <span className="ml-4 text-xs text-gray-400">{chapter.word_count} 字</span>
                                    </div>
                                    <div className="space-x-2 text-sm">
                                        <button
                                            onClick={() => router.push(`/workbench/${id}/chapters/${chapter.id}`)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                        >
                                            编辑内容
                                        </button>
                                        <button
                                            onClick={() => openEditModal(chapter)}
                                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                        >
                                            重命名
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(chapter.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                            {editingItem ? '编辑' : '新建'}
                            {modalType === 'volume' ? '分卷' : '章节'}
                        </h3>
                        <input
                            type="text"
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            placeholder="请输入标题"
                            className="w-full px-3 py-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                取消
                            </button>
                            <button
                                onClick={editingItem ? handleUpdate : handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="确认删除"
                message="确定要删除这个章节/分卷吗？如果是分卷，其下的所有章节也会被删除。此操作不可撤销。"
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleConfirmDelete}
                onClose={() => setShowDeleteDialog(false)}
                destructive={true}
            />
        </div>
    );
}
