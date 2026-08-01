import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Download, FileDown, Calendar, FileText } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ReportBuilderModal from '../../components/modals/ReportBuilderModal'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Reports.css'

const Reports = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [showReportModal, setShowReportModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLearners: 0,
    completionRate: 0,
    liveAttendance: 0,
    certificatesIssued: 0,
    avgAssessmentScore: 0,
    repeatAttendance: 0
  })
  
  // Date range state
  const [dateRange, setDateRange] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  // Get current date range for display
  const getDateRangeDisplay = () => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return `Custom: ${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
    }
    const now = new Date()
    const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    return `Current Month: ${currentMonth}`
  }

  useEffect(() => {
    if (institutionId) {
      fetchReportsData()
    }
  }, [institutionId, dateRange, customStartDate, customEndDate])

  const fetchReportsData = async () => {
    try {
      setLoading(true)

      // Calculate date filter range
      let startDate = null
      let endDate = null
      
      if (dateRange === 'current') {
        const now = new Date()
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      } else if (dateRange === 'last30') {
        endDate = new Date().toISOString()
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      } else if (dateRange === 'last90') {
        endDate = new Date().toISOString()
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate).toISOString()
        endDate = new Date(customEndDate).toISOString()
      }

      // Fetch total learners
      let learnersQuery = supabase
        .from('institution_learners')
        .select('id, department_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
      
      if (startDate && endDate) {
        learnersQuery = learnersQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      }

      const { data: learnersData, error: learnersError } = await learnersQuery

      if (learnersError && learnersError.code !== 'PGRST116') {
        console.error('Error fetching learners:', learnersError)
      }

      const learnersCount = learnersData?.length || 0

      // Fetch enrollments for this institution
      let enrollmentsQuery = supabase
        .from('learner_institutional_enrollments')
        .select('learner_id, course_id, progress_percentage, completed_at, enrolled_at')
        .eq('institution_id', institutionId)

      if (startDate && endDate) {
        enrollmentsQuery = enrollmentsQuery
          .gte('enrolled_at', startDate)
          .lte('enrolled_at', endDate)
      }

      const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery

      if (enrollmentsError && enrollmentsError.code !== 'PGRST116') {
        
      }

      const enrollments = enrollmentsData || []

      // Calculate completion rate
      const completed = enrollments.filter(e => e.progress_percentage >= 100).length
      const completionRate = enrollments.length > 0 
        ? Math.round((completed / enrollments.length) * 100)
        : 0

      // Fetch certificates issued
      const { count: certsCount, error: certsError } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })

      if (certsError && certsError.code !== 'PGRST116') {
        
      }

      // Fetch seminar registrations for live attendance
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('seminar_registrations')
        .select('id, status')

      if (registrationsError && registrationsError.code !== 'PGRST116') {
        
      }

      const registrations = registrationsData || []
      const attendedCount = registrations.filter(r => r.status === 'attended').length
      const liveAttendance = registrations.length > 0 
        ? Math.round((attendedCount / registrations.length) * 100)
        : 0

      // Calculate repeat attendance (learners who attended multiple seminars)
      const learnerSeminarCount = {}
      registrations.filter(r => r.status === 'attended').forEach(r => {
        // Note: seminar_registrations doesn't have learner_id, so we can't calculate this accurately
        // For now, we'll use a placeholder
      })
      const repeatAttendance = 0

      // Calculate average assessment score
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_submissions')
        .select('score, total_questions')

      if (quizError && quizError.code !== 'PGRST116') {
        
      }

      const quizSubmissions = quizData || []
      let avgAssessmentScore = 0
      if (quizSubmissions.length > 0) {
        const totalScore = quizSubmissions.reduce((sum, quiz) => {
          const percentage = quiz.total_questions > 0 ? (quiz.score / quiz.total_questions) * 100 : 0
          return sum + percentage
        }, 0)
        avgAssessmentScore = Math.round(totalScore / quizSubmissions.length)
      }

      // Calculate trend data (last 6 months completion rate)
      const monthlyData = {}
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
        monthlyData[monthKey] = { enrolled: 0, completed: 0, seminarsAttended: 0, seminarsTotal: 0 }
      }

      enrollments.forEach(e => {
        const enrollDate = new Date(e.enrolled_at)
        const monthKey = enrollDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].enrolled++
          if (e.progress_percentage >= 100) {
            monthlyData[monthKey].completed++
          }
        }
      })

      const trend = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        value: data.enrolled > 0 ? Math.round((data.completed / data.enrolled) * 100) : 0
      }))
      setTrendData(trend)

      // Certificate issuance over time
      const certTrend = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        value: data.completed
      }))
      setCertificateData(certTrend)

      // Fetch seminars for attendance tracking
      const { data: seminarsData, error: seminarsError } = await supabase
        .from('seminars')
        .select('id, date')

      if (seminarsError && seminarsError.code !== 'PGRST116') {
        
      }

      const seminars = seminarsData || []

      // Count registrations by month for attendance trend
      seminars.forEach(seminar => {
        const seminarDate = new Date(seminar.date)
        const monthKey = seminarDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })
        
        if (monthlyData[monthKey]) {
          const seminarRegs = registrations.filter(r => {
            // We need to match registrations to seminars by checking registration dates
            // Since we don't have seminar_id in registrations, we'll use a simple count
            return true
          })
          monthlyData[monthKey].seminarsTotal++
        }
      })

      // Calculate attendance percentage by month
      const attendanceTrend = Object.entries(monthlyData).map(([month, data]) => {
        // Use a simple calculation based on overall attendance rate
        return {
          month,
          value: liveAttendance
        }
      })
      setAttendanceData(attendanceTrend)

      // Progress by department
      if (learnersData && learnersData.length > 0) {
        const deptMap = {}
        
        learnersData.forEach(learner => {
          const dept = learner.department_id || 'unassigned'
          if (!deptMap[dept]) {
            deptMap[dept] = []
          }
          deptMap[dept].push(learner.id)
        })

        const deptProgress = await Promise.all(
          Object.entries(deptMap).slice(0, 5).map(async ([deptId, learnerIds]) => {
            const { data: deptEnrollments } = await supabase
              .from('learner_institutional_enrollments')
              .select('progress_percentage')
              .in('learner_id', learnerIds)
            
            const progresses = deptEnrollments || []
            const total = learnerIds.length
            const completed = progresses.filter(e => e.progress_percentage >= 100).length
            const inProgress = progresses.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length
            const notStarted = total - (completed + inProgress)

            // Get department name if it's a UUID, otherwise use "Unassigned"
            let deptName = 'Unassigned'
            if (deptId !== 'unassigned') {
              const { data: deptData } = await supabase
                .from('institution_departments')
                .select('name')
                .eq('id', deptId)
                .single()
              
              if (deptData) {
                deptName = deptData.name
              }
            }

            return {
              name: deptName,
              completed: Math.round((completed / total) * 100) || 0,
              inProgress: Math.round((inProgress / total) * 100) || 0,
              notStarted: Math.round((notStarted / total) * 100) || 0
            }
          })
        )

        setProgressData(deptProgress)

        // Top departments
        const topDepts = deptProgress.map((dept, idx) => ({
          rank: idx + 1,
          name: dept.name,
          completion: dept.completed,
          attendance: dept.completed, // Using same as completion for now
          avgScore: dept.completed // Using completion as proxy for score
        }))
        setTopDepartments(topDepts)
      }

      // Engagement data (top courses)
      if (enrollments.length > 0) {
        const courseEnrollments = {}
        enrollments.forEach(e => {
          courseEnrollments[e.course_id] = (courseEnrollments[e.course_id] || 0) + 1
        })

        const topCourseIds = Object.entries(courseEnrollments)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([courseId]) => courseId)

        if (topCourseIds.length > 0) {
          const { data: topCoursesData } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', topCourseIds)

          const colors = ['#0B4F9F', '#1976D2', '#42A5F5', '#64B5F6', '#90CAF9']
          const engagement = topCoursesData?.map((course, idx) => {
            const count = courseEnrollments[course.id]
            const percentage = Math.round((count / enrollments.length) * 100)
            return {
              name: course.title,
              value: count,
              percentage,
              color: colors[idx]
            }
          }) || []

          setEngagementData(engagement)
        }
      }

      setStats({
        totalLearners: learnersCount,
        completionRate,
        liveAttendance,
        certificatesIssued: certsCount || 0,
        avgAssessmentScore,
        repeatAttendance
      })

    } catch (error) {
      console.error('Error fetching reports data:', error)
      setStats({
        totalLearners: 0,
        completionRate: 0,
        liveAttendance: 0,
        certificatesIssued: 0,
        avgAssessmentScore: 0,
        repeatAttendance: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (reportConfig) => {
    
    return Promise.resolve()
  }
  const [trendData, setTrendData] = useState([])
  const [certificateData, setCertificateData] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [progressData, setProgressData] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [topDepartments, setTopDepartments] = useState([])

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Reports & Analytics"
          subtitle="Institutional admin views, performance and exports learning impact reports."
          actions={
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/institutional/reports/schedule')}
              >
                <Calendar size={18} />
                Schedule Reports
              </button>
              <button className="btn btn-secondary">
                <Download size={18} />
                Download PDF Report
              </button>
              <button className="btn btn-secondary">
                <FileDown size={18} />
                Export CSV
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowReportModal(true)}
              >
                <FileText size={18} />
                Generate Custom Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Filters Bar */}
          <div className="reports-filters">
            <select 
              className="reports-filter-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="current">Current Month</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {dateRange === 'custom' && (
              <>
                <input 
                  type="date" 
                  className="reports-filter-select"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <input 
                  type="date" 
                  className="reports-filter-select"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </>
            )}
            
            <select className="reports-filter-select">
              <option>Department: All Departments</option>
              <option>Finance & Risk</option>
              <option>Operations</option>
            </select>
            <select className="reports-filter-select">
              <option>Programme: All Programmes</option>
            </select>
            <button 
              className="btn-reset-filters"
              onClick={() => {
                setDateRange('all')
                setCustomStartDate('')
                setCustomEndDate('')
              }}
            >
              🔄 Reset Filters
            </button>
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
                <div className="metric-value-reports">{loading ? '...' : stats.totalLearners.toLocaleString()}</div>
                <div className="metric-label-reports">Total Learners</div>
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
                <div className="metric-value-reports">{loading ? '...' : `${stats.completionRate}%`}</div>
                <div className="metric-label-reports">Completion Rate</div>
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
                <div className="metric-value-reports">{loading ? '...' : `${stats.liveAttendance}%`}</div>
                <div className="metric-label-reports">Live Attendance</div>
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
                <div className="metric-value-reports">{loading ? '...' : stats.certificatesIssued.toLocaleString()}</div>
                <div className="metric-label-reports">Certificates Issued</div>
              </div>
            </div>

            <div className="reports-metric-card">
              <div className="metric-icon-reports teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="metric-content-reports">
                <div className="metric-value-reports">{loading ? '...' : `${stats.avgAssessmentScore}%`}</div>
                <div className="metric-label-reports">Average Assessment Score</div>
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
                <div className="metric-value-reports">{loading ? '...' : `${stats.repeatAttendance}%`}</div>
                <div className="metric-label-reports">Repeat Attendance</div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          {stats.totalLearners === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Analytics Data Available</h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Reports and analytics will appear here once you have learners enrolled and activity in your institution.
              </p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/institutional/learners'}>
                Get Started
              </button>
            </div>
          ) : (
            <>
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
                      <tspan x="50%" dy="-0.5em" fontSize="28" fontWeight="700" fill="#1a1a1a">{loading ? '...' : stats.totalLearners.toLocaleString()}</tspan>
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
            </>
          )}
        </div>
      </div>

      {/* Report Builder Modal */}
      <ReportBuilderModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  )
}

export default Reports
