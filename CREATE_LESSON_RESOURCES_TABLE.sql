-- Create lesson_resources table for attaching files/resources to specific lessons
CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- PDF, XLSX, DOCX, MP4, ZIP, etc.
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  order_number INTEGER DEFAULT 0
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course ON lesson_resources(course_id);

-- Disable RLS for now (we can enable it later with proper policies)
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;

-- Add lesson notes table for learners to take notes at specific timestamps
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER DEFAULT 0,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
    ALTER TABLE lessons ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'learning_objectives') THEN
    ALTER TABLE lessons ADD COLUMN learning_objectives TEXT[]; -- Array of learning objectives
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'key_concepts') THEN
    ALTER TABLE lessons ADD COLUMN key_concepts JSONB; -- [{title, description, icon}]
  END IF;
END $$;

SELECT 'Lesson resources and notes tables created successfully!' as status;
