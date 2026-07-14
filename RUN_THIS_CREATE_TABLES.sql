-- ========================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- ========================================
-- This creates lesson_resources and lesson_notes tables with lowercase types
-- Run this entire file at once or one statement at a time

-- Step 1: Create lesson_resources table
CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes bigint,
  created_at timestamptz DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id),
  order_number integer DEFAULT 0
);

-- Step 2: Create lesson_notes table
CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  timestamp_seconds integer DEFAULT 0,
  note_text text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Step 3: Add columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_objectives text[];
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS key_concepts jsonb;

-- Step 4: Disable RLS
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course ON lesson_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_course ON lesson_notes(course_id);

-- Verify
SELECT 'SUCCESS! Tables created and configured.' as status;
