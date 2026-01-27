import { NextRequest } from 'next/server';
import { verifyToken } from '@/auth/utils';

/**
 * 从请求中获取认证用户信息
 * 优先读取中间件注入的 Header，如果失败则回退到直接解析 Cookie
 */
export function getAuthUser(request: NextRequest): { userId: number } | null {
    // 1. 优先从 Header 获取 (由中间件注入)
    const userIdStr = request.headers.get('x-user-id');
    if (userIdStr) {
        return { userId: parseInt(userIdStr, 10) };
    }

    // 2. 如果 Header 缺失，尝试从 Cookie 解析 (兜底方案)
    // 注意：Bearer Token 也可以在这里处理，如果需要支持非浏览器客户端
    const token = request.cookies.get('token')?.value;
    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            return { userId: payload.userId };
        }
    }

    return null;
}
