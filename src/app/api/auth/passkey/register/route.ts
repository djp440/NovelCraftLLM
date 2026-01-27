/**
 * Passkey注册API
 * POST /api/auth/passkey/register
 * 为用户注册新的Passkey凭证
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

        // 查找用户
        const user = await Models.users.findByUsername(username);
        if (!user) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '用户不存在',
            }, { status: 404 });
        }

        // 验证Passkey注册响应（预留接口）
        const verification = await PasskeyService.verifyRegistration(
            username,
            credential,
            challenge
        );

        if (!verification.success) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: 'Passkey注册验证失败',
            }, { status: 400 });
        }

        // 保存Passkey凭证（预留接口）
        // 注意：实际实现中需要将credential转换为PasskeyCredential类型
        const credentialData = {
            id: verification.credentialId || 'mock-credential-id',
            publicKey: 'mock-public-key',
            algorithm: 'RS256',
            transports: ['internal'],
        };

        const saved = await PasskeyService.saveCredential(user.id, credentialData);
        if (!saved) {
            return NextResponse.json<AuthResponse>({
                success: false,
                message: '保存Passkey凭证失败',
            }, { status: 500 });
        }

        // 更新最后登录时间
        await Models.users.updateLastLogin(user.id);

        // 生成JWT令牌
        const token = generateToken(user.id, user.username, 'passkey');

        // 返回成功响应
        return NextResponse.json<AuthResponse>({
            success: true,
            message: 'Passkey注册成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                auth_method: 'passkey',
                last_login_at: user.last_login_at?.toISOString(),
            },
        });

    } catch (error) {
        console.error('Passkey注册API错误:', error);
        return NextResponse.json<AuthResponse>({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}

/**
 * 获取Passkey注册选项
 * GET /api/auth/passkey/register
 * 为用户生成Passkey注册选项
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

        // 生成Passkey注册选项（预留接口）
        const options = await PasskeyService.generateRegistrationOptions(username);

        return NextResponse.json({
            success: true,
            message: 'Passkey注册选项已生成',
            data: options,
        });

    } catch (error) {
        console.error('获取Passkey注册选项错误:', error);
        return NextResponse.json({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}