import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react'
import './Auth.css'

const InstitutionalLogin = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      // Check if user is institutional admin
      const { data: institutionData, error: institutionError } = await supabase
        .from('institutions')
        .select('id, name')
        .eq('admin_user_id', data.user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (institutionError) {
        console.error('Error checking institution:', institutionError)
        setErrors({ general: 'Error verifying institutional access' })
        await supabase.auth.signOut()
        return
      }

      if (!institutionData) {
        setErrors({ 
          general: 'This account is not authorized for institutional access. Please contact your administrator.' 
        })
        await supabase.auth.signOut()
        return
      }

      // Success! Navigate to institutional portal
      navigate('/institutional/overview')

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
        {/* Role Switcher at Top */}
        <div className="role-switcher">
          <Link to="/auth/learner/login" className="role-btn">
            Learner Login
          </Link>
          <Link to="/auth/trainer/login" className="role-btn">
            Trainer Login
          </Link>
          <Link to="/auth/institutional/login" className="role-btn active">
            Institutional Login
          </Link>
        </div>

        <div className="auth-header">
          <div className="auth-icon institutional">
            <Building2 size={32} />
          </div>
          <h1>Institutional Portal</h1>
          <p>Sign in to manage your institution's learning programs</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-group">
            <label>Institutional Email</label>
            <div className="input-with-icon">
              <Mail size={20} />
              <input
                type="email"
                placeholder="admin@yourinstitution.com"
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
                tabIndex="-1"
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
            {loading ? 'Signing in...' : 'Access Institutional Portal'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="info-text">
            <AlertCircle size={16} />
            Institutional portal access is restricted to authorized administrators only.
          </p>
          <p className="switch-role">
            Need institutional access?{' '}
            <a href="mailto:support@shorainstitute.rw">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default InstitutionalLogin
