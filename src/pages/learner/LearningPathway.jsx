import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Lock, Play, Clock, Award, BookOpen, Target, ChevronRight, Download, MessageSquare } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './LearningPathway.css'

const LearningPathway = () => {
  const pathway = {
    name: 'Financial Foundations Beginner Track',
    description: 'Build essential financial knowledge and habits. Learn how money works, create a plan, and take confident first steps toward your financial future.',
    progress: 42,
    duration: '6-8 weeks',
    level: 'Beginner',
    format: 'Self-Paced + Live Sessions',
    certificate: true
  }

  const goals = [
    { text: 'Build a budget and stick to it', completed: true },
    { text: 'Save for emergencies', completed: true },
    { text: 'Start investing confidently', completed: false }
  ]

  const pathwaySteps = [
    { number: 1, title: 'Discover', subtitle: 'Understand the basics' },
    { number: 2, title: 'Assess', subtitle: 'Reflect and set your foundation' },
    { number: 3, title: 'Learn', subtitle: 'Build core knowledge' },
    { number: 4, title: 'Apply', subtitle: 'Practice in real scenarios' },
    { number: 5, title: 'Complete', subtitle: 'Consolidate and demonstrate' },
    { number: 6, title: 'Advance', subtitle: 'Advance your financial life' }
  ]

  const modules = [
    {
      number: 1,
      title: 'Welcome & The Money Mindset',
      subtitle: 'Explore how beliefs shape financial behavior and set the stage for your journey.',
      duration: '20 min',
      status: 'completed',
      lessons: 3
    },
    {
      number: 2,
      title: 'Your Financial Picture',
      subtitle: 'Assess your current financial life and define what matters most.',
      duration: '30 min',
      status: 'completed',
      lessons: 4
    },
    {
      number: 3,
      title: 'Budgeting Basics',
      subtitle: 'Learn simple frameworks and take control of your cash flow.',
      duration: '45 min',
      status: 'in-progress',
      progress: 60,
      lessons: 5,
      liveSeminar: {
        title: 'Budgeting Basics',
        date: 'May 24, 2025',
        time: '4:00 PM (EAT)',
        instructor: 'Sarah Kankindi, Financial Coach'
      }
    },
    {
      number: 4,
      title: 'Saving & Emergency Fund',
      subtitle: 'Build the habit of saving and prepare for life\'s uncertainties.',
      duration: '45 min',
      status: 'locked',
      lessons: 4
    },
    {
      number: 5,
      title: 'Understanding Debt',
      subtitle: 'Good debt vs. bad debt and how to manage what you owe.',
      duration: '45 min',
      status: 'locked',
      lessons: 4
    },
    {
      number: 6,
      title: 'Banking & Financial Services',
      subtitle: 'Navigate bank accounts, cards, and digital financial tools with confidence.',
      duration: '40 min',
      status: 'locked',
      lessons: 4
    }
  ]

  const guide = {
    name: 'Faith Umutoni',
    role: 'Learning Guide',
    title: 'SHORA Expert',
    bio: "I'm here to support you on your learning journey. Reach out anytime!"
  }

  const nextStep = {
    title: 'After Budgeting Basics, continue with Saving & Emergency Fund to strengthen your financial foundation.'
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Learning Pathway" 
          subtitle="Your personalized pathway to financial knowledge and lifelong wealth. Keep learning, applying, and growing—every step brings you closer to your goals."
        />
        <div className="content-wrapper">
          {/* Pathway Header */}
          <div className="pathway-header-card">
            <div className="pathway-header-content">
              <div className="pathway-badge">SELECTED PATHWAY</div>
              <h2 className="pathway-title">{pathway.name}</h2>
              <p className="pathway-description">{pathway.description}</p>
              
              <div className="pathway-meta-grid">
                <div className="pathway-meta-item">
                  <Clock size={18} />
                  <div>
                    <div className="meta-label">Estimated Duration</div>
                    <div className="meta-value">{pathway.duration}</div>
                  </div>
                </div>
                <div className="pathway-meta-item">
                  <Target size={18} />
                  <div>
                    <div className="meta-label">Level</div>
                    <div className="meta-value">{pathway.level}</div>
                  </div>
                </div>
                <div className="pathway-meta-item">
                  <BookOpen size={18} />
                  <div>
                    <div className="meta-label">Format</div>
                    <div className="meta-value">{pathway.format}</div>
                  </div>
                </div>
                <div className="pathway-meta-item">
                  <Award size={18} />
                  <div>
                    <div className="meta-label">Certificate</div>
                    <div className="meta-value">Yes + Digital Certificate</div>
                  </div>
                </div>
              </div>

              <div className="pathway-actions">
                <button className="btn btn-primary btn-lg">
                  Start Next Module →
                </button>
                <button className="btn btn-secondary">
                  <Download size={18} />
                  View Syllabus
                </button>
                <button className="btn btn-outline">
                  <MessageSquare size={18} />
                  Share Pathway
                </button>
              </div>
            </div>

            <div className="pathway-progress-visual">
              <div className="circular-progress">
                <svg width="180" height="180">
                  <circle cx="90" cy="90" r="75" fill="none" stroke="#e0e0e0" strokeWidth="12"/>
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="75" 
                    fill="none" 
                    stroke="#0B4F9F" 
                    strokeWidth="12"
                    strokeDasharray={`${471 * pathway.progress / 100} 471`}
                    transform="rotate(-90 90 90)"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="progress-center">
                  <div className="progress-percentage">{pathway.progress}%</div>
                  <div className="progress-label">Complete</div>
                </div>
              </div>
              <button className="btn btn-text save-later-btn">
                <span>🔖</span>
                Save for Later
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="pathway-grid">
            <div className="pathway-main">
              {/* Pathway Steps */}
              <div className="pathway-steps">
                <div className="pathway-step">
                  <div className="step-icon">
                    <Check size={16} />
                  </div>
                  <div className="step-content">
                    <div className="step-number">1</div>
                    <div className="step-title">Discover</div>
                    <div className="step-subtitle">Understand the basics</div>
                  </div>
                </div>
                <div className="step-connector"></div>
                <div className="pathway-step">
                  <div className="step-icon">
                    <Check size={16} />
                  </div>
                  <div className="step-content">
                    <div className="step-number">2</div>
                    <div className="step-title">Assess</div>
                    <div className="step-subtitle">Reflect and set your foundation</div>
                  </div>
                </div>
                <div className="step-connector active"></div>
                <div className="pathway-step active">
                  <div className="step-icon">
                    <Play size={16} fill="#0B4F9F" />
                  </div>
                  <div className="step-content">
                    <div className="step-number">3</div>
                    <div className="step-title">Learn</div>
                    <div className="step-subtitle">Build core knowledge</div>
                  </div>
                </div>
                <div className="step-connector"></div>
                <div className="pathway-step">
                  <div className="step-icon">
                    <div className="step-dot"></div>
                  </div>
                  <div className="step-content">
                    <div className="step-number">4</div>
                    <div className="step-title">Apply</div>
                    <div className="step-subtitle">Practice in real scenarios</div>
                  </div>
                </div>
                <div className="step-connector"></div>
                <div className="pathway-step">
                  <div className="step-icon">
                    <Lock size={16} />
                  </div>
                  <div className="step-content">
                    <div className="step-number">5</div>
                    <div className="step-title">Complete</div>
                    <div className="step-subtitle">Consolidate and demonstrate</div>
                  </div>
                </div>
                <div className="step-connector"></div>
                <div className="pathway-step">
                  <div className="step-icon">
                    <Lock size={16} />
                  </div>
                  <div className="step-content">
                    <div className="step-number">6</div>
                    <div className="step-title">Advance</div>
                    <div className="step-subtitle">Advance your financial life</div>
                  </div>
                </div>
              </div>

              {/* Pathway Modules */}
              <div className="card">
                <h3>Pathway Modules</h3>
                <p className="section-subtitle">5 of 12 completed</p>
                
                <div className="modules-list">
                  {modules.map((module) => (
                    <div key={module.number} className={`module-item ${module.status}`}>
                      <div className="module-number-badge">
                        {module.status === 'completed' ? (
                          <Check size={20} />
                        ) : module.status === 'locked' ? (
                          <Lock size={20} />
                        ) : (
                          <span>{module.number}</span>
                        )}
                      </div>
                      <div className="module-content">
                        <div className="module-header">
                          <h4 className="module-title">{module.title}</h4>
                          {module.status === 'in-progress' && (
                            <span className="progress-badge">In Progress</span>
                          )}
                        </div>
                        <p className="module-subtitle">{module.subtitle}</p>
                        <div className="module-meta">
                          <span><Clock size={14} /> {module.duration}</span>
                          <span>•</span>
                          <span>{module.lessons} lessons</span>
                        </div>
                        
                        {module.status === 'in-progress' && module.progress && (
                          <div className="module-progress">
                            <div className="progress-bar-thin">
                              <div className="progress-fill" style={{width: `${module.progress}%`}}></div>
                            </div>
                            <span className="progress-text">{module.progress}%</span>
                          </div>
                        )}

                        {module.liveSeminar && (
                          <div className="live-seminar-info">
                            <div className="seminar-icon">📅</div>
                            <div>
                              <div className="seminar-label">Includes Live Session with Invited Professional</div>
                              <div className="seminar-details">
                                {module.liveSeminar.date} • {module.liveSeminar.time}
                              </div>
                              <div className="seminar-instructor">{module.liveSeminar.instructor}</div>
                            </div>
                            <button className="btn btn-secondary btn-sm">
                              Add to Calendar
                            </button>
                          </div>
                        )}

                        {module.status === 'in-progress' && (
                          <Link to="/learner/courses" className="btn btn-primary btn-sm">
                            Continue
                          </Link>
                        )}
                        {module.status === 'locked' && (
                          <button className="btn btn-outline btn-sm" disabled>
                            <Lock size={14} />
                            Locked
                          </button>
                        )}
                        {module.status === 'completed' && (
                          <button className="btn btn-text btn-sm">
                            Start previous module
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="pathway-sidebar">
              {/* Your Learning Guide */}
              <div className="card">
                <h4>Your Learning Guide</h4>
                <div className="guide-profile">
                  <img src="https://i.pravatar.cc/80?img=5" alt={guide.name} />
                  <div className="guide-info">
                    <div className="guide-name">{guide.name}</div>
                    <div className="guide-role">{guide.role}</div>
                    <div className="guide-title">{guide.title}</div>
                  </div>
                </div>
                <p className="guide-bio">{guide.bio}</p>
                <button className="btn btn-secondary btn-full">
                  <MessageSquare size={16} />
                  Send a Message
                </button>
              </div>

              {/* Your Goals */}
              <div className="card">
                <div className="card-header-flex">
                  <h4>Your Goals</h4>
                  <button className="link-text">Edit Goals</button>
                </div>
                <div className="goals-list">
                  {goals.map((goal, idx) => (
                    <div key={idx} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                      <div className="goal-checkbox">
                        {goal.completed && <Check size={14} />}
                      </div>
                      <span>{goal.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div className="card next-step-card">
                <div className="next-step-icon">💡</div>
                <h4>Recommended Next Step</h4>
                <p>{nextStep.title}</p>
                <button className="btn btn-primary btn-full">
                  Start Next Module →
                </button>
              </div>

              {/* Upcoming Checkpoint Seminar */}
              <div className="card checkpoint-card">
                <div className="checkpoint-badge">• Live</div>
                <h4>Upcoming Checkpoint Seminar</h4>
                <div className="checkpoint-info">
                  <div className="checkpoint-date">
                    <div className="date-day">31</div>
                    <div className="date-month">MAY</div>
                  </div>
                  <div>
                    <div className="checkpoint-title">Financial Foundations Checkpoint</div>
                    <div className="checkpoint-time">
                      <strong>SATURDAY</strong><br/>
                      10:00 AM (EAT)
                    </div>
                    <div className="checkpoint-attendees">
                      <div className="attendees-avatars">
                        <img src="https://i.pravatar.cc/24?img=1" alt="" />
                        <img src="https://i.pravatar.cc/24?img=2" alt="" />
                        <img src="https://i.pravatar.cc/24?img=3" alt="" />
                      </div>
                      <span>+120 attending</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary btn-full">
                  Register Now →
                </button>
                <Link to="/learner/seminars" className="link-text-center">
                  View all live seminars
                </Link>
              </div>

              {/* Pathway Resources */}
              <div className="card">
                <h4>Pathway Resources</h4>
                <div className="resources-links">
                  <a href="#" className="resource-link">
                    <Download size={16} />
                    <span>Download Syllabus (PDF)</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="#" className="resource-link">
                    <BookOpen size={16} />
                    <span>Financial Foundations Toolkit</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPathway
