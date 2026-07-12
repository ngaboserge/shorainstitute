-- DELETE SPECIFIC MOCK RESOURCES
-- This keeps your 2 real resources and deletes the 13 mock ones
-- Run in Supabase SQL Editor

-- Step 1: Show what will be kept (your real resources)
SELECT id, title, resource_type, created_at
FROM resources
WHERE id IN (
  'e3a16203-6d03-4365-b3f7-f5c9e8d7e6f1',  -- Financial Literacy
  'bbd23001-5402-4136-8fc1-eb1e5cce4698'   -- How to live on a 1$ per day
);

-- Step 2: Show what will be deleted (13 mock resources)
SELECT id, title, resource_type, created_at
FROM resources
WHERE id NOT IN (
  'e3a16203-6d03-4365-b3f7-f5c9e8d7e6f1',  -- Financial Literacy (KEEP)
  'bbd23001-5402-4136-8fc1-eb1e5cce4698'   -- How to live on a 1$ per day (KEEP)
);

-- Step 3: Delete related data first (saved_resources, downloads)
DELETE FROM saved_resources
WHERE resource_id NOT IN (
  'e3a16203-6d03-4365-b3f7-f5c9e8d7e6f1',
  'bbd23001-5402-4136-8fc1-eb1e5cce4698'
);

DELETE FROM resource_downloads
WHERE resource_id NOT IN (
  'e3a16203-6d03-4365-b3f7-f5c9e8d7e6f1',
  'bbd23001-5402-4136-8fc1-eb1e5cce4698'
);

-- Step 4: Delete the 13 mock resources
DELETE FROM resources
WHERE id NOT IN (
  'e3a16203-6d03-4365-b3f7-f5c9e8d7e6f1',  -- Financial Literacy (KEEP)
  'bbd23001-5402-4136-8fc1-eb1e5cce4698'   -- How to live on a 1$ per day (KEEP)
);

-- Step 5: Verify only your 2 resources remain
SELECT id, title, resource_type, file_format, is_public, created_at
FROM resources
ORDER BY created_at DESC;

-- Step 6: Count remaining resources (should be 2)
SELECT COUNT(*) as remaining_resources FROM resources;
