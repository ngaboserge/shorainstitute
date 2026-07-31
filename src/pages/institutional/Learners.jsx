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
    console.log('Learners useEffect - institutionId:', institutionId)
    if (institutionId) {
      fetchLearners()
    }
  }, [institutionId])

  const fetchLearners = async () => {
    if (!institutionId) {
      console.log('❌ No institutionId available yet, skipping fetch')
      return
    }

    console.log('✅ Fetching learners for institution:', institutionId)
    
    try {
      setLoading(true)

      // Use the database function to get learners with real user data
      const { data: learnersData, error: learnersError } = await supabase
        .rpc('get_institution_learners_full', { p_institution_id: institutionId })

      if (learnersError) {
        console.error('Error fetching learners:', learnersError)
        throw learnersError
      }

      console.log('📊 Active learners found:', learnersData?.length || 0)
      if (learnersData && learnersData.length > 0) {
        console.log('Sample learner data:', learnersData[0])
      }

      // Step 2: Get pending assignments (learners who haven't joined yet)
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_course_assignments')
        .select(`
          employee_email, 
          employee_name, 
          employee_id, 
          department_id, 
          created_at, 
          course_id,
          institution_departments(name)
        `)
        .eq('institution_id', institutionId)
        .eq('status', 'pending')

      if (pendingError) {
        console.error('Error fetching pending assignments:', pendingError)
      }

      console.log('📋 Pending assignments found:', pendingData?.length || 0)

      // Group pending by email to avoid duplicates
      const pendingByEmail = {}
      pendingData?.forEach(p => {
        if (!pendingByEmail[p.employee_email]) {
          pendingByEmail[p.employee_email] = {
            ...p,
            courses: []
          }
        }
        pendingByEmail[p.employee_email].courses.push(p.course_id)
      })

      // Step 3: Get user IDs for certificates lookup
      const userIds = (learnersData || []).map(il => il.user_id).filter(id => id)

      // Step 4: Get certificates
      let certificatesData = []
      if (userIds.length > 0) {
        const { data: certs } = await supabase
          .from('certificates')
          .select('learner_id')
          .in('learner_id', userIds)
        
        certificatesData = certs || []
      }

      const certsByUser = {}
      certificatesData.forEach(c => {
        certsByUser[c.learner_id] = (certsByUser[c.learner_id] || 0) + 1
      })

      // Step 5: Transform active learners to display format
      const activeLearners = (learnersData || []).map(learner => {
        const daysSinceAccess = learner.total_enrollments > 0 
          ? Math.floor((Date.now() - new Date(learner.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0
        const status = daysSinceAccess > 7 ? 'At Risk' : 'Active'

        return {
          id: learner.employee_id || learner.id.substring(0, 8).toUpperCase(),
          name: learner.user_name || 'Unknown',
          email: learner.user_email || 'No email',
          department: learner.department_name || 'Unassigned',
          programme: `${learner.total_enrollments || 0} course(s)`,
          progress: learner.avg_progress || 0,
          lastActive: new Date(learner.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          certificates: certsByUser[learner.user_id] || 0,
          status,
          isPending: false
        }
      })

      // Step 6: Transform pending assignments to display format
      const pendingLearners = Object.values(pendingByEmail).map(pending => {
        return {
          id: pending.employee_id || pending.employee_email.substring(0, 8).toUpperCase(),
          name: pending.employee_name || pending.employee_email.split('@')[0],
          email: pending.employee_email,
          department: pending.institution_departments?.name || 'Unassigned',
          programme: `${pending.courses.length} pending course(s)`,
          progress: 0,
          lastActive: 'Pending',
          certificates: 0,
          status: 'Pending',
          isPending: true
        }
      })

      // Combine active and pending learners
      const allLearners = [...activeLearners, ...pendingLearners]

      console.log('✅ Total learners (active + pending):', allLearners.length)
      console.log('   - Active learners:', activeLearners.length)
      console.log('   - Pending learners:', pendingLearners.length)

      setLearners(allLearners)

      // Calculate stats
      const activeCount = activeLearners.filter(l => l.status === 'Active').length
      const atRiskCount = activeLearners.filter(l => l.status === 'At Risk').length
      const totalCerts = Object.values(certsByUser).reduce((sum, count) => sum + count, 0)
      
      setStats({
        total: allLearners.length,
        active: activeCount,
        atRisk: atRiskCount,
        certificates: totalCerts
      })

    } catch (error) {
      console.error('Error fetching learners:', error)
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

  // Department segment data - calculated from real learner departments
  const departmentCounts = {}
  learners.forEach(learner => {
    const dept = learner.department || 'Unassigned'
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
  })

  const colors = ['#0B4F9F', '#1976D2', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB']
  const segmentData = Object.entries(departmentCounts)
    .map(([name, count], idx) => ({
      name,
      value: count,
      color: colors[idx % colors.length]
    }))
    .filter(s => s.value > 0)

  const handleInvite = async (inviteData) => {
    try {
      // If single invite with name provided, create learner directly
      if (inviteData.name && inviteData.email) {
        // Check if user exists in auth.users
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', inviteData.email.toLowerCase().trim())
          .maybeSingle()

        let userId = existingUser?.id

        // If user doesn't exist, create placeholder (they'll complete profile on first login)
        if (!userId) {
          // For now, create an invitation that can be accepted
          // TODO: Implement user creation via admin panel or invitation acceptance flow
          console.log('User does not exist yet, creating invitation...')
        }

        // If we have a userId, add them directly to institution_learners
        if (userId) {
          const { data: learner, error: learnerError } = await supabase
            .from('institution_learners')
            .insert({
              institution_id: institutionId,
              user_id: userId,
              employee_name: inviteData.name,
              employee_id: inviteData.employeeId || null,
              department: inviteData.department || 'Unassigned',
              job_title: inviteData.jobTitle || null,
              status: 'active'
            })
            .select()
            .single()

          if (learnerError) throw learnerError

          console.log('Learner added successfully:', learner)
        }
      }

      // Refresh learners list
      await fetchLearners()
      return Promise.resolve()
    } catch (error) {
      console.error('Error adding learner:', error)
      throw error
    }
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
                        <th>Email</th>
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
                          <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                            Loading learners...
                          </td>
                        </tr>
                      ) : learners.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
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
                            <span className="learner-name">{learner.name}</span>
                          </td>
                          <td>{learner.email}</td>
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
