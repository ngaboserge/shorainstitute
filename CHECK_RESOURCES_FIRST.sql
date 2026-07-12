-- CHECK RESOURCES BEFORE DELETING
-- Run this first to see what you have
-- DO NOT DELETE ANYTHING YET

-- 1. Show all resources with their creator info
SELECT 
  r.id,
  r.title,
  r.resource_type,
  r.created_by,
  r.author_name,
  r.is_public,
  r.created_at,
  u.email as creator_email
FROM resources r
LEFT JOIN auth.users u ON r.created_by = u.id
ORDER BY r.created_at DESC;

-- 2. Count resources by creator
SELECT 
  created_by,
  COUNT(*) as resource_count,
  MAX(created_at) as latest_resource
FROM resources
GROUP BY created_by
ORDER BY latest_resource DESC;

-- 3. Show which resources have real creator accounts vs orphaned
SELECT 
  CASE 
    WHEN u.id IS NULL THEN 'Mock Data (No User)'
    ELSE 'Real User'
  END as status,
  COUNT(*) as count
FROM resources r
LEFT JOIN auth.users u ON r.created_by = u.id
GROUP BY status;

-- 4. Show your real trainer resources
SELECT 
  id,
  title,
  resource_type,
  file_format,
  created_at
FROM resources
WHERE created_by IN (
  '84c39889-964d-416b-a0c1-42e26d05eb3e',  -- ngabosergetrainer@gmail.com
  '70eda192-c766-42bd-93a2-2ec7132ffdea'   -- test trainer
)
ORDER BY created_at DESC;
