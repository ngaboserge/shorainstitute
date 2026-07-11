# 🚀 Backend Setup Instructions - Start Here!

## What We're Building
A complete backend system with:
- ✅ Video upload capability (direct upload OR YouTube links)
- ✅ Progress tracking (watch time, completion, resume functionality)
- ✅ Course management
- ✅ User authentication
- ✅ Analytics dashboard for trainers

---

## 📋 STEP 1: Create Supabase Account (5 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with:
   - GitHub (recommended - faster)
   - OR Email/Password
4. Confirm your email
5. You'll land on the Supabase dashboard ✅

---

## 📋 STEP 2: Create New Project (3 minutes)

1. Click **"New Project"** button
2. Fill in the details:
   - **Organization**: Create new or use existing
   - **Name**: `shora-institute`
   - **Database Password**: **IMPORTANT** - Save this password somewhere safe! You'll need it later
   - **Region**: Choose closest to Rwanda:
     - **Europe (West)** - Frankfurt or London (RECOMMENDED)
     - OR **Asia (Southeast)** - Singapore
   - **Pricing Plan**: **FREE** (perfect to start, can upgrade later)
3. Click **"Create new project"**
4. Wait 2-3 minutes while Supabase sets up your database ⏳

---

## 📋 STEP 3: Get Your API Keys (2 minutes)

Once your project is ready:

1. In Supabase dashboard, click on your project name
2. Go to **Settings** ⚙️ (bottom left sidebar)
3. Click **"API"** in the Settings menu
4. You'll see two important keys:

### Copy These Two Values:

#### A) Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

#### B) anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYW...
```

**⚠️ IMPORTANT**: Keep these keys handy - you'll paste them in the next step!

---

## 📋 STEP 4: Configure Project with API Keys (1 minute)

1. In VS Code, locate the file `.env.example` (in the root folder)
2. Create a new file called `.env` (in the same location)
3. Copy the content from `.env.example` into `.env`
4. Replace the placeholder values with your actual keys:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save the file!** ✅

---

## 📋 STEP 5: Run Database Setup SQL (5 minutes)

Now we need to create all the database tables:

1. Back in Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. Open the file `BACKEND_SETUP_GUIDE.md` in VS Code
4. **Copy ALL the SQL** from the section "DATABASE SCHEMA (Copy & Run This)" 
   - It starts with `-- ENABLE UUID extension`
   - It ends with `SELECT 'Database setup complete!'...`
5. **Paste** the SQL into the Supabase SQL Editor
6. Click **"Run"** ▶️ button (bottom right)
7. Wait 10-15 seconds ⏳
8. You should see: **"Database setup complete!"** with table count ✅

### Verify Tables Were Created:
Run this query to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 8 tables:
- certificates
- course_reviews
- courses
- enrollments
- lesson_progress
- lessons
- users
- video_uploads

---

## 📋 STEP 6: Install Required Packages (1 minute)

Back in VS Code terminal, run:

```bash
npm install @supabase/supabase-js react-player
```

**What these do:**
- `@supabase/supabase-js` - Connect to Supabase backend
- `react-player` - Universal video player (supports YouTube + direct uploads)

---

## 📋 STEP 7: Restart Development Server

Since we added environment variables, we need to restart the dev server:

1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again:
```bash
npm run dev
```

---

## 🎉 SETUP COMPLETE!

Your backend is now ready! Here's what you have:

✅ Supabase PostgreSQL database with 8 tables
✅ Authentication system (built into Supabase)
✅ File storage buckets for videos/thumbnails
✅ API keys configured in your project
✅ Required packages installed

---

## 📍 YOU ARE HERE → Next Steps:

Now I'll create the following components:

1. **Supabase client configuration** (`src/lib/supabase.js`)
2. **Video player component** with progress tracking (`src/components/VideoPlayer.jsx`)
3. **Upload video modal** for trainers (`src/components/UploadVideoModal.jsx`)
4. **Update CourseLesson page** to use real video player
5. **Analytics dashboard** for trainers

---

## 🆘 Troubleshooting

### Issue: "Invalid API key"
- Double-check you copied the entire `anon public` key (it's very long!)
- Make sure there are no extra spaces in the `.env` file
- Restart dev server after changing `.env`

### Issue: "Table already exists" error
- Tables were already created (this is fine!)
- Skip the SQL step

### Issue: Can't connect to Supabase
- Check your internet connection
- Verify the Project URL is correct
- Make sure you're using `VITE_` prefix for environment variables (required for Vite)

---

## 💬 Need Help?

Let me know if:
- ❌ Any step fails
- ❓ You have questions about what something does
- 🤔 You're stuck on any step

I'm here to help! Just tell me which step you're on and what's happening.

---

**Ready?** Let me know once you've completed these steps and I'll create the video player components!
