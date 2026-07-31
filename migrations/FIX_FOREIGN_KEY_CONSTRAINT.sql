-- =====================================================
-- FIX: Add missing foreign key constraint
-- Error: "Could not find a relationship between learner_institutional_enrollments and courses"
-- =====================================================

-- Check if constraint already exists
DO $$
BEGIN
  -- Drop existing constraint if it exists (in case it's malformed)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'learner_institutional_enrollments_course_id_fkey'
    AND table_name = 'learner_institutional_enrollments'
  ) THEN
    ALTER TABLE learner_institutional_enrollments 
    DROP CONSTRAINT learner_institutional_enrollments_course_id_fkey;
    RAISE NOTICE 'Dropped existing foreign key constraint';
  END IF;
END $$;

-- Add the foreign key constraint properly
ALTER TABLE learner_institutional_enrollments
ADD CONSTRAINT learner_institutional_enrollments_course_id_fkey
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Verify the constraint was created
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'learner_institutional_enrollments'
  AND kcu.column_name = 'course_id';

-- Refresh Supabase schema cache
COMMENT ON TABLE learner_institutional_enrollments IS 'Institutional course enrollments - updated foreign key';

-- If the above doesn't work, check if courses table exists
SELECT 
  'courses table exists' as check_type,
  COUNT(*) as record_count
FROM courses;

-- Check if course_id column exists
SELECT 
  'course_id column exists' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'learner_institutional_enrollments'
  AND column_name = 'course_id';
