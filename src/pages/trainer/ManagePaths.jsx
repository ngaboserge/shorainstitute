import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Plus, Edit, Trash2, BookOpen, Users, TrendingUp } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './ManagePaths.css'

const ManagePaths = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPath, setEditingPath] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    category: 'Finance & Investment',
    level: 'beginner',
    estimated_duration_weeks: 8,
    is_published: true,
    is_featured: false
  })

  useEffect(() => {
    if (user) {
      loadPaths()
      loadCourses()
    }
  }, [user])

  const loadPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          path_courses (
            id,
            course_id,
            order_number,
            courses (
              id,
              title
            )
          ),
          path_enrollments (count)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaths(data || [])
    } catch (error) {
      console.error('Error loading paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, category, level')
        .eq('instructor_id', user.id)
        .eq('status', 'published')
        .order('title')

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedCourses.length === 0) {
      alert('Please select at least one course for the path')
      return
    }

    try {
      const pathData = {
        ...formData,
        created_by: user.id,
        total_courses: selectedCourses.length
      }

      let pathId

      if (editingPath) {
        // Update existing path
        const { error } = await supabase
          .from('learning_paths')
          .update(pathData)
          .eq('id', editingPath.id)

        if (error) throw error
        pathId = editingPath.id

        // Delete old course associations
        await supabase
          .from('path_courses')
          .delete()
          .eq('path_id', pathId)
      } else {
        // Create new path
        const { data, error } = await supabase
          .from('learning_paths')
          .insert(pathData)
          .select()
          .single()

        if (error) throw error
        pathId = data.id
      }

      // Add course associations
      const pathCourses = selectedCourses.map((courseId, index) => ({
        path_id: pathId,
        course_id: courseId,
        order_number: index + 1,
        is_required: true
      }))

      const { error: coursesError } = await supabase
        .from('path_courses')
        .insert(pathCourses)

      if (coursesError) throw coursesError

      alert(editingPath ? '✅ Path updated successfully!' : '✅ Path created successfully!')
      setShowCreateModal(false)
      setEditingPath(null)
      resetForm()
      loadPaths()
    } catch (error) {
      console.error('Error saving path:', error)
      alert('Failed to save path. Please try again.')
    }
  }

  const handleEdit = (path) => {
    setEditingPath(path)
    setFormData({
      title: path.title,
      description: path.description || '',
      summary: path.summary || '',
      category: path.category || 'Finance & Investment',
      level: path.level || 'beginner',
      estimated_duration_weeks: path.estimated_duration_weeks || 8,
      is_published: path.is_published,
      is_featured: path.is_featured || false
    })
    
    // Set selected courses
    const courseIds = path.path_courses?.map(pc => pc.course_id) || []
    setSelectedCourses(courseIds)
    
    setShowCreateModal(true)
  }

  const handleDelete = async (pathId) => {
    if (!confirm('Are you sure you want to delete this learning path?')) return

    try {
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', pathId)

      if (error) throw error

      alert('Path deleted successfully')
      loadPaths()
    } catch (error) {
      console.error('Error deleting path:', error)
      alert('Failed to delete path')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      summary: '',
      category: 'Finance & Investment',
      level: 'beginner',
      estimated_duration_weeks: 8,
      is_published: true,
      is_featured: false
    })
    setSelectedCourses([])
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading learning paths...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Manage Learning Paths"
          subtitle="Create structured learning journeys for your students"
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm()
                setEditingPath(null)
                setShowCreateModal(true)
              }}
            >
              <Plus size={18} />
              Create Learning Path
            </button>
          }
        />

        <div className="content-wrapper">
          {paths.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Target size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#666', marginBottom: '8px' }}>
                No learning paths yet
              </h3>
              <p style={{ color: '#999', marginBottom: '24px' }}>
                Create your first learning path to guide students through a structured curriculum
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={18} />
                Create Learning Path
              </button>
            </div>
          ) : (
            <div className="paths-list">
              {paths.map((path) => (
                <div key={path.id} className="path-item">
                  <div className="path-item-header">
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <span className="path-category-badge">{path.category}</span>
                        {path.is_featured && (
                          <span className="featured-badge">Featured</span>
                        )}
                        {!path.is_published && (
                          <span className="draft-badge">Draft</span>
                        )}
                      </div>
                      <h3>{path.title}</h3>
                      <p className="path-description">{path.description}</p>
                    </div>
                    <div className="path-actions">
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleEdit(path)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleDelete(path.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="path-stats">
                    <div className="stat-item">
                      <BookOpen size={18} />
                      <span>{path.total_courses || 0} courses</span>
                    </div>
                    <div className="stat-item">
                      <Users size={18} />
                      <span>{path.path_enrollments?.[0]?.count || 0} enrollments</span>
                    </div>
                    <div className="stat-item">
                      <TrendingUp size={18} />
                      <span>{path.level || 'beginner'}</span>
                    </div>
                  </div>

                  {path.path_courses && path.path_courses.length > 0 && (
                    <div className="path-courses-list">
                      <div style={{ fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                        Course Sequence:
                      </div>
                      {path.path_courses.map((pc, index) => (
                        <div key={pc.id} className="course-item">
                          <span className="course-number">{index + 1}</span>
                          <span>{pc.courses?.title || 'Unknown Course'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPath ? 'Edit Learning Path' : 'Create New Learning Path'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="path-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Complete Financial Literacy Journey"
                  required
                />
              </div>

              <div className="form-group">
                <label>Summary</label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Brief one-line summary"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what learners will achieve..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Finance & Investment">Finance & Investment</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Technology">Technology</option>
                    <option value="Personal Development">Personal Development</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (weeks) *</label>
                  <input
                    type="number"
                    name="estimated_duration_weeks"
                    value={formData.estimated_duration_weeks}
                    onChange={handleInputChange}
                    min="1"
                    max="52"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Select Courses (in order) *</label>
                <div className="courses-selection">
                  {courses.length === 0 ? (
                    <p style={{ color: '#6b7280', padding: '16px', textAlign: 'center' }}>
                      No courses available. Create courses first to add them to a path.
                    </p>
                  ) : (
                    courses.map((course) => (
                      <label key={course.id} className="course-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                        />
                        <span>{course.title}</span>
                        <span className="course-meta">{course.category} • {course.level}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedCourses.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>Selected: {selectedCourses.length} courses</strong>
                    <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>
                      Courses will appear in the order you select them
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                  />
                  <span>Publish path (make visible to learners)</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                  />
                  <span>Feature this path (show prominently)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPath ? 'Update Path' : 'Create Path'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagePaths
