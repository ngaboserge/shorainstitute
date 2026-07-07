import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Download, Plus, Search } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import './Certificates.css'

const Certificates = () => {
  const [selectedTab, setSelectedTab] = useState('All Programmes')
  const [selectedDept, setSelectedDept] = useState('All Departments')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')

  const departmentData = [
    { name: 'Finance & Risk', value: 348, color: '#0B4F9F' },
    { name: 'Operations', value: 348, color: '#1976D2' },
    { name: 'IT', value: 186, color: '#42A5F5' },
    { name: 'HR & Admin', value: 124, color: '#64B5F6' },
    { name: 'Others', value: 186, color: '#90CAF9' }
  ]

  const milestones = [
    {
      month: 'FEB',
      day: '05',
      programme: 'Capital Markets Essentials',
      department: 'Finance & Risk',
      learners: '42 learners',
      daysAway: '2 days'
    },
    {
      month: 'FEB',
      day: '12',
      programme: 'Financial Planning Basics',
      department: 'HR & Finance',
      learners: '84 learners',
      daysAway: '9 days'
    },
    {
      month: 'FEB',
      day: '19',
      programme: 'Retirement Foundations',
      department: 'Operations',
      learners: '51 learners',
      daysAway: '16 days'
    }
  ]

  const certificates = [
    {
      name: 'Jean Mukamana',
      email: 'jean.mukamana@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=1',
      programme: 'Financial Planning Basics',
      type: 'Completion',
      issueDate: 'May 29, 2026',
      verificationId: 'SHORA-JK-00012348',
      cpdCredits: 12,
      status: 'Issued'
    },
    {
      name: 'Aline Uwimana',
      email: 'aline.uwimana@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=5',
      programme: 'Investment Foundation',
      type: 'Completion',
      issueDate: 'May 28, 2026',
      verificationId: 'SHORA-JK-00012347',
      cpdCredits: 30,
      status: 'Issued'
    },
    {
      name: 'Patrick Munzindayo',
      email: 'patrick.munz@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=12',
      programme: 'Capital Markets Essentials',
      type: 'Completion',
      issueDate: 'May 27, 2026',
      verificationId: 'SHORA-JK-00012346',
      cpdCredits: 15,
      status: 'Issued'
    },
    {
      name: 'Isabella Kaviriri',
      email: 'isabella.k@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=9',
      programme: 'Financial Foundations',
      type: 'Completion',
      issueDate: 'May 26, 2026',
      verificationId: 'SHORA-JK-00012345',
      cpdCredits: 8,
      status: 'Issued'
    },
    {
      name: 'David Twagiramungu',
      email: 'david.twag@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=13',
      programme: 'Retirement Planning',
      type: 'Certificate of Achievement',
      issueDate: 'May 25, 2026',
      verificationId: 'SHORA-JK-00012344',
      cpdCredits: 20,
      status: 'Issued'
    },
    {
      name: 'Marcelle Ukundimana',
      email: 'marcelle.u@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=10',
      programme: 'Financial Statement Analysis',
      type: 'Completion',
      issueDate: 'May 24, 2026',
      verificationId: 'SHORA-JK-00012343',
      cpdCredits: 12,
      status: 'Issued'
    },
    {
      name: 'Blaise Karuranga',
      email: 'blaise.karu@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=14',
      programme: 'Risk Management Basics',
      type: 'Certificate of Achievement',
      issueDate: 'May 23, 2026',
      verificationId: 'SHORA-JK-00012342',
      cpdCredits: 50,
      status: 'Requirements Pending'
    },
    {
      name: 'Nerea Epose',
      email: 'nerea.epose@rdb.rw',
      avatar: 'https://i.pravatar.cc/150?img=8',
      programme: 'Wealth Building Principles',
      type: 'Completion',
      issueDate: 'May 22, 2026',
      verificationId: 'SHORA-JK-00012341',
      cpdCredits: 10,
      status: 'Issued'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Certificates"
          subtitle="Track certificates, eligibility, completions, and credential downloads."
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Bulk Export
              </button>
              <button className="btn btn-warning">
                <Plus size={18} />
                Issue Certificate
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="cert-stats-grid">
            <div className="cert-stat-card">
              <div className="cert-stat-icon blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="cert-stat-content">
                <div className="cert-stat-value">1,248</div>
                <div className="cert-stat-label">Certificates Issued</div>
                <div className="cert-stat-meta">↑ 126 vs last month</div>
              </div>
            </div>

            <div className="cert-stat-card">
              <div className="cert-stat-icon yellow">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="cert-stat-content">
                <div className="cert-stat-value">1,642</div>
                <div className="cert-stat-label">Eligible Learners</div>
                <div className="cert-stat-meta">↑ 9% vs last month</div>
              </div>
            </div>

            <div className="cert-stat-card">
              <div className="cert-stat-icon orange">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="cert-stat-content">
                <div className="cert-stat-value">96</div>
                <div className="cert-stat-label">Pending Requirements</div>
                <div className="cert-stat-meta">↓ 5% vs last month</div>
              </div>
            </div>

            <div className="cert-stat-card">
              <div className="cert-stat-icon green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15h6"/>
                </svg>
              </div>
              <div className="cert-stat-content">
                <div className="cert-stat-value">3,258</div>
                <div className="cert-stat-label">CPD Credits Logged</div>
                <div className="cert-stat-meta">↑ 130 vs last month</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="cert-content-grid">
            {/* Left Side - Certificates List */}
            <div className="cert-main-section">
              {/* Filter Bar */}
              <div className="cert-filter-bar">
                <div className="cert-search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Search by learner name or certification ID..." />
                </div>
                
                <select className="cert-filter-select" value={selectedTab} onChange={(e) => setSelectedTab(e.target.value)}>
                  <option>All Programmes</option>
                  <option>Mandatory Training</option>
                  <option>Electives</option>
                  <option>Department Pathways</option>
                  <option>Archived</option>
                </select>

                <select className="cert-filter-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option>All Departments</option>
                  <option>Finance & Risk</option>
                  <option>Operations</option>
                  <option>IT</option>
                  <option>HR & Admin</option>
                </select>

                <select className="cert-filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option>All Statuses</option>
                  <option>Issued</option>
                  <option>Pending</option>
                </select>

                <button className="btn-reset">Reset</button>
              </div>

              {/* Certificates Table */}
              <div className="card cert-table-card">
                <table className="cert-table">
                  <thead>
                    <tr>
                      <th>Learner Name</th>
                      <th>Programme</th>
                      <th>Certificate Type</th>
                      <th>Issue Date</th>
                      <th>Verification ID</th>
                      <th>CPD Credits</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert, index) => (
                      <tr key={index}>
                        <td>
                          <div className="learner-cell">
                            <img src={cert.avatar} alt={cert.name} className="learner-avatar-sm" />
                            <div className="learner-info-cell">
                              <div className="learner-name-cell">{cert.name}</div>
                              <div className="learner-email-cell">{cert.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="programme-cell">{cert.programme}</td>
                        <td>{cert.type}</td>
                        <td>{cert.issueDate}</td>
                        <td className="verification-id">{cert.verificationId}</td>
                        <td className="cpd-credits">{cert.cpdCredits}</td>
                        <td>
                          <span className={`cert-status-badge ${cert.status === 'Issued' ? 'issued' : 'pending'}`}>
                            {cert.status}
                          </span>
                        </td>
                        <td>
                          <div className="cert-actions">
                            <button className="cert-action-btn" title="Download">
                              <Download size={16} />
                            </button>
                            <button className="cert-action-btn" title="View">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button className="cert-action-btn" title="Email">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            </button>
                            <button className="cert-action-btn" title="More">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="12" cy="5" r="1"/>
                                <circle cx="12" cy="19" r="1"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="cert-table-footer">
                  <div className="showing-text">Showing 1 to 8 of 1,248 certificates</div>
                  <div className="cert-pagination">
                    <button className="page-btn">‹</button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <span className="page-dots">...</span>
                    <button className="page-btn">156</button>
                    <button className="page-btn">›</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="cert-bottom-actions">
                <button className="cert-bottom-btn">
                  <Download size={18} />
                  <span>Download</span>
                  <span className="btn-desc">Download certificate</span>
                </button>
                <button className="cert-bottom-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                  <span>Verify</span>
                  <span className="btn-desc">Verify certificate</span>
                </button>
                <button className="cert-bottom-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Resend</span>
                  <span className="btn-desc">Resend to learner</span>
                </button>
                <button className="cert-bottom-btn">
                  <Download size={18} />
                  <span>Bulk Export</span>
                  <span className="btn-desc">Export certificates</span>
                  <span className="btn-link">View audit logs →</span>
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="cert-sidebar">
              {/* Department Distribution */}
              <div className="card cert-sidebar-card">
                <h3 className="cert-sidebar-title">Certificate Distribution by Department</h3>
                <div className="cert-chart-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                        <tspan x="50%" dy="-0.5em" fontSize="28" fontWeight="700" fill="#1a1a1a">1,248</tspan>
                        <tspan x="50%" dy="1.5em" fontSize="13" fill="#666">Total Issued</tspan>
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="cert-chart-legend">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="legend-item-cert">
                      <div className="legend-color" style={{backgroundColor: dept.color}}></div>
                      <div className="legend-info-cert">
                        <span className="legend-name-cert">{dept.name}</span>
                        <span className="legend-value-cert">{dept.value} (29%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="card cert-sidebar-card">
                <div className="cert-sidebar-header">
                  <h3 className="cert-sidebar-title">Upcoming Eligibility Milestones</h3>
                  <a href="#" className="view-all-link">View all</a>
                </div>
                
                <div className="milestones-list">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item">
                      <div className="milestone-date">
                        <div className="milestone-month">{milestone.month}</div>
                        <div className="milestone-day">{milestone.day}</div>
                      </div>
                      <div className="milestone-details">
                        <div className="milestone-programme">{milestone.programme}</div>
                        <div className="milestone-meta">
                          {milestone.department} • {milestone.learners}
                        </div>
                        <div className="milestone-time">{milestone.daysAway}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Preview */}
              <div className="card cert-sidebar-card cert-preview-card">
                <h3 className="cert-sidebar-title">Certificate Preview</h3>
                <div className="cert-preview">
                  <div className="cert-preview-content">
                    <div className="cert-preview-logo">
                      <svg viewBox="0 0 100 100" width="48" height="48">
                        <rect fill="#FDB714" width="100" height="100" rx="8"/>
                        <path d="M 25 75 L 50 25 L 75 50" stroke="#0B4F9F" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="cert-preview-title">SHORA<br/>INSTITUTE</div>
                    </div>
                    <div className="cert-preview-badge">CERTIFICATE<br/>OF COMPLETION</div>
                    <div className="cert-preview-name">Jean Mukamana</div>
                    <div className="cert-preview-text">Has successfully completed the programme</div>
                    <div className="cert-preview-programme">Financial Planning Basics</div>
                    <div className="cert-preview-date">Issued on May 29, 2026</div>
                    <div className="cert-preview-id">SHORA-JK-00012348</div>
                    <div className="cert-preview-signature">
                      <div className="signature-line">_____________</div>
                      <div className="signature-name">Jane Smith, Ed.D</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificates
