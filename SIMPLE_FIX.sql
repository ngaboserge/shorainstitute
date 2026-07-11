-- ==========================================
-- SIMPLE FIX - Just rename the column
-- ==========================================

-- Rename column from last_accessed to last_accessed_at
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'last_accessed'
    ) THEN
        ALTER TABLE enrollments 
        RENAME COLUMN last_accessed TO last_accessed_at;
        RAISE NOTICE '✅ Column renamed successfully!';
    ELSE
        RAISE NOTICE 'ℹ️  Column already named last_accessed_at';
    END IF;
END $$;

-- Set default value
ALTER TABLE enrollments 
ALTER COLUMN last_accessed_at SET DEFAULT NOW();

-- Update any NULL values
UPDATE enrollments 
SET last_accessed_at = COALESCE(last_accessed_at, enrolled_at, NOW()) 
WHERE last_accessed_at IS NULL;

-- Verify the fix
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
AND column_name = 'last_accessed_at';

SELECT '✅ Column fix complete! Refresh your browser now.' as status;
