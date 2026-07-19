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
  const [lessonResources, setLessonResources] = useState([])
  const [lessonNotes, setLessonNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // Load all data
  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [id, lessonId, user])

  // Load lesson resources
  const loadLessonResources = async () => {
    if (!lessonId) return
    
    try {
      const { data, error } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_number')
      
      if (error) throw error
      setLessonResources(data || [])
    } catch (error) {
      console.error('Error loading lesson resources:', error)
    }
  }

  // Load lesson notes
  const loadLessonNotes = async () => {
    if (!lessonId || !user) return
    
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .order('timestamp_seconds')
      
      if (error) throw error
      setLessonNotes(data || [])
    } catch (error) {
      console.error('Error loading lesson notes:', error)
    }
  }

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !lessonId) return
    
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: id,
          timestamp_seconds: 0, // TODO: Get current video timestamp
          note_text: newNote.trim()
        })
      
      if (error) throw error
      
      setNewNote('')
      await loadLessonNotes()
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note')
    }
  }

  // Delete a note
  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)
      
      if (error) throw error
      await loadLessonNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

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
      // Check if user is enrolled with active access (paid or free —
      // pending/rejected payments do not unlock course content)
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .in('payment_status', ['free', 'approved'])
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
      // Load resources and notes after main data is loaded
      if (lessonId) {
        loadLessonResources()
        loadLessonNotes()
      }
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

  // Helper functions for formatting
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    return `${kb.toFixed(0)} KB`
  }

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
            <button 
              className={`lesson-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText size={18} />
              <span>Overview</span>
            </button>
            <button 
              className={`lesson-tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <BookOpen size={18} />
              <span>Resources</span>
            </button>
            <button 
              className={`lesson-tab ${activeTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              <MessageSquare size={18} />
              <span>Discussion</span>
            </button>
          </div>

          <div className="lesson-tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="overview-main">
                  <h4>Lesson Description</h4>
                  <p className="lesson-description">
                  {currentLesson?.description || 'No description available for this lesson.'}
                </p>

                {currentLesson?.learning_objectives && currentLesson.learning_objectives.length > 0 && (
                  <>
                    <h4>What You'll Learn</h4>
                    <ul className="learning-objectives">
                      {currentLesson.learning_objectives.map((objective, idx) => (
                        <li key={idx}>
                          <Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h4>Downloadable Resources</h4>
                {lessonResources.length > 0 ? (
                  <div className="resources-list">
                    {lessonResources.map((resource) => (
                      <div key={resource.id} className="resource-item">
                        <div className="resource-icon">
                          <FileText size={20} />
                        </div>
                        <div className="resource-info">
                          <div className="resource-name">{resource.title}</div>
                          <div className="resource-meta">
                            {resource.file_type} • {formatFileSize(resource.file_size_bytes)}
                          </div>
                          {resource.description && (
                            <div className="resource-description">{resource.description}</div>
                          )}
                        </div>
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{color: '#666', fontSize: '14px', fontStyle: 'italic'}}>
                    No resources available for this lesson yet.
                  </p>
                )}

                <h4>Your Notes</h4>
                <div className="notes-section">
                  {lessonNotes.map((note) => (
                    <div key={note.id} className="note-item">
                      <div className="note-time">{formatTimestamp(note.timestamp_seconds)}</div>
                      <div className="note-text">{note.note_text}</div>
                      <button 
                        className="note-delete"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      className="btn btn-primary"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </button>
                  </div>
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
                    <span className="info-value">{lessonResources.length} file{lessonResources.length !== 1 ? 's' : ''}</span>
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
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="resources-tab">
                <h3 style={{marginBottom: '24px', fontSize: '24px', fontWeight: '700'}}>Lesson Resources</h3>
                
                {lessonResources.length > 0 ? (
                  <div style={{display: 'grid', gap: '16px'}}>
                    {lessonResources.map((resource) => (
                      <div key={resource.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: '#e3f2fd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={28} color="#0B4F9F" />
                        </div>
                        <div style={{flex: 1}}>
                          <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1a1a1a'}}>
                            {resource.title}
                          </h4>
                          {resource.description && (
                            <p style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                              {resource.description}
                            </p>
                          )}
                          <div style={{fontSize: '13px', color: '#999'}}>
                            {resource.file_type} • {formatFileSize(resource.file_size_bytes)}
                          </div>
                        </div>
                        <a 
                          href={resource.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{whiteSpace: 'nowrap'}}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <FileText size={64} color="#ccc" style={{margin: '0 auto 16px'}} />
                    <h4 style={{fontSize: '18px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>
                      No Resources Available
                    </h4>
                    <p style={{fontSize: '14px', color: '#999'}}>
                      The instructor hasn't added any downloadable resources for this lesson yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Discussion Tab */}
            {activeTab === 'discussion' && (
              <div className="discussion-tab">
                <h3 style={{marginBottom: '24px', fontSize: '24px', fontWeight: '700'}}>Lesson Discussion</h3>
                
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <MessageSquare size={64} color="#ccc" style={{margin: '0 auto 16px'}} />
                  <h4 style={{fontSize: '18px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>
                    Discussion Feature Coming Soon
                  </h4>
                  <p style={{fontSize: '14px', color: '#999', marginBottom: '24px'}}>
                    Soon you'll be able to ask questions and discuss this lesson with other learners and your instructor.
                  </p>
                  <button className="btn btn-secondary" disabled style={{opacity: 0.5}}>
                    <MessageSquare size={16} />
                    Start a Discussion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseLesson
