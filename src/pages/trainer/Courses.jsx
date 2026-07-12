import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Eye, Trash2, Users, PlayCircle, BarChart3, TrendingUp } from 'lucide-react'
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
  
  // Use authenticated user ID
  const instructorId = user?.id

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
      setCourses(data || [])
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
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                    <div className="course-thumbnail">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <PlayCircle size={48} />
                        </div>
                      )}
                      <div className="course-status-overlay">
                        <span className={`status-badge status-${course.status}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>

                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p className="course-description">
                        {course.description?.substring(0, 100)}
                        {course.description?.length > 100 ? '...' : ''}
                      </p>

                      <div className="course-meta">
                        <div className="meta-item">
                          <PlayCircle size={16} />
                          <span>{course.total_lessons || 0} lessons</span>
                        </div>
                        <div className="meta-item">
                          <Users size={16} />
                          <span>{course.enrollment_count || 0} students</span>
                        </div>
                        {course.rating > 0 && (
                          <div className="meta-item">
                            <span className="rating">⭐ {course.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="course-info">
                        <div className="course-category">{course.category}</div>
                        <div className="course-price">
                          {formatPrice(course.price, course.currency)}
                        </div>
                      </div>

                      <div className="course-footer">
                        <span className="course-date">
                          Created {formatDate(course.created_at)}
                        </span>
                      </div>
                    </div>

                  <div className="course-actions">
                    <button
                      className="action-btn"
                      onClick={() => navigate(`/trainer/courses/${course.id}/manage-lessons`)}
                      title="Manage lessons"
                    >
                      <Edit2 size={18} />
                      <span>Manage</span>
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => navigate(`/learner/courses/${course.id}/lesson/${course.id}`)}
                      title="Preview course"
                    >
                      <Eye size={18} />
                      <span>Preview</span>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete course"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerCourses
