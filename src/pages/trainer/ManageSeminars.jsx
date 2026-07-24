import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, Video, Plus, Edit, Trash2, Eye, HelpCircle, List } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './ManageSeminars.css'

const ManageSeminars = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [seminars, setSeminars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSeminar, setEditingSeminar] = useState(null)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [selectedSeminar, setSelectedSeminar] = useState(null)
  const [questions, setQuestions] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    seminar_type: 'webinar',
    date: '',
    start_time: '14:00',
    end_time: '15:30',
    platform: 'zoom',
    meeting_link: '',
    capacity: 100,
    category: 'Finance & Investment',
    level: 'all',
    status: 'upcoming'
  })

  useEffect(() => {
    if (user) {
      loadSeminars()
    }
  }, [user, activeTab])

  const loadSeminars = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const query = supabase
        .from('seminars')
        .select(`
          *,
          seminar_registrations (count)
        `)
        .eq('instructor_id', user.id)
        .order('date', { ascending: true })

      if (activeTab === 'upcoming') {
        query.gte('date', today).in('status', ['upcoming', 'draft'])
      } else if (activeTab === 'completed') {
        query.eq('status', 'completed')
      }

      const { data, error } = await query

      if (error) throw error
      setSeminars(data || [])
    } catch (error) {
      console.error('Error loading seminars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const seminarData = {
        ...formData,
        instructor_id: user.id,
        instructor_name: profile?.full_name || 'Trainer',
        duration_minutes: calculateDuration(formData.start_time, formData.end_time)
      }

      if (editingSeminar) {
        // Update existing
        const { error } = await supabase
          .from('seminars')
          .update(seminarData)
          .eq('id', editingSeminar.id)

        if (error) throw error
        alert('✅ Seminar updated successfully!')
      } else {
        // Create new
        const { error } = await supabase
          .from('seminars')
          .insert(seminarData)

        if (error) throw error
        alert('✅ Seminar created successfully!')
      }

      setShowCreateModal(false)
      setEditingSeminar(null)
      resetForm()
      loadSeminars()
    } catch (error) {
      console.error('Error saving seminar:', error)
      alert('Failed to save seminar. Please try again.')
    }
  }

  const handleEdit = (seminar) => {
    setEditingSeminar(seminar)
    setFormData({
      title: seminar.title,
      description: seminar.description || '',
      seminar_type: seminar.seminar_type || 'webinar',
      date: seminar.date,
      start_time: seminar.start_time.slice(0, 5),
      end_time: seminar.end_time.slice(0, 5),
      platform: seminar.platform || 'zoom',
      meeting_link: seminar.meeting_link || '',
      capacity: seminar.capacity || 100,
      category: seminar.category || 'Finance & Investment',
      level: seminar.level || 'all',
      status: seminar.status
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (seminarId) => {
    if (!confirm('Are you sure you want to delete this seminar?')) return

    try {
      const { error } = await supabase
        .from('seminars')
        .delete()
        .eq('id', seminarId)

      if (error) throw error
      
      alert('Seminar deleted successfully')
      loadSeminars()
    } catch (error) {
      console.error('Error deleting seminar:', error)
      alert('Failed to delete seminar')
    }
  }

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    return (endHour * 60 + endMin) - (startHour * 60 + startMin)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      seminar_type: 'webinar',
      date: '',
      start_time: '14:00',
      end_time: '15:30',
      platform: 'zoom',
      meeting_link: '',
      capacity: 100,
      category: 'Finance & Investment',
      level: 'all',
      status: 'upcoming'
    })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const handleManageQuestions = (seminar) => {
    setSelectedSeminar(seminar)
    setQuestions(seminar.registration_questions || [])
    setShowQuestionsModal(true)
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
      options: []
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const saveQuestions = async () => {
    try {
      const { error } = await supabase
        .from('seminars')
        .update({ registration_questions: questions })
        .eq('id', selectedSeminar.id)

      if (error) throw error

      alert('✅ Registration questions saved successfully!')
      setShowQuestionsModal(false)
      loadSeminars()
    } catch (error) {
      console.error('Error saving questions:', error)
      alert('Failed to save questions')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading seminars...</p>
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
          title="Manage Seminars"
          subtitle="Create and manage your live sessions"
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm()
                setEditingSeminar(null)
                setShowCreateModal(true)
              }}
            >
              <Plus size={18} />
              Create Seminar
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Tabs */}
          <div className="tabs-nav-large">
            <button 
              className={`tab-btn-large ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming & Draft
              <span className="tab-badge">{seminars.length}</span>
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
              <span className="tab-badge">0</span>
            </button>
          </div>

          {/* Seminars List */}
          <div className="seminars-list">
            {seminars.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Video size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ color: '#666', marginBottom: '8px' }}>
                  No seminars yet
                </h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>
                  Create your first seminar to start engaging with learners
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={18} />
                  Create Seminar
                </button>
              </div>
            ) : (
              seminars.map((seminar) => (
                <div key={seminar.id} className="seminar-item">
                  <div className="seminar-item-header">
                    <div>
                      <span className="seminar-type-badge">
                        {seminar.seminar_type || 'webinar'}
                      </span>
                      {seminar.status === 'draft' && (
                        <span className="draft-badge">Draft</span>
                      )}
                      <h3>{seminar.title}</h3>
                      <p className="seminar-description">{seminar.description}</p>
                    </div>
                    <div className="seminar-actions">
                      <button 
                        className="btn btn-icon"
                        onClick={() => navigate(`/trainer/seminars/${seminar.id}/registrations`)}
                        title="View Registrations"
                      >
                        <List size={18} />
                      </button>
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleManageQuestions(seminar)}
                        title="Manage Registration Questions"
                      >
                        <HelpCircle size={18} />
                      </button>
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleEdit(seminar)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleDelete(seminar.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="seminar-item-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{formatDate(seminar.date)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{seminar.start_time.slice(0, 5)} - {seminar.end_time.slice(0, 5)}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <span>{seminar.current_registrations || 0} / {seminar.capacity} registered</span>
                    </div>
                    <div className="detail-item">
                      <Video size={16} />
                      <span>{seminar.platform || 'Zoom'}</span>
                    </div>
                  </div>

                  {seminar.current_registrations > 0 && (
                    <div className="seminar-progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(seminar.current_registrations / seminar.capacity) * 100}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSeminar ? 'Edit Seminar' : 'Create New Seminar'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="seminar-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Stock Market Investing"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what learners will learn..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="seminar_type"
                    value={formData.seminar_type}
                    onChange={handleInputChange}
                  >
                    <option value="webinar">Webinar</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="workshop">Workshop</option>
                    <option value="office_hours">Office Hours</option>
                  </select>
                </div>

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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                  >
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="google_meet">Google Meet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="500"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Meeting Link</label>
                <input
                  type="url"
                  name="meeting_link"
                  value={formData.meeting_link}
                  onChange={handleInputChange}
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Publish (Upcoming)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
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
                  {editingSeminar ? 'Update Seminar' : 'Create Seminar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Questions Modal */}
      {showQuestionsModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionsModal(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Questions</h2>
              <button 
                className="modal-close"
                onClick={() => setShowQuestionsModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Add custom questions for learners to answer when registering for this seminar.
              </p>

              {questions.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px' }}>
                  <HelpCircle size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#666', marginBottom: '20px' }}>No registration questions yet</p>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={addQuestion}
                  >
                    <Plus size={18} />
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <div className="question-header">
                        <h4>Question {index + 1}</h4>
                        <button 
                          type="button"
                          className="btn btn-icon btn-sm"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="form-group">
                        <label>Question Text *</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                          placeholder="e.g., What topics are you most interested in?"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Answer Type *</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                          >
                            <option value="text">Text (Short Answer)</option>
                            <option value="textarea">Text Area (Long Answer)</option>
                            <option value="select">Dropdown</option>
                            <option value="radio">Multiple Choice</option>
                            <option value="checkbox">Checkboxes</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                              style={{ marginRight: '8px' }}
                            />
                            Required Question
                          </label>
                        </div>
                      </div>

                      {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                        <div className="form-group">
                          <label>Options (one per line)</label>
                          <textarea
                            value={q.options?.join('\n') || ''}
                            onChange={(e) => updateQuestion(q.id, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                            rows={4}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button 
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={addQuestion}
                  >
                    <Plus size={18} />
                    Add Another Question
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowQuestionsModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={saveQuestions}
              >
                Save Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageSeminars
