import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle, Clock, Target, TrendingUp, Award, FileText, PlayCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Assessments.css'

const Assessments = () => {
  const [activeTab, setActiveTab] = useState('quizzes')

  const stats = [
    { icon: Calendar, label: 'Upcoming Deadlines', value: '5', color: '#0B4F9F', subtext: 'Next due: May 14, 2025' },
    { icon: CheckCircle, label: 'Completed Assessments', value: '18', color: '#4caf50', subtext: 'Out of 24 total' },
    { icon: Target, label: 'Average Score', value: '82%', color: '#FDB714', subtext: 'Across all assessments' },
    { icon: Award, label: 'Certificate Eligibility', value: '78%', color: '#9c27b0', subtext: 'Complete 6 more assessments' }
  ]

  const quizzes = [
    {
      id: 1,
      title: 'Time Value of Money Quiz',
      course: 'Foundations of Finance',
      dueDate: 'May 14, 2025',
      daysLeft: '5 days',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Budgeting & Cash Flow',
      course: 'Personal Finance',
      dueDate: 'May 20, 2025',
      daysLeft: '12 days',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Investment Risk Assessment',
      course: 'Investment Strategies',
      dueDate: 'May 23, 2025',
      daysLeft: '15 days',
      status: 'not-started'
    }
  ]

  const completed = [
    {
      id: 4,
      title: 'Financial Statement Analysis',
      course: 'Corporate Finance',
      completedDate: 'May 08, 2025',
      score: 88,
      instructor: 'Dr. Jean Paul',
      feedback: 'Good job identifying different types of risk. Consider using more real-world examples to strengthen your understanding.'
    }
  ]

  const performanceTrend = [
    { month: 'Mar 30', score: 78 },
    { month: 'Apr 03', score: 82 },
    { month: 'Apr 17', score: 85 },
    { month: 'May 01', score: 88 },
    { month: 'May 13', score: 82 },
    { month: 'May 29', score: 82 }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Assessments & Assignments" 
          subtitle="Track your assessments, assignments, and performance."
        />
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon" style={{background: `${stat.color}15`}}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-subtext">{stat.subtext}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs-nav-large">
            <button 
              className={`tab-btn-large ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              <FileText size={18} />
              Quizzes
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText size={18} />
              Assignments
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'case-studies' ? 'active' : ''}`}
              onClick={() => setActiveTab('case-studies')}
            >
              <FileText size={18} />
              Case Studies
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <Target size={18} />
              Results
            </button>
          </div>

          {/* Content */}
          <div className="assessments-grid">
            <div className="assessments-main">
              {/* Featured Assessment */}
              <div className="featured-assessment">
                <div className="featured-badge">QUIZ</div>
                <h3>Time Value of Money Quiz</h3>
                <div className="featured-meta">
                  <span className="course-link">Linked to: Foundations of Finance</span>
                </div>
                <p className="featured-description">Test your understanding of present value, future value, interest rates, annuities, and discount rates.</p>
                <div className="featured-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <div>
                      <div className="detail-label">Due Date</div>
                      <div className="detail-value">May 14, 2025 (in 5 days)</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <div>
                      <div className="detail-label">Est. Time</div>
                      <div className="detail-value">45 minutes</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FileText size={16} />
                    <div>
                      <div className="detail-label">Questions</div>
                      <div className="detail-value">20 multiple choice</div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-warning btn-lg btn-full">
                  Start Assessment →
                </button>
                <Link to="#" className="link-text-center">View details</Link>
              </div>

              {/* Assessment Table */}
              <div className="card">
                <h3>Assessment</h3>
                <table className="assessment-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Course / Program</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>
                          <div className="assessment-name">{quiz.title}</div>
                          <div className="assessment-type">Linked to: {quiz.course}</div>
                        </td>
                        <td>
                          <Link to="#" className="course-badge">Course</Link>
                        </td>
                        <td>
                          <div className="due-date">{quiz.dueDate}</div>
                          <div className={`days-left ${quiz.daysLeft.includes('5') ? 'urgent' : ''}`}>
                            in {quiz.daysLeft}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${quiz.status}`}>
                            {quiz.status === 'pending' && 'Pending'}
                            {quiz.status === 'in-progress' && 'In Progress'}
                            {quiz.status === 'not-started' && 'Not Started'}
                          </span>
                        </td>
                        <td>-</td>
                        <td>
                          <button className="btn btn-primary btn-sm">
                            {quiz.status === 'in-progress' ? 'Continue' : 'Start'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="table-footer">
                  <p>Showing 1 to 6 of 12 assessments</p>
                  <Link to="#" className="link-text">View all assessments →</Link>
                </div>
              </div>

              {/* Latest Instructor Feedback */}
              <div className="card">
                <h3>Latest Instructor Feedback</h3>
                {completed.map((item) => (
                  <div key={item.id} className="feedback-item">
                    <div className="feedback-header">
                      <img src={`https://i.pravatar.cc/40?img=${item.id}`} alt={item.instructor} />
                      <div className="feedback-info">
                        <div className="feedback-title">{item.title}</div>
                        <div className="feedback-meta">{item.instructor} • {item.completedDate}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm">View Feedback</button>
                    </div>
                    <p className="feedback-text">{item.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="assessments-sidebar">
              {/* Performance Trend */}
              <div className="card">
                <h4>Performance Trend</h4>
                <p className="card-subtitle">Last 6 Assessments</p>
                <div className="performance-chart">
                  <div className="chart-bars">
                    {performanceTrend.map((item, idx) => (
                      <div key={idx} className="chart-bar-container">
                        <div className="chart-bar" style={{height: `${item.score}%`}}>
                          <div className="bar-fill"></div>
                        </div>
                        <div className="bar-label">{item.month}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{background: '#0B4F9F'}}></div>
                      <span>Your Score</span>
                    </div>
                  </div>
                </div>
                <div className="performance-summary">
                  <div className="summary-item">
                    <span className="summary-label">Average</span>
                    <span className="summary-value">82%</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Highest</span>
                    <span className="summary-value">88%</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Trend</span>
                    <span className="summary-value trend-up">↗ Improving</span>
                  </div>
                </div>
              </div>

              {/* Linked to Expert-Led Learning */}
              <div className="card expert-card">
                <div className="expert-icon">🎓</div>
                <h4>Linked to Expert-Led Learning</h4>
                <p>Many assessments are connected to expert-led courses and live seminars.</p>
                <Link to="/learner/seminars" className="btn btn-outline btn-full">
                  Explore Live Seminars →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assessments
