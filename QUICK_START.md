# 🚀 QUICK START - Run These 2 SQL Queries

## Problem Fixed ✅
- Changed from `auth.users` to `public.users` (you don't have permission to modify auth.users)
- Added storage bucket setup for trainer photos

---

## STEP 1: Add Profile Fields (Run This First)

**In Supabase SQL Editor, run:**

```sql
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS qualifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON public.users(profile_photo_url);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS show_instructor_profile BOOLEAN DEFAULT true;
```

---

## STEP 2: Setup Storage Bucket (Run This Second)

**In Supabase SQL Editor, run:**

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Trainers can manage trainer photos" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Trainers can manage trainer photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'trainers'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'trainer'
  )
);
```

---

## ✅ DONE!

Now:
1. Deploy the code to production (already pushed to GitHub)
2. Log in as trainer
3. Go to Profile → Edit Profile
4. Upload photo and fill in all fields
5. Check homepage - featured course should show with trainer profile!

---

## 🐛 If Storage Policies Fail

If you get errors about storage policies already existing, that's OK! The bucket might already exist. 

**Just run this simpler version:**

```sql
-- Make sure bucket exists and is public
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 5242880 
WHERE id = 'avatars';
```

Or manually:
1. Go to Storage in Supabase Dashboard
2. Check if "avatars" bucket exists
3. If not, create it manually with "Public" checked
4. Set size limit to 5MB

---

**Need more details?** See `IMMEDIATE_ACTION_STEPS.md`
