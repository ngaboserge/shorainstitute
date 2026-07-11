# 🏗️ System Architecture - SHORA Institute Platform

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Learner    │  │   Trainer    │  │ Institution  │     │
│  │   Portal     │  │   Portal     │  │   Portal     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Shared Components                           │    │
│  │  • VideoPlayer • Header • Sidebar • Navigation      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  Supabase SDK   │
                    │  (API Client)   │
                    └─────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Supabase)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  │
│  │  │ users  │ │courses │ │lessons │ │progress│        │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              File Storage                             │  │
│  │  • course-videos  • thumbnails  • certificates       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication                           │  │
│  │  • Email/Password  • Social Login  • JWT Tokens      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   VIDEO HOSTING                              │
│                                                              │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   YouTube    │              │  Supabase    │            │
│  │   (Free)     │     OR       │  Storage     │            │
│  │  Unlimited   │              │  (Paid)      │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### 1. **Learner Watches Video**

```
┌─────────┐       ┌─────────────┐       ┌──────────┐       ┌────────────┐
│ Learner │ ────> │ VideoPlayer │ ────> │ Progress │ ────> │ Database   │
│ Clicks  │       │ Component   │       │ Tracker  │       │ (5s saves) │
└─────────┘       └─────────────┘       └──────────┘       └────────────┘
                         │
                         │ Every 5 seconds
                         ↓
                  ┌──────────────┐
                  │ lesson_      │
                  │ progress     │ → watch_time_seconds: 45
                  │ table        │ → last_position: 45
                  └──────────────┘ → completed: false
                         │
                         │ At 90% watched
                         ↓
                  ┌──────────────┐
                  │ Mark as      │
                  │ Complete     │ → completed: true
                  └──────────────┘ → completed_at: timestamp
                         │
                         ↓
                  ┌──────────────┐
                  │ Update       │
                  │ Course       │ → progress_percentage: 75%
                  │ Progress     │
                  └──────────────┘
```

---

### 2. **Trainer Uploads Video**

```
┌─────────┐       ┌─────────────┐       ┌──────────┐       ┌────────────┐
│ Trainer │ ────> │ Upload      │ ────> │ Supabase │ ────> │ Database   │
│ Clicks  │       │ Modal       │       │ Storage  │       │ Update     │
└─────────┘       └─────────────┘       └──────────┘       └────────────┘
                         │
                         │ Choose method
                         ↓
         ┌───────────────┴───────────────┐
         │                               │
         ↓                               ↓
┌──────────────┐              ┌──────────────┐
│ Direct       │              │ YouTube      │
│ Upload       │              │ Link         │
└──────────────┘              └──────────────┘
         │                               │
         ↓                               ↓
┌──────────────┐              ┌──────────────┐
│ 1. Upload    │              │ 1. Extract   │
│    to bucket │              │    video ID  │
│ 2. Get URL   │              │ 2. Save URL  │
│ 3. Save to   │              │    to DB     │
│    lessons   │              │              │
└──────────────┘              └──────────────┘
         │                               │
         └───────────────┬───────────────┘
                         ↓
                  ┌──────────────┐
                  │ lessons      │
                  │ table        │ → video_type: 'supabase' | 'youtube'
                  │              │ → video_url: 'https://...'
                  │              │ → video_id: 'abc123'
                  └──────────────┘
```

---

### 3. **Resume from Last Position**

```
┌─────────┐       ┌─────────────┐       ┌──────────┐
│ Learner │ ────> │ Load        │ ────> │ Database │
│ Opens   │       │ VideoPlayer │       │ Query    │
│ Lesson  │       └─────────────┘       └──────────┘
└─────────┘              ↓                     │
                         │                     │
                         │        ┌────────────┘
                         ↓        ↓
                  ┌──────────────────┐
                  │ SELECT           │
                  │ last_position    │
                  │ FROM             │
                  │ lesson_progress  │
                  │ WHERE user_id    │
                  │ AND lesson_id    │
                  └──────────────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │ Returns:     │
                  │ position: 127│ (seconds)
                  └──────────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │ Player seeks │
                  │ to 2:07      │
                  │ (127s)       │
                  └──────────────┘
                         │
                         ↓
                  ┌──────────────┐
                  │ Show banner: │
                  │ "Resuming    │
                  │ from 2:07"   │
                  └──────────────┘
```

---

## 🗄️ Database Schema Overview

```
┌──────────────┐
│    users     │
├──────────────┤
│ id           │ ←───┐
│ email        │     │
│ full_name    │     │
│ role         │     │
└──────────────┘     │
                     │
┌──────────────┐     │
│   courses    │     │
├──────────────┤     │
│ id           │ ←───┼─┐
│ title        │     │ │
│ instructor_id├─────┘ │
│ price        │       │
│ status       │       │
└──────────────┘       │
                       │
┌──────────────┐       │
│   lessons    │       │
├──────────────┤       │
│ id           │ ←─┐   │
│ course_id    ├───┼───┘
│ title        │   │
│ video_type   │   │  (youtube | supabase)
│ video_url    │   │
│ video_id     │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│ enrollments  │   │
├──────────────┤   │
│ user_id      │   │
│ course_id    │   │
│ progress_%   │   │
│ completed_at │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│ lesson_      │   │
│ progress     │   │
├──────────────┤   │
│ user_id      │   │
│ lesson_id    ├───┘
│ watch_time   │
│ last_position│
│ completed    │
└──────────────┘
```

---

## 🎥 Video System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   VIDEO SOURCES                         │
└─────────────────────────────────────────────────────────┘
         │                              │
         ↓                              ↓
