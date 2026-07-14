-- Create lesson_resources table for attaching files/resources to specific lessons
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course ON lesson_resources(course_id);

-- Disable RLS for now
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;

-- Add lesson notes table for learners to take notes at specific timestamps
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_course ON lesson_notes(course_id);

-- Disable RLS for now
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;

-- Update lessons table to add description and learning objectives if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') THEN
    ALTER TABLE lessons ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'learning_objectives') THEN
    ALTER TABLE lessons ADD COLUMN learning_objectives text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'key_concepts') THEN
    ALTER TABLE lessons ADD COLUMN key_concepts jsonb;
  END IF;
END $$;

SELECT 'Lesson resources and notes tables created successfully!' as status;
