-- ==========================================
-- FIX ENROLLMENTS TABLE COLUMN NAME
-- ==========================================

-- Check if we need to rename the column
DO $$ 
BEGIN
    -- Check if last_accessed exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'last_accessed'
    ) THEN
        -- Rename it to last_accessed_at
        ALTER TABLE enrollments 
        RENAME COLUMN last_accessed TO last_accessed_at;
        
        RAISE NOTICE 'Column renamed from last_accessed to last_accessed_at';
    ELSE
        RAISE NOTICE 'Column last_accessed_at already exists, no change needed';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
AND column_name = 'last_accessed_at';

SELECT 'Column fix complete! ✅' as status;
