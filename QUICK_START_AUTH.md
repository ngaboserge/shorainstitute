# 🚀 Quick Start: Authentication Setup

## ⚡ 3 Simple Steps to Enable Real Trainer Accounts

### Step 1: Run Authentication SQL (2 minutes)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to**: SQL Editor
3. **Open file**: `AUTH_SETUP.sql` in your project
4. **Copy ALL content**
5. **Paste in SQL Editor**
6. **Click RUN** ▶️
7. **Wait for**: "Authentication setup complete!"

**What this does:**
- ✅ Creates auto-profile trigger (users table populated on signup)
- ✅ Updates security policies (RLS)
- ✅ Fixes storage permissions

---

### Step 2: Start Development Server

```cmd
npm run dev
```

Server should start on: http://localhost:3001

---

### Step 3: Create Your First Trainer Account

1. **Open browser**: http://localhost:3001/auth/trainer/signup

2. **Fill in the form**:
   ```
   Full Name: Your Name
   Email: your@email.com
   Password: password123 (min 6 chars)
   Confirm Password: password123
   ```

3. **Click**: "Create Trainer Account"

4. **Success!** 🎉
   - You're automatically logged in
   - Redirected to trainer dashboard
   - Profile created with real UUID

---

## ✅ Verify It Works

### Test 1: Check Your Account

1. **Go to Supabase Dashboard** → Authentication → Users
2. **You should see**: Your email listed
3. **Copy your User ID** (UUID like: `a1b2c3d4-...`)

### Test 2: Check Your Profile

1. **Go to Supabase Dashboard** → Table Editor → `users` table
2. **You should see**: Your profile row with:
   - `id`: Your UUID
   - `email`: Your email
   - `full_name`: Your name
   - `role`: `trainer`

### Test 3: Create a Course

1. **In your app**: Click "Create New Course"
2. **Fill in course details**
3. **Save course**
4. **Go to Supabase** → Table Editor → `courses` table
5. **Check**: `instructor_id` = Your UUID ✅

---

## 🎯 What Changed

### Before (Temporary ID) ❌
```javascript
const instructorId = 'instructor-temp-id'
```
- All trainers shared same fake ID
- No real accounts
- No security
- No user management

### After (Real Auth) ✅
```javascript
const { user } = useAuth()
const instructorId = user?.id
```
- Each trainer has unique UUID
- Real accounts with login/signup
- Secure with RLS policies
- Full user management

---

## 🔑 Available Routes

### Auth Pages (Public)
- **Signup**: `/auth/trainer/signup`
- **Login**: `/auth/trainer/login`

### Trainer Pages (Protected - Login Required)
- **Dashboard**: `/trainer/dashboard`
- **Create Course**: `/trainer/create-course`
- **My Courses**: `/trainer/courses`
- **Manage Lessons**: `/trainer/courses/:id/manage-lessons`

---

## 🛡️ Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Row Level Security** - Database-level permissions
✅ **Protected Routes** - Login required for trainer pages
✅ **Role-Based Access** - Only trainers can access trainer portal
✅ **Auto-Profile Creation** - Profile created on signup
✅ **Session Persistence** - Stay logged in across refreshes

---

## 🐛 Troubleshooting

### Problem: "User already registered"
**Solution**: Email already exists. Use different email OR login instead.

### Problem: Can't see trainer dashboard after login
**Solution**: 
1. Check browser console (F12) for errors
2. Verify role in database: Should be `'trainer'`
3. Clear browser cache and try again

### Problem: Auth trigger not working
**Solution**: Re-run `AUTH_SETUP.sql` completely

### Problem: RLS policy errors
**Solution**: 
1. Go to Supabase → Table Editor → Select table
2. Click "Policies" tab
3. Ensure policies exist
4. Re-run `AUTH_SETUP.sql` if missing

---

## 📱 User Flow

```
New User
   ↓
Signup Form → Auto-login → Trainer Dashboard
   ↓
Create Course → Add Lessons → Publish
   ↓
Manage Courses → Track Students → Analytics


Returning User
   ↓
Login Form → Trainer Dashboard
   ↓
Continue where you left off
```

---

## 🎓 Usage Example

### Creating a Course with Real ID

**Old Way (Temp ID):**
```javascript
// Everyone used same fake ID
const course = {
  instructor_id: 'instructor-temp-id',
  title: 'My Course'
}
```

**New Way (Real Auth):**
```javascript
import { useAuth } from '../../contexts/AuthContext'

const { user, profile } = useAuth()

const course = {
  instructor_id: user.id,           // Real UUID
  instructor_name: profile.full_name, // Real name
  title: 'My Course'
}
```

**Result:**
- ✅ Course belongs to YOU specifically
- ✅ Only YOU can edit/delete it
- ✅ Your name shown as instructor
- ✅ Secure with RLS policies

---

## 🚀 You're Ready!

**All set up!** Now you can:

1. ✅ Create real trainer accounts
2. ✅ Login/logout securely
3. ✅ Create courses with your ID
4. ✅ Manage your own courses
5. ✅ Track your students
6. ✅ Professional instructor portal

**Next**: Create your first course at `/trainer/create-course`

---

**Need help?** Check `AUTHENTICATION_GUIDE.md` for detailed documentation.
