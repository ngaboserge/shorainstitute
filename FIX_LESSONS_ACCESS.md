# Fix Lessons Access Issue

## Problem
Learners cannot see course lessons because of RLS (Row Level Security) policies blocking access to the `lessons` table.

**Console logs show:**
```
Lessons fetched for 46190f06-f179-4985-8746-7f6cfe62053b: Array(0)
```

Even though the lesson exists in the database, the query returns empty because the learner user doesn't have permission to read from the `lessons` table.

## Solution
Run the SQL migration to add RLS policies that allow authenticated users to read lessons.

## Steps to Fix

### Option 1: Run via Supabase Dashboard (RECOMMENDED)

1. Go to: https://ydldtedpcnpoeznhgsot.supabase.co/project/_/sql/new
2. Copy and paste the contents of `migrations/20260730000002_fix_lessons_rls.sql`
3. Click "Run" button
4. Refresh your learner portal page - courses should now show lessons

### Option 2: Run via Supabase CLI (if installed)

```bash
supabase db execute -f migrations/20260730000002_fix_lessons_rls.sql
```

## What This Does

The migration adds two RLS policies to the `lessons` table:

1. **"Learners can read all lessons"** - Allows all authenticated users to SELECT lessons
2. **"Trainers can manage their course lessons"** - Allows trainers to INSERT/UPDATE/DELETE lessons for their own courses

This follows the same pattern as other tables in your system where authenticated users can read data.

## Verification

After running the migration, check the browser console again. You should see:

```
Lessons fetched for 46190f06-f179-4985-8746-7f6cfe62053b: Array(1)
Course: Investing in stock market
  - Total lessons: 1
  - Next lesson: {id: "4e77a1e8-51a9-4086-9121-8e06b955bd51", title: "Intro to stock market", ...}
```

And the "Continue Learning" button should now work and navigate to:
```
/learner/courses/46190f06-f179-4985-8746-7f6cfe62053b/lesson/4e77a1e8-51a9-4086-9121-8e06b955bd51
```
