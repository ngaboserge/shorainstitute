import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    const loginPath = requiredRole === 'learner' 
      ? '/auth/learner/login' 
      : '/auth/trainer/login'
    navigate(loginPath, { replace: true })
  }

  const goToDashboard = () => {
    if (profile?.role === 'trainer') {
      navigate('/trainer/dashboard', { replace: true })
    } else if (profile?.role === 'learner') {
      navigate('/learner/dashboard', { replace: true })
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="spinner-loader"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Not authenticated - redirect to appropriate login
  if (!user) {
    const loginPath = requiredRole === 'learner' 
      ? '/auth/learner/login' 
      : '/auth/trainer/login'
    return <Navigate to={loginPath} replace />
  }

  // Check role if specified
  if (requiredRole) {
    // If profile is still loading, wait
    if (profile === undefined) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="spinner-loader"></div>
          <p>Loading profile...</p>
        </div>
      )
    }
    
    // If profile doesn't exist or wrong role
    if (!profile || profile.role !== requiredRole) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px',
          padding: '40px',
          textAlign: 'center',
          background: '#f8f9fa'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              background: '#fee',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              🚫
            </div>
            <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>Access Denied</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>You don't have permission to access this page.</p>
            <div style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
              margin: '20px 0',
              fontSize: '14px'
            }}>
              <p style={{ margin: '4px 0' }}><strong>Required role:</strong> {requiredRole}</p>
              <p style={{ margin: '4px 0' }}><strong>Your role:</strong> {profile?.role || 'none'}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button 
                onClick={goToDashboard}
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                Go to My Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ minWidth: '140px' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // Authenticated and authorized
  return children
}

export default ProtectedRoute
