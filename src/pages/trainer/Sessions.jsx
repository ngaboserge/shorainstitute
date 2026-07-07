import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Calendar as CalendarIcon, Video, Users, Clock, MapPin, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react'
import './Sessions.css'

const Sessions = () => {
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [currentMonth, setCurrentMonth] = useState('May 2025')

  const sessions = [
    {
      id: 1,
      type: 'Live Seminar',
      title: 'Tax Planning for Investors & SMEs',
      format: 'Live Webinar',
      date: 'May 28, 2025',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      registered: 78,
      capacity: 150,
      audience: 'Open to All',
      status: 'Upcoming',
      featured: true
    },
    {
      id: 2,
      type: 'Masterclass',
      title: 'Entrepreneurial Finance: Funding & Valuation',
      format: 'Masterclass',
      date: 'May 29, 2025',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      registered: 78,
      capacity: 160,
      audience: 'Open to All',
      status: 'Upcoming'
    },
    {
      id: 3,
      type: 'Live Seminar',
      title: 'Financial Modeling for Professionals',
      format: 'Live Webinar',
      date: 'May 10, 2025',
      time: '10:00 AM - 11:30 AM (EAT)',
      platform: 'Zoom',
      registered: 140,
      capacity: 180,
      audience: 'Enrolled Only',
      status: 'Completed'
    },
    {
      id: 4,
      type: 'Masterclass',
      title: 'Behavioral Finance for Better Decisions',
      format: 'Masterclass',
      date: 'Apr 24, 2025',
      time: '2:00 PM - 3:30 PM (EAT)',
      platform: 'Zoom',
      registered: 60,
      capacity: 80,
      audience: 'Enrolled Only',
      status: 'Completed'
    },
    {
      id: 5,
      type: 'Live Seminar',
      title: 'ESG Investing: Principles & Practice',
      format: 'Live Webinar',
      date: 'Apr 22, 2025',
      time: '11:00 AM - 12:30 PM (EAT)',
      platform: 'Zoom',
      registered: 110,
      capacity: 150,
      audience: 'Enrolled Only',
      status: 'Draft'
    }
  ]

  const calendarEvents = [
    { day: 14, title: 'Capital Markets', type: 'seminar' },
    { day: 21, title: 'Tax Planning', type: 'masterclass' },
    { day: 27, title: 'Multiple Sessions', type: 'multiple' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="My Sessions & Calendar"
          subtitle="Plan, manage, and deliver impactful learning experiences."
          actions={
            <>
              <button className="btn btn-secondary">
                <Copy size={18} />
                Duplicate Session
              </button>
              <button className="btn btn-warning">
                <Plus size={18} />
                Create Session
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Tabs */}
          <div className="sessions-tabs">
            <button className={`tab ${activeTab === 'Upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('Upcoming')}>
              <CalendarIcon size={16} />
              Upcoming
              <span className="tab-count">7</span>
            </button>
            <button className={`tab ${activeTab === 'Draft' ? 'active' : ''}`} onClick={() => setActiveTab('Draft')}>
              <Edit size={16} />
              Draft
              <span className="tab-count">3</span>
            </button>
            <button className={`tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>
              <Clock size={16} />
              Completed
              <span className="tab-count">28</span>
            </button>
            <button className={`tab ${activeTab === 'Requests' ? 'active' : ''}`} onClick={() => setActiveTab('Requests')}>
              <Users size={16} />
              Requests
              <span className="tab-count warning">2</span>
            </button>
          </div>

          <div className="sessions-grid">
            {/* Left - Sessions List */}
            <div className="sessions-main">
              <div className="sessions-list">
                {sessions.filter(s => activeTab === 'Upcoming' ? s.status === 'Upcoming' : s.status === activeTab).map((session) => (
                  <div key={session.id} className={`session-card ${session.featured ? 'featured' : ''}`}>
                    {session.featured && <div className="featured-badge">FEATURED SESSION</div>}
                    
                    <div className="session-header">
                      <div className="session-type-badge">{session.type}</div>
                      <button className="btn-icon">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    <h3 className="session-title">{session.title}</h3>

                    <div className="session-details-grid">
                      <div className="session-detail">
                        <CalendarIcon size={16} />
                        <span>{session.date}</span>
                      </div>
                      <div className="session-detail">
                        <Clock size={16} />
                        <span>{session.time}</span>
                      </div>
                      <div className="session-detail">
                        <MapPin size={16} />
                        <span>Live on {session.platform}</span>
                      </div>
                      <div className="session-detail">
                        <Users size={16} />
                        <span>{session.registered} / {session.capacity} registered</span>
                      </div>
                    </div>

                    <div className="session-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${(session.registered / session.capacity) * 100}%`}}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Math.round((session.registered / session.capacity) * 100)}% capacity
                      </span>
                    </div>

                    <div className="session-footer">
                      <span className="session-audience">
                        <Users size={14} /> {session.audience}
                      </span>
                      <div className="session-actions">
                        <button className="btn btn-sm btn-secondary">
                          View Details
                        </button>
                        <button className="btn btn-sm btn-primary">
                          Manage Session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Calendar & Availability */}
            <div className="sessions-sidebar">
              {/* Mini Calendar */}
              <div className="card calendar-card">
                <div className="calendar-header">
                  <button className="btn-icon" onClick={() => setCurrentMonth('Apr 2025')}>
                    <ChevronLeft size={18} />
                  </button>
                  <h3 className="calendar-month">{currentMonth}</h3>
                  <button className="btn-icon" onClick={() => setCurrentMonth('Jun 2025')}>
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="calendar-grid">
                  <div className="calendar-day-header">SUN</div>
                  <div className="calendar-day-header">MON</div>
                  <div className="calendar-day-header">TUE</div>
                  <div className="calendar-day-header">WED</div>
                  <div className="calendar-day-header">THU</div>
                  <div className="calendar-day-header">FRI</div>
                  <div className="calendar-day-header">SAT</div>
                  
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1
                    const event = calendarEvents.find(e => e.day === day)
                    const isToday = day === 14
                    return (
                      <div 
                        key={i} 
                        className={`calendar-day ${event ? 'has-event' : ''} ${isToday ? 'today' : ''}`}
                        title={event ? event.title : ''}
                      >
                        {day}
                        {event && <div className={`event-dot ${event.type}`}></div>}
                      </div>
                    )
                  })}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-dot seminar"></span>
                    <span>Session</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot multiple"></span>
                    <span>Multiple Sessions</span>
                  </div>
                </div>
              </div>

              {/* My Availability */}
              <div className="card">
                <h3 className="card-title">My Availability</h3>
                <p className="card-subtitle-small">Your availability helps learners book sessions and connect with you</p>
                
                <button className="btn btn-secondary btn-full availability-btn">
                  Edit Availability
                </button>

                <div className="availability-info">
                  <div className="availability-item">
                    <Clock size={16} />
                    <div>
                      <div className="availability-label">Time Zone</div>
                      <div className="availability-value">East Africa Time (EAT)</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <CalendarIcon size={16} />
                    <div>
                      <div className="availability-label">Weekly Availability</div>
                      <div className="availability-value">Mon - Fri, 6:00 AM - 6:00 PM</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <Clock size={16} />
                    <div>
                      <div className="availability-label">Preferred Session Length</div>
                      <div className="availability-value">60 - 120 minutes</div>
                    </div>
                  </div>
                  <div className="availability-item">
                    <Users size={16} />
                    <div>
                      <div className="availability-label">Notice Required</div>
                      <div className="availability-value">At least 48 hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Expert Sessions */}
              <div className="card expert-card">
                <h3 className="card-title">Invited Trusted Expert</h3>
                <p className="card-subtitle-small">
                  As an invited trainer, you can host sessions, seminars, and masterclasses across Africa to support 
                  institutions and learners in their learning journey.
                </p>
                
                <div className="expert-banner">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400" alt="Expert Session" />
                  <div className="expert-content">
                    <h4>Share knowledge. Build impact.</h4>
                  </div>
                </div>

                <button className="btn btn-warning btn-full">
                  Explore Trainer Resources →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sessions
