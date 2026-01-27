import { Kysely, SqliteDialect, sql } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseSchema } from './schema';

/**
 * 数据库连接单例
 * 使用 SQLite 作为数据库，配合 Better-SQLite3 和 Kysely
 */
class DatabaseClient {
    private static instance: Kysely<DatabaseSchema> | null = null;
    private static dbPath: string;

    /**
     * 初始化数据库路径
     */
    static initialize(dbPath?: string) {
        if (!this.dbPath) {
            this.dbPath = dbPath || path.join(process.cwd(), 'data', 'novelcraft.db');
        }
    }

    /**
     * 获取数据库实例（单例模式）
     */
    static getInstance(): Kysely<DatabaseSchema> {
        if (!this.instance) {
            this.initialize();

            // 确保数据目录存在
            const dataDir = path.dirname(this.dbPath);
            try {
                fs.mkdirSync(dataDir, { recursive: true });
            } catch (error) {
                console.warn(`无法创建数据目录 ${dataDir}:`, error);
            }

            const dialect = new SqliteDialect({
                database: new Database(this.dbPath),
            });

            this.instance = new Kysely<DatabaseSchema>({
                dialect,
                log(event) {
                    if (event.level === 'error') {
                        console.error('数据库错误:', event.error);
                    }
                },
            });

            // 启用外键约束
            this.setupPragmas();
        }

        return this.instance;
    }

    /**
     * 设置 SQLite PRAGMA
     */
    private static async setupPragmas() {
        if (!this.instance) return;

        try {
            // 启用外键约束
            await this.instance.executeQuery(
                sql`PRAGMA foreign_keys = ON`.compile(this.instance)
            );

            // 启用 WAL 模式以获得更好的并发性能
            await this.instance.executeQuery(
                sql`PRAGMA journal_mode = WAL`.compile(this.instance)
            );

            // 设置同步模式为 NORMAL（性能与安全平衡）
            await this.instance.executeQuery(
                sql`PRAGMA synchronous = NORMAL`.compile(this.instance)
            );

            console.log('数据库 PRAGMA 设置完成');
        } catch (error) {
            console.error('设置数据库 PRAGMA 失败:', error);
        }
    }

    /**
     * 关闭数据库连接
     */
    static async close() {
        if (this.instance) {
            await this.instance.destroy();
            this.instance = null;
            console.log('数据库连接已关闭');
        }
    }

    /**
     * 获取数据库路径
     */
    static getDbPath(): string {
        this.initialize();
        return this.dbPath;
    }
}

// 导出数据库实例获取函数
export const getDb = () => DatabaseClient.getInstance();
export const closeDb = () => DatabaseClient.close();
export const getDbPath = () => DatabaseClient.getDbPath();

// 默认导出数据库客户端类
export default DatabaseClient;