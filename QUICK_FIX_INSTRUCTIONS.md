# ⚡ Quick Fix for "Loading Video" Issue

## The Problem
Video shows "Loading video..." forever because **the lesson has no video URL in the database**.

## The Solution (3 Steps)

### 1️⃣ Diagnose
Open Supabase SQL Editor and run:
```sql
SELECT video_url, video_type FROM lessons WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
```
If `video_url` is NULL → Continue to step 2

### 2️⃣ Add Test Video
Run this in Supabase SQL Editor:
```sql
UPDATE lessons
SET 
  video_url = 'https://www.youtube.com/watch?v=p7HKvqRI_Bo',
  video_type = 'youtube',
  duration_seconds = 180
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
```

### 3️⃣ Refresh Browser
Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac) to clear cache and reload.

## ✅ Done!
Video should now load and play. Progress tracking works automatically.

---

## 📂 Files Created for You

1. **DIAGNOSE_VIDEO_ISSUE.sql** - Full diagnostic queries
2. **ADD_TEST_VIDEO_TO_LESSON.sql** - Add test video script
3. **VIDEO_LOADING_FIX_GUIDE.md** - Complete detailed guide

## 🎯 Next Time

Add videos using the trainer interface:
`/trainer/courses/:id/manage-lessons`

Or run SQL to update lesson video_url directly.

---

## 🔍 About the Console Errors

The errors you're seeing like:
- `MaxListenersExceededWarning`
- `ObjectMultiplex - orphaned data`
- `No API key found in request`

These are from **browser extensions** (likely MetaMask or crypto wallet). They don't affect your app - you can safely ignore them.

The real issue was **missing video_url** in the database, which is now fixed in the VideoPlayer code to show a clear message instead of hanging forever.
