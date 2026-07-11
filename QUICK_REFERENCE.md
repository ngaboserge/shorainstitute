# 🚀 SHORA Institute - Quick Reference Guide

## 📍 Important URLs

### Development
- **Local App:** http://localhost:3001
- **Supabase Dashboard:** https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot

### Authentication Pages
- **Learner Login:** `/auth/learner/login`
- **Learner Signup:** `/auth/learner/signup`
- **Trainer Login:** `/auth/trainer/login`
- **Trainer Signup:** `/auth/trainer/signup`

### Trainer Portal
- **Dashboard:** `/trainer/dashboard`
- **Courses:** `/trainer/courses`
- **Create Course:** `/trainer/create-course`
- **Manage Lessons:** `/trainer/courses/{courseId}/manage-lessons`
- **Profile:** `/trainer/profile`
- **Analytics:** `/trainer/analytics`

### Learner Portal
- **Dashboard:** `/learner/dashboard`
- **My Courses:** `/learner/courses`
- **Browse Courses:** `/learner/browse-courses`
- **Course Lesson:** `/learner/courses/{courseId}/lesson/{lessonId}`
- **Profile:** `/learner/profile`
- **Certificates:** `/learner/certificates`

---

## 🔑 Test Accounts

### Trainer Account
- **Email:** ngabosergetrainer@gmail.com
- **Password:** [Your password]
- **User ID:** 84c39889-964d-416b-a0c1-42e26d05eb3e
- **Role:** trainer

### Learner Account
- **Email:** ngabosergelearner@gmail.com
- **Password:** [Your password]
- **User ID:** 980019d0-b02a-40a6-b782-d7bf1227b290
- **Role:** learner

---

## 💻 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Git commands
git status
git add .
git commit -m "Your message"
git push
```

---

## 🗄️ Database Quick Access

### Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot/sql

### Common Queries

**View all courses:**
```sql
SELECT * FROM courses ORDER BY created_at DESC;
```

**View all lessons for a course:**
```sql
SELECT * FROM lessons 
WHERE course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42' 
ORDER BY order_number;
```

**View enrollments for a learner:**
```sql
SELECT e.*, c.title 
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';
```

**Check lesson progress:**
```sql
SELECT * FROM lesson_progress 
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';
```

**Fix lesson status (if needed):**
```sql
UPDATE lessons SET status = 'draft' WHERE status IS NULL;
```

---

## 🎬 Video URLs for Testing

### Working YouTube Videos (No Embedding Restrictions)

**Khan Academy Financial Literacy:**
```
https://www.youtube.com/watch?v=WEDIj9JBTC8
```

**Rick Astley - Never Gonna Give You Up (Test Video):**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Add Video to Lesson via SQL
```sql
UPDATE lessons 
SET 
  video_url = 'https://www.youtube.com/watch?v=WEDIj9JBTC8',
  video_type = 'youtube',
  duration_seconds = 600
WHERE id = 'YOUR_LESSON_ID';
```

---

## 🔧 Common Troubleshooting

### "Missing Supabase credentials" Error
**Problem:** Environment variables not loaded
**Solution:** 
1. Check `.env` file exists in project root
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

### White Page on Deployed Site
**Problem:** Environment variables not set on hosting platform
**Solution:** Add to your hosting platform (Vercel/Netlify):
- `VITE_SUPABASE_URL` = `https://ydldtedpcnpoeznhgsot.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `[Your anon key from .env]`

### Video Not Displaying
**Problem:** YouTube embedding restrictions or browser cache
**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Check video URL allows embedding
3. Try test video: `dQw4w9WgXcQ`

### Can't Publish Lesson
**Problem:** Lesson doesn't have a video
**Solution:** Add a video first, then publish button will appear

### Login Issues / Role Mismatch
**Problem:** Trying to access wrong portal
**Solution:** 
- Logout completely
- Login with correct role account
- Check "Access Denied" page for current role

### Database Changes Not Showing
**Problem:** Browser cache or React state not updated
**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache
3. Check database directly in Supabase dashboard

