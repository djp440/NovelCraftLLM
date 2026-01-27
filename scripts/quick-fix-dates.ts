#!/usr/bin/env node

/**
 * 快速修复 Date 对象问题
 * 将所有 new Date() 替换为 new Date().toISOString()
 */

import fs from 'fs';
import path from 'path';

const filesToFix = [
    'src/db/models.ts',
    'src/db/migrate.ts',
    'src/db/database.ts',
];

function fixDateIssues() {
    console.log('🔧 修复 Date 对象问题...\n');

    let fixedCount = 0;

    for (const filePath of filesToFix) {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  文件不存在: ${filePath}`);
            continue;
        }

        console.log(`处理文件: ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;

        // 修复 new Date() 问题
        content = content.replace(/new Date\(\)/g, 'new Date().toISOString()');

        // 修复特定的 Date 对象使用
        content = content.replace(/updated_at: new Date\(\)\.toISOString\(\)/g, 'updated_at: new Date().toISOString()');
        content = content.replace(/created_at: new Date\(\)\.toISOString\(\)/g, 'created_at: new Date().toISOString()');
        content = content.replace(/deleted_at: new Date\(\)\.toISOString\(\)/g, 'deleted_at: new Date().toISOString()');
        content = content.replace(/last_login_at: new Date\(\)\.toISOString\(\)/g, 'last_login_at: new Date().toISOString()');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✅ 已修复: ${filePath}`);
            fixedCount++;
        } else {
            console.log(`ℹ️  无需修改: ${filePath}`);
        }
    }

    console.log(`\n🎉 修复完成，共修改了 ${fixedCount} 个文件`);
    console.log('\n建议：对于 SQLite 数据库，所有日期字段都应该使用字符串格式（ISO 8601）');
}

// 运行修复
if (require.main === module) {
    fixDateIssues();
}