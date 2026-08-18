# 🚀 IMMEDIATE ACTION STEPS - Featured Course Launch

## Status: ✅ Code Complete - Ready for Production

---

## ⚡ DO THIS NOW (3 Steps - 15 Minutes)

### STEP 1: Run Database Migrations (5 minutes)

1. **Open Supabase Dashboard:** https://supabase.com/dashboard
2. **Navigate to:** Your Project → SQL Editor

#### Migration 1: Add Trainer Profile Fields

**Copy and paste this SQL:**

```sql
-- ============================================================
-- Trainer Profile Enhancement
-- Add fields for professional profile, bio, credentials
-- FIXED: Uses public.users table instead of auth.users
-- ============================================================

-- Add profile fields to public.users table for trainers
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS qualifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create index for faster profile queries
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON public.users(profile_photo_url);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Add trainer_bio field to courses table for easier display
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS show_instructor_profile BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.users.bio IS 'Trainer biography/about section';
COMMENT ON COLUMN public.users.headline IS 'One-line professional headline (max 150 chars)';
COMMENT ON COLUMN public.users.qualifications IS 'Array of qualifications/certifications: [{title, institution, year}]';
COMMENT ON COLUMN public.users.specializations IS 'Array of expertise areas';
COMMENT ON COLUMN public.users.years_experience IS 'Number of years of professional experience';
COMMENT ON COLUMN public.users.company IS 'Current employer/company';
COMMENT ON COLUMN public.users.job_title IS 'Current job title/position';
```

**Click "Run"** → Verify "Success"

#### Migration 2: Setup Storage Bucket for Photos

**Copy and paste this SQL:**

```sql
-- ============================================================
-- Setup Storage Bucket for Trainer Profile Photos
-- Creates 'avatars' bucket with public access
-- ============================================================

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Set up storage policies for the avatars bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Trainers can manage trainer photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'trainers'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'trainer'
  )
);
```

**Click "Run"** → Verify "Success"

**✅ Done?** Database ready with profile fields and storage bucket.

---

### STEP 2: Deploy to Production (5 minutes)

**Your site:** https://www.shorainstitute.com

#### Option A: If you have automated deployment (GitHub)
- Changes are already pushed to GitHub
- Wait for auto-deploy to complete (if configured)
- Skip to Step 3

#### Option B: Manual deployment
1. **On production server:**
   ```bash
   cd /path/to/shora_institute
   git pull origin main
   ```

2. **Or upload these files from `dist/` folder:**
   - `dist/index.html`
   - `dist/assets/index-CBsb9K9Y.js`
   - `dist/assets/index-BT536rcz.css`
   - `dist/assets/index.es-Cj3_Dx0J.js`
   - `dist/assets/shora-logo-CIlgROVD.png`
   - `dist/assets/purify.es-Jn2rvFN8.js`

3. **Clear browser cache:** Ctrl + Shift + Delete (or Cmd + Shift + Delete on Mac)

**✅ Done?** The new homepage is live.

---

### STEP 3: Update Trainer Profile (5 minutes)

1. **Go to:** https://www.shorainstitute.com/trainer/login
2. **Log in** as the instructor for the 5-week course
3. **Navigate to:** Trainer Dashboard → Profile
4. **Click "Edit Profile"** button
5. **Fill in these fields:**

   - **Profile Photo:** Upload professional headshot
   - **Professional Headline:** e.g., "Senior Investment Strategist | 15+ Years Market Experience"
   - **Professional Title:** e.g., "Senior Finance & Investment Consultant"
   - **Current Company:** e.g., "Capital Markets Authority"
   - **Job Title:** e.g., "Chief Investment Officer"
   - **Years of Experience:** e.g., 15
   - **Expertise/Specialization:** e.g., "Capital Markets, Corporate Finance, Investment Strategy"
   - **Professional Biography:** 2-3 paragraphs about background, experience, teaching philosophy
   - **LinkedIn URL:** Full LinkedIn profile URL
   - **Twitter URL:** (Optional) Twitter/X profile
   - **Personal Website:** (Optional) Personal or professional website

6. **Click "Save Changes"**

**✅ Done?** Trainer profile is complete and will display on homepage.

---

## 🎉 VERIFY IT WORKS (2 minutes)

1. **Open homepage:** https://www.shorainstitute.com (in incognito/private window)
2. **Scroll down** to Featured Course section (after Features Bar)
3. **Check:**
   - ✅ Course displays: "Online 5-Weeks Investing Masterclass"
   - ✅ Instructor card shows with photo/initial
   - ✅ Instructor headline displays
   - ✅ Years of experience shows
   - ✅ "Enroll Now" button is present
   - ✅ Price displays: "USD 0.50"

4. **Test enrollment flow:**
   - Click "Enroll Now" (logged out)
   - Should redirect to login page
   - After login → should go to browse page

**✅ Everything working?** Launch is complete! 🚀

---

## 📱 Test on Mobile

1. Open homepage on mobile device
2. Featured course should stack vertically
3. Image should be on top, content below
4. Button should be full-width
5. Everything should be readable

---

## ⚠️ Troubleshooting

### "Featured course not showing"
- **Check:** Course ID `6683447f-8d8f-4557-8bd5-eaa125dcd8c5` exists and is published
- **Check:** Browser cache cleared
- **Check:** Console for errors (F12 → Console tab)

### "Trainer profile fields not saving"
- **Check:** Did you run the database migration?
- **Check:** Are you logged in as the correct trainer?
- **Check:** Console for errors

### "Image upload not working"
- **Check:** Supabase Storage bucket exists
- **Check:** File size < 5MB
- **Check:** File is image format (jpg, png, etc.)

### "Page looks broken"
- **Check:** All dist files deployed
- **Check:** Hard refresh: Ctrl + Shift + R
- **Check:** Clear browser cache completely

---

## 🎯 What Changed on Homepage

**Before:**
```
Hero Section
↓
Features Bar
↓
Upcoming Seminars
↓
7-Day Sprint
↓
Footer
```

**After:**
```
Hero Section
↓
Features Bar
↓
✨ FEATURED COURSE (NEW!) ✨
↓
Upcoming Seminars
↓
7-Day Sprint
↓
Footer
```

---

## 📊 What to Monitor

After launch, watch for:
1. **Homepage traffic** - Are people viewing it?
2. **Click-through rate** - Are people clicking "Enroll Now"?
3. **Enrollment conversions** - Are they completing payment?
4. **Mobile usage** - What % view on mobile?

---

## 🔄 Next Phase (Future)

Once this is working well, consider:
1. Adding a full course detail page
2. Adding student reviews/testimonials
3. Adding course preview video
4. Rotating multiple featured courses
5. Adding countdown timer for course start

---

## ✅ Deployment Checklist

- [ ] Database migration run in Supabase ✅
- [ ] Code deployed to production website ✅
- [ ] Trainer profile updated with real data ✅
- [ ] Homepage tested (desktop) ✅
- [ ] Homepage tested (mobile) ✅
- [ ] Enrollment flow tested ✅
- [ ] Payment tested (on production URL) ✅

---

## 📞 Need Help?

If something's not working:
1. Check browser console for errors (F12 → Console)
2. Check Supabase logs (Dashboard → Logs)
3. Review `DEPLOYMENT_SUMMARY.md` for full technical details
4. Check `FEATURED_COURSE_AND_TRAINER_PROFILE_PLAN.md` for architecture

---

**🎉 READY TO LAUNCH!**

Everything is coded, built, and pushed. Just run the 3 steps above and you're live!

**Estimated Total Time:** 15 minutes
