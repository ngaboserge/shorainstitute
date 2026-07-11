-- ===================================================================
-- ADD PROFILE COLUMNS TO USERS TABLE
-- Run this in Supabase SQL Editor to enable profile editing
-- ===================================================================

-- Add profile fields to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS expertise TEXT,
ADD COLUMN IF NOT EXISTS learning_style VARCHAR(50) DEFAULT 'self-paced',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT false;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN (
    'phone', 
    'location', 
    'bio', 
    'title', 
    'expertise', 
    'learning_style',
    'email_notifications',
    'sms_notifications',
    'push_notifications'
  )
ORDER BY column_name;

-- Success message
SELECT 'Profile columns added successfully! Profile editing should now work.' as status;
