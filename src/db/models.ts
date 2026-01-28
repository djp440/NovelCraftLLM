import { getDb } from './database';
import type {
    User,
    NewUser,
    UserUpdate,
    Project,
    NewProject,
    ProjectUpdate,
    Chapter,
    NewChapter,
    ChapterUpdate,
    ChapterVersion,
    NewChapterVersion,
    WorldBook,
    NewWorldBook,
    Character,
    NewCharacter,
} from './schema';

/**
 * 数据库模型操作类
 * 提供对各个表的 CRUD 操作
 */

// ==================== Users 模型 ====================

export class UserModel {
    /**
     * 创建新用户
     */
    static async create(user: NewUser): Promise<User> {
        const db = getDb();
        const result = await db
            .insertInto('users')
            .values(user)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result as User;
    }

    /**
     * 根据 ID 查找用户
     */
    static async findById(id: number): Promise<User | null> {
        const db = getDb();
        const user = await db
            .selectFrom('users')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();
        return (user ?? null) as User | null;
    }

    /**
     * 根据用户名查找用户
     */
    static async findByUsername(username: string): Promise<User | null> {
        const db = getDb();
        const user = await db
            .selectFrom('users')
            .where('username', '=', username)
            .selectAll()
            .executeTakeFirst();
        return (user ?? null) as User | null;
    }

