import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, User, Phone, MapPin, Users, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Auth.css'

const InstitutionalSignup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    institutionName: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    numberOfEmployees: '',
    industry: ''
  })

  const industries = [
    'Banking & Finance',
    'Government',
    'Healthcare',
    'Education',
    'Technology',
    'Manufacturing',
    'Retail',
    'NGO/Non-Profit',
    'Other'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.institutionName.trim()) {
      setError('Institution name is required')
      return
    }

    if (!formData.adminEmail.trim()) {
      setError('Admin email is required')
      return
    }

    setLoading(true)

    try {
      // 1. Create auth user for admin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.adminName,
            role: 'institutional_admin'
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create admin account')
      }

      // 2. Create profile for admin
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: formData.adminEmail.toLowerCase().trim(),
          full_name: formData.adminName,
          role: 'institutional_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Continue anyway - profile will be created from metadata
      }

      // 3. Create institution record
      const estimatedSeats = parseInt(formData.numberOfEmployees) || 10
      const { data: institution, error: institutionError } = await supabase
        .from('institutions')
        .insert({
          name: formData.institutionName.trim(),
          admin_user_id: authData.user.id,
          contact_email: formData.adminEmail.toLowerCase().trim(),
          contact_phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          industry: formData.industry || null,
          status: 'active',
          total_seats: estimatedSeats,
          used_seats: 0,
          subscription_status: 'trial',
          subscription_plan: 'trial',
          billing_cycle: 'monthly',
          price_per_seat: 15000.00, // 15,000 RWF per seat
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
          next_billing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (institutionError) throw institutionError

      // 4. Create institution_admin record
      const { error: adminError } = await supabase
        .from('institution_admins')
        .insert({
          institution_id: institution.id,
          user_id: authData.user.id,
          role: 'super_admin',
          permissions: {
            manage_learners: true,
            assign_courses: true,
            view_reports: true,
            manage_billing: true,
            manage_admins: true,
            manage_settings: true
          },
          invited_by: authData.user.id,
          status: 'active',
          created_at: new Date().toISOString()
        })

      if (adminError) throw adminError

      // Success! Redirect to institutional portal
      navigate('/institutional/overview', {
        state: {
          message: `Welcome to ${institution.name}! Your 14-day trial has started.`
        }
      })

    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create institution account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Building2 size={32} />
          </div>
          <h1>Create Institutional Account</h1>
          <p>Start your 14-day free trial. No credit card required.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Institution Details */}
          <div className="form-section">
            <h3 className="form-section-title">Institution Details</h3>

            <div className="form-group">
              <label className="form-label">Institution Name *</label>
              <div className="input-with-icon">
                <Building2 size={18} />
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Rwanda Development Board"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Employees</label>
                <div className="input-with-icon">
                  <Users size={18} />
                  <input
                    type="number"
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Estimated count"
                    min="1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+250 XXX XXX XXX"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City, Country"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Admin Account */}
          <div className="form-section">
            <h3 className="form-section-title">Admin Account</h3>

            <div className="form-group">
              <label className="form-label">Your Full Name *</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="admin@institution.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                Creating Account...
              </>
            ) : (
              'Create Account & Start Trial'
            )}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/auth/institutional/login">Sign In</Link>
            </p>
          </div>

          <div className="trial-info">
            <p className="trial-info-title">✨ What's included in your trial:</p>
            <ul className="trial-info-list">
              <li>14 days free access</li>
              <li>Invite up to {formData.numberOfEmployees || '10'} employees</li>
              <li>Access to all courses</li>
              <li>Progress tracking & reports</li>
              <li>No credit card required</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InstitutionalSignup
