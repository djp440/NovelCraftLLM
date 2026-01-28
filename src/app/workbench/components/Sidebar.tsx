/**
 * 可折叠侧边栏组件
 * 提供工作台导航菜单，支持深色模式
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuItem } from './types';

// 默认菜单项
const defaultMenuItems: SidebarMenuItem[] = [
    {
        id: 'workbench',
        label: '工作台',
        href: '/workbench',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: 'settings',
        label: '设置',
        href: '/settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

interface SidebarProps {
    menuItems?: SidebarMenuItem[];
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
}

export default function Sidebar({
    menuItems = defaultMenuItems,
    collapsed: externalCollapsed,
    onToggleCollapse,
    className = '',
}: SidebarProps) {
    const pathname = usePathname();
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    // 使用外部控制或内部状态
    const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
    const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

    // 更新菜单项的激活状态
    const updatedMenuItems = menuItems.map(item => ({
        ...item,
        active: pathname === item.href || pathname.startsWith(item.href + '/'),
    }));

    return (
        <aside
            className={`
                flex flex-col h-full bg-white dark:bg-gray-800 
                border-r border-gray-200 dark:border-gray-700
                transition-all duration-300 ${className}
                ${collapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* 侧边栏头部 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
                                <span className="text-white font-bold">N</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                NovelCraft
                            </h2>
                        </div>
                    )}

                    {collapsed && (
                        <div className="mx-auto">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold">N</span>
                            </div>
                        </div>
                    )}

                    {/* 折叠/展开按钮 */}
                    <button
                        onClick={toggleCollapse}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-700 
                                 dark:text-gray-400 dark:hover:text-gray-200 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 
                                 transition-colors focus:outline-none"
                        aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
                    >
                        {collapsed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {updatedMenuItems.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={item.href}
                                className={`
                                    flex items-center px-3 py-2 rounded-lg 
                                    transition-colors group
                                    ${item.active
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                            >
                                <span className={`
                                    flex-shrink-0 ${item.active
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                    }
                                `}>
                                    {item.icon}
                                </span>

                                {!collapsed && (
                                    <span className="ml-3 font-medium">
                                        {item.label}
                                    </span>
                                )}

                                {item.active && !collapsed && (
                                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* 分隔线 */}
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

                {/* 用户信息（折叠时隐藏） */}
                {!collapsed && (
                    <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-medium">U</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    用户
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    已登录
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* 侧边栏底部 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {!collapsed ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p>© 2024 NovelCraft</p>
                        <p className="mt-1">小说创作平台</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">©</span>
                    </div>
                )}
            </div>
        </aside>
    );
}

/**
 * 使用Sidebar的Hook
 */
export function useSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const toggle = () => setCollapsed(!collapsed);
    const expand = () => setCollapsed(false);
    const collapse = () => setCollapsed(true);

    return {
        collapsed,
        toggle,
        expand,
        collapse,
    };
}
