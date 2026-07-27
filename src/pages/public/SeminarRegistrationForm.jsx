import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Calendar, Clock, Video } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import shoraLogo from '../../assets/shora-logo.png'
import './SeminarRegistrationForm.css'

const SeminarRegistrationForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [seminar, setSeminar] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/auth/seminar/login', {
        state: {
          returnTo: `/seminar/${id}/register`,
          seminarId: id,
          directToForm: true
        }
      })
      return
    }

    loadSeminar()
  }, [user, id])

  const loadSeminar = async () => {
    try {
      const { data, error } = await supabase
        .from('seminars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setSeminar(data)
    } catch (error) {
      console.error('Error loading seminar:', error)
      setError('Failed to load seminar details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required questions
    const questions = seminar?.registration_questions || []
    const requiredQuestions = questions.filter(q => q.required)
    
    for (const q of requiredQuestions) {
      if (!answers[q.id] || answers[q.id].toString().trim() === '') {
        alert(`Please answer: ${q.question}`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      // Check capacity
      if (seminar.current_registrations >= seminar.capacity) {
        setError('Sorry, this seminar is full!')
        setSubmitting(false)
        return
      }

      // Check if user already has a registration
      const { data: existingRegs, error: checkError } = await supabase
        .from('seminar_registrations')
        .select('*')
        .eq('seminar_id', id)
        .eq('user_id', user.id)

      if (checkError) throw checkError

      const existingReg = existingRegs && existingRegs.length > 0 ? existingRegs[0] : null

      if (existingReg && existingReg.registration_status === 'registered') {
        setError('You are already registered for this seminar')
        setSubmitting(false)
        return
      }

      if (existingReg) {
        // Update existing registration (re-register after cancellation)
        const { error: updateError } = await supabase
          .from('seminar_registrations')
          .update({
            registration_status: 'registered',
            registration_answers: answers,
            user_name: profile?.full_name || 'Learner',
            user_email: user.email
          })
          .eq('id', existingReg.id)

        if (updateError) throw updateError
      } else {
        // Create new registration
        const { error: insertError } = await supabase
          .from('seminar_registrations')
          .insert({
            seminar_id: id,
            user_id: user.id,
            user_name: profile?.full_name || 'Learner',
            user_email: user.email,
            registration_status: 'registered',
            registration_answers: answers
          })

        if (insertError) throw insertError
      }

      setSuccess(true)
      
      // Redirect to seminars page after 2 seconds
      setTimeout(() => {
        navigate('/learner/seminars', {
          state: { message: 'Successfully registered for seminar!' }
        })
      }, 2000)

    } catch (error) {
      console.error('Error registering:', error)
      setError('Failed to register. Please try again.')
    } finally {
      setSubmitting(false)
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
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)} ${timeZone}`
  }

  if (loading) {
    return (
      <div className="registration-form-page">
        <div className="form-container">
          <p style={{ textAlign: 'center', color: '#666' }}>Loading registration form...</p>
        </div>
      </div>
    )
  }

  if (!seminar) {
    return (
      <div className="registration-form-page">
        <div className="form-container">
          <AlertCircle size={48} color="#f44336" />
          <h2>Seminar Not Found</h2>
          <Link to="/" className="btn btn-primary">Go to Homepage</Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="registration-form-page">
        <div className="form-container success-container">
          <CheckCircle size={64} color="#4caf50" />
          <h2>Registration Successful!</h2>
          <p>You're all set for {seminar.title}</p>
          <p className="redirect-text">Taking you to your seminars...</p>
          <Link to="/learner/seminars" className="btn btn-primary" style={{ marginTop: '20px' }}>
            View My Seminars
          </Link>
        </div>
      </div>
    )
  }

  const questions = seminar.registration_questions || []

  return (
    <div className="registration-form-page">
      {/* Header */}
      <header className="form-header">
        <div className="header-container">
          <Link to="/">
            <img src={shoraLogo} alt="SHORA Institute" className="header-logo" />
          </Link>
        </div>
      </header>

      <div className="form-container">
        {/* Seminar Info with Thumbnail */}
        <div className="seminar-info-card">
          {seminar.thumbnail_url ? (
            <div className="seminar-info-thumbnail">
              <img src={seminar.thumbnail_url} alt={seminar.title} />
            </div>
          ) : (
            <div className="seminar-info-thumbnail seminar-info-placeholder">
              <Video size={64} strokeWidth={1.5} />
            </div>
          )}
          <div className="seminar-info-content">
            <h1 className="seminar-title">{seminar.title}</h1>
            <div className="seminar-meta">
              <div className="meta-item">
                <Calendar size={18} />
                <span>{formatDate(seminar.date)}</span>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <span>{formatTime(seminar.start_time, seminar.end_time, seminar.time_zone)}</span>
              </div>
              <div className="meta-item">
                <Video size={18} />
                <span>Live on {seminar.platform || 'Zoom'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="registration-card">
          <h2>Complete Your Registration</h2>
          
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {questions.length === 0 ? (
            <div>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                No additional information required. Click below to complete your registration.
              </p>
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="registration-form">
              <p className="form-intro">
                Please answer the following questions to help us better serve you:
              </p>

              {questions.map((q, index) => (
                <div key={q.id} className="form-group">
                  <label>
                    {index + 1}. {q.question}
                    {q.required && <span className="required">*</span>}
                  </label>

                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      className="form-input"
                    />
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      rows={4}
                      className="form-textarea"
                    />
                  )}

                  {q.type === 'select' && (
                    <select
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required={q.required}
                      className="form-select"
                    >
                      <option value="">Select an option...</option>
                      {q.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {q.type === 'radio' && (
                    <div className="radio-group">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="radio-label">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            required={q.required}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="checkbox-group">
                      {q.options?.map((opt, i) => (
                        <label key={i} className="checkbox-label">
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
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>

              <p className="form-footer">
                After registration, you can <Link to="/learner/seminars">explore other seminars</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SeminarRegistrationForm
