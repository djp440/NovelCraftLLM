
import { getDb, closeDb } from '../src/db/database';
import { hashPassword } from '../src/auth/utils';

async function createDemoUser() {
    console.log('👤 创建 Demo 管理员账号...');

    const db = getDb();
    const username = 'admin@novelcraft.com';
    const password = 'Admin123!';

    console.log('正在加密密码...');
    const passwordHash = await hashPassword(password);

    try {
        // Check if user exists
        const existingUser = await db
            .selectFrom('users')
            .selectAll()
            .where('username', '=', username)
            .executeTakeFirst();

        if (existingUser) {
            console.log(`用户 ${username} 已存在，更新密码...`);
            await db
                .updateTable('users')
                .set({
                    password_hash: passwordHash,
                    auth_method: 'password',
                    updated_at: new Date().toISOString()
                })
                .where('id', '=', existingUser.id)
                .execute();
            console.log('✅ 密码已更新');
        } else {
            console.log(`创建新用户 ${username}...`);
            await db
                .insertInto('users')
                .values({
                    username,
                    password_hash: passwordHash,
                    auth_method: 'password',
                    // created_at 和 updated_at 由数据库默认值处理
                })
                .execute();
            console.log('✅ 用户已创建');
        }

        console.log('\n=======================================');
        console.log('🎉 Demo 账号准备就绪');
        console.log(`📧 用户名: ${username}`);
        console.log(`🔑 密码:   ${password}`);
        console.log('=======================================\n');

    } catch (error) {
        console.error('❌ 创建用户失败:', error);
    } finally {
        await closeDb();
    }
}

createDemoUser();
