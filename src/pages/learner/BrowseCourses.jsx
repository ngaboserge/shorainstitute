import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Filter, Star, Clock, Users, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ResponsiveLayout from '../../components/ResponsiveLayout'
import PaymentModal from '../../components/PaymentModal'

import './BrowseCourses.css'

const BrowseCourses = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('All Courses')
  const [courses, setCourses] = useState([])
  const [enrollmentsByCourse, setEnrollmentsByCourse] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    loadPublishedCourses()
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadUserEnrollments()
    } else {
      setEnrollmentsByCourse({})
    }
  }, [user?.id])

  const loadPublishedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id, payment_status, progress_percentage')
        .eq('user_id', user.id)
        .in('payment_status', ['free', 'approved'])

      if (error) throw error

      const map = {}
      for (const enrollment of data || []) {
        map[enrollment.course_id] = enrollment
      }
      setEnrollmentsByCourse(map)
    } catch (error) {
      console.error('Error loading enrollments:', error)
    }
  }

  const getEnrollmentState = (courseId) => {
    const enrollment = enrollmentsByCourse[courseId]
    if (!enrollment) return 'available'
    const progress = Number(enrollment.progress_percentage) || 0
    return progress >= 100 ? 'completed' : 'in_progress'
  }

  const openCourse = async (courseId) => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true })
      .limit(1)

    if (lessons?.[0]?.id) {
      navigate(`/learner/courses/${courseId}/lesson/${lessons[0].id}`)
      return
    }

    navigate('/learner/courses')
  }

  const categories = [
    'All Courses',
    'Finance & Investment',
    'Business & Entrepreneurship',
    'Technology & Programming',
    'Marketing & Sales',
    'Personal Development',
    'Design & Creative',
    'Health & Wellness',
    'Language Learning',
    'Academic',
    'Other'
  ]

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All Courses' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatDuration = (seconds) => {
    if (!seconds) return '0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free'
    const symbols = { RWF: 'FRw', USD: '$', EUR: '€' }
    return `${symbols[currency] || currency} ${price.toLocaleString()}`
  }

  const handleCourseAction = async (course) => {
    if (!user) {
      navigate('/auth/learner/login')
      return
    }

    const state = getEnrollmentState(course.id)

    if (state === 'completed') {
      navigate('/learner/certificates')
      return
    }

    if (state === 'in_progress') {
      setActionLoadingId(course.id)
      try {
        await openCourse(course.id)
      } finally {
        setActionLoadingId(null)
      }
      return
    }

    // Paid course → XentriPay checkout. Enrollment is created server-side
    // only after the gateway confirms the payment.
    if (course.is_paid && course.price > 0) {
      setSelectedCourse(course)
      setShowPaymentModal(true)
      return
    }

    // Free course - enroll immediately
    setActionLoadingId(course.id)
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          payment_status: 'free',
          enrolled_at: new Date().toISOString()
        })

      if (error) throw error

      await supabase.rpc('increment_enrollment_count', { course_id: course.id })
      await loadUserEnrollments()
      await openCourse(course.id)
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('Failed to enroll. Please try again.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getCourseButton = (course) => {
    const state = getEnrollmentState(course.id)
    const busy = actionLoadingId === course.id

    if (state === 'completed') {
      return {
        label: busy ? 'Opening…' : 'Completed',
        className: 'btn btn-secondary btn-full',
      }
    }

    if (state === 'in_progress') {
      return {
        label: busy ? 'Opening…' : 'Continue Learning',
        className: 'btn btn-primary btn-full',
      }
    }

    if (!course.is_paid || course.price === 0) {
      return {
        label: busy ? 'Enrolling…' : 'Enroll Free',
        className: 'btn btn-warning btn-full',
      }
    }

    return {
      label: `Enroll - ${formatPrice(course.price, course.currency)}`,
      className: 'btn btn-primary btn-full',
    }
  }

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Browse Courses"
        subtitle="Loading courses"
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading courses...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <>
      <ResponsiveLayout 
      title="Browse Courses"
      subtitle="Discover courses to expand your financial knowledge."
      type="learner"
    >
          {/* Search and Filters */}
          <div className="browse-filters">
            <div className="search-bar">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search courses by title, topic, or instructor..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-row">
              <select className="filter-select">
                <option>Level: All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              
              <select className="filter-select">
                <option>Duration: Any</option>
                <option>&lt; 2 hours</option>
                <option>2-4 hours</option>
                <option>&gt; 4 hours</option>
              </select>
              
              <select className="filter-select">
                <option>Price: All</option>
                <option>Free</option>
                <option>Paid</option>
              </select>
              
              <button className="btn btn-icon">
                <Filter size={18} />
                More Filters
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p>Showing {filteredCourses.length} courses</p>
            <select className="sort-select">
              <option>Sort by: Most Popular</option>
              <option>Highest Rated</option>
              <option>Newest</option>
              <option>Duration</option>
            </select>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <BookOpen size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#666', marginBottom: '8px' }}>No courses found</h3>
              <p style={{ color: '#999' }}>
                {searchQuery ? 'Try adjusting your search' : 'No published courses available yet'}
              </p>
            </div>
          ) : (
            <div className="browse-grid">
              {filteredCourses.map((course) => (
                <div key={course.id} className="browse-course-card">
                    <div className="course-image-wrapper">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="course-img" />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px'
                      }}>
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="course-category-badge">{course.category}</div>
                    <div className="course-level-badge">{course.level}</div>
                    {(!course.is_paid || course.price === 0) && <div className="free-badge">FREE</div>}
                    {course.is_paid && course.price > 0 && (
                      <div className="price-badge-overlay">
                        {formatPrice(course.price, course.currency)}
                      </div>
                    )}
                  </div>
                  
                  <div className="course-card-content">
                    <h3 className="course-card-title">{course.title}</h3>
                    
                    <div className="course-instructor-row">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {course.instructor_name?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="instructor-name-small">{course.instructor_name || 'Instructor'}</div>
                        <div className="instructor-role-small">SHORA Institute</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-card-footer">
                    {(() => {
                      const button = getCourseButton(course)
                      const state = getEnrollmentState(course.id)
                      return (
                        <button
                          onClick={() => handleCourseAction(course)}
                          className={button.className}
                          disabled={actionLoadingId === course.id}
                        >
                          {button.label}
                          {state === 'completed' ? ' ✓' : ''}
                        </button>
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
      </ResponsiveLayout>

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          user={user}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedCourse(null)
          }}
          onSuccess={async () => {
            await loadUserEnrollments()
            navigate('/learner/courses')
          }}
        />
      )}
    </>
  )
}

export default BrowseCourses
