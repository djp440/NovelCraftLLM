
import { NextResponse } from 'next/server';
import { Models } from '@/db/models';
import { generateToken, hashPassword } from '@/auth/utils';
import { AuthResponse } from '@/auth/types';

export async function POST() {
    try {
        const demoUsername = 'demo@example.com';
        
        // 1. 查找或创建 Demo 用户
        let user = await Models.users.findByUsername(demoUsername);
        
        if (!user) {
            // 创建 Demo 用户
            const passwordHash = await hashPassword('demo123456');
            user = await Models.users.create({
                username: demoUsername,
                password_hash: passwordHash,
                auth_method: 'password',
            });
        }

        // 2. 生成真实的 JWT Token
        const token = generateToken(user.id, user.username, user.auth_method);

        // 3. 更新最后登录时间
        await Models.users.updateLastLogin(user.id);

        return NextResponse.json<AuthResponse>({
            success: true,
            message: '演示登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                auth_method: user.auth_method,
                last_login_at: user.last_login_at ? new Date(user.last_login_at).toISOString() : undefined,
            },
        });

    } catch (error) {
        console.error('演示登录失败:', error);
        return NextResponse.json<AuthResponse>({
            success: false,
            message: '演示登录服务不可用',
        }, { status: 500 });
    }
}
