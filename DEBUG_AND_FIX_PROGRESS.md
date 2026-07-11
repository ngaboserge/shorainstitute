# 🐛 Debug & Fix: Progress Not Showing

## Current Status
- ✅ Lessons show as complete in course view (2 of 2)
- ❌ My Learning page shows 0% progress
- ❌ Course not appearing in "Completed" tab

## Root Cause Investigation

There are TWO possible issues:

### Issue 1: Database Not Updating (Most Likely)
The `updateEnrollmentProgress` function might be failing silently.

### Issue 2: Frontend Not Refreshing
The My Learning page might not be reloading data properly.

---

## SOLUTION 1: Run SQL to Force Update (QUICKEST FIX)

### Step 1: Run This SQL in Supabase

Open Supabase SQL Editor and run:

```sql
-- Check current state
SELECT 
  c.title,
  e.progress_percentage,
  (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id) as total,
  (SELECT COUNT(*) FROM lesson_progress lp 
   WHERE lp.user_id = e.user_id AND lp.course_id = e.course_id AND lp.completed = true) as completed
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND e.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Force update to 100%
UPDATE enrollments
SET 
  progress_percentage = 100,
  completed_at = NOW(),
  last_accessed_at = NOW()
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Verify
SELECT 
  c.title,
  e.progress_percentage,
  e.completed_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';
```

### Step 2: Hard Refresh Browser
Press `Ctrl + Shift + R` to clear cache

### Step 3: Check My Learning Page
- Should now show "2 of 2 lessons • 100% complete"
- Should appear in "Completed" tab (0 → 1)

---

## SOLUTION 2: Debug the Code (IF SQL DIDN'T WORK)

I've added better logging to CourseLesson.jsx. Now when you mark a lesson complete, the console will show:

```
📊 Progress calculation: 2/2 = 100%
🎉 Course completed! Setting completed_at timestamp
✅ Enrollment progress updated: 100% [data...]
```

OR if there's an error:
```
❌ Error updating enrollment: [error message]
```

### Test It:

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. Go to the course lesson page

3. Open browser console (F12)

4. Click "Mark as Complete" on any lesson

5. **Check console output** - what do you see?

---

## Common Issues & Fixes

### Issue A: Console shows "Error updating enrollment"
**Cause:** RLS (Row Level Security) might be blocking updates  
**Fix:** Run this SQL in Supabase:
```sql
-- Disable RLS on enrollments table
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
```

### Issue B: Console shows nothing
**Cause:** Function not being called  
**Fix:** Check if `handleMarkComplete` is calling `updateEnrollmentProgress()`

### Issue C: SQL update works but page doesn't refresh
**Cause:** Browser cache or React not re-rendering  
**Fix:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache completely
3. Try incognito window

### Issue D: Shows 50% instead of 100%
**Cause:** Only 1 of 2 lessons is marked complete  
**Fix:** Mark both lessons as complete

---

## Verification Checklist

Run these checks:

### ✅ Check 1: Are lessons marked complete in database?
```sql
SELECT 
  l.title,
  lp.completed,
  lp.completed_at
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
WHERE lp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND lp.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY l.order_number;
```

**Expected:** Both lessons show `completed = true`

### ✅ Check 2: Is enrollment updated?
```sql
SELECT progress_percentage, completed_at
FROM enrollments
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';
```

**Expected:** `progress_percentage = 100`, `completed_at` has a date

### ✅ Check 3: Does frontend see the data?
1. Go to My Learning page
2. Open DevTools → Network tab
3. Look for request to `/rest/v1/enrollments`
4. Check response → Does it show `progress_percentage: 100`?

---

## Nuclear Option: Full Reset

If nothing works, run this to completely reset and recalculate:

```sql
-- Delete all progress for this course
DELETE FROM lesson_progress
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Reset enrollment
UPDATE enrollments
SET progress_percentage = 0, completed_at = NULL
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Then go mark lessons complete again from UI
```

---

## Quick Fix Commands

### Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### Hard Refresh Browser
```
Ctrl + Shift + R
```

### Clear All Browser Data
1. Press `Ctrl + Shift + Delete`
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"

---

## What to Tell Me

After trying Solution 1 (SQL update), tell me:

1. ✅ Did the SQL run successfully?
2. ✅ What does the verification query show?
3. ✅ After hard refresh, does My Learning show 100%?
4. ❌ If not, what do you see in browser console?
5. ❌ Any error messages?

This will help me pinpoint exactly what's wrong! 🔍
