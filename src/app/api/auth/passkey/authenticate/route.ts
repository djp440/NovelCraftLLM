/**
 * Passkey认证API
 * POST /api/auth/passkey/authenticate
 * 使用Passkey进行用户认证
 */

import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { PasskeyService } from '@/auth/passkey';
import { generateToken } from '@/auth/utils';
import type { AuthResponse } from '@/auth/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, credential, challenge } = body;

        // 基本验证
        if (!username || !credential || !challenge) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '缺少必要参数：username、credential、challenge',
            }, { status: 400 });
        }

        // 验证Passkey认证响应（预留接口）
        const verification = await PasskeyService.verifyAuthentication(
            username,
            credential,
            challenge
        );

        if (!verification.success || !verification.userId) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: 'Passkey认证失败',
            }, { status: 401 });
        }

        // 查找用户
        const user = await Models.users.findById(verification.userId);
        if (!user) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户不存在',
            }, { status: 404 });
        }

        // 检查用户是否使用Passkey认证
        if (user.auth_method !== 'passkey' || !user.passkey_credential) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户未启用Passkey认证',
            }, { status: 400 });
        }

        // 更新最后登录时间
        await Models.users.updateLastLogin(user.id);

        // 生成JWT令牌
        const token = generateToken(user.id, user.username, 'passkey');

        // 返回成功响应
        return NextResponse.json<AuthResponse>({
            success: true,
            message: 'Passkey登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                auth_method: 'passkey',
                last_login_at: user.last_login_at?.toISOString(),
            },
        });

    } catch (error) {
        console.error('Passkey认证API错误:', error);
        return NextResponse.json<AuthResponse>({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}

/**
 * 获取Passkey认证选项
 * GET /api/auth/passkey/authenticate
 * 为用户生成Passkey认证选项
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({
                success: false,
                message: '需要提供username参数',
            }, { status: 400 });
        }

        // 查找用户
        const user = await Models.users.findByUsername(username);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: '用户不存在',
            }, { status: 404 });
        }

        // 检查用户是否使用Passkey认证
        if (user.auth_method !== 'passkey' || !user.passkey_credential) {
            return NextResponse.json({
                success: false,
                message: '用户未启用Passkey认证',
                hasPasskey: false,
            }, { status: 400 });
        }

        // 生成Passkey认证选项（预留接口）
        const options = await PasskeyService.generateAuthenticationOptions(username);

        return NextResponse.json({
            success: true,
            message: 'Passkey认证选项已生成',
            hasPasskey: true,
            data: options,
        });

    } catch (error) {
        console.error('获取Passkey认证选项错误:', error);
        return NextResponse.json({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}