┌──────────────────┐         ┌──────────────────┐
│  YOUTUBE VIDEO   │         │  UPLOADED VIDEO  │
│                  │         │                  │
│ • Free hosting   │         │ • Supabase       │
│ • Unlimited BW   │         │   Storage        │
│ • Auto CDN       │         │ • 1GB free       │
│ • Professional   │         │ • Pay for more   │
│   player         │         │                  │
└──────────────────┘         └──────────────────┘
         │                              │
         └──────────────┬───────────────┘
                        ↓
              ┌──────────────────┐
              │  VideoPlayer     │
              │  Component       │
              │                  │
              │ • ReactPlayer    │
              │ • Progress track │
              │ • Resume feature │
              │ • Auto-complete  │
              └──────────────────┘
                        ↓
              ┌──────────────────┐
              │  lesson_progress │
              │  Database        │
              │                  │
              │ • Watch time     │
              │ • Last position  │
              │ • Completed      │
              └──────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ROW LEVEL SECURITY                    │
└─────────────────────────────────────────────────────────┘

Learners can:
  ✓ View enrolled courses
  ✓ View their own progress
  ✓ Update their own progress
  ✗ View other learners' data
  ✗ Modify course content

Trainers can:
  ✓ Create courses
  ✓ Update own courses
  ✓ Upload videos
  ✓ View enrolled learners
  ✓ View analytics
  ✗ Modify other trainers' courses

Admins can:
  ✓ Everything
  ✓ Manage all users
  ✓ Manage all courses
  ✓ View all analytics

┌─────────────────────────────────────────────────────────┐
│              POLICY EXAMPLES                            │
└─────────────────────────────────────────────────────────┘

-- Learners can only see their enrolled courses
CREATE POLICY "learners_enrolled_courses" 
ON courses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enrollments 
    WHERE course_id = courses.id 
    AND user_id = auth.uid()
  )
);

-- Learners can only update their own progress
CREATE POLICY "learners_own_progress" 
ON lesson_progress FOR UPDATE 
USING (user_id = auth.uid());

-- Trainers can only edit their own courses
CREATE POLICY "trainers_own_courses" 
ON courses FOR UPDATE 
USING (instructor_id = auth.uid());
```

---

## 📈 Scalability Path

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: MVP (0 - 1,000 users)                         │
└─────────────────────────────────────────────────────────┘
• Supabase Free Tier
• YouTube for videos (free)
• Single database instance
• No caching needed yet

Cost: ~$0 - $25/month

┌─────────────────────────────────────────────────────────┐
│ PHASE 2: Growth (1,000 - 10,000 users)                 │
└─────────────────────────────────────────────────────────┘
• Supabase Pro ($25/month)
• Mix YouTube + Supabase Storage
• Redis caching (Upstash)
• CDN for static assets

Cost: ~$200 - $500/month

┌─────────────────────────────────────────────────────────┐
│ PHASE 3: Scale (10,000+ users)                         │
└─────────────────────────────────────────────────────────┘
• Dedicated database
• Cloudflare Stream or Mux
• Redis cluster
• Multi-region deployment
• Load balancing

Cost: ~$1,000 - $5,000/month
```

---

## 🚀 Technology Stack Summary

```
┌────────────────────────────────────────────┐
│ FRONTEND                                   │
├────────────────────────────────────────────┤
│ • React 18.2                              │
│ • Vite (build tool)                       │
│ • React Router v6                         │
│ • Lucide React (icons)                    │
│ • React Player (video)                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ BACKEND                                    │
├────────────────────────────────────────────┤
│ • Supabase                                │
│   - PostgreSQL database                   │
│   - Authentication                        │
│   - File storage                          │
│   - Real-time subscriptions               │
│   - Auto-generated APIs                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ VIDEO HOSTING                              │
├────────────────────────────────────────────┤
│ • YouTube (free, unlimited)               │
│ • Supabase Storage (paid, 1GB free)      │
│ • Future: Mux or Cloudflare Stream        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ DEPLOYMENT                                 │
├────────────────────────────────────────────┤
│ • Vercel (frontend)                       │
│ • Supabase Cloud (backend)                │
│ • GitHub (version control)                │
└────────────────────────────────────────────┘
```

---

## 🎯 Key Features Enabled

✅ **Video Management**
- Upload videos or use YouTube links
- Progress tracking (watch time)
- Resume from last position
- Auto-completion at 90%

✅ **Course Management**
- Create courses & lessons
- Track enrollments
- Monitor progress
- Generate certificates

✅ **User Management**
- Three roles: Learner, Trainer, Admin
- Secure authentication
- Row-level security
- Profile management

✅ **Analytics**
- Student progress
- Completion rates
- Watch time statistics
- Engagement metrics

---

## 📝 Next Implementation Steps

1. **Complete Supabase Setup** (Your action)
   - Create account
   - Run SQL schema
   - Add API keys

2. **Integrate VideoPlayer** (I'll do this)
   - Update CourseLesson.jsx
   - Connect to database
   - Test progress tracking

3. **Build Trainer Interface** (Next phase)
   - Course creation form
   - Lesson management
   - Video upload UI

4. **Add Authentication** (After that)
   - Login/signup pages
   - Protected routes
   - User roles

---

This architecture is designed to:
- ✅ Start free (YouTube + Supabase free tier)
- ✅ Scale gradually (pay as you grow)
- ✅ Handle 100,000+ users
- ✅ Support both free and premium content
- ✅ Enable advanced features later (AI, analytics, etc.)

**Ready to start?** Follow `QUICK_START.md` for setup! 🚀
