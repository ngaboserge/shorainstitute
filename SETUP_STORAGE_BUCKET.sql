-- Create Storage Bucket for Resource Thumbnails
-- Run this in Supabase SQL Editor

-- 1. Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload resource thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all files
CREATE POLICY "Public can view resource thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow users to update their own files
CREATE POLICY "Users can update their own resource thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own resource thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO public;
GRANT SELECT ON storage.objects TO public;
