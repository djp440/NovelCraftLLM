#!/usr/bin/env node

/**
 * 修复 Date 对象问题
 * SQLite 不能直接绑定 Date 对象，需要使用字符串
 */

import { getDb } from '../src/db/database';

async function testDateFix() {
    console.log('🔧 测试 Date 对象修复...\n');

    const db = getDb();

    try {
        // 测试插入带日期数据
        console.log('1. 测试插入用户...');
        const user = await db
            .insertInto('users')
            .values({
                username: 'date_test@example.com',
                password_hash: 'hashed_password',
                auth_method: 'password',
                last_login_at: new Date().toISOString(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        console.log(`✅ 用户创建成功: ${user.username}`);

        // 测试更新日期
        console.log('\n2. 测试更新日期...');
        const updated = await db
            .updateTable('users')
            .set({
                last_login_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', user.id)
            .returningAll()
            .executeTakeFirstOrThrow();

        console.log(`✅ 日期更新成功: ${updated.last_login_at}`);

        // 测试查询
        console.log('\n3. 测试查询日期...');
        const found = await db
            .selectFrom('users')
            .where('id', '=', user.id)
            .selectAll()
            .executeTakeFirst();

        if (found) {
            console.log(`✅ 查询成功: ${found.username}, last_login: ${found.last_login_at}`);
            console.log(`   类型检查: last_login_at 类型 = ${typeof found.last_login_at}`);
        }

        // 清理测试数据
        console.log('\n4. 清理测试数据...');
        await db.deleteFrom('users').where('id', '=', user.id).execute();
        console.log('✅ 测试数据已清理');

        console.log('\n🎉 Date 对象修复测试通过！');
        console.log('\n建议：在 models.ts 中所有使用 new Date() 的地方改为 new Date().toISOString()');

    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    testDateFix().catch((error) => {
        console.error('测试过程出错:', error);
        process.exit(1);
    });
}