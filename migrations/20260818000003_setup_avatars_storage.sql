-- ============================================================
-- Setup Storage Bucket for Trainer Profile Photos
-- Creates 'avatars' bucket with public access
-- ============================================================

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket so images are accessible
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Set up storage policies for the avatars bucket
-- Policy 1: Anyone can view/download avatars (public read)
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can upload avatars
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy 3: Users can update their own avatars
CREATE POLICY IF NOT EXISTS "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Users can delete their own avatars
CREATE POLICY IF NOT EXISTS "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Alternative: Allow trainers to manage trainer folder
CREATE POLICY IF NOT EXISTS "Trainers can manage trainer photos"
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

COMMENT ON TABLE storage.buckets IS 'Storage buckets including avatars for user profile photos';
