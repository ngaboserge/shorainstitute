import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Mail, Calendar, TrendingUp, Download, Search, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import './CourseStudents.css'

const CourseStudents = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed, not-started
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    notStarted: 0,
    avgProgress: 0
  })

  useEffect(() => {
    loadData()
  }, [courseId])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filterStatus, students])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('instructor_id', user.id) // Ensure trainer owns the course
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load enrolled students
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .neq('payment_status', 'pending') // Only show approved enrollments
        .order('enrolled_at', { ascending: false })

      if (enrollError) throw enrollError

      const studentsData = enrollmentsData?.map(e => ({
        id: e.id,
        userId: e.user_id,
        name: e.users?.full_name || 'Unknown',
        email: e.users?.email || '',
        avatar: e.users?.avatar_url || null,
        progress: e.progress_percentage || 0,
        enrolledAt: e.enrolled_at,
        lastAccessedAt: e.last_accessed_at,
        paymentStatus: e.payment_status,
        completedAt: e.completed_at
      })) || []

      setStudents(studentsData)

      // Calculate stats
      const total = studentsData.length
      const completed = studentsData.filter(s => s.progress === 100).length
      const active = studentsData.filter(s => s.progress > 0 && s.progress < 100).length
      const notStarted = studentsData.filter(s => s.progress === 0).length
      const avgProgress = total > 0
        ? Math.round(studentsData.reduce((sum, s) => sum + s.progress, 0) / total)
        : 0

      setStats({
        total,
        active,
        completed,
        notStarted,
        avgProgress
      })

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load students data')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...students]

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(s => s.progress === 100)
      } else if (filterStatus === 'active') {
        filtered = filtered.filter(s => s.progress > 0 && s.progress < 100)
      } else if (filterStatus === 'not-started') {
        filtered = filtered.filter(s => s.progress === 0)
      }
    }

    setFilteredStudents(filtered)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressColor = (progress) => {
    if (progress === 0) return '#9ca3af'
    if (progress < 30) return '#ef4444'
    if (progress < 70) return '#f59e0b'
    if (progress < 100) return '#3b82f6'
    return '#10b981'
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Progress (%)', 'Enrolled Date', 'Last Accessed', 'Status']
    const rows = filteredStudents.map(s => [
      s.name,
      s.email,
      s.progress,
      formatDate(s.enrolledAt),
      formatDate(s.lastAccessedAt),
      s.progress === 100 ? 'Completed' : s.progress > 0 ? 'Active' : 'Not Started'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${course?.title || 'course'}-students-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header
          title={course?.title || 'Course Students'}
          subtitle="View and manage enrolled learners"
          actions={
            <button
              className="btn btn-outline"
              onClick={() => navigate('/trainer/courses')}
            >
              <ArrowLeft size={18} />
              <span>Back to Courses</span>
            </button>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                <Users size={24} color="#0B4F9F" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Students</p>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Completed</p>
                <p className="stat-value">{stats.completed}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active</p>
                <p className="stat-value">{stats.active}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f3f4f6' }}>
                <Users size={24} color="#6b7280" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Not Started</p>
                <p className="stat-value">{stats.notStarted}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <TrendingUp size={24} color="#f59e0b" />
              </div>
              <div className="stat-content">
                <p className="stat-label">Avg Progress</p>
                <p className="stat-value">{stats.avgProgress}%</p>
              </div>
            </div>
          </div>

          {/* Filters and Export */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 40px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Students ({stats.total})</option>
                  <option value="completed">Completed ({stats.completed})</option>
                  <option value="active">Active ({stats.active})</option>
                  <option value="not-started">Not Started ({stats.notStarted})</option>
                </select>
              </div>

              <button
                className="btn btn-outline"
                onClick={exportToCSV}
                disabled={filteredStudents.length === 0}
              >
                <Download size={18} />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: 600 }}>
                  {searchTerm || filterStatus !== 'all' ? 'No students match your filters' : 'No students enrolled yet'}
                </p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Students will appear here once they enroll in your course'}
                </p>
              </div>
            ) : (
              <div className="students-table">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Student</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Progress</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Enrolled</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Last Accessed</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: student.avatar ? 'transparent' : '#e3f2fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0
                            }}>
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#0B4F9F' }}>
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{student.name}</div>
                              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Mail size={12} />
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, maxWidth: '120px' }}>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#f3f4f6',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${student.progress}%`,
                                  height: '100%',
                                  background: getProgressColor(student.progress),
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: getProgressColor(student.progress), minWidth: '45px' }}>
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(student.enrolledAt)}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(student.lastAccessedAt)}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: student.progress === 100 ? '#dcfce7' : student.progress > 0 ? '#dbeafe' : '#f3f4f6',
                            color: student.progress === 100 ? '#065f46' : student.progress > 0 ? '#1e40af' : '#6b7280'
                          }}>
                            {student.progress === 100 ? 'Completed' : student.progress > 0 ? 'Active' : 'Not Started'}
                          </span>
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

export default CourseStudents
