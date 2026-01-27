/**
 * Next.js Middleware - 路由保护中间件
 * 
 * 功能：
 * 1. 保护以/workbench开头的路由
 * 2. 检查Authorization头或cookie中的JWT令牌
 * 3. 验证JWT有效性
 * 4. 验证失败时重定向到/login页面
 * 5. 验证成功时允许访问受保护路由
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth/utils';
import { JwtPayload } from './auth/types';

// 需要保护的路由前缀
const PROTECTED_PREFIXES = ['/workbench', '/api'];

// 公开路由（不需要认证）
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/demo',
    '/api/auth/passkey/status',
    '/api/auth/passkey/authenticate',
];

/**
 * 从请求中提取JWT令牌
 * 支持从以下位置提取：
 * 1. Authorization头: Bearer <token>
 * 2. Cookie: token=<token>
 */
function extractTokenFromRequest(request: NextRequest): string | null {
    // 1. 从Authorization头提取
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // 移除'Bearer '前缀
    }

    // 2. 从Cookie提取
    const tokenCookie = request.cookies.get('token');
    if (tokenCookie) {
        return tokenCookie.value;
    }

    // 3. 从查询参数提取（可选，通常不推荐用于生产）
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get('token');
    if (tokenParam) {
        return tokenParam;
    }

    return null;
}

/**
 * 检查路径是否需要保护
 */
function isProtectedPath(pathname: string): boolean {
    // 检查是否为公开路由
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return false;
    }

    // 检查是否匹配受保护前缀
    return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

/**
 * 中间件主函数
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 记录中间件执行日志（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] 处理请求: ${pathname}`);
    }

    // 检查是否需要保护该路径
    if (!isProtectedPath(pathname)) {
        // 公开路由，直接放行
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Middleware] 公开路由放行: ${pathname}`);
        }
        return NextResponse.next();
    }

    // 受保护路由，需要验证JWT
    const token = extractTokenFromRequest(request);

    if (!token) {
        // 没有找到令牌，重定向到登录页面
        console.warn(`[Middleware] 访问受保护路由 ${pathname} 但未提供JWT令牌`);
        return redirectToLogin(request);
    }

    // 验证令牌
    const payload = verifyToken(token);

    if (!payload) {
        // 令牌无效或已过期
        console.warn(`[Middleware] JWT令牌验证失败: ${pathname}`);
        return redirectToLogin(request);
    }

    // 检查令牌是否即将过期（可选功能）
    if (isTokenExpiringSoon(payload)) {
        console.log(`[Middleware] JWT令牌即将过期，用户: ${payload.username}`);
        // 可以在这里添加令牌刷新逻辑
    }

    // 令牌验证成功，允许访问
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] JWT验证成功，用户: ${payload.username}, 路径: ${pathname}, 设置 x-user-id: ${payload.userId}`);
    }

    // 可以在这里添加额外的请求头或修改请求
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId.toString());
    requestHeaders.set('x-username', payload.username);
    requestHeaders.set('x-auth-method', payload.authMethod);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    return response;
}

/**
 * 重定向到登录页面
 */
function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL('/login', request.url);

    // 添加重定向来源参数，登录后可以跳转回来
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
}

/**
 * 检查令牌是否即将过期（在30分钟内过期）
 */
function isTokenExpiringSoon(payload: JwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    // 如果令牌在30分钟内过期，则认为是即将过期
    return expiresIn > 0 && expiresIn < 30 * 60;
}

/**
 * 中间件配置
 * 指定中间件应该匹配的路由
 */
export const config = {
    matcher: [
        /*
         * 匹配所有请求路径，但排除：
         * 1. _next/static (静态文件)
         * 2. _next/image (图片优化)
         * 3. favicon.ico (网站图标)
         * 4. 公开文件 (如robots.txt等)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};