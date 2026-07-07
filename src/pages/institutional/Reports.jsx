import React from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Download, FileDown, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './Reports.css'

const Reports = () => {
  const progressData = [
    { name: 'Finance & Risk', completed: 80, inProgress: 15, notStarted: 5 },
    { name: 'Operations', completed: 72, inProgress: 20, notStarted: 8 },
    { name: 'HR & Admin', completed: 66, inProgress: 25, notStarted: 9 },
    { name: 'IT', completed: 64, inProgress: 26, notStarted: 10 },
    { name: 'Credit & Planning', completed: 58, inProgress: 30, notStarted: 12 }
  ]

  const engagementData = [
    { name: 'Financial Foundations', value: 512, percentage: 25, color: '#0B4F9F' },
    { name: 'Financial Planning Basics', value: 403, percentage: 20, color: '#1976D2' },
    { name: 'Investment Foundations', value: 249, percentage: 12, color: '#42A5F5' },
    { name: 'Capital Markets Essentials', value: 187, percentage: 9, color: '#64B5F6' },
    { name: 'Risk Management Basics', value: 186, percentage: 9, color: '#90CAF9' }
  ]

  const trendData = [
    { month: 'Dec 2025', value: 65 },
    { month: 'Jan 2026', value: 57 },
    { month: 'Feb 2026', value: 60 },
    { month: 'Mar 2026', value: 64 },
    { month: 'Apr 2026', value: 66 },
    { month: 'May 2026', value: 71 }
  ]

  const certificateData = [
    { month: 'Nov 2025', value: 201 },
    { month: 'Dec 2025', value: 245 },
    { month: 'Jan 2026', value: 262 },
    { month: 'Feb 2026', value: 288 },
    { month: 'Mar 2026', value: 336 },
    { month: 'Apr 2026', value: 350 }
  ]

  const attendanceData = [
    { month: 'Dec 2025', value: 65 },
    { month: 'Jan 2026', value: 57 },
    { month: 'Feb 2026', value: 60 },
    { month: 'Mar 2026', value: 64 },
    { month: 'Apr 2026', value: 66 },
    { month: 'May 2026', value: 68 }
  ]

  const topDepartments = [
    { rank: 1, name: 'Finance & Risk', completion: 80, attendance: 75, avgScore: 84 },
    { rank: 2, name: 'Operations', completion: 72, attendance: 69, avgScore: 82 },
    { rank: 3, name: 'HR & Admin', completion: 66, attendance: 64, avgScore: 81 },
    { rank: 4, name: 'IT', completion: 64, attendance: 61, avgScore: 79 },
    { rank: 5, name: 'Credit & Planning', completion: 58, attendance: 53, avgScore: 77 }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Reports & Analytics"
          subtitle="Institutional admin views, performance and exports learning impact reports."
          actions={
            <>
              <button className="btn btn-secondary">
                <Download size={18} />
                Download PDF Report
              </button>
              <button className="btn btn-secondary">
                <FileDown size={18} />
                Export CSV
              </button>
              <button className="btn btn-warning">
                <Calendar size={18} />
                Schedule Monthly Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Filters Bar */}
          <div className="reports-filters">
            <select className="reports-filter-select">
              <option>Date Range: May 1 - May 31, 2026</option>
              <option>Custom Range</option>
            </select>
            <select className="reports-filter-select">
              <option>Programme: All Departments</option>
              <option>Finance & Risk</option>
              <option>Operations</option>
            </select>
            <select className="reports-filter-select">
              <option>Department: All Programmes</option>
            </select>
            <select className="reports-filter-select">
              <option>Cohort: All Cohorts</option>
            </select>
            <button className="btn-reset-filters">🔄 Reset Filters</button>
          </div>

          {/* Key Metrics */}
          <div className="reports-metrics-grid">
            <div className="reports-metric-card">
              <div className="metric-icon-reports blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">1,248</div>
                <div className="metric-label-reports">Total Learners</div>
                <div className="metric-change-reports positive">↑ 12% vs Jan 30, 2026</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">75%</div>
                <div className="metric-label-reports">Completion Rate</div>
                <div className="metric-change-reports positive">↑ 3% vs Jan 30, 2026</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">68%</div>
                <div className="metric-label-reports">Live Attendance</div>
                <div className="metric-change-reports positive">↑ 5% vs Jan 30, 2026</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">386</div>
                <div className="metric-label-reports">Certificates Issued</div>
                <div className="metric-change-reports positive">↑ 18% vs Jan 30, 2026</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">82%</div>
                <div className="metric-label-reports">Average Assessment Score</div>
                <div className="metric-change-reports positive">↑ 4% vs Jan 30, 2026</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="19" cy="12" r="1"/>
                  <circle cx="5" cy="12" r="1"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">41%</div>
                <div className="metric-label-reports">Repeat Attendance</div>
                <div className="metric-change-reports negative">↓ 2% vs Jan 30, 2026</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="reports-charts-grid">
            {/* Learner Progress by Department */}
            <div className="card reports-chart-card">
              <div className="reports-chart-header">
                <div>
                  <h3 className="reports-chart-title">Learner Progress by Department</h3>
                  <p className="reports-chart-subtitle">📊</p>
                </div>
                <a href="#" className="reports-view-link">View full report →</a>
              </div>
              <div className="chart-wrapper-reports">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inProgress" stackId="a" fill="#FDB714" name="In Progress" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="notStarted" stackId="a" fill="#E0E0E0" name="Not Started" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Programme Engagement */}
            <div className="card reports-chart-card">
              <div className="reports-chart-header">
                <div>
                  <h3 className="reports-chart-title">Programme Engagement</h3>
                  <p className="reports-chart-subtitle">🎯</p>
                </div>
                <a href="#" className="reports-view-link">View full report →</a>
              </div>
              <div className="chart-wrapper-reports">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                      <tspan x="50%" dy="-0.5em" fontSize="28" fontWeight="700" fill="#1a1a1a">1,248</tspan>
                      <tspan x="50%" dy="1.5em" fontSize="13" fill="#666">Learners</tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
                <div className="engagement-legend-reports">
                  {engagementData.map((item, index) => (
                    <div key={index} className="engagement-legend-item">
                      <div className="legend-color-dot" style={{backgroundColor: item.color}}></div>
                      <span className="legend-text">{item.name}</span>
                      <span className="legend-percentage">{item.percentage}% ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="reports-secondary-charts">
            <div className="card reports-chart-card">
              <div className="reports-chart-header">
                <h3 className="reports-chart-title">Live Seminar Attendance Trend</h3>
                <a href="#" className="reports-view-link">View full report →</a>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0B4F9F" strokeWidth={3} dot={{fill: '#0B4F9F', r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card reports-chart-card">
              <div className="reports-chart-header">
                <h3 className="reports-chart-title">Certificate Issuance Over Time</h3>
                <a href="#" className="reports-view-link">View full report →</a>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={certificateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0B4F9F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card reports-chart-card">
              <div className="reports-chart-header">
                <h3 className="reports-chart-title">Monthly Completion Trend</h3>
                <a href="#" className="reports-view-link">View full report →</a>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={3} dot={{fill: '#4CAF50', r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights and Top Departments */}
          <div className="reports-bottom-grid">
            <div className="card insights-card">
              <h3 className="reports-chart-title">Insights Summary</h3>
              <div className="insights-list">
                <div className="insight-item">
                  <div className="insight-icon">📈</div>
                  <div className="insight-content">
                    <div className="insight-title">Your completion is trending upward</div>
                    <div className="insight-desc">Your team deep-dive improved vs previous quarter assignment.</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">👥</div>
                  <div className="insight-content">
                    <div className="insight-title">Low attendance is impacting completion</div>
                    <div className="insight-desc">Live seminar can improve 30-40% more participation.</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon">💡</div>
                  <div className="insight-content">
                    <div className="insight-title">Certificate trend is remarkably high</div>
                    <div className="insight-desc">Your learners are completing vs benchmark data and cohort.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card suggested-actions-card">
              <h3 className="reports-chart-title">Suggested Actions</h3>
              <div className="actions-list">
                <div className="action-item">
                  <div className="action-checkbox">✓</div>
                  <span>Encourage departments with 30% completion ratio to increase learner resources.</span>
                </div>
                <div className="action-item">
                  <div className="action-checkbox">✓</div>
                  <span>Increase high demand cohort for custom attendance momentum.</span>
                </div>
                <div className="action-item">
                  <div className="action-checkbox">✓</div>
                  <span>Recognize high performers department chairs and cohort leads.</span>
                </div>
              </div>
            </div>

            <div className="card quick-export-card">
              <h3 className="reports-chart-title">Quick Export & Scheduling</h3>
              <div className="export-actions">
                <button className="export-btn">
                  <FileDown size={18} />
                  <span>Download PDF Report</span>
                </button>
                <button className="export-btn">
                  <FileDown size={18} />
                  <span>Export Data (CSV)</span>
                </button>
                <button className="export-btn">
                  <Calendar size={18} />
                  <span>Schedule Monthly Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Departments Table */}
          <div className="card">
            <div className="reports-chart-header">
              <h3 className="reports-chart-title">Top Departments by Performance</h3>
              <a href="#" className="reports-view-link">View all →</a>
            </div>
            <table className="top-departments-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Department</th>
                  <th>Completion Rate</th>
                  <th>Live Attendance</th>
                  <th>Avg. Score</th>
                </tr>
              </thead>
              <tbody>
                {topDepartments.map((dept) => (
                  <tr key={dept.rank}>
                    <td className="rank-cell">{dept.rank}</td>
                    <td className="dept-name-cell">{dept.name}</td>
                    <td>
                      <div className="progress-with-label">
                        <div className="mini-progress">
                          <div className="mini-progress-fill" style={{width: `${dept.completion}%`}}></div>
                        </div>
                        <span>{dept.completion}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="progress-with-label">
                        <div className="mini-progress">
                          <div className="mini-progress-fill" style={{width: `${dept.attendance}%`}}></div>
                        </div>
                        <span>{dept.attendance}%</span>
                      </div>
                    </td>
                    <td className="score-cell">{dept.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
