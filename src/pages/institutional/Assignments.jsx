import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Mail, CheckCircle, Clock, XCircle, Users, BookOpen, Loader, Plus, Copy, ExternalLink, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Programmes.css'

const Assignments = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'active'
  const [assignments, setAssignments] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    invited: 0
  })

  useEffect(() => {
    if (institutionId) {
      fetchAssignments()
    }
  }, [institutionId, activeTab])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Fetching assignments for institution:', institutionId)

      // Fetch pending assignments (including those marked 'assigned' after acceptance)
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_course_assignments')
        .select(`
          *,
          courses:course_id (id, title, price, instructor_name),
          learner_invitations:invitation_id (status, invited_at, accepted_at)
        `)
        .eq('institution_id', institutionId)
        // Show ALL statuses to see full history
        .order('created_at', { ascending: false })

      console.log('📋 Pending assignments query result:', { pendingData, pendingError })

      if (pendingError && pendingError.code !== 'PGRST116') {
        console.error('❌ Pending error:', pendingError)
      }

      // Fetch active enrollments (without JOIN - work around missing foreign keys)
      const { data: activeEnrollments, error: activeError } = await supabase
        .from('learner_institutional_enrollments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('enrolled_at', { ascending: false })
        .limit(100)

      console.log('👥 Active enrollments query result:', { activeEnrollments, activeError })

      if (activeError && activeError.code !== 'PGRST116') {
        console.error('❌ Active error:', activeError)
      }

      // Enrich enrollments with course and learner details
      let activeWithEmails = []
      if (activeEnrollments && activeEnrollments.length > 0) {
        // Get all unique learner IDs
        const learnerIds = [...new Set(activeEnrollments.map(e => e.learner_id))]
        
        // Fetch all learners in one query
        const { data: learnersData } = await supabase
          .from('institution_learners')
          .select('id, user_id, invitation_id')
          .in('id', learnerIds)

        // Create a map of learner_id -> learner data
        const learnerMap = {}
        if (learnersData) {
          learnersData.forEach(l => {
            learnerMap[l.id] = l
          })
        }

        // Get all unique course IDs
        const courseIds = [...new Set(activeEnrollments.map(e => e.course_id))]
        
        // Fetch all courses in one query
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, price, instructor_name')
          .in('id', courseIds)

        // Create a map of course_id -> course
        const courseMap = {}
        if (coursesData) {
          coursesData.forEach(c => {
            courseMap[c.id] = c
          })
        }

        // Get invitation IDs to fetch email/name info
        const invitationIds = learnersData
          ?.filter(l => l.invitation_id)
          .map(l => l.invitation_id) || []

        // Fetch invitations to get email and name
        let invitationMap = {}
        if (invitationIds.length > 0) {
          const { data: invitationsData } = await supabase
            .from('learner_invitations')
            .select('id, email, employee_name')
            .in('id', invitationIds)

          if (invitationsData) {
            invitationsData.forEach(inv => {
              invitationMap[inv.id] = inv
            })
          }
        }

        // Get unique user IDs that don't have invitations
        const enrollmentIds = activeEnrollments?.map(e => e.id) || []
        
        // Query pending_course_assignments to find email/name info
        let pendingAssignmentMap = {}
        if (enrollmentIds.length > 0) {
          const { data: relatedPendingData } = await supabase
            .from('pending_course_assignments')
            .select('assigned_enrollment_id, employee_email, employee_name')
            .in('assigned_enrollment_id', enrollmentIds)

          if (relatedPendingData) {
            relatedPendingData.forEach(p => {
              pendingAssignmentMap[p.assigned_enrollment_id] = {
                email: p.employee_email,
                name: p.employee_name
              }
            })
          }
        }

        // Map enrollments to assignments
        activeWithEmails = activeEnrollments.map(enrollment => {
          const course = courseMap[enrollment.course_id] || {}
          const learner = learnerMap[enrollment.learner_id]
          const invitation = learner?.invitation_id ? invitationMap[learner.invitation_id] : null
          const pendingInfo = pendingAssignmentMap[enrollment.id]
          
          // Priority: invitation data > pending assignment data > fallback
          const email = invitation?.email || pendingInfo?.email || `learner-${learner?.id?.substring(0, 8)}`
          const name = invitation?.employee_name || pendingInfo?.name || email
          
          return {
            ...enrollment,
            courses: course,
            employee_email: email,
            employee_name: name,
            user_id: learner?.user_id
          }
        })
      }

      // Combine and format ALL assignments (pending + active)
      // Strategy: Show pending assignments, and mark them as 'active' if enrollment exists
      const allAssignments = []
      
      // First, add all pending assignments
      if (pendingData && pendingData.length > 0) {
        for (const pending of pendingData) {
          // Check if this assignment has been converted to enrollment
          const matchingEnrollment = activeWithEmails.find(
            e => e.id === pending.assigned_enrollment_id
          )

          allAssignments.push({
            id: pending.id,
            enrollmentId: matchingEnrollment?.id,
            type: matchingEnrollment ? 'active' : 'pending',
            employeeEmail: pending.employee_email,
            employeeName: pending.employee_name || pending.employee_email,
            courseTitle: pending.courses?.title || 'Unknown Course',
            coursePrice: pending.courses?.price || 0,
            instructor: pending.courses?.instructor_name || 'Unknown',
            status: pending.status,
            invitationStatus: pending.learner_invitations?.status || 'not_sent',
            invitationId: pending.invitation_id,
            assignedAt: pending.created_at,
            progress: matchingEnrollment?.progress_percentage || 0,
            startDate: pending.start_date,
            dueDate: pending.due_date,
            lastAccessed: matchingEnrollment?.last_accessed_at
          })
        }
      }

      // Add any active enrollments that don't have a pending assignment (shouldn't happen, but just in case)
      if (activeWithEmails && activeWithEmails.length > 0) {
        for (const active of activeWithEmails) {
          const alreadyIncluded = allAssignments.find(
            a => a.enrollmentId === active.id
          )
          
          if (!alreadyIncluded) {
            allAssignments.push({
              id: active.id,
              enrollmentId: active.id,
              type: 'active',
              employeeEmail: active.employee_email,
              employeeName: active.employee_name,
              courseTitle: active.courses?.title || 'Unknown Course',
              coursePrice: active.courses?.price || 0,
              instructor: active.courses?.instructor_name || 'Unknown',
              status: active.status,
              invitationStatus: 'accepted',
              invitationId: null,
              assignedAt: active.enrolled_at,
              progress: active.progress_percentage || 0,
              startDate: null,
              dueDate: null,
              lastAccessed: active.last_accessed_at
            })
          }
        }
      }

      // Filter based on active tab
      let filtered = allAssignments
      if (activeTab === 'pending') {
        filtered = allAssignments.filter(a => a.type === 'pending')
      } else if (activeTab === 'active') {
        filtered = allAssignments.filter(a => a.type === 'active')
      }

      setAssignments(filtered)

      // Calculate stats
      setStats({
        total: allAssignments.length,
        pending: allAssignments.filter(a => a.type === 'pending').length,
        active: allAssignments.filter(a => a.type === 'active').length,
        invited: allAssignments.filter(a => a.invitationStatus === 'pending').length
      })

      console.log('📊 Final stats:', {
        total: allAssignments.length,
        pending: allAssignments.filter(a => a.type === 'pending').length,
        active: allAssignments.filter(a => a.type === 'active').length,
        filtered: filtered.length
      })

    } catch (err) {
      console.error('❌ Error fetching assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (assignment) => {
    if (assignment.status === 'assigned') {
      return (
        <span className="badge badge-success">
          <CheckCircle size={14} />
          Enrolled
        </span>
      )
    }
    
    if (assignment.type === 'pending') {
      return (
        <span className="badge badge-warning">
          <Clock size={14} />
          Pending Invitation
        </span>
      )
    }
    
    if (assignment.type === 'active') {
      if (assignment.progress >= 100) {
        return (
          <span className="badge badge-success">
            <CheckCircle size={14} />
            Completed
          </span>
        )
      }
      if (assignment.progress > 0) {
        return (
          <span className="badge badge-info">
            <BookOpen size={14} />
            In Progress ({assignment.progress}%)
          </span>
        )
      }
      return (
        <span className="badge badge-secondary">
          <BookOpen size={14} />
          Not Started
        </span>
      )
    }
  }

  const getInvitationLink = (invitationId) => {
    if (!invitationId) return null
    const baseUrl = window.location.origin
    return `${baseUrl}/invitation/accept?token=${invitationId}`
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="institutional" />
        <div className="main-content">
          <Header title="Course Assignments" />
          <div className="content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader size={48} className="spinner" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Course Assignments" 
          subtitle="View and manage course assignments to employees"
          actions={
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/institutional/assign-course')}
            >
              <Plus size={18} />
              Assign Course
            </button>
          }
        />

        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                <Users size={24} color="#1976D2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Assignments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFF3E0' }}>
                <Clock size={24} color="#F57C00" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending Invitations</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                <CheckCircle size={24} color="#388E3C" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active Enrollments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F3E5F5' }}>
                <Mail size={24} color="#7B1FA2" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.invited}</div>
                <div className="stat-label">Awaiting Response</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({stats.active})
            </button>
          </div>

          {/* Assignments Table */}
          <div className="card">
            {assignments.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>No Assignments Found</h3>
                <p>Start by assigning courses to your employees</p>
                <button className="btn btn-primary" onClick={() => navigate('/institutional/assign-course')}>
                  <Plus size={18} />
                  Assign Your First Course
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Course</th>
                      <th>Instructor</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Invitation Link</th>
                      <th>Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <div>
                            <strong>{assignment.employeeName}</strong>
                            <br />
                            <small style={{ color: '#666' }}>{assignment.employeeEmail}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{assignment.courseTitle}</strong>
                            <br />
                            <small style={{ color: '#666' }}>
                              {assignment.coursePrice > 0 
                                ? `${assignment.coursePrice.toLocaleString()} RWF` 
                                : 'FREE'}
                            </small>
                          </div>
                        </td>
                        <td>{assignment.instructor}</td>
                        <td>{getStatusBadge(assignment)}</td>
                        <td>
                          {assignment.type === 'active' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, background: '#f5f5f5', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    background: assignment.progress >= 100 ? '#4CAF50' : '#2196F3',
                                    height: '100%', 
                                    width: `${assignment.progress}%`,
                                    transition: 'width 0.3s'
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', color: '#666', minWidth: '35px' }}>
                                {assignment.progress}%
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>—</span>
                          )}
                        </td>
                        <td>
                          {assignment.type === 'pending' && assignment.invitationId ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => copyToClipboard(getInvitationLink(assignment.invitationId), `link-${assignment.id}`)}
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                title="Copy invitation link to send to employee"
                              >
                                {copiedId === `link-${assignment.id}` ? (
                                  <>
                                    <Check size={14} />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    Copy Link
                                  </>
                                )}
                              </button>
                              <a
                                href={getInvitationLink(assignment.invitationId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                title="Preview invitation page"
                              >
                                <ExternalLink size={14} />
                                Preview
                              </a>
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                              {assignment.type === 'active' ? 'Invitation Accepted' : 'N/A'}
                            </span>
                          )}
                        </td>
                        <td>
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assignments
