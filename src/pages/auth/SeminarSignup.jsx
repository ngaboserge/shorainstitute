import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { User, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react'
import './Auth.css'

const SeminarSignup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Get seminar info from URL params or state
  const searchParams = new URLSearchParams(location.search)
  const seminarId = searchParams.get('seminar') || location.state?.seminarId
  const returnTo = location.state?.returnTo || '/learner/seminars'
  const directToForm = location.state?.directToForm || false

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // If coming from QR code flow, go directly to registration form
        if (directToForm && seminarId) {
          navigate(`/seminar/${seminarId}/register`)
        } else {
          navigate(returnTo)
        }
      }
    }
    checkUser()
  }, [navigate, returnTo, directToForm, seminarId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: 'learner'
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setErrors({ email: 'Email already registered. Please login instead.' })
        } else {
          setErrors({ general: signUpError.message })
        }
        return
      }

      if (!authData.user) {
        setErrors({ general: 'Failed to create account' })
        return
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          user_type: 'learner',
          onboarding_completed: true
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      setSuccess(true)
      
      setTimeout(() => {
        // If coming from QR code flow, go directly to registration form
        if (directToForm && seminarId) {
          navigate(`/seminar/${seminarId}/register`)
        } else {
          navigate(returnTo, { 
            state: { 
              message: 'Account created! You can now register for seminars.',
              seminarId: seminarId 
            } 
          })
        }
      }, 2000)

    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="success-message-card">
            <CheckCircle size={64} color="#4caf50" />
            <h2>Account Created Successfully!</h2>
            <p>Welcome to SHORA Institute</p>
            <p className="redirect-text">Taking you to seminars...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Calendar size={48} color="#0B4F9F" />
          <h1>Join a Free Seminar</h1>
          <p>Create your account to register for upcoming seminars</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={20} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={errors.fullName ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={20} />
              <input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <span className="help-text">Minimum 6 characters</span>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link 
              to="/auth/seminar/login" 
              state={{ returnTo, seminarId }}
            >
              Login here
            </Link>
          </p>
        </div>

        <div className="auth-benefits">
          <h3>Free Access Includes:</h3>
          <ul>
            <li>✓ Join live seminars with expert speakers</li>
            <li>✓ Ask questions in real-time</li>
            <li>✓ Network with other learners</li>
            <li>✓ Download session materials</li>
            <li>✓ Access to all upcoming seminars</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SeminarSignup
