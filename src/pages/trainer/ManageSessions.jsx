import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Calendar, Clock, Video, Edit2, Trash2, Save, X, CheckCircle, Users, Mail, Download, DollarSign } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import './ManageSessions.css'

const ManageSessions = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [sessions, setSessions] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [activeTab, setActiveTab] = useState('sessions') // sessions, enrollments

  const [sessionForm, setSessionForm] = useState({
    session_number: 1,
    title: '',
    description: '',
    session_date: '',
    start_time: '14:00',
    end_time: '16:00',
    meeting_platform: 'Zoom',
    meeting_link: ''
  })

  useEffect(() => {
    loadData()
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

      // Verify ownership
      if (courseData.instructor_id !== user.id) {
        alert('You do not have permission to manage this course')
        navigate('/trainer/dashboard')
        return
      }

      setCourse(courseData)

      // Load sessions with all fields
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('course_sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('session_number', { ascending: true })

      if (sessionsError) throw sessionsError
      
      console.log('Loaded sessions:', sessionsData) // Debug log
      setSessions(sessionsData || [])

      // Load enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          users:user_id (
            email,
            full_name
          )
        `)
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false })

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSession = () => {
    setSessionForm({
      session_number: sessions.length + 1,
      title: '',
      description: '',
      session_date: '',
      start_time: '14:00',
      end_time: '16:00',
      meeting_platform: 'Zoom',
      meeting_link: ''
    })
    setEditingSession(null)
    setShowAddForm(true)
  }

  const handleEditSession = (session) => {
    setSessionForm({
      session_number: session.session_number,
      title: session.title,
      description: session.description || '',
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      meeting_platform: session.meeting_platform,
      meeting_link: session.meeting_link || ''
    })
    setEditingSession(session)
    setShowAddForm(true)
  }

  const handleSaveSession = async () => {
    // Validate
    if (!sessionForm.title || !sessionForm.session_date) {
      alert('Please fill in title and date')
      return
    }

    setSaving(true)
    try {
      if (editingSession) {
        // Update existing session
        const { error } = await supabase
          .from('course_sessions')
          .update({
            title: sessionForm.title,
            description: sessionForm.description,
            session_date: sessionForm.session_date,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time,
            meeting_platform: sessionForm.meeting_platform,
            meeting_link: sessionForm.meeting_link
          })
          .eq('id', editingSession.id)

        if (error) throw error
      } else {
        // Create new session
        const { error } = await supabase
          .from('course_sessions')
          .insert({
            course_id: courseId,
            session_number: sessionForm.session_number,
            title: sessionForm.title,
            description: sessionForm.description,
            session_date: sessionForm.session_date,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time,
            meeting_platform: sessionForm.meeting_platform,
            meeting_link: sessionForm.meeting_link,
            status: 'scheduled'
          })

        if (error) throw error

        // Update course session count
        await supabase
          .from('courses')
          .update({ session_count: sessions.length + 1 })
          .eq('id', courseId)
      }

      setShowAddForm(false)
      loadData()
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const { error } = await supabase
        .from('course_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      // Update course session count
      await supabase
        .from('courses')
        .update({ session_count: sessions.length - 1 })
        .eq('id', courseId)

      loadData()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    }
  }

  const handlePublishCourse = async () => {
    if (sessions.length === 0) {
      alert('Please add at least one session before publishing')
      return
    }

    if (!confirm('Publish this course? Learners will be able to enroll.')) return

    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'published' })
        .eq('id', courseId)

      if (error) throw error

      alert('Course published successfully!')
      navigate('/trainer/dashboard')
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('Failed to publish course')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading course...</p>
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
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-icon"
                onClick={() => navigate('/trainer/dashboard')}
                style={{ background: '#f5f7fa' }}
              >
                <ArrowLeft size={20} />
              </button>
              Manage Live Sessions
            </div>
          }
          subtitle={course?.title}
          actions={
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={handleAddSession}
              >
                <Plus size={18} />
                Add Session
              </button>
              {sessions.length > 0 && course?.status === 'draft' && (
                <button 
                  className="btn btn-primary"
                  onClick={handlePublishCourse}
                >
                  <CheckCircle size={18} />
                  Publish Course
                </button>
              )}
            </div>
          }
        />

        <div className="content-wrapper">
          {/* Course Info Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Delivery Type</div>
                <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {course?.delivery_type?.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {course?.start_date && course?.end_date 
                    ? `${new Date(course.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(course.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : '—'
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Max Participants</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {course?.max_participants || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Sessions</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {sessions.length} sessions
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container" style={{ marginBottom: '24px' }}>
            <button 
              className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <Calendar size={18} />
              Sessions ({sessions.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
              onClick={() => setActiveTab('enrollments')}
            >
              <Users size={18} />
              Enrollments ({enrollments.length}{course?.max_participants ? `/${course.max_participants}` : ''})
            </button>
          </div>

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Course Sessions</h3>
            
            {sessions.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Calendar size={48} color="#ccc" />
                <h3 style={{ color: '#666', marginTop: '16px', marginBottom: '8px' }}>
                  No sessions yet
                </h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>
                  Add your first live session to get started
                </p>
                <button className="btn btn-primary" onClick={handleAddSession}>
                  <Plus size={18} />
                  Add Session
                </button>
              </div>
            ) : (
              <div className="sessions-list">
                {sessions.map((session) => {
                  console.log('Rendering session:', session) // Debug log
                  return (
                  <div key={session.id} className="session-item">
                    <div className="session-number">
                      Session {session.session_number}
                    </div>
                    <div className="session-content">
                      <h4>{session.title}</h4>
                      {session.description && (
                        <p className="session-description">{session.description}</p>
                      )}
                      <div className="session-meta">
                        <div className="meta-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Calendar size={18} style={{color: '#0B4F9F', flexShrink: 0}} />
                          <span style={{color: '#374151', fontSize: '15px', fontWeight: 500}}>
                            {session.session_date 
                              ? new Date(session.session_date).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'Date not set'
                            }
                          </span>
                        </div>
                        <div className="meta-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Clock size={18} style={{color: '#0B4F9F', flexShrink: 0}} />
                          <span style={{color: '#374151', fontSize: '15px', fontWeight: 500}}>
                            {session.start_time && session.end_time
                              ? `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`
                              : 'Time not set'
                            }
                          </span>
                        </div>
                        <div className="meta-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Video size={18} style={{color: '#0B4F9F', flexShrink: 0}} />
                          {session.meeting_link ? (
                            <a 
                              href={session.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#0B4F9F', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
                            >
                              {session.meeting_platform || 'Meeting'} Link →
                            </a>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '15px' }}>No meeting link</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="session-actions">
                      <button 
                        className="btn btn-icon"
                        onClick={() => handleEditSession(session)}
                        title="Edit session"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDeleteSession(session.id)}
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Enrolled Learners</h3>
                {course?.is_paid && (
                  <div style={{ 
                    padding: '8px 16px', 
                    background: '#f0fdf4', 
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <DollarSign size={16} />
                    {course.currency} {(enrollments.length * (course.price || 0)).toLocaleString()} Total Revenue
                  </div>
                )}
              </div>

              {enrollments.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Users size={48} color="#ccc" />
                  <h3 style={{ color: '#666', marginTop: '16px', marginBottom: '8px' }}>
                    No enrollments yet
                  </h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>
                    {course?.status === 'draft' 
                      ? 'Publish your course to start accepting enrollments'
                      : 'Learners will appear here once they enroll'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats Row */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '16px',
                    marginBottom: '24px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Enrolled</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#0B4F9F' }}>
                        {enrollments.length}
                      </div>
                    </div>
                    {course?.max_participants && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Spots Remaining</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                          {course.max_participants - enrollments.length}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Completion Rate</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                        {enrollments.filter(e => e.completion_percentage === 100).length > 0
                          ? `${Math.round((enrollments.filter(e => e.completion_percentage === 100).length / enrollments.length) * 100)}%`
                          : '0%'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Enrollments Table */}
                  <div className="table-container">
                    <table className="enrollments-table">
                      <thead>
                        <tr>
                          <th>Learner</th>
                          <th>Email</th>
                          <th>Enrolled Date</th>
                          <th>Progress</th>
                          {course?.is_paid && <th>Payment</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => {
                          const learnerName = enrollment.users?.full_name || enrollment.users?.email?.split('@')[0] || 'Unknown'
                          const progress = enrollment.completion_percentage || 0
                          
                          return (
                            <tr key={enrollment.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    flexShrink: 0
                                  }}>
                                    {learnerName.charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: '500' }}>{learnerName}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Mail size={14} color="#666" />
                                  {enrollment.users?.email}
                                </div>
                              </td>
                              <td>
                                {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    flex: 1,
                                    height: '8px',
                                    background: '#e0e0e0',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: `${progress}%`,
                                      height: '100%',
                                      background: progress === 100 ? '#10b981' : '#0B4F9F',
                                      transition: 'width 0.3s'
                                    }} />
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '40px' }}>
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                              </td>
                              {course?.is_paid && (
                                <td>
                                  <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: '#e8f5e9',
                                    color: '#2e7d32'
                                  }}>
                                    {course.currency} {(course.price || 0).toLocaleString()}
                                  </span>
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Session Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                    {editingSession ? 'Update session details' : 'Schedule a new live session'}
                  </p>
                </div>
                <button 
                  className="btn btn-icon"
                  onClick={() => setShowAddForm(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Session Number</label>
                  <input
                    type="number"
                    value={sessionForm.session_number}
                    onChange={(e) => setSessionForm({ ...sessionForm, session_number: parseInt(e.target.value) })}
                    min="1"
                    disabled={!!editingSession}
                  />
                </div>

                <div className="form-group">
                  <label className="required">Session Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Wealth Psychology & Financial Planning"
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    placeholder="What will be covered in this session..."
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="required">Session Date</label>
                    <input
                      type="date"
                      value={sessionForm.session_date}
                      onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Meeting Platform</label>
                    <select
                      value={sessionForm.meeting_platform}
                      onChange={(e) => setSessionForm({ ...sessionForm, meeting_platform: e.target.value })}
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={sessionForm.start_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={sessionForm.end_time}
                      onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Meeting Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={sessionForm.meeting_link}
                    onChange={(e) => setSessionForm({ ...sessionForm, meeting_link: e.target.value })}
                  />
                  <p className="help-text">You can add this later before the session starts</p>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveSession}
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : editingSession ? 'Update Session' : 'Add Session'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageSessions
