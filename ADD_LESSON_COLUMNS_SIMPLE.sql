-- Add description column to lessons table (if not exists)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description text;

-- Add learning_objectives column to lessons table (if not exists)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_objectives text[];

-- Add key_concepts column to lessons table (if not exists)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS key_concepts jsonb;