---

## 📦 Project Structure

```
shora_institute/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── VideoPlayer.jsx
│   │   └── UploadVideoModal.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── lib/               # Utilities
│   │   └── supabase.js
│   ├── pages/             # All pages
│   │   ├── auth/          # Login/Signup pages
│   │   ├── learner/       # Learner portal
│   │   ├── trainer/       # Trainer portal
│   │   └── HomePage.jsx
│   ├── App.jsx            # Main app with routes
│   └── main.jsx           # Entry point
├── .env                   # Environment variables (NOT in git)
├── .env.example           # Example env file
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

---

## 🎨 Color Palette

```css
--primary-blue: #0B4F9F
--accent-yellow: #FDB714
--success-green: #4caf50
--error-red: #ef4444
--neutral-gray: #6b7280
--bg-light: #f9fafb
--border-gray: #e5e7eb
```

---

## 🚨 Important Notes

### Security (Current: Development Mode)
⚠️ **RLS is DISABLED** for development
- All users can see all data
- **DO NOT use in production without enabling RLS**

### Before Production:
1. Enable RLS on all tables
2. Create proper access policies
3. Add input validation
4. Enable HTTPS only
5. Set up error monitoring

### Database Backups
- Supabase auto-backups daily
- Manual backup: Dashboard → Database → Backups
- Export SQL: Dashboard → SQL Editor → Export

---

## 📚 File Reference

### Key Configuration Files
- `.env` - Environment variables (local only)
- `package.json` - Dependencies and scripts
- `vite.config.js` - Build configuration
- `.gitignore` - Files excluded from git

### Key Component Files
- `AuthContext.jsx` - Authentication state management
- `supabase.js` - Database client configuration
- `ProtectedRoute.jsx` - Route access control
- `VideoPlayer.jsx` - Video playback with progress

### SQL Helper Files (in root)
- `AUTH_SETUP.sql` - Initial auth setup
- `FIX_LESSON_STATUS.sql` - Fix lesson statuses
- `UPDATE_VIDEO_URL.sql` - Update video URLs
- `CHECK_LESSON_STATUS.sql` - Verify lesson data

---

## 🎯 Quick Actions

### Add a New Lesson (Manual via SQL)
```sql
INSERT INTO lessons (
  course_id, 
  title, 
  description,
  order_number,
  video_url,
  video_type,
  duration_seconds,
  status
) VALUES (
  'YOUR_COURSE_ID',
  'Lesson Title',
  'Lesson Description',
  1,
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'youtube',
  600,
  'draft'
);
```

### Create Test Enrollment
```sql
INSERT INTO enrollments (
  user_id,
  course_id,
  payment_status,
  enrolled_at
) VALUES (
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  'YOUR_COURSE_ID',
  'free',
  NOW()
);
```

### Reset User Progress
```sql
DELETE FROM lesson_progress 
WHERE user_id = 'YOUR_USER_ID';

UPDATE enrollments 
SET completion_percentage = 0, last_accessed_at = NULL
WHERE user_id = 'YOUR_USER_ID';
```

---

## 🔍 Debugging Tips

### Check Auth State
Open browser console (F12) and type:
```javascript
// Check current user
const { data } = await supabase.auth.getUser()
console.log(data)

// Check session
const { data: session } = await supabase.auth.getSession()
console.log(session)
```

### Check Database Connection
```javascript
// Test query
const { data, error } = await supabase.from('courses').select('*').limit(1)
console.log(data, error)
```

### View React Component State
Install React DevTools browser extension, then:
1. Open DevTools (F12)
2. Click "Components" tab
3. Select component to inspect state

---

## 📞 Support Resources

**Supabase Docs:** https://supabase.com/docs
**React Docs:** https://react.dev
**Vite Docs:** https://vitejs.dev
**React Router:** https://reactrouter.com

**Your Project GitHub:** https://github.com/ngaboserge/shorainstitute

---

*Keep this file handy for quick reference!*
