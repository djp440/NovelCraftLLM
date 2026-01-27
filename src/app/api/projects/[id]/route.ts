
import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { getAuthUser } from '@/app/api/auth-helper';

// 响应类型定义
interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

/**
 * GET /api/projects/:id
 * 获取单个项目详情
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthUser(request);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '未授权访问',
                    error: '用户未认证或令牌无效',
                },
                { status: 401 }
            );
        }
        const userId = user.userId;

        const { id } = await params;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '获取项目失败',
                    error: '项目ID格式无效',
                },
                { status: 400 }
            );
        }

        const project = await Models.projects.findById(projectId);

        if (!project) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '项目不存在',
                    error: '项目不存在或已被删除',
                },
                { status: 404 }
            );
        }

        if (project.user_id !== userId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '未授权访问',
                    error: '无权访问此项目',
                },
                { status: 403 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            message: '获取项目成功',
            data: project,
        });

    } catch (error) {
        console.error('获取项目详情失败:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: '获取项目详情失败',
                error: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/projects/:id
 * 更新项目信息
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthUser(request);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '未授权访问',
                    error: '用户未认证或令牌无效',
                },
                { status: 401 }
            );
        }
        const userId = user.userId;

        const { id } = await params;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '更新项目失败',
                    error: '项目ID格式无效',
                },
                { status: 400 }
            );
        }

        // 验证权限
        const existingProject = await Models.projects.findById(projectId);
        if (!existingProject) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '项目不存在',
                    error: '项目不存在或已被删除',
                },
                { status: 404 }
            );
        }

        if (existingProject.user_id !== userId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '未授权访问',
                    error: '无权修改此项目',
                },
                { status: 403 }
            );
        }

        // 解析请求体
        const body = await request.json();
        const { title, description, status, cover_image } = body;

        // 验证数据
        if (title && (typeof title !== 'string' || title.trim().length === 0)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '更新项目失败',
                    error: '项目标题不能为空',
                },
                { status: 400 }
            );
        }

        if (title && title.trim().length > 100) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '更新项目失败',
                    error: '项目标题不能超过100个字符',
                },
                { status: 400 }
            );
        }

        if (description && description.length > 500) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '更新项目失败',
                    error: '项目描述不能超过500个字符',
                },
                { status: 400 }
            );
        }

        if (status && !['active', 'archived'].includes(status)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '更新项目失败',
                    error: '项目状态必须是 active 或 archived',
                },
                { status: 400 }
            );
        }

        // 更新项目
        const updateData: any = {};
        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (cover_image !== undefined) updateData.cover_image = cover_image?.trim() || null;
        if (status) updateData.status = status;

        const updatedProject = await Models.projects.update(projectId, updateData);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: '项目更新成功',
            data: updatedProject,
        });

    } catch (error) {
        console.error('更新项目失败:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: '更新项目失败',
                error: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/projects/:id
 * 软删除项目
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getAuthUser(request);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '未授权访问',
                    error: '用户未认证或令牌无效',
                },
                { status: 401 }
            );
        }
        const userId = user.userId;

        const { id } = await params;
        const projectId = parseInt(id, 10);
        if (isNaN(projectId)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '删除项目失败',
                    error: '项目ID格式无效',
                },
                { status: 400 }
            );
        }

        // 验证项目是否存在且属于当前用户
        const project = await Models.projects.findById(projectId);
        if (!project) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '删除项目失败',
                    error: '项目不存在或已被删除',
                },
                { status: 404 }
            );
        }

        if (project.user_id !== userId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '删除项目失败',
                    error: '无权删除此项目',
                },
                { status: 403 }
            );
        }

        // 执行软删除
        await Models.projects.softDelete(projectId);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: '项目删除成功',
            data: {
                id: projectId,
                deleted_at: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('删除项目失败:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: '删除项目失败',
                error: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 }
        );
    }
}
