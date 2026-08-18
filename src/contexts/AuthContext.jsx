import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId) => {
    try {
      // Get user data from database (includes all profile fields)
      const { data: dbProfile, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (dbError) {
        console.error('Error fetching profile from DB:', dbError)
        // Fallback to auth metadata if DB fetch fails
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const profileFromAuth = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'learner',
            avatar_url: authUser.user_metadata?.avatar_url,
            created_at: authUser.created_at
          }
          setProfile(profileFromAuth)
        } else {
          setProfile(null)
        }
      } else if (dbProfile) {
        // Use full profile from database (includes all custom fields including contact_email)
        setProfile(dbProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  const signUp = async (email, password, fullName, role = 'trainer') => {
    try {
      // 1. Sign up with Supabase Auth (disable email confirmation)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          },
          emailRedirectTo: undefined // Disable email confirmation for development
        }
      })

      if (signUpError) throw signUpError

      if (!authData.user) {
        throw new Error('Signup failed - no user returned')
      }

      // 2. Create user profile manually (trigger might not fire immediately)
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail signup if profile creation fails - trigger will handle it
      }

      return { user: authData.user, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear local state even if signOut fails
      setUser(null)
      setProfile(null)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      await loadUserProfile(user.id)
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return
    await loadUserProfile(user.id)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user,
    isTrainer: profile?.role === 'trainer',
    isLearner: profile?.role === 'learner',
    isAdmin: profile?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
