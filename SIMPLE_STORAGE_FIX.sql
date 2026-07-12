-- SIMPLE STORAGE FIX - Run this in Supabase SQL Editor
-- This only creates/updates policies, no table modifications

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public can view resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resource thumbnails" ON storage.objects;

-- 3. Create permissive policies (DEVELOPMENT MODE)
-- Allow ANY authenticated user to upload to resources bucket
CREATE POLICY "Authenticated users can upload resource thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow everyone (public) to view files
CREATE POLICY "Public can view resource thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow ANY authenticated user to update files in resources bucket
CREATE POLICY "Users can update their own resource thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources');

-- Allow ANY authenticated user to delete files in resources bucket
CREATE POLICY "Users can delete their own resource thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');
