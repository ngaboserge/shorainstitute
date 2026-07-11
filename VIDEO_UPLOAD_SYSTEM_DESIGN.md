# SHORA Institute - Video Upload & Tracking System Design

## 🎯 GOAL: Flexible Video System

### Requirements:
1. ✅ Tutors can upload videos directly to platform
2. ✅ Tutors can provide YouTube video links
3. ✅ Track learner progress (watch time, completion)
4. ✅ Course progress tracking
5. ✅ Support both free and paid hosting

---

## 🏗️ SYSTEM ARCHITECTURE

### Database Schema (Supabase PostgreSQL)

```sql
-- COURSES TABLE
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  thumbnail_url TEXT,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LESSONS TABLE
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  duration_seconds INTEGER, -- video length in seconds
  
  -- VIDEO SOURCE (flexible)
  video_type TEXT NOT NULL, -- 'youtube', 'supabase', 'cloudflare', 'mux'
  video_url TEXT, -- YouTube URL or direct video URL
  video_id TEXT, -- YouTube ID or storage ID
  supabase_storage_path TEXT, -- Path in Supabase storage
  
  -- METADATA
  thumbnail_url TEXT,
  transcript TEXT, -- Optional video transcript
  resources JSONB, -- [{name, url, type}]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(course_id, order_number)
);

-- ENROLLMENTS TABLE
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  
  UNIQUE(user_id, course_id)
);

-- LESSON PROGRESS TABLE (Track watch time)
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  course_id UUID REFERENCES courses(id),
  
  -- PROGRESS TRACKING
  watch_time_seconds INTEGER DEFAULT 0, -- How much watched
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  last_position_seconds INTEGER DEFAULT 0, -- Resume from here
  
  -- TRACKING METADATA
  first_watched_at TIMESTAMP DEFAULT NOW(),
  last_watched_at TIMESTAMP DEFAULT NOW(),
  watch_count INTEGER DEFAULT 0, -- Number of times watched
  
  UNIQUE(user_id, lesson_id)
);

-- VIDEO UPLOADS TABLE (Track upload status)
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id),
  instructor_id UUID REFERENCES users(id),
  
  -- UPLOAD INFO
  filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  
  -- PROCESSING STATUS
  upload_status TEXT DEFAULT 'uploading', -- uploading, processing, ready, failed
  upload_progress INTEGER DEFAULT 0, -- 0-100%
  
  -- METADATA
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  error_message TEXT,
  
  -- VIDEO INFO (after processing)
  duration_seconds INTEGER,
  resolution TEXT, -- 720p, 1080p, etc.
  bitrate INTEGER,
  thumbnail_generated BOOLEAN DEFAULT FALSE
);

-- USERS TABLE (simplified)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'learner', -- learner, trainer, admin, institutional
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📤 TUTOR VIDEO UPLOAD FLOW

### Option 1: Direct Upload to Platform

```javascript
// Trainer creates course lesson
// They can choose upload method

STEP 1: Tutor selects "Upload Video"
  ↓
STEP 2: Choose file (MP4, MOV, AVI)
  ↓
STEP 3: Upload to Supabase Storage (or Cloudflare R2)
  ↓
STEP 4: Background processing (optional):
  - Generate thumbnail
  - Extract duration
  - Create preview
  ↓
STEP 5: Video ready for students
```

### Option 2: YouTube Link

```javascript
STEP 1: Tutor selects "YouTube Video"
  ↓
STEP 2: Paste YouTube URL
  ↓
STEP 3: System extracts video ID and metadata
  ↓
STEP 4: Video ready immediately
```

---

## 🎥 REACT COMPONENTS

### 1. Trainer Upload Component

```javascript
// src/pages/trainer/UploadVideoModal.jsx
import React, { useState } from 'react'
import { Upload, Youtube, Link as LinkIcon } from 'lucide-react'

