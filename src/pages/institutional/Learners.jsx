import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, TrendingUp, AlertTriangle, Award, Download, Plus, Search, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import InviteLearnersModal from '../../components/modals/InviteLearnersModal'
import BulkImportModal from '../../components/modals/BulkImportModal'
import LearnerDetailsModal from '../../components/modals/LearnerDetailsModal'
import AssignProgrammeModal from '../../components/modals/AssignProgrammeModal'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Learners.css'

const Learners = () => {
  const { institutionId } = useShoraInstitute()
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLearner, setSelectedLearner] = useState(null)
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    atRisk: 0,
    certificates: 0
  })

  useEffect(() => {
    fetchLearners()
  }, [])

  const fetchLearners = async () => {
    try {
      setLoading(true)

      // Fetch learners with profile and department info
      const { data: learnersData, error: learnersError } = await supabase
        .from('institution_learners')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          ),
          institution_departments:department_id (
            name
          )
        `)
        .eq('institution_id', institutionId)
        .order('enrolled_at', { ascending: false })
        .limit(50)

      if (learnersError) throw learnersError

      // Transform data for display
      const transformedLearners = learnersData.map(learner => ({
        id: learner.employee_id || `LEARNER-${learner.id.substring(0, 8).toUpperCase()}`,
        name: learner.profiles?.full_name || 'Unknown Learner',
        email: learner.profiles?.email || '',
        avatar: learner.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${learner.user_id}`,
        department: learner.institution_departments?.name || 'Unassigned',
        programme: 'Not Assigned', // TODO: Get from programme_assignments
        progress: 0, // TODO: Calculate from course_progress - showing 0 instead of random
        lastActive: new Date(learner.last_active_at || learner.enrolled_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        certificates: 0, // TODO: Count from certificates table
        status: learner.status === 'active' ? 'Active' : learner.status === 'at_risk' ? 'At Risk' : 'Inactive'
      }))

      setLearners(transformedLearners)

      // Calculate stats
      const activeCount = transformedLearners.filter(l => l.status === 'Active').length
      const atRiskCount = transformedLearners.filter(l => l.status === 'At Risk').length
      
      setStats({
        total: transformedLearners.length,
        active: activeCount,
        atRisk: atRiskCount,
        certificates: 0 // TODO: Calculate from certificates - showing 0 instead of 385
      })

    } catch (error) {
      console.error('Error fetching learners:', error)
      // Show empty state instead of mock data
      setLearners([])
      setStats({
        total: 0,
        active: 0,
        atRisk: 0,
        certificates: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Department segment data - show only if we have real department data
  const segmentData = learners.length > 0 ? [
    { name: 'Unassigned', value: learners.filter(l => l.department === 'Unassigned').length, color: '#90CAF9' },
    // Add more departments as they get assigned
  ].filter(s => s.value > 0) : []

  const handleInvite = async (inviteData) => {
    console.log('Invite data:', inviteData)
    // TODO: Implement actual invite logic with database
    // For now, just simulate success
    return Promise.resolve()
  }

  const handleLearnerClick = (learner) => {
    setSelectedLearner(learner)
    setShowDetailsModal(true)
  }

  const handleAssignProgramme = async (assignmentData) => {
    console.log('Assignment data:', assignmentData)
    // TODO: Implement actual assignment logic with database
    // For now, just simulate success
    return Promise.resolve()
  }

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
              <button 
                className="btn btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
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
                <div className="stat-value">{loading ? '...' : stats.total.toLocaleString()}</div>
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
                <div className="stat-value">{loading ? '...' : stats.active.toLocaleString()}</div>
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
                <div className="stat-value">{loading ? '...' : stats.atRisk}</div>
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
                <div className="stat-value">{loading ? '...' : stats.certificates.toLocaleString()}</div>
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
                      {loading ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                            Loading learners...
                          </td>
                        </tr>
                      ) : learners.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                            No learners found
                          </td>
                        </tr>
                      ) : (
                        learners.map((learner) => (
                          <tr 
                            key={learner.id}
                            onClick={() => handleLearnerClick(learner)}
                            style={{ cursor: 'pointer' }}
                          >
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
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn-icon">⋮</button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="table-footer">
                  <div className="table-info">
                    Showing 1 to {Math.min(learners.length, 8)} of {stats.total.toLocaleString()} learners
                  </div>
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
                {segmentData.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Department breakdown will appear here once learners are assigned to departments.
                    </p>
                  </div>
                ) : (
                  <>
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
                        <tspan x="50%" dy="-0.5em" fontSize="32" fontWeight="700" fill="#1a1a1a">{stats.total}</tspan>
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
                        <div className="segment-value">{((segment.value / stats.total) * 100).toFixed(0)}% ({segment.value})</div>
                      </div>
                    </div>
                  ))}
                </div>
                  </>
                )}
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <Users size={20} />
                    <span>Invite Learners</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowBulkImportModal(true)}
                  >
                    <Download size={20} />
                    <span>Bulk Import CSV</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowAssignModal(true)}
                  >
                    <Users size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => alert('Message Cohort functionality coming soon')}
                  >
                    <Download size={20} />
                    <span>Message Cohort</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Learners Modal */}
      <InviteLearnersModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false)
          fetchLearners()
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal 
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onSuccess={() => {
          setShowBulkImportModal(false)
          fetchLearners()
        }}
      />

      {/* Learner Details Modal */}
      <LearnerDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        learner={selectedLearner}
      />

      {/* Assign Programme Modal */}
      <AssignProgrammeModal 
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignProgramme}
        selectedLearners={[]}
        institutionId={institutionId}
      />
    </div>
  )
}

export default Learners
