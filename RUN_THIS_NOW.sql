-- ==========================================
-- QUICK FIX: Auto-confirm emails and fix trigger
-- Run this in Supabase SQL Editor NOW
-- ==========================================

-- 1. Confirm all existing users immediately
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create new function that auto-confirms emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email immediately
  NEW.email_confirmed_at := NOW();
  
  -- Create profile in users table
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, still return NEW so auth user is created
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create BEFORE trigger (auto-confirms before user is created)
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Drop and recreate RLS policies for users table
DROP POLICY IF EXISTS "Public profiles are viewable" ON users;
DROP POLICY IF EXISTS "Service role can insert profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow everyone to view profiles
CREATE POLICY "Public profiles are viewable" 
  ON users FOR SELECT 
  USING (true);

-- Allow inserts (for trigger and manual inserts)
CREATE POLICY "Anyone can insert profiles" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Simplify course policies
DROP POLICY IF EXISTS "View courses" ON courses;
DROP POLICY IF EXISTS "Trainers create courses" ON courses;
DROP POLICY IF EXISTS "Trainers update own courses" ON courses;
DROP POLICY IF EXISTS "Trainers delete own courses" ON courses;

-- View published courses or own courses
CREATE POLICY "View courses" 
  ON courses FOR SELECT 
  USING (status = 'published' OR instructor_id = auth.uid());

-- Create courses (any authenticated user)
CREATE POLICY "Create courses" 
  ON courses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = instructor_id);

-- Update own courses
CREATE POLICY "Update own courses" 
  ON courses FOR UPDATE 
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Delete own courses
CREATE POLICY "Delete own courses" 
  ON courses FOR DELETE 
  USING (auth.uid() = instructor_id);

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 'All users confirmed!' as message, COUNT(*) as confirmed_count
FROM auth.users WHERE email_confirmed_at IS NOT NULL;

SELECT 'Setup complete! Try signup now.' as status;
