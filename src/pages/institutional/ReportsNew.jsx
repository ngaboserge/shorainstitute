import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { 
  Download, Calendar, TrendingUp, Users, BookOpen, 
  Award, BarChart3, PieChart as PieChartIcon, FileText, Settings
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './Reports.css'

const ReportsNew = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all')
  
  const [stats, setStats] = useState({
    totalLearners: 0,
    activeLearners: 0,
    completionRate: 0,
    avgProgress: 0,
    certificatesIssued: 0,
    avgAssessmentScore: 0
  })

  const [scheduledReports, setScheduledReports] = useState([])

  useEffect(() => {
    if (institutionId) {
      fetchAnalyticsData()
      if (activeTab === 'scheduled') {
        fetchScheduledReports()
      }
    }
  }, [institutionId, dateRange, activeTab])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch learners
      const { data: learnersData } = await supabase
        .from('institution_learners')
        .select('id, status')
        .eq('institution_id', institutionId)

      const learners = learnersData || []
      const activeLearners = learners.filter(l => l.status === 'active').length

      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from('learner_institutional_enrollments')
        .select('progress_percentage, status')
        .eq('institution_id', institutionId)

      const enrollments = enrollmentsData || []
      const completed = enrollments.filter(e => e.progress_percentage >= 100).length
      const completionRate = enrollments.length > 0 
        ? Math.round((completed / enrollments.length) * 100)
        : 0

      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
        : 0

      // Fetch certificates
      const { count: certsCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })

      // Fetch quiz scores
      const { data: quizData } = await supabase
        .from('quiz_submissions')
        .select('score, total_questions')

      const avgScore = quizData && quizData.length > 0
        ? Math.round(quizData.reduce((sum, q) => sum + ((q.score / q.total_questions) * 100), 0) / quizData.length)
        : 0

      setStats({
        totalLearners: learners.length,
        activeLearners,
        completionRate,
        avgProgress,
        certificatesIssued: certsCount || 0,
        avgAssessmentScore: avgScore
      })

    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduledReports = async () => {
    try {
      const { data, error } = await supabase
        .from('institution_report_schedules')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setScheduledReports(data || [])
    } catch (err) {
      console.error('Error fetching scheduled reports:', err)
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this report schedule?')) return

    try {
      const { error } = await supabase
        .from('institution_report_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      alert('Report schedule deleted successfully')
      fetchScheduledReports()
    } catch (err) {
      console.error('Error deleting schedule:', err)
      alert('Failed to delete schedule')
    }
  }

  const handleExportData = async () => {
    try {
      // Fetch all necessary data
      const { data: learnersData } = await supabase
        .from('institution_learners')
        .select('*')
        .eq('institution_id', institutionId)

      const { data: enrollmentsData } = await supabase
        .from('learner_institutional_enrollments')
        .select('*')
        .eq('institution_id', institutionId)

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"
      
      // Add learners section
      csvContent += "LEARNERS REPORT\n"
      csvContent += "Name,Email,Department,Employee ID,Status,Enrolled Date\n"
      
      learnersData?.forEach(learner => {
        csvContent += `${learner.full_name || ''},${learner.email || ''},${learner.department || ''},${learner.employee_id || ''},${learner.status},${new Date(learner.created_at).toLocaleDateString()}\n`
      })

      csvContent += "\n\nENROLLMENTS REPORT\n"
      csvContent += "Learner ID,Course ID,Progress,Status,Enrolled Date,Completed Date\n"
      
      enrollmentsData?.forEach(enrollment => {
        csvContent += `${enrollment.learner_id},${enrollment.course_id},${enrollment.progress_percentage}%,${enrollment.status},${new Date(enrollment.enrolled_at).toLocaleDateString()},${enrollment.completed_at ? new Date(enrollment.completed_at).toLocaleDateString() : 'N/A'}\n`
      })

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `institutional_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert('CSV report exported successfully!')
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Failed to export data')
    }
  }

  const handleExportPDF = async () => {
    try {
      // Fetch institution info
      const { data: institutionData } = await supabase
        .from('institutions')
        .select('name')
        .eq('id', institutionId)
        .single()

      // Fetch data
      const { data: learnersData } = await supabase
        .from('institution_learners')
        .select('*')
        .eq('institution_id', institutionId)

      const { data: enrollmentsData } = await supabase
        .from('learner_institutional_enrollments')
        .select('*')
        .eq('institution_id', institutionId)

      // Create PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Title
      doc.setFontSize(20)
      doc.setTextColor(11, 79, 159) // #0B4F9F
      doc.text('Learning Analytics Report', pageWidth / 2, 20, { align: 'center' })
      
      // Institution name and date
      doc.setFontSize(12)
      doc.setTextColor(102, 102, 102)
      doc.text(institutionData?.name || 'Institution', pageWidth / 2, 28, { align: 'center' })
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 34, { align: 'center' })
      
      // Key Metrics Section
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Key Metrics', 14, 45)
      
      doc.setFontSize(10)
      const metricsY = 52
      doc.text(`Total Learners: ${stats.totalLearners}`, 14, metricsY)
      doc.text(`Active Learners: ${stats.activeLearners}`, 14, metricsY + 6)
      doc.text(`Average Progress: ${stats.avgProgress}%`, 14, metricsY + 12)
      doc.text(`Completion Rate: ${stats.completionRate}%`, 14, metricsY + 18)
      doc.text(`Certificates Issued: ${stats.certificatesIssued}`, 14, metricsY + 24)
      doc.text(`Avg Assessment Score: ${stats.avgAssessmentScore}%`, 14, metricsY + 30)

      // Learners Table
      doc.setFontSize(14)
      doc.text('Learner Details', 14, 95)
      
      const learnersTableData = learnersData?.slice(0, 20).map(learner => [
        learner.full_name || 'N/A',
        learner.email || 'N/A',
        learner.department || 'N/A',
        learner.status || 'N/A',
        new Date(learner.created_at).toLocaleDateString()
      ]) || []

      autoTable(doc, {
        startY: 100,
        head: [['Name', 'Email', 'Department', 'Status', 'Enrolled Date']],
        body: learnersTableData,
        theme: 'grid',
        headStyles: { fillColor: [11, 79, 159] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      })

      // Enrollments Summary (New Page)
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Enrollment Summary', 14, 20)
      
      const enrollmentsTableData = enrollmentsData?.slice(0, 30).map(enrollment => [
        enrollment.learner_id.substring(0, 8) + '...',
        enrollment.course_id.substring(0, 8) + '...',
        `${enrollment.progress_percentage}%`,
        enrollment.status,
        new Date(enrollment.enrolled_at).toLocaleDateString()
      ]) || []

      autoTable(doc, {
        startY: 25,
        head: [['Learner ID', 'Course ID', 'Progress', 'Status', 'Enrolled Date']],
        body: enrollmentsTableData,
        theme: 'grid',
        headStyles: { fillColor: [11, 79, 159] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      })

      // Footer on last page
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} of ${pageCount} | SHORA Institute - Institutional Portal`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        )
      }

      // Save PDF
      doc.save(`institutional_report_${new Date().toISOString().split('T')[0]}.pdf`)
      
      alert('PDF report generated successfully!')
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF report')
    }
  }

  const departmentData = [
    { name: 'Finance', completed: 85, inProgress: 12, notStarted: 3 },
    { name: 'IT', completed: 72, inProgress: 20, notStarted: 8 },
    { name: 'HR', completed: 90, inProgress: 8, notStarted: 2 },
    { name: 'Operations', completed: 65, inProgress: 25, notStarted: 10 }
  ]

  const engagementData = [
    { name: 'Highly Active', value: 45, color: '#4CAF50' },
    { name: 'Active', value: 30, color: '#2196F3' },
    { name: 'Moderate', value: 15, color: '#FF9800' },
    { name: 'Inactive', value: 10, color: '#F44336' }
  ]

  const progressTrend = [
    { month: 'Jan', progress: 45 },
    { month: 'Feb', progress: 52 },
    { month: 'Mar', progress: 58 },
    { month: 'Apr', progress: 65 },
    { month: 'May', progress: 72 }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title="Reports & Analytics"
          subtitle="Track learning progress, generate reports, and schedule automated updates."
          actions={
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="date-range-select"
              >
                <option value="all">All Time</option>
                <option value="current">Current Month</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
              </select>
              <button 
                className="btn btn-secondary"
                onClick={handleExportData}
              >
                <Download size={18} />
                Export Data
              </button>
            </div>
          }
        />

        <div className="content-wrapper">
          {/* Tabs */}
          <div className="reports-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} />
              Analytics Dashboard
            </button>
            <button 
              className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
              onClick={() => setActiveTab('scheduled')}
            >
              <Calendar size={18} />
              Scheduled Reports ({scheduledReports.length})
            </button>
          </div>

          {/* Overview Tab - Analytics Dashboard */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Active Learners</div>
                    <div className="stat-value">{loading ? '...' : stats.activeLearners}</div>
                    <div className="stat-meta">of {stats.totalLearners} total</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Average Progress</div>
                    <div className="stat-value">{loading ? '...' : `${stats.avgProgress}%`}</div>
                    <div className="stat-meta">across all courses</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Completion Rate</div>
                    <div className="stat-value">{loading ? '...' : `${stats.completionRate}%`}</div>
                    <div className="stat-meta">courses completed</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <Award size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Certificates</div>
                    <div className="stat-value">{loading ? '...' : stats.certificatesIssued}</div>
                    <div className="stat-meta">issued this period</div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                {/* Department Performance */}
                <div className="card chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Department Performance</h3>
                    <p className="card-subtitle">Progress breakdown by department</p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" />
                        <Bar dataKey="inProgress" stackId="a" fill="#2196F3" name="In Progress" />
                        <Bar dataKey="notStarted" stackId="a" fill="#E0E0E0" name="Not Started" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Learner Engagement */}
                <div className="card chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Learner Engagement</h3>
                    <p className="card-subtitle">Activity levels distribution</p>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Progress Trend */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Progress Trend</h3>
                  <p className="card-subtitle">Average completion over time</p>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={progressTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="progress" stroke="#2196F3" strokeWidth={2} name="Avg Progress %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/institutional/reports/schedule')}
                  >
                    <Calendar size={18} />
                    Schedule Reports
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleExportPDF}
                  >
                    <Download size={18} />
                    Download PDF Report
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleExportData}
                  >
                    <FileText size={18} />
                    Export CSV Data
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'scheduled' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>Scheduled Reports</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>Manage automated report schedules</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/institutional/reports/schedule')}
                >
                  <Calendar size={18} />
                  Create New Schedule
                </button>
              </div>

              {scheduledReports.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h3>No Scheduled Reports</h3>
                  <p>Create your first automated report schedule to receive regular updates.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/institutional/reports/schedule')}
                    style={{ marginTop: '16px' }}
                  >
                    <Calendar size={18} />
                    Create Schedule
                  </button>
                </div>
              ) : (
                <div className="schedules-list">
                  {scheduledReports.map(schedule => (
                    <div key={schedule.id} className="schedule-card">
                      <div className="schedule-header">
                        <div>
                          <h4>{schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Report</h4>
                          <p className="schedule-meta">
                            {schedule.report_period} • {schedule.delivery_day} • {schedule.timezone}
                          </p>
                        </div>
                        <div className="schedule-actions">
                          <span className={`status-badge ${schedule.status}`}>
                            {schedule.status}
                          </span>
                          <button 
                            className="btn-icon"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="schedule-details">
                        <div className="schedule-detail-item">
                          <Users size={14} />
                          <span>{schedule.recipients?.length || 0} recipients</span>
                        </div>
                        <div className="schedule-detail-item">
                          <FileText size={14} />
                          <span>{schedule.report_contents?.length || 0} sections</span>
                        </div>
                        <div className="schedule-detail-item">
                          <Download size={14} />
                          <span>{schedule.delivery_formats?.length || 0} formats</span>
                        </div>
                      </div>
                      {schedule.next_scheduled_at && (
                        <div className="schedule-next">
                          Next delivery: {new Date(schedule.next_scheduled_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsNew
