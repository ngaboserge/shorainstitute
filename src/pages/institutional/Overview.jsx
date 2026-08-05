import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Download, CheckCircle, Circle, ArrowRight, RefreshCw, Building2 } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useShoraInstitute } from '../../hooks/useInstitutionalAuth'
import './Overview.css'

const Overview = () => {
  const navigate = useNavigate()
  const { institutionId } = useShoraInstitute()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLearners: 0,
    avgProgress: 0,
    activeProgrammes: 0,
    upcomingSessions: 0
  })
  const [setupProgress, setSetupProgress] = useState({
    profileComplete: false,
    departmentsCreated: false,
    learnersImported: false,
    programmesSelected: false,
    cohortsCreated: false,
    reportsScheduled: false
  })
  const [userName, setUserName] = useState('Admin')

  useEffect(() => {
    if (institutionId) {
      fetchOverviewData()
      checkSetupProgress()
    }
    fetchUserName()
  }, [institutionId])

  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profileData?.full_name) {
          setUserName(profileData.full_name.split(' ')[0])
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error)
    }
  }

  const checkSetupProgress = async () => {
    try {
      // Check profile completion
      const { data: institution } = await supabase
        .from('institutions')
        .select('primary_contact_name, primary_contact_email, city')
        .eq('id', institutionId)
        .single()
      
      const profileComplete = !!(institution?.primary_contact_name && institution?.primary_contact_email && institution?.city)

      // Check departments created
      const { count: deptCount } = await supabase
        .from('institution_departments')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
      
      const departmentsCreated = (deptCount || 0) > 0

      // Check learners imported
      const { count: learnerCount } = await supabase
        .from('institution_learners')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
      
      const learnersImported = (learnerCount || 0) > 0

      // Check cohorts created
      const { count: cohortCount } = await supabase
        .from('institution_cohorts')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
      
      const cohortsCreated = (cohortCount || 0) > 0

      // Check programmes selected
      const { count: progCount } = await supabase
        .from('institution_programmes')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
      
      const programmesSelected = (progCount || 0) > 0

      // Check reports scheduled
      const { count: reportCount } = await supabase
        .from('institution_report_schedules')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'active')
      
      const reportsScheduled = (reportCount || 0) > 0

      setSetupProgress({
        profileComplete,
        departmentsCreated,
        learnersImported,
        programmesSelected,
        cohortsCreated,
        reportsScheduled
      })
    } catch (err) {
      console.error('Error checking setup progress:', err)
    }
  }

  const fetchOverviewData = async () => {
    try {
      setLoading(true)

      if (!institutionId) {
        setLoading(false)
        return
      }

      // Fetch institution learners
      const { data: learnersData, error: learnersError } = await supabase
        .rpc('get_institution_learners_full', { p_institution_id: institutionId })

      if (learnersError) {
        console.error('Error fetching learners:', learnersError)
      }
      
      const learnersCount = learnersData?.length || 0

      // Fetch active courses (created by trainers)
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

      if (coursesError) throw coursesError

      // Fetch upcoming seminars
      const now = new Date().toISOString()
      const { data: seminarsData, error: seminarsError} = await supabase
        .from('seminars')
        .select('*')
        .eq('status', 'published')
        .gte('date', now)
        .order('date', { ascending: true })
        .limit(3)

      if (seminarsError && seminarsError.code !== 'PGRST116') {
        console.error('Error fetching seminars:', seminarsError)
      }

      // Transform seminars for display
      const transformedSeminars = (seminarsData || []).map(seminar => {
        const seminarDate = new Date(seminar.date)
        const monthShort = seminarDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        const day = seminarDate.getDate()
        
        return {
          date: `${monthShort}\n${day}`,
          title: seminar.title,
          speaker: seminar.speaker_name || 'TBA',
          time: `${seminarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${seminar.start_time || 'TBA'}`,
          registered: seminar.registration_count || 0,
          action: 'View'
        }
      })
      setUpcomingSessions(transformedSeminars)

      // Fetch institutional enrollments for progress calculation
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from('learner_institutional_enrollments')
        .select('course_id, progress_percentage, status, learner_id')
        .eq('institution_id', institutionId)

      if (enrollError) {
        console.error('Error fetching enrollments:', enrollError)
      }

      const enrollments = enrollmentsData || []
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
        : 0

      setStats({
        totalLearners: learnersCount,
        avgProgress: avgProgress,
        activeProgrammes: coursesCount || 0,
        upcomingSessions: seminarsData?.length || 0
      })

      // Calculate progress by department - CREATE NEW CHART DATA with real metrics
      if (learnersData && learnersData.length > 0) {
        const deptMap = {}
        
        // Only process learners with valid department assignments
        const assignedLearners = learnersData.filter(learner => learner.department_name && learner.department_name !== 'null')
        
        assignedLearners.forEach(learner => {
          const deptName = learner.department_name
          
          if (!deptMap[deptName]) {
            deptMap[deptName] = { learnerIds: [], totalProgress: 0 }
          }
          deptMap[deptName].learnerIds.push(learner.id)
        })

        // Get progress for each department's learners
        const deptProgress = await Promise.all(
          Object.entries(deptMap).map(async ([deptName, deptData]) => {
            const { data: deptEnrollments } = await supabase
              .from('learner_institutional_enrollments')
              .select('progress_percentage')
              .in('learner_id', deptData.learnerIds)
              .eq('institution_id', institutionId)
            
            const progresses = deptEnrollments || []
            const avgDeptProgress = progresses.length > 0
              ? Math.round(progresses.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / progresses.length)
              : 0

            return {
              name: deptName,
              learners: deptData.learnerIds.length,
              progress: avgDeptProgress
            }
          })
        )

        setProgressData(deptProgress.slice(0, 5))
      }

      // Calculate engagement data (top courses by enrollment)
      if (enrollments.length > 0) {
        const courseEnrollments = {}
        enrollments.forEach(e => {
          courseEnrollments[e.course_id] = (courseEnrollments[e.course_id] || 0) + 1
        })

        // Get top 4 courses
        const topCourseIds = Object.entries(courseEnrollments)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([courseId]) => courseId)

        if (topCourseIds.length > 0) {
          const { data: topCoursesData } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', topCourseIds)

          const colors = ['#0B4F9F', '#1976D2', '#42A5F5', '#64B5F6']
          const engagement = topCoursesData?.map((course, idx) => {
            const count = courseEnrollments[course.id]
            const percentage = Math.round((count / enrollments.length) * 100)
            return {
              name: course.title,
              value: count,
              percentage: percentage,
              color: colors[idx] || '#90CAF9'
            }
          }) || []

          setEngagementData(engagement)

          // Set top programmes with completion rates
          const topProgs = await Promise.all(
            topCoursesData?.slice(0, 5).map(async (course, idx) => {
              const courseEnrollmentsData = enrollments.filter(e => e.course_id === course.id)
              const completed = courseEnrollmentsData.filter(e => e.progress_percentage >= 100).length
              const completion = courseEnrollmentsData.length > 0 
                ? Math.round((completed / courseEnrollmentsData.length) * 100)
                : 0

              return {
                name: course.title,
                learners: `${courseEnrollmentsData.length} learners`,
                completion
              }
            }) || []
          )

          setTopProgrammes(topProgs)
        }
      }

      // Fetch recent activity
      const { data: recentEnrollments, error: recentError } = await supabase
        .from('learner_institutional_enrollments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('enrolled_at', { ascending: false })
        .limit(4)

      if (recentError) {
        console.error('Error fetching recent enrollments:', recentError)
      }

      // Fetch course titles separately if we have enrollments
      let activities = []
      if (recentEnrollments && recentEnrollments.length > 0) {
        const courseIds = [...new Set(recentEnrollments.map(e => e.course_id))]
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds)
        
        const coursesMap = {}
        coursesData?.forEach(course => {
          coursesMap[course.id] = course.title
        })

        activities = recentEnrollments.map(enrollment => {
          const timeAgo = Math.floor((Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60))
          let timeText = `${timeAgo} minutes ago`
          if (timeAgo > 60) {
            const hoursAgo = Math.floor(timeAgo / 60)
            timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
          }
          if (timeAgo > 1440) {
            const daysAgo = Math.floor(timeAgo / 1440)
            timeText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
          }

          return {
            icon: enrollment.progress_percentage >= 100 ? '🎓' : enrollment.progress_percentage > 0 ? '📚' : '👤',
            text: enrollment.progress_percentage >= 100 ? 'Course completed' : enrollment.progress_percentage > 0 ? 'Programme enrolled' : 'New learner registered',
            course: coursesMap[enrollment.course_id] || 'Unknown Course',
            time: timeText
          }
        })
      }

      setRecentActivity(activities)

    } catch (error) {
      console.error('Error fetching overview data:', error)
      setStats({
        totalLearners: 0,
        avgProgress: 0,
        activeProgrammes: 0,
        upcomingSessions: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const [progressData, setProgressData] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [topProgrammes, setTopProgrammes] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOverviewData()
    await checkSetupProgress()
    setRefreshing(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="institutional" />
      <div className="main-content">
        <Header 
          title={`Welcome back, ${userName}!`}
          subtitle="Here's what's happening in your institution."
          actions={
            <>
              <button 
                className="btn btn-secondary"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ marginRight: '12px' }}
              >
                <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <select className="date-range-select">
                <option>May 1 - May 31, 2026</option>
                <option>June 1 - June 30, 2026</option>
              </select>
              <button className="btn btn-primary">
                <Download size={18} />
                Download Report
              </button>
            </>
          }
        />
        
        <div className="content-wrapper">
          {/* Setup Progress Tracker */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0B4F9F 0%, #1976D2 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600 }}>Get Started with Your Institution</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                  Complete these steps to set up your learning portal
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                {Object.values(setupProgress).filter(Boolean).length} of 6 complete
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* Step 1: Profile */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/settings/profile')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.profileComplete ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>1. Institution Profile</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Set up your institution details and contact information
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.profileComplete ? 'Complete' : 'Start setup'}
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Step 2: Departments */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/departments')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.departmentsCreated ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>2. Create Departments</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Organize your institution into academic and administrative units
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.departmentsCreated ? 'Complete' : 'Create departments'}
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Step 3: Import Learners */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/learners')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.learnersImported ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>3. Import Learners</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Add your learners individually or via CSV import
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.learnersImported ? 'Complete' : 'Add learners'}
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Step 4: Select Programmes */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/programmes/browse')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.programmesSelected ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>4. Select Programmes</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Browse and select learning programmes for your institution
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.programmesSelected ? 'Complete' : 'Browse catalogue'}
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Step 5: Create Cohorts */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/cohorts')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.cohortsCreated ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>5. Create Cohorts</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Organize learners into scheduled programme groups
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.cohortsCreated ? 'Complete' : 'Create cohort'}
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* Step 6: Schedule Reports */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => navigate('/institutional/reports/schedule')}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {setupProgress.reportsScheduled ? (
                    <CheckCircle size={24} color="#4CAF50" style={{ background: 'white', borderRadius: '50%' }} />
                  ) : (
                    <Circle size={24} />
                  )}
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>6. Schedule Reports</h4>
                </div>
                <p style={{ margin: '0 0 8px 36px', fontSize: '13px', opacity: 0.9 }}>
                  Configure automated progress reports
                </p>
                <div style={{ marginLeft: '36px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                  {setupProgress.reportsScheduled ? 'Complete' : 'Schedule reports'}
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Learners</div>
                <div className="stat-value">{loading ? '...' : stats.totalLearners.toLocaleString()}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>12% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow">
                <GraduationCap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Average Progress</div>
                <div className="stat-value">{loading ? '...' : `${stats.avgProgress}%`}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>5% vs last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Programmes</div>
                <div className="stat-value">{loading ? '...' : stats.activeProgrammes}</div>
                <div className="stat-change neutral">
                  <span>No change</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Upcoming Live Sessions</div>
                <div className="stat-value">{loading ? '...' : stats.upcomingSessions}</div>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  <span>2 vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {!loading && stats.totalLearners === 0 ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ marginBottom: '8px', color: '#1a1a1a' }}>No Data Available Yet</h3>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Start adding learners and assigning programmes to see detailed analytics and insights.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/institutional/learners')}>
                Add Learners
              </button>
            </div>
          ) : (
            <>
          {/* Main Charts Grid - 3 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            
            {/* Department Progress - Compact Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Department Progress</h3>
                  <p className="card-subtitle">Avg completion %</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '220px' }}>
                {progressData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Building2 size={36} color="#ddd" />
                      <p style={{ marginTop: '8px', fontSize: '13px' }}>No data</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#999" style={{ fontSize: '11px' }} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" stroke="#666" style={{ fontSize: '10px' }} width={70} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [`${value}%`, 'Progress']}
                      />
                      <Bar dataKey="progress" fill="#1976D2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Programme Distribution - Pie Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Programme Distribution</h3>
                  <p className="card-subtitle">Top enrollments</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '220px' }}>
                {engagementData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <div style={{ textAlign: 'center' }}>
                      <BookOpen size={36} color="#ddd" />
                      <p style={{ marginTop: '8px', fontSize: '13px' }}>No data</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ percentage }) => `${percentage}%`}
                        labelLine={false}
                        style={{ fontSize: '10px', fontWeight: 600 }}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value, name, props) => [`${value} learners`, props.payload.name]}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={30}
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }}
                        formatter={(value, entry) => entry.payload.name.substring(0, 12)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Learners by Department - Compact Bar */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Learners by Dept</h3>
                  <p className="card-subtitle">Distribution</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '220px' }}>
                {progressData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Users size={36} color="#ddd" />
                      <p style={{ marginTop: '8px', fontSize: '13px' }}>No data</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} margin={{ top: 5, right: 10, left: 5, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#999" 
                        style={{ fontSize: '9px' }} 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        interval={0}
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis stroke="#999" style={{ fontSize: '10px' }} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [value, 'Learners']}
                      />
                      <Bar dataKey="learners" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Second Row - 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            {/* Completion Rates - Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Programme Completion Rates</h3>
                  <p className="card-subtitle">% completed</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '200px' }}>
                {topProgrammes.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <div style={{ textAlign: 'center' }}>
                      <GraduationCap size={36} color="#ddd" />
                      <p style={{ marginTop: '8px', fontSize: '13px' }}>No data</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={topProgrammes.map(p => ({ 
                        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name, 
                        completion: p.completion 
                      }))} 
                      margin={{ top: 5, right: 10, left: 5, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#999" 
                        style={{ fontSize: '9px' }} 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        interval={0}
                        tick={{ fontSize: 9 }}
                      />
                      <YAxis stroke="#999" style={{ fontSize: '10px' }} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [`${value}%`, 'Completion']}
                      />
                      <Bar dataKey="completion" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Overall Status - Pie Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Overall Learner Status</h3>
                  <p className="card-subtitle">By progress level</p>
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '200px' }}>
                {progressData.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                    <div style={{ textAlign: 'center' }}>
                      <TrendingUp size={36} color="#ddd" />
                      <p style={{ marginTop: '8px', fontSize: '13px' }}>No data</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (75%+)', value: progressData.filter(d => d.progress >= 75).reduce((sum, d) => sum + d.learners, 0), color: '#10b981' },
                          { name: 'Good (25-74%)', value: progressData.filter(d => d.progress >= 25 && d.progress < 75).reduce((sum, d) => sum + d.learners, 0), color: '#3b82f6' },
                          { name: 'Starting (0-24%)', value: progressData.filter(d => d.progress < 25).reduce((sum, d) => sum + d.learners, 0), color: '#f59e0b' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="45%"
                        outerRadius={55}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{ fontSize: '10px', fontWeight: 600 }}
                      >
                        {[
                          { name: 'Excellent (75%+)', value: progressData.filter(d => d.progress >= 75).reduce((sum, d) => sum + d.learners, 0), color: '#10b981' },
                          { name: 'Good (25-74%)', value: progressData.filter(d => d.progress >= 25 && d.progress < 75).reduce((sum, d) => sum + d.learners, 0), color: '#3b82f6' },
                          { name: 'Starting (0-24%)', value: progressData.filter(d => d.progress < 25).reduce((sum, d) => sum + d.learners, 0), color: '#f59e0b' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#fff', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value, name) => [`${value} learners`, name]}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={30}
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
          <div className="bottom-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Upcoming Live Sessions</h3>
                <a href="#" className="link-text">View calendar →</a>
              </div>
              <div className="sessions-list">
                {upcomingSessions.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    <Calendar size={48} color="#ddd" />
                    <p style={{ marginTop: '12px' }}>No upcoming sessions</p>
                  </div>
                ) : (
                  upcomingSessions.map((session, index) => (
                    <div key={index} className="session-item">
                      <div className="session-date">
                        {session.date.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      <div className="session-details">
                        <h4 className="session-title">{session.title}</h4>
                        <p className="session-speaker">Speaker: {session.speaker}</p>
                        <p className="session-time">📅 {session.time}</p>
                        <p className="session-registered">👥 {session.registered} Registered</p>
                      </div>
                      <button className="btn btn-primary btn-sm">{session.action}</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="sidebar-widgets">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                  <a href="#" className="link-text">View all →</a>
                </div>
                <div className="activity-list">
                  {recentActivity.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">{activity.icon}</div>
                        <div className="activity-details">
                          <div className="activity-text">{activity.text}</div>
                          <div className="activity-course">{activity.course}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn" onClick={() => navigate('/institutional/learners')}>
                    <Users size={20} />
                    <span>Add Learners</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate('/institutional/programmes')}>
                    <BookOpen size={20} />
                    <span>Assign Programme</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate('/institutional/cohorts')}>
                    <Calendar size={20} />
                    <span>Create Cohort</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate('/institutional/reports')}>
                    <Download size={20} />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>

              <div className="card help-card">
                <div className="help-icon">💡</div>
                <h4>Need help?</h4>
                <p>Contact your account manager</p>
                <button className="btn btn-secondary btn-sm">Get Support</button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Overview