const UploadVideoModal = ({ lessonId, onUploadComplete }) => {
  const [uploadMethod, setUploadMethod] = useState(null) // 'upload' or 'youtube'
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  // OPTION 1: Direct Upload
  const handleFileUpload = async (file) => {
    setUploading(true)
    
    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('course-videos')
      .upload(`${lessonId}/${file.name}`, file, {
        onUploadProgress: (progress) => {
          setProgress(Math.round((progress.loaded / progress.total) * 100))
        }
      })
    
    if (error) throw error
    
    // 2. Save to database
    await supabase.from('lessons').update({
      video_type: 'supabase',
      supabase_storage_path: data.path,
      video_url: supabase.storage.from('course-videos').getPublicUrl(data.path).data.publicUrl
    }).eq('id', lessonId)
    
    setUploading(false)
    onUploadComplete()
  }

  // OPTION 2: YouTube URL
  const handleYouTubeLink = async (url) => {
    // Extract YouTube video ID
    const videoId = extractYouTubeId(url)
    
    // Save to database
    await supabase.from('lessons').update({
      video_type: 'youtube',
      video_id: videoId,
      video_url: url
    }).eq('id', lessonId)
    
    onUploadComplete()
  }

  return (
    <div className="upload-modal">
      <h3>Add Video to Lesson</h3>
      
      {!uploadMethod && (
        <div className="upload-method-selector">
          <button 
            className="method-card"
            onClick={() => setUploadMethod('upload')}
          >
            <Upload size={48} />
            <h4>Upload Video File</h4>
            <p>Upload from your computer</p>
            <span className="badge">Direct Upload</span>
          </button>
          
          <button 
            className="method-card"
            onClick={() => setUploadMethod('youtube')}
          >
            <Youtube size={48} />
            <h4>YouTube Video</h4>
            <p>Use YouTube video link</p>
            <span className="badge badge-success">FREE Hosting</span>
          </button>
        </div>
      )}
      
      {uploadMethod === 'upload' && (
        <div className="file-upload-area">
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${progress}%`}}
                />
              </div>
              <p>{progress}% uploaded</p>
            </div>
          )}
        </div>
      )}
      
      {uploadMethod === 'youtube' && (
        <div className="youtube-input">
          <input 
            type="text" 
            placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
            onBlur={(e) => handleYouTubeLink(e.target.value)}
          />
          <p className="help-text">
            Video should be set to "Unlisted" for privacy
          </p>
        </div>
      )}
    </div>
  )
}

// Utility function
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default UploadVideoModal
```

### 2. Universal Video Player Component

```javascript
// src/components/VideoPlayer.jsx
import React, { useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'

const VideoPlayer = ({ 
  lesson, 
  userId,
  onProgress,
  onComplete 
}) => {
  const playerRef = useRef(null)
  const [lastPosition, setLastPosition] = React.useState(0)

  // Load last watched position from database
  useEffect(() => {
    loadLastPosition()
  }, [lesson.id])

  const loadLastPosition = async () => {
    const { data } = await supabase
      .from('lesson_progress')
      .select('last_position_seconds')
      .eq('user_id', userId)
      .eq('lesson_id', lesson.id)
      .single()
    
    if (data?.last_position_seconds) {
      setLastPosition(data.last_position_seconds)
      // Seek to last position
      playerRef.current?.seekTo(data.last_position_seconds, 'seconds')
    }
  }

  // Track progress every 5 seconds
  const handleProgress = async (state) => {
    const watchTime = Math.floor(state.playedSeconds)
    
    // Update database every 5 seconds
    if (watchTime % 5 === 0) {
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lesson.id,
          course_id: lesson.course_id,
          watch_time_seconds: watchTime,
          last_position_seconds: watchTime,
          last_watched_at: new Date().toISOString()
        })
      
      // Calculate overall progress
      const progressPercent = (watchTime / lesson.duration_seconds) * 100
      onProgress?.(progressPercent)
    }
  }

  // Mark as complete when 90% watched
  const handleVideoProgress = async (state) => {
    if (state.played > 0.9 && !lesson.completed) {
      await supabase
        .from('lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('lesson_id', lesson.id)
      
      onComplete?.()
      
      // Update course progress
      await updateCourseProgress(userId, lesson.course_id)
    }
  }

  // Render video based on type
  const getVideoUrl = () => {
    switch(lesson.video_type) {
      case 'youtube':
        return lesson.video_url
      case 'supabase':
        return lesson.video_url
      case 'cloudflare':
        return lesson.video_url
      default:
        return lesson.video_url
    }
  }

  return (
    <div className="video-player-container">
      {lesson.video_type === 'youtube' ? (
        // YouTube player
        <ReactPlayer
          ref={playerRef}
          url={getVideoUrl()}
          controls={true}
          width="100%"
          height="500px"
          onProgress={(state) => {
            handleProgress(state)
            handleVideoProgress(state)
          }}
          config={{
            youtube: {
              playerVars: { 
                start: lastPosition,
                rel: 0,
                modestbranding: 1
              }
            }
          }}
        />
      ) : (
        // HTML5 video player (for uploaded videos)
        <video
          ref={playerRef}
          controls
          width="100%"
          height="500px"
          onTimeUpdate={(e) => {
            const state = {
              playedSeconds: e.target.currentTime,
              played: e.target.currentTime / e.target.duration
            }
            handleProgress(state)
            handleVideoProgress(state)
          }}
        >
          <source src={getVideoUrl()} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      )}
      
      {lastPosition > 0 && (
        <div className="resume-notice">
          <p>Resuming from {formatTime(lastPosition)}</p>
        </div>
      )}
    </div>
  )
}

// Update overall course progress
async function updateCourseProgress(userId, courseId) {
  // Get all lessons in course
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
  
  // Get completed lessons
  const { data: completed } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true)
  
  // Calculate progress percentage
  const progress = Math.round((completed.length / lessons.length) * 100)
  
  // Update enrollment
  await supabase
    .from('enrollments')
    .update({
      progress_percentage: progress,
      completed_at: progress === 100 ? new Date().toISOString() : null
    })
    .eq('user_id', userId)
    .eq('course_id', courseId)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default VideoPlayer
```

### 3. Trainer Course Creation Page

```javascript
// src/pages/trainer/CreateLesson.jsx
import React, { useState } from 'react'
import { Upload, Youtube, Save } from 'lucide-react'
import UploadVideoModal from './UploadVideoModal'

const CreateLesson = ({ courseId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    order_number: 1,
    video_type: null
  })

  const saveLesson = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: lesson.title,
        description: lesson.description,
        order_number: lesson.order_number
      })
      .select()
      .single()
    
    if (data) {
      setShowUploadModal(true)
    }
  }

  return (
    <div className="create-lesson-page">
      <h2>Add New Lesson</h2>
      
      <div className="form-group">
        <label>Lesson Title</label>
        <input 
          type="text"
          value={lesson.title}
          onChange={(e) => setLesson({...lesson, title: e.target.value})}
          placeholder="e.g., Introduction to Risk Management"
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={lesson.description}
          onChange={(e) => setLesson({...lesson, description: e.target.value})}
          rows={4}
        />
      </div>
      
      <button className="btn btn-primary" onClick={saveLesson}>
        <Save size={18} />
        Save & Add Video
      </button>
      
      {showUploadModal && (
        <UploadVideoModal 
          lessonId={lesson.id}
          onUploadComplete={() => {
            setShowUploadModal(false)
            // Redirect to course overview
          }}
        />
      )}
    </div>
  )
}
```

---

## 📊 PROGRESS TRACKING DASHBOARD

### Trainer Analytics Component

```javascript
// src/pages/trainer/CourseAnalytics.jsx
import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const CourseAnalytics = ({ courseId }) => {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [courseId])

  const loadAnalytics = async () => {
    // Get all lessons with watch data
    const { data } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_progress (
          watch_time_seconds,
          completed,
          user_id
        )
      `)
      .eq('course_id', courseId)
    
    // Calculate metrics
    const analytics = data.map(lesson => ({
      title: lesson.title,
      totalWatches: lesson.lesson_progress.length,
      avgWatchTime: calculateAverage(lesson.lesson_progress, 'watch_time_seconds'),
      completionRate: calculateCompletionRate(lesson.lesson_progress)
    }))
    
    setAnalytics(analytics)
  }

  return (
    <div className="analytics-dashboard">
      <h3>Lesson Analytics</h3>
      
      <BarChart width={800} height={400} data={analytics}>
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="totalWatches" fill="#0B4F9F" />
      </BarChart>
      
      <div className="analytics-table">
        <table>
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Views</th>
              <th>Avg Watch Time</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.map(lesson => (
              <tr key={lesson.title}>
                <td>{lesson.title}</td>
                <td>{lesson.totalWatches}</td>
                <td>{formatTime(lesson.avgWatchTime)}</td>
                <td>{lesson.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function calculateAverage(array, field) {
  if (!array.length) return 0
  return array.reduce((sum, item) => sum + item[field], 0) / array.length
}

function calculateCompletionRate(progress) {
  if (!progress.length) return 0
  const completed = progress.filter(p => p.completed).length
  return Math.round((completed / progress.length) * 100)
}
```

---

## 🔄 COMPLETE WORKFLOW

### For Trainers:
```
1. Create Course
2. Add Lessons
3. For each lesson:
   - Upload video directly (MP4, MOV, etc.)
   OR
   - Provide YouTube link
4. Set lesson order
5. Publish course
6. View analytics (who watched what, completion rates)
```

### For Learners:
```
1. Enroll in course
2. Watch videos (YouTube or uploaded)
3. Progress automatically tracked
4. Can resume from last position
5. Mark lessons complete
6. Get certificate when 100% complete
```

---

## 💾 SUPABASE STORAGE SETUP

```sql
-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true);

-- Set up policies
CREATE POLICY "Trainers can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  (auth.uid() IN (SELECT id FROM users WHERE role = 'trainer'))
);

CREATE POLICY "Everyone can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-videos');
```

---

## 📦 PACKAGES TO INSTALL

```bash
# Video player
npm install react-player

# File upload (if you want progress bars)
npm install @supabase/supabase-js

# Charts for analytics
npm install recharts

# That's it! Very minimal dependencies
```

---

## 🎯 BENEFITS OF THIS SYSTEM

### Flexibility:
✅ Trainers choose YouTube (FREE) or upload (PAID)
✅ Mix both in same course
✅ Easy migration between systems

### Tracking:
✅ Exact watch time per student
✅ Resume from last position
✅ Auto-mark complete at 90% watched
✅ Course completion tracking
✅ Detailed analytics for trainers

### Scalability:
✅ Start with YouTube (FREE)
✅ Add direct upload later
✅ Move to CDN when needed
✅ Database handles millions of views

### Cost:
✅ YouTube = $0
✅ Supabase 1GB = $0
✅ Can scale up gradually

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: Database Setup
- Create Supabase tables
- Set up storage bucket
- Test uploads

### Week 2: Video Player
- Install react-player
- Create VideoPlayer component
- Test progress tracking

### Week 3: Trainer Upload UI
- Create upload modal
- YouTube link input
- File upload form

### Week 4: Progress Tracking
- Implement progress saving
- Resume functionality
- Completion logic

### Week 5: Analytics Dashboard
- Trainer analytics page
- View statistics
- Export reports

**Total: 5 weeks for complete system!**

---

## 📝 NEXT STEPS

1. Set up Supabase database (1 day)
2. Install react-player (5 minutes)
3. Create video upload modal (2 days)
4. Implement progress tracking (2 days)
5. Build analytics dashboard (2 days)

Want me to help you with any of these steps? We can start with the database setup!
