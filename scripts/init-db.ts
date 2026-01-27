#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于初始化数据库和运行迁移
 */

import { runMigrations, getMigrationStatus } from '../src/db/migrate';
import { getDbPath } from '../src/db/database';
import path from 'path';

async function initDatabase() {
    console.log('📦 NovelCraftLLM 数据库初始化\n');

    const dbPath = getDbPath();
    console.log(`数据库路径: ${dbPath}`);
    console.log(`工作目录: ${process.cwd()}\n`);

    try {
        // 检查迁移状态
        console.log('🔍 检查迁移状态...');
        const status = await getMigrationStatus();

        console.log(`已应用迁移: ${status.applied.length}`);
        console.log(`待执行迁移: ${status.pending.length}`);
        console.log(`总迁移文件: ${status.total}\n`);

        if (status.pending.length === 0) {
            console.log('✅ 所有迁移已应用，无需初始化');
            return;
        }

        // 运行迁移
        console.log('🚀 开始执行数据库迁移...');
        await runMigrations();

        // 再次检查状态
        const finalStatus = await getMigrationStatus();
        console.log(`\n✅ 数据库初始化完成！`);
        console.log(`已应用迁移: ${finalStatus.applied.length}/${finalStatus.total}`);

        if (finalStatus.pending.length > 0) {
            console.warn(`⚠️  仍有未应用的迁移: ${finalStatus.pending.join(', ')}`);
        }

    } catch (error) {
        console.error('\n❌ 数据库初始化失败:');
        console.error(error);
        process.exit(1);
    }
}

// 运行初始化
if (require.main === module) {
    initDatabase().catch((error) => {
        console.error('初始化过程出错:', error);
        process.exit(1);
    });
}

export { initDatabase };