# 🔧 Quick Command Reference

## 📦 Package Installation

```bash
# Install required packages
npm install @supabase/supabase-js react-player

# If you get errors, try:
npm install --force
```

---

## 🚀 Development Server

```bash
# Start dev server
npm run dev

# Stop server
Ctrl + C

# Build for production
npm run build

# Preview production build
npm preview
```

---

## 🗄️ Supabase SQL Queries

### Verify Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check Sample Data
```sql
-- Count records in each table
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'lesson_progress', COUNT(*) FROM lesson_progress;
```

### View Course Data
```sql
-- See all courses
SELECT id, title, instructor_name, status, total_lessons 
FROM courses;

-- See all lessons for a course
SELECT order_number, title, duration_seconds, video_type, status
FROM lessons 
WHERE course_id = 'YOUR_COURSE_ID'
ORDER BY order_number;
```

### Check Progress Tracking
```sql
-- See all lesson progress
SELECT 
  lp.watch_time_seconds,
  lp.last_position_seconds,
  lp.completed,
  l.title as lesson_title,
  c.title as course_title
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
JOIN courses c ON c.id = lp.course_id
WHERE lp.user_id = 'YOUR_USER_ID';
```

### View User Enrollments
```sql
-- See user's enrolled courses and progress
SELECT 
  c.title,
  e.progress_percentage,
  e.enrolled_at,
  e.completed_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = 'YOUR_USER_ID';
```

---

## 🧪 Testing Connection (Browser Console)

```javascript
// Test Supabase connection
import { supabase } from './src/lib/supabase'

// Check connection
const { data, error } = await supabase
  .from('users')
  .select('count')

console.log('Connected!', data, error)

// Get all courses
const { data: courses } = await supabase
  .from('courses')
  .select('*')
  
console.log('Courses:', courses)

// Get lessons for a course
const { data: lessons } = await supabase
  .from('lessons')
  .select('*')
  .eq('course_id', 'COURSE_ID')
  .order('order_number')
  
console.log('Lessons:', lessons)
```

---

## 🔍 Debugging Commands

### Check if packages are installed
```bash
npm list @supabase/supabase-js
npm list react-player
```

### Clear node_modules and reinstall
```bash
# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Delete package-lock
Remove-Item package-lock.json

# Reinstall everything
npm install
```

### Check environment variables
```bash
# Check if .env exists
Test-Path .env

# View .env content (be careful - contains secrets!)
Get-Content .env
```

---

## 📊 Useful Git Commands

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Add backend implementation"

# Push to GitHub
git push origin main

# Create new branch
git checkout -b feature/backend-integration
```

---

## 🗂️ File Navigation

```bash
# List all markdown files
Get-ChildItem -Filter "*.md" | Select-Object Name

# List all documentation files
Get-ChildItem -Filter "*BACKEND*", "*SETUP*", "*START*" | Select-Object Name

# Find a specific file
Get-ChildItem -Recurse -Filter "VideoPlayer.jsx"

# Check file size
Get-ChildItem "BACKEND_SETUP_GUIDE.md" | Select-Object Name, Length
```

---

## 🔐 Security Commands

```bash
# Verify .env is in .gitignore
Get-Content .gitignore | Select-String ".env"

# Check what would be committed (should NOT include .env)
git status
git diff --cached
```

---

## 📦 Database Backup Commands (Supabase CLI)

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Backup database
supabase db dump -f backup.sql

# Restore from backup
supabase db reset
```

---

## 🧹 Cleanup Commands

```bash
# Remove all markdown files created (if you want to start over)
Remove-Item "*BACKEND*.md", "*SETUP*.md", "*START*.md", "QUICK_START.md", "TODO_CHECKLIST.md", "INTEGRATION_GUIDE.md"

# Remove backend components (if you want to start over)
Remove-Item -Recurse src/lib, src/components/VideoPlayer*, src/components/UploadVideoModal*

# Clear Supabase tables (run in SQL Editor)
TRUNCATE users, courses, lessons, enrollments, lesson_progress, video_uploads, course_reviews, certificates CASCADE;
```

---

## 🎯 Quick Setup Commands (All in One)

```bash
# Complete setup in one go (after Supabase account creation)
# 1. Install packages
npm install @supabase/supabase-js react-player

# 2. Create .env file (then manually add keys)
New-Item .env

# 3. Restart server
npm run dev
```

---

## 📝 Notes

- Replace `YOUR_USER_ID`, `YOUR_COURSE_ID`, etc. with actual IDs from your database
- All SQL queries should be run in Supabase SQL Editor
- JavaScript tests should be run in browser console (F12)
- PowerShell commands for Windows (use bash equivalents on Mac/Linux)

---

## 🆘 Common Issues & Fixes

### Issue: "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### Issue: "Missing Supabase credentials"
```bash
# Check .env file exists and has correct keys
Get-Content .env

# Restart dev server
npm run dev
```

### Issue: Port 3000 already in use
```bash
# Dev server should use 3001 (check package.json)
# Or kill process on port 3000:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Can't connect to Supabase
- Verify API keys are correct
- Check internet connection
- Verify Supabase project is active
- Check browser console for errors

---

**Keep this reference handy for quick command lookup!** 📚
