import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Eye, Trash2, Users, PlayCircle, BarChart3, TrendingUp, Settings, X, Save, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import './Courses.css'

const TrainerCourses = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, draft, published, archived
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [learningObjectives, setLearningObjectives] = useState([])
  const [requirements, setRequirements] = useState([])
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [newThumbnailFile, setNewThumbnailFile] = useState(null)
  
  // Use authenticated user ID
  const instructorId = user?.id

  const categories = [
    'Finance & Investment',
    'Business & Entrepreneurship',
    'Technology & Programming',
    'Marketing & Sales',
    'Personal Development',
    'Design & Creative',
    'Health & Wellness',
    'Language Learning',
    'Academic',
    'Other'
  ]

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const currencies = [
    { value: 'RWF', label: 'RWF', symbol: 'FRw' },
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'EUR', label: 'EUR', symbol: '€' }
  ]

  useEffect(() => {
    loadCourses()
  }, [filter])

  const loadCourses = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Get real enrollment counts for each course
      const courseIds = data?.map(c => c.id) || []
      let enrollmentsByCourse = {}
      
      if (courseIds.length > 0) {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id, id')
          .in('course_id', courseIds)
          .neq('payment_status', 'pending') // Only count paid/approved enrollments
        
        if (!enrollError) {
          // Count enrollments per course
          enrollments?.forEach(enrollment => {
            enrollmentsByCourse[enrollment.course_id] = (enrollmentsByCourse[enrollment.course_id] || 0) + 1
          })
        }
      }
      
      // Update courses with real enrollment counts
      const coursesWithEnrollments = data?.map(course => ({
        ...course,
        enrollment_count: enrollmentsByCourse[course.id] || 0
      })) || []
      
      setCourses(coursesWithEnrollments)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error
      
      alert('Course deleted successfully')
      loadCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }

  // Handle edit course
  const handleEditCourse = (course) => {
    
    setEditingCourse({ ...course })
    setLearningObjectives(course.learning_objectives || [''])
    setRequirements(course.requirements || [''])
    setThumbnailPreview(course.thumbnail_url)
    setNewThumbnailFile(null)
    setShowEditModal(true)
  }

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB')
        return
      }
      setNewThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save course edits
  const saveEditedCourse = async () => {
    if (!editingCourse.title?.trim()) {
      alert('Course title is required')
      return
    }

    setLoading(true)
    try {
      let thumbnailUrl = editingCourse.thumbnail_url

      // Upload new thumbnail if provided
      if (newThumbnailFile) {
        const fileExt = newThumbnailFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `course-thumbnails/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('course-assets')
          .upload(filePath, newThumbnailFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('course-assets')
            .getPublicUrl(filePath)
          thumbnailUrl = publicUrl
        }
      }

      // Filter out empty objectives and requirements
      const filteredObjectives = learningObjectives.filter(obj => obj.trim())
      const filteredRequirements = requirements.filter(req => req.trim())

      // Update course
      const { error } = await supabase
        .from('courses')
        .update({
          title: editingCourse.title,
          description: editingCourse.description,
          category: editingCourse.category,
          level: editingCourse.level,
          language: editingCourse.language,
          is_paid: editingCourse.is_paid,
          price: editingCourse.price,
          currency: editingCourse.currency,
          learning_objectives: filteredObjectives.length > 0 ? filteredObjectives : null,
          requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
          target_audience: editingCourse.target_audience,
          thumbnail_url: thumbnailUrl
        })
        .eq('id', editingCourse.id)

      if (error) throw error

      alert('Course updated successfully!')
      setShowEditModal(false)
      setEditingCourse(null)
      loadCourses()
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, currency) => {
    if (price === 0) return 'FREE'
    const symbols = { RWF: 'FRw', USD: '$', EUR: '€' }
    return `${symbols[currency] || currency} ${price.toLocaleString()}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="My Courses" 
          subtitle="Create and manage your course content"
        />
        <div className="content-wrapper">
          <div className="page-actions" style={{marginBottom: '24px'}}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/trainer/create-course')}
            >
              <Plus size={18} />
              Create New Course
            </button>
          </div>

          {/* Statistics */}
          <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#eff6ff' }}>
                  <PlayCircle size={24} color="#0B4F9F" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Courses</p>
                  <p className="stat-value">{courses.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#d1fae5' }}>
                  <Users size={24} color="#059669" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Students</p>
                  <p className="stat-value">
                    {courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7' }}>
                  <BarChart3 size={24} color="#d97706" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Published</p>
                  <p className="stat-value">
                    {courses.filter(c => c.status === 'published').length}
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fce7f3' }}>
                  <TrendingUp size={24} color="#db2777" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Avg Rating</p>
                  <p className="stat-value">
                    {courses.length > 0
                      ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
              </div>
            </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({courses.length})
              </button>
              <button
                className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Draft ({courses.filter(c => c.status === 'draft').length})
              </button>
              <button
                className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
                onClick={() => setFilter('published')}
              >
                Published ({courses.filter(c => c.status === 'published').length})
              </button>
              <button
                className={`filter-tab ${filter === 'archived' ? 'active' : ''}`}
                onClick={() => setFilter('archived')}
              >
                Archived ({courses.filter(c => c.status === 'archived').length})
              </button>
            </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="loading-state">
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <PlayCircle size={64} />
              <h3>No courses yet</h3>
              <p>Create your first course and start teaching</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/trainer/create-course')}
              >
                <Plus size={18} />
                <span>Create Your First Course</span>
              </button>
            </div>
          ) : (
            <div className="courses-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px'}}>
              {courses.map(course => (
                <div key={course.id} className="course-card" style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                    <div className="course-thumbnail" style={{
                      position: 'relative',
                      width: '100%',
                      height: '120px',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                      flexShrink: 0
                    }}>
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div className="thumbnail-placeholder" style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <PlayCircle size={40} />
                        </div>
                      )}
                      <div className="course-status-overlay" style={{position: 'absolute', top: '8px', right: '8px', zIndex: 10}}>
                        <span className={`status-badge status-${course.status}`} style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          background: course.status === 'published' ? 'rgba(5, 150, 105, 0.95)' : course.status === 'draft' ? 'rgba(107, 114, 128, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                          color: 'white'
                        }}>
                          {course.status}
                        </span>
                      </div>
                    </div>

                    <div className="course-content" style={{padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1}}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                        minHeight: '38px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>{course.title}</h3>
                      
                      <p className="course-description" style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#6b7280',
                        lineHeight: 1.4,
                        minHeight: '33px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.description?.substring(0, 80)}
                        {course.description?.length > 80 ? '...' : ''}
                      </p>

                      <div className="course-meta" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        borderTop: '1px solid #f3f4f6',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6b7280', fontWeight: 500}}>
                          <PlayCircle size={13} style={{color: '#0B4F9F'}} />
                          <span>{course.total_lessons || 0} lessons</span>
                        </div>
                        <div 
                          style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0B4F9F', fontWeight: 600, cursor: 'pointer'}}
                          onClick={() => navigate(`/trainer/courses/${course.id}/students`)}
                          title="View enrolled students"
                        >
                          <Users size={13} style={{color: '#0B4F9F'}} />
                          <span>{course.enrollment_count || 0} students</span>
                        </div>
                        {course.rating > 0 && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#f59e0b'}}>
                            <span>⭐ {course.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'}}>
                        <div style={{
                          padding: '3px 8px',
                          background: '#eff6ff',
                          color: '#0B4F9F',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '60%'
                        }}>{course.category}</div>
                        <div style={{fontSize: '14px', fontWeight: 700, color: '#0B4F9F', whiteSpace: 'nowrap'}}>
                          {formatPrice(course.price, course.currency)}
                        </div>
                      </div>

                      <div style={{paddingTop: '4px', marginTop: 'auto'}}>
                        <span style={{fontSize: '10px', color: '#9ca3af', fontWeight: 500}}>
                          Created {formatDate(course.created_at)}
                        </span>
                      </div>
                    </div>

                  <div className="course-actions" style={{display: 'flex', borderTop: '1px solid #e5e7eb', background: '#f9fafb'}}>
                    <button
                      onClick={() => handleEditCourse(course)}
                      title="Edit course details"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '10px 6px',
                        background: '#0B4F9F',
                        border: 'none',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Settings size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        const route = (course.delivery_type === 'live' || course.delivery_type === 'hybrid')
                          ? `/trainer/courses/${course.id}/manage-sessions`
                          : `/trainer/courses/${course.id}/manage-lessons`
                        navigate(route)
                      }}
                      title={course.delivery_type === 'live' || course.delivery_type === 'hybrid' ? 'Manage sessions' : 'Manage lessons'}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '10px 6px',
                        background: 'transparent',
                        border: 'none',
                        borderRight: '1px solid #e5e7eb',
                        color: '#6b7280',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={14} />
                      <span>{course.delivery_type === 'live' || course.delivery_type === 'hybrid' ? 'Sessions' : 'Lessons'}</span>
                    </button>
                    <button
                      onClick={() => navigate(`/learner/courses/${course.id}/lesson/${course.id}`)}
                      title="Preview course"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '10px 6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Course Modal */}
        {showEditModal && editingCourse && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-container large" style={{maxWidth: '900px'}} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>Edit Course</h3>
                  <p style={{fontSize: '13px', color: '#666', margin: '4px 0 0 0'}}>
                    Update course information and settings
                  </p>
                </div>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto', padding: '24px'}}>
                
                {/* Course Thumbnail */}
                <div style={{marginBottom: '32px'}}>
                  <h4 style={{margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600}}>Course Thumbnail</h4>
                  <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                    <div style={{
                      width: '200px',
                      height: '120px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: '#f9fafb'
                    }}>
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <PlayCircle size={48} color="#cbd5e1" />
                      )}
                    </div>
                    <div style={{flex: 1}}>
                      <label htmlFor="thumbnail-upload" className="btn btn-secondary" style={{cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
                        <Upload size={18} />
                        <span>Upload New Thumbnail</span>
                      </label>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        style={{display: 'none'}}
                      />
                      <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                        Recommended size: 1280×720px. Max size: 5MB. Formats: JPG, PNG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div style={{marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                  <h4 style={{margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600}}>Basic Information</h4>
                  
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Course Title *</label>
                    <input
                      type="text"
                      value={editingCourse?.title || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      placeholder="e.g., Complete Financial Markets Masterclass"
                      style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                    />
                  </div>

                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Description *</label>
                    <textarea
                      value={editingCourse?.description || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                      placeholder="Describe what students will learn and achieve..."
                      rows={5}
                      style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px'}}>
                    <div>
                      <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Category *</label>
                      <select
                        value={editingCourse?.category || ''}
                        onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Level *</label>
                      <select
                        value={editingCourse?.level || 'beginner'}
                        onChange={(e) => setEditingCourse({...editingCourse, level: e.target.value})}
                        style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                      >
                        {levels.map(lvl => (
                          <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Language</label>
                    <input
                      type="text"
                      value={editingCourse?.language || 'English'}
                      onChange={(e) => setEditingCourse({...editingCourse, language: e.target.value})}
                      placeholder="English"
                      style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                    />
                  </div>

                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Target Audience</label>
                    <input
                      type="text"
                      value={editingCourse?.target_audience || ''}
                      onChange={(e) => setEditingCourse({...editingCourse, target_audience: e.target.value})}
                      placeholder="e.g., Finance professionals, students, entrepreneurs"
                      style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                    />
                  </div>
                </div>

                {/* Learning Objectives */}
                <div style={{marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                  <h4 style={{margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600}}>Learning Objectives</h4>
                  <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
                    What will students learn from this course?
                  </p>
                  
                  {learningObjectives.map((obj, idx) => (
                    <div key={idx} style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...learningObjectives]
                          updated[idx] = e.target.value
                          setLearningObjectives(updated)
                        }}
                        placeholder="e.g., Understand capital markets fundamentals"
                        style={{flex: 1, padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px'}}
                      />
                      <button
                        onClick={() => setLearningObjectives(learningObjectives.filter((_, i) => i !== idx))}
                        style={{padding: '10px 14px', background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontWeight: '600'}}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setLearningObjectives([...learningObjectives, ''])}
                    className="btn btn-secondary"
                    style={{marginTop: '8px'}}
                  >
                    <Plus size={16} />
                    <span>Add Objective</span>
                  </button>
                </div>

                {/* Prerequisites/Requirements */}
                <div style={{marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                  <h4 style={{margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600}}>Prerequisites</h4>
                  <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
                    What do students need before taking this course?
                  </p>
                  
                  {requirements.map((req, idx) => (
                    <div key={idx} style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const updated = [...requirements]
                          updated[idx] = e.target.value
                          setRequirements(updated)
                        }}
                        placeholder="e.g., Basic understanding of finance"
                        style={{flex: 1, padding: '10px 12px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px'}}
                      />
                      <button
                        onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                        style={{padding: '10px 14px', background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontWeight: '600'}}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setRequirements([...requirements, ''])}
                    className="btn btn-secondary"
                    style={{marginTop: '8px'}}
                  >
                    <Plus size={16} />
                    <span>Add Prerequisite</span>
                  </button>
                </div>

                {/* Pricing */}
                <div style={{marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb'}}>
                  <h4 style={{margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600}}>Pricing</h4>
                  
                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={editingCourse?.is_paid || false}
                        onChange={(e) => setEditingCourse({...editingCourse, is_paid: e.target.checked, price: e.target.checked ? editingCourse.price : 0})}
                        style={{width: '18px', height: '18px', cursor: 'pointer'}}
                      />
                      <span style={{fontSize: '14px', fontWeight: 500}}>This is a paid course</span>
                    </label>
                  </div>

                  {editingCourse?.is_paid && (
                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
                      <div>
                        <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Price</label>
                        <input
                          type="number"
                          value={editingCourse?.price || 0}
                          onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                          min="0"
                          style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                        />
                      </div>

                      <div>
                        <label style={{display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '14px'}}>Currency</label>
                        <select
                          value={editingCourse?.currency || 'RWF'}
                          onChange={(e) => setEditingCourse({...editingCourse, currency: e.target.value})}
                          style={{width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px'}}
                        >
                          {currencies.map(curr => (
                            <option key={curr.value} value={curr.value}>{curr.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="modal-footer" style={{padding: '16px 24px', borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                      handleDeleteCourse(editingCourse.id)
                      setShowEditModal(false)
                    }
                  }}
                  style={{background: '#fee2e2', color: '#dc2626', border: '2px solid #fecaca'}}
                >
                  <Trash2 size={18} />
                  <span>Delete Course</span>
                </button>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={saveEditedCourse} disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default TrainerCourses
