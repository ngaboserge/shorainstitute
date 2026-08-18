import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Filter, Play, Clock, Award, BookOpen, Star, TrendingUp, ChevronRight, Building2, AlertCircle, Ticket } from 'lucide-react'
import ResponsiveLayout from '../../components/ResponsiveLayout'
import PaymentModal from '../../components/PaymentModal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './Courses.css'

const Courses = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('in-progress')
  const [inProgressCourses, setInProgressCourses] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [pendingPaymentCourses, setPendingPaymentCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Reload data when returning to this page
  useEffect(() => {
    if (user) {
      loadEnrolledCourses()
    }
  }, [user, location.pathname])

  // Filter courses based on search and category
  const filterCourses = (courses) => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }

  const filteredInProgress = filterCourses(inProgressCourses)
  const filteredCompleted = filterCourses(completedCourses)

  const loadEnrolledCourses = async () => {
    try {
      // 1. Load regular enrollments with course details (exclude pending payments)
      const { data: regularEnrollments, error: error1 } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            instructor_name,
            category,
            total_lessons,
            total_duration_seconds,
            delivery_type
          )
        `)
        .eq('user_id', user.id)
        .neq('payment_status', 'pending')
        .order('last_accessed_at', { ascending: false })

      if (error1 && error1.code !== 'PGRST116') {
        console.error('Error loading regular enrollments:', error1)
      }

      // 2. Load institutional enrollments (courses assigned by company)
      // First get user's learner_id
      const { data: learnerData } = await supabase
        .from('institution_learners')
        .select('id, institution_id, institutions(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      let institutionalData = []
      if (learnerData) {
        // Get enrollments for this learner
        const { data: enrollments, error: error2 } = await supabase
          .from('learner_institutional_enrollments')
          .select('*')
          .eq('learner_id', learnerData.id)
          .neq('status', 'cancelled')
          .order('enrolled_at', { ascending: false })

        if (error2 && error2.code !== 'PGRST116') {
          console.error('Error loading institutional enrollments:', error2)
        }

        if (enrollments && enrollments.length > 0) {
          // Get course details separately for each enrollment
          const enrichedEnrollments = await Promise.all(
            enrollments.map(async (enrollment) => {
              const { data: courseData } = await supabase
                .from('courses')
                .select('id, title, thumbnail_url, instructor_name, category, total_lessons, total_duration_seconds, delivery_type')
                .eq('id', enrollment.course_id)
                .single()

              return {
                ...enrollment,
                courses: courseData,
                institution_name: learnerData.institutions?.name || 'Your Company'
              }
            })
          )
          institutionalData = enrichedEnrollments
        }
      }

      // 3. Transform institutional enrollments to match regular format
      const institutionalEnrollments = (institutionalData || []).map(ie => ({
        id: ie.id,
        user_id: user.id,
        course_id: ie.course_id,
        progress_percentage: ie.progress_percentage || 0,
        completed_at: ie.completed_at,
        last_accessed_at: ie.last_accessed_at || ie.enrolled_at,
        enrollment_date: ie.enrolled_at,
        courses: ie.courses,
        
        // Institutional specific fields
        source: 'institution',
        institution_name: ie.institution_name || 'Your Company',
        due_date: ie.due_date,
        is_mandatory: ie.assignment_id ? true : false,
        enrolled_via: ie.enrolled_via,
        assignment_id: ie.assignment_id
      }))

      // 4. Transform regular enrollments
      const regularEnrollmentsFormatted = regularEnrollments?.map(e => ({
        ...e,
        source: 'individual',
        enrollment_date: e.enrolled_at
      })) || []

      // 5. Combine all enrollments
      const allEnrollments = [
        ...regularEnrollmentsFormatted,
        ...institutionalEnrollments
      ]

      if (allEnrollments.length === 0) {
        setInProgressCourses([])
        setCompletedCourses([])
        setLoading(false)
        return
      }

      // 6. For each enrollment, load lessons/sessions and calculate progress
      const enrichedEnrollments = await Promise.all(
        allEnrollments.map(async (enrollment) => {
          const deliveryType = enrollment.courses?.delivery_type || 'self_paced'
          
          let nextItem = null
          let totalItems = 0
          let completedItems = 0

          if (deliveryType === 'live') {
            // For live courses, get sessions
            const { data: sessions } = await supabase
              .from('course_sessions')
              .select('id, title, session_date, start_time, end_time, session_number')
              .eq('course_id', enrollment.course_id)
              .order('session_number')

            totalItems = sessions?.length || 0
            // Find next upcoming session
            const now = new Date()
            nextItem = sessions?.find(s => new Date(s.session_date) >= now) || sessions?.[0]
            if (nextItem) {
              nextItem.isSession = true
            }
          } else {
            // For self-paced courses, get lessons
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id, title, order_number')
              .eq('course_id', enrollment.course_id)
              .order('order_number')

            totalItems = lessons?.length || 0
            completedItems = Math.floor((enrollment.progress_percentage / 100) * totalItems)
            nextItem = lessons?.find(l => l.order_number > completedItems) || lessons?.[0]
          }

          // Calculate when last accessed
          const lastAccessedDate = new Date(enrollment.last_accessed_at)
          const now = new Date()
          const hoursDiff = Math.floor((now - lastAccessedDate) / (1000 * 60 * 60))
          let lastAccessedText = 'Just now'
          if (hoursDiff < 1) lastAccessedText = 'Just now'
          else if (hoursDiff < 24) lastAccessedText = `${hoursDiff} hours ago`
          else if (hoursDiff < 48) lastAccessedText = 'Yesterday'
          else lastAccessedText = `${Math.floor(hoursDiff / 24)} days ago`

          return {
            id: enrollment.course_id,
            enrollmentId: enrollment.id,
            title: enrollment.courses?.title || 'Unknown Course',
            image: enrollment.courses?.thumbnail_url,
            instructor: enrollment.courses?.instructor_name,
            category: enrollment.courses?.category,
            progress: Math.round(enrollment.progress_percentage || 0),
            completedLessons: completedItems,
            totalLessons: totalItems,
            nextLesson: nextItem,
            lastAccessed: lastAccessedText,
            completedDate: enrollment.completed_at,
            duration: enrollment.courses?.total_duration_seconds,
            deliveryType: deliveryType,
            
            // Institutional fields
            source: enrollment.source,
            institutionName: enrollment.institution_name,
            dueDate: enrollment.due_date,
            isMandatory: enrollment.is_mandatory,
            enrolledVia: enrollment.enrolled_via
          }
        })
      )

      // 7. Separate into in-progress and completed
      const inProgress = enrichedEnrollments.filter(e => e.progress < 100)
      const completed = enrichedEnrollments.filter(e => e.progress >= 100)

      setInProgressCourses(inProgress)
      setCompletedCourses(completed)

      // 8. Load pending payment courses separately (only from enrollments table)
      const { data: pendingEnrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            instructor_name,
            category,
            price,
            currency
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'pending')

      if (pendingEnrollments) {
        const pendingCourses = pendingEnrollments.map(enrollment => ({
          id: enrollment.course_id,
          enrollmentId: enrollment.id,
          title: enrollment.courses.title,
          image: enrollment.courses.thumbnail_url,
          instructor: enrollment.courses.instructor_name,
          category: enrollment.courses.category,
          price: enrollment.courses.price,
          currency: enrollment.courses.currency,
          submittedDate: new Date(enrollment.enrolled_at).toLocaleDateString()
        }))
        setPendingPaymentCourses(pendingCourses)
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const savedCourses = []

  if (loading) {
    return (
      <ResponsiveLayout 
        title="My Learning" 
        subtitle="Loading your courses"
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading your courses...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title="My Learning" 
      subtitle="Track your progress and continue building your financial knowledge"
      type="learner"
    >
          {/* Tabs Navigation */}
          <div className="tabs-nav-large">
            <button 
              className={`tab-btn-large ${activeTab === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress
              <span className="tab-badge">{inProgressCourses.length}</span>
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Approval
              <span className="tab-badge">{pendingPaymentCourses.length}</span>
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
              <span className="tab-badge">{completedCourses.length}</span>
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
              <span className="tab-badge">{savedCourses.length}</span>
            </button>
          </div>

          {/* In Progress Tab */}
          {activeTab === 'in-progress' && (
            <div className="courses-section">
              <div className="section-header-action">
                <h3>Continue Where You Left Off</h3>
                <div className="search-filter-group">
                  <div className="search-box-small">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search your courses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="filter-select-small"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Finance & Investment">Finance & Investment</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Technology & Programming">Technology & Programming</option>
                    <option value="Personal Development">Personal Development</option>
                  </select>
                </div>
              </div>

              {filteredInProgress.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <BookOpen size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#666', marginBottom: '8px' }}>
                    {searchQuery || filterCategory !== 'all' ? 'No courses match your search' : 'No courses in progress'}
                  </h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>
                    {searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Start learning by enrolling in a course'}
                  </p>
                  {!searchQuery && filterCategory === 'all' && (
                    <Link to="/learner/browse" className="btn btn-primary">
                      Browse Courses
                    </Link>
                  )}
                </div>
              ) : (
                <div className="courses-list-vertical">
                  {filteredInProgress.map((course) => (
                    <div key={course.id} className="course-card-horizontal">
                      <div className="course-image-horizontal">
                        {course.image ? (
                          <img src={course.image} alt={course.title} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <BookOpen size={48} color="white" />
                          </div>
                        )}
                        <div className="play-overlay-small">
                          <button className="btn-play-small">
                            <Play size={24} fill="white" />
                          </button>
                        </div>
                        <div className="progress-ring">
                          <svg width="60" height="60">
                            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                            <circle 
                              cx="30" 
                              cy="30" 
                              r="26" 
                              fill="none" 
                              stroke="#FDB714" 
                              strokeWidth="4"
                              strokeDasharray={`${163 * course.progress / 100} 163`}
                              transform="rotate(-90 30 30)"
                            />
                          </svg>
                          <div className="progress-number">{course.progress}%</div>
                        </div>
                      </div>
                      <div className="course-content-horizontal" style={{color: '#1a1a1a'}}>
                        <div style={{display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}}>
                          <div className="course-category-badge" style={{color: '#0B4F9F', background: '#e3f2fd', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700'}}>{course.category}</div>
                          {course.source === 'institution' && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534'}}>
                              <Building2 size={12} />
                              <span>{course.institutionName}</span>
                            </div>
                          )}
                          {course.isMandatory && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fee2e2', color: '#991b1b'}}>
                              <AlertCircle size={12} />
                              <span>Mandatory</span>
                            </div>
                          )}
                          {course.enrolledVia === 'code_redemption' && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fef3c7', color: '#92400e'}}>
                              <Ticket size={12} />
                              <span>Code Redeemed</span>
                            </div>
                          )}
                        </div>
                        <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px', lineHeight: '1.3'}}>{course.title}</h3>
                        <div className="course-instructor-horizontal">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            {course.instructor?.charAt(0) || 'T'}
                          </div>
                          <span style={{fontSize: '14px', color: '#666', fontWeight: '500'}}>{course.instructor || 'Instructor'}</span>
                        </div>
                        <div className="progress-info-horizontal">
                          <div className="progress-bar-container">
                            <div className="progress-bar-horizontal">
                              <div className="progress-fill" style={{width: `${course.progress}%`}}></div>
                            </div>
                            <div style={{fontSize: '13px', color: '#666', fontWeight: '500'}}>
                              {course.completedLessons} of {course.totalLessons} lessons • {course.progress}% complete
                            </div>
                          </div>
                        </div>
                        <div style={{padding: '16px', background: '#f5f7fa', borderRadius: '10px', marginBottom: '20px'}}>
                          <div style={{fontSize: '11px', fontWeight: '700', color: '#0B4F9F', letterSpacing: '1px', marginBottom: '6px'}}>
                            {course.deliveryType === 'live' ? 'NEXT SESSION:' : 'NEXT UP:'}
                          </div>
                          <div style={{fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: course.dueDate ? '8px' : '0'}}>
                            {course.nextLesson?.title || (course.deliveryType === 'live' ? 'Sessions scheduled soon' : 'Start first lesson')}
                          </div>
                          {course.dueDate && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#dc2626', fontWeight: '600'}}>
                              <Clock size={14} />
                              <span>Due: {new Date(course.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="course-actions-horizontal">
                          {course.deliveryType === 'live' ? (
                            <Link to={`/learner/live-courses/${course.id}`} className="btn btn-primary">
                              View Sessions →
                            </Link>
                          ) : course.nextLesson?.id ? (
                            <Link to={`/learner/courses/${course.id}/lesson/${course.nextLesson.id}`} className="btn btn-primary">
                              Continue Learning →
                            </Link>
                          ) : (
                            <button 
                              className="btn btn-secondary" 
                              disabled
                              style={{ opacity: 0.6, cursor: 'not-allowed' }}
                              title="No lessons available yet"
                            >
                              No Lessons Available
                            </button>
                          )}
                          <div className="last-accessed" style={{color: '#999'}}>Last accessed {course.lastAccessed}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <div className="courses-section">
              <div className="section-header-action">
                <h3>Completed Courses</h3>
                <div className="search-filter-group">
                  <div className="search-box-small">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search your courses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="filter-select-small"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Finance & Investment">Finance & Investment</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Technology & Programming">Technology & Programming</option>
                    <option value="Personal Development">Personal Development</option>
                  </select>
                </div>
              </div>

              {filteredCompleted.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Award size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#666', marginBottom: '8px' }}>
                    {searchQuery || filterCategory !== 'all' ? 'No courses match your search' : 'No completed courses yet'}
                  </h3>
                  <p style={{ color: '#999' }}>
                    {searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Complete your first course to earn a certificate'}
                  </p>
                </div>
              ) : (
                <div className="courses-grid-3col">
                  {filteredCompleted.map((course) => (
                    <div key={course.id} className="course-card-completed">
                      <div className="course-image-standard">
                        {course.image ? (
                          <img src={course.image} alt={course.title} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '200px',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <BookOpen size={48} color="white" />
                          </div>
                        )}
                        <div className="completed-badge">
                          <Award size={20} />
                          <span>Completed</span>
                        </div>
                      </div>
                      <div className="course-content-standard" style={{color: '#1a1a1a'}}>
                        <div style={{display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}}>
                          <div className="course-category-badge" style={{color: '#0B4F9F'}}>{course.category}</div>
                          {course.source === 'institution' && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#dcfce7', color: '#166534'}}>
                              <Building2 size={12} />
                              <span>{course.institutionName}</span>
                            </div>
                          )}
                        </div>
                        <h3 className="course-title-standard" style={{color: '#1a1a1a'}}>{course.title}</h3>
                        <div className="course-instructor-standard">
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {course.instructor?.charAt(0) || 'T'}
                          </div>
                          <span style={{color: '#666'}}>{course.instructor || 'Instructor'}</span>
                        </div>
                        <div className="completion-info">
                          <div className="completion-date" style={{color: '#4caf50'}}>
                            Completed on {formatDate(course.completedDate)}
                          </div>
                          <div className="course-duration" style={{color: '#666'}}>
                            <Clock size={14} />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                        </div>
                        <Link to="/learner/certificates" className="btn btn-secondary btn-full">
                          View Certificate
                        </Link>
                        <button className="btn btn-outline btn-full">
                          Review Course
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Approval Tab */}
          {activeTab === 'pending' && (
            <div className="courses-section">
              <div className="section-header-action">
                <h3>Pending Payment Approval</h3>
              </div>

              {pendingPaymentCourses.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Clock size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#666', marginBottom: '8px' }}>No pending payments</h3>
                  <p style={{ color: '#999' }}>Courses requiring payment approval will appear here</p>
                </div>
              ) : (
                <div className="courses-grid-3col">
                  {pendingPaymentCourses.map((course) => (
                    <div key={course.id} className="course-card-completed" style={{border: '2px solid #fbbf24'}}>
                      <div className="course-image-standard">
                        {course.image ? (
                          <img src={course.image} alt={course.title} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '200px',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <BookOpen size={48} color="white" />
                          </div>
                        )}
                        <div className="completed-badge" style={{background: '#fbbf24', color: '#78350f'}}>
                          <Clock size={20} />
                          <span>Pending</span>
                        </div>
                      </div>
                      <div className="course-content-standard" style={{color: '#1a1a1a'}}>
                        <div className="course-category-badge" style={{color: '#0B4F9F'}}>{course.category}</div>
                        <h3 className="course-title-standard" style={{color: '#1a1a1a'}}>{course.title}</h3>
                        <div className="course-instructor-standard">
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {course.instructor?.charAt(0) || 'T'}
                          </div>
                          <span style={{color: '#666'}}>{course.instructor || 'Instructor'}</span>
                        </div>
                        <div style={{
                          padding: '12px',
                          background: '#fef3c7',
                          borderRadius: '8px',
                          marginTop: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{fontSize: '13px', color: '#78350f', fontWeight: '600', marginBottom: '4px'}}>
                            ⏳ Payment Under Review
                          </div>
                          <div style={{fontSize: '12px', color: '#92400e'}}>
                            Amount: {course.currency === 'USD' ? '$' : course.currency === 'RWF' ? 'FRw' : '€'}{parseFloat(course.price).toFixed(2)}
                          </div>
                          <div style={{fontSize: '12px', color: '#92400e'}}>
                            Submitted: {course.submittedDate}
                          </div>
                        </div>
                        <div style={{fontSize: '13px', color: '#666', textAlign: 'center', padding: '8px'}}>
                          You'll be notified once the trainer approves your payment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div className="courses-section">
              <div className="section-header-action">
                <h3>Saved for Later</h3>
              </div>
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <BookOpen size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ color: '#666', marginBottom: '8px' }}>No saved courses</h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>Save courses from browse page to access them later</p>
                <Link to="/learner/browse" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            </div>
          )}

          {/* Recommended Section */}
          <div className="card">
            <div className="card-header-flex">
              <h3>Recommended Next Steps</h3>
              <Link to="/courses" className="link-text">Browse All Courses →</Link>
            </div>
            <p className="section-description">
              Based on your learning journey, these courses will help you continue building your financial expertise.
            </p>
            <div className="recommendations-grid">
              <div className="recommendation-card">
                <div className="recommendation-icon">📊</div>
                <h4>Advanced Investment Strategies</h4>
                <p>Take your investing knowledge to the next level</p>
                <Link to="/courses" className="btn btn-secondary btn-sm">
                  Explore
                </Link>
              </div>
              <div className="recommendation-card">
                <div className="recommendation-icon">💼</div>
                <h4>Retirement Planning</h4>
                <p>Secure your financial future with expert guidance</p>
                <Link to="/courses" className="btn btn-secondary btn-sm">
                  Explore
                </Link>
              </div>
              <div className="recommendation-card">
                <div className="recommendation-icon">🏠</div>
                <h4>Real Estate Investing</h4>
                <p>Build wealth through property investment</p>
                <Link to="/courses" className="btn btn-secondary btn-sm">
                  Explore
                </Link>
              </div>
            </div>
          </div>
      </ResponsiveLayout>
    )
  }

export default Courses
