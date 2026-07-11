import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Profile.css'

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [stats, setStats] = useState({
    completedCourses: 0,
    certificates: 0,
    learningHours: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingPrefs, setIsEditingPrefs] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: ''
  })
  
  const [preferences, setPreferences] = useState({
    learning_style: 'self-paced',
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false
  })

  useEffect(() => {
    if (user?.id) {
      loadProfileStats()
    }
    // Initialize form data from profile
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || ''
      })
      setPreferences({
        learning_style: profile.learning_style || 'self-paced',
        email_notifications: profile.email_notifications ?? true,
        sms_notifications: profile.sms_notifications ?? true,
        push_notifications: profile.push_notifications ?? false
      })
    }
  }, [user?.id, profile])

  const loadProfileStats = async () => {
    try {
      // Load enrollments with course progress
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            title,
            total_duration_seconds,
            total_lessons
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Calculate stats
      const completed = enrollments?.filter(e => e.completion_percentage === 100) || []
      const totalSeconds = enrollments?.reduce((sum, e) => {
        return sum + (e.courses?.total_duration_seconds || 0)
      }, 0) || 0

      setStats({
        completedCourses: completed.length,
        certificates: completed.length, // 1:1 for now
        learningHours: (totalSeconds / 3600).toFixed(1),
        currentStreak: 7 // Calculate later based on last_accessed_at
      })
    } catch (error) {
      console.error('Error loading profile stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveInfo = async () => {
    setSaving(true)
    setSuccessMessage('')
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile in context
      if (refreshProfile) {
        await refreshProfile()
      }

      setSuccessMessage('Profile updated successfully!')
      setIsEditingInfo(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    setSuccessMessage('')
    try {
      const { error } = await supabase
        .from('users')
        .update({
          learning_style: preferences.learning_style,
          email_notifications: preferences.email_notifications,
          sms_notifications: preferences.sms_notifications,
          push_notifications: preferences.push_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile in context
      if (refreshProfile) {
        await refreshProfile()
      }

      setSuccessMessage('Preferences saved successfully!')
      setIsEditingPrefs(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Profile" 
          subtitle="Manage your account settings and preferences"
        />
        <div className="content-wrapper">
          <div className="profile-grid">
            <div className="profile-main">
              <div className="card">
                <div className="profile-header">
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: '600'
                  }}>
                    {formData.full_name?.charAt(0) || profile?.full_name?.charAt(0) || 'L'}
                  </div>
                  <div className="profile-info">
                    <h2>{formData.full_name || profile?.full_name || 'Learner'}</h2>
                    <p>Learner since {formatDate(profile?.created_at)}</p>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsEditingInfo(!isEditingInfo)}
                    >
                      <Edit size={16} />
                      {isEditingInfo ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                </div>
                
                {successMessage && (
                  <div style={{
                    padding: '12px',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '8px',
                    marginTop: '16px',
                    textAlign: 'center'
                  }}>
                    {successMessage}
                  </div>
                )}
              </div>

              <div className="card">
                <h3>Personal Information</h3>
                {isEditingInfo ? (
                  <div style={{ marginTop: '20px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveInfo}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setIsEditingInfo(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="info-grid">
                      <div className="info-item">
                        <Mail size={18} color="#0B4F9F" />
                        <div>
                          <div className="info-label">Email</div>
                          <div className="info-value">{user?.email || 'Not set'}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <Phone size={18} color="#0B4F9F" />
                        <div>
                          <div className="info-label">Phone</div>
                          <div className="info-value">{formData.phone || 'Not set'}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <MapPin size={18} color="#0B4F9F" />
                        <div>
                          <div className="info-label">Location</div>
                          <div className="info-value">{formData.location || 'Not set'}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar size={18} color="#0B4F9F" />
                        <div>
                          <div className="info-label">Member Since</div>
                          <div className="info-value">{formatDate(profile?.created_at)}</div>
                        </div>
                      </div>
                    </div>
                    {formData.bio && (
                      <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 500, marginBottom: '8px' }}>Bio</div>
                        <p style={{ color: '#666', lineHeight: 1.6 }}>{formData.bio}</p>
                      </div>
                    )}
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditingInfo(true)}
                      style={{ marginTop: '20px' }}
                    >
                      Update Information
                    </button>
                  </>
                )}
              </div>

              <div className="card">
                <h3>Learning Preferences</h3>
                {isEditingPrefs ? (
                  <div style={{ marginTop: '20px' }}>
                    <div className="preferences-list">
                      <div className="preference-item">
                        <label>Preferred Learning Style</label>
                        <select 
                          className="preference-select"
                          value={preferences.learning_style}
                          onChange={(e) => handlePreferenceChange('learning_style', e.target.value)}
                        >
                          <option value="self-paced">Self-paced</option>
                          <option value="live-sessions">Live sessions</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>
                      <div className="preference-item">
                        <label>Notification Preferences</label>
                        <div className="checkbox-list">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={preferences.email_notifications}
                              onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                            /> 
                            Email notifications
                          </label>
                          <label>
                            <input 
                              type="checkbox"
                              checked={preferences.sms_notifications}
                              onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                            /> 
                            SMS notifications
                          </label>
                          <label>
                            <input 
                              type="checkbox"
                              checked={preferences.push_notifications}
                              onChange={(e) => handlePreferenceChange('push_notifications', e.target.checked)}
                            /> 
                            Push notifications
                          </label>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSavePreferences}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Preferences'}
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setIsEditingPrefs(false)}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="preferences-list">
                      <div className="preference-item">
                        <label>Preferred Learning Style</label>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px', marginTop: '8px' }}>
                          {preferences.learning_style === 'self-paced' && 'Self-paced'}
                          {preferences.learning_style === 'live-sessions' && 'Live sessions'}
                          {preferences.learning_style === 'mixed' && 'Mixed'}
                        </div>
                      </div>
                      <div className="preference-item">
                        <label>Notification Preferences</label>
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ padding: '8px', color: '#666' }}>
                            ✓ Email notifications: {preferences.email_notifications ? 'Enabled' : 'Disabled'}
                          </div>
                          <div style={{ padding: '8px', color: '#666' }}>
                            ✓ SMS notifications: {preferences.sms_notifications ? 'Enabled' : 'Disabled'}
                          </div>
                          <div style={{ padding: '8px', color: '#666' }}>
                            ✓ Push notifications: {preferences.push_notifications ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditingPrefs(true)}
                      style={{ marginTop: '20px' }}
                    >
                      Edit Preferences
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="profile-sidebar">
              <div className="card">
                <h4>Learning Stats</h4>
                <div className="stat-list">
                  <div className="stat-row">
                    <span>Courses Completed</span>
                    <strong>{stats.completedCourses}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Certificates Earned</span>
                    <strong>{stats.certificates}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Learning Hours</span>
                    <strong>{stats.learningHours}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Current Streak</span>
                    <strong>{stats.currentStreak} days</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4>Account Settings</h4>
                <div className="settings-links">
                  <a href="#">Change Password</a>
                  <a href="#">Privacy Settings</a>
                  <a href="#">Delete Account</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
