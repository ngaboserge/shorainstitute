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
 * Hook specifically for getting the current user's institution
 * Returns the actual institution ID from institution_admins table
 */
export const useShoraInstitute = () => {
  const [institutionId, setInstitutionId] = useState(null)
  const [institutionName, setInstitutionName] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstitution()
  }, [])

  const fetchInstitution = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Get institution from institution_admins table
      const { data, error } = await supabase
        .from('institution_admins')
        .select('institution_id, institutions(id, name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching institution:', error)
        // Fallback to checking institutions table directly
        const { data: instData, error: instError } = await supabase
          .from('institutions')
          .select('id, name')
          .eq('admin_user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!instError && instData) {
          setInstitutionId(instData.id)
          setInstitutionName(instData.name)
          console.log('✅ Loaded institution from fallback:', instData.name, instData.id)
        } else {
          console.error('❌ No institution found for user')
        }
      } else if (data) {
        setInstitutionId(data.institution_id)
        setInstitutionName(data.institutions.name)
        console.log('✅ Loaded institution from institution_admins:', data.institutions.name, data.institution_id)
      }

    } catch (err) {
      console.error('Error in useShoraInstitute:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    institutionId,
    institutionName,
    loading
  }
}
