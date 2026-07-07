import React from 'react'
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react'
import './Header.css'

const Header = ({ title, subtitle, actions }) => {
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
        
        <div className="user-menu">
          <img 
            src="https://i.pravatar.cc/150?img=12" 
            alt="User" 
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-name">Jane Uwimana</div>
            <div className="user-role">Admin</div>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  )
}

export default Header
