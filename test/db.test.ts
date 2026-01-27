import { getDb, closeDb } from '../src/db/database';
import { runMigrations } from '../src/db/migrate';
import { Models } from '../src/db/models';
import path from 'path';
import fs from 'fs';

/**
 * 数据库层测试脚本
 * 验证建表成功且能增删改查数据
 */

// 测试数据库路径
const TEST_DB_PATH = path.join(__dirname, 'test.db');

// 清理测试数据库
function cleanupTestDb() {
    try {
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    } catch (error) {
        console.warn('清理测试数据库失败:', error);
    }
}

// 设置测试数据库路径
process.env.DATABASE_PATH = TEST_DB_PATH;

async function runTests() {
    console.log('🚀 开始数据库层测试...\n');

    try {
        // 清理旧的测试数据库
        cleanupTestDb();

        // 1. 测试数据库连接
        console.log('1. 测试数据库连接...');
        const db = getDb();
        console.log('✅ 数据库连接成功');

        // 2. 运行迁移
        console.log('\n2. 运行数据库迁移...');
        await runMigrations();
        console.log('✅ 数据库迁移完成');

        // 3. 测试 users 表
        console.log('\n3. 测试 users 表...');
        await testUsersTable();

        // 4. 测试 projects 表
        console.log('\n4. 测试 projects 表...');
        await testProjectsTable();

        // 5. 测试 chapters 表
        console.log('\n5. 测试 chapters 表...');
        await testChaptersTable();

        // 6. 测试 chapter_versions 表
        console.log('\n6. 测试 chapter_versions 表...');
        await testChapterVersionsTable();

        // 7. 测试 world_books 表
        console.log('\n7. 测试 world_books 表...');
        await testWorldBooksTable();

        // 8. 测试 characters 表
        console.log('\n8. 测试 characters 表...');
        await testCharactersTable();

        // 9. 测试外键约束
        console.log('\n9. 测试外键约束...');
        await testForeignKeyConstraints();

        console.log('\n🎉 所有测试通过！');
    } catch (error) {
        console.error('\n❌ 测试失败:', error);
        process.exit(1);
    } finally {
        // 关闭数据库连接
        await closeDb();

        // 清理测试数据库
        cleanupTestDb();

        console.log('\n🧹 测试环境已清理');
    }
}

// ==================== 具体测试函数 ====================

async function testUsersTable() {
    // 使用随机用户名避免唯一约束冲突
    const randomId = Math.random().toString(36).substring(7);
    const username = `test_${randomId}@example.com`;

    // 创建用户
    const newUser = {
        username,
        password_hash: 'hashed_password_123',
        auth_method: 'password' as const,
    };

    const user = await Models.users.create(newUser);
    console.log(`  ✅ 创建用户: ${user.username} (ID: ${user.id})`);

    // 查询用户
    const foundUser = await Models.users.findById(user.id);
    if (!foundUser) throw new Error('用户查询失败');
    console.log(`  ✅ 查询用户: ${foundUser.username}`);

    // 按用户名查询
    const userByUsername = await Models.users.findByUsername(newUser.username);
    if (!userByUsername) throw new Error('按用户名查询失败');
    console.log(`  ✅ 按用户名查询: ${userByUsername.username}`);

    // 更新用户
    await Models.users.updateLastLogin(user.id);
    console.log(`  ✅ 更新最后登录时间`);

    return user;
}

async function testProjectsTable() {
    // 先创建一个用户用于测试
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `project_test_${randomId}@example.com`,
        password_hash: 'hashed_password_456',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    // 创建项目
    const newProject = {
        user_id: user.id,
        title: '测试小说项目',
        description: '这是一个测试项目',
        status: 'active' as const,
    };

    const project = await Models.projects.create(newProject);
    console.log(`  ✅ 创建项目: ${project.title} (ID: ${project.id})`);

    // 查询项目
    const foundProject = await Models.projects.findById(project.id);
    if (!foundProject) throw new Error('项目查询失败');
    console.log(`  ✅ 查询项目: ${foundProject.title}`);

    // 查询用户的所有项目
    const userProjects = await Models.projects.findByUserId(user.id);
    console.log(`  ✅ 查询用户项目: ${userProjects.length} 个项目`);

    // 更新项目
    const updatedProject = await Models.projects.update(project.id, {
        description: '更新后的描述',
    });
    console.log(`  ✅ 更新项目: ${updatedProject.description}`);

    // 软删除项目
    await Models.projects.softDelete(project.id);
    console.log(`  ✅ 软删除项目`);

    // 验证软删除后查询不到
    const deletedProject = await Models.projects.findById(project.id);
    if (deletedProject) throw new Error('软删除后仍能查询到项目');
    console.log(`  ✅ 软删除验证通过`);

    // 恢复项目
    await Models.projects.restore(project.id);
    console.log(`  ✅ 恢复项目`);

    return { user, project };
}

