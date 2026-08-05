-- =====================================================
-- ADD MISSING COLUMNS TO COURSES TABLE
-- Created: 2026-08-04
-- Purpose: Add missing columns (learning_objectives, requirements, target_audience) causing PGRST204 errors
-- =====================================================

-- Add learning_objectives column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'learning_objectives'
    ) THEN
        ALTER TABLE courses 
        ADD COLUMN learning_objectives TEXT;
        
        RAISE NOTICE 'Added learning_objectives column to courses table';
    ELSE
        RAISE NOTICE 'learning_objectives column already exists';
    END IF;
END $$;

-- Add requirements column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'requirements'
    ) THEN
        ALTER TABLE courses 
        ADD COLUMN requirements TEXT;
        
        RAISE NOTICE 'Added requirements column to courses table';
    ELSE
        RAISE NOTICE 'requirements column already exists';
    END IF;
END $$;

-- Add target_audience column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE courses 
        ADD COLUMN target_audience TEXT;
        
        RAISE NOTICE 'Added target_audience column to courses table';
    ELSE
        RAISE NOTICE 'target_audience column already exists';
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN courses.learning_objectives IS 'Learning objectives for the course';
COMMENT ON COLUMN courses.requirements IS 'Prerequisites and requirements for the course';
COMMENT ON COLUMN courses.target_audience IS 'Target audience description for the course';
