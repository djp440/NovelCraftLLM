-- 创建 chapter_versions 表（章节历史版本）
CREATE TABLE IF NOT EXISTS chapter_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_by_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    
    -- 唯一约束：每个章节的版本号必须唯一
    UNIQUE(chapter_id, version_number)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapter_versions_chapter_id ON chapter_versions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_versions_version_number ON chapter_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_chapter_versions_created_at ON chapter_versions(created_at);