/**
 * 用户注册API
 * POST /api/auth/register
 * 注意：根据需求，用户注册仅限脚本创建或初始种子数据
 * 在生产环境中应禁用此API或添加额外的验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import {
    hashPassword,
    validateUsername,
    validatePasswordStrength
} from '@/auth/utils';
import { RegisterRequest, AuthResponse } from '@/auth/types';

export async function POST(request: NextRequest) {
    try {
        // 检查环境：在生产环境中禁用注册API
        const isProduction = process.env.NODE_ENV === 'production';
        const allowRegistration = process.env.ALLOW_REGISTRATION === 'true';

        if (isProduction && !allowRegistration) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '注册功能已禁用，请联系管理员',
            }, { status: 403 });
        }

        const body: RegisterRequest = await request.json();
        const { username, password, confirmPassword } = body;

        // 基本验证
        if (!username || !password || !confirmPassword) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '所有字段都必须填写',
            }, { status: 400 });
        }

        // 验证用户名格式
        if (!validateUsername(username)) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名必须是有效的邮箱格式',
            }, { status: 400 });
        }

        // 验证密码强度
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: passwordValidation.message,
            }, { status: 400 });
        }

        // 验证密码确认
        if (password !== confirmPassword) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '两次输入的密码不一致',
            }, { status: 400 });
        }

        // 检查用户名是否已存在
        const existingUser = await Models.users.findByUsername(username);
        if (existingUser) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名已存在',
            }, { status: 409 });
        }

        // 生成密码哈希
        const passwordHash = await hashPassword(password);

        // 创建用户
        const user = await Models.users.create({
            username,
            password_hash: passwordHash,
            auth_method: 'password',
        });

        // 返回成功响应（不返回密码哈希）
        return NextResponse.json<AuthResponse>({
            success: true,
            message: '用户注册成功',
            user: {
                id: user.id,
                username: user.username,
                auth_method: user.auth_method,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('注册API错误:', error);
        return NextResponse.json<AuthResponse>({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}