    /**
     * 更新用户信息
     */
    static async update(id: number, updates: UserUpdate): Promise<User> {
        const db = getDb();
        const result = await db
            .updateTable('users')
            .set({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result as User;
    }

    /**
     * 更新最后登录时间
     */
    static async updateLastLogin(id: number): Promise<void> {
        const db = getDb();
        const now = new Date().toISOString();
        await db
            .updateTable('users')
            .set({
                last_login_at: now,
                updated_at: now,
            })
            .where('id', '=', id)
            .execute();
    }

    /**
     * 更新用户认证方式为Passkey
     * @param id 用户ID
     * @param credential Passkey凭证JSON字符串
     */
    static async updateToPasskeyAuth(id: number, credential: string): Promise<void> {
        const db = getDb();
        const now = new Date().toISOString();
        await db
            .updateTable('users')
            .set({
                auth_method: 'passkey',
                passkey_credential: credential,
                updated_at: now,
            })
            .where('id', '=', id)
            .execute();
    }

    /**
     * 更新用户认证方式为密码
     * @param id 用户ID
     */
    static async updateToPasswordAuth(id: number): Promise<void> {
        const db = getDb();
        const now = new Date().toISOString();
        await db
            .updateTable('users')
            .set({
                auth_method: 'password',
                passkey_credential: null,
                updated_at: now,
            })
            .where('id', '=', id)
            .execute();
    }

    /**
     * 检查用户是否使用Passkey认证
     * @param id 用户ID
     * @returns 是否使用Passkey认证
     */
    static async usesPasskeyAuth(id: number): Promise<boolean> {
        const user = await this.findById(id);
        return user?.auth_method === 'passkey' && !!user.passkey_credential;
    }

    /**
     * 获取用户的Passkey凭证
     * @param id 用户ID
     * @returns Passkey凭证JSON字符串或null
     */
    static async getPasskeyCredential(id: number): Promise<string | null> {
        const user = await this.findById(id);
        return user?.passkey_credential ?? null;
    }

    /**
     * 根据Passkey凭证ID查找用户
     * @param credentialId Passkey凭证ID
     * @returns 用户或null
     */
    static async findByCredentialId(credentialId: string): Promise<User | null> {
        const db = getDb();
        // 注意：这里需要解析passkey_credential字段来查找匹配的凭证ID
        // 由于passkey_credential存储的是JSON字符串，这里使用简单的LIKE查询
        // 实际实现中应该使用更精确的JSON查询
        const user = await db
            .selectFrom('users')
            .where('passkey_credential', 'like', `%"id":"${credentialId}"%`)
            .selectAll()
            .executeTakeFirst();

        return (user ?? null) as User | null;
    }
}

// ==================== Projects 模型 ====================

export class ProjectModel {
    /**
     * 创建新项目
     */
    static async create(project: NewProject): Promise<Project> {
        const db = getDb();
        const result = await db
            .insertInto('projects')
            .values(project)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 根据 ID 查找项目（排除已删除的）
     */
    static async findById(id: number): Promise<Project | null> {
        const db = getDb();
        const project = await db
            .selectFrom('projects')
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .selectAll()
            .executeTakeFirst();
        return project ?? null;
    }

    /**
     * 查找用户的所有项目
     */
    static async findByUserId(userId: number): Promise<Project[]> {
        const db = getDb();
        const projects = await db
            .selectFrom('projects')
            .where('user_id', '=', userId)
            .where('deleted_at', 'is', null)
            .orderBy('created_at', 'desc')
            .selectAll()
            .execute();
        return projects;
    }

    /**
     * 更新项目信息
     */
    static async update(id: number, updates: ProjectUpdate): Promise<Project> {
        const db = getDb();
        const result = await db
            .updateTable('projects')
            .set({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 软删除项目
     */
    static async softDelete(id: number): Promise<void> {
        const db = getDb();
        const now = new Date();
        // 使用字符串格式的日期，避免SQLite绑定问题
        const nowStr = now.toISOString();
        await db
            .updateTable('projects')
            .set({
                deleted_at: nowStr,
                updated_at: nowStr,
            })
            .where('id', '=', id)
            .execute();
    }

    /**
     * 恢复已删除的项目
     */
    static async restore(id: number): Promise<void> {
        const db = getDb();
        await db
            .updateTable('projects')
            .set({
                deleted_at: null,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .execute();
    }
}

// ==================== Chapters 模型 ====================

export class ChapterModel {
    /**
     * 创建新章节
     */
    static async create(chapter: NewChapter): Promise<Chapter> {
        const db = getDb();
        const result = await db
            .insertInto('chapters')
            .values(chapter)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 根据 ID 查找章节（排除已删除的）
     */
    static async findById(id: number): Promise<Chapter | null> {
        const db = getDb();
        const chapter = await db
            .selectFrom('chapters')
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .selectAll()
            .executeTakeFirst();
        return chapter ?? null;
    }

    /**
     * 查找项目的所有章节
     */
    static async findByProjectId(projectId: number): Promise<Chapter[]> {
        const db = getDb();
        const chapters = await db
            .selectFrom('chapters')
            .where('project_id', '=', projectId)
            .where('deleted_at', 'is', null)
            .orderBy('order_index', 'asc')
            .orderBy('created_at', 'asc')
            .selectAll()
            .execute();
        return chapters;
    }

    /**
     * 更新章节内容
     */
    static async update(id: number, updates: ChapterUpdate): Promise<Chapter> {
        const db = getDb();
        const result = await db
            .updateTable('chapters')
            .set({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 更新字数统计
     */
    static async updateWordCount(id: number, content: string): Promise<void> {
        const wordCount = content.length; // 简单字数统计（中文字符数）
        const db = getDb();
        await db
            .updateTable('chapters')
            .set({
                word_count: wordCount,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .execute();
    }

    /**
     * 软删除章节
     */
    static async softDelete(id: number): Promise<void> {
        const db = getDb();
        const now = new Date().toISOString();
        await db
            .updateTable('chapters')
            .set({
                deleted_at: now,
                updated_at: now,
            })
            .where('id', '=', id)
            .execute();
    }
}

// ==================== ChapterVersions 模型 ====================

export class ChapterVersionModel {
    /**
     * 创建章节版本
     */
    static async create(version: NewChapterVersion): Promise<ChapterVersion> {
        const db = getDb();
        const result = await db
            .insertInto('chapter_versions')
            .values(version)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 查找章节的所有版本
     */
    static async findByChapterId(chapterId: number): Promise<ChapterVersion[]> {
        const db = getDb();
        const versions = await db
            .selectFrom('chapter_versions')
            .where('chapter_id', '=', chapterId)
            .orderBy('version_number', 'desc')
            .selectAll()
            .execute();
        return versions;
    }

    /**
     * 获取章节的特定版本
     */
    static async findByChapterAndVersion(
        chapterId: number,
        versionNumber: number
    ): Promise<ChapterVersion | null> {
        const db = getDb();
        const version = await db
            .selectFrom('chapter_versions')
            .where('chapter_id', '=', chapterId)
            .where('version_number', '=', versionNumber)
            .selectAll()
            .executeTakeFirst();
        return version ?? null;
    }

    /**
     * 删除旧版本（保留最近10个版本）
     */
    static async cleanupOldVersions(chapterId: number): Promise<void> {
        const db = getDb();
        // 删除版本号最小的记录（保留最近10个）
        await db
            .deleteFrom('chapter_versions')
            .where('chapter_id', '=', chapterId)
            .where(
                'version_number',
                '=',
                (eb) => eb
                    .selectFrom('chapter_versions')
                    .where('chapter_id', '=', chapterId)
                    .select('version_number')
                    .orderBy('version_number', 'asc')
                    .limit(1)
            )
            .execute();
    }
}

// ==================== WorldBooks 模型 ====================

export class WorldBookModel {
    /**
     * 创建或更新世界设定
     */
    static async upsert(worldBook: NewWorldBook): Promise<WorldBook> {
        const db = getDb();

        // 尝试更新现有记录
        const updated = await db
            .updateTable('world_books')
            .set({
                ...worldBook,
                updated_at: new Date().toISOString(),
            })
            .where('project_id', '=', worldBook.project_id)
            .returningAll()
            .executeTakeFirst();

        if (updated) {
            return updated;
        }

        // 如果不存在则创建
        const result = await db
            .insertInto('world_books')
            .values(worldBook)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 根据项目ID查找世界设定
     */
    static async findByProjectId(projectId: number): Promise<WorldBook | null> {
        const db = getDb();
        const worldBook = await db
            .selectFrom('world_books')
            .where('project_id', '=', projectId)
            .selectAll()
            .executeTakeFirst();
        return worldBook ?? null;
    }
}

// ==================== Characters 模型 ====================

export class CharacterModel {
    /**
     * 创建新角色
     */
    static async create(character: NewCharacter): Promise<Character> {
        const db = getDb();
        const result = await db
            .insertInto('characters')
            .values(character)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 根据 ID 查找角色（排除已删除的）
     */
    static async findById(id: number): Promise<Character | null> {
        const db = getDb();
        const character = await db
            .selectFrom('characters')
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .selectAll()
            .executeTakeFirst();
        return character ?? null;
    }

    /**
     * 查找项目的所有角色
     */
    static async findByProjectId(projectId: number): Promise<Character[]> {
        const db = getDb();
        const characters = await db
            .selectFrom('characters')
            .where('project_id', '=', projectId)
            .where('deleted_at', 'is', null)
            .orderBy('created_at', 'asc')
            .selectAll()
            .execute();
        return characters;
    }

    /**
     * 更新角色信息
     */
    static async update(id: number, updates: Partial<Character>): Promise<Character> {
        const db = getDb();
        const result = await db
            .updateTable('characters')
            .set({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }

    /**
     * 软删除角色
     */
    static async softDelete(id: number): Promise<void> {
        const db = getDb();
        const now = new Date().toISOString();
        await db
            .updateTable('characters')
            .set({
                deleted_at: now,
                updated_at: now,
            })
            .where('id', '=', id)
            .execute();
    }
}

// ==================== 导出所有模型 ====================

export const Models = {
    users: UserModel,
    projects: ProjectModel,
    chapters: ChapterModel,
    chapterVersions: ChapterVersionModel,
    worldBooks: WorldBookModel,
    characters: CharacterModel,
};
