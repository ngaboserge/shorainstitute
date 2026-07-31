import { supabase } from './supabase'

/**
 * Validate an invitation token
 * Checks if token exists, not expired, and not already accepted
 */
export async function validateInvitationToken(token) {
  try {
    const { data: invitation, error } = await supabase
      .from('learner_invitations')
      .select(`
        *,
        institutions (
          id,
          name,
          total_seats,
          used_seats
        )
      `)
      .eq('invitation_token', token)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { valid: false, error: 'Invalid invitation token' }
      }
      throw error
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return { 
        valid: false, 
        error: 'This invitation has already been used',
        invitation 
      }
    }

    // Check if expired
    const expiresAt = new Date(invitation.expires_at)
    const now = new Date()
    if (expiresAt < now) {
      return { 
        valid: false, 
        error: 'This invitation has expired. Please contact your institution administrator.',
        invitation 
      }
    }

    // Check if cancelled
    if (invitation.status === 'cancelled') {
      return { 
        valid: false, 
        error: 'This invitation has been cancelled',
        invitation 
      }
    }

    return { valid: true, invitation }

  } catch (error) {
    console.error('Error validating invitation:', error)
    return { 
      valid: false, 
      error: 'An error occurred while validating the invitation' 
    }
  }
}

/**
 * Check if email already has a Supabase account
 */
export async function checkEmailExists(email) {
  try {
    // We can't directly check auth.users, but we can check if they can sign in
    // For now, we'll return false and let the user choose signup or login
    return { exists: false }
  } catch (error) {
    console.error('Error checking email:', error)
    return { exists: false }
  }
}

/**
 * Accept invitation and create institution learner
 * Called after user has signed up or logged in
 */
export async function acceptInvitation(invitationId, userId, userEmail, userName) {
  try {
    // Get invitation details
    const { data: invitation, error: invError } = await supabase
      .from('learner_invitations')
      .select('*, institutions(*)')
      .eq('id', invitationId)
      .single()

    if (invError) throw invError

    // Create institution_learner record with user data
    const { data: learner, error: learnerError } = await supabase
      .from('institution_learners')
      .insert({
        institution_id: invitation.institution_id,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        department_id: invitation.department_id,
        employee_id: invitation.employee_id,
        job_title: invitation.job_title,
        invitation_id: invitationId,
        invited_by: invitation.invited_by,
        status: 'active',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single()

    if (learnerError) {
      // Check if already exists
      if (learnerError.code === '23505') { // unique violation
        return {
          success: false,
          error: 'You are already a member of this institution'
        }
      }
      throw learnerError
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('learner_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (updateError) throw updateError

    return {
      success: true,
      learner,
      institution: invitation.institutions
    }

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return {
      success: false,
      error: error.message || 'Failed to accept invitation'
    }
  }
}

/**
 * Sign up a new user and accept invitation
 */
export async function signupAndAcceptInvitation(invitationData, password, fullName) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitationData.email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: 'learner'
        }
      }
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // 2. Accept invitation with user data
    const acceptResult = await acceptInvitation(
      invitationData.id, 
      authData.user.id,
      invitationData.email,
      fullName
    )

    if (!acceptResult.success) {
      return acceptResult
    }

    return {
      success: true,
      user: authData.user,
      institution: acceptResult.institution
    }

  } catch (error) {
    console.error('Error in signup and accept:', error)
    return {
      success: false,
      error: error.message || 'Failed to create account and accept invitation'
    }
  }
}

/**
 * Login existing user and accept invitation
 */
export async function loginAndAcceptInvitation(email, password, invitationId) {
  try {
    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Login failed')
    }

    // Get user's full name from metadata
    const fullName = authData.user.user_metadata?.full_name || 
                     authData.user.user_metadata?.name || 
                     email.split('@')[0]

    // 2. Accept invitation with user data
    const acceptResult = await acceptInvitation(
      invitationId, 
      authData.user.id,
      email,
      fullName
    )

    return acceptResult

  } catch (error) {
    console.error('Error in login and accept:', error)
    return {
      success: false,
      error: error.message || 'Failed to login and accept invitation'
    }
  }
}

/**
 * Resend invitation (admin function)
 */
export async function resendInvitation(invitationId) {
  try {
    const { data, error } = await supabase
      .from('learner_invitations')
      .update({
        reminder_sent_count: supabase.raw('reminder_sent_count + 1'),
        last_reminder_at: new Date().toISOString(),
        // Extend expiration by 7 days
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (error) throw error

    // TODO: Send email

    return { success: true, invitation: data }

  } catch (error) {
    console.error('Error resending invitation:', error)
    return {
      success: false,
      error: error.message || 'Failed to resend invitation'
    }
  }
}

/**
 * Cancel invitation (admin function)
 */
export async function cancelInvitation(invitationId) {
  try {
    const { data, error } = await supabase
      .from('learner_invitations')
      .update({
        status: 'cancelled'
      })
      .eq('id', invitationId)
      .eq('status', 'pending') // Only cancel pending invitations
      .select()
      .single()

    if (error) throw error

    return { success: true, invitation: data }

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel invitation'
    }
  }
}
