-- Rollback script - Run this in the WRONG database to clean up
-- This removes everything we accidentally created

-- Drop trigger first (before dropping the function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop RPC functions
DROP FUNCTION IF EXISTS get_user_contact_email(UUID);
DROP FUNCTION IF EXISTS get_trainer_profile(UUID);
DROP FUNCTION IF EXISTS update_user_contact_email(UUID, TEXT);
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop column from users table if it was added
ALTER TABLE public.users DROP COLUMN IF EXISTS contact_email;
ALTER TABLE public.users DROP COLUMN IF EXISTS languages;

-- Note: We can't drop columns from auth.users as we don't have permission
-- Those columns won't hurt anything if they exist

-- Drop policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can read trainer profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert user profile" ON public.users;

-- Drop the entire public.users table if it was created by our migration
-- ONLY run this line if you're SURE this table was created by us and doesn't contain important data
-- DROP TABLE IF EXISTS public.users CASCADE;

SELECT 'Cleanup complete - switch to correct database now!' AS status;
