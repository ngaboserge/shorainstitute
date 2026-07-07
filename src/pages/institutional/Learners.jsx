import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, TrendingUp, AlertTriangle, Award, Download, Plus, Search, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import './Learners.css'

const Learners = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const segmentData = [
    { name: 'Credit & Risk', value: 334, percentage: '26%', color: '#0B4F9F' },
    { name: 'Finance', value: 309, percentage: '24%', color: '#1976D2' },
    { name: 'Operations', value: 312, percentage: '25%', color: '#42A5F5' },
    { name: 'HR & Admin', value: 187, percentage: '15%', color: '#64B5F6' },
    { name: 'IT', value: 106, percentage: '8%', color: '#90CAF9' },
  ]

  const learners = [
    {
      id: 'RDB-1001',
      name: 'Juanee Mukamana',
      avatar: 'https://i.pravatar.cc/150?img=1',
      department: 'Credit & Risk',
      programme: 'Financial Foundation',
      progress: 72,
      lastActive: 'May 30, 2026',
      certificates: 1,
      status: 'Active'
    },
    {
      id: 'RDB-1002',
      name: 'Maria Ndayishimiye',
      avatar: 'https://i.pravatar.cc/150?img=5',
      department: 'Finance',
      programme: 'Financial Planning Basics',
      progress: 48,
      lastActive: 'May 29, 2026',
      certificates: 0,
      status: 'Active'
    },
    {
      id: 'RDB-1003',
      name: 'Emmanuel Kaziwe',
      avatar: 'https://i.pravatar.cc/150?img=12',
      department: 'Operations',
      programme: 'Investment Foundations',
      progress: 40,
      lastActive: 'May 28, 2026',
      certificates: 1,
      status: 'Active'
    },
    {
      id: 'RDB-1004',
      name: 'Aline Cyuenza',
      avatar: 'https://i.pravatar.cc/150?img=9',
      department: 'HR & Admin',
      programme: 'Capital Markets Essentials',
      progress: 35,
      lastActive: 'May 27, 2026',
      certificates: 0,
      status: 'Active'
    },
    {
      id: 'RDB-1005',
      name: 'Dieudonné Bahigize',
      avatar: 'https://i.pravatar.cc/150?img=13',
      department: 'IT',
      programme: 'Risk Management Basics',
      progress: 30,
      lastActive: 'May 26, 2026',
      certificates: 1,
      status: 'Active'
    },
    {
      id: 'RDB-1006',
      name: 'Gloria Nzirakamanzi',
      avatar: 'https://i.pravatar.cc/150?img=10',
      department: 'Finance',
      programme: 'Financial Foundation',
      progress: 32,
      lastActive: 'May 24, 2026',
      certificates: 0,
      status: 'At Risk'
    },
    {
      id: 'RDB-1007',
      name: 'Patrick Twizeyange',
      avatar: 'https://i.pravatar.cc/150?img=14',
      department: 'Credit & Risk',
      programme: 'Financial Planning Basics',
      progress: 20,
      lastActive: 'May 19, 2026',
      certificates: 0,
      status: 'At Risk'
    },
    {
      id: 'RDB-1008',
      name: 'Jocine Mukachimana',
      avatar: 'https://i.pravatar.cc/150?img=8',
      department: 'Operations',
      programme: 'Investment Foundations',
      progress: 30,
      lastActive: 'May 14, 2026',
      certificates: 0,
      status: 'Inactive'
    },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Learners"
          subtitle="Manage your institution's learners, track progress, and assign programmes."
          actions={
            <>
              <select className="date-range-select">
                <option>May 1 - May 31, 2026</option>
              </select>
              <button className="btn btn-primary">
                <Plus size={18} />
                Invite Learners
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
                  <span>32% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active This Month</div>
                <div className="stat-value">892</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>8% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">At Risk</div>
                <div className="stat-value">76</div>
                <div className="stat-change negative">
                  <span>6% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Certificates Earned</div>
                <div className="stat-value">385</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>18% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="learners-content-grid">
            {/* Main Content */}
            <div className="learners-main">
              {/* Filters */}
              <div className="filters-bar">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search learners by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select className="filter-select">
                  <option>All Departments</option>
                  <option>Credit & Risk</option>
                  <option>Finance</option>
                  <option>Operations</option>
                  <option>HR & Admin</option>
                  <option>IT</option>
                </select>

                <select className="filter-select">
                  <option>All Cohorts</option>
                </select>

                <select className="filter-select">
                  <option>All Progress Status</option>
                  <option>On Track</option>
                  <option>At Risk</option>
                  <option>Inactive</option>
                </select>

                <select className="filter-select">
                  <option>All Locations</option>
                </select>

                <button className="btn btn-icon">
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* Learners Table */}
              <div className="card">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Assigned Programme</th>
                        <th>Progress</th>
                        <th>Last Active</th>
                        <th>Certificates</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learners.map((learner) => (
                        <tr key={learner.id}>
                          <td>
                            <div className="learner-info">
                              <img src={learner.avatar} alt={learner.name} className="learner-avatar" />
                              <span className="learner-name">{learner.name}</span>
                            </div>
                          </td>
                          <td>{learner.id}</td>
                          <td>{learner.department}</td>
                          <td>{learner.programme}</td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{width: `${learner.progress}%`}}
                                ></div>
                              </div>
                              <span className="progress-text">{learner.progress}%</span>
                            </div>
                          </td>
                          <td>{learner.lastActive}</td>
                          <td>{learner.certificates}</td>
                          <td>
                            <span className={`badge ${
                              learner.status === 'Active' ? 'success' : 
                              learner.status === 'At Risk' ? 'warning' : 
                              'neutral'
                            }`}>
                              {learner.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="table-footer">
                  <div className="table-info">Showing 1 to 8 of 1,248 learners</div>
                  <div className="pagination">
                    <select className="items-per-page">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                    <div className="pagination-buttons">
                      <button className="pagination-btn">‹</button>
                      <button className="pagination-btn active">1</button>
                      <button className="pagination-btn">2</button>
                      <button className="pagination-btn">3</button>
                      <button className="pagination-btn">...</button>
                      <button className="pagination-btn">125</button>
                      <button className="pagination-btn">›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="learners-sidebar">
              <div className="card">
                <h3 className="card-title">Learner Segments</h3>
                <p className="card-subtitle">Department Breakdown</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-0.5em" fontSize="32" fontWeight="700" fill="#1a1a1a">1,248</tspan>
                        <tspan x="50%" dy="1.5em" fontSize="14" fill="#666">Total</tspan>
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="segment-legend">
                  {segmentData.map((segment, index) => (
                    <div key={index} className="segment-item">
                      <div className="segment-color" style={{background: segment.color}}></div>
                      <div className="segment-info">
                        <div className="segment-name">{segment.name}</div>
                        <div className="segment-value">{segment.percentage} ({segment.value})</div>
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
                    <span>Invite Learners</span>
                  </button>
                  <button className="action-btn">
                    <Download size={20} />
                    <span>Bulk Import CSV</span>
                  </button>
                  <button className="action-btn">
                    <Users size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button className="action-btn">
                    <Download size={20} />
                    <span>Message Cohort</span>
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

export default Learners
