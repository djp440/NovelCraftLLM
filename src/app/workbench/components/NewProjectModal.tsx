/**
 * 新建项目模态框组件
 * 提供创建新项目的表单界面
 */

'use client';

import React, { useState } from 'react';
import { NewProjectData } from './types';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewProjectData) => Promise<void>;
    loading?: boolean;
}

export default function NewProjectModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
}: NewProjectModalProps) {
    const [formData, setFormData] = useState<NewProjectData>({
        title: '',
        description: '',
        status: 'active',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // 验证标题
        if (!formData.title.trim()) {
            newErrors.title = '项目标题不能为空';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = '项目标题不能超过100个字符';
        }

        // 验证描述
        if (formData.description && formData.description.length > 500) {
            newErrors.description = '项目描述不能超过500个字符';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit({
                ...formData,
                title: formData.title.trim(),
                description: formData.description?.trim() || '',
            });

            // 提交成功后重置表单并关闭模态框
            setFormData({
                title: '',
                description: '',
                status: 'active',
            });
            setErrors({});
            onClose();
        } catch (error) {
            // 错误处理由父组件负责
            console.error('提交表单失败:', error);
        }
    };

    // 处理输入变化
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // 清除该字段的错误
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <>
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* 模态框 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                               max-w-md w-full transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 模态框头部 */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 mr-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 text-xl">📝</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        新建项目
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        开始创作您的新小说
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
                                         transition-colors focus:outline-none"
                            >
                                <span className="sr-only">关闭</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 表单内容 */}
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            {/* 项目标题 */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    项目标题 *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`
                                        w-full px-3 py-2 border rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                        ${errors.title
                                            ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-blue-500'
                                        }
                                    `}
                                    placeholder="请输入项目标题"
                                    disabled={loading}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.title}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    建议使用简洁明了的标题，如“星辰之旅”、“暗影之城”等
                                </p>
                            </div>

                            {/* 项目描述 */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    项目描述（可选）
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`
                                        w-full px-3 py-2 border rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                        ${errors.description
                                            ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-blue-500'
                                        }
                                    `}
                                    placeholder="简要描述您的项目内容、主题或灵感来源"
                                    disabled={loading}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.description}
                                    </p>
                                )}
                                <div className="flex justify-between mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        描述将帮助您更好地组织创作思路
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formData.description?.length || 0}/500
                                    </p>
                                </div>
                            </div>

                            {/* 项目状态 */}
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    项目状态
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                                             dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    disabled={loading}
                                >
                                    <option value="active">进行中</option>
                                    <option value="planning">规划中</option>
                                    <option value="archived">已归档</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    状态可以随时更改，不影响项目内容
                                </p>
                            </div>
                        </div>

                        {/* 模态框底部 - 操作按钮 */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 
                                        rounded-b-lg flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 
                                         dark:text-gray-300 bg-white dark:bg-gray-700 
                                         border border-gray-300 dark:border-gray-600 
                                         rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                                         transition-colors focus:outline-none focus:ring-2 
                                         focus:ring-offset-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white 
                                         bg-blue-600 hover:bg-blue-700 
                                         dark:bg-blue-500 dark:hover:bg-blue-600 
                                         rounded-md transition-colors focus:outline-none 
                                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        创建中...
                                    </span>
                                ) : (
                                    '创建项目'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/**
 * 使用NewProjectModal的Hook
 */
export function useNewProjectModal() {
    const [isOpen, setIsOpen] = useState(false);

    const show = () => setIsOpen(true);
    const hide = () => setIsOpen(false);

    const NewProjectModalComponent = ({
        onSubmit,
        loading,
    }: {
        onSubmit: (data: NewProjectData) => Promise<void>;
        loading?: boolean;
    }) => (
        <NewProjectModal
            isOpen={isOpen}
            onClose={hide}
            onSubmit={onSubmit}
            loading={loading}
        />
    );

    return {
        show,
        hide,
        NewProjectModal: NewProjectModalComponent,
    };
}
