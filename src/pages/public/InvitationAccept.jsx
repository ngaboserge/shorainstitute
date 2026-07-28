import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Lock, 
  User, 
  Building2,
  Loader,
  ArrowRight
} from 'lucide-react'
import { 
  validateInvitationToken, 
  signupAndAcceptInvitation, 
  loginAndAcceptInvitation 
} from '../../lib/supabase-invitations'
import './InvitationAccept.css'

const InvitationAccept = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [formError, setFormError] = useState(null)
  
  const [mode, setMode] = useState('signup') // 'signup' or 'login'
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    loginEmail: '',
    loginPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token provided')
      setValidating(false)
      setLoading(false)
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    setValidating(true)
    setValidationError(null)

    const result = await validateInvitationToken(token)

    if (!result.valid) {
      setValidationError(result.error)
      setValidating(false)
      setLoading(false)
      return
    }

    setInvitation(result.invitation)
    
    // Pre-fill form data
    setFormData(prev => ({
      ...prev,
      fullName: result.invitation.employee_name || '',
      loginEmail: result.invitation.email
    }))

    setValidating(false)
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setFormError(null)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Full name is required')
      return
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const result = await signupAndAcceptInvitation(
        invitation,
        formData.password,
        formData.fullName
      )

      if (!result.success) {
        setFormError(result.error)
        setSubmitting(false)
        return
      }

      // Success! Redirect to learner dashboard
      navigate('/learner/seminars', {
        state: {
          message: `Welcome to ${result.institution.name}! You have successfully joined your institution.`
        }
      })

    } catch (error) {
      console.error('Signup error:', error)
      setFormError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!formData.loginEmail || !formData.loginPassword) {
      setFormError('Email and password are required')
      return
    }

    setSubmitting(true)

    try {
      const result = await loginAndAcceptInvitation(
        formData.loginEmail,
        formData.loginPassword,
        invitation.id
      )

      if (!result.success) {
        setFormError(result.error)
        setSubmitting(false)
        return
      }

      // Success! Redirect to learner dashboard
      navigate('/learner/seminars', {
        state: {
          message: `Welcome back! You have been added to ${result.institution.name}.`
        }
      })

    } catch (error) {
      console.error('Login error:', error)
      setFormError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading || validating) {
    return (
      <div className="invitation-accept-page">
        <div className="invitation-container">
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Validating invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (validationError) {
    return (
      <div className="invitation-accept-page">
        <div className="invitation-container">
          <div className="error-state">
            <div className="error-icon">
              <AlertCircle size={64} />
            </div>
            <h1>Invalid Invitation</h1>
            <p>{validationError}</p>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state - show acceptance form
  return (
    <div className="invitation-accept-page">
      <div className="invitation-container">
        {/* Header */}
        <div className="invitation-header">
          <div className="institution-badge">
            <Building2 size={32} />
          </div>
          <h1>You're Invited!</h1>
          <p className="institution-name">{invitation.institutions.name}</p>
          <p className="invitation-message">
            You've been invited to join {invitation.institutions.name} as a learner.
            Create an account or sign in to get started.
          </p>
        </div>

        {/* Invitation Details */}
        <div className="invitation-details">
          <div className="detail-item">
            <Mail size={18} />
            <span>{invitation.email}</span>
          </div>
          {invitation.employee_name && (
            <div className="detail-item">
              <User size={18} />
              <span>{invitation.employee_name}</span>
            </div>
          )}
          {invitation.job_title && (
            <div className="detail-item">
              <Building2 size={18} />
              <span>{invitation.job_title}</span>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
          <button
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="acceptance-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  value={invitation.email}
                  className="form-input"
                  disabled
                />
              </div>
              <p className="form-help-text">This email is associated with your invitation</p>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Create a password (min. 8 characters)"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={18} className="spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Join
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="form-footer-text">
              By creating an account, you agree to join {invitation.institutions.name} and access their learning programs.
            </p>
          </form>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="acceptance-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="loginEmail"
                  value={formData.loginEmail}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  name="loginPassword"
                  value={formData.loginPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={18} className="spinner" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In & Join
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="form-footer-text">
              Already have an account? Sign in to link it to {invitation.institutions.name}.
            </p>
          </form>
        )}

        {/* Footer */}
        <div className="invitation-footer">
          <p>
            Need help? Contact {invitation.institutions.name} administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InvitationAccept
