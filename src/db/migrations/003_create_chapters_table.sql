-- 创建 chapters 表（章节 - 当前活跃版本）
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version_seq INTEGER DEFAULT 1,
    word_count INTEGER DEFAULT 0,
    agent_trace TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    -- 外键约束
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_chapters_deleted_at ON chapters(deleted_at);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at);
CREATE INDEX IF NOT EXISTS idx_chapters_version_seq ON chapters(version_seq);