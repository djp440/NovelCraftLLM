/**
 * 日志工具模块
 * 提供统一的日志记录功能，支持控制台和文件输出
 * 日志文件名格式：YYYY-MM-DD_HH-MM-SS.log
 */

import fs from 'fs';
import path from 'path';

// 日志级别枚举
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

// 日志级别数值映射（用于比较）
const LogLevelValue: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.FATAL]: 4,
};

// 日志配置接口
export interface LoggerConfig {
    // 日志级别，低于此级别的日志不会被记录
    level: LogLevel;
    // 是否启用控制台输出
    console: boolean;
    // 是否启用文件输出
    file: boolean;
    // 日志文件目录
    logDir: string;
    // 日志文件前缀
    filePrefix: string;
    // 最大文件大小（字节），超过此大小会创建新文件
    maxFileSize: number;
    // 保留日志文件天数
    retentionDays: number;
}

// 默认配置
const DEFAULT_CONFIG: LoggerConfig = {
    level: LogLevel.INFO,
    console: true,
    file: true,
    logDir: path.join(process.cwd(), 'logs'),
    filePrefix: '',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    retentionDays: 30,
};

// 日志条目接口
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    data?: any;
}

/**
 * 日志工具类
 */
export class Logger {
    private config: LoggerConfig;
    private currentLogFile: string | null = null;
    private currentFileSize: number = 0;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.ensureLogDirectory();
        this.cleanOldLogs();
    }

    /**
     * 确保日志目录存在
     */
    private ensureLogDirectory(): void {
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
    }

    /**
     * 清理旧日志文件
     */
    private cleanOldLogs(): void {
        if (!this.config.file) return;

        try {
            const files = fs.readdirSync(this.config.logDir);
            const now = Date.now();
            const retentionTime = this.config.retentionDays * 24 * 60 * 60 * 1000;

            files.forEach((file) => {
                if (file.endsWith('.log')) {
                    const filePath = path.join(this.config.logDir, file);
                    const stats = fs.statSync(filePath);
                    const fileAge = now - stats.mtimeMs;

                    if (fileAge > retentionTime) {
                        fs.unlinkSync(filePath);
                        console.log(`[Logger] 清理旧日志文件: ${file}`);
                    }
                }
            });
        } catch (error) {
            console.error('[Logger] 清理旧日志失败:', error);
        }
    }

    /**
     * 获取当前日志文件名
     */
    private getCurrentLogFileName(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

        let prefix = this.config.filePrefix;
        if (prefix && !prefix.endsWith('_')) {
            prefix += '_';
        }

        return `${prefix}${dateStr}_${timeStr}.log`;
    }

    /**
     * 获取当前日志文件路径
     */
    private getCurrentLogFilePath(): string {
        if (!this.currentLogFile) {
            this.currentLogFile = this.getCurrentLogFileName();
        }
        return path.join(this.config.logDir, this.currentLogFile);
    }

    /**
     * 检查是否需要创建新日志文件
     */
    private shouldCreateNewFile(): boolean {
        if (!this.currentLogFile) return true;

        const currentFileName = this.getCurrentLogFileName();
        if (currentFileName !== this.currentLogFile) {
            return true; // 时间变化，需要新文件
        }

        if (this.currentFileSize >= this.config.maxFileSize) {
            return true; // 文件大小超过限制，需要新文件
        }

        return false;
    }

    /**
     * 写入日志到文件
     */
    private writeToFile(entry: LogEntry): void {
        if (!this.config.file) return;

        try {
            // 检查是否需要创建新文件
            if (this.shouldCreateNewFile()) {
                this.currentLogFile = this.getCurrentLogFileName();
                this.currentFileSize = 0;
            }

            const filePath = this.getCurrentLogFilePath();
            const logLine = this.formatLogEntry(entry) + '\n';

            fs.appendFileSync(filePath, logLine, 'utf8');
            this.currentFileSize += Buffer.byteLength(logLine, 'utf8');
        } catch (error) {
            console.error('[Logger] 写入日志文件失败:', error);
        }
    }

    /**
     * 格式化日志条目
     */
    private formatLogEntry(entry: LogEntry): string {
        const { timestamp, level, module, message, data } = entry;

        let logLine = `[${timestamp}] [${level}] [${module}] - ${message}`;

        if (data) {
            try {
                const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
                logLine += ` | ${dataStr}`;
            } catch (error) {
                logLine += ` | [无法序列化的数据]`;
            }
        }

        return logLine;
    }

    /**
     * 输出到控制台
     */
    private writeToConsole(entry: LogEntry): void {
        if (!this.config.console) return;

        const { timestamp, level, module, message, data } = entry;

        // 根据日志级别使用不同的颜色
        let colorCode = '\x1b[0m'; // 默认白色
        switch (level) {
            case LogLevel.DEBUG:
                colorCode = '\x1b[36m'; // 青色
                break;
            case LogLevel.INFO:
                colorCode = '\x1b[32m'; // 绿色
                break;
            case LogLevel.WARN:
                colorCode = '\x1b[33m'; // 黄色
                break;
            case LogLevel.ERROR:
                colorCode = '\x1b[31m'; // 红色
                break;
            case LogLevel.FATAL:
                colorCode = '\x1b[35m'; // 紫色
                break;
        }

        const resetCode = '\x1b[0m';
        const logLine = `${colorCode}[${timestamp}] [${level}] [${module}] - ${message}${resetCode}`;

        console.log(logLine);

        if (data) {
            console.log(`${colorCode}  数据:${resetCode}`, data);
        }
    }

    /**
     * 记录日志
     */
    private log(level: LogLevel, module: string, message: string, data?: any): void {
        // 检查日志级别
        if (LogLevelValue[level] < LogLevelValue[this.config.level]) {
            return;
        }

        const timestamp = new Date().toISOString();
        const entry: LogEntry = { timestamp, level, module, message, data };

        // 输出到控制台
        this.writeToConsole(entry);

        // 输出到文件
        this.writeToFile(entry);
    }

    /**
     * 记录DEBUG级别日志
     */
    debug(module: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, module, message, data);
    }

    /**
     * 记录INFO级别日志
     */
    info(module: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, module, message, data);
    }

    /**
     * 记录WARN级别日志
     */
    warn(module: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, module, message, data);
    }

    /**
     * 记录ERROR级别日志
     */
    error(module: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, module, message, data);
    }

    /**
     * 记录FATAL级别日志
     */
    fatal(module: string, message: string, data?: any): void {
        this.log(LogLevel.FATAL, module, message, data);
    }

    /**
     * 创建模块特定的日志器
     */
    createModuleLogger(module: string) {
        return {
            debug: (message: string, data?: any) => this.debug(module, message, data),
            info: (message: string, data?: any) => this.info(module, message, data),
            warn: (message: string, data?: any) => this.warn(module, message, data),
            error: (message: string, data?: any) => this.error(module, message, data),
            fatal: (message: string, data?: any) => this.fatal(module, message, data),
        };
    }
}

// 默认日志器实例
const defaultLogger = new Logger();

// 导出默认日志器
export default defaultLogger;

// 导出创建自定义日志器的函数
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
    return new Logger(config);
}

// 导出模块日志器创建函数
export function createModuleLogger(module: string) {
    return defaultLogger.createModuleLogger(module);
}