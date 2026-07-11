import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Certificates.css'

const Certificates = () => {
  const { user, profile } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [eligibleCourses, setEligibleCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadCertificates()
    }
  }, [user?.id])

  const loadCertificates = async () => {
    try {
      // Load completed courses (certificates)
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            instructor_name,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Completed courses = certificates
      const completed = enrollments?.filter(e => e.completion_percentage === 100).map(e => ({
        id: e.id,
        title: e.courses.title,
        course: e.courses.title,
        issueDate: new Date(e.completed_at || e.enrolled_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        verificationId: `SHORA-${new Date().getFullYear()}-${e.id.split('-')[0].toUpperCase()}`,
        instructor: e.courses.instructor_name || 'SHORA Institute',
        status: 'issued'
      })) || []

      // In-progress courses eligible for certificate
      const inProgress = enrollments?.filter(e => 
        e.completion_percentage > 0 && e.completion_percentage < 100
      ).map(e => ({
        id: e.courses.id,
        title: e.courses.title,
        progress: e.completion_percentage,
        remaining: 100 - e.completion_percentage
      })) || []

      setCertificates(completed)
      setEligibleCourses(inProgress)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="learner" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading certificates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Certificates" 
          subtitle="View and download your earned certificates"
        />
        <div className="content-wrapper">
          {certificates.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Award size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#666', marginBottom: '8px' }}>No certificates yet</h3>
              <p style={{ color: '#999', marginBottom: '24px' }}>
                Complete courses to earn certificates
              </p>
              <Link to="/learner/courses" className="btn btn-primary">
                Browse My Courses
              </Link>
            </div>
          ) : (
            <div className="certificates-grid">
              {certificates.map((cert) => (
                <div key={cert.id} className="certificate-card">
                  <div className="certificate-preview">
                    <div className="cert-badge">
                      <Award size={48} color="#FDB714" />
                    </div>
                    <div className="cert-frame">
                      <div className="cert-logo">SHORA</div>
                      <h3>CERTIFICATE</h3>
                      <p>OF COMPLETION</p>
                      <div className="cert-name">{profile?.full_name || 'Learner'}</div>
                      <div className="cert-course">{cert.course}</div>
                      <div className="cert-date">{cert.issueDate}</div>
                      <div className="cert-sig">
                        <div className="sig-line"></div>
                        <div className="sig-name">{cert.instructor}</div>
                      </div>
                    </div>
                  </div>
                  <div className="certificate-info">
                    <h4>{cert.title}</h4>
                    <p>Issued on {cert.issueDate}</p>
                    <div className="verification-id">ID: {cert.verificationId}</div>
                    <div className="cert-actions">
                      <button className="btn btn-primary btn-sm">
                        <Download size={16} />
                        Download
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {eligibleCourses.length > 0 && (
            <div className="card" style={{ marginTop: '32px' }}>
              <h3>Certificate Eligibility</h3>
              <div className="eligibility-list">
                {eligibleCourses.map((course) => (
                  <div key={course.id} className="eligibility-item">
                    <CheckCircle size={20} color="#FDB714" />
                    <div>
                      <div className="eligibility-title">{course.title}</div>
                      <div className="eligibility-status">
                        {course.progress}% complete - {course.remaining}% remaining
                      </div>
                    </div>
                    <Link 
                      to={`/learner/courses`} 
                      className="btn btn-sm btn-outline"
                    >
                      Continue Learning
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Certificates
