-- Disable RLS on lesson_resources table
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lesson_notes table
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course ON lesson_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_course ON lesson_notes(course_id);
