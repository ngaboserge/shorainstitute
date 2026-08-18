# ⚡ RUN THIS NOW - Copy & Paste These 2 Queries

## Query 1: Add Profile Fields
**Copy this entire block and run in Supabase SQL Editor:**

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

✅ Should see "Success" with no errors

---

## Query 2: Setup Storage Bucket
**Copy this entire block and run in Supabase SQL Editor:**

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

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

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

✅ Should see "Success" with no errors

---

## 🎉 DONE! Now:

1. **Deploy code to production** (already in GitHub)
2. **Login as trainer** → Profile → Edit Profile
3. **Upload photo** and fill in all fields
4. **Visit homepage** → See featured course with trainer profile!

---

## 🐛 If You Get Errors

### "Policies already exist"
That's fine! The DROP POLICY lines will handle it. Just run it again.

### "Bucket already exists"
Good! The ON CONFLICT will update it. You're all set.

### "Public Access policy already exists"
Drop all policies manually in Supabase Dashboard → Storage → Policies, then run Query 2 again.

---

**EVERYTHING IS READY TO GO! 🚀**
