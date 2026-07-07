import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Play, Clock, Award, BookOpen, Star, TrendingUp, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Courses.css'

const Courses = () => {
  const [activeTab, setActiveTab] = useState('in-progress')

  const inProgressCourses = [
    {
      id: 1,
      title: 'Investing Essentials: Grow Your Wealth',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      instructor: 'Linda Umutoni',
      progress: 65,
      completedLessons: 8,
      totalLessons: 12,
      nextLesson: 'Lesson 8: Risk Management Basics',
      lastAccessed: '2 hours ago',
      category: 'Investing'
    },
    {
      id: 2,
      title: 'Financial Freedom: Begin with a Plan',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
      instructor: 'Alex Ntale',
      progress: 85,
      completedLessons: 9,
      totalLessons: 10,
      nextLesson: 'Lesson 10: Creating Your Action Plan',
      lastAccessed: 'Yesterday',
      category: 'Financial Foundations'
    },
    {
      id: 3,
      title: 'Cash Flow Management for Small Businesses',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      instructor: 'Claudine Mukamana',
      progress: 30,
      completedLessons: 3,
      totalLessons: 10,
      nextLesson: 'Lesson 4: Managing Receivables',
      lastAccessed: '3 days ago',
      category: 'SME Finance'
    }
  ]

  const completedCourses = [
    {
      id: 4,
      title: 'Budgeting & Saving That Actually Works',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      instructor: 'Emmanuel Habimana',
      completedDate: 'June 28, 2026',
      duration: '1h 30m',
      certificate: true,
      rating: 4.8,
      category: 'Personal Wealth'
    },
    {
      id: 5,
      title: 'Introduction to Personal Finance',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400',
      instructor: 'Jennifer Kamanzi',
      completedDate: 'June 15, 2026',
      duration: '2h 15m',
      certificate: true,
      rating: 4.6,
      category: 'Financial Foundations'
    }
  ]

  const savedCourses = [
    {
      id: 6,
      title: 'Introduction to the Rwanda Stock Market',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      instructor: 'Isaac Twizere',
      rating: 4.6,
      students: 438,
      duration: '2h 45m',
      level: 'Intermediate',
      category: 'Capital Markets'
    },
    {
      id: 7,
      title: 'Fixed Income Investing: Bonds & Beyond',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      instructor: 'Franklin Nkubito',
      rating: 4.6,
      students: 289,
      duration: '2h 10m',
      level: 'Intermediate',
      category: 'Investing'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Learning" 
          subtitle="Track your progress and continue building your financial knowledge"
        />
        <div className="content-wrapper">
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
                    <input type="text" placeholder="Search your courses..." />
                  </div>
                  <button className="btn btn-icon">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="courses-list-vertical">
                {inProgressCourses.map((course) => (
                  <div key={course.id} className="course-card-horizontal">
                    <div className="course-image-horizontal">
                      <img src={course.image} alt={course.title} />
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
                    <div className="course-content-horizontal">
                      <div className="course-category-badge">{course.category}</div>
                      <h3 className="course-title-horizontal">{course.title}</h3>
                      <div className="course-instructor-horizontal">
                        <img src={`https://i.pravatar.cc/32?img=${course.id}`} alt={course.instructor} />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="progress-info-horizontal">
                        <div className="progress-bar-container">
                          <div className="progress-bar-horizontal">
                            <div className="progress-fill" style={{width: `${course.progress}%`}}></div>
                          </div>
                          <div className="progress-text">
                            {course.completedLessons} of {course.totalLessons} lessons • {course.progress}% complete
                          </div>
                        </div>
                      </div>
                      <div className="next-lesson-horizontal">
                        <div className="next-label">NEXT UP:</div>
                        <div className="next-text">{course.nextLesson}</div>
                      </div>
                      <div className="course-actions-horizontal">
                        <Link to={`/learner/courses/${course.id}/lesson/${course.completedLessons + 1}`} className="btn btn-primary">
                          Continue Learning →
                        </Link>
                        <div className="last-accessed">Last accessed {course.lastAccessed}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    <input type="text" placeholder="Search your courses..." />
                  </div>
                  <button className="btn btn-icon">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="courses-grid-3col">
                {completedCourses.map((course) => (
                  <div key={course.id} className="course-card-completed">
                    <div className="course-image-standard">
                      <img src={course.image} alt={course.title} />
                      <div className="completed-badge">
                        <Award size={20} />
                        <span>Completed</span>
                      </div>
                    </div>
                    <div className="course-content-standard">
                      <div className="course-category-badge">{course.category}</div>
                      <h3 className="course-title-standard">{course.title}</h3>
                      <div className="course-instructor-standard">
                        <img src={`https://i.pravatar.cc/28?img=${course.id}`} alt={course.instructor} />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="completion-info">
                        <div className="completion-date">
                          Completed on {course.completedDate}
                        </div>
                        <div className="course-duration">
                          <Clock size={14} />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      {course.certificate && (
                        <Link to="/learner/certificates" className="btn btn-secondary btn-full">
                          View Certificate
                        </Link>
                      )}
                      <button className="btn btn-outline btn-full">
                        Review Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div className="courses-section">
              <div className="section-header-action">
                <h3>Saved for Later</h3>
                <div className="search-filter-group">
                  <div className="search-box-small">
                    <Search size={18} />
                    <input type="text" placeholder="Search saved courses..." />
                  </div>
                  <button className="btn btn-icon">
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="courses-grid-3col">
                {savedCourses.map((course) => (
                  <div key={course.id} className="course-card-saved">
                    <div className="course-image-standard">
                      <img src={course.image} alt={course.title} />
                      <div className="level-badge-overlay">{course.level}</div>
                    </div>
                    <div className="course-content-standard">
                      <div className="course-category-badge">{course.category}</div>
                      <h3 className="course-title-standard">{course.title}</h3>
                      <div className="course-instructor-standard">
                        <img src={`https://i.pravatar.cc/28?img=${course.id}`} alt={course.instructor} />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="course-meta-row">
                        <div className="rating-display">
                          <Star size={14} fill="#FDB714" stroke="#FDB714" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="students-count">
                          {course.students} students
                        </div>
                      </div>
                      <div className="course-duration-display">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </div>
                      <button className="btn btn-primary btn-full">
                        Enroll Now
                      </button>
                      <button className="btn btn-text btn-full">
                        Remove from Saved
                      </button>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  )
}

export default Courses
