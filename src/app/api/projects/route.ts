/**
 * 项目API路由
 * 提供项目的CRUD操作，所有端点都需要JWT认证
 */

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
 * GET /api/projects
 * 获取当前用户的所有项目
 */
export async function GET(request: NextRequest) {
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

        // 获取用户的所有项目
        const projects = await Models.projects.findByUserId(userId);

        // 格式化响应数据
        const formattedProjects = projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            status: project.status,
            user_id: project.user_id,
            current_chapter_id: project.current_chapter_id,
            created_at: project.created_at,
            updated_at: project.updated_at,
            // 可以在这里添加额外的计算字段，如章节数量、字数统计等
        }));

        return NextResponse.json<ApiResponse>({
            success: true,
            message: '获取项目列表成功',
            data: formattedProjects,
        });

    } catch (error) {
        console.error('获取项目列表失败:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: '获取项目列表失败',
                error: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/projects
 * 创建新项目
 */
export async function POST(request: NextRequest) {
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

        // 解析请求体
        const body = await request.json();
        const { title, description, status = 'active' } = body;

        // 验证必填字段
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '创建项目失败',
                    error: '项目标题不能为空',
                },
                { status: 400 }
            );
        }

        // 验证标题长度
        if (title.trim().length > 100) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '创建项目失败',
                    error: '项目标题不能超过100个字符',
                },
                { status: 400 }
            );
        }

        // 验证描述长度（如果提供）
        if (description && description.length > 500) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '创建项目失败',
                    error: '项目描述不能超过500个字符',
                },
                { status: 400 }
            );
        }

        // 验证状态值
        const validStatuses = ['active', 'archived'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    message: '创建项目失败',
                    error: '项目状态必须是 active 或 archived',
                },
                { status: 400 }
            );
        }

        // 创建新项目
        const newProject = await Models.projects.create({
            user_id: userId,
            title: title.trim(),
            description: description?.trim() || null,
            status,
            current_chapter_id: null,
        });

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: '项目创建成功',
                data: newProject,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('创建项目失败:', error);
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                message: '创建项目失败',
                error: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 }
        );
    }
}
