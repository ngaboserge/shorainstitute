# 🧪 Testing Guide - Video Player Integration

## ✅ Setup Complete!

You've successfully:
- ✅ Created .env file with Supabase credentials
- ✅ Run the database SQL (8 tables created)
- ✅ Installed required packages
- ✅ Integrated VideoPlayer component into CourseLesson.jsx

---

## 📝 Next Steps

### 1. Load Sample Data (5 minutes)

**Go to Supabase:**
1. Open https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot
2. Click "SQL Editor"
3. Click "New query"
4. Open the file `LOAD_SAMPLE_DATA.sql`
5. Copy ALL the SQL
6. Paste into Supabase
7. Click "Run" ▶️
8. Should see: "Sample data loaded! courses: 1, lessons: 12"

This creates:
- 1 sample course: "Investing Essentials: Grow Your Wealth"
- 12 lessons with YouTube videos

---

### 2. Restart Dev Server

```bash
npm run dev
```

---

### 3. Test the Video Player

**Navigate to a lesson:**

http://localhost:3001/learner/courses/11111111-1111-1111-1111-111111111111/lesson/22222222-2222-2222-2222-222222222221

Or just:
1. Go to http://localhost:3001
2. Navigate to Learner Portal
3. Click "My Learning" or "Courses"
4. Click on the course
5. Click on Lesson 1

---

## 🎯 What to Test

### ✅ Video Playback
- [ ] Video loads and plays
- [ ] Video controls work (play, pause, volume)
- [ ] Video shows correct title

### ✅ Progress Tracking
- [ ] Watch video for 30 seconds
- [ ] Check Supabase: Table Editor → lesson_progress
- [ ] Should see new record with watch_time_seconds
- [ ] Progress saves automatically every 5 seconds

### ✅ Resume Functionality
- [ ] Watch video halfway through
- [ ] Refresh the page
- [ ] Should see "Resuming from X:XX" banner
- [ ] Video should start from last position

### ✅ Lesson Sidebar
- [ ] Lesson list shows all 12 lessons
- [ ] Durations display correctly (MM:SS format)
- [ ] Current lesson highlighted
- [ ] Click different lessons to navigate

### ✅ Course Progress
- [ ] Watch a lesson to 90%+ (auto-completes)
- [ ] Progress bar updates
- [ ] Completed lessons show checkmark
- [ ] Percentage updates correctly

---

## 🔍 Debugging

### Issue: "Lesson not found"
**Cause:** No data in database  
**Fix:** Run LOAD_SAMPLE_DATA.sql

### Issue: Video doesn't load
**Check:**
1. Browser console for errors (F12)
2. Supabase credentials in .env
3. Lesson has valid video_url
4. Internet connection (YouTube needs internet)

### Issue: "Missing Supabase credentials"
**Fix:**
1. Verify .env file exists
2. Check keys are correct
3. Restart dev server

### Issue: Progress not saving
**Check:**
1. Browser console for errors
2. Supabase dashboard for database errors
3. lesson_progress table exists

### Test Connection:
Open browser console (F12) and run:
```javascript
// Test Supabase connection
const { data, error } = await fetch('http://localhost:3001/src/lib/supabase.js')
console.log('Connected:', !error)
```

---

## 📊 Check Database (Supabase Dashboard)

### View Courses:
Go to: Table Editor → courses  
Should see: 1 course

### View Lessons:
Go to: Table Editor → lessons  
Should see: 12 lessons

### View Progress:
Go to: Table Editor → lesson_progress  
Should see: Records appear as you watch videos

---

## 🎉 Success Criteria

You'll know it's working when:

✅ Video loads and plays smoothly  
✅ Lesson list shows 12 lessons  
✅ Progress saves automatically  
✅ Refresh page resumes from last position  
✅ Sidebar shows completion checkmarks  
✅ Course progress percentage updates  
✅ No console errors  

---

## 📍 Test URLs

**Course Page:**
```
http://localhost:3001/learner/courses/11111111-1111-1111-1111-111111111111/lesson/22222222-2222-2222-2222-222222222221
```

**Different Lessons:**
- Lesson 1: `...lesson/22222222-2222-2222-2222-222222222221`
- Lesson 2: `...lesson/22222222-2222-2222-2222-222222222222`
- Lesson 3: `...lesson/22222222-2222-2222-2222-222222222223`
- Lesson 10: `...lesson/22222222-2222-2222-2222-222222222230`

---

## 🐛 Common Errors & Solutions

### Error: "Cannot read property 'id' of null"
**Solution:** Data not loaded. Run LOAD_SAMPLE_DATA.sql

### Error: "Failed to fetch"
**Solution:** Check Supabase URL and API key in .env

### Error: "Video player not rendering"
**Solution:** Check VideoPlayer.jsx and imports

### Error: "CORS error"
**Solution:** Supabase RLS policies might be blocking. Check policies.

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console (F12) for errors
2. Check Supabase dashboard logs
3. Verify .env file has correct credentials
4. Make sure dev server is running
5. Ask me with the specific error message!

---

## 🎯 Next Phase (After Testing)

Once everything works:

1. ✅ **Add Real Video URLs**
   - Replace YouTube IDs with your actual videos
   - Or use the upload modal to upload videos

2. ✅ **Add Authentication**
   - Replace 'temp-user-id' with real auth
   - Implement login/signup

3. ✅ **Build Trainer Interface**
   - Course creation
   - Video upload UI
   - Analytics dashboard

4. ✅ **Add More Features**
   - Certificates
   - Reviews
   - Payments

---

**Ready to test? Load the sample data and start the dev server!** 🚀

Let me know when you see the video player working!
