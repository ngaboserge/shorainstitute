-- Fix RLS policies for lessons table so learners can access course lessons
-- This is needed for the learner portal to display course content

-- Enable RLS on lessons table (if not already enabled)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read published course lessons" ON lessons;
DROP POLICY IF EXISTS "Trainers can manage their course lessons" ON lessons;
DROP POLICY IF EXISTS "Learners can read all lessons" ON lessons;

-- Policy 1: Allow all authenticated users to read lessons
-- This allows learners to access lessons for courses they're enrolled in
CREATE POLICY "Learners can read all lessons"
ON lessons
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow trainers to manage lessons for their own courses
CREATE POLICY "Trainers can manage their course lessons"
ON lessons
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = lessons.course_id
        AND courses.instructor_id = auth.uid()
    )
);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'lessons';
