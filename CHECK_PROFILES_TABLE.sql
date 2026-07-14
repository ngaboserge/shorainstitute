-- Check the profiles table structure and data
-- ============================================

-- 1. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if learner profile exists
SELECT * FROM profiles
WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290';

-- 3. Check all profiles
SELECT id, email, full_name, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Check RLS policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. If profiles table doesn't have full_name, check what columns it has
SELECT * FROM profiles LIMIT 3;

-- 6. Check if we need to add full_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    COMMENT ON COLUMN profiles.full_name IS 'User full name';
  END IF;
END $$;

-- 7. If full_name is null, populate from auth.users metadata
UPDATE profiles p
SET full_name = COALESCE(
  p.full_name,
  p.email,
  'User ' || substring(p.id::text, 1, 8)
)
WHERE p.full_name IS NULL OR p.full_name = '';

-- 8. Verify the learner profile again
SELECT * FROM profiles
WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290';
