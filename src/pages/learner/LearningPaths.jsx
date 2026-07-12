import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Award, TrendingUp, Check, Lock, Play, Target } from 'lucide-react'
import ResponsiveLayout from '../../components/ResponsiveLayout'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './LearningPaths.css'

const LearningPaths = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [myPaths, setMyPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    if (user) {
      loadPaths()
      loadMyPaths()
    }
  }, [user])

  const loadPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          path_courses (count)
        `)
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaths(data || [])
    } catch (error) {
      console.error('Error loading paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('path_enrollments')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            category,
            level,
            estimated_duration_weeks,
            total_courses,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })

      if (error) throw error
      setMyPaths(data || [])
    } catch (error) {
      console.error('Error loading my paths:', error)
    }
  }

  const isEnrolled = (pathId) => {
    return myPaths.some(mp => mp.path_id === pathId)
  }

  const handleEnroll = async (pathId) => {
    try {
      // Check if already enrolled
      if (isEnrolled(pathId)) {
        alert('You are already enrolled in this path!')
        return
      }

      // Enroll
      const { error } = await supabase
        .from('path_enrollments')
        .insert({
          path_id: pathId,
          user_id: user.id,
          progress_percentage: 0,
          completed_courses: 0
        })

      if (error) throw error

      alert('✅ Successfully enrolled in learning path!')
      await loadMyPaths()
      setActiveTab('my-paths')
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('Failed to enroll. Please try again.')
    }
  }

  const handleViewPath = (pathId) => {
    navigate(`/learner/path/${pathId}`)
  }

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Learning Paths"
        subtitle="Loading..."
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title="Learning Paths"
      subtitle="Structured learning journeys to master financial topics"
      type="learner"
    >
          {/* Tabs */}
          <div className="tabs-nav-large">
            <button 
              className={`tab-btn-large ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              <BookOpen size={18} />
              Browse Paths
              <span className="tab-badge">{paths.length}</span>
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'my-paths' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-paths')}
            >
              <TrendingUp size={18} />
              My Paths
              <span className="tab-badge">{myPaths.length}</span>
            </button>
          </div>

          {/* Browse Paths */}
          {activeTab === 'browse' && (
            <div className="paths-grid">
              {paths.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <Target size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#666', marginBottom: '8px' }}>
                    No learning paths available yet
                  </h3>
                  <p style={{ color: '#999' }}>
                    Check back soon for structured learning journeys
                  </p>
                </div>
              ) : (
                paths.map((path) => {
                  const enrolled = isEnrolled(path.id)
                  return (
                    <div key={path.id} className="path-card">
                      {path.is_featured && (
                        <div className="featured-badge">Featured</div>
                      )}
                      
                      <div className="path-image">
                        {path.thumbnail_url ? (
                          <img src={path.thumbnail_url} alt={path.title} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '200px',
                            background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Target size={48} color="white" />
                          </div>
                        )}
                      </div>

                      <div className="path-content">
                        <div className="path-category">{path.category || 'General'}</div>
                        <h3 className="path-title">{path.title}</h3>
                        <p className="path-description">{path.description}</p>

                        <div className="path-meta">
                          <div className="meta-item">
                            <BookOpen size={16} />
                            <span>{path.total_courses || 0} courses</span>
                          </div>
                          <div className="meta-item">
                            <Clock size={16} />
                            <span>{path.estimated_duration_weeks || 0} weeks</span>
                          </div>
                          <div className="meta-item">
                            <Award size={16} />
                            <span>{path.level || 'All levels'}</span>
                          </div>
                        </div>

                        {enrolled ? (
                          <button 
                            className="btn btn-primary btn-full"
                            onClick={() => handleViewPath(path.id)}
                          >
                            <Play size={16} />
                            Continue Path
                          </button>
                        ) : (
                          <button 
                            className="btn btn-warning btn-full"
                            onClick={() => handleEnroll(path.id)}
                          >
                            Enroll Now
                          </button>
                        )}

                        {path.enrollment_count > 0 && (
                          <div className="enrollment-count">
                            {path.enrollment_count} learners enrolled
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* My Paths */}
          {activeTab === 'my-paths' && (
            <div className="my-paths-list">
              {myPaths.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <TrendingUp size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: '#666', marginBottom: '8px' }}>
                    You haven't enrolled in any paths yet
                  </h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>
                    Browse available paths and start your learning journey
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('browse')}
                  >
                    Browse Learning Paths
                  </button>
                </div>
              ) : (
                myPaths.map((enrollment) => {
                  const path = enrollment.learning_paths
                  if (!path) return null

                  return (
                    <div key={enrollment.id} className="my-path-item">
                      <div className="path-progress-ring">
                        <svg width="80" height="80">
                          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="36" 
                            fill="none" 
                            stroke="#0B4F9F" 
                            strokeWidth="6"
                            strokeDasharray={`${226 * enrollment.progress_percentage / 100} 226`}
                            transform="rotate(-90 40 40)"
                          />
                        </svg>
                        <div className="progress-text">{enrollment.progress_percentage || 0}%</div>
                      </div>

                      <div className="path-details">
                        <div className="path-category">{path.category}</div>
                        <h3>{path.title}</h3>
                        <p>{path.description}</p>

                        <div className="progress-info">
                          <span>
                            {enrollment.completed_courses || 0} of {path.total_courses || 0} courses completed
                          </span>
                        </div>

                        <div className="path-meta">
                          <div className="meta-item">
                            <Clock size={16} />
                            <span>{path.estimated_duration_weeks} weeks</span>
                          </div>
                          <div className="meta-item">
                            <Award size={16} />
                            <span>{path.level}</span>
                          </div>
                        </div>
                      </div>

                      <div className="path-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleViewPath(path.id)}
                        >
                          {enrollment.progress_percentage === 100 ? (
                            <>
                              <Check size={16} />
                              View Certificate
                            </>
                          ) : (
                            <>
                              <Play size={16} />
                              Continue Learning
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </ResponsiveLayout>
  )
}

export default LearningPaths
