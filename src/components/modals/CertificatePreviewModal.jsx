import React, { useState } from 'react'
import { X, Award, Download, Share2, Printer, Calendar, User, CheckCircle, FileText } from 'lucide-react'
import './Modal.css'

const CertificatePreviewModal = ({ isOpen, onClose, certificate }) => {
  const [activeTab, setActiveTab] = useState('preview')

  if (!isOpen || !certificate) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fdb714 0%, #ff9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={28} color="white" />
            </div>
            <div>
              <h2 style={{ marginBottom: '4px' }}>Certificate Preview</h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#666' }}>
                <span>{certificate.programme}</span>
                <span>•</span>
                <span>Issued: {certificate.issueDate}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Award size={16} />
            Certificate Preview
          </button>
          <button 
            className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FileText size={16} />
            Details
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div>
              {/* Certificate Preview */}
              <div style={{
                background: 'white',
                border: '2px solid #fdb714',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {/* Decorative corners */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  width: '40px',
                  height: '40px',
                  borderTop: '3px solid #fdb714',
                  borderLeft: '3px solid #fdb714'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  borderTop: '3px solid #fdb714',
                  borderRight: '3px solid #fdb714'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  width: '40px',
                  height: '40px',
                  borderBottom: '3px solid #fdb714',
                  borderLeft: '3px solid #fdb714'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  borderBottom: '3px solid #fdb714',
                  borderRight: '3px solid #fdb714'
                }}></div>

                {/* Logo placeholder */}
                <div style={{ marginBottom: '30px' }}>
                  <img 
                    src="/shora-logo.png" 
                    alt="Shora Institute"
                    style={{ height: '60px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div style={{ 
                    display: 'none', 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#0B4F9F' 
                  }}>
                    SHORA INSTITUTE
                  </div>
                </div>

                {/* Certificate title */}
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: '700',
                  color: '#0B4F9F',
                  marginBottom: '30px',
                  fontFamily: 'serif'
                }}>
                  Certificate of Completion
                </h1>

                {/* Award icon */}
                <div style={{ marginBottom: '30px' }}>
                  <Award size={80} color="#fdb714" style={{ strokeWidth: 1.5 }} />
                </div>

                {/* Text */}
                <p style={{
                  fontSize: '18px',
                  color: '#444',
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  This is to certify that
                </p>

                {/* Learner name */}
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#0B4F9F',
                  marginBottom: '30px',
                  fontFamily: 'serif',
                  borderBottom: '2px solid #fdb714',
                  display: 'inline-block',
                  padding: '0 40px 10px'
                }}>
                  {certificate.learnerName}
                </h2>

                {/* Programme details */}
                <p style={{
                  fontSize: '18px',
                  color: '#444',
                  marginBottom: '10px',
                  lineHeight: '1.8'
                }}>
                  has successfully completed the programme
                </p>

                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#0B4F9F',
                  marginBottom: '40px'
                }}>
                  {certificate.programme}
                </h3>

                {/* Date and ID */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '60px',
                  paddingTop: '30px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Issue Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#444' }}>
                      {certificate.issueDate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Certificate ID</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#444', fontFamily: 'monospace' }}>
                      {certificate.certificateId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Institution</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#444' }}>
                      {certificate.institution || 'Shora Institute'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons below certificate */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '12px', 
                marginTop: '32px' 
              }}>
                <button className="btn btn-outline">
                  <Printer size={16} />
                  Print Certificate
                </button>
                <button className="btn btn-outline">
                  <Share2 size={16} />
                  Share
                </button>
                <button className="btn btn-primary">
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div>
                  <div className="details-card" style={{ marginBottom: '20px' }}>
                    <h3 className="details-card-title">Learner Information</h3>
                    <div style={{ marginTop: '16px' }}>
                      <div className="detail-item">
                        <User size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Full Name</div>
                          <div className="detail-value">{certificate.learnerName}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FileText size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Employee ID</div>
                          <div className="detail-value">{certificate.employeeId}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <User size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Department</div>
                          <div className="detail-value">{certificate.department}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-card">
                    <h3 className="details-card-title">Programme Information</h3>
                    <div style={{ marginTop: '16px' }}>
                      <div className="detail-item">
                        <Award size={18} color="#fdb714" />
                        <div>
                          <div className="detail-label">Programme Name</div>
                          <div className="detail-value">{certificate.programme}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <CheckCircle size={18} color="#4caf50" />
                        <div>
                          <div className="detail-label">Completion Status</div>
                          <div className="detail-value">
                            <span className="badge success">Completed</span>
                          </div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Calendar size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Completion Date</div>
                          <div className="detail-value">{certificate.completionDate}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FileText size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Final Score</div>
                          <div className="detail-value">{certificate.finalScore}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="details-card" style={{ marginBottom: '20px' }}>
                    <h3 className="details-card-title">Certificate Details</h3>
                    <div style={{ marginTop: '16px' }}>
                      <div className="detail-item">
                        <Award size={18} color="#fdb714" />
                        <div>
                          <div className="detail-label">Certificate ID</div>
                          <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                            {certificate.certificateId}
                          </div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <Calendar size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Issue Date</div>
                          <div className="detail-value">{certificate.issueDate}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <CheckCircle size={18} color="#4caf50" />
                        <div>
                          <div className="detail-label">Verification Status</div>
                          <div className="detail-value">
                            <span className="badge success">Verified</span>
                          </div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FileText size={18} color="#0B4F9F" />
                        <div>
                          <div className="detail-label">Issuing Institution</div>
                          <div className="detail-value">
                            {certificate.institution || 'Shora Institute'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-card">
                    <h3 className="details-card-title">Programme Achievements</h3>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Courses Completed</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#0B4F9F' }}>
                          {certificate.coursesCompleted || 8} / {certificate.totalCourses || 8}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Assessments Passed</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>
                          {certificate.assessmentsPassed || 8} / {certificate.totalAssessments || 8}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Live Sessions Attended</span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#ff9800' }}>
                          {certificate.sessionsAttended || 6} / {certificate.totalSessions || 6}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0'
                      }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Overall Score</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#0B4F9F' }}>
                          {certificate.finalScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div className="info-box" style={{ marginTop: '20px' }}>
                    <strong>Certificate Verification</strong>
                    <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                      This certificate can be verified online using the certificate ID: 
                      <code style={{ 
                        display: 'block', 
                        marginTop: '8px', 
                        padding: '8px', 
                        background: '#f5f5f5', 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                      }}>
                        {certificate.certificateId}
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline">
              <Printer size={16} />
              Print
            </button>
            <button className="btn btn-outline">
              <Share2 size={16} />
              Share
            </button>
            <button className="btn btn-primary">
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificatePreviewModal
