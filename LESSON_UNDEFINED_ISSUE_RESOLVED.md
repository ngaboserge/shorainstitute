# Lesson Undefined Issue - RESOLVED

## Issue Summary
When learners clicked on assigned courses, they were navigating to `/lesson/undefined` and seeing "No course available" message.

## Root Cause
**RLS (Row Level Security) blocking learner access to the `lessons` table.**

The debug logs revealed:
```javascript
Lessons fetched for 46190f06-f179-4985-8746-7f6cfe62053b: Array(0)
  - Total lessons: 0
  - Next lesson: undefined
```

Even though the lesson exists in the database (verified via SQL), the Supabase query was returning an empty array because the authenticated learner user didn't have permission to SELECT from the `lessons` table.

## Investigation Steps Taken

1. **Added debug logging** to `Courses.jsx` to trace the data flow
2. **Verified data exists** in database using SQL queries
3. **Identified RLS issue** when lessons query returned empty array for authenticated user
4. **Created RLS policies** to grant proper access

## Solution

### Migration Created: `20260730000002_fix_lessons_rls.sql`

This migration adds RLS policies to allow:
- **All authenticated users** to read lessons (SELECT)
- **Trainers** to manage lessons for their own courses (ALL operations)

### Files Changed

1. **src/pages/learner/Courses.jsx**
   - Added extensive debug logging to trace lesson loading
   - Added validation to check if `nextLesson?.id` exists before creating links
   - Shows "No Lessons Available" button when no lessons found

2. **src/pages/learner/Dashboard.jsx**
   - Added same validation for the "Continue Learning" button
   - Prevents navigation to `/lesson/undefined`

3. **migrations/20260730000002_fix_lessons_rls.sql** (NEW)
   - Fixes RLS policies on `lessons` table
   - **MUST BE RUN** for the fix to work

## How to Apply the Fix

### Step 1: Run the Migration

Go to Supabase SQL Editor:
https://ydldtedpcnpoeznhgsot.supabase.co/project/_/sql/new

Copy and paste the contents of `migrations/20260730000002_fix_lessons_rls.sql` and click "Run".

### Step 2: Verify

1. Refresh the learner portal
2. Open browser console (F12)
3. Navigate to "My Learning" → "In Progress" tab
4. You should see:
   ```
   Lessons fetched for 46190f06-...: Array(1)
     - Total lessons: 1
     - Next lesson: {id: "4e77a1e8-...", title: "Intro to stock market"}
   ```
5. Click "Continue Learning" button
6. Should navigate to: `/learner/courses/.../lesson/4e77a1e8-51a9-4086-9121-8e06b955bd51`

## Why This Happened

The `lessons` table had RLS enabled but no policies defined that would allow learners (regular authenticated users) to read lesson data. This is a common issue when:
- RLS is enabled on a table for security
- Policies are defined for specific roles (admin, trainer)
- But no policy exists for regular authenticated users to read public data

## Related Files

- `FIX_LESSONS_ACCESS.md` - Quick guide to apply the fix
- `DEBUG_LEARNER_ENROLLMENT.sql` - SQL queries to verify enrollment data
- `CHECK_LESSONS_FOR_COURSE.sql` - SQL to verify lessons exist

## Testing Checklist

After running the migration, verify these work:

- [ ] Learner can see courses with lessons in "My Learning"
- [ ] "Continue Learning" button shows correct next lesson title
- [ ] Clicking "Continue Learning" navigates to correct lesson URL
- [ ] Dashboard "Continue Where You Left Off" card works
- [ ] Institutional assignments show correct lesson information
- [ ] Code-redeemed courses show lessons properly

## Prevention

For future tables that learners need to read from, always add an RLS policy like:

```sql
CREATE POLICY "Authenticated users can read [table_name]"
ON [table_name]
FOR SELECT
TO authenticated
USING (true);
```

This allows all authenticated users to read the data while still maintaining security through RLS.
