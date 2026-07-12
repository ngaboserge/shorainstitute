-- SAFE DELETION OF MOCK RESOURCES
-- This keeps only resources created by real authenticated users
-- Run AFTER reviewing CHECK_RESOURCES_FIRST.sql output

-- Step 1: Delete related data first (to avoid foreign key issues)

-- Delete saved_resources for mock resources
DELETE FROM saved_resources
WHERE resource_id IN (
  SELECT r.id 
  FROM resources r
  LEFT JOIN auth.users u ON r.created_by = u.id
  WHERE u.id IS NULL
);

-- Delete resource_downloads for mock resources
DELETE FROM resource_downloads
WHERE resource_id IN (
  SELECT r.id 
  FROM resources r
  LEFT JOIN auth.users u ON r.created_by = u.id
  WHERE u.id IS NULL
);

-- Step 2: Delete mock resources (resources with no matching user in auth.users)
DELETE FROM resources
WHERE id IN (
  SELECT r.id 
  FROM resources r
  LEFT JOIN auth.users u ON r.created_by = u.id
  WHERE u.id IS NULL
);

-- Step 3: Verify what's left
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.author_name,
  u.email as creator_email,
  r.created_at
FROM resources r
LEFT JOIN auth.users u ON r.created_by = u.id
ORDER BY r.created_at DESC;

-- Step 4: Show count
SELECT COUNT(*) as remaining_resources FROM resources;
