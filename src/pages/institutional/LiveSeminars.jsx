import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Video, Users, TrendingUp, Award, Calendar, Plus, Download } from 'lucide-react'
import './LiveSeminars.css'

const LiveSeminars = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  
  const featuredSessions = [
    {
      month: 'MAY',
      day: '07',
      title: 'Financial Statement Analysis for Decision Makers',
      type: 'EXPERT SESSION',
      speakers: ['Dr. James K. Mutungi'],
      platform: 'Zoom',
      time: '10:00 AM - 12:00 PM (EAT)',
      registered: 186,
      status: 'Registered'
    },
    {
      month: 'MAY',
      day: '15',
      title: 'ESG Reporting: Trends, Standards & Impact',
      type: 'EXPERT SESSION',
      speakers: ['Dr. James K. Mutungi'],
      platform: 'Zoom',
      time: '2:00 PM - 4:00 PM (EAT)',
      registered: 214,
      status: 'Registered'
    },
    {
      month: 'MAY',
      day: '21',
      title: 'Investment Risk Assessment Essentials',
      type: 'WEBINAR',
      speakers: ['Alice Uwase'],
      platform: 'Hybrid',
      time: '9:00 AM - 11:00 AM (EAT)',
      registered: 147,
      status: 'In Discussion'
    },
    {
      month: 'MAY',
      day: '27',
      title: 'Treasury Operations & Cash Flow Optimization',
      type: 'SEMINAR',
      speakers: ['Invited Expert'],
      platform: 'Zoom',
      time: '3:00 PM - 5:00 PM (EAT)',
      registered: 192,
      status: 'Registered'
    }
  ]

  const registeredSessions = [
    {
      title: 'Financial Statement Analysis for Decision Makers',
      type: 'Expert Session',
      date: 'May 10, 2026 • 9:00 PM-12:00 PM',
      registered: 186,
      status: 'Registered'
    },
    {
      title: 'ESG Reporting: Trends, Standards & Impact',
      type: 'Expert Session',
      date: 'May 15, 2026 • 2:00 PM-4:00 PM',
      registered: 214,
      status: 'Registered'
    },
    {
      title: 'Investment Risk Assessment Essentials',
      type: 'Webinar',
      date: 'May 21, 2026 • 9:00 AM-11:00 AM',
      registered: 147,
      status: 'In Discussion'
    }
  ]

  const customSessions = [
    {
      title: 'Custom: Internal Audit Best Practices',
      requestor: 'Finance Team',
      date: 'Recorded on: Apr 26, 2026',
      status: 'Recorded'
    },
    {
      title: 'Custom: Credit Risk Assessment',
      requestor: 'Credit & Risk Team',
      date: 'Requested on: Apr 26, 2026',
      status: 'In Discussion'
    },
    {
      title: 'Custom: Fraud Prevention Workshop',
      requestor: 'Compliance Team',
      date: 'Requested on: May 1, 2026',
      status: 'Pending'
    },
    {
      title: 'Custom: Treasury Operations Optimization',
      requestor: 'Treasury Team',
      date: 'Requested on: May 2, 2026',
      status: 'Pending'
    }
  ]

  const attendanceHistory = [
    {
      title: 'Legal Structures for Startups and SMEs',
      date: 'Apr 20, 2026',
      attendees: 'Corporate Governance Essentials',
      completion: 85
    },
    {
      title: 'Introduction to Capital Markets and Securities',
      date: 'Apr 16, 2026',
      attendees: 'Financial Modeling Fundamentals',
      completion: 78
    },
    {
      title: 'Financial Statements Analysis',
      date: 'Apr 2, 2026',
      attendees: 'AML-KYC Compliance Update',
      completion: 77
    }
  ]

  const recommendedExperts = [
    {
      name: 'Advanced Risk Analytics with AI',
      tag: 'INVITED EXPERT',
      expert: 'Expert: Prof. David Kirundo',
      date: 'Jun 3, 2026 • 10:00 AM (EAT)',
      platform: 'Zoom',
      attendees: 'Live Webinar'
    },
    {
      name: 'Sustainable Finance & Green Bonds',
      tag: 'INVITED EXPERT',
      expert: 'Expert: Dr. Foluke Olajede',
      date: 'Jun 12, 2026 • 2:00 PM (EAT)',
      platform: 'Hybrid',
      attendees: 'Live Webinar'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Live Seminars"
          subtitle="Manage live sessions, registrations, bespoke requests, and attendance."
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Request a Live Session
              </button>
              <button className="btn btn-secondary">
                <Download size={18} />
                Download Attendance
              </button>
              <button className="btn btn-warning">
                <Plus size={18} />
                Add to Calendar
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="seminars-stats-grid">
            <div className="seminars-stat-card">
              <div className="seminars-stat-icon blue">
                <Calendar size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">22</div>
                <div className="seminars-stat-label">Upcoming Sessions</div>
                <div className="seminars-stat-meta">↑ 13% vs last month</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon yellow">
                <Users size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">1,482</div>
                <div className="seminars-stat-label">Registered Learners</div>
                <div className="seminars-stat-meta">↑ 18% vs last month</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon green">
                <TrendingUp size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">76%</div>
                <div className="seminars-stat-label">Average Attendance</div>
                <div className="seminars-stat-meta">↑ 4% vs last month</div>
              </div>
            </div>

            <div className="seminars-stat-card">
              <div className="seminars-stat-icon orange">
                <Award size={24} />
              </div>
              <div className="seminars-stat-content">
                <div className="seminars-stat-value">148</div>
                <div className="seminars-stat-label">CPD Credits Earned</div>
                <div className="seminars-stat-meta">↑ 25% vs last month</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="seminars-content-grid">
            {/* Left Side - Calendar and Featured */}
            <div className="seminars-main-section">
              {/* Calendar */}
              <div className="card calendar-card">
                <div className="calendar-header">
                  <button className="calendar-nav-btn">‹</button>
                  <h3 className="calendar-title">{selectedMonth}</h3>
                  <button className="calendar-nav-btn">›</button>
                  <button className="calendar-today-btn">Today</button>
                </div>
                
                <div className="calendar-weekdays">
                  <div className="weekday">Sun</div>
                  <div className="weekday">Mon</div>
                  <div className="weekday">Tue</div>
                  <div className="weekday">Wed</div>
                  <div className="weekday">Thu</div>
                  <div className="weekday">Fri</div>
                  <div className="weekday">Sat</div>
                </div>

                <div className="calendar-grid">
                  {[...Array(31)].map((_, i) => (
                    <div key={i} className={`calendar-day ${i === 6 ? 'has-event' : ''} ${i === 14 ? 'has-event' : ''} ${i === 20 ? 'today' : ''}`}>
                      <span className="day-number">{i + 1}</span>
                      {i === 6 && <div className="event-dot"></div>}
                      {i === 14 && <div className="event-dot"></div>}
                    </div>
                  ))}
                </div>

                <div className="calendar-legend">
                  <div className="legend-item-cal">
                    <span className="legend-dot-cal live"></span>
                    <span>Live Seminar</span>
                  </div>
                  <div className="legend-item-cal">
                    <span className="legend-dot-cal custom"></span>
                    <span>Custom Session</span>
                  </div>
                </div>
              </div>

              {/* Featured Upcoming Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="section-title-seminars">Featured Upcoming Sessions</h3>
                  <a href="#" className="view-all-link-seminars">View all</a>
                </div>

                <div className="featured-sessions-list">
                  {featuredSessions.map((session, index) => (
                    <div key={index} className="featured-session-item">
                      <div className="session-date-badge">
                        <div className="session-month">{session.month}</div>
                        <div className="session-day">{session.day}</div>
                      </div>
                      <div className="session-details">
                        <div className="session-type-badge">{session.type}</div>
                        <h4 className="session-title">{session.title}</h4>
                        <div className="session-meta">
                          <span>🎥 {session.platform}</span>
                          <span>🕐 {session.time}</span>
                          <span>👥 {session.registered} Registered</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button className="btn-session-primary">View Details</button>
                        <button className="btn-session-secondary">Send Reminder</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="seminars-sidebar">
              {/* Quick Actions */}
              <div className="card quick-actions-seminars">
                <h3 className="sidebar-title-seminars">Quick Actions</h3>
                <div className="quick-actions-list">
                  <button className="quick-action-btn">
                    <Calendar size={18} />
                    <span>Request Custom Session</span>
                  </button>
                  <button className="quick-action-btn">
                    <Users size={18} />
                    <span>Send Reminder</span>
                  </button>
                  <button className="quick-action-btn">
                    <Download size={18} />
                    <span>Download Attendance</span>
                  </button>
                  <button className="quick-action-btn">
                    <Video size={18} />
                    <span>View Session Reports</span>
                  </button>
                </div>
              </div>

              {/* Registered Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="sidebar-title-seminars">Registered Sessions</h3>
                  <a href="#" className="view-all-link-seminars">View all</a>
                </div>
                <div className="registered-sessions-list">
                  {registeredSessions.map((session, index) => (
                    <div key={index} className="registered-session-item">
                      <div className="registered-session-icon">📅</div>
                      <div className="registered-session-info">
                        <div className="registered-session-title">{session.title}</div>
                        <div className="registered-session-date">{session.date}</div>
                        <span className={`session-status-badge ${session.status === 'Registered' ? 'registered' : 'discussion'}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Requested Sessions */}
              <div className="card">
                <div className="section-header-seminars">
                  <h3 className="sidebar-title-seminars">Requested Custom Sessions</h3>
                  <a href="#" className="view-all-link-seminars">View all</a>
                </div>
                <div className="custom-sessions-list">
                  {customSessions.map((session, index) => (
                    <div key={index} className="custom-session-item">
                      <div className="custom-session-icon">🎯</div>
                      <div className="custom-session-info">
                        <div className="custom-session-title">{session.title}</div>
                        <div className="custom-session-requestor">{session.requestor}</div>
                        <div className="custom-session-date">{session.date}</div>
                        <span className={`session-status-badge ${
                          session.status === 'Recorded' ? 'recorded' : 
                          session.status === 'In Discussion' ? 'discussion' : 
                          'pending'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="seminars-bottom-grid">
            <div className="card">
              <h3 className="section-title-seminars">Attendance History</h3>
              <div className="attendance-list">
                {attendanceHistory.map((item, index) => (
                  <div key={index} className="attendance-item">
                    <div className="attendance-icon">✓</div>
                    <div className="attendance-info">
                      <div className="attendance-title">{item.title}</div>
                      <div className="attendance-date">{item.date} • {item.attendees}</div>
                    </div>
                    <div className="attendance-completion">{item.completion}%</div>
                    <button className="btn-view-certificate">View Certificate</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title-seminars">Recommended Expert Sessions</h3>
              <div className="recommended-experts-list">
                {recommendedExperts.map((expert, index) => (
                  <div key={index} className="expert-session-item">
                    <div className="expert-badge">{expert.tag}</div>
                    <div className="expert-session-title">{expert.name}</div>
                    <div className="expert-session-expert">{expert.expert}</div>
                    <div className="expert-session-meta">
                      <span>📅 {expert.date}</span>
                      <span>🎥 {expert.platform}</span>
                      <span>👥 {expert.attendees}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveSeminars
