/**
 * 日志工具使用示例
 * 展示如何使用logger.ts进行日志记录
 */

import logger, { createLogger, createModuleLogger, LogLevel } from './logger';

// 示例1: 使用默认日志器
console.log('=== 示例1: 使用默认日志器 ===');

// 记录不同级别的日志
logger.debug('Main', '这是一条调试信息', { userId: 123, action: 'login' });
logger.info('Main', '应用程序启动成功');
logger.warn('Main', '磁盘空间不足', { freeSpace: '1.2GB' });
logger.error('Main', '数据库连接失败', { error: 'Connection timeout' });
logger.fatal('Main', '系统崩溃，无法恢复');

console.log('\n=== 示例2: 创建模块特定的日志器 ===');

// 为不同模块创建专门的日志器
const dbLogger = createModuleLogger('Database');
const apiLogger = createModuleLogger('API');
const authLogger = createModuleLogger('Auth');

// 使用模块日志器
dbLogger.info('数据库连接已建立', { connectionId: 'conn_001' });
apiLogger.info('API请求处理完成', { endpoint: '/api/users', duration: '150ms' });
authLogger.warn('登录尝试次数过多', { ip: '192.168.1.100', attempts: 5 });
authLogger.error('认证失败', { userId: 456, reason: 'Invalid token' });

console.log('\n=== 示例3: 创建自定义配置的日志器 ===');

// 创建自定义配置的日志器
const customLogger = createLogger({
    level: LogLevel.DEBUG, // 只记录DEBUG及以上级别的日志
    console: true,         // 启用控制台输出
    file: true,            // 启用文件输出
    logDir: './logs',      // 日志目录
    filePrefix: 'app',     // 文件前缀
    maxFileSize: 5 * 1024 * 1024, // 5MB
    retentionDays: 7,      // 保留7天日志
});

// 使用自定义日志器
customLogger.info('CustomLogger', '自定义日志器已创建');
customLogger.debug('CustomLogger', '详细调试信息', { config: customLogger });

console.log('\n=== 示例4: 实际应用场景示例 ===');

// 模拟一个用户服务
class UserService {
    private logger = createModuleLogger('UserService');

    async getUser(userId: number) {
        this.logger.info('开始获取用户信息', { userId });

        try {
            // 模拟数据库操作
            if (userId <= 0) {
                throw new Error('无效的用户ID');
            }

            // 模拟异步操作
            await new Promise(resolve => setTimeout(resolve, 100));

            const user = { id: userId, name: `用户${userId}`, email: `user${userId}@example.com` };

            this.logger.info('用户信息获取成功', { userId, userName: user.name });
            return user;
        } catch (error: any) {
            this.logger.error('获取用户信息失败', {
                userId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async updateUser(userId: number, data: any) {
        this.logger.info('开始更新用户信息', { userId, updateData: data });

        try {
            // 验证数据
            if (!data.name || data.name.length < 2) {
                this.logger.warn('用户名过短', { userId, name: data.name });
                throw new Error('用户名必须至少2个字符');
            }

            // 模拟更新操作
            await new Promise(resolve => setTimeout(resolve, 200));

            this.logger.info('用户信息更新成功', { userId });
            return { success: true, userId };
        } catch (error: any) {
            this.logger.error('更新用户信息失败', {
                userId,
                error: error.message
            });
            throw error;
        }
    }
}

// 使用用户服务
async function demoUserService() {
    const userService = new UserService();

    try {
        // 成功案例
        const user1 = await userService.getUser(1);
        console.log('获取用户成功:', user1);

        // 更新用户
        await userService.updateUser(1, { name: '张三', email: 'zhangsan@example.com' });

        // 错误案例 - 无效用户ID
        try {
            await userService.getUser(-1);
        } catch (error: any) {
            console.log('预期中的错误:', error.message);
        }

        // 错误案例 - 无效数据
        try {
            await userService.updateUser(1, { name: 'A' });
        } catch (error: any) {
            console.log('预期中的错误:', error.message);
        }
    } catch (error) {
        console.error('未预期的错误:', error);
    }
}

// 运行示例
demoUserService().then(() => {
    console.log('\n=== 示例运行完成 ===');
    console.log('请检查 logs/ 目录查看生成的日志文件');
    console.log('日志文件名格式: YYYY-MM-DD_HH-MM-SS.log');
});

console.log('\n=== 日志配置说明 ===');
console.log('1. 默认日志级别: INFO');
console.log('2. 日志文件存储在: logs/ 目录');
console.log('3. 文件名格式: YYYY-MM-DD_HH-MM-SS.log');
console.log('4. 支持控制台彩色输出');
console.log('5. 自动清理30天前的旧日志');
console.log('6. 单个日志文件最大10MB');