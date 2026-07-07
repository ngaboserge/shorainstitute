import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Video, 
  BarChart3, 
  Award,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Search
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ type = 'institutional' }) => {
  const location = useLocation()
  
  const institutionalMenuItems = [
    { path: '/institutional/overview', icon: LayoutDashboard, label: 'Overview' },
    { path: '/institutional/learners', icon: Users, label: 'Learners' },
    { path: '/institutional/programmes', icon: BookOpen, label: 'Programmes' },
    { path: '/institutional/live-seminars', icon: Video, label: 'Live Seminars' },
    { path: '/institutional/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { path: '/institutional/certificates', icon: Award, label: 'Certificates' },
    { path: '/institutional/billing', icon: CreditCard, label: 'Billing & Subscriptions' },
    { path: '/institutional/settings', icon: Settings, label: 'Settings' },
  ]

  const trainerMenuItems = [
    { path: '/trainer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trainer/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/trainer/sessions', icon: Video, label: 'Live Seminars' },
    { path: '/trainer/proposals', icon: BookOpen, label: 'Proposals' },
    { path: '/trainer/qa', icon: HelpCircle, label: 'Learner Q&A' },
    { path: '/trainer/resources', icon: BookOpen, label: 'Resources' },
    { path: '/trainer/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/trainer/profile', icon: Users, label: 'Profile' },
    { path: '/trainer/settings', icon: Settings, label: 'Settings' },
  ]

  const learnerMenuItems = [
    { path: '/learner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/learner/courses', icon: BookOpen, label: 'My Learning' },
    { path: '/learner/browse', icon: Search, label: 'Browse Courses' },
    { path: '/learner/seminars', icon: Video, label: 'Live Seminars' },
    { path: '/learner/pathway', icon: BarChart3, label: 'Learning Paths' },
    { path: '/learner/assessments', icon: Award, label: 'Assessments & Assignments' },
    { path: '/learner/certificates', icon: Award, label: 'Certificates' },
    { path: '/learner/resources', icon: BookOpen, label: 'Resources' },
    { path: '/learner/community', icon: Users, label: 'Community' },
    { path: '/learner/profile', icon: Users, label: 'My Profile' },
    { path: '/learner/settings', icon: Settings, label: 'Settings' },
  ]

  const menuItems = type === 'trainer' 
    ? trainerMenuItems 
    : type === 'learner'
    ? learnerMenuItems
    : institutionalMenuItems

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" width="40" height="40">
              <rect fill="#FDB714" width="100" height="100" rx="8"/>
              <path d="M 25 75 L 50 25 L 75 50" stroke="#0B4F9F" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="logo-text">
            <div className="logo-title">SHORA</div>
            <div className="logo-subtitle">INSTITUTE</div>
          </div>
        </div>
        <div className="sidebar-subtitle">
          {type === 'institutional' ? 'Institutional Portal' : 
           type === 'trainer' ? 'Trainer Portal' : 
           'Learner Portal'}
        </div>
        <div className="sidebar-tagline">Empowering Minds, Building Wealth.</div>
      </div>

      {type === 'institutional' && (
        <div className="organization-selector">
          <div className="org-badge">
            <div className="org-icon">🛡️</div>
            <div className="org-info">
              <div className="org-name">Rwanda Development Bank</div>
              <div className="org-status">Premium Partner</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="account-manager">
          <div className="manager-label">Your Account Manager</div>
          <div className="manager-card">
            <img 
              src="https://i.pravatar.cc/150?img=33" 
              alt="Eric Mugisha" 
              className="manager-avatar"
            />
            <div className="manager-info">
              <div className="manager-name">Eric Mugisha</div>
              <div className="manager-contact">+250 788 123 456</div>
              <div className="manager-email">eric.mugisha@shora.rw</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm contact-btn">
            <span>📧</span> Contact Eric
          </button>
        </div>

        <button className="logout-btn">
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
