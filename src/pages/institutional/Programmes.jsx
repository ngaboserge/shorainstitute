import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Users, TrendingUp, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Programmes.css'

const Programmes = () => {
  const [activeTab, setActiveTab] = useState('All Programmes')

  const programmes = [
    { 
      name: 'Financial Foundations', 
      code: 'FF-2026-Q2', 
      dept: 'Credit & Risk', 
      enrolled: 299, 
      progress: '73%',
      progressValue: 73,
      upcomingSession: 'May 08, 2026 9:00 AM (EAT)',
      invitedSpeaker: 'Dr. Anan Hakizimana',
      completionRate: '73%'
    },
    { 
      name: 'Financial Planning Basics', 
      code: 'FPB-2026-Q2', 
      dept: 'Finance', 
      enrolled: 242, 
      progress: '68%',
      progressValue: 68,
      upcomingSession: 'May 15, 2026 2:00 PM (EAT)',
      invitedSpeaker: 'Peace Uwase',
      completionRate: '68%'
    },
    { 
      name: 'Investment Foundations', 
      code: 'INV-2026-Q2', 
      dept: 'Investment', 
      enrolled: 198, 
      progress: '60%',
      progressValue: 60,
      upcomingSession: 'May 22, 2026 3:00 PM (EAT)',
      invitedSpeaker: 'David Nkundanze',
      completionRate: '63%'
    },
    { 
      name: 'Risk Management Basics', 
      code: 'RMB-2026-Q2', 
      dept: 'Risk', 
      enrolled: 210, 
      progress: '61%',
      progressValue: 61,
      upcomingSession: 'May 29, 2026 2:00 PM (EAT)',
      invitedSpeaker: 'Uwamahoro Aline',
      completionRate: '63%'
    },
    { 
      name: 'Capital Markets Essentials', 
      code: 'CME-2026-Q2', 
      dept: 'Markets', 
      enrolled: 176, 
      progress: '55%',
      progressValue: 55,
      upcomingSession: 'Jun 05, 2026 3:00 PM (EAT)',
      invitedSpeaker: 'Jean Bosco Nkuranza',
      completionRate: '52%'
    },
    { 
      name: 'Treasury Management', 
      code: 'TM-2026-Q2', 
      dept: 'Treasury', 
      enrolled: 142, 
      progress: '50%',
      progressValue: 50,
      upcomingSession: 'Jun 12, 2026 2:00 PM (EAT)',
      invitedSpeaker: 'Clare Mukamana',
      completionRate: '48%'
    },
    { 
      name: 'SME Finance Essentials', 
      code: 'SME-2026-Q2', 
      dept: 'Business Banking', 
      enrolled: 131, 
      progress: '41%',
      progressValue: 41,
      upcomingSession: 'Jun 19, 2026 3:00 PM (EAT)',
      invitedSpeaker: 'Fernand Habimana',
      completionRate: '40%'
    },
  ]

  const cohortMilestones = [
    { date: 'MAY\n08', day: 8, programme: 'FF-2026-Q2 Kickoff', subtitle: 'Financial Foundations', completionRate: '73%' },
    { date: 'MAY\n15', day: 15, programme: 'FPB-2026-Q2 Kickoff', subtitle: 'Financial Planning Basics', completionRate: '68%' },
    { date: 'MAY\n29', day: 29, programme: 'RMB-2026-Q2 Checkpoint 1', subtitle: 'Risk Management Basics', completionRate: '63%' },
    { date: 'JUN\n12', day: 12, programme: 'TM-2026-Q2 Checkpoint 2', subtitle: 'Treasury Management', completionRate: '50%' },
    { date: 'JUN\n19', day: 19, programme: 'SME-2026-Q2 Kickoff', subtitle: 'SME Finance Essentials', completionRate: '41%' },
    { date: 'JUL\n08', day: 8, programme: 'CME-2026-Q2 Kickoff', subtitle: 'Capital Markets Essentials', completionRate: '52%' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Programmes & Cohorts"
          subtitle="Manage enrolled programmes, cohorts, assignments, and learner progress across departments."
          actions={
            <button className="btn btn-primary">
              <Plus size={18} />
              Create Cohort
            </button>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Programmes</div>
                <div className="stat-value">18</div>
                <div className="stat-change positive">↑ 2 vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Cohorts</div>
                <div className="stat-value">48</div>
                <div className="stat-change positive">↑ 6 vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learners Enrolled</div>
                <div className="stat-value">1,248</div>
                <div className="stat-change positive">↑ 32% vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Completion</div>
                <div className="stat-value">68%</div>
                <div className="stat-change positive">↑ 4% vs last month</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="programmes-tabs">
            <button 
              className={`tab ${activeTab === 'All Programmes' ? 'active' : ''}`}
              onClick={() => setActiveTab('All Programmes')}
            >
              All Programmes
            </button>
            <button 
              className={`tab ${activeTab === 'Mandatory Training' ? 'active' : ''}`}
              onClick={() => setActiveTab('Mandatory Training')}
            >
              Mandatory Training
            </button>
            <button 
              className={`tab ${activeTab === 'Electives' ? 'active' : ''}`}
              onClick={() => setActiveTab('Electives')}
            >
              Electives
            </button>
            <button 
              className={`tab ${activeTab === 'Department Pathways' ? 'active' : ''}`}
              onClick={() => setActiveTab('Department Pathways')}
            >
              Department Pathways
            </button>
            <button 
              className={`tab ${activeTab === 'Archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('Archived')}
            >
              Archived
            </button>
          </div>

          {/* Programmes Table and Sidebar */}
          <div className="programmes-content-grid">
            <div className="programmes-main">
              <div className="card">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Programme</th>
                        <th>Cohort</th>
                        <th>Department</th>
                        <th>Enrolled Learners</th>
                        <th>Progress</th>
                        <th>Upcoming Live Session</th>
                        <th>Invited Speaker</th>
                        <th>Completion Rate</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmes.map((prog, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="programme-name-cell">
                              <BookOpen size={16} style={{color: '#0B4F9F'}} />
                              <span className="programme-name">{prog.name}</span>
                            </div>
                          </td>
                          <td>{prog.code}</td>
                          <td>{prog.dept}</td>
                          <td>{prog.enrolled}</td>
                          <td>
                            <div className="progress-cell-inline">
                              <div className="progress-bar-small">
                                <div 
                                  className="progress-fill" 
                                  style={{width: prog.progress}}
                                ></div>
                              </div>
                              <span className="progress-text-small">{prog.progress}</span>
                            </div>
                          </td>
                          <td>
                            <div className="session-date-cell">
                              <Calendar size={14} />
                              <span>{prog.upcomingSession}</span>
                            </div>
                          </td>
                          <td>{prog.invitedSpeaker}</td>
                          <td>
                            <div className="completion-circle">
                              {prog.completionRate}
                            </div>
                          </td>
                          <td>
                            <button className="btn-icon">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cohort Calendar */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Cohort Calendar - Start Dates & Checkpoints</h3>
                  <a href="#" className="link-text">View calendar →</a>
                </div>
                <div className="cohort-calendar">
                  {cohortMilestones.map((milestone, idx) => (
                    <div key={idx} className="cohort-milestone">
                      <div className="milestone-date">
                        {milestone.date.split('\n').map((line, i) => (
                          <div key={i} className={i === 1 ? 'date-day' : 'date-month'}>{line}</div>
                        ))}
                        <div className="milestone-indicator">🎯</div>
                      </div>
                      <div className="milestone-info">
                        <div className="milestone-programme">{milestone.programme}</div>
                        <div className="milestone-subtitle">{milestone.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="programmes-sidebar">
              <div className="card">
                <h3 className="card-title">Upcoming Cohort Milestones</h3>
                <a href="#" className="link-text-small">View all →</a>
                <div className="milestones-list">
                  <div className="milestone-item">
                    <div className="milestone-date-badge">
                      <div className="date-month">JUN</div>
                      <div className="date-day-large">08</div>
                    </div>
                    <div className="milestone-details">
                      <div className="milestone-title">FF-2026-Q2 Kickoff</div>
                      <div className="milestone-desc">Financial Foundations</div>
                      <div className="milestone-time">310 learners</div>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-date-badge">
                      <div className="date-month">MAY</div>
                      <div className="date-day-large">15</div>
                    </div>
                    <div className="milestone-details">
                      <div className="milestone-title">FPB-2026-Q2 Kickoff</div>
                      <div className="milestone-desc">Financial Planning Basics</div>
                      <div className="milestone-time">210 learners</div>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-date-badge">
                      <div className="date-month">JUN</div>
                      <div className="date-day-large">29</div>
                    </div>
                    <div className="milestone-details">
                      <div className="milestone-title">RMB-2026-Q2 Checkpoint 1</div>
                      <div className="milestone-desc">Risk Management Basics</div>
                      <div className="milestone-time">210 learners</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn">
                    <Users size={20} />
                    <span>Create Cohort</span>
                  </button>
                  <button className="action-btn">
                    <BookOpen size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button className="action-btn">
                    <Calendar size={20} />
                    <span>Request Custom Seminar</span>
                  </button>
                  <button className="action-btn">
                    <BookOpen size={20} />
                    <span>Duplicate Cohort</span>
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

export default Programmes