async function testChaptersTable() {
    // 创建测试数据
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `chapter_test_${randomId}@example.com`,
        password_hash: 'hashed_password_789',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    const testProject = {
        user_id: user.id,
        title: '章节测试项目',
        description: '用于测试章节功能',
        status: 'active' as const,
    };
    const project = await Models.projects.create(testProject);

    // 创建章节
    const newChapter = {
        project_id: project.id,
        title: '第一章：开端',
        content: '这是一个测试章节的内容。',
        agent_trace: JSON.stringify({ writer: 'AI Writer', reviewer: 'Human' }),
    };

    const chapter = await Models.chapters.create(newChapter);
    console.log(`  ✅ 创建章节: ${chapter.title} (ID: ${chapter.id})`);

    // 查询章节
    const foundChapter = await Models.chapters.findById(chapter.id);
    if (!foundChapter) throw new Error('章节查询失败');
    console.log(`  ✅ 查询章节: ${foundChapter.title}`);

    // 查询项目的所有章节
    const projectChapters = await Models.chapters.findByProjectId(project.id);
    console.log(`  ✅ 查询项目章节: ${projectChapters.length} 个章节`);

    // 更新章节
    const updatedContent = '更新后的章节内容，包含更多细节。';
    const updatedChapter = await Models.chapters.update(chapter.id, {
        content: updatedContent,
    });
    console.log(`  ✅ 更新章节内容`);

    // 更新字数统计
    await Models.chapters.updateWordCount(chapter.id, updatedContent);
    console.log(`  ✅ 更新字数统计`);

    // 软删除章节
    await Models.chapters.softDelete(chapter.id);
    console.log(`  ✅ 软删除章节`);

    return { user, project, chapter };
}

async function testChapterVersionsTable() {
    // 创建测试数据
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `version_test_${randomId}@example.com`,
        password_hash: 'hashed_password_101',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    const testProject = {
        user_id: user.id,
        title: '版本测试项目',
        description: '用于测试章节版本',
        status: 'active' as const,
    };
    const project = await Models.projects.create(testProject);

    const testChapter = {
        project_id: project.id,
        title: '版本测试章节',
        content: '初始内容',
    };
    const chapter = await Models.chapters.create(testChapter);

    // 创建多个版本
    const versions = [];
    for (let i = 1; i <= 3; i++) {
        const version = await Models.chapterVersions.create({
            chapter_id: chapter.id,
            version_number: i,
            content: `第 ${i} 版内容`,
            created_by_agent: i % 2 === 0 ? 'writer' : 'reviewer',
        });
        versions.push(version);
        console.log(`  ✅ 创建版本 ${i}: ${version.content}`);
    }

    // 查询章节的所有版本
    const chapterVersions = await Models.chapterVersions.findByChapterId(chapter.id);
    console.log(`  ✅ 查询章节版本: ${chapterVersions.length} 个版本`);

    // 查询特定版本
    const version2 = await Models.chapterVersions.findByChapterAndVersion(chapter.id, 2);
    if (!version2) throw new Error('版本查询失败');
    console.log(`  ✅ 查询特定版本: 版本 ${version2.version_number}`);

    return { user, project, chapter, versions };
}

