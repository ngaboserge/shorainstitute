import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Users, TrendingUp, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import CreateCohortModal from '../../components/modals/CreateCohortModal'
import AssignProgrammeModal from '../../components/modals/AssignProgrammeModal'
import ProgrammeDetailsModal from '../../components/modals/ProgrammeDetailsModal'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Programmes.css'

const Programmes = () => {
  const { institutionId } = useShoraInstitute()
  const [activeTab, setActiveTab] = useState('All Programmes')
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false)
  const [showAssignProgrammeModal, setShowAssignProgrammeModal] = useState(false)
  const [showProgrammeDetailsModal, setShowProgrammeDetailsModal] = useState(false)
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    totalEnrolled: 0,
    activeCohorts: 0,
    avgCompletion: 0
  })

  useEffect(() => {
    fetchProgrammes()
  }, [])

  const fetchProgrammes = async () => {
    try {
      setLoading(true)

      // Fetch programme assignments with learning path and cohort info
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('institution_programme_assignments')
        .select(`
          *,
          learning_paths:programme_id (
            title,
            description
          ),
          institution_cohorts:cohort_id (
            name,
            code
          )
        `)
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (assignmentsError) throw assignmentsError

      // Transform data for display
      const transformedProgrammes = assignmentsData.map(prog => ({
        name: prog.learning_paths?.title || 'Unknown Programme',
        code: prog.institution_cohorts?.code || 'N/A',
        dept: 'Various', // TODO: Get department from learner data
        enrolled: 0, // TODO: Count from cohort_members
        progress: `0%`, // TODO: Calculate from course_progress
        progressValue: 0,
        upcomingSession: 'TBD',
        invitedSpeaker: 'TBA',
        completionRate: `0%` // TODO: Calculate from course_progress
      }))

      setProgrammes(transformedProgrammes)

      // Calculate stats
      const totalEnrolled = 0 // TODO: Sum actual enrollment
      const avgCompletion = 0 // TODO: Calculate from real progress data

      setStats({
        total: transformedProgrammes.length,
        totalEnrolled,
        activeCohorts: transformedProgrammes.length,
        avgCompletion
      })

    } catch (error) {
      console.error('Error fetching programmes:', error)
      // Show empty state instead of mock data
      setProgrammes([])
      setStats({
        total: 0,
        totalEnrolled: 0,
        activeCohorts: 0,
        avgCompletion: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCohort = async (cohortData) => {
    console.log('Create cohort data:', cohortData)
    // TODO: Implement actual cohort creation logic with database
    return Promise.resolve()
  }

  const handleAssignProgramme = async (assignmentData) => {
    console.log('Assignment data:', assignmentData)
    // TODO: Implement actual assignment logic with database
    return Promise.resolve()
  }

  const handleProgrammeClick = (prog) => {
    setSelectedProgramme(prog)
    setShowProgrammeDetailsModal(true)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Programmes & Cohorts"
          subtitle="Manage enrolled programmes, cohorts, assignments, and learner progress across departments."
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateCohortModal(true)}
            >
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
                <div className="stat-value">{loading ? '...' : stats.total}</div>
                <div className="stat-change positive">↑ 2 vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Cohorts</div>
                <div className="stat-value">{loading ? '...' : stats.activeCohorts}</div>
                <div className="stat-change positive">↑ 6 vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learners Enrolled</div>
                <div className="stat-value">{loading ? '...' : stats.totalEnrolled.toLocaleString()}</div>
                <div className="stat-change positive">↑ 32% vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Completion</div>
                <div className="stat-value">{loading ? '...' : `${stats.avgCompletion}%`}</div>
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
                      {loading ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                            Loading programmes...
                          </td>
                        </tr>
                      ) : programmes.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                            No programmes found
                          </td>
                        </tr>
                      ) : (
                        programmes.map((prog, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => handleProgrammeClick(prog)}
                          style={{ cursor: 'pointer' }}
                        >
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
                          <td onClick={(e) => e.stopPropagation()}>
                            <button className="btn-icon">⋮</button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cohort Calendar */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Cohort Calendar - Start Dates & Checkpoints</h3>
                </div>
                {programmes.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Your cohort calendar will appear here once you create cohorts and set milestone dates.
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#666' }}>No milestones scheduled yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="programmes-sidebar">
              <div className="card">
                <h3 className="card-title">Upcoming Cohort Milestones</h3>
                {programmes.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Cohort milestones will appear here once you create cohorts and assign programmes.
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    <p>No upcoming milestones</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setShowCreateCohortModal(true)}
                  >
                    <Users size={20} />
                    <span>Create Cohort</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowAssignProgrammeModal(true)}
                  >
                    <BookOpen size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => alert('Request custom seminar functionality coming soon')}
                  >
                    <Calendar size={20} />
                    <span>Request Custom Seminar</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => alert('Duplicate cohort functionality coming soon')}
                  >
                    <BookOpen size={20} />
                    <span>Duplicate Cohort</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Cohort Modal */}
      <CreateCohortModal 
        isOpen={showCreateCohortModal}
        onClose={() => setShowCreateCohortModal(false)}
        onCreate={handleCreateCohort}
        institutionId={institutionId}
      />

      {/* Assign Programme Modal */}
      <AssignProgrammeModal 
        isOpen={showAssignProgrammeModal}
        onClose={() => setShowAssignProgrammeModal(false)}
        onAssign={handleAssignProgramme}
        selectedLearners={[]}
        institutionId={institutionId}
      />

      {/* Programme Details Modal */}
      <ProgrammeDetailsModal 
        isOpen={showProgrammeDetailsModal}
        onClose={() => setShowProgrammeDetailsModal(false)}
        programme={selectedProgramme}
      />
    </div>
  )
}

export default Programmes
