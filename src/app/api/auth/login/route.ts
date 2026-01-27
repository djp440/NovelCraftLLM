/**
 * 用户登录API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import {
    verifyPassword,
    generateToken,
    validateUsername,
    rateLimiter
} from '@/auth/utils';
import { LoginRequest, AuthResponse } from '@/auth/types';

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();
        const { username, password } = body;

        // 基本验证
        if (!username || !password) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名和密码不能为空',
            }, { status: 400 });
        }

        // 验证用户名格式
        if (!validateUsername(username)) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名必须是有效的邮箱格式',
            }, { status: 400 });
        }

        // 检查速率限制
        const rateLimitCheck = rateLimiter.isLimited(username);
        if (rateLimitCheck.limited) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: `登录尝试次数过多，请${rateLimitCheck.remainingTime}秒后再试`,
            }, { status: 429 });
        }

        // 查找用户
        const user = await Models.users.findByUsername(username);
        if (!user) {
            rateLimiter.recordAttempt(username);
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名或密码错误',
            }, { status: 401 });
        }

        // 验证密码
        const passwordValid = await verifyPassword(password, user.password_hash);
        if (!passwordValid) {
            rateLimiter.recordAttempt(username);
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户名或密码错误',
            }, { status: 401 });
        }

        // 重置速率限制
        rateLimiter.resetAttempts(username);

        // 更新最后登录时间
        await Models.users.updateLastLogin(user.id);

        // 生成JWT令牌
        const token = generateToken(user.id, user.username, user.auth_method);

        // 返回成功响应
        return NextResponse.json<AuthResponse>({
            success: true,
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                auth_method: user.auth_method,
                last_login_at: user.last_login_at ?? undefined,
            },
        });

    } catch (error) {
        console.error('登录API错误:', error);
        return NextResponse.json<AuthResponse>({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}