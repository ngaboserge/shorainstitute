import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Calendar } from 'lucide-react'
import './Auth.css'

const SeminarLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Get return URL from state or default to seminars
  const returnTo = location.state?.returnTo || '/learner/seminars'
  const seminarId = location.state?.seminarId
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      // Sign in with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password' })
        } else {
          setErrors({ general: signInError.message })
        }
        return
      }

      if (!authData.user) {
        setErrors({ general: 'Login failed' })
        return
      }

      // Success! Redirect appropriately
      if (directToForm && seminarId) {
        // Go directly to registration form
        navigate(`/seminar/${seminarId}/register`)
      } else {
        // Go to seminars list
        navigate(returnTo, { 
          state: { 
            message: 'Welcome back!',
            seminarId: seminarId 
          } 
        })
      }

    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Login failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Calendar size={48} color="#0B4F9F" />
          <h1>Sign In</h1>
          <p>Access your account to register for seminars</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

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
                autoComplete="email"
                autoFocus
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={errors.password ? 'error' : ''}
                disabled={loading}
                autoComplete="current-password"
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
          </div>

          <div className="form-row space-between">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link 
              to="/auth/seminar/signup" 
              state={{ returnTo, seminarId }}
            >
              Create Account
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

export default SeminarLogin
