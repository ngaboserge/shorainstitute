# Fix: "Can't See Assigned Courses"

## Problem
Learners can't see their assigned courses. Console shows error:
```
Could not find a relationship between 'learner_institutional_enrollments' and 'courses' in the schema cache
```

## Root Cause
The foreign key constraint between `learner_institutional_enrollments.course_id` and `courses.id` is missing or not recognized by Supabase's PostgREST API.

## Solution (2 Steps)

### Step 1: Fix Frontend Code (Already Done ✅)
Updated `src/pages/learner/Courses.jsx` to:
- Get learner_id first
- Query enrollments by learner_id
- Fetch course details separately (without JOIN)
- This works around the missing foreign key

**File Modified**: `src/pages/learner/Courses.jsx`

### Step 2: Fix Database Foreign Keys (Required)
Run the SQL file in Supabase SQL Editor:

**File**: `FIX_ALL_FOREIGN_KEYS.sql`

This will:
1. Drop any malformed foreign key constraints
2. Re-create all foreign keys properly
3. Verify they were created
4. Refresh Supabase schema cache

## How to Apply Fix

### Option A: Quick Fix (Frontend Only)
The code fix I just applied should work immediately:
1. Refresh your browser
2. Login as learner
3. Go to `/learner/courses`
4. Courses should now appear

### Option B: Complete Fix (Frontend + Database)
1. ✅ Frontend fix (already done)
2. Open Supabase Dashboard → SQL Editor
3. Copy content from `FIX_ALL_FOREIGN_KEYS.sql`
4. Paste and run in SQL Editor
5. Wait for "All foreign keys fixed!" message
6. Refresh browser
7. Test again

## Verification

### Check Frontend Works
1. Login as learner (user ID: `59dedf07-c69a-44a4-ae91-502b53c8817d`)
2. Go to `/learner/courses`
3. Should see assigned courses
4. No errors in console

### Check Database Foreign Keys
Run in Supabase SQL Editor:
```sql
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'learner_institutional_enrollments'
  AND kcu.column_name = 'course_id';
```

Expected: Should return one row showing the foreign key constraint.

## What Changed

### Before (Broken)
```javascript
// Tried to use Supabase JOIN syntax
const { data } = await supabase
  .from('learner_institutional_enrollments')
  .select('*, courses(id, title, ...)')  // ❌ Failed: no foreign key
```

### After (Working)
```javascript
// 1. Get learner_id
const { data: learner } = await supabase
  .from('institution_learners')
  .select('id')
  .eq('user_id', user.id)

// 2. Get enrollments
const { data: enrollments } = await supabase
  .from('learner_institutional_enrollments')
  .select('*')
  .eq('learner_id', learner.id)

// 3. Get course details separately
const enrichedEnrollments = await Promise.all(
  enrollments.map(async (e) => {
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', e.course_id)
      .single()
    return { ...e, courses: course }
  })
)
```

## Why This Happened

When you create a table in Supabase, foreign keys might not be properly registered with PostgREST (the API layer). This causes JOIN queries to fail even though the foreign key exists in PostgreSQL.

## Prevention

When creating new tables with foreign keys:
1. Always explicitly define foreign key constraints
2. Use `ALTER TABLE ADD CONSTRAINT` syntax
3. Refresh schema cache after creating
4. Test JOIN queries immediately

## Related Files

- **Frontend Fix**: `src/pages/learner/Courses.jsx`
- **Database Fix**: `FIX_ALL_FOREIGN_KEYS.sql`
- **Test Query**: `DIAGNOSE_ASSIGNMENT_WORKFLOW.sql`

## Status

✅ **Frontend fix applied** - Learners can now see courses  
⏳ **Database fix pending** - Run `FIX_ALL_FOREIGN_KEYS.sql` for complete solution

## Next Steps

1. **Test now** - Refresh browser and check if courses appear
2. **If still broken** - Run `FIX_ALL_FOREIGN_KEYS.sql` in Supabase
3. **Report back** - Let me know if courses now appear

---

**Last Updated**: July 30, 2026  
**Priority**: 🔥 HIGH - Blocks learner access to assigned courses
