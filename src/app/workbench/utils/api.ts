/**
 * 工作台API工具函数
 * 封装项目相关的API调用
 */

import {
    Project,
    NewProjectData,
    ApiResponse,
    Chapter,
    NewChapterData,
    ChapterUpdateData,
    Character,
    NewCharacterData,
    CharacterUpdateData,
    WorldBook,
    WorldBookData
} from '../components/types';

/**
 * 获取当前用户的所有项目
 */
export async function fetchProjects(): Promise<Project[]> {
    try {
        const response = await fetch('/api/projects', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 包含cookie
        });

        if (!response.ok) {
            throw new Error(`获取项目失败: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Project[]> = await response.json();

        if (!result.success) {
            throw new Error(result.error || '获取项目失败');
        }

        return result.data || [];
    } catch (error) {
        console.error('获取项目列表失败:', error);
        throw error;
    }
}

/**
 * 获取单个项目详情
 */
export async function getProject(projectId: number): Promise<Project> {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`获取项目详情失败: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Project> = await response.json();

        if (!result.success) {
            throw new Error(result.error || '获取项目详情失败');
        }

        return result.data!;
    } catch (error) {
        console.error('获取项目详情失败:', error);
        throw error;
    }
}

/**
 * 创建新项目
 */
export async function createProject(projectData: NewProjectData): Promise<Project> {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            throw new Error(`创建项目失败: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Project> = await response.json();

        if (!result.success) {
            throw new Error(result.error || '创建项目失败');
        }

        return result.data!;
    } catch (error) {
        console.error('创建项目失败:', error);
        throw error;
    }
}

/**
 * 删除项目（软删除）
 */
export async function deleteProject(projectId: number): Promise<void> {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`删除项目失败: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();

        if (!result.success) {
            throw new Error(result.error || '删除项目失败');
        }
    } catch (error) {
        console.error('删除项目失败:', error);
        throw error;
    }
}

/**
 * 更新项目信息
 */
export async function updateProject(projectId: number, updates: Partial<Project>): Promise<Project> {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error(`更新项目失败: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Project> = await response.json();

        if (!result.success) {
            throw new Error(result.error || '更新项目失败');
        }

        return result.data!;
    } catch (error) {
        console.error('更新项目失败:', error);
        throw error;
    }
}

// --- 章节管理 API ---

export async function getChapters(projectId: number): Promise<{ volumes: Chapter[], chapters: Chapter[] }> {
    try {
        const response = await fetch(`/api/projects/${projectId}/chapters`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`获取章节列表失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        // 如果后端返回了错误对象
        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    } catch (error) {
        console.error('获取章节列表失败:', error);
        throw error;
    }
}

export async function createChapter(projectId: number, data: NewChapterData): Promise<Chapter> {
    const response = await fetch(`/api/projects/${projectId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `创建章节失败: ${response.status}`);
    }

    return response.json();
}

export async function updateChapter(projectId: number, chapterId: number, data: ChapterUpdateData): Promise<Chapter> {
    const response = await fetch(`/api/projects/${projectId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `更新章节失败: ${response.status}`);
    }

    return response.json();
}

export async function deleteChapter(projectId: number, chapterId: number): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/chapters/${chapterId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `删除章节失败: ${response.status}`);
    }
}

// --- 角色管理 API ---

export async function getCharacters(projectId: number): Promise<Character[]> {
    const response = await fetch(`/api/projects/${projectId}/characters`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`获取角色列表失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((c: any) => ({
        ...c,
        tags: c.tags ? JSON.parse(c.tags) : []
    }));
}

export async function createCharacter(projectId: number, data: NewCharacterData): Promise<Character> {
    const response = await fetch(`/api/projects/${projectId}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `创建角色失败: ${response.status}`);
    }

    const c = await response.json();
    return {
        ...c,
        tags: c.tags ? JSON.parse(c.tags) : []
    };
}

export async function updateCharacter(projectId: number, charId: number, data: CharacterUpdateData): Promise<Character> {
    const response = await fetch(`/api/projects/${projectId}/characters/${charId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `更新角色失败: ${response.status}`);
    }

    const c = await response.json();
    return {
        ...c,
        tags: c.tags ? JSON.parse(c.tags) : []
    };
}

export async function deleteCharacter(projectId: number, charId: number): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/characters/${charId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `删除角色失败: ${response.status}`);
    }
}

// --- 世界书 API ---

export async function getWorldBook(projectId: number): Promise<WorldBook | null> {
    const response = await fetch(`/api/projects/${projectId}/world-book`, {
        method: 'GET',
        credentials: 'include',
    });

    if (response.status === 404) return null;

    if (!response.ok) {
        throw new Error(`获取世界书失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if data is valid (has id)
    if (!data || !data.id) {
        return null;
    }

    // outline is JSON string
    return {
        ...data,
        outline: data.outline ? JSON.parse(data.outline) : null
    };
}

export async function upsertWorldBook(projectId: number, data: WorldBookData): Promise<WorldBook> {
    const response = await fetch(`/api/projects/${projectId}/world-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `保存世界书失败: ${response.status}`);
    }

    const result = await response.json();
    return {
        ...result,
        outline: result.outline ? JSON.parse(result.outline) : null
    };
}
