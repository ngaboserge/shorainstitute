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
        console.log('Auth event:', event)
        
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
      console.log('Loading profile for user:', userId)
      
      // Try to get profile from users table first
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
      }

      // If profile exists in users table, use it
      if (data) {
        console.log('Profile loaded from users table:', data)
        setProfile(data)
        return
      }

      // Fallback: get user data from auth.users metadata
      console.log('Profile not in users table, checking auth metadata')
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Create profile from auth metadata
        const profileFromAuth = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: authUser.user_metadata?.role || 'learner',
          avatar_url: authUser.user_metadata?.avatar_url,
          created_at: authUser.created_at
        }
        console.log('Profile created from auth metadata:', profileFromAuth)
        setProfile(profileFromAuth)
        
        // Note: Not saving to users table as it has role constraints that don't support all role types
        // Auth metadata is the source of truth
      } else {
        console.log('No auth user found')
        setProfile(null)
      }
    } catch (error) {
      console.error('Exception loading profile:', error)
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
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setProfile(null)
      
      console.log('✅ Successfully logged out')
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
