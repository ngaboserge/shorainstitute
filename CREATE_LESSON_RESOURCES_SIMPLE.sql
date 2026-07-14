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
