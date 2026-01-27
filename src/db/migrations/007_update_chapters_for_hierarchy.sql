-- Add hierarchy support to chapters table
ALTER TABLE chapters ADD COLUMN parent_id INTEGER REFERENCES chapters(id);
ALTER TABLE chapters ADD COLUMN order_index INTEGER DEFAULT 0;
ALTER TABLE chapters ADD COLUMN type TEXT DEFAULT 'chapter';
