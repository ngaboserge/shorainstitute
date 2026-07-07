import React from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Overview.css'

const Overview = () => {
  const progressData = [
    { name: 'Credit & Risk', completed: 84, inProgress: 12, notStarted: 4 },
    { name: 'Finance', completed: 79, inProgress: 16, notStarted: 5 },
    { name: 'HR & Admin', completed: 72, inProgress: 20, notStarted: 8 },
    { name: 'Operations', completed: 68, inProgress: 24, notStarted: 8 },
    { name: 'IT', completed: 61, inProgress: 28, notStarted: 11 },
  ]

  const engagementData = [
    { name: 'Financial Foundations', value: 512, percentage: '25%', color: '#0B4F9F' },
    { name: 'Financial Planning Basics', value: 403, percentage: '20%', color: '#1976D2' },
    { name: 'Investment Foundations', value: 249, percentage: '12%', color: '#42A5F5' },
    { name: 'Capital Markets Essentials', value: 187, percentage: '9%', color: '#64B5F6' },
  ]

  const upcomingSessions = [
    {
      date: 'JUN\n03',
      title: 'Wealth Creation Through Smart Investing',
      speaker: 'Alex Ntale',
      time: 'June 3, 2026 • 2:00 PM - 3:30 PM (EAT)',
      registered: 120,
      action: 'View'
    },
    {
      date: 'JUN\n10',
      title: 'Retirement Planning for Professionals',
      speaker: 'Peace Uwase',
      time: 'June 10, 2026 • 2:00 PM - 3:30 PM (EAT)',
      registered: 98,
      action: 'View'
    },
    {
      date: 'JUN\n24',
      title: 'Financial Statement Analysis for Non-Finance Managers',
      speaker: 'Jean Claude Habarurema',
      time: 'June 24, 2026 • 2:00 PM - 3:30 PM (EAT)',
      registered: 76,
      action: 'View'
    },
  ]

  const recentActivity = [
    { icon: '👤', text: 'New learner registered', course: 'Financial Foundations', time: '23 minutes ago' },
    { icon: '🎓', text: 'Course completed', course: 'Investment Foundations', time: '1 hour ago' },
    { icon: '📜', text: 'Certificate issued', course: 'Investment Foundations', time: '1 hour ago' },
    { icon: '📚', text: 'Programme enrolled', course: 'Financial Planning Basics', time: '3 hours ago' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Welcome back, Jane!"
          subtitle="Here's what's happening in your institution."
          actions={
            <>
              <select className="date-range-select">
                <option>May 1 - May 31, 2026</option>
                <option>June 1 - June 30, 2026</option>
              </select>
              <button className="btn btn-primary">
                <Download size={18} />
                Download Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Learners</div>
                <div className="stat-value">1,248</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>12% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">
                <GraduationCap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Progress</div>
                <div className="stat-value">75%</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>5% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Programmes</div>
                <div className="stat-value">18</div>
                <div className="stat-change neutral">
                  <span>No change</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Upcoming Live Sessions</div>
                <div className="stat-value">7</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>2 vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Learner Progress Overview</h3>
                  <p className="card-subtitle">By Department</p>
                </div>
                <a href="#" className="link-text">View full report →</a>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#4caf50" name="Completed" />
                    <Bar dataKey="inProgress" stackId="a" fill="#fdb714" name="In Progress" />
                    <Bar dataKey="notStarted" stackId="a" fill="#e0e0e0" name="Not Started" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#4caf50'}}></span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#fdb714'}}></span>
                  <span>In Progress</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{background: '#e0e0e0'}}></span>
                  <span>Not Started</span>
                </div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Programme Engagement</h3>
                </div>
                <a href="#" className="link-text">View all →</a>
              </div>
              <div className="engagement-list">
                {engagementData.map((item, index) => (
                  <div key={index} className="engagement-item">
                    <div className="engagement-bar">
                      <div className="engagement-fill" style={{width: item.percentage, background: item.color}}></div>
                    </div>
                    <div className="engagement-info">
                      <span className="engagement-name">{item.name}</span>
                      <span className="engagement-value">{item.value} learners ({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Programmes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Programmes</h3>
              <a href="#" className="link-text">View all →</a>
            </div>
            <div className="top-programmes-grid">
              {[
                { name: 'Financial Foundations', learners: '512 learners', completion: 75 },
                { name: 'Financial Planning Basics', learners: '403 learners', completion: 68 },
                { name: 'Investment Foundations', learners: '310 learners', completion: 60 },
                { name: 'Capital Markets Essentials', learners: '271 learners', completion: 55 },
                { name: 'Risk Management Basics', learners: '280 learners', completion: 50 },
              ].map((prog, index) => (
                <div key={index} className="programme-item">
                  <div className="programme-number">{index + 1}</div>
                  <div className="programme-details">
                    <div className="programme-name">{prog.name}</div>
                    <div className="programme-learners">{prog.learners}</div>
                  </div>
                  <div className="programme-completion">{prog.completion}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="bottom-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Upcoming Live Sessions for Your Institution</h3>
                <a href="#" className="link-text">View calendar →</a>
              </div>
              <div className="sessions-list">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="session-item">
                    <div className="session-date">
                      {session.date.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <div className="session-details">
                      <h4 className="session-title">{session.title}</h4>
                      <p className="session-speaker">Speaker: {session.speaker}</p>
                      <p className="session-time">📅 {session.time}</p>
                      <p className="session-registered">👥 {session.registered} Registered</p>
                    </div>
                    <button className="btn btn-primary btn-sm">{session.action}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-widgets">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">{activity.icon}</div>
                      <div className="activity-details">
                        <div className="activity-text">{activity.text}</div>
                        <div className="activity-course">{activity.course}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn">
                    <Users size={20} />
                    <span>Add Learners</span>
                  </button>
                  <button className="action-btn">
                    <BookOpen size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button className="action-btn">
                    <Calendar size={20} />
                    <span>Schedule a Live Session</span>
                  </button>
                  <button className="action-btn">
                    <Download size={20} />
                    <span>Download Analytics</span>
                  </button>
                </div>
              </div>

              <div className="card help-card">
                <div className="help-icon">💡</div>
                <h4>Need help?</h4>
                <p>Contact your account manager</p>
                <button className="btn btn-secondary btn-sm">Get Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
