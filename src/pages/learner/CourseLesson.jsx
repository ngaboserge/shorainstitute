import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Lock, BookOpen, FileText, MessageSquare, Play, BarChart3, Scale, Target } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import './CourseLesson.css'

const CourseLesson = () => {
  const { id, lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 })
  const [isEnrolled, setIsEnrolled] = useState(false)

  // Load all data
  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [id, lessonId, user])

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    if (!user || !currentLesson) return

    try {
      // Check if already completed
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLesson.id)
        .eq('course_id', id)
        .maybeSingle()

      if (existing) {
        // Update to completed
        await supabase
          .from('lesson_progress')
          .update({ 
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        // Create new progress entry
        await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            course_id: id,
            lesson_id: currentLesson.id,
            completed: true,
            completed_at: new Date().toISOString(),
            last_position_seconds: currentLesson.duration_seconds || 0
          })
      }

      // Update enrollment progress percentage
      await updateEnrollmentProgress()

      // Refresh data
      await loadAllData()

      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id)
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1]
        navigate(`/learner/courses/${id}/lesson/${nextLesson.id}`)
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error)
      alert('Failed to mark lesson as complete')
    }
  }

  // Update enrollment progress percentage
  const updateEnrollmentProgress = async () => {
    try {
      // Get total lessons
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', id)

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError)
        throw lessonsError
      }

      const totalLessons = allLessons?.length || 0

      // Get completed lessons
      const { data: completedProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .eq('completed', true)

      if (progressError) {
        console.error('Error fetching progress:', progressError)
        throw progressError
      }

      const completedCount = completedProgress?.length || 0

      // Calculate percentage
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedCount / totalLessons) * 100) 
        : 0

      console.log(`📊 Progress calculation: ${completedCount}/${totalLessons} = ${progressPercentage}%`)

      // Check if course is completed
      const isCompleted = progressPercentage === 100

      // Update enrollment
      const updateData = {
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString()
      }

      // If completed, set completed_at timestamp
      if (isCompleted) {
        updateData.completed_at = new Date().toISOString()
        console.log('🎉 Course completed! Setting completed_at timestamp')
      }

      const { data: updateResult, error: updateError } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('course_id', id)
        .select()

      if (updateError) {
        console.error('❌ Error updating enrollment:', updateError)
        throw updateError
      }

      console.log(`✅ Enrollment progress updated: ${progressPercentage}%`, updateResult)
    } catch (error) {
      console.error('Error updating enrollment progress:', error)
      alert(`Failed to update progress: ${error.message}`)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    
    try {
      // Check if user is enrolled
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle()

      if (enrollError) throw enrollError

      if (!enrollment) {
        setIsEnrolled(false)
        setLoading(false)
        return
      }

      setIsEnrolled(true)

      // Update last_accessed_at
      await supabase
        .from('enrollments')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', enrollment.id)
      
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
      
      if (courseError) throw courseError
      setCourse(courseData)
      
      // Load all lessons for sidebar
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_number')
      
      if (lessonsError) throw lessonsError
      setLessons(lessonsData || [])
      
      // Load current lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      
      if (lessonError) throw lessonError
      setCurrentLesson(lessonData)
      
      // Load completed lessons
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .eq('completed', true)
      
      setCompletedLessons(progressData?.map(p => p.lesson_id) || [])
      
      // Calculate progress
      const totalLessons = lessonsData?.length || 0
      const completedCount = progressData?.length || 0
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      
      setProgress({
        completed: completedCount,
        total: totalLessons,
        percentage: progressPercentage
      })
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle lesson completion
  const handleLessonComplete = async () => {
    console.log('✅ Lesson completed! Updating enrollment progress...')
    await updateEnrollmentProgress()
    loadAllData() // Refresh to show updated progress
  }

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="lesson-layout">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading lesson...</p>
        </div>
      </div>
    )
  }

  // Error state - Not enrolled
  if (!loading && !isEnrolled) {
    return (
      <div className="lesson-layout">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <BookOpen size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ color: '#666', marginBottom: '8px' }}>You are not enrolled in this course</h3>
          <p style={{ color: '#999', marginBottom: '24px' }}>Enroll in this course to access its lessons</p>
          <Link to="/learner/browse" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (!course || !currentLesson) {
    return (
      <div className="lesson-layout">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Lesson not found</p>
          <Link to="/learner/courses" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  const currentLessonNumber = lessons.findIndex(l => l.id === lessonId) + 1

  const resources = [
    { name: 'Lesson Slides (PDF)', type: 'PDF', size: '2.4 MB' },
    { name: 'Portfolio Template (Excel)', type: 'XLSX', size: '145 KB' },
    { name: 'Key Concepts Summary', type: 'PDF', size: '890 KB' }
  ]

  const notes = [
    { time: '02:15', text: 'Remember: Diversification reduces unsystematic risk' },
    { time: '08:42', text: 'Asset allocation rule of thumb: 100 - age = % stocks' }
  ]

  return (
    <div className="lesson-layout">
      {/* Left Sidebar - Course Content */}
      <div className="lesson-sidebar">
        <div className="course-header-sidebar">
          <Link to="/learner/courses" className="back-link">
            <ChevronLeft size={18} />
            <span>Back to My Learning</span>
          </Link>
          <h3 className="course-title-sidebar">{course.title}</h3>
          <div className="course-instructor-sidebar">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {course.instructor_name?.charAt(0) || 'T'}
            </div>
            <span>{course.instructor_name || 'Instructor'}</span>
          </div>
          <div className="course-progress-sidebar">
            <div className="progress-label">
              <span>Your Progress</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="progress-bar-sidebar">
              <div 
                className="progress-fill" 
                style={{width: `${progress.percentage}%`}}
              ></div>
            </div>
            <div className="progress-text-small">
              {progress.completed} of {progress.total} lessons complete
            </div>
          </div>
        </div>

        <div className="lessons-list">
          <h4 className="lessons-header">Course Content</h4>
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id)
            const isCurrent = lesson.id === lessonId
            const isLocked = false // All lessons accessible for now

            return (
              <Link
                key={lesson.id}
                to={`/learner/courses/${id}/lesson/${lesson.id}`}
                className={`lesson-item ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              >
                <div className="lesson-number">
                  {isCompleted ? (
                    <div className="lesson-check">
                      <Check size={16} />
                    </div>
                  ) : isLocked ? (
                    <Lock size={16} />
                  ) : (
                    <span>{lesson.order_number}</span>
                  )}
                </div>
                <div className="lesson-info">
                  <div className="lesson-title-small">{lesson.title}</div>
                  <div className="lesson-duration">{formatDuration(lesson.duration_seconds)}</div>
                </div>
                {isCurrent && (
                  <div className="playing-indicator">
                    <Play size={12} fill="currentColor" />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lesson-main">
        {/* Video Player */}
        <div className="video-container">
          <VideoPlayer
            lesson={currentLesson}
            userId={user?.id}
            courseId={id}
            onProgress={(percent) => {
              console.log('Progress:', Math.round(percent) + '%')
            }}
            onComplete={handleLessonComplete}
          />
          
          {/* Lesson Navigation */}
          <div className="lesson-navigation-bar">
            <Link
              to={currentLessonNumber > 1 ? `/learner/courses/${id}/lesson/${lessons[currentLessonNumber - 2].id}` : '#'}
              className={`nav-btn ${currentLessonNumber === 1 ? 'disabled' : ''}`}
            >
              <ChevronLeft size={20} />
              <span>Previous Lesson</span>
            </Link>
            
            <button 
              className="btn btn-primary mark-complete-btn"
              onClick={handleMarkComplete}
              disabled={completedLessons.includes(currentLesson?.id)}
            >
              <Check size={18} />
              <span>{completedLessons.includes(currentLesson?.id) ? 'Completed ✓' : 'Mark as Complete'}</span>
            </button>

            <Link
              to={currentLessonNumber < lessons.length ? `/learner/courses/${id}/lesson/${lessons[currentLessonNumber].id}` : '#'}
              className={`nav-btn ${currentLessonNumber === lessons.length ? 'disabled' : ''}`}
            >
              <span>Next Lesson</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        {/* Tabbed Content Below Video */}
        <div className="lesson-tabs-section">
          <div className="lesson-tabs">
            <button className="lesson-tab active">
              <FileText size={18} />
              <span>Overview</span>
            </button>
            <button className="lesson-tab">
              <BookOpen size={18} />
              <span>Resources</span>
            </button>
            <button className="lesson-tab">
              <MessageSquare size={18} />
              <span>Discussion</span>
            </button>
          </div>

          <div className="lesson-tab-content">
            {/* Overview Tab */}
            <div className="overview-tab">
              <div className="overview-main">
                <h3>Lesson Overview</h3>
                <p className="lesson-description">
                  In this lesson, you'll learn about the fundamental principles of diversification and how 
                  spreading investments across different asset classes can help reduce risk while maintaining 
                  potential returns. We'll explore practical strategies for building a well-diversified portfolio 
                  that aligns with your financial goals and risk tolerance.
                </p>

                <h4>What You'll Learn</h4>
                <ul className="learning-objectives">
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> The concept of diversification and why it matters</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Different types of diversification strategies</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> How to spread risk across asset classes</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Common diversification mistakes to avoid</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Building a diversified portfolio for your goals</li>
                </ul>

                <h4>Key Concepts</h4>
                <div className="key-concepts-grid">
                  <div className="concept-card">
                    <div className="concept-icon">
                      <BarChart3 size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Asset Allocation</div>
                    <p>Distributing investments across different asset classes</p>
                  </div>
                  <div className="concept-card">
                    <div className="concept-icon">
                      <Scale size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Risk Management</div>
                    <p>Reducing portfolio volatility through diversification</p>
                  </div>
                  <div className="concept-card">
                    <div className="concept-icon">
                      <Target size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Portfolio Balance</div>
                    <p>Maintaining optimal mix of investments</p>
                  </div>
                </div>

                <h4>Downloadable Resources</h4>
                <div className="resources-list">
                  {resources.map((resource, idx) => (
                    <div key={idx} className="resource-item">
                      <div className="resource-icon">
                        <FileText size={20} />
                      </div>
                      <div className="resource-info">
                        <div className="resource-name">{resource.name}</div>
                        <div className="resource-meta">{resource.type} • {resource.size}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm">Download</button>
                    </div>
                  ))}
                </div>

                <h4>Your Notes</h4>
                <div className="notes-section">
                  {notes.map((note, idx) => (
                    <div key={idx} className="note-item">
                      <div className="note-time">{note.time}</div>
                      <div className="note-text">{note.text}</div>
                      <button className="note-delete">×</button>
                    </div>
                  ))}
                  <button className="btn btn-outline btn-full">
                    + Add a Note at Current Timestamp
                  </button>
                </div>
              </div>

              <div className="overview-sidebar">
                <div className="lesson-info-card">
                  <h4>Lesson Info</h4>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{formatDuration(currentLesson.duration_seconds)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">Video Lesson</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Resources</span>
                    <span className="info-value">{resources.length} files</span>
                  </div>
                </div>

                <div className="instructor-card">
                  <h4>Your Instructor</h4>
                  <div className="instructor-profile">
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '600'
                    }}>
                      {course.instructor_name?.charAt(0) || 'T'}
                    </div>
                    <div className="instructor-details">
                      <div className="instructor-name">{course.instructor_name || 'Instructor'}</div>
                      <div className="instructor-title">Senior Financial Advisor</div>
                    </div>
                  </div>
                  <p className="instructor-bio">
                    {course.instructor_name} has extensive experience in financial education and investment management.
                  </p>
                  <button className="btn btn-secondary btn-full">Send Message</button>
                </div>

                <div className="help-card">
                  <h4>Need Help?</h4>
                  <p>Have questions about this lesson? Our support team is here to help.</p>
                  <button className="btn btn-outline btn-full">
                    <MessageSquare size={16} />
                    Ask a Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseLesson
