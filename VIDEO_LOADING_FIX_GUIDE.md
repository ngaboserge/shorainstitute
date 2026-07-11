# 🎥 Video Loading Issue - Fix Guide

## Problem
The video player shows "Loading video..." indefinitely. This happens because the lesson in the database **does not have a video URL**.

## Root Cause
The lesson record exists in the database but the `video_url` field is `NULL`. The VideoPlayer component is trying to load a video that doesn't exist.

---

## 🔍 STEP 1: Diagnose the Issue

Run this SQL query in your Supabase dashboard:

```bash
# Copy and paste the contents of DIAGNOSE_VIDEO_ISSUE.sql into Supabase SQL Editor
```

**What to look for:**
- If `video_url` is `NULL` → Video needs to be added (continue to Step 2)
- If `video_url` exists but shows error → Check network tab for 403/404 errors
- If `rowsecurity` is `true` → RLS is enabled (should be `false` for development)

---

## ✅ STEP 2: Add a Test Video

To test the video player functionality, add a YouTube video:

```bash
# Run ADD_TEST_VIDEO_TO_LESSON.sql in Supabase SQL Editor
```

This will add a short educational video about investing (3 minutes) to your lesson.

**After running:**
1. Refresh your browser (Ctrl+R or F5)
2. Clear cache if needed (Ctrl+Shift+Delete)
3. Video should now load and play
4. Progress tracking will work automatically (saves every 5 seconds)

---

## 🎬 STEP 3: Add Your Own Video (Permanent Solution)

### Option A: YouTube Video (Easiest - Free)
1. Upload your video to YouTube (can be unlisted)
2. Get the video URL (e.g., `https://www.youtube.com/watch?v=abc123`)
3. Run this SQL:

```sql
UPDATE lessons
SET 
  video_url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
  video_type = 'youtube',
  duration_seconds = 600,  -- Duration in seconds
  updated_at = NOW()
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
```

### Option B: Direct Upload (Your Own Hosting)
1. Upload video to Supabase Storage (or Cloudflare, Mux, etc.)
2. Get the public URL
3. Run this SQL:

```sql
UPDATE lessons
SET 
  video_url = 'https://your-storage.com/path/to/video.mp4',
  video_type = 'supabase',  -- or 'cloudflare', 'mux', etc.
  duration_seconds = 600,
  updated_at = NOW()
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
```

---

## 🔧 Code Improvements Made

### 1. Better Error Handling
The VideoPlayer now shows a clear message when video is missing:
```
"Video not yet uploaded"
"The trainer needs to add a video to this lesson."
```

### 2. Loading Timeout
Added 15-second timeout so loading state doesn't hang forever. If video doesn't load in 15 seconds, shows error message.

### 3. Better Diagnostics
Added console logging to help debug video loading issues:
- Logs when no video URL found
- Shows lesson data (video_url, video_type, video_id)
- Helps identify the problem quickly

---

## 🚀 Next Steps

1. **Run DIAGNOSE_VIDEO_ISSUE.sql** to confirm video_url is NULL
2. **Run ADD_TEST_VIDEO_TO_LESSON.sql** to add test video
3. **Refresh browser** and test video playback
4. **Add your own videos** using the trainer interface at `/trainer/courses/:id/manage-lessons`

---

## 📝 Notes

- **Progress Tracking**: Automatically saves every 5 seconds
- **Resume Playback**: Resumes from last position if you watched >10 seconds
- **Auto-Complete**: Marks lesson complete at 90% watched
- **Course Progress**: Updates overall course progress automatically

---

## ❓ Still Having Issues?

Check the browser console (F12) for errors. Common issues:

1. **"No API key found"**: Dev server needs restart (`npm run dev`)
2. **Video fails to load**: Check network tab for 403/404 errors
3. **Progress not saving**: Check RLS is disabled on lesson_progress table
4. **Stuck on loading**: Clear browser cache (Ctrl+Shift+Delete)

The console errors you're seeing about "ObjectMultiplex" and "EventEmitter" are from a browser extension (MetaMask or similar) and can be ignored - they don't affect the app.
