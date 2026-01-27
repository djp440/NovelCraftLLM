'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Character, NewCharacterData } from '../../components/types';
import { getCharacters, createCharacter, updateCharacter, deleteCharacter } from '../../utils/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CharactersPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === 'string' ? parseInt(params.id) : null;

    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingChar, setEditingChar] = useState<Character | null>(null);
    const [formData, setFormData] = useState<NewCharacterData>({
        name: '',
        description: '',
        alias: '',
        avatar_url: '',
        tags: []
    });
    const [tagsInput, setTagsInput] = useState('');

    // Delete Confirmation State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            loadCharacters(id);
        }
    }, [id]);

    const loadCharacters = async (projectId: number) => {
        try {
            setLoading(true);
            const data = await getCharacters(projectId);
            setCharacters(data);
        } catch (error) {
            console.error('Failed to load characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const tags = tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean);
        const dataToSubmit = { ...formData, tags };

        try {
            if (editingChar) {
                await updateCharacter(id, editingChar.id, dataToSubmit);
            } else {
                await createCharacter(id, dataToSubmit);
            }
            setShowModal(false);
            resetForm();
            loadCharacters(id);
        } catch (error: any) {
            console.error('Operation failed:', error);
            alert(`操作失败: ${error.message}`);
        }
    };

    const handleDeleteClick = (charId: number) => {
        setItemToDelete(charId);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!id || !itemToDelete) return;
        try {
            await deleteCharacter(id, itemToDelete);
            loadCharacters(id);
        } catch (error: any) {
            console.error('Delete failed:', error);
            alert(`删除失败: ${error.message}`);
        } finally {
            setShowDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    const openCreateModal = () => {
        setEditingChar(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (char: Character) => {
        setEditingChar(char);
        setFormData({
            name: char.name,
            description: char.description || '',
            alias: char.alias || '',
            avatar_url: char.avatar_url || '',
            tags: char.tags || []
        });
        setTagsInput((char.tags || []).join(', '));
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            alias: '',
            avatar_url: '',
            tags: []
        });
        setTagsInput('');
    };

    if (loading) return <div className="p-8 text-center">加载中...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">角色管理</h1>
                    <p className="text-sm text-gray-500 mt-1">管理小说中的登场角色</p>
                </div>
                <div className="space-x-3">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        新建角色
                    </button>
                    <button
                        onClick={() => router.push(`/workbench/${id}`)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        返回详情
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map(char => (
                    <div key={char.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl overflow-hidden">
                                        {char.avatar_url ? (
                                            <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{char.name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{char.name}</h3>
                                        {char.alias && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">别名: {char.alias}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                                    {char.description || '暂无描述'}
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {char.tags?.map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => openEditModal(char)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                编辑
                            </button>
                            <button
                                onClick={() => handleDeleteClick(char.id)}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {characters.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    暂无角色，点击右上角新建
                </div>
            )}

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                            {editingChar ? '编辑角色' : '新建角色'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    姓名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    别名
                                </label>
                                <input
                                    type="text"
                                    value={formData.alias || ''}
                                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    头像 URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.avatar_url || ''}
                                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="http://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    标签 (用逗号分隔)
                                </label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="主角, 战士, 腹黑"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    描述
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="确认删除"
                message="确定要删除这个角色吗？此操作不可撤销。"
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleConfirmDelete}
                onClose={() => setShowDeleteDialog(false)}
                destructive={true}
            />
        </div>
    );
}
