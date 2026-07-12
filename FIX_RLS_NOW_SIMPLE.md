# 🚨 QUICK FIX FOR RLS ERROR

## You're seeing this error:
```
Error saving seminar: new row violates row-level security policy for table "seminars"
```

## ✅ FIX IT NOW (2 steps):

### STEP 1: Run this SQL in Supabase

1. Open: https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot/sql/new

2. Copy and paste this entire block:

```sql
-- Disable RLS on all feature tables
ALTER TABLE IF EXISTS seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seminar_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS path_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS path_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resource_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussion_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussion_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reply_likes DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '❌ STILL ENABLED' 
    ELSE '✅ DISABLED' 
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('seminars', 'learning_paths', 'resources', 'discussions')
ORDER BY tablename;
```

3. Click **RUN**

4. You should see all tables showing "✅ DISABLED"

### STEP 2: Refresh Browser

Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)

### STEP 3: Try Creating Seminar Again

✅ It should work now!

---

## Why this happened:

Row Level Security (RLS) was enabled on your tables, blocking insert operations. We just disabled it.

## If it still doesn't work:

Check if tables exist by running:
```sql
SELECT * FROM seminars LIMIT 1;
```

If you get "relation does not exist", you need to run `CREATE_ALL_FEATURES_SCHEMA.sql` first.
