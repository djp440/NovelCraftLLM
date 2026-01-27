/**
 * Passkey状态API
 * GET /api/auth/passkey/status
 * 检查用户Passkey状态和支持情况
 */

import { NextRequest, NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { PasskeyService, PasskeyManager } from '@/auth/passkey';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const userId = searchParams.get('userId');

        // 初始化Passkey功能
        const initialization = await PasskeyManager.initialize();

        if (!username && !userId) {
            // 返回通用支持信息
            return NextResponse.json({
                success: true,
                message: 'Passkey支持信息',
                data: {
                    supported: initialization.supported,
                    message: initialization.message,
                    devices: await PasskeyService.getSupportedDevices(),
                },
            });
        }

        // 查找用户
        let user = null;
        if (username) {
            user = await Models.users.findByUsername(username);
        } else if (userId) {
            user = await Models.users.findById(parseInt(userId, 10));
        }

        if (!user) {
            return NextResponse.json({
                success: false,
                message: '用户不存在',
            }, { status: 404 });
        }

        // 检查用户Passkey状态
        const hasPasskey = await PasskeyService.hasPasskey(user.id);
        const credential = await PasskeyService.getCredential(user.id);

        return NextResponse.json({
            success: true,
            message: 'Passkey状态查询成功',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    auth_method: user.auth_method,
                },
                passkey: {
                    enabled: hasPasskey,
                    hasCredential: !!credential,
                    credentialId: credential?.id || null,
                },
                support: {
                    browserSupported: initialization.supported,
                    message: initialization.message,
                },
            },
        });

    } catch (error) {
        console.error('Passkey状态API错误:', error);
        return NextResponse.json({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}

/**
 * 删除Passkey凭证
 * DELETE /api/auth/passkey/status
 * 删除用户的Passkey凭证
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, username } = body;

        if (!userId && !username) {
            return NextResponse.json({
                success: false,
                message: '需要提供userId或username参数',
            }, { status: 400 });
        }

        // 查找用户
        let user = null;
        if (userId) {
            user = await Models.users.findById(parseInt(userId, 10));
        } else if (username) {
            user = await Models.users.findByUsername(username);
        }

        if (!user) {
            return NextResponse.json({
                success: false,
                message: '用户不存在',
            }, { status: 404 });
        }

        // 删除Passkey凭证
        const deleted = await PasskeyService.deleteCredential(user.id);

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: '删除Passkey凭证失败',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Passkey凭证已删除',
            data: {
                userId: user.id,
                username: user.username,
                auth_method: 'password', // 已切换回密码认证
            },
        });

    } catch (error) {
        console.error('删除Passkey凭证API错误:', error);
        return NextResponse.json({
            success: false,
            message: '服务器内部错误',
        }, { status: 500 });
    }
}