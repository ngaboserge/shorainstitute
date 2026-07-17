import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home,
  BookOpen,
  Search,
  Video,
  Award,
  FileText,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react'
import shoraLogo from '../assets/shora-logo.png'
import './MobileNav.css'

const MobileNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth/learner/login')
  }

  const menuItems = [
    { path: '/learner/dashboard', icon: Home, label: 'Home' },
    { path: '/learner/courses', icon: BookOpen, label: 'My Learning' },
    { path: '/learner/browse', icon: Search, label: 'Browse' },
    { path: '/learner/seminars', icon: Video, label: 'Seminars' },
  ]

  const moreItems = [
    { path: '/learner/paths', icon: BookOpen, label: 'Learning Paths' },
    { path: '/learner/assessments', icon: Award, label: 'Assessments' },
    { path: '/learner/certificates', icon: Award, label: 'Certificates' },
    { path: '/learner/resources', icon: FileText, label: 'Resources' },
    { path: '/learner/community', icon: Users, label: 'Community' },
    { path: '/learner/profile', icon: User, label: 'My Profile' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <Menu size={24} />
          </button>
          
          <div className="mobile-logo">
            <img src={shoraLogo} alt="SHORA Institute" style={{ width: '80px', height: '50px', objectFit: 'contain' }} />
          </div>

          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-profile">
                <div className="mobile-avatar">
                  {profile?.full_name?.charAt(0) || 'L'}
                </div>
                <div className="mobile-profile-info">
                  <div className="mobile-profile-name">{profile?.full_name || 'Learner'}</div>
                  <div className="mobile-profile-email">{user?.email}</div>
                </div>
              </div>
              <button className="close-menu-btn" onClick={() => setShowMenu(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="mobile-menu-items">
              {moreItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setShowMenu(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="mobile-menu-footer">
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileNav
