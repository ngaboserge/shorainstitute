import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, Video, Bell, CheckCircle, Award, ExternalLink } from 'lucide-react'
import ResponsiveLayout from '../../components/ResponsiveLayout'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './Seminars.css'

const Seminars = () => {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [seminars, setSeminars] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [selectedSeminar, setSelectedSeminar] = useState(null)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    if (user) {
      loadSeminars()
      loadRegistrations()
    }
  }, [user, activeTab])

  const loadSeminars = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const query = supabase
        .from('seminars')
        .select('*')
        .order('date', { ascending: true })

      if (activeTab === 'upcoming') {
        query.gte('date', today).in('status', ['upcoming', 'live'])
      } else {
        query.lt('date', today).eq('status', 'completed')
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

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('seminar_registrations')
        .select('seminar_id, registration_status, attended_at')
        .eq('user_id', user.id)

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error loading registrations:', error)
    }
  }

  const isRegistered = (seminarId) => {
    return registrations.some(r => r.seminar_id === seminarId && r.registration_status === 'registered')
  }

  const hasAttended = (seminarId) => {
    return registrations.some(r => r.seminar_id === seminarId && r.registration_status === 'attended')
  }

  const handleRegister = async (seminarId) => {
    const seminar = seminars.find(s => s.id === seminarId)
    
    // Check if seminar has registration questions
    if (seminar?.registration_questions && seminar.registration_questions.length > 0) {
      setSelectedSeminar(seminar)
      setAnswers({})
      setShowRegisterModal(true)
      return
    }

    // No questions, register directly
    await completeRegistration(seminarId, {})
  }

  const completeRegistration = async (seminarId, registrationAnswers) => {
    try {
      // Check capacity
      const seminar = seminars.find(s => s.id === seminarId)
      if (seminar && seminar.current_registrations >= seminar.capacity) {
        alert('Sorry, this seminar is full!')
        return
      }

      // Register
      const { error: regError } = await supabase
        .from('seminar_registrations')
        .insert({
          seminar_id: seminarId,
          user_id: user.id,
          user_name: profile?.full_name || 'Learner',
          user_email: user.email,
          registration_status: 'registered',
          registration_answers: registrationAnswers
        })

      if (regError) throw regError

      // Update seminar count
      await supabase
        .from('seminars')
        .update({ 
          current_registrations: (seminar.current_registrations || 0) + 1 
        })
        .eq('id', seminarId)

      // Reload data
      await loadSeminars()
      await loadRegistrations()
      
      setShowRegisterModal(false)
      alert('✅ Successfully registered for seminar!')
    } catch (error) {
      console.error('Error registering:', error)
      alert('Failed to register. Please try again.')
    }
  }

  const handleSubmitRegistration = (e) => {
    e.preventDefault()
    
    // Validate required questions
    const questions = selectedSeminar?.registration_questions || []
    const requiredQuestions = questions.filter(q => q.required)
    
    for (const q of requiredQuestions) {
      if (!answers[q.id] || answers[q.id].trim() === '') {
        alert(`Please answer: ${q.question}`)
        return
      }
    }

    completeRegistration(selectedSeminar.id, answers)
  }

  const handleCancelRegistration = async (seminarId) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return

    try {
      const { error } = await supabase
        .from('seminar_registrations')
        .update({ registration_status: 'cancelled' })
        .eq('seminar_id', seminarId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update seminar count
      const seminar = seminars.find(s => s.id === seminarId)
      if (seminar) {
        await supabase
          .from('seminars')
          .update({ 
            current_registrations: Math.max(0, (seminar.current_registrations || 0) - 1)
          })
          .eq('id', seminarId)
      }

      await loadSeminars()
      await loadRegistrations()
      
      alert('Registration cancelled successfully')
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Failed to cancel registration')
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (startTime, endTime, timeZone = 'EAT') => {
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)} (${timeZone})`
  }

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Live Seminars"
        subtitle="Loading seminars..."
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading seminars...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title="Live Seminars"
      subtitle="Join expert-led sessions and grow your financial knowledge."
      type="learner"
    >
          {/* Tabs */}
          <div className="seminars-tabs">
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Calendar size={16} />
              Upcoming
              <span className="tab-count">{activeTab === 'upcoming' ? seminars.length : 0}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              <CheckCircle size={16} />
              Past Seminars
              <span className="tab-count">{activeTab === 'past' ? seminars.length : 0}</span>
            </button>
          </div>

          {/* Seminars Grid */}
          <div className="seminars-grid">
            {seminars.map((seminar) => {
              const registered = isRegistered(seminar.id)
              const attended = hasAttended(seminar.id)
              const spotsLeft = seminar.capacity - (seminar.current_registrations || 0)

              return (
                <div key={seminar.id} className="seminar-card">
                  <div className="seminar-image-container">
                    {seminar.thumbnail_url ? (
                      <img src={seminar.thumbnail_url} alt={seminar.title} className="seminar-image" />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Video size={48} color="white" />
                      </div>
                    )}
                    {seminar.status === 'upcoming' && registered && (
                      <div className="registered-badge">
                        <CheckCircle size={14} />
                        Registered
                      </div>
                    )}
                    {seminar.status === 'completed' && seminar.certificate_eligible && attended && (
                      <div className="certificate-badge">
                        <Award size={14} />
                        Certificate
                      </div>
                    )}
                    {seminar.is_featured && (
                      <div className="featured-badge">Featured</div>
                    )}
                  </div>

                  <div className="seminar-content">
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{
                        background: '#E8F0FE',
                        color: '#0B4F9F',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {seminar.seminar_type || 'Webinar'}
                      </span>
                    </div>
                    <h3 className="seminar-title">{seminar.title}</h3>
                    
                    <div className="seminar-instructor">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {seminar.instructor_name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="instructor-name">{seminar.instructor_name || 'Instructor'}</div>
                        <div className="instructor-role">SHORA Trainer</div>
                      </div>
                    </div>

                    <div className="seminar-details">
                      <div className="detail-row">
                        <Calendar size={16} />
                        <span>{formatDate(seminar.date)}</span>
                      </div>
                      <div className="detail-row">
                        <Clock size={16} />
                        <span>{formatTime(seminar.start_time, seminar.end_time, seminar.time_zone)}</span>
                      </div>
                      <div className="detail-row">
                        <Video size={16} />
                        <span>Live on {seminar.platform || 'Zoom'}</span>
                      </div>
                      {seminar.status === 'upcoming' && (
                        <div className="detail-row">
                          <Users size={16} />
                          <span style={{ color: spotsLeft < 20 ? '#f59e0b' : '#666' }}>
                            {spotsLeft} seats available
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="seminar-actions">
                      {seminar.status === 'upcoming' && !registered && (
                        <button 
                          className="btn btn-warning btn-full"
                          onClick={() => handleRegister(seminar.id)}
                          disabled={spotsLeft <= 0}
                        >
                          {spotsLeft > 0 ? 'Register Free' : 'Full'}
                        </button>
                      )}
                      {seminar.status === 'upcoming' && registered && (
                        <>
                          {seminar.meeting_link && (
                            <a 
                              href={seminar.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-full"
                              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              Join Session <ExternalLink size={16} />
                            </a>
                          )}
                          <button 
                            className="btn btn-secondary btn-full"
                            onClick={() => handleCancelRegistration(seminar.id)}
                          >
                            Cancel Registration
                          </button>
                        </>
                      )}
                      {seminar.status === 'completed' && seminar.recording_url && (
                        <a 
                          href={seminar.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-full"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Video size={16} />
                          Watch Recording
                        </a>
                      )}
                      {seminar.status === 'completed' && seminar.certificate_eligible && attended && (
                        <Link 
                          to="/learner/certificates"
                          className="btn btn-secondary btn-full"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Award size={16} />
                          View Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {seminars.length === 0 && (
            <div className="empty-state">
              <Video size={48} color="#0B4F9F" />
              <h3>No seminars found</h3>
              <p>{activeTab === 'upcoming' ? 'Check back soon for new expert-led sessions.' : 'You haven\'t attended any seminars yet.'}</p>
            </div>
          )}

          {/* Registration Modal */}
          {showRegisterModal && selectedSeminar && (
            <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Register for Seminar</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setShowRegisterModal(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0B4F9F', marginBottom: '8px' }}>
                      {selectedSeminar.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(selectedSeminar.date)} • {formatTime(selectedSeminar.start_time, selectedSeminar.end_time)}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitRegistration}>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                      Please answer the following questions to complete your registration:
                    </p>

                    {selectedSeminar.registration_questions?.map((q, index) => (
                      <div key={q.id} className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          {index + 1}. {q.question}
                          {q.required && <span style={{ color: '#f44336' }}>*</span>}
                        </label>

                        {q.type === 'text' && (
                          <input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            required={q.required}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                        )}

                        {q.type === 'textarea' && (
                          <textarea
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            required={q.required}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              resize: 'vertical'
                            }}
                          />
                        )}

                        {q.type === 'select' && (
                          <select
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            required={q.required}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          >
                            <option value="">Select an option...</option>
                            {q.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {q.type === 'radio' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options?.map((opt, i) => (
                              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                  required={q.required}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === 'checkbox' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options?.map((opt, i) => (
                              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={(answers[q.id] || []).includes(opt)}
                                  onChange={(e) => {
                                    const current = answers[q.id] || []
                                    const newValue = e.target.checked
                                      ? [...current, opt]
                                      : current.filter(v => v !== opt)
                                    setAnswers({ ...answers, [q.id]: newValue })
                                  }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="modal-actions" style={{ marginTop: '32px' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowRegisterModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-warning">
                        Complete Registration
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </ResponsiveLayout>
      )
    }

export default Seminars
