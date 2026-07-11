# 🔐 Authentication System - Complete Guide

## Overview

Your SHORA Institute platform now has **complete authentication** with:
- ✅ Trainer signup/login
- ✅ Real user accounts (no more temp IDs!)
- ✅ Protected routes
- ✅ Session management
- ✅ Auto-profile creation
- ✅ Role-based access control

---

## 🚀 Setup Instructions

### Step 1: Run Authentication SQL

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → SQL Editor
3. **Open file**: `AUTH_SETUP.sql`
4. **Copy ALL content**
5. **Paste in SQL Editor**
6. **Click RUN**
7. **Wait for**: "Authentication setup complete!"

This creates:
- Auto-profile trigger (creates user profile on signup)
- Updated RLS policies (role-based security)
- Storage policies (file upload permissions)

---

## 📝 How to Create a Trainer Account

### Method 1: Through the UI (Recommended)

1. **Start dev server**:
   ```cmd
   npm run dev
   ```

2. **Open browser**:
   ```
   http://localhost:3001/auth/trainer/signup
   ```

3. **Fill in the form**:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123` (min 6 characters)
   - Confirm Password: `password123`

4. **Click**: "Create Trainer Account"

5. **Success!** You'll be:
   - Automatically logged in
   - Redirected to trainer dashboard
   - Profile created in database

### Method 2: Direct SQL Insert (For Testing)

If you want to create a test account manually:

```sql
-- In Supabase SQL Editor

-- 1. Create auth user (Supabase Auth)
-- This must be done through the Supabase Dashboard → Authentication → Add User
-- OR through the signup form

-- 2. After signup, profile is auto-created by trigger
-- You can verify:
SELECT * FROM users WHERE email = 'your.email@example.com';
```

---

## 🔑 Login Process

### For Existing Trainers

1. **Navigate to**:
   ```
   http://localhost:3001/auth/trainer/login
   ```

2. **Enter credentials**:
   - Email: Your registered email
   - Password: Your password

3. **Click**: "Login to Dashboard"

4. **Success!** Redirected to trainer dashboard

### What Happens Behind the Scenes

1. **Supabase Auth** validates credentials
2. **Session created** (JWT token stored)
3. **User profile loaded** from database
4. **Auth context updated** with user data
5. **Protected routes** now accessible

---

## 🛡️ Protected Routes

All trainer routes are now **protected**:

```
/trainer/dashboard          → Requires login
/trainer/create-course      → Requires login
/trainer/courses            → Requires login
/trainer/courses/:id/manage-lessons → Requires login
/trainer/profile            → Requires login
/trainer/analytics          → Requires login
```

**What happens if not logged in?**
- Redirected to: `/auth/trainer/login`
- After login: Redirected back to original page

---

## 👤 Using Real User IDs

### Before (Temporary ID)
```javascript
const instructorId = 'instructor-temp-id' // ❌ Hardcoded
```

### After (Real Authenticated ID)
```javascript
import { useAuth } from '../../contexts/AuthContext'

const { user, profile } = useAuth()
const instructorId = user?.id // ✅ Real user ID from auth

// Access user info:
console.log(user.id)           // UUID
console.log(user.email)        // Email address
console.log(profile.full_name) // Full name
console.log(profile.role)      // 'trainer'
```

### Updated Components

All these components now use **real user IDs**:

1. **CreateCourse.jsx**
   - Uses `user?.id` for instructor_id
   - Uses `profile?.full_name` for instructor_name

2. **ManageLessons.jsx**
   - Uses `user?.id` for lesson ownership
   - Uses `user?.id` for video uploads

3. **Courses.jsx**
   - Uses `user?.id` to filter trainer's courses
   - Only shows courses created by logged-in trainer

---

## 🔐 Auth Context API

### Available Hooks

```javascript
import { useAuth } from '../contexts/AuthContext'

const {
  user,              // Auth user object (from Supabase)
  profile,           // User profile (from database)
  loading,           // Auth loading state
  signUp,            // Signup function
  signIn,            // Login function
  signOut,           // Logout function
  updateProfile,     // Update profile function
  isAuthenticated,   // Boolean: is user logged in?
  isTrainer,         // Boolean: is user a trainer?
  isLearner,         // Boolean: is user a learner?
  isAdmin            // Boolean: is user an admin?
} = useAuth()
```

### Usage Examples

**Check if logged in:**
```javascript
if (!isAuthenticated) {
  return <p>Please log in</p>
}
```

**Show user info:**
```javascript
<p>Welcome, {profile?.full_name}!</p>
<p>Email: {user?.email}</p>
```

**Logout button:**
```javascript
<button onClick={signOut}>Logout</button>
```

**Update profile:**
```javascript
await updateProfile({
  full_name: 'New Name',
  bio: 'My bio',
  avatar_url: 'https://...'
})
```

---

## 🔒 Security Features

### 1. Row Level Security (RLS)

**Courses:**
- Trainers can only see/edit their own courses
- Published courses visible to everyone
- Draft courses only visible to owner

**Lessons:**
- Only course owner can manage lessons
- Enrolled users can view lessons
- Preview lessons visible to everyone

**Storage:**
- Only trainers can upload files
- Users can only delete their own uploads
- Public files (thumbnails, videos) viewable by all

### 2. Role-Based Access

**Trainer Role:**
- Create courses
- Manage lessons
- Upload videos
- View analytics

**Learner Role:**
- Enroll in courses
- Watch videos
- Track progress
- Get certificates

**Admin Role:**
- Full access to everything
- Manage all users
- Moderate content

### 3. Session Management

**Features:**
- Auto-refresh tokens
- Persist sessions (stays logged in)
- Secure cookie storage
- Automatic logout on token expiry

---

## 📊 Database Schema

### Users Table

```sql
users (
  id UUID PRIMARY KEY,           -- From Supabase Auth
  email TEXT UNIQUE,             -- User email
  full_name TEXT,                -- Display name
  role TEXT,                     -- 'trainer', 'learner', 'admin'
  avatar_url TEXT,               -- Profile picture
  bio TEXT,                      -- About me
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Auto-Created on Signup

When someone signs up:
1. **Supabase Auth** creates auth user
2. **Trigger fires** → `handle_new_user()`
3. **Profile created** in `users` table
4. **User can login** immediately

---

## 🧪 Testing Authentication

### Test Scenario 1: New Trainer Signup

```
1. Go to: /auth/trainer/signup
2. Enter: test@example.com / password123
3. Click: Create Account
4. ✓ Should redirect to dashboard
5. ✓ Should see welcome message
6. ✓ Can create courses
```

### Test Scenario 2: Login/Logout

```
1. Logout (if logged in)
2. Go to: /auth/trainer/login
3. Enter: test@example.com / password123
4. Click: Login
5. ✓ Should redirect to dashboard
6. Click: Logout
7. ✓ Should redirect to login
8. ✓ Dashboard should be inaccessible
```

### Test Scenario 3: Create Course with Real ID

```
1. Login as trainer
2. Go to: /trainer/create-course
3. Fill course details
4. Click: Save & Continue
5. ✓ Course saved with your user ID
6. ✓ Check Supabase dashboard:
   - courses.instructor_id = your user UUID
   - courses.instructor_name = your full name
```

### Test Scenario 4: Protected Routes

```
1. Logout
2. Try to access: /trainer/dashboard
3. ✓ Should redirect to login
4. Login
5. ✓ Should redirect back to dashboard
```

---

## 🔧 Troubleshooting

### Issue: "User already registered"

**Solution:**
- Email already exists
- Use different email OR
- Login instead of signup

### Issue: "Invalid login credentials"

**Solution:**
- Check email spelling
- Check password (case-sensitive)
- Ensure account was created successfully

### Issue: "Not authorized" after login

**Solution:**
1. Check user role in database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your@email.com';
   ```
2. Role should be `'trainer'`
3. If wrong, update:
   ```sql
   UPDATE users SET role = 'trainer' WHERE email = 'your@email.com';
   ```

### Issue: Profile not created on signup

**Solution:**
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. If missing, run `AUTH_SETUP.sql` again
3. Manually create profile:
   ```sql
   INSERT INTO users (id, email, full_name, role)
   SELECT id, email, raw_user_meta_data->>'full_name', 'trainer'
   FROM auth.users
   WHERE email = 'your@email.com';
   ```

### Issue: Can't upload videos after login

**Solution:**
1. Check storage policies:
   - Go to: Supabase Dashboard → Storage → Policies
   - Ensure policies exist for `course-videos` bucket
2. Re-run storage policy section in `AUTH_SETUP.sql`

---

## 🎨 UI Components

### Login Page
- **Route**: `/auth/trainer/login`
- **Features**:
  - Email/password inputs
  - Show/hide password toggle
  - Remember me checkbox
  - Forgot password link
  - Switch to signup link

### Signup Page
- **Route**: `/auth/trainer/signup`
- **Features**:
  - Full name input
  - Email input
  - Password with strength indicator
  - Confirm password
  - Success animation
  - Switch to login link
  - Benefits section

### Protected Route Component
- **Component**: `ProtectedRoute`
- **Features**:
  - Auth checking
  - Role verification
  - Loading state
  - Access denied message
  - Auto-redirect to login

---

## 📱 User Experience Flow

### New User Journey

```
1. Homepage
   ↓
2. Click "Become a Trainer"
   ↓
3. Signup Form (/auth/trainer/signup)
   ↓
4. Create Account (automatic login)
   ↓
5. Trainer Dashboard (/trainer/dashboard)
   ↓
6. Create First Course
   ↓
7. Add Lessons & Videos
   ↓
8. Publish Course
```

### Returning User Journey

```
1. Homepage
   ↓
2. Click "Trainer Login"
   ↓
3. Login Form (/auth/trainer/login)
   ↓
4. Enter Credentials
   ↓
5. Trainer Dashboard
   ↓
6. Manage Courses
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Email verification enabled (Supabase → Auth → Email)
- [ ] Strong password policy (min 8 chars, special chars)
- [ ] Rate limiting on login attempts
- [ ] HTTPS enabled
- [ ] Secure cookies configured
- [ ] Password reset flow implemented
- [ ] Email templates customized
- [ ] Terms of service agreement
- [ ] Privacy policy link
- [ ] GDPR compliance (if EU users)

---

## 📚 Additional Resources

### Supabase Auth Docs
- [Auth Overview](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

### React Auth Patterns
- [Protected Routes](https://reactrouter.com/docs/en/v6/examples/auth)
- [Context API](https://react.dev/learn/passing-data-deeply-with-context)

---

## 🎉 Summary

You now have:

✅ **Complete authentication system**
✅ **Real trainer accounts**
✅ **Secure login/signup**
✅ **Protected routes**
✅ **Role-based access**
✅ **Auto-profile creation**
✅ **Session management**
✅ **No more temporary IDs!**

**Next Steps:**
1. Run `AUTH_SETUP.sql` in Supabase
2. Start dev server: `npm run dev`
3. Go to: `http://localhost:3001/auth/trainer/signup`
4. Create your first real trainer account!
5. Start creating courses with your real ID

🎓 **Welcome to the authenticated SHORA Institute!**
