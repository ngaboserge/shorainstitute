import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, Award, TrendingUp, BookOpen, Target, Calendar, ChevronRight, Star, Users } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Dashboard.css'

const Dashboard = () => {
  const currentCourse = {
    title: 'Investing Essentials: Grow Your Wealth',
    progress: 65,
    lastLesson: 'Lesson 7: Diversification Strategies',
    nextLesson: 'Lesson 8: Risk Management Basics',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
    instructor: 'Linda Umutoni',
    totalLessons: 12,
    completedLessons: 8
  }

  const upcomingSeminars = [
    {
      id: 1,
      title: 'Building Your Investment Portfolio',
      date: 'Tue, July 8',
      time: '6:00 PM - 7:30 PM',
      instructor: 'Alex Ntale',
      status: 'Registered'
    },
    {
      id: 2,
      title: 'Tax Planning for Personal Wealth',
      date: 'Thu, July 10',
      time: '6:00 PM - 7:30 PM',
      instructor: 'Emmanuel Habimana',
      status: 'Available'
    }
  ]

  const learningPathway = {
    name: 'Build Financial Foundations',
    progress: 40,
    totalCourses: 5,
    completedCourses: 2
  }

  const recentActivity = [
    { type: 'completed', text: 'Completed Lesson 7 in Investing Essentials', time: '2 hours ago' },
    { type: 'certificate', text: 'Earned certificate: Financial Foundations', time: 'Yesterday' },
    { type: 'joined', text: 'Joined live seminar: Building Wealth', time: '2 days ago' },
    { type: 'started', text: 'Started course: Investment Strategies', time: '3 days ago' }
  ]

  const recommendedCourses = [
    {
      id: 1,
      title: 'Understanding Bonds & Fixed Income',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300',
      instructor: 'Franklin Nkubito',
      rating: 4.7,
      duration: '2h 10m',
      level: 'Intermediate'
    },
    {
      id: 2,
      title: 'Real Estate Investment Basics',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300',
      instructor: 'Claudine Mukamana',
      rating: 4.6,
      duration: '2h 45m',
      level: 'Beginner'
    },
    {
      id: 3,
      title: 'Retirement Planning 101',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300',
      instructor: 'Jennifer Kamanzi',
      rating: 4.8,
      duration: '2h 30m',
      level: 'Beginner'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Welcome back, Alex." 
          subtitle="Keep learning. Keep growing. Build lasting wealth."
        />
        <div className="content-wrapper learner-dashboard">
          {/* Stats Overview */}
          <div className="stats-grid-4">
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e3f2fd'}}>
                <BookOpen size={24} color="#0B4F9F" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Courses in Progress</div>
                <div className="stat-value">3</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fff9e6'}}>
                <Award size={24} color="#FDB714" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Certificates Earned</div>
                <div className="stat-value">2</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e8f5e9'}}>
                <Clock size={24} color="#4caf50" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learning Hours</div>
                <div className="stat-value">24.5</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fce4ec'}}>
                <TrendingUp size={24} color="#f44336" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learning Streak</div>
                <div className="stat-value">7 days</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid-2col">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Continue Learning Card */}
              <div className="card continue-learning-card">
                <div className="card-header-flex">
                  <h3>Continue Where You Left Off</h3>
                </div>
                <div className="course-resume">
                  <div className="course-resume-image">
                    <img src={currentCourse.image} alt={currentCourse.title} />
                    <div className="play-overlay">
                      <button className="btn-play-large">
                        <Play size={32} fill="white" />
                      </button>
                    </div>
                  </div>
                  <div className="course-resume-content">
                    <div className="course-category">IN PROGRESS</div>
                    <h4 className="course-resume-title">{currentCourse.title}</h4>
                    <div className="course-instructor-small">
                      <img src="https://i.pravatar.cc/32?img=1" alt={currentCourse.instructor} />
                      <span>{currentCourse.instructor}</span>
                    </div>
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Your Progress</span>
                        <span className="progress-percent">{currentCourse.progress}% complete</span>
                      </div>
                      <div className="progress-bar-large">
                        <div className="progress-fill" style={{width: `${currentCourse.progress}%`}}></div>
                      </div>
                      <div className="lessons-info">
                        {currentCourse.completedLessons} of {currentCourse.totalLessons} lessons completed
                      </div>
                    </div>
                    <div className="next-lesson-info">
                      <div className="next-lesson-label">NEXT LESSON</div>
                      <div className="next-lesson-title">{currentCourse.nextLesson}</div>
                    </div>
                    <Link to={`/learner/courses/${1}/lesson/${8}`} className="btn btn-primary btn-full">
                      Continue Learning →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Learning Pathway Card */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Your Learning Pathway</h3>
                  <Link to="/learner/pathway" className="link-text">View Details →</Link>
                </div>
                <div className="pathway-progress-card">
                  <div className="pathway-header">
                    <div className="pathway-icon-large">🏆</div>
                    <div className="pathway-info">
                      <h4 className="pathway-name-large">{learningPathway.name}</h4>
                      <div className="pathway-meta-large">
                        {learningPathway.completedCourses} of {learningPathway.totalCourses} courses completed
                      </div>
                    </div>
                  </div>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Pathway Progress</span>
                      <span className="progress-percent">{learningPathway.progress}%</span>
                    </div>
                    <div className="progress-bar-large">
                      <div className="progress-fill" style={{width: `${learningPathway.progress}%`}}></div>
                    </div>
                  </div>
                  <Link to="/learner/pathway" className="btn btn-secondary btn-full">
                    Continue Pathway
                  </Link>
                </div>
              </div>

              {/* Recommended Courses */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Recommended For You</h3>
                  <Link to="/courses" className="link-text">Browse All →</Link>
                </div>
                <div className="recommended-grid">
                  {recommendedCourses.map((course) => (
                    <div key={course.id} className="recommended-course-card">
                      <div className="recommended-image">
                        <img src={course.image} alt={course.title} />
                        <div className="level-badge">{course.level}</div>
                      </div>
                      <div className="recommended-content">
                        <h4 className="recommended-title">{course.title}</h4>
                        <div className="recommended-instructor">
                          <img src={`https://i.pravatar.cc/24?img=${course.id}`} alt={course.instructor} />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="recommended-meta">
                          <div className="rating-small">
                            <Star size={12} fill="#FDB714" stroke="#FDB714" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="duration-small">
                            <Clock size={12} />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm btn-full">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-right">
              {/* Upcoming Seminars */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Upcoming Live Seminars</h3>
                  <Link to="/learner/seminars" className="link-text">View All →</Link>
                </div>
                <div className="seminars-list">
                  {upcomingSeminars.map((seminar) => (
                    <div key={seminar.id} className="seminar-item">
                      <div className="seminar-date-badge">
                        <div className="date-day">8</div>
                        <div className="date-month">JUL</div>
                      </div>
                      <div className="seminar-details">
                        <h4 className="seminar-title">{seminar.title}</h4>
                        <div className="seminar-time">
                          <Calendar size={14} />
                          <span>{seminar.date} • {seminar.time}</span>
                        </div>
                        <div className="seminar-instructor-small">
                          <img src="https://i.pravatar.cc/24?img=5" alt={seminar.instructor} />
                          <span>{seminar.instructor}</span>
                        </div>
                        {seminar.status === 'Registered' ? (
                          <div className="status-badge status-success">✓ Registered</div>
                        ) : (
                          <button className="btn btn-secondary btn-sm">Register</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div className={`activity-icon activity-${activity.type}`}>
                        {activity.type === 'completed' && '✓'}
                        {activity.type === 'certificate' && '🏆'}
                        {activity.type === 'joined' && '👥'}
                        {activity.type === 'started' && '▶'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">{activity.text}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <Link to="/learner/courses" className="quick-action-btn">
                    <BookOpen size={20} />
                    <span>Browse Courses</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/assessments" className="quick-action-btn">
                    <Target size={20} />
                    <span>Take Assessment</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/resources" className="quick-action-btn">
                    <BookOpen size={20} />
                    <span>Resource Library</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/certificates" className="quick-action-btn">
                    <Award size={20} />
                    <span>My Certificates</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
