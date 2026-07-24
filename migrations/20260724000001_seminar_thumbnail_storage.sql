-- Migration: Setup Supabase Storage for Seminar Thumbnails
-- Created: 2026-07-24

-- Note: This is a reference guide for setting up storage in Supabase Dashboard
-- Storage buckets must be created through the Supabase Dashboard UI

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Check if 'course-assets' bucket exists
-- 3. If not, create it with these settings:
--    - Name: course-assets
--    - Public: Yes (for public access to thumbnails)
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- ALTERNATIVE: If you prefer a separate bucket for seminars:
-- Create a new bucket called 'seminar-assets' with same settings

-- Storage policies (to be added in Supabase Dashboard → Storage → Policies):

-- Policy 1: Public Read Access (Anyone can view images)
-- Name: Public Read Access
-- Policy: 
-- CREATE POLICY "Public Read Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'course-assets');

-- Policy 2: Authenticated Upload (Logged in users can upload)
-- Name: Authenticated Upload
-- Policy:
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'course-assets' 
--   AND auth.role() = 'authenticated'
-- );

-- Policy 3: Owner Update (Users can update their own uploads)
-- Name: Owner Update
-- Policy:
-- CREATE POLICY "Owner Update"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'course-assets' 
--   AND auth.uid() = owner
-- );

-- Policy 4: Owner Delete (Users can delete their own uploads)
-- Name: Owner Delete
-- Policy:
-- CREATE POLICY "Owner Delete"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'course-assets' 
--   AND auth.uid() = owner
-- );

-- VERIFICATION:
-- After setup, verify by uploading a test image through the UI

-- If using existing 'course-assets' bucket, no action needed!
-- The bucket should already exist from course thumbnails feature.
