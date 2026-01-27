/**
 * 认证相关类型定义
 */

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        username: string;
        auth_method: string;
        last_login_at?: string;
    };
}

export interface JwtPayload {
    userId: number;
    username: string;
    authMethod: string;
    iat: number;
    exp: number;
}

export interface RateLimitInfo {
    attempts: number;
    lastAttempt: number;
    blockedUntil?: number;
}

export interface PasskeyCredential {
    id: string;
    publicKey: string;
    algorithm: string;
    transports?: string[];
}