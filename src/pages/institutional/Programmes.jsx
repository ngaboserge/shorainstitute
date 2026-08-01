import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { BookOpen, Users, TrendingUp, Plus, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CreateCohortModal from '../../components/modals/CreateCohortModal'
import AssignProgrammeModal from '../../components/modals/AssignProgrammeModal'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Programmes.css'

const Programmes = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [activeTab, setActiveTab] = useState('All Programmes')
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false)
  const [showAssignProgrammeModal, setShowAssignProgrammeModal] = useState(false)
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    totalEnrolled: 0,
    activeCohorts: 0,
    avgCompletion: 0,
    mandatoryCount: 0,
    electiveCount: 0,
    pathwayCount: 0,
    archivedCount: 0
  })

  useEffect(() => {
    fetchProgrammes()
  }, [activeTab])

  const fetchProgrammes = async () => {
    try {
      setLoading(true)

      // Fetch published courses from the courses table
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        throw coursesError
      }

      

      // Courses already have instructor_name, no need for separate query!
      if (coursesData && coursesData.length > 0) {
        )
        
      }

      // Fetch enrollment counts for each course (ONLY for this institution)
      // We'll use learner_institutional_enrollments table if migrations are run
      // Otherwise show 0 enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('learner_institutional_enrollments')
        .select('course_id, progress, status')
        .eq('institution_id', institutionId)

      if (enrollmentError) {
        
        // Continue without enrollment data - it's okay
      }

      // Group enrollments by course
      const enrollmentsByCourse = {}
      enrollmentData?.forEach(e => {
        if (!enrollmentsByCourse[e.course_id]) {
          enrollmentsByCourse[e.course_id] = []
        }
        enrollmentsByCourse[e.course_id].push(e.progress || 0)
      })

      // Transform courses for display
      const transformedProgrammes = (coursesData || []).map(course => {
        const enrollments = enrollmentsByCourse[course.id] || []
        const avgProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, p) => sum + p, 0) / enrollments.length)
          : 0
        
        // Use instructor_name from course (already stored in DB)
        const instructorName = course.instructor_name || 'Unknown Instructor'

        // Determine programme type based on course level or custom field
        let programmeType = 'elective' // default
        if (course.level === 'Beginner' || course.category?.toLowerCase().includes('fundamental')) {
          programmeType = 'mandatory'
        } else if (course.level === 'Intermediate' || course.level === 'Advanced') {
          programmeType = 'elective'
        }
        
        // Check if it's a department pathway (multi-course series)
        if (course.title?.toLowerCase().includes('pathway') || course.title?.toLowerCase().includes('series')) {
          programmeType = 'pathway'
        }

        return {
          id: course.id,
          name: course.title,
          code: course.category || 'General',
          dept: course.category || 'General',  // Shows course category in Department column
          enrolled: enrollments.length,
          progress: `${avgProgress}%`,
          progressValue: avgProgress,
          upcomingSession: 'Self-paced',
          invitedSpeaker: instructorName,  // Shows instructor name in Invited Speaker column
          completionRate: `${Math.round((enrollments.filter(p => p === 100).length / Math.max(enrollments.length, 1)) * 100)}%`,
          description: course.description,
          instructor_id: course.instructor_id,
          instructor_name: course.instructor_name,
          programmeType, // 'mandatory', 'elective', 'pathway', or 'archived'
          status: course.status
        }
      })

      // Filter by active tab
      let filteredProgrammes = transformedProgrammes
      if (activeTab === 'Mandatory Training') {
        filteredProgrammes = transformedProgrammes.filter(p => p.programmeType === 'mandatory')
      } else if (activeTab === 'Electives') {
        filteredProgrammes = transformedProgrammes.filter(p => p.programmeType === 'elective')
      } else if (activeTab === 'Department Pathways') {
        filteredProgrammes = transformedProgrammes.filter(p => p.programmeType === 'pathway')
      } else if (activeTab === 'Archived') {
        filteredProgrammes = transformedProgrammes.filter(p => p.status === 'archived')
      }
      // 'All Programmes' shows everything

      setProgrammes(filteredProgrammes)

      // Calculate tab counts from ALL programmes
      const mandatoryCount = transformedProgrammes.filter(p => p.programmeType === 'mandatory').length
      const electiveCount = transformedProgrammes.filter(p => p.programmeType === 'elective').length
      const pathwayCount = transformedProgrammes.filter(p => p.programmeType === 'pathway').length
      const archivedCount = transformedProgrammes.filter(p => p.status === 'archived').length

      // Calculate stats
      const totalEnrolled = Object.values(enrollmentsByCourse).reduce((sum, arr) => sum + arr.length, 0)
      const allProgress = Object.values(enrollmentsByCourse).flat()
      const avgCompletion = allProgress.length > 0
        ? Math.round(allProgress.reduce((sum, p) => sum + p, 0) / allProgress.length)
        : 0

      setStats({
        total: transformedProgrammes.length,
        totalEnrolled,
        activeCohorts: transformedProgrammes.length,
        avgCompletion,
        mandatoryCount,
        electiveCount,
        pathwayCount,
        archivedCount
      })

    } catch (error) {
      console.error('Error fetching programmes:', error)
      setError(error.message || 'Failed to load programmes')
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
    
    // TODO: Implement actual cohort creation logic with database
    return Promise.resolve()
  }

  const handleAssignProgramme = async (assignmentData) => {
    
    
    try {
      // Show success message
      alert(`Successfully assigned course to ${assignmentData.assignedCount || assignmentData.learnerCount || assignmentData.totalCount || 0} employee(s)!${assignmentData.pendingCount ? `\n\n${assignmentData.pendingCount} invitation(s) sent to new employees.` : ''}`)
      
      // Refresh programmes to show updated enrollment counts
      await fetchProgrammes()
      
      return Promise.resolve()
    } catch (error) {
      console.error('Assignment error:', error)
      alert('Error assigning course: ' + error.message)
      return Promise.reject(error)
    }
  }

  const handleProgrammeClick = (prog) => {
    navigate(`/institutional/programmes/${prog.id}`)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Programmes & Cohorts"
          subtitle="Manage enrolled programmes, cohorts, assignments, and learner progress across departments."
          actions={
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/institutional/programmes/browse')}
              >
                <BookOpen size={18} />
                Browse Catalogue
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/institutional/assign-course')}
              >
                <BookOpen size={18} />
                Assign Programme
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateCohortModal(true)}
              >
                <Plus size={18} />
                Create Cohort
              </button>
            </div>
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
              All Programmes ({stats.total})
            </button>
            <button 
              className={`tab ${activeTab === 'Mandatory Training' ? 'active' : ''}`}
              onClick={() => setActiveTab('Mandatory Training')}
            >
              Mandatory Training ({stats.mandatoryCount})
            </button>
            <button 
              className={`tab ${activeTab === 'Electives' ? 'active' : ''}`}
              onClick={() => setActiveTab('Electives')}
            >
              Electives ({stats.electiveCount})
            </button>
            <button 
              className={`tab ${activeTab === 'Department Pathways' ? 'active' : ''}`}
              onClick={() => setActiveTab('Department Pathways')}
            >
              Department Pathways ({stats.pathwayCount})
            </button>
            <button 
              className={`tab ${activeTab === 'Archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('Archived')}
            >
              Archived ({stats.archivedCount})
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
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0B4F9F', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                              <p style={{ color: '#666' }}>Loading programmes...</p>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '48px' }}>⚠️</div>
                              <h3 style={{ margin: 0, color: '#666' }}>Error Loading Programmes</h3>
                              <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>{error}</p>
                              <button 
                                className="btn btn-primary"
                                onClick={() => {
                                  setError(null)
                                  fetchProgrammes()
                                }}
                              >
                                Try Again
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : programmes.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                              <BookOpen size={48} style={{ color: '#ccc' }} />
                              <h3 style={{ margin: 0, color: '#666' }}>No Programmes Available</h3>
                              <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                                There are no published courses yet. Courses created by trainers will appear here.
                              </p>
                              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                <button 
                                  className="btn btn-secondary"
                                  onClick={() => window.open('https://shorainstitute.com/courses', '_blank')}
                                >
                                  <BookOpen size={18} />
                                  Browse Available Courses
                                </button>
                              </div>
                            </div>
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
    </div>
  )
}

export default Programmes
