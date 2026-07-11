# 🔧 FIX RLS ERROR - STEP BY STEP

## Current Problem
You're getting: `new row violates row-level security policy for table "assessments"`

Even though the setup says it completed, RLS is still blocking inserts.

## SOLUTION - Follow These Steps:

### Step 1: Check Current RLS Status
1. Open Supabase SQL Editor
2. Copy and run: `CHECK_RLS_STATUS.sql`
3. Look at the output - it will tell you if RLS is enabled or disabled

### Step 2: Force Disable RLS
1. Copy and run: `FORCE_DISABLE_RLS_ASSESSMENTS.sql`
2. This will:
   - Drop any existing RLS policies
   - Force disable RLS on all assessment tables
   - Verify it worked

### Step 3: Verify It Worked
Run this quick check:
```sql
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '❌ STILL ENABLED'
    ELSE '✅ DISABLED'
  END as rls_status
FROM pg_tables
WHERE tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers');
```

You should see ALL tables showing "✅ DISABLED"

### Step 4: Alternative - Use Supabase Dashboard
If SQL doesn't work, try the UI:

1. Go to Supabase Dashboard
2. Click "Database" → "Tables" (left sidebar)
3. For EACH table (`assessments`, `assessment_questions`, etc):
   - Click on the table name
   - Click "RLS" tab at the top
   - If RLS is enabled, click "Disable RLS" button
   - Confirm the action

### Step 5: Test Again
1. Go back to trainer portal
2. Navigate to: Course → Manage Assessments
3. Click "Create Assessment"
4. Fill in the form
5. Click "Create & Add Questions"

It should work now!

## Why This Happens
Supabase sometimes auto-enables RLS on new tables, even if you disable it in the CREATE TABLE script. The `FORCE_DISABLE_RLS_ASSESSMENTS.sql` explicitly disables it.

## Last Resort
If NOTHING works, you can manually run this in SQL Editor:
```sql
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers DISABLE ROW LEVEL SECURITY;
```

Then try creating the quiz again.
