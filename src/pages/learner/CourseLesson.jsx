import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Lock, BookOpen, FileText, Video, MessageSquare, Play, BarChart3, Scale, Target } from 'lucide-react'
import './CourseLesson.css'

const CourseLesson = () => {
  const { id, lessonId } = useParams()
  const [completedLessons, setCompletedLessons] = useState([1, 2, 3, 4, 5, 6, 7])

  const course = {
    id: 1,
    title: 'Investing Essentials: Grow Your Wealth',
    instructor: 'Linda Umutoni',
    totalLessons: 12
  }

  const lessons = [
    { id: 1, title: 'Introduction to Investing', duration: '10:25', type: 'video' },
    { id: 2, title: 'Understanding Risk & Return', duration: '12:30', type: 'video' },
    { id: 3, title: 'Types of Investment Assets', duration: '15:20', type: 'video' },
    { id: 4, title: 'Reading Financial Statements', duration: '18:45', type: 'video' },
    { id: 5, title: 'Portfolio Construction Basics', duration: '14:10', type: 'video' },
    { id: 6, title: 'Asset Allocation Strategies', duration: '16:55', type: 'video' },
    { id: 7, title: 'Diversification Strategies', duration: '13:40', type: 'video' },
    { id: 8, title: 'Risk Management Basics', duration: '17:20', type: 'video' },
    { id: 9, title: 'Investment Research Methods', duration: '19:30', type: 'video' },
    { id: 10, title: 'Market Analysis Fundamentals', duration: '16:15', type: 'video' },
    { id: 11, title: 'Building Your First Portfolio', duration: '22:40', type: 'video' },
    { id: 12, title: 'Course Summary & Next Steps', duration: '11:25', type: 'video' }
  ]

  const currentLesson = lessons[parseInt(lessonId) - 1]
  const currentLessonNumber = parseInt(lessonId)

  const resources = [
    { name: 'Lesson Slides (PDF)', type: 'PDF', size: '2.4 MB' },
    { name: 'Portfolio Template (Excel)', type: 'XLSX', size: '145 KB' },
    { name: 'Key Concepts Summary', type: 'PDF', size: '890 KB' }
  ]

  const notes = [
    { time: '02:15', text: 'Remember: Diversification reduces unsystematic risk' },
    { time: '08:42', text: 'Asset allocation rule of thumb: 100 - age = % stocks' }
  ]

  return (
    <div className="lesson-layout">
      {/* Left Sidebar - Course Content */}
      <div className="lesson-sidebar">
        <div className="course-header-sidebar">
          <Link to="/learner/courses" className="back-link">
            <ChevronLeft size={18} />
            <span>Back to My Learning</span>
          </Link>
          <h3 className="course-title-sidebar">{course.title}</h3>
          <div className="course-instructor-sidebar">
            <img src="https://i.pravatar.cc/32?img=1" alt={course.instructor} />
            <span>{course.instructor}</span>
          </div>
          <div className="course-progress-sidebar">
            <div className="progress-label">
              <span>Your Progress</span>
              <span>{Math.round((completedLessons.length / course.totalLessons) * 100)}%</span>
            </div>
            <div className="progress-bar-sidebar">
              <div 
                className="progress-fill" 
                style={{width: `${(completedLessons.length / course.totalLessons) * 100}%`}}
              ></div>
            </div>
            <div className="progress-text-small">
              {completedLessons.length} of {course.totalLessons} lessons complete
            </div>
          </div>
        </div>

        <div className="lessons-list">
          <h4 className="lessons-header">Course Content</h4>
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id)
            const isCurrent = lesson.id === currentLessonNumber
            const isLocked = lesson.id > currentLessonNumber + 1

            return (
              <Link
                key={lesson.id}
                to={`/learner/courses/${id}/lesson/${lesson.id}`}
                className={`lesson-item ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              >
                <div className="lesson-number">
                  {isCompleted ? (
                    <div className="lesson-check">
                      <Check size={16} />
                    </div>
                  ) : isLocked ? (
                    <Lock size={16} />
                  ) : (
                    <span>{lesson.id}</span>
                  )}
                </div>
                <div className="lesson-info">
                  <div className="lesson-title-small">{lesson.title}</div>
                  <div className="lesson-duration">{lesson.duration}</div>
                </div>
                {isCurrent && (
                  <div className="playing-indicator">
                    <Play size={12} fill="currentColor" />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lesson-main">
        {/* Video Player */}
        <div className="video-container">
          <div className="video-player">
            <div className="video-placeholder">
              <div className="play-button-large">
                <Play size={64} fill="white" stroke="white" />
              </div>
              <div className="video-overlay-text">
                <h2>{currentLesson.title}</h2>
                <p>Lesson {currentLessonNumber} of {course.totalLessons}</p>
              </div>
            </div>
          </div>
          
          {/* Lesson Navigation */}
          <div className="lesson-navigation-bar">
            <Link
              to={currentLessonNumber > 1 ? `/learner/courses/${id}/lesson/${currentLessonNumber - 1}` : '#'}
              className={`nav-btn ${currentLessonNumber === 1 ? 'disabled' : ''}`}
            >
              <ChevronLeft size={20} />
              <span>Previous Lesson</span>
            </Link>
            
            <button className="btn btn-primary mark-complete-btn">
              <Check size={18} />
              <span>Mark as Complete</span>
            </button>

            <Link
              to={currentLessonNumber < course.totalLessons ? `/learner/courses/${id}/lesson/${currentLessonNumber + 1}` : '#'}
              className={`nav-btn ${currentLessonNumber === course.totalLessons ? 'disabled' : ''}`}
            >
              <span>Next Lesson</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        {/* Tabbed Content Below Video */}
        <div className="lesson-tabs-section">
          <div className="lesson-tabs">
            <button className="lesson-tab active">
              <FileText size={18} />
              <span>Overview</span>
            </button>
            <button className="lesson-tab">
              <BookOpen size={18} />
              <span>Resources</span>
            </button>
            <button className="lesson-tab">
              <MessageSquare size={18} />
              <span>Discussion</span>
            </button>
          </div>

          <div className="lesson-tab-content">
            {/* Overview Tab */}
            <div className="overview-tab">
              <div className="overview-main">
                <h3>Lesson Overview</h3>
                <p className="lesson-description">
                  In this lesson, you'll learn about the fundamental principles of diversification and how 
                  spreading investments across different asset classes can help reduce risk while maintaining 
                  potential returns. We'll explore practical strategies for building a well-diversified portfolio 
                  that aligns with your financial goals and risk tolerance.
                </p>

                <h4>What You'll Learn</h4>
                <ul className="learning-objectives">
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> The concept of diversification and why it matters</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Different types of diversification strategies</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> How to spread risk across asset classes</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Common diversification mistakes to avoid</li>
                  <li><Check size={16} color="#4caf50" style={{marginRight: '8px', display: 'inline-block'}} /> Building a diversified portfolio for your goals</li>
                </ul>

                <h4>Key Concepts</h4>
                <div className="key-concepts-grid">
                  <div className="concept-card">
                    <div className="concept-icon">
                      <BarChart3 size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Asset Allocation</div>
                    <p>Distributing investments across different asset classes</p>
                  </div>
                  <div className="concept-card">
                    <div className="concept-icon">
                      <Scale size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Risk Management</div>
                    <p>Reducing portfolio volatility through diversification</p>
                  </div>
                  <div className="concept-card">
                    <div className="concept-icon">
                      <Target size={32} color="#0B4F9F" />
                    </div>
                    <div className="concept-title">Portfolio Balance</div>
                    <p>Maintaining optimal mix of investments</p>
                  </div>
                </div>

                <h4>Downloadable Resources</h4>
                <div className="resources-list">
                  {resources.map((resource, idx) => (
                    <div key={idx} className="resource-item">
                      <div className="resource-icon">
                        <FileText size={20} />
                      </div>
                      <div className="resource-info">
                        <div className="resource-name">{resource.name}</div>
                        <div className="resource-meta">{resource.type} • {resource.size}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm">Download</button>
                    </div>
                  ))}
                </div>

                <h4>Your Notes</h4>
                <div className="notes-section">
                  {notes.map((note, idx) => (
                    <div key={idx} className="note-item">
                      <div className="note-time">{note.time}</div>
                      <div className="note-text">{note.text}</div>
                      <button className="note-delete">×</button>
                    </div>
                  ))}
                  <button className="btn btn-outline btn-full">
                    + Add a Note at Current Timestamp
                  </button>
                </div>
              </div>

              <div className="overview-sidebar">
                <div className="lesson-info-card">
                  <h4>Lesson Info</h4>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{currentLesson.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">Video Lesson</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Resources</span>
                    <span className="info-value">{resources.length} files</span>
                  </div>
                </div>

                <div className="instructor-card">
                  <h4>Your Instructor</h4>
                  <div className="instructor-profile">
                    <img src="https://i.pravatar.cc/64?img=1" alt={course.instructor} />
                    <div className="instructor-details">
                      <div className="instructor-name">{course.instructor}</div>
                      <div className="instructor-title">Senior Financial Advisor</div>
                    </div>
                  </div>
                  <p className="instructor-bio">
                    Linda has over 15 years of experience in investment management and financial planning.
                  </p>
                  <button className="btn btn-secondary btn-full">Send Message</button>
                </div>

                <div className="help-card">
                  <h4>Need Help?</h4>
                  <p>Have questions about this lesson? Our support team is here to help.</p>
                  <button className="btn btn-outline btn-full">
                    <MessageSquare size={16} />
                    Ask a Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseLesson
