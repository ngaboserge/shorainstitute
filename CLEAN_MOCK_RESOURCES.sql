-- Clean up mock resources and keep only real trainer-created resources
-- Run this in Supabase SQL Editor

-- First, let's see what resources exist
SELECT id, title, created_by, author_name, created_at 
FROM resources 
ORDER BY created_at DESC;

-- Keep only resources created by your actual trainer accounts
-- Delete all mock/test data
-- This will keep only resources created by real users (with created_by matching auth.users)

DELETE FROM resources
WHERE created_by NOT IN (
  SELECT id FROM auth.users
);

-- OR if you want to be more specific, delete everything EXCEPT resources 
-- created by your known trainer accounts:
-- Uncomment and run this instead:

/*
DELETE FROM resources
WHERE created_by NOT IN (
  '84c39889-964d-416b-a0c1-42e26d05eb3e',  -- ngabosergetrainer@gmail.com
  '70eda192-c766-42bd-93a2-2ec7132ffdea'   -- Your test trainer
);
*/

-- Verify what's left
SELECT id, title, resource_type, created_by, author_name, is_public, created_at 
FROM resources 
ORDER BY created_at DESC;

-- Reset download counts for remaining resources
UPDATE resources SET download_count = 0;

-- Clean up any saved_resources entries that reference deleted resources
DELETE FROM saved_resources
WHERE resource_id NOT IN (SELECT id FROM resources);

-- Clean up any resource_downloads entries that reference deleted resources
DELETE FROM resource_downloads
WHERE resource_id NOT IN (SELECT id FROM resources);
