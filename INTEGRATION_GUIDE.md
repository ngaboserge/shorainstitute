# 🔌 Integration Guide - Connecting Backend to Frontend

## 📋 Overview

This guide shows you exactly how to integrate the VideoPlayer component and connect your frontend to the Supabase backend.

**Prerequisites:** You've completed the setup in `QUICK_START.md` ✅

---

## 🎯 Integration Steps

### Step 1: Update CourseLesson.jsx

We'll replace the placeholder video with the real VideoPlayer component that tracks progress.

#### Current Code (Placeholder):
```javascript
<div className="video-container">
  <div className="video-player">
    <div className="video-placeholder">
      <div className="play-button-large">
        <Play size={64} fill="white" stroke="white" />
      </div>
    </div>
  </div>
</div>
```

#### New Code (Real Video Player):
```javascript
import VideoPlayer from '../../components/VideoPlayer'
import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'

// Inside CourseLesson component:
const [lesson, setLesson] = useState(null)
const [loading, setLoading] = useState(true)

// Load lesson data from database
useEffect(() => {
  loadLessonData()
}, [lessonId])

const loadLessonData = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()
  
  if (data) {
    setLesson(data)
  }
  setLoading(false)
}

// Replace video-container div with:
<div className="video-container">
  {loading ? (
    <div className="video-loading">Loading...</div>
  ) : (
    <VideoPlayer
      lesson={lesson}
      userId="temp-user-id" // Replace with actual user ID from auth
      courseId={id}
      onProgress={(percent) => {
        console.log('Progress:', percent + '%')
      }}
      onComplete={() => {
        console.log('Lesson completed!')
        // Update UI to show completion
      }}
    />
  )}
</div>
```

---

### Step 2: Load Course Data from Database

Replace the hardcoded course data with real database queries.

#### Before (Hardcoded):
```javascript
const course = {
  id: 1,
  title: 'Investing Essentials: Grow Your Wealth',
  instructor: 'Linda Umutoni',
  totalLessons: 12
}

const lessons = [
  { id: 1, title: 'Introduction to Investing', duration: '10:25' },
  // ... more hardcoded lessons
]
```

#### After (Database):
```javascript
const [course, setCourse] = useState(null)
const [lessons, setLessons] = useState([])

useEffect(() => {
  loadCourseData()
}, [id])

const loadCourseData = async () => {
  // Load course
  const { data: courseData } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  
  setCourse(courseData)
  
  // Load lessons
  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', id)
    .order('order_number')
  
  setLessons(lessonsData)
  
  // Load user progress
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', 'temp-user-id') // Replace with actual user ID
    .eq('completed', true)
  
  setCompletedLessons(progressData.map(p => p.lesson_id))
}
```

---

### Step 3: Format Duration Helper

Add a helper function to convert seconds to MM:SS format:

```javascript
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Use in lesson list:
<div className="lesson-duration">
  {formatDuration(lesson.duration_seconds)}
</div>
```

---

### Step 4: Handle Mark Complete Button

Update the "Mark as Complete" button to work with the database:

```javascript
const handleMarkComplete = async () => {
  try {
    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: 'temp-user-id', // Replace with actual user ID
        lesson_id: lessonId,
        course_id: id,
        completed: true,
        completed_at: new Date().toISOString(),
        watch_time_seconds: lesson.duration_seconds,
        last_position_seconds: lesson.duration_seconds
      })
    
    // Refresh progress
    loadCourseData()
    
    // Show success message
    alert('Lesson marked as complete!')
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to mark lesson as complete')
  }
}

// Update button:
<button 
  className="btn btn-primary mark-complete-btn"
  onClick={handleMarkComplete}
>
  <Check size={18} />
  <span>Mark as Complete</span>
</button>
```

---

### Step 5: Load Course Progress

Show real progress instead of hardcoded values:

```javascript
const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 })

useEffect(() => {
  loadProgress()
}, [id])

const loadProgress = async () => {
  // Get total lessons
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id)
  
  // Get completed lessons
  const { count: completedLessons } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id)
    .eq('user_id', 'temp-user-id') // Replace with actual user ID
    .eq('completed', true)
  
  setProgress({
    completed: completedLessons || 0,
    total: totalLessons || 0,
    percentage: Math.round(((completedLessons || 0) / (totalLessons || 1)) * 100)
  })
}

// Update progress display:
<div className="course-progress-sidebar">
  <div className="progress-label">
    <span>Your Progress</span>
    <span>{progress.percentage}%</span>
  </div>
  <div className="progress-bar-sidebar">
    <div 
      className="progress-fill" 
      style={{width: `${progress.percentage}%`}}
    />
  </div>
  <div className="progress-text-small">
    {progress.completed} of {progress.total} lessons complete
  </div>
</div>
```

---

## 🧪 Testing Your Integration

### Test 1: Video Playback
1. Open a lesson page
2. Video should load and play
3. Check browser console for errors

### Test 2: Progress Tracking
1. Watch a video for 30 seconds
2. Open Supabase dashboard → Table Editor → lesson_progress
3. Should see new record with watch_time_seconds around 30

