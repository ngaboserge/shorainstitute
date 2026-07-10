import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Bell, HelpCircle, ChevronDown, User } from 'lucide-react'
import './Header.css'

const Header = ({ title, subtitle, actions }) => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleProfileClick = () => {
    if (profile?.role === 'trainer') {
      navigate('/trainer/profile')
    } else if (profile?.role === 'learner') {
      navigate('/learner/profile')
    }
  }

  const handleLogout = async () => {
    const currentRole = profile?.role
    await signOut()
    
    // Redirect to appropriate login page based on current role
    if (currentRole === 'learner') {
      navigate('/auth/learner/login', { replace: true })
    } else {
      navigate('/auth/trainer/login', { replace: true })
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      
      <div className="header-right">
        {actions}
        
        <button className="header-icon-btn">
          <HelpCircle size={20} />
          <span>Help</span>
        </button>
        
        <button className="header-icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name || 'User'} 
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar" style={{
              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="user-info">
            <div className="user-name">{profile?.full_name || user?.email || 'User'}</div>
            <div className="user-role">{profile?.role || 'Member'}</div>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  )
}

export default Header
