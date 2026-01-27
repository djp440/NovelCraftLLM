/**
 * 确认对话框组件
 * 用于二次确认重要操作，如删除项目
 */

'use client';

import React from 'react';
import { ConfirmDialogConfig } from './types';

interface ConfirmDialogProps extends ConfirmDialogConfig {
    isOpen: boolean;
    onClose: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = '确认',
    cancelText = '取消',
    onConfirm,
    onCancel,
    onClose,
    destructive = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    return (
        <>
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={handleCancel}
            />

            {/* 对话框 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                               max-w-md w-full transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 对话框头部 */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            {destructive ? (
                                <div className="flex-shrink-0 mr-3">
                                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                        <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-shrink-0 mr-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <span className="text-blue-600 dark:text-blue-400 text-xl">❓</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* 对话框内容 */}
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            {message}
                        </p>
                    </div>

                    {/* 对话框底部 - 操作按钮 */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 
                                    rounded-b-lg flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 
                                     dark:text-gray-300 bg-white dark:bg-gray-700 
                                     border border-gray-300 dark:border-gray-600 
                                     rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                                     transition-colors focus:outline-none focus:ring-2 
                                     focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={`
                                px-4 py-2 text-sm font-medium text-white rounded-md 
                                transition-colors focus:outline-none focus:ring-2 
                                focus:ring-offset-2 focus:ring-blue-500
                                ${destructive
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }
                            `}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * 使用ConfirmDialog的Hook
 */
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [config, setConfig] = React.useState<ConfirmDialogConfig>({
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const show = (config: ConfirmDialogConfig) => {
        setConfig(config);
        setIsOpen(true);
    };

    const hide = () => {
        setIsOpen(false);
    };

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            isOpen={isOpen}
            title={config.title}
            message={config.message}
            confirmText={config.confirmText}
            cancelText={config.cancelText}
            onConfirm={config.onConfirm}
            onCancel={config.onCancel}
            onClose={hide}
            destructive={config.destructive}
        />
    );

    return {
        show,
        hide,
        ConfirmDialog: ConfirmDialogComponent,
    };
}