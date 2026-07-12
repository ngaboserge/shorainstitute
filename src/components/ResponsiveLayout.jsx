import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import './ResponsiveLayout.css'

const ResponsiveLayout = ({ children, title, subtitle, type = 'learner' }) => {
  return (
    <>
      {/* Mobile Navigation (shown on mobile only) */}
      {type === 'learner' && <MobileNav />}
      
      {/* Desktop Layout */}
      <div className="dashboard-layout">
        <Sidebar type={type} />
        <div className="main-content">
          <Header title={title} subtitle={subtitle} />
          <div className="content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default ResponsiveLayout
