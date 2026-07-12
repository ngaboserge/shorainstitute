-- Check what tables currently exist in your database
SELECT 
  tablename as "Table Name",
  schemaname as "Schema"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count total tables
SELECT COUNT(*) as "Total Tables in public schema"
FROM pg_tables
WHERE schemaname = 'public';
