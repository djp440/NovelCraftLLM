import { Generated, Insertable, Selectable, Updateable } from 'kysely';

/**
 * 数据库表结构定义
 * 对应 doc/数据库设计.md 中的表结构
 */

// ==================== 表定义 ====================

export interface UsersTable {
    id: Generated<number>;
    username: string;
    password_hash: string;
    auth_method: 'password' | 'passkey';
    passkey_credential: string | null;
    last_login_at: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
}

export interface ProjectsTable {
    id: Generated<number>;
    user_id: number;
    title: string;
    description: string | null;
    cover_image: string | null;
    status: 'active' | 'archived';
    current_chapter_id: number | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
}

export interface ChaptersTable {
    id: Generated<number>;
    project_id: number;
    title: string;
    content: string;
    version_seq: Generated<number>;
    word_count: Generated<number>;
    agent_trace: string | null;
    parent_id: number | null;
    order_index: Generated<number>;
    type: Generated<'volume' | 'chapter'>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
}

export interface ChapterVersionsTable {
    id: Generated<number>;
    chapter_id: number;
    version_number: number;
    content: string;
    created_by_agent: string | null;
    created_at: Generated<string>;
}

export interface WorldBooksTable {
    id: Generated<number>;
    project_id: number;
    content: string;
    outline: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
}

export interface CharactersTable {
    id: Generated<number>;
    project_id: number;
    name: string;
    alias: string | null;
    description: string;
    avatar_url: string | null;
    tags: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    deleted_at: string | null;
}

// ==================== 数据库模式 ====================

export interface DatabaseSchema {
    users: UsersTable;
    projects: ProjectsTable;
    chapters: ChaptersTable;
    chapter_versions: ChapterVersionsTable;
    world_books: WorldBooksTable;
    characters: CharactersTable;
}

// ==================== 类型导出 ====================

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type Project = Selectable<ProjectsTable>;
export type NewProject = Insertable<ProjectsTable>;
export type ProjectUpdate = Updateable<ProjectsTable>;

export type Chapter = Selectable<ChaptersTable>;
export type NewChapter = Insertable<ChaptersTable>;
export type ChapterUpdate = Updateable<ChaptersTable>;

export type ChapterVersion = Selectable<ChapterVersionsTable>;
export type NewChapterVersion = Insertable<ChapterVersionsTable>;
export type ChapterVersionUpdate = Updateable<ChapterVersionsTable>;

export type WorldBook = Selectable<WorldBooksTable>;
export type NewWorldBook = Insertable<WorldBooksTable>;
export type WorldBookUpdate = Updateable<WorldBooksTable>;

export type Character = Selectable<CharactersTable>;
export type NewCharacter = Insertable<CharactersTable>;
export type CharacterUpdate = Updateable<CharactersTable>;