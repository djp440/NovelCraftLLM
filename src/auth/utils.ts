/**
 * 认证工具函数
 */

import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './types';

// 环境变量配置
const JWT_SECRET = process.env.JWT_SECRET || 'novelcraft-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

/**
 * 生成密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
}

/**
 * 生成JWT令牌
 */
export function generateToken(userId: number, username: string, authMethod: string): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId,
        username,
        authMethod,
    };

    return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
        expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        console.error('JWT验证失败:', error);
        return null;
    }
}

/**
 * 验证用户名格式（邮箱格式）
 */
export function validateUsername(username: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(username);
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
    valid: boolean;
    message: string;
} {
    // 检查长度
    if (password.length < 8) {
        return { valid: false, message: '密码长度至少8位' };
    }

    // 检查大写字母
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: '密码必须包含至少一个大写字母' };
    }

    // 检查小写字母
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: '密码必须包含至少一个小写字母' };
    }

    // 检查数字
    if (!/\d/.test(password)) {
        return { valid: false, message: '密码必须包含至少一个数字' };
    }

    // 检查特殊字符（可选但推荐）
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: '密码必须包含至少一个特殊字符（如!@#$%等）' };
    }

    // 检查常见弱密码
    const weakPasswords = [
        'password', '12345678', 'qwertyui', 'admin123', 'letmein',
        'welcome', 'monkey', 'dragon', 'sunshine', 'iloveyou'
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
        return { valid: false, message: '密码过于简单，请使用更复杂的密码' };
    }

    // 检查是否包含用户名（在注册API中会额外检查）
    // 检查连续字符或重复字符
    if (/(.)\1{2,}/.test(password)) {
        return { valid: false, message: '密码包含过多重复字符' };
    }

    // 检查常见模式
    if (/12345|abcde|qwerty|asdfgh/.test(password.toLowerCase())) {
        return { valid: false, message: '密码包含常见易猜模式' };
    }

    return { valid: true, message: '密码强度符合要求' };
}

/**
 * 简单的防暴力破解速率限制
 */
export class RateLimiter {
    private attempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();
    private readonly MAX_ATTEMPTS = 5;
    private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15分钟
    private readonly ATTEMPT_WINDOW = 5 * 60 * 1000; // 5分钟

    /**
     * 检查是否被限制
     */
    isLimited(identifier: string): { limited: boolean; remainingTime?: number } {
        const record = this.attempts.get(identifier);
        if (!record) {
            return { limited: false };
        }

        // 检查是否在封锁期内
        if (record.blockedUntil && Date.now() < record.blockedUntil) {
            return {
                limited: true,
                remainingTime: Math.ceil((record.blockedUntil - Date.now()) / 1000),
            };
        }

        // 检查是否超过时间窗口
        if (Date.now() - record.lastAttempt > this.ATTEMPT_WINDOW) {
            this.attempts.delete(identifier);
            return { limited: false };
        }

        // 检查尝试次数
        if (record.count >= this.MAX_ATTEMPTS) {
            // 超过最大尝试次数，封锁
            if (!record.blockedUntil) {
                record.blockedUntil = Date.now() + this.BLOCK_DURATION;
                this.attempts.set(identifier, record);
            }
            return {
                limited: true,
                remainingTime: Math.ceil((record.blockedUntil! - Date.now()) / 1000),
            };
        }

        return { limited: false };
    }

    /**
     * 记录一次尝试
     */
    recordAttempt(identifier: string): void {
        const record = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };

        // 如果超过时间窗口，重置计数
        if (Date.now() - record.lastAttempt > this.ATTEMPT_WINDOW) {
            record.count = 1;
        } else {
            record.count++;
        }

        record.lastAttempt = Date.now();
        this.attempts.set(identifier, record);
    }

    /**
     * 重置尝试记录
     */
    resetAttempts(identifier: string): void {
        this.attempts.delete(identifier);
    }
}

// 全局速率限制器实例
export const rateLimiter = new RateLimiter();