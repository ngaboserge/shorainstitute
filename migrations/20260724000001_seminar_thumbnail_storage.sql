-- Migration: Setup Supabase Storage for Seminar Thumbnails
-- Created: 2026-07-24

-- Note: This uses the existing 'course-thumbnails' bucket
-- Courses and Seminars share the same storage bucket for simplicity

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Verify 'course-thumbnails' bucket exists (it should already exist)
-- 3. Bucket settings should be:
--    - Name: course-thumbnails
--    - Public: Yes (for public access to thumbnails)
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- If bucket doesn't exist, create it with the above settings

-- Storage policies (should already be configured):

-- Policy 1: Public Read Access (Anyone can view images)
-- Name: Public Read Access
-- Policy: 
-- CREATE POLICY "Public Read Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'course-thumbnails');

-- Policy 2: Authenticated Upload (Logged in users can upload)
-- Name: Authenticated Upload
-- Policy:
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'course-thumbnails' 
--   AND auth.role() = 'authenticated'
-- );

-- Policy 3: Owner Update (Users can update their own uploads)
-- Name: Owner Update
-- Policy:
-- CREATE POLICY "Owner Update"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'course-thumbnails' 
--   AND auth.uid() = owner
-- );

-- Policy 4: Owner Delete (Users can delete their own uploads)
-- Name: Owner Delete
-- Policy:
-- CREATE POLICY "Owner Delete"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'course-thumbnails' 
--   AND auth.uid() = owner
-- );

-- FOLDER STRUCTURE:
-- courses/{filename}   → For course thumbnails
-- seminars/{filename}  → For seminar thumbnails
-- This keeps them organized while using the same bucket

-- VERIFICATION:
-- After setup, verify by uploading a test seminar image through the UI

-- If 'course-thumbnails' bucket already exists from courses, you're all set!
-- Seminars will use the same bucket with 'seminars/' prefix for organization.
