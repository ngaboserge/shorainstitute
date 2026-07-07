import React from 'react'
import { Link } from 'react-router-dom'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Certificates.css'

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      title: 'Financial Foundations',
      course: 'Financial Planning for Long-Term Wealth',
      issueDate: 'June 28, 2026',
      verificationId: 'SHORA-26-0001248',
      instructor: 'Alex Ntale',
      status: 'issued'
    },
    {
      id: 2,
      title: 'Investment Basics',
      course: 'Introduction to Investing',
      issueDate: 'May 15, 2026',
      verificationId: 'SHORA-26-0001247',
      instructor: 'Linda Umutoni',
      status: 'issued'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Certificates" 
          subtitle="View and download your earned certificates"
        />
        <div className="content-wrapper">
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
                    <div className="cert-name">Alex Ntale </div>
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

          <div className="card">
            <h3>Certificate Eligibility</h3>
            <div className="eligibility-list">
              <div className="eligibility-item">
                <CheckCircle size={20} color="#4caf50" />
                <div>
                  <div className="eligibility-title">Financial Planning Basics</div>
                  <div className="eligibility-status">Complete 2 more assessments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificates
