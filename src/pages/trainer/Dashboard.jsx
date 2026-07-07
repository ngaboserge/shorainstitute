import React from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Calendar, BookOpen, Users, Star, ChevronRight, MessageSquare, Upload, Shield, TrendingUp, CheckCircle, FileText, HelpCircle } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const nextSeminar = {
    title: 'Capital Markets Outlook & Investment Strategies',
    date: 'Wed, May 14, 2025',
    time: '6:05 PM - 7:30 PM (EAT)',
    platform: 'Live on Zoom',
    registered: 128,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'
  }

  const proposalApprovals = [
    { title: 'Behavioral Finance for Better Decisions', subtitle: 'Course Proposal', status: 'Approval', date: 'Submitted Apr 20, 2025' },
    { title: 'ESG Investing: Principles & Practice', subtitle: 'Course Proposal', status: 'Under Review', date: 'Submitted Apr 22, 2025' },
    { title: 'MBA for Entrepreneurs', subtitle: 'Seminar Proposal', status: 'Draft', date: 'Submitted Apr 25, 2025' },
  ]

  const getActivityIcon = (icon) => {
    switch(icon) {
      case 'check': return <CheckCircle size={18} color="#4caf50" />
      case 'file': return <FileText size={18} color="#0B4F9F" />
      case 'message': return <MessageSquare size={18} color="#FDB714" />
      case 'help': return <HelpCircle size={18} color="#ff9800" />
      default: return <CheckCircle size={18} />
    }
  }

  const recentActivity = [
    { icon: 'check', text: 'Your seminar "Capital Markets Outlook & Investment Strategies" was approved', time: 'Today, 10:16 AM' },
    { icon: 'file', text: 'You updated materials for "Tax Planning for Investors & SMEs"', time: 'Yesterday, 4:32 PM' },
    { icon: 'message', text: 'New feedback received for "Financial Modeling for Professionals"', time: 'May 10, 2025' },
    { icon: 'help', text: 'New learner question in "Entrepreneurial Finance: Funding & Valuation"', time: 'May 9, 2025' },
  ]

  const recentQuestions = [
    { question: 'How do REITs generate income for retail investors?', author: 'James K.', date: 'May 12, 2025', course: 'Capital Markets' },
    { question: 'What are the key tax considerations for cross-border investments?', author: 'Anita S.', date: 'May 10, 2025', course: 'Tax & Compliance' },
    { question: 'How can SMEs improve cash flow forecasting accuracy?', author: 'Phyllis M.', date: 'May 10, 2025', course: 'SME Finance' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Welcome back, Alex."
          subtitle="Trainer Portal Dashboard"
          actions={
            <div className="trainer-badge">
              <Shield size={18} style={{color: '#FDB714'}} />
              <span>INVITED TRAINER</span>
              <span className="member-since">Member since Jan 2023</span>
            </div>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-4">
            <div className="stat-card-simple">
              <div className="stat-icon-wrapper blue">
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-label">Upcoming Sessions</div>
                <div className="stat-value-large">3</div>
                <a href="#" className="stat-link">View schedule →</a>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper yellow">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="stat-label">Published Courses</div>
                <div className="stat-value-large">5</div>
                <a href="#" className="stat-link">Manage courses →</a>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper green">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-label">Total Learners</div>
                <div className="stat-value-large">3,245</div>
                <div className="stat-trend">↑ 18% vs last 30 days</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper orange">
                <Star size={24} />
              </div>
              <div>
                <div className="stat-label">Average Rating</div>
                <div className="stat-value-large">4.8/5</div>
                <a href="#" className="stat-link">View feedback →</a>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="trainer-dashboard-grid">
            {/* Left Column */}
            <div className="trainer-main-column">
              {/* Next Live Seminar */}
              <div className="card">
                <h3 className="card-title">Next Live Seminar</h3>
                <div className="next-seminar-card">
                  <div className="seminar-badge live-badge">LIVE</div>
                  <div className="seminar-image">
                    <img src={nextSeminar.image} alt={nextSeminar.title} />
                  </div>
                  <div className="seminar-content">
                    <h4 className="seminar-title">{nextSeminar.title}</h4>
                    <div className="seminar-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>Wed, May 14, 2025</span>
                      </div>
                      <div className="meta-item">
                        <span>⏰</span>
                        <span>6:05 PM - 7:30 PM (EAT)</span>
                      </div>
                      <div className="meta-item">
                        <span>📍</span>
                        <span>Live on Zoom</span>
                      </div>
                      <div className="meta-item-group">
                        <div className="avatar-stack">
                          <img src="https://i.pravatar.cc/32?img=1" alt="" />
                          <img src="https://i.pravatar.cc/32?img=2" alt="" />
                          <img src="https://i.pravatar.cc/32?img=3" alt="" />
                          <img src="https://i.pravatar.cc/32?img=4" alt="" />
                        </div>
                        <span>{nextSeminar.registered} registered</span>
                      </div>
                    </div>
                    <button className="btn btn-warning btn-lg">View Details</button>
                  </div>
                </div>
              </div>

              {/* Schedule Overview */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Schedule Overview</h3>
                  <a href="/trainer/sessions" className="link-text">View all →</a>
                </div>
                <div className="schedule-calendar-mini">
                  <div className="calendar-nav">
                    <button className="btn-icon">‹</button>
                    <h4>May 2025</h4>
                    <button className="btn-icon">›</button>
                  </div>
                  <div className="calendar-grid-mini">
                    <div className="calendar-header">SUN</div>
                    <div className="calendar-header">MON</div>
                    <div className="calendar-header">TUE</div>
                    <div className="calendar-header">WED</div>
                    <div className="calendar-header">THU</div>
                    <div className="calendar-header">FRI</div>
                    <div className="calendar-header">SAT</div>
                    
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1
                      const hasSession = [14, 21, 27].includes(day)
                      const isToday = day === 14
                      return (
                        <div key={i} className={`calendar-day ${hasSession ? 'has-session' : ''} ${isToday ? 'today' : ''}`}>
                          {day}
                        </div>
                      )
                    })}
                  </div>
                  <div className="calendar-legend">
                    <div className="legend-item"><span className="dot session-dot"></span> Session</div>
                    <div className="legend-item"><span className="dot multiple-dot"></span> Multiple Sessions</div>
                  </div>
                </div>
              </div>

              {/* Proposal Approvals */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Proposal Approvals</h3>
                  <a href="/trainer/proposals" className="link-text">View all →</a>
                </div>
                <div className="proposals-list">
                  {proposalApprovals.map((proposal, idx) => (
                    <div key={idx} className="proposal-item">
                      <div className="proposal-icon">
                        📄
                      </div>
                      <div className="proposal-details">
                        <div className="proposal-title">{proposal.title}</div>
                        <div className="proposal-subtitle">{proposal.subtitle} • {proposal.date}</div>
                      </div>
                      <span className={`badge ${proposal.status === 'Approval' ? 'success' : proposal.status === 'Under Review' ? 'warning' : 'neutral'}`}>
                        {proposal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="trainer-sidebar-column">
              {/* Quick Actions */}
              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-card">
                    <div className="action-icon blue">
                      <Calendar size={20} />
                    </div>
                    <div className="action-text">Create New Seminar</div>
                  </button>
                  <button className="quick-action-card">
                    <div className="action-icon yellow">
                      <BookOpen size={20} />
                    </div>
                    <div className="action-text">Submit Course Proposal</div>
                  </button>
                  <button className="quick-action-card">
                    <div className="action-icon green">
                      <Upload size={20} />
                    </div>
                    <div className="action-text">Upload Course Materials</div>
                  </button>
                  <button className="quick-action-card">
                    <div className="action-icon orange">
                      <MessageSquare size={20} />
                    </div>
                    <div className="action-text">View Learner Feedback</div>
                  </button>
                </div>
              </div>

              {/* Recent Learner Questions */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Recent Learner Questions</h3>
                  <a href="/trainer/qa" className="link-text">View all →</a>
                </div>
                <div className="questions-list">
                  {recentQuestions.map((q, idx) => (
                    <div key={idx} className="question-item">
                      <div className="question-icon">
                        <HelpCircle size={20} color="#ff9800" />
                      </div>
                      <div className="question-content">
                        <div className="question-text">{q.question}</div>
                        <div className="question-meta">
                          <span>{q.author}</span>
                          <span>•</span>
                          <span>{q.date}</span>
                        </div>
                        <div className="question-course">{q.course}</div>
                      </div>
                      <button className="btn btn-sm btn-secondary">Go to Learner Q&A →</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Recent Activity</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
                <div className="activity-list-compact">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="activity-item-compact">
                      <div className="activity-icon-small">{getActivityIcon(activity.icon)}</div>
                      <div className="activity-details-compact">
                        <div className="activity-text-small">{activity.text}</div>
                        <div className="activity-time-small">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Reminder */}
              <div className="card reminder-card">
                <div className="reminder-icon">
                  <Shield size={24} />
                </div>
                <h4 className="reminder-title">Compliance Reminder</h4>
                <p className="reminder-text">All content must remain educational and informational only. Content cannot promise or guarantee specific results, income, or tax advice.</p>
                <a href="#" className="link-text">Review Content Guidelines →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
