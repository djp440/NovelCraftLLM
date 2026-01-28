'use client';

import React from 'react';
import { InputDialogConfig } from './types';

interface InputDialogProps extends InputDialogConfig {
    isOpen: boolean;
    onClose: () => void;
}

export default function InputDialog({
    isOpen,
    title,
    message,
    placeholder,
    initialValue,
    rows = 6,
    maxLength,
    generateText = '生成',
    cancelText = '取消',
    onGenerate,
    onCancel,
    onClose,
}: InputDialogProps) {
    const [value, setValue] = React.useState(initialValue ?? '');

    React.useEffect(() => {
        if (!isOpen) return;
        setValue(initialValue ?? '');
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    const handleGenerate = () => {
        onGenerate(value);
        onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={handleCancel}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <span className="text-purple-600 dark:text-purple-300 text-xl">✍️</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                                {message ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {message}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-3">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            rows={rows}
                            maxLength={maxLength}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                                       focus:outline-none focus:ring-2 focus:ring-blue-500
                                       dark:bg-gray-700 dark:text-white"
                            placeholder={placeholder ?? '请输入内容...'}
                        />
                        {typeof maxLength === 'number' ? (
                            <div className="flex justify-end">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {value.length}/{maxLength}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-end space-x-3">
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
                            onClick={handleGenerate}
                            className="px-4 py-2 text-sm font-medium text-white
                                     bg-blue-600 hover:bg-blue-700
                                     dark:bg-blue-500 dark:hover:bg-blue-600
                                     rounded-md transition-colors focus:outline-none
                                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {generateText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export function useInputDialog() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [config, setConfig] = React.useState<InputDialogConfig>({
        title: '',
        onGenerate: () => { },
    });

    const show = (config: InputDialogConfig) => {
        setConfig(config);
        setIsOpen(true);
    };

    const hide = () => setIsOpen(false);

    const InputDialogComponent = () => (
        <InputDialog
            isOpen={isOpen}
            onClose={hide}
            title={config.title}
            message={config.message}
            placeholder={config.placeholder}
            initialValue={config.initialValue}
            rows={config.rows}
            maxLength={config.maxLength}
            generateText={config.generateText}
            cancelText={config.cancelText}
            onGenerate={config.onGenerate}
            onCancel={config.onCancel}
        />
    );

    return {
        show,
        hide,
        InputDialog: InputDialogComponent,
    };
}

