import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, GripVertical, ArrowLeft, Eye, Save, X, Upload as UploadIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import UploadVideoModal from '../../components/UploadVideoModal'
import './ManageLessons.css'

const ManageLessons = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  
  // Use authenticated user ID
  const instructorId = user?.id

  // Load course and lessons
  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_number')

      if (lessonsError) throw lessonsError
      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  // Add new lesson
  const handleAddLesson = () => {
    setEditingLesson({
      title: '',
      description: '',
      order_number: lessons.length + 1,
      duration_seconds: 0,
      is_preview: false,
      status: 'draft'
    })
    setShowAddLesson(true)
  }

  // Save lesson
  const saveLesson = async () => {
    if (!editingLesson.title.trim()) {
      alert('Lesson title is required')
      return
    }

    try {
      if (editingLesson.id) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title: editingLesson.title,
            description: editingLesson.description,
            is_preview: editingLesson.is_preview
          })
          .eq('id', editingLesson.id)

        if (error) throw error
      } else {
        // Insert new lesson
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            title: editingLesson.title,
            description: editingLesson.description,
            order_number: editingLesson.order_number,
            video_type: 'youtube', // Default, will be updated when video is added
            is_preview: editingLesson.is_preview,
            status: 'draft'
          })
          .select()
          .single()

        if (error) throw error
        
        // Open upload modal for the new lesson
        setSelectedLesson(data)
        setShowUploadModal(true)
      }

      setShowAddLesson(false)
      setEditingLesson(null)
      loadData()
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Failed to save lesson')
    }
  }

  // Edit lesson
  const handleEditLesson = (lesson) => {
    setEditingLesson({ ...lesson })
    setShowAddLesson(true)
  }

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Failed to delete lesson')
    }
  }

  // Open upload modal for adding/updating video
  const handleAddVideo = (lesson) => {
    setSelectedLesson(lesson)
    setShowUploadModal(true)
  }

  // Publish individual lesson
  const handlePublishLesson = async (lessonId) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'published' })
        .eq('id', lessonId)

      if (error) throw error
      loadData()
      alert('Lesson published successfully!')
    } catch (error) {
      console.error('Error publishing lesson:', error)
      alert('Failed to publish lesson')
    }
  }

  // Unpublish individual lesson
  const handleUnpublishLesson = async (lessonId) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'draft' })
        .eq('id', lessonId)

      if (error) throw error
      loadData()
      alert('Lesson unpublished!')
    } catch (error) {
      console.error('Error unpublishing lesson:', error)
      alert('Failed to unpublish lesson')
    }
  }

  // Publish course
  const handlePublishCourse = async () => {
    // Validation
    if (lessons.length === 0) {
      alert('Add at least one lesson before publishing')
      return
    }

    const lessonsWithoutVideo = lessons.filter(l => !l.video_url)
    if (lessonsWithoutVideo.length > 0) {
      if (!confirm(`${lessonsWithoutVideo.length} lesson(s) don't have videos yet. Publish anyway?`)) {
        return
      }
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', courseId)

      if (error) throw error

      // Update all lessons to published
      await supabase
        .from('lessons')
        .update({ status: 'published' })
        .eq('course_id', courseId)

      alert('Course published successfully!')
      navigate('/trainer/courses')
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('Failed to publish course')
    }
  }

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'Not set'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="manage-lessons-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="manage-lessons-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Course not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="manage-lessons-page">
      {/* Header */}
      <div className="manage-lessons-header">
        <button className="back-btn" onClick={() => navigate('/trainer/courses')}>
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        
        <div className="header-content">
          <div className="header-left">
            <h1>{course.title}</h1>
            <div className="course-meta">
              <span className={`status-badge status-${course.status}`}>
                {course.status}
              </span>
              <span>{lessons.length} lessons</span>
              <span>{course.category}</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => navigate(`/learner/courses/${courseId}/lesson/${lessons[0]?.id}`)}>
              <Eye size={18} />
              <span>Preview Course</span>
            </button>
            <button 
              className="btn btn-primary"
              onClick={handlePublishCourse}
              disabled={course.status === 'published'}
            >
              {course.status === 'published' ? 'Published' : 'Publish Course'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="manage-lessons-content">
        {/* Lessons List */}
        <div className="lessons-section">
          <div className="section-header">
            <h2>Course Content</h2>
            <button className="btn btn-primary" onClick={handleAddLesson}>
              <Plus size={18} />
              <span>Add Lesson</span>
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="empty-state">
              <UploadIcon size={48} />
              <h3>No lessons yet</h3>
              <p>Start building your course by adding lessons</p>
              <button className="btn btn-primary" onClick={handleAddLesson}>
                <Plus size={18} />
                <span>Add Your First Lesson</span>
              </button>
            </div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-drag-handle">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="lesson-number">
                    {lesson.order_number}
                  </div>
                  
                  <div className="lesson-content">
                    <div className="lesson-title-row">
                      <h3>{lesson.title}</h3>
                      {lesson.is_preview && (
                        <span className="preview-badge">Preview</span>
                      )}
                    </div>
                    
                    {lesson.description && (
                      <p className="lesson-description">{lesson.description}</p>
                    )}
                    
                    <div className="lesson-meta">
                      <span>Duration: {formatDuration(lesson.duration_seconds)}</span>
                      <span>•</span>
                      <span className={`video-status ${lesson.video_url ? 'has-video' : 'no-video'}`}>
                        {lesson.video_url ? `Video: ${lesson.video_type}` : 'No video'}
                      </span>
                      {lesson.video_url && (
                        <>
                          <span>•</span>
                          <span className={`status-indicator status-${lesson.status}`}>
                            {lesson.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="lesson-actions">
                    {lesson.video_url && (
                      <button
                        className={`btn-publish ${lesson.status === 'published' ? 'published' : 'draft'}`}
                        onClick={() => lesson.status === 'published' 
                          ? handleUnpublishLesson(lesson.id) 
                          : handlePublishLesson(lesson.id)
                        }
                        title={lesson.status === 'published' ? 'Unpublish lesson' : 'Publish lesson'}
                      >
                        {lesson.status === 'published' ? 'Published' : 'Publish'}
                      </button>
                    )}
                    <button
                      className="action-btn"
                      onClick={() => handleAddVideo(lesson)}
                      title={lesson.video_url ? 'Change video' : 'Add video'}
                    >
                      <UploadIcon size={18} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleEditLesson(lesson)}
                      title="Edit lesson"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      title="Delete lesson"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="course-info-sidebar">
          <div className="info-card">
            <h3>Course Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Total Lessons</span>
              <span className="stat-value">{lessons.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Published Lessons</span>
              <span className="stat-value">
                {lessons.filter(l => l.status === 'published').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Duration</span>
              <span className="stat-value">
                {formatDuration(lessons.reduce((sum, l) => sum + (l.duration_seconds || 0), 0))}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Videos Added</span>
              <span className="stat-value">
                {lessons.filter(l => l.video_url).length}
              </span>
            </div>
          </div>

          <div className="info-card">
            <h3>Publishing Checklist</h3>
            <div className="checklist">
              <div className={`checklist-item ${lessons.length > 0 ? 'complete' : ''}`}>
                <span className="checkbox">{lessons.length > 0 ? '✓' : ''}</span>
                <span>Add at least one lesson</span>
              </div>
              <div className={`checklist-item ${lessons.some(l => l.video_url) ? 'complete' : ''}`}>
                <span className="checkbox">{lessons.some(l => l.video_url) ? '✓' : ''}</span>
                <span>Add videos to lessons</span>
              </div>
              <div className={`checklist-item ${lessons.length >= 3 ? 'complete' : ''}`}>
                <span className="checkbox">{lessons.length >= 3 ? '✓' : ''}</span>
                <span>At least 3 lessons (recommended)</span>
              </div>
              <div className={`checklist-item ${course.thumbnail_url ? 'complete' : ''}`}>
                <span className="checkbox">{course.thumbnail_url ? '✓' : ''}</span>
                <span>Course thumbnail added</span>
              </div>
            </div>
          </div>

          <div className="info-card tips">
            <h3>💡 Tips</h3>
            <ul>
              <li>Keep lessons between 5-15 minutes</li>
              <li>Use clear, descriptive titles</li>
              <li>Mark first lesson as preview</li>
              <li>Add lesson descriptions</li>
              <li>Test videos before publishing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add/Edit Lesson Modal */}
      {showAddLesson && editingLesson && (
        <div className="modal-overlay" onClick={() => setShowAddLesson(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingLesson.id ? 'Edit Lesson' : 'Add New Lesson'}</h3>
              <button className="modal-close" onClick={() => setShowAddLesson(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Financial Markets"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What will students learn in this lesson?"
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingLesson.is_preview}
                    onChange={(e) => setEditingLesson({ ...editingLesson, is_preview: e.target.checked })}
                  />
                  <span>Free preview (students can watch without enrolling)</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddLesson(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveLesson}>
                <Save size={18} />
                <span>{editingLesson.id ? 'Update' : 'Save & Add Video'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && selectedLesson && (
        <UploadVideoModal
          lessonId={selectedLesson.id}
          courseId={courseId}
          instructorId={instructorId}
          onUploadComplete={() => {
            setShowUploadModal(false)
            setSelectedLesson(null)
            loadData()
          }}
          onClose={() => {
            setShowUploadModal(false)
            setSelectedLesson(null)
          }}
        />
      )}
    </div>
  )
}

export default ManageLessons
