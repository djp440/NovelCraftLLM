/**
 * 工作台组件类型定义
 */

/**
 * 项目状态类型
 */
export type ProjectStatus = 'active' | 'archived' | 'planning';

/**
 * 项目接口定义
 */
export interface Project {
    id: number;
    title: string;
    description: string | null;
    cover_image?: string | null;
    status: ProjectStatus;
    user_id: number;
    current_chapter_id: number | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * 新建项目表单数据
 */
export interface NewProjectData {
    title: string;
    description?: string;
    status?: ProjectStatus;
}

/**
 * API响应格式
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

/**
 * 项目卡片操作回调
 */
export interface ProjectCardCallbacks {
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    onContinue?: (project: Project) => void;
    onViewDetails?: (project: Project) => void;
}

/**
 * 侧边栏菜单项
 */
export interface SidebarMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    href: string;
    active?: boolean;
}

/**
 * 确认对话框配置
 */
export interface ConfirmDialogConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    destructive?: boolean;
}

export interface InputDialogConfig {
    title: string;
    message?: string;
    placeholder?: string;
    initialValue?: string;
    rows?: number;
    maxLength?: number;
    generateText?: string;
    cancelText?: string;
    onGenerate: (value: string) => void;
    onCancel?: () => void;
}

/**
 * 章节类型
 */
export type ChapterType = 'volume' | 'chapter';

export interface Chapter {
    id: number;
    project_id: number;
    title: string;
    content: string | null;
    order_index: number;
    parent_id: number | null;
    type: ChapterType;
    word_count: number;
    created_at: string;
    updated_at: string;
    children?: Chapter[]; // 用于前端展示树形结构
}

export interface NewChapterData {
    title: string;
    content?: string;
    type: ChapterType;
    parent_id?: number | null;
    order_index?: number;
}

export interface ChapterUpdateData {
    title?: string;
    content?: string;
    parent_id?: number | null;
    order_index?: number;
}

/**
 * 角色类型
 */
export interface Character {
    id: number;
    project_id: number;
    name: string;
    description: string | null;
    alias: string | null;
    avatar_url: string | null;
    tags: string[] | null; // 前端使用字符串数组，后端存储为JSON字符串
    created_at: string;
    updated_at: string;
}

export interface NewCharacterData {
    name: string;
    description?: string;
    alias?: string;
    avatar_url?: string;
    tags?: string[];
}

export interface CharacterUpdateData {
    name?: string;
    description?: string;
    alias?: string;
    avatar_url?: string;
    tags?: string[];
}

/**
 * 世界观设定
 */
export interface WorldBook {
    id: number;
    project_id: number;
    content: string;
    outline: unknown | null;
    created_at: string;
    updated_at: string;
}

export interface WorldBookData {
    content?: string;
    outline?: unknown;
}
