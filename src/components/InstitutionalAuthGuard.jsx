import React from 'react'
import { Navigate } from 'react-router-dom'
import { useInstitutionalAuth } from '../hooks/useInstitutionalAuth'

/**
 * Protected route component for institutional pages
 * Redirects to login if user is not authenticated as institutional admin
 */
const InstitutionalAuthGuard = ({ children }) => {
  const { user, isInstitutionalAdmin, loading } = useInstitutionalAuth()

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0B4F9F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666' }}>Loading institutional portal...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Not authenticated - redirect to institutional login
  if (!user) {
    return <Navigate to="/auth/institutional/login" replace />
  }

  // Authenticated but not institutional admin
  if (!isInstitutionalAdmin) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        padding: '40px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#ffebee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px'
        }}>
          🔒
        </div>
        <h2 style={{ margin: 0, color: '#d32f2f' }}>Access Denied</h2>
        <p style={{ 
          margin: 0, 
          color: '#666', 
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          You don't have permission to access the institutional portal. 
          This area is restricted to Shora Institute administrators.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: '#0B4F9F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go to Homepage
          </button>
          <button
            onClick={() => window.location.href = '/learner'}
            style={{
              padding: '12px 24px',
              background: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go to Learner Portal
          </button>
        </div>
      </div>
    )
  }

  // Authenticated and is institutional admin - render children
  return <>{children}</>
}

export default InstitutionalAuthGuard
