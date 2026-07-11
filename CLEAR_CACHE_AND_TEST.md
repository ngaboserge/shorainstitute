# 🔄 Clear Cache and Test Video

## Your Lesson Has a Video URL ✅
```
Video URL: https://www.youtube.com/watch?v=0laavBo25ew
Video Type: youtube
Video ID: 0laavBo25ew
```

The problem is likely **browser cache** - your browser is loading the old VideoPlayer code.

---

## 🚀 Steps to Fix

### 1. Update Duration (Optional but Recommended)
Run this in Supabase SQL Editor:
```sql
UPDATE lessons
SET duration_seconds = 360
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
```

### 2. Clear Browser Cache and Reload

**Option A: Hard Refresh (Try First)**
- Windows: Press **Ctrl + Shift + R**
- Mac: Press **Cmd + Shift + R**

**Option B: Clear Cache Completely**
1. Press **Ctrl + Shift + Delete** (or Cmd + Shift + Delete)
2. Select "Cached images and files"
3. Click "Clear data"
4. Close browser completely
5. Reopen and go to: `http://localhost:3001/learner/courses/14c9399b-d8b1-47ea-8023-e3867a50cb42/lesson/cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415`

### 3. Check Browser Console

Press **F12** to open DevTools, go to Console tab. You should see:
```
🎥 VideoPlayer render
- Lesson: 1. Understand Money Management
- Video URL: https://www.youtube.com/watch?v=0laavBo25ew
- Video Type: youtube
- Loading: true

✅ Video ready! Duration: 360
```

If you see these messages, the video player is working!

---

## 🔍 If Still Not Working

### Check These:

1. **Dev Server Running?**
   - Should show: `Local: http://localhost:3001/`
   - If not, run: `npm run dev`

2. **Console Shows Errors?**
   - Look for RED errors (ignore yellow warnings from extensions)
   - Share any errors that mention "video", "ReactPlayer", or "supabase"

3. **Network Tab Check**
   - Press F12 → Network tab
   - Refresh page
   - Look for failed requests (red) to YouTube or Supabase
   - Check if YouTube is blocked by firewall/network

4. **Try Different Video**
   ```sql
   UPDATE lessons
   SET video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
   WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';
   ```

---

## ✅ What Should Happen

After clearing cache:
1. Page loads
2. Video player shows
3. YouTube video loads
4. You can play the video
5. Progress saves every 5 seconds
6. Console shows the debug logs

---

## 📝 What I Changed

1. Added detailed console logging to VideoPlayer
2. Added 15-second timeout for loading state
3. Better error messages when video is missing
4. Dev server is now running on port 3001

The code is ready - you just need to clear the browser cache so it loads the new code!