async function testWorldBooksTable() {
    // 创建测试数据
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `worldbook_test_${randomId}@example.com`,
        password_hash: 'hashed_password_202',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    const testProject = {
        user_id: user.id,
        title: '世界观测试项目',
        description: '用于测试世界观功能',
        status: 'active' as const,
    };
    const project = await Models.projects.create(testProject);

    // 创建世界观
    const worldBook = {
        project_id: project.id,
        content: '# 测试世界观\n\n这是一个测试世界观的内容。',
        outline: JSON.stringify({
            地理: ['大陆', '海洋'],
            历史: ['古代', '现代'],
        }),
    };

    const createdWorldBook = await Models.worldBooks.upsert(worldBook);
    console.log(`  ✅ 创建世界观: 项目 ${createdWorldBook.project_id}`);

    // 查询世界观
    const foundWorldBook = await Models.worldBooks.findByProjectId(project.id);
    if (!foundWorldBook) throw new Error('世界观查询失败');
    console.log(`  ✅ 查询世界观: ${foundWorldBook.content.substring(0, 50)}...`);

    // 更新世界观
    const updatedWorldBook = await Models.worldBooks.upsert({
        project_id: project.id,
        content: '# 更新后的世界观\n\n这是更新后的内容。',
        outline: JSON.stringify({
            地理: ['大陆', '海洋', '山脉'],
            历史: ['古代', '中世纪', '现代'],
        }),
    });
    console.log(`  ✅ 更新世界观`);

    return { user, project, worldBook: foundWorldBook };
}

async function testCharactersTable() {
    // 创建测试数据
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `character_test_${randomId}@example.com`,
        password_hash: 'hashed_password_303',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    const testProject = {
        user_id: user.id,
        title: '角色测试项目',
        description: '用于测试角色功能',
        status: 'active' as const,
    };
    const project = await Models.projects.create(testProject);

    // 创建角色
    const character = {
        project_id: project.id,
        name: '测试角色',
        alias: '测试者',
        description: '这是一个测试角色的详细描述。',
        tags: JSON.stringify(['主角', '战士', '勇敢']),
    };

    const createdCharacter = await Models.characters.create(character);
    console.log(`  ✅ 创建角色: ${createdCharacter.name} (ID: ${createdCharacter.id})`);

    // 查询角色
    const foundCharacter = await Models.characters.findById(createdCharacter.id);
    if (!foundCharacter) throw new Error('角色查询失败');
    console.log(`  ✅ 查询角色: ${foundCharacter.name}`);

    // 查询项目的所有角色
    const projectCharacters = await Models.characters.findByProjectId(project.id);
    console.log(`  ✅ 查询项目角色: ${projectCharacters.length} 个角色`);

    // 更新角色
    const updatedCharacter = await Models.characters.update(createdCharacter.id, {
        alias: '更新后的别名',
        tags: JSON.stringify(['主角', '战士', '勇敢', '忠诚']),
    });
    console.log(`  ✅ 更新角色`);

    // 软删除角色
    await Models.characters.softDelete(createdCharacter.id);
    console.log(`  ✅ 软删除角色`);

    return { user, project, character: foundCharacter };
}

async function testForeignKeyConstraints() {
    console.log('  🔍 测试外键约束...');

    const db = getDb();

    try {
        // 尝试插入违反外键约束的数据
        await db
            .insertInto('projects')
            .values({
                user_id: 999999, // 不存在的用户ID
                title: '无效项目',
                description: '这个应该失败',
            })
            .execute();

        throw new Error('外键约束未生效');
    } catch (error: any) {
        if (error.message.includes('FOREIGN KEY constraint failed')) {
            console.log('  ✅ 外键约束生效: 阻止了无效数据插入');
        } else {
            throw error;
        }
    }

    // 测试级联删除
    console.log('  🔍 测试级联删除...');

    // 创建测试数据
    const randomId = Math.random().toString(36).substring(7);
    const testUser = {
        username: `fk_test_${randomId}@example.com`,
        password_hash: 'hashed_password_404',
        auth_method: 'password' as const,
    };
    const user = await Models.users.create(testUser);

    const testProject = {
        user_id: user.id,
        title: '外键测试项目',
        description: '用于测试外键约束',
        status: 'active' as const,
    };
    const project = await Models.projects.create(testProject);

    // 删除用户，应该级联删除项目
    await db.deleteFrom('users').where('id', '=', user.id).execute();

    // 验证项目也被删除
    const remainingProject = await db
        .selectFrom('projects')
        .where('id', '=', project.id)
        .selectAll()
        .executeTakeFirst();

    if (remainingProject) {
        throw new Error('级联删除未生效');
    }

    console.log('  ✅ 级联删除生效: 用户删除时项目也被删除');
}

// 运行测试
runTests().catch((error) => {
    console.error('测试运行失败:', error);
    process.exit(1);
});