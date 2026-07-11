# ⚡ QUICK START - Backend Setup

## 🎯 Goal: Get your backend running in 15 minutes

---

## ✅ CHECKLIST

Follow these steps in order:

### □ Step 1: Create Supabase Account (5 min)
1. Go to: **https://supabase.com**
2. Click "Start your project"
3. Sign up (GitHub is fastest)
4. Create new project:
   - Name: `shora-institute`
   - Password: (save it somewhere!)
   - Region: Europe (West) or Singapore
   - Plan: FREE
5. Wait 2-3 minutes for setup

### □ Step 2: Get API Keys (2 min)
1. In Supabase dashboard → **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (very long string starting with `eyJ...`)
3. Keep them ready!

### □ Step 3: Add Keys to Project (1 min)
1. Create new file: `.env` (in root folder)
2. Add this content:
```env
VITE_SUPABASE_URL=paste_your_project_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```
3. Replace the values with your actual keys
4. **Save the file!**

### □ Step 4: Run Database Setup (5 min)
1. In Supabase → **SQL Editor** → **New query**
2. Open file: `BACKEND_SETUP_GUIDE.md`
3. Copy **ALL the SQL** (starts with `-- Enable UUID extension`)
4. Paste into SQL Editor
5. Click **Run** ▶️
6. Should see: "Database setup complete!" ✅

### □ Step 5: Install Packages (1 min)
Open terminal and run:
```bash
npm install @supabase/supabase-js react-player
```

### □ Step 6: Restart Dev Server (1 min)
1. Stop current server (Ctrl+C)
2. Start again:
```bash
npm run dev
```

---

## 🎉 DONE!

If all steps completed successfully, you now have:
- ✅ Database with 8 tables
- ✅ Video upload capability
- ✅ Progress tracking system
- ✅ Authentication ready
- ✅ Storage buckets created

---

## 🧪 TEST YOUR CONNECTION

Add this to test if everything works:

```javascript
// Test in browser console (F12)
import { supabase } from './src/lib/supabase'
const { data, error } = await supabase.from('users').select('count')
console.log('Connected!', data)
```

If you see "Connected!" with no errors → **SUCCESS!** ✅

---

## ❌ SOMETHING WENT WRONG?

### Can't find .env file?
- Create it in the ROOT folder (same level as `package.json`)
- Make sure it's named exactly `.env` (with the dot)

### "Invalid API key" error?
- Double-check you copied the ENTIRE anon key (it's very long!)
- Make sure no spaces before/after the keys in `.env`
- Restart dev server after changing `.env`

### Tables not created?
- Make sure you copied ALL the SQL from BACKEND_SETUP_GUIDE.md
- Check for any red errors in SQL Editor
- Try running the SQL again

### npm install fails?
- Make sure you're in the project root folder
- Check your internet connection
- Try: `npm install --force`

---

## 📍 WHAT'S NEXT?

Once setup is complete, tell me and I'll:

1. **Update CourseLesson page** → Use the new VideoPlayer
2. **Create sample data** → Add test courses/lessons
3. **Build trainer interface** → Upload videos
4. **Add analytics** → Track student progress

---

## 📞 NEED HELP?

Tell me:
- Which step you're on
- What error message you see (if any)
- Screenshot helps!

I'm here to help you get this working! 🚀

---

## 📝 IMPORTANT FILES

| File | Purpose |
|------|---------|
| `SETUP_INSTRUCTIONS.md` | Detailed setup guide |
| `BACKEND_SETUP_GUIDE.md` | Database SQL schema |
| `BACKEND_IMPLEMENTATION_STATUS.md` | Complete status report |
| `QUICK_START.md` | This file - quick reference |

---

**⏱️ Time Budget:**
- Supabase account: 5 min
- Get keys: 2 min  
- Configure .env: 1 min
- Run SQL: 5 min
- Install packages: 1 min
- Restart server: 1 min

**Total: ~15 minutes** ⚡

Let's do this! 🎯
