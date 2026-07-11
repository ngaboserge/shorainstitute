import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, FileText, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './ManageAssessments.css'

const ManageAssessments = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)

  useEffect(() => {
    if (courseId) {
      loadData()
    }
  }, [courseId])

  const loadData = async () => {
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load assessments for this course
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_questions (count)
        `)
        .eq('course_id', courseId)
        .order('order_number')

      if (assessmentsError) throw assessmentsError
      setAssessments(assessmentsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = () => {
    setEditingAssessment({
      title: '',
      description: '',
      passing_score: 70,
      time_limit_minutes: null,
      max_attempts: null,
      is_required: false,
      status: 'draft'
    })
    setShowCreateModal(true)
  }

  const handleSaveAssessment = async () => {
    if (!editingAssessment.title.trim()) {
      alert('Assessment title is required')
      return
    }

    try {
      if (editingAssessment.id) {
        // Update existing
        const { error } = await supabase
          .from('assessments')
          .update({
            title: editingAssessment.title,
            description: editingAssessment.description,
            passing_score: editingAssessment.passing_score,
            time_limit_minutes: editingAssessment.time_limit_minutes,
            max_attempts: editingAssessment.max_attempts,
            is_required: editingAssessment.is_required
          })
          .eq('id', editingAssessment.id)

        if (error) throw error
      } else {
        // Create new
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            course_id: courseId,
            title: editingAssessment.title,
            description: editingAssessment.description,
            passing_score: editingAssessment.passing_score,
            time_limit_minutes: editingAssessment.time_limit_minutes,
            max_attempts: editingAssessment.max_attempts,
            is_required: editingAssessment.is_required,
            status: 'draft',
            order_number: assessments.length + 1
          })
          .select()
          .single()

        if (error) throw error

        // Navigate to edit questions
        navigate(`/trainer/courses/${courseId}/assessments/${data.id}/edit`)
        return
      }

      setShowCreateModal(false)
      setEditingAssessment(null)
      loadData()
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Failed to save assessment')
    }
  }

  const handleDeleteAssessment = async (assessmentId) => {
    if (!confirm('Are you sure? This will delete all questions and student attempts.')) return

    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting assessment:', error)
      alert('Failed to delete assessment')
    }
  }

  const handlePublishAssessment = async (assessmentId) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ status: 'published' })
        .eq('id', assessmentId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error publishing assessment:', error)
      alert('Failed to publish assessment')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading...</p>
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
          title={`Assessments - ${course?.title || 'Course'}`}
          subtitle="Create and manage quizzes and assessments"
        />
        
        <div className="content-wrapper">
          <div className="assessments-header">
            <button className="btn btn-primary" onClick={handleCreateAssessment}>
              <Plus size={18} />
              Create Assessment
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} color="#ccc" />
              <h3>No assessments yet</h3>
              <p>Create your first assessment to test learner knowledge</p>
              <button className="btn btn-primary" onClick={handleCreateAssessment}>
                <Plus size={18} />
                Create Assessment
              </button>
            </div>
          ) : (
            <div className="assessments-grid">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="assessment-card">
                  <div className="assessment-header">
                    <h3>{assessment.title}</h3>
                    <span className={`status-badge status-${assessment.status}`}>
                      {assessment.status}
                    </span>
                  </div>

                  {assessment.description && (
                    <p className="assessment-description">{assessment.description}</p>
                  )}

                  <div className="assessment-meta">
                    <div className="meta-item">
                      <FileText size={16} />
                      <span>{assessment.assessment_questions?.[0]?.count || 0} questions</span>
                    </div>
                    <div className="meta-item">
                      <Check size={16} />
                      <span>{assessment.passing_score}% to pass</span>
                    </div>
                    {assessment.time_limit_minutes && (
                      <div className="meta-item">
                        <span>{assessment.time_limit_minutes} min limit</span>
                      </div>
                    )}
                  </div>

                  <div className="assessment-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/trainer/courses/${courseId}/assessments/${assessment.id}/edit`)}
                    >
                      <Edit2 size={16} />
                      Edit Questions
                    </button>
                    {assessment.status === 'draft' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handlePublishAssessment(assessment.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline delete"
                      onClick={() => handleDeleteAssessment(assessment.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {showCreateModal && editingAssessment && (
            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingAssessment.id ? 'Edit Assessment' : 'Create Assessment'}</h3>
                  <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Financial Literacy Quiz"
                      value={editingAssessment.title}
                      onChange={(e) => setEditingAssessment({ ...editingAssessment, title: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="What does this assessment cover?"
                      value={editingAssessment.description}
                      onChange={(e) => setEditingAssessment({ ...editingAssessment, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Passing Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingAssessment.passing_score}
                        onChange={(e) => setEditingAssessment({ ...editingAssessment, passing_score: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Time Limit (minutes)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="No limit"
                        value={editingAssessment.time_limit_minutes || ''}
                        onChange={(e) => setEditingAssessment({ 
                          ...editingAssessment, 
                          time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Max Attempts</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={editingAssessment.max_attempts || ''}
                        onChange={(e) => setEditingAssessment({ 
                          ...editingAssessment, 
                          max_attempts: e.target.value ? parseInt(e.target.value) : null 
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingAssessment.is_required}
                        onChange={(e) => setEditingAssessment({ ...editingAssessment, is_required: e.target.checked })}
                      />
                      <span>Required for course completion</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveAssessment}>
                    {editingAssessment.id ? 'Save Changes' : 'Create & Add Questions'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageAssessments
