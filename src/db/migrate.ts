import { getDb } from './database';
import { sql } from 'kysely';
import fs from 'fs';
import path from 'path';

/**
 * 数据库迁移管理器
 * 负责创建和更新数据库表结构
 */
export class MigrationManager {
    private static migrationsDir = path.join(__dirname, 'migrations');
    private static migrationTableName = 'migrations';

    /**
     * 初始化迁移系统
     */
    static async initialize() {
        await this.createMigrationsTable();
    }

    /**
     * 创建迁移记录表
     */
    private static async createMigrationsTable() {
        const db = getDb();

        await db.schema
            .createTable(this.migrationTableName)
            .ifNotExists()
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
            .addColumn('name', 'text', (col) => col.notNull().unique())
            .addColumn('applied_at', 'timestamp', (col) =>
                col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
            )
            .execute();
    }

    /**
     * 运行所有待执行的迁移
     */
    static async runMigrations() {
        await this.initialize();

        const appliedMigrations = await this.getAppliedMigrations();
        const migrationFiles = this.getMigrationFiles();

        for (const migrationFile of migrationFiles) {
            if (!appliedMigrations.has(migrationFile.name)) {
                console.log(`执行迁移: ${migrationFile.name}`);
                await this.runMigration(migrationFile);
                await this.recordMigration(migrationFile.name);
            }
        }

        console.log('所有迁移已完成');
    }

    /**
     * 获取已应用的迁移列表
     */
    private static async getAppliedMigrations(): Promise<Set<string>> {
        const db = getDb();
        const migrations = await db
            .selectFrom(this.migrationTableName as any)
            .select('name')
            .execute();

        return new Set(migrations.map((m) => m.name));
    }

    /**
     * 获取迁移文件列表
     */
    private static getMigrationFiles(): Array<{ name: string; path: string }> {
        if (!fs.existsSync(this.migrationsDir)) {
            return [];
        }

        const files = fs
            .readdirSync(this.migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort() // 按文件名排序确保顺序
            .map((file) => ({
                name: file.replace('.sql', ''),
                path: path.join(this.migrationsDir, file),
            }));

        return files;
    }

    /**
     * 执行单个迁移文件
     */
    private static async runMigration(migrationFile: {
        name: string;
        path: string;
    }) {
        const db = getDb();
        const sqlContent = fs.readFileSync(migrationFile.path, 'utf-8');

        // 分割 SQL 语句（以分号分隔）
        const statements = sqlContent
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        for (const statement of statements) {
            await db.executeQuery(sql.raw(statement).compile(db));
        }
    }

    /**
     * 记录迁移已应用
     */
    private static async recordMigration(name: string) {
        const db = getDb();
        await db
            .insertInto(this.migrationTableName as any)
            .values({ name })
            .execute();
    }

    /**
     * 回滚到指定迁移（开发环境使用）
     */
    static async rollback(targetMigration?: string) {
        console.warn('回滚功能仅用于开发环境');
        // 实现回滚逻辑（根据需求实现）
    }

    /**
     * 获取迁移状态
     */
    static async getMigrationStatus() {
        try {
            const applied = await this.getAppliedMigrations();
            const files = this.getMigrationFiles();

            return {
                applied: Array.from(applied),
                pending: files
                    .map((f) => f.name)
                    .filter((name) => !applied.has(name)),
                total: files.length,
            };
        } catch (error: any) {
            // 如果 migrations 表不存在，返回空的应用列表
            if (error.message?.includes('no such table: migrations')) {
                const files = this.getMigrationFiles();
                return {
                    applied: [],
                    pending: files.map((f) => f.name),
                    total: files.length,
                };
            }
            throw error;
        }
    }
}

// 导出迁移运行函数
export const runMigrations = () => MigrationManager.runMigrations();
export const getMigrationStatus = () => MigrationManager.getMigrationStatus();