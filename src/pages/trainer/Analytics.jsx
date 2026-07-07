import React from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, Star, CheckCircle, TrendingUp, Download, Calendar, MessageSquare, BarChart3, Lightbulb, MoreVertical } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './Analytics.css'

const Analytics = () => {
  const engagementData = [
    { month: 'Dec 2024', uniqueLearners: 1820, activeCompletions: 1320, avgLearners: 1570 },
    { month: 'Jan 2025', uniqueLearners: 1950, activeCompletions: 1460, avgLearners: 1705 },
    { month: 'Feb 2025', uniqueLearners: 2742, activeCompletions: 1876, avgLearners: 2309 },
    { month: 'Mar 2025', uniqueLearners: 2790, activeCompletions: 2118, avgLearners: 2454 },
    { month: 'Apr 2025', uniqueLearners: 2950, activeCompletions: 2334, avgLearners: 2642 },
    { month: 'May 2025', uniqueLearners: 3245, activeCompletions: 2667, avgLearners: 2956 }
  ]

  const attendanceData = [
    { month: 'Dec 2024', liveSession: 300, total: 400 },
    { month: 'Jan 2025', liveSession: 450, total: 550 },
    { month: 'Feb 2025', liveSession: 500, total: 650 },
    { month: 'Mar 2025', liveSession: 600, total: 750 },
    { month: 'Apr 2025', liveSession: 640, total: 800 },
    { month: 'May 2025', liveSession: 686, total: 850 }
  ]

  const topicEngagement = [
    { name: 'Investment Strategies', percentage: 30, count: 932, color: '#0B4F9F' },
    { name: 'Capital Markets', percentage: 26, count: 806, color: '#1976D2' },
    { name: 'Risk Management', percentage: 18, count: 558, color: '#42A5F5' },
    { name: 'Entrepreneurial Finance', percentage: 14, count: 434, color: '#64B5F6' },
    { name: 'Tax & Compliance', percentage: 12, count: 372, color: '#90CAF9' }
  ]

  const mostEngagingSessions = [
    { title: 'Capital Markets Outlook & Investment Strategies', completion: 83, attendance: 85, rating: 4.9 },
    { title: 'ESG Investing: Principles & Practice', completion: 78, attendance: 78, rating: 4.8 },
    { title: 'Entrepreneurial Finance: Funding & Valuation', completion: 76, attendance: 69, rating: 4.8 },
    { title: 'Behavioral Finance for Better Decisions', completion: 74, attendance: 72, rating: 4.6 },
    { title: 'Tax Planning for Investors & SMEs', completion: 70, attendance: 65, rating: 4.8 }
  ]

  const recentFeedback = [
    { 
      session: 'Investment Risk Assessment', 
      instructor: 'Dr. Jean Paul', 
      date: 'May 08, 2025',
      comment: 'Good job identifying different types of risk. Consider using more real-world examples to strengthen your explanations.',
      rating: 4.8
    },
    { 
      session: 'Budgeting & Cash Flow', 
      instructor: 'Ms. Clarise U.', 
      date: 'May 05, 2025',
      comment: 'Strong work on the cash flow statement. Review the expense categorization for improvement.',
      rating: 4.7
    }
  ]

  const suggestedImprovements = [
    { text: 'Add more real-world case studies to Tax & Compliance sessions', action: 'Add to next seminar' },
    { text: 'Include interactive polls/quizzes to boost engagement', action: 'Include in sessions' },
    { text: 'Consider creating short recap videos for key takeaways', action: 'Plan sessions' }
  ]

  const expertSessions = {
    attendance: '+24%',
    completion: '+17%',
    rating: '+0.4'
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Analytics & Learner Feedback"
          subtitle="Welcome back, Alex. Here's your performance overview."
          actions={
            <>
              <select className="date-range-select">
                <option>May 1 - May 31, 2025</option>
                <option>Apr 1 - Apr 30, 2025</option>
                <option>Mar 1 - Mar 31, 2025</option>
              </select>
              <button className="btn btn-primary">
                <Download size={18} />
                Export Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-6">
            <div className="stat-card-compact">
              <div className="stat-icon-small blue">
                <Users size={20} />
              </div>
              <div>
                <div className="stat-label-small">Total Learners Reached</div>
                <div className="stat-value-medium">3,245</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  18% vs Apr 30
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small yellow">
                <Star size={20} />
              </div>
              <div>
                <div className="stat-label-small">Average Rating</div>
                <div className="stat-value-medium">4.8/5</div>
                <div className="stat-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FDB714" color="#FDB714" />)}
                </div>
                <a href="#" className="stat-link-small">View feedback →</a>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small green">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="stat-label-small">Completion Rate</div>
                <div className="stat-value-medium">78%</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  9% vs last 30
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small purple">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="stat-label-small">Live Attendance Rate</div>
                <div className="stat-value-medium">72%</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  8% vs Apr 30
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small orange">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="stat-label-small">Repeat Attendance</div>
                <div className="stat-value-medium">41%</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  6% vs Apr 30
                </div>
              </div>
            </div>

            <div className="stat-card-compact">
              <div className="stat-icon-small teal">
                <Download size={20} />
              </div>
              <div>
                <div className="stat-label-small">Resource Downloads</div>
                <div className="stat-value-medium">1,286</div>
                <div className="stat-trend-small positive">
                  <TrendingUp size={12} />
                  22% vs last 30
                </div>
              </div>
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="analytics-grid">
            <div className="analytics-main">
              {/* Monthly Engagement Trend */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">Monthly Engagement Trend</h3>
                    <p className="card-subtitle-small">Tracking unique learners, active completions, and average learners</p>
                  </div>
                  <div className="chart-legend-inline">
                    <div className="legend-item"><span className="dot" style={{background: '#0B4F9F'}}></span> Unique Learners</div>
                    <div className="legend-item"><span className="dot" style={{background: '#4caf50'}}></span> Active Completions</div>
                    <div className="legend-item"><span className="dot" style={{background: '#FDB714'}}></span> Avg Learners</div>
                  </div>
                  <a href="#" className="link-text">View full engagement report →</a>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" style={{fontSize: '12px'}} />
                    <YAxis stroke="#666" style={{fontSize: '12px'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="uniqueLearners" stroke="#0B4F9F" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="activeCompletions" stroke="#4caf50" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="avgLearners" stroke="#FDB714" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Session Attendance by Month */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3 className="card-title">Session Attendance (by Month)</h3>
                  </div>
                  <a href="#" className="link-text">View cumulative details →</a>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666" style={{fontSize: '12px'}} />
                    <YAxis stroke="#666" style={{fontSize: '12px'}} />
                    <Tooltip />
                    <Bar dataKey="liveSession" fill="#0B4F9F" name="Live Session Learners" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="total" fill="#64B5F6" name="Total Learners" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Most Engaging Sessions */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Most Engaging Sessions</h3>
                  <a href="#" className="link-text">View all sessions →</a>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Completion</th>
                        <th>Attendance</th>
                        <th>Avg. Rating</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mostEngagingSessions.map((session, idx) => (
                        <tr key={idx}>
                          <td className="session-name-cell">{session.title}</td>
                          <td>
                            <div className="progress-cell-inline">
                              <div className="progress-bar-small">
                                <div className="progress-fill" style={{width: `${session.completion}%`}}></div>
                              </div>
                              <span className="progress-text-small">{session.completion}%</span>
                            </div>
                          </td>
                          <td>
                            <div className="progress-cell-inline">
                              <div className="progress-bar-small">
                                <div className="progress-fill" style={{width: `${session.attendance}%`, background: '#FDB714'}}></div>
                              </div>
                              <span className="progress-text-small">{session.attendance}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="rating-badge">
                              <Star size={14} fill="#FDB714" stroke="#FDB714" />
                              {session.rating}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Session Feedback */}
              <div className="card">
                <div className="card-header-flex">
                  <h3 className="card-title">Recent Session Feedback</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
                <div className="feedback-list">
                  {recentFeedback.map((feedback, idx) => (
                    <div key={idx} className="feedback-item">
                      <div className="feedback-header">
                        <div>
                          <div className="feedback-session">{feedback.session}</div>
                          <div className="feedback-meta">
                            {feedback.instructor} • {feedback.date}
                          </div>
                        </div>
                        <span className="rating-badge-large">
                          <Star size={16} fill="#FDB714" stroke="#FDB714" />
                          {feedback.rating}
                        </span>
                      </div>
                      <p className="feedback-comment">{feedback.comment}</p>
                      <button className="btn btn-sm btn-secondary">View Feedback</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="analytics-sidebar">
              {/* Learner Engagement by Topic Area */}
              <div className="card">
                <h3 className="card-title">Learner Engagement by Topic Area</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topicEngagement}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="percentage"
                    >
                      {topicEngagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="topic-legend">
                  {topicEngagement.map((topic, idx) => (
                    <div key={idx} className="topic-legend-item">
                      <div className="topic-color" style={{background: topic.color}}></div>
                      <div className="topic-info">
                        <div className="topic-name">{topic.name}</div>
                        <div className="topic-stats">{topic.percentage}% ({topic.count})</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" className="link-text-center">View topic performance →</a>
              </div>

              {/* Suggested Improvements */}
              <div className="card">
                <h3 className="card-title">Suggested Improvements</h3>
                <p className="card-subtitle-small">From your learner feedback</p>
                <div className="suggestions-list">
                  {suggestedImprovements.map((item, idx) => (
                    <div key={idx} className="suggestion-item">
                      <div className="suggestion-icon"><Lightbulb size={20} color="#FDB714" /></div>
                      <div className="suggestion-content">
                        <p className="suggestion-text">{item.text}</p>
                        <button className="btn-link">{item.action}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" className="link-text-center">See improvement insights →</a>
              </div>

              {/* Link Analytics to Invited Expert Sessions */}
              <div className="card expert-impact-card">
                <h3 className="card-title">Link Analytics to Invited Expert Sessions</h3>
                <p className="card-subtitle-small">Measure the impact of your guest speakers and enhance your sessions and learner engagement.</p>
                <div className="expert-stats">
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{expertSessions.attendance}</div>
                    <div className="expert-stat-label">Higher Attendance</div>
                  </div>
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{expertSessions.completion}</div>
                    <div className="expert-stat-label">Higher Completion</div>
                  </div>
                  <div className="expert-stat-item">
                    <div className="expert-stat-value">{expertSessions.rating}</div>
                    <div className="expert-stat-label">Higher Rating</div>
                  </div>
                </div>
                <button className="btn btn-warning btn-full">
                  Invite an Expert →
                </button>
                <a href="#" className="link-text-center">View invited session insights →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
