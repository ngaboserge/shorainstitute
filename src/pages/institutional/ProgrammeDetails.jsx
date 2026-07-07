import React from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, Award, TrendingUp, Calendar, Download, MessageSquare, PlusCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './ProgrammeDetails.css'

const ProgrammeDetails = () => {
  const { id } = useParams()

  const moduleProgress = [
    { name: 'Module 1: Introduction to Emergency Fund', completion: 100, color: '#4CAF50' },
    { name: 'Module 2: Learning Your Emergency Basics', completion: 100, color: '#4CAF50' },
    { name: 'Module 3: Building Emergency Fund', completion: 85, color: '#FDB714' },
    { name: 'Module 4: Introduction to Debt', completion: 0, color: '#E0E0E0' }
  ]

  const progressByDept = [
    { dept: 'Progs / Module', value: 100, color: '#0B4F9F' },
    { dept: 'Finance', value: 100, color: '#1976D2' },
    { dept: 'Risk', value: 80, color: '#42A5F5' },
    { dept: 'Operations', value: 55, color: '#90CAF9' },
    { dept: 'IT', value: 5, color: '#BBDEFB' }
  ]

  const learners = [
    {
      name: 'Patricia Uhoreka',
      avatar: 'https://i.pravatar.cc/150?img=5',
      dept: 'Finance',
      programme: 'Finance',
      quizScore: '100%',
      attendance: '95%',
      manager: 'Jean-Claude R.',
      status: 'Completed'
    },
    {
      name: 'Emmanuel Mbonigaba',
      avatar: 'https://i.pravatar.cc/150?img=12',
      dept: 'Finance',
      programme: 'Finance',
      quizScore: '80%',
      attendance: '89%',
      manager: 'Jean-Claude R.',
      status: 'In Progress'
    },
    {
      name: 'Aline Mutarutwa',
      avatar: 'https://i.pravatar.cc/150?img=9',
      dept: 'Risk Management',
      programme: 'Risk',
      quizScore: '60%',
      attendance: '72%',
      manager: 'Bosco Mukangabire',
      status: 'In Progress'
    },
    {
      name: 'Ebenezer Habimana',
      avatar: 'https://i.pravatar.cc/150?img=13',
      dept: 'Operations',
      programme: 'Operations',
      quizScore: '46%',
      attendance: '65%',
      manager: 'Samuel Kwikuit',
      status: 'At Risk'
    },
    {
      name: 'Musiige Twahirwa',
      avatar: 'https://i.pravatar.cc/150?img=14',
      dept: 'Finance',
      programme: 'Finance',
      quizScore: '15%',
      attendance: '50%',
      manager: 'Jean-Claude R.',
      status: 'At Risk'
    },
    {
      name: 'Jean-Bosco Ndeti',
      avatar: 'https://i.pravatar.cc/150?img=15',
      dept: 'IT',
      programme: 'IT',
      quizScore: '13%',
      attendance: '50%',
      manager: 'Arcandie L.',
      status: 'Not Started'
    },
    {
      name: 'Marcelle Kaytesi',
      avatar: 'https://i.pravatar.cc/150?img=10',
      dept: 'Operations',
      programme: 'Operations',
      quizScore: '0%',
      attendance: '43%',
      manager: 'Samuel Kwikuit',
      status: 'Not Started'
    },
    {
      name: 'Olivier Mutambuka',
      avatar: 'https://i.pravatar.cc/150?img=16',
      dept: 'Operations',
      programme: 'Operations',
      quizScore: '0%',
      attendance: '0%',
      manager: 'Samuel Kwikuit',
      status: 'Not Started'
    }
  ]

  const upcomingSessions = [
    {
      date: 'MAY\n08',
      title: 'Introduction to Investing',
      type: 'Seminar: Prasad Equity',
      time: '10:00 AM - 3:00 PM (EAT)',
      registered: 67
    },
    {
      date: 'MAY\n22',
      title: 'Capital Markets Basics',
      type: 'Seminar: Portfolio Composition',
      time: '2:00 PM - 3:00 PM (EAT)',
      registered: 74
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Financial Foundations for RDB Staff"
          subtitle="Programmes & Cohorts"
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Export Report
              </button>
              <button className="btn btn-secondary">
                <MessageSquare size={18} />
                Message Cohort
              </button>
              <button className="btn btn-warning">
                <PlusCircle size={18} />
                Add Learners
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Programme Info Header */}
          <div className="programme-header-card">
            <div className="programme-header-left">
              <div className="programme-badge-group">
                <span className="programme-badge dept">🏛️ Department Group</span>
                <span className="programme-badge dept">Finance & Corporate Services</span>
              </div>
              <div className="programme-meta-row">
                <div className="programme-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>124 Enrolled Learners</span>
                </div>
                <div className="programme-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <span>Invited Trainer</span>
                </div>
                <div className="programme-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>10:00 AM - 2:00 PM (EAT)</span>
                </div>
                <div className="programme-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15.6 11.6 22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z"/>
                  </svg>
                  <span>Live on Zoom</span>
                </div>
              </div>
            </div>
            <div className="programme-header-right">
              <button className="btn-view-calendar">View calendar</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="programme-stats-grid">
            <div className="programme-stat-card">
              <div className="programme-stat-icon blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="programme-stat-content">
                <div className="programme-stat-label">Completion Rate</div>
                <div className="programme-stat-value">72%</div>
                <div className="programme-stat-progress">
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill" style={{width: '72%'}}></div>
                  </div>
                  <span className="stat-progress-text">67 of 124 learners</span>
                </div>
                <div className="programme-stat-meta">↑ 12% vs last update</div>
              </div>
            </div>

            <div className="programme-stat-card">
              <div className="programme-stat-icon yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="programme-stat-content">
                <div className="programme-stat-label">Average Score</div>
                <div className="programme-stat-value">78%</div>
                <div className="programme-stat-progress">
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill yellow" style={{width: '78%'}}></div>
                  </div>
                  <span className="stat-progress-text">Across all assessments</span>
                </div>
                <div className="programme-stat-meta">↑ 5% vs last update</div>
              </div>
            </div>

            <div className="programme-stat-card">
              <div className="programme-stat-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="programme-stat-content">
                <div className="programme-stat-label">Live Attendance</div>
                <div className="programme-stat-value">88%</div>
                <div className="programme-stat-progress">
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill purple" style={{width: '88%'}}></div>
                  </div>
                  <span className="stat-progress-text">8 in attended rate</span>
                </div>
                <div className="programme-stat-meta">↑ 8% vs last update</div>
              </div>
            </div>

            <div className="programme-stat-card">
              <div className="programme-stat-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="programme-stat-content">
                <div className="programme-stat-label">Certificates Issued</div>
                <div className="programme-stat-value">62</div>
                <div className="programme-stat-progress">
                  <div className="stat-progress-bar">
                    <div className="stat-progress-fill green" style={{width: '50%'}}></div>
                  </div>
                  <span className="stat-progress-text">Certificate awarded</span>
                </div>
                <div className="programme-stat-meta">↑ 8% vs last update</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="programme-content-grid">
            {/* Left Side */}
            <div className="programme-main-section">
              {/* Module Progress */}
              <div className="card">
                <div className="card-header-prog">
                  <h3 className="card-title-prog">Module Progress Overview</h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div className="module-progress-list">
                  {moduleProgress.map((module, index) => (
                    <div key={index} className="module-progress-item">
                      <div className="module-status-icon" style={{background: module.color}}>
                        {module.completion === 100 ? '✓' : module.completion > 0 ? '~' : '○'}
                      </div>
                      <div className="module-info">
                        <div className="module-name">{module.name}</div>
                        <div className="module-completion">{module.completion}%</div>
                      </div>
                      <div className="module-progress-bar">
                        <div className="module-progress-fill" style={{width: `${module.completion}%`, background: module.color}}></div>
                      </div>
                      <div className="module-status-text">
                        {module.completion === 100 ? 'Complete' : module.completion > 0 ? 'Complete' : 'Not started'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress by Department */}
              <div className="card">
                <div className="card-header-prog">
                  <h3 className="card-title-prog">Progress by Department</h3>
                </div>
                <div className="dept-progress-list">
                  {progressByDept.map((dept, index) => (
                    <div key={index} className="dept-progress-item">
                      <div className="dept-progress-name">{dept.dept}</div>
                      <div className="dept-progress-bar-wrapper">
                        <div className="dept-progress-bar">
                          <div className="dept-progress-fill" style={{width: `${dept.value}%`, background: dept.color}}></div>
                        </div>
                        <span className="dept-progress-value">{dept.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learner Roster */}
              <div className="card">
                <div className="card-header-prog">
                  <div>
                    <h3 className="card-title-prog">Learner Roster (124)</h3>
                    <p className="card-subtitle-prog">Search learners...</p>
                  </div>
                  <button className="btn-filter-prog">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filters
                  </button>
                </div>

                <table className="learner-roster-table">
                  <thead>
                    <tr>
                      <th>Learner</th>
                      <th>Department</th>
                      <th>Programme</th>
                      <th>Quiz Score</th>
                      <th>Attendance</th>
                      <th>Manager</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {learners.map((learner, index) => (
                      <tr key={index}>
                        <td>
                          <div className="learner-cell-prog">
                            <img src={learner.avatar} alt={learner.name} className="learner-avatar-prog" />
                            <span>{learner.name}</span>
                          </div>
                        </td>
                        <td>{learner.dept}</td>
                        <td>{learner.programme}</td>
                        <td>
                          <div className="score-cell">
                            <div className="score-bar">
                              <div className="score-fill" style={{width: learner.quizScore}}></div>
                            </div>
                            <span>{learner.quizScore}</span>
                          </div>
                        </td>
                        <td>{learner.attendance}</td>
                        <td>{learner.manager}</td>
                        <td>
                          <span className={`status-badge-prog ${
                            learner.status === 'Completed' ? 'completed' : 
                            learner.status === 'In Progress' ? 'in-progress' : 
                            learner.status === 'At Risk' ? 'at-risk' : 
                            'not-started'
                          }`}>
                            {learner.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-menu-prog">⋮</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="table-footer-prog">
                  <div>Showing 1 to 8 of 124 learners</div>
                  <div className="pagination-prog">
                    <button className="page-btn-prog">1</button>
                    <button className="page-btn-prog">2</button>
                    <button className="page-btn-prog">3</button>
                    <button className="page-btn-prog">36</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="programme-sidebar">
              {/* Upcoming Live Sessions */}
              <div className="card">
                <div className="card-header-prog">
                  <h3 className="sidebar-title-prog">Upcoming Live Sessions</h3>
                  <span className="live-badge">● LIVE</span>
                </div>
                <div className="upcoming-sessions-list">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="upcoming-session-item">
                      <div className="upcoming-session-date">
                        {session.date.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      <div className="upcoming-session-details">
                        <h4 className="upcoming-session-title">{session.title}</h4>
                        <p className="upcoming-session-type">{session.type}</p>
                        <p className="upcoming-session-time">⏰ {session.time}</p>
                        <p className="upcoming-session-registered">👥 {session.registered} Registered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainer / Faculty */}
              <div className="card">
                <h3 className="sidebar-title-prog">Trainer / Faculty</h3>
                <div className="trainer-card">
                  <img 
                    src="https://i.pravatar.cc/150?img=33" 
                    alt="Peace Uwase" 
                    className="trainer-avatar"
                  />
                  <div className="trainer-info">
                    <div className="trainer-name">Peace Uwase</div>
                    <div className="trainer-title">Senior Finance & Investment Consultant</div>
                    <div className="trainer-company">Capital Markets | Corporate Finance | Investment Strategy</div>
                  </div>
                </div>
                <div className="trainer-actions">
                  <button className="trainer-action-btn">View full public profile →</button>
                </div>
              </div>

              {/* Programme Resources */}
              <div className="card">
                <h3 className="sidebar-title-prog">Programme Resources</h3>
                <div className="resources-list-prog">
                  <button className="resource-item-prog">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Programme Guide</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                  <button className="resource-item-prog">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Slide Decks & Handouts</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                  <button className="resource-item-prog">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Additional Reading</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                  <button className="resource-item-prog">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Assessment Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammeDetails
