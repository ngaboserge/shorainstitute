-- ULTRA SIMPLE STORAGE POLICY SETUP
-- This version only touches policies, nothing else
-- Run in Supabase SQL Editor

-- Drop any existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public can view resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resource thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resource thumbnails" ON storage.objects;

-- Create simple, permissive policies for development
CREATE POLICY "Authenticated users can upload resource thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Public can view resource thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

CREATE POLICY "Users can update their own resource thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Users can delete their own resource thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');

-- Verify policies were created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%resource%'
ORDER BY policyname;
