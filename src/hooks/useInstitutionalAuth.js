import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for institutional authentication
 * Checks if the current user is an institutional admin for Shora Institute
 */
export const useInstitutionalAuth = () => {
  const [user, setUser] = useState(null)
  const [institution, setInstitution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInstitutionalAdmin, setIsInstitutionalAdmin] = useState(false)

  useEffect(() => {
    checkAuth()

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAuth()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setInstitution(null)
          setIsInstitutionalAdmin(false)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!currentUser) {
        setUser(null)
        setInstitution(null)
        setIsInstitutionalAdmin(false)
        return
      }

      setUser(currentUser)

      // Check if user is an institutional admin
      const { data: institutionData, error: institutionError } = await supabase
        .from('institutions')
        .select('*')
        .eq('admin_user_id', currentUser.id)
        .eq('status', 'active')
        .single()

      if (institutionError && institutionError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's okay, means not an admin
        console.error('Error checking institution:', institutionError)
      }

      if (institutionData) {
        setInstitution(institutionData)
        setIsInstitutionalAdmin(true)
      } else {
        setInstitution(null)
        setIsInstitutionalAdmin(false)
      }

    } catch (error) {
      console.error('Error in checkAuth:', error)
      setUser(null)
      setInstitution(null)
      setIsInstitutionalAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setInstitution(null)
    setIsInstitutionalAdmin(false)
  }

  return {
    user,
    institution,
    loading,
    isInstitutionalAdmin,
    signOut,
    refresh: checkAuth
  }
}

/**
 * Hook specifically for Shora Institute
 * Returns the Shora Institute ID
 */
export const useShoraInstitute = () => {
  const SHORA_INSTITUTE_ID = '00000000-0000-0000-0000-000000000001'
  
  return {
    institutionId: SHORA_INSTITUTE_ID,
    institutionName: 'Shora Institute'
  }
}
