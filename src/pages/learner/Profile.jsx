import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Profile.css'

const Profile = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    completedCourses: 0,
    certificates: 0,
    learningHours: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadProfileStats()
    }
  }, [user?.id])

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
                    {profile?.full_name?.charAt(0) || 'L'}
                  </div>
                  <div className="profile-info">
                    <h2>{profile?.full_name || 'Learner'}</h2>
                    <p>Learner since {formatDate(profile?.created_at)}</p>
                    <button className="btn btn-secondary btn-sm">
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Personal Information</h3>
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
                      <div className="info-value">{profile?.phone || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin size={18} color="#0B4F9F" />
                    <div>
                      <div className="info-label">Location</div>
                      <div className="info-value">{profile?.location || 'Not set'}</div>
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
                <button className="btn btn-primary">Update Information</button>
              </div>

              <div className="card">
                <h3>Learning Preferences</h3>
                <div className="preferences-list">
                  <div className="preference-item">
                    <label>Preferred Learning Style</label>
                    <select className="preference-select">
                      <option>Self-paced</option>
                      <option>Live sessions</option>
                      <option>Mixed</option>
                    </select>
                  </div>
                  <div className="preference-item">
                    <label>Notification Preferences</label>
                    <div className="checkbox-list">
                      <label><input type="checkbox" defaultChecked /> Email notifications</label>
                      <label><input type="checkbox" defaultChecked /> SMS notifications</label>
                      <label><input type="checkbox" /> Push notifications</label>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Save Preferences</button>
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