### Test 3: Resume Functionality
1. Watch video halfway through
2. Refresh the page
3. Should see "Resuming from X:XX" banner
4. Video should start from where you left off

### Test 4: Auto-Completion
1. Skip to 90% of video
2. Wait a few seconds
3. Check lesson_progress table
4. completed should be true

---

## 🔍 Debugging Tips

### Issue: Video doesn't load
**Check:**
- Browser console for errors
- Supabase credentials in .env
- Lesson has valid video_url in database
- ReactPlayer package is installed

**Fix:**
```bash
npm install react-player
```

### Issue: Progress not saving
**Check:**
- Browser console for Supabase errors
- User ID is not null
- lesson_progress table exists
- Row-level security policies allow inserts

**Test in console:**
```javascript
import { supabase } from './src/lib/supabase'
const { data, error } = await supabase.from('lesson_progress').select('*')
console.log(data, error)
```

### Issue: "Cannot read property 'id' of undefined"
**Cause:** Lesson data hasn't loaded yet

**Fix:**
```javascript
// Add loading state
if (!lesson) {
  return <div>Loading lesson...</div>
}
```

---

## 📊 Complete Updated CourseLesson.jsx Example

Here's a simplified version showing the key changes:

```javascript
import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Lock, BookOpen, FileText, MessageSquare } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'
import { supabase } from '../../lib/supabase'
import './CourseLesson.css'

const CourseLesson = () => {
  const { id, lessonId } = useParams()
  
  // State
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Temporary user ID (replace with actual auth later)
  const userId = 'temp-user-id'

  // Load data on mount
  useEffect(() => {
    loadAllData()
  }, [id, lessonId])

  const loadAllData = async () => {
    setLoading(true)
    
    try {
      // Load course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
      setCourse(courseData)
      
      // Load all lessons for sidebar
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_number')
      setLessons(lessonsData || [])
      
      // Load current lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      setCurrentLesson(lessonData)
      
      // Load completed lessons
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('course_id', id)
        .eq('completed', true)
      setCompletedLessons(progressData?.map(p => p.lesson_id) || [])
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonComplete = () => {
    loadAllData() // Refresh to show updated progress
  }

  if (loading) {
    return <div className="lesson-layout"><div>Loading...</div></div>
  }

  if (!course || !currentLesson) {
    return <div className="lesson-layout"><div>Lesson not found</div></div>
  }

  const currentLessonNumber = lessons.findIndex(l => l.id === lessonId) + 1
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="lesson-layout">
      {/* Sidebar with course content */}
      <div className="lesson-sidebar">
        {/* ... sidebar content ... */}
        <div className="lessons-list">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id)
            const isCurrent = lesson.id === lessonId
            
            return (
              <Link
                key={lesson.id}
                to={`/learner/courses/${id}/lesson/${lesson.id}`}
                className={`lesson-item ${isCurrent ? 'active' : ''}`}
              >
                <div className="lesson-number">
                  {isCompleted ? <Check size={16} /> : <span>{index + 1}</span>}
                </div>
                <div className="lesson-info">
                  <div className="lesson-title-small">{lesson.title}</div>
                  <div className="lesson-duration">
                    {formatDuration(lesson.duration_seconds)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content with video player */}
      <div className="lesson-main">
        <div className="video-container">
          <VideoPlayer
            lesson={currentLesson}
            userId={userId}
            courseId={id}
            onProgress={(percent) => {
              console.log('Progress:', Math.round(percent) + '%')
            }}
            onComplete={handleLessonComplete}
          />
          
          {/* Navigation buttons */}
          <div className="lesson-navigation-bar">
            {/* ... navigation buttons ... */}
          </div>
        </div>
        
        {/* Tabs and content */}
        <div className="lesson-tabs-section">
          {/* ... rest of content ... */}
        </div>
      </div>
    </div>
  )
}

export default CourseLesson
```

---

## ✅ Integration Checklist

Before you start:
- [ ] Supabase setup complete (QUICK_START.md)
- [ ] Sample data loaded (SAMPLE_DATA.sql)
- [ ] Packages installed (@supabase/supabase-js, react-player)
- [ ] .env file configured with API keys
- [ ] Dev server running

Integration steps:
- [ ] Import VideoPlayer and supabase in CourseLesson.jsx
- [ ] Add state for course, lessons, currentLesson
- [ ] Create loadAllData function
- [ ] Replace hardcoded video with VideoPlayer component
- [ ] Update lesson list to use database data
- [ ] Add formatDuration helper function
- [ ] Test video playback
- [ ] Test progress tracking
- [ ] Test resume functionality

---

## 🎉 After Integration

Once you've completed the integration:

1. **Test thoroughly** - Watch videos, check progress
2. **Check Supabase dashboard** - Verify data is being saved
3. **Add authentication** - Replace 'temp-user-id' with real user IDs
4. **Build trainer interface** - Allow trainers to upload videos
5. **Add analytics** - Show progress dashboards

---

## 🆘 Need Help?

If you get stuck during integration:

1. Check browser console for errors
2. Check Supabase dashboard logs
3. Review this guide again
4. Ask me for help with specific error messages!

---

**Ready to integrate? Let me know when you're ready and I'll help you through it!** 🚀
