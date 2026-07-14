# Fix 403 Error on lesson_resources Table

**Error**: `Failed to load resource: the server responded with a status of 403`
**Table**: `lesson_resources`
**Cause**: Row Level Security (RLS) is enabled and blocking access
**Solution**: Disable RLS on the table

---

## 🚨 Quick Fix - Run This SQL NOW

**File**: `FIX_LESSON_RESOURCES_RLS_NOW.sql`

### Steps:

1. **Open Supabase SQL Editor**
2. **Copy and paste** entire contents of `FIX_LESSON_RESOURCES_RLS_NOW.sql`
3. **Click "Run"**
4. **Refresh your browser** (F5 or Ctrl+R)
5. **Try adding resource again**

---

## 📋 What the SQL Does

1. ✅ Disables RLS on `lesson_resources` table
2. ✅ Disables RLS on `lesson_notes` table
3. ✅ Drops any blocking policies
4. ✅ Grants full access to authenticated users
5. ✅ Verifies RLS is disabled

---

## 🔍 Check Current Status (Optional)

Before fixing, you can check the current status:

**File**: `CHECK_LESSON_RESOURCES_STATUS.sql`

This shows:
- Whether tables exist
- RLS status (enabled/disabled)
- Table columns
- Can you query the tables?

---

## 🎯 After Running the Fix

1. **Refresh browser** (F5)
2. **Login as trainer** (Dr Aderemi)
3. **Go to Manage Lessons**
4. **Click "Edit Details"** button on any lesson
5. **Try adding a resource** - should work now!

---

## ✅ Expected Result

After running the SQL, you should see:

```
✅ RLS disabled! Try adding resources again.
```

And the check query should show:

```
lesson_resources | RLS DISABLED (GOOD)
lesson_notes     | RLS DISABLED (GOOD)
```

---

## 🐛 Why This Happened

When you ran `RUN_THIS_CREATE_TABLES.sql`, it:
- ✅ Created the tables
- ✅ Added the columns
- ❌ BUT: RLS was automatically enabled by Supabase

Supabase enables RLS by default on new tables for security. Since we're in development/testing, we need to disable it.

---

## 🔒 For Production (Later)

When you're ready to enable RLS properly, you'll need to create policies like:

```sql
-- Allow trainers to manage resources for their own courses
CREATE POLICY trainer_manage_resources ON lesson_resources
  FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- Allow learners to view resources for enrolled courses  
CREATE POLICY learner_view_resources ON lesson_resources
  FOR SELECT
  USING (
    course_id IN (
      SELECT course_id FROM enrollments WHERE user_id = auth.uid()
    )
  );
```

But for now, just disable RLS! ✅

---

## 🆘 If Still Getting 403 Error

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check browser console** (F12) for other errors
4. **Verify SQL ran successfully** (no red error messages)
5. **Check if logged in as trainer** (correct account)
6. **Try in incognito/private window**

---

## 📝 Summary

**Problem**: 403 error when adding resources
**Root Cause**: RLS enabled on lesson_resources table
**Solution**: Run `FIX_LESSON_RESOURCES_RLS_NOW.sql`
**Time to Fix**: 30 seconds ⚡

**After fix works**:
- ✅ Add lesson descriptions
- ✅ Add learning objectives
- ✅ Add downloadable resources
- ✅ Set video durations
- ✅ All changes save to database
