/**
 * 工作台组件导出文件
 * 统一导出所有工作台相关组件
 */

// 类型定义
export type {
    Project,
    NewProjectData,
    ApiResponse,
    ProjectCardCallbacks,
    SidebarMenuItem,
    ConfirmDialogConfig,
    ProjectStatus
} from './types';

// 组件导出
export { default as Sidebar, useSidebar } from './Sidebar';
export { default as ProjectCard } from './ProjectCard';
export { default as ProjectList, ProjectListContainer } from './ProjectList';
export { default as NewProjectModal, useNewProjectModal } from './NewProjectModal';
export { default as ConfirmDialog, useConfirmDialog } from './ConfirmDialog';

// 工具函数导出
export { fetchProjects, createProject, deleteProject, updateProject } from '../utils/api';