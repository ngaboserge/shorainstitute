/**
 * Supabase Client Configuration
 * 
 * This file creates a connection to your Supabase backend.
 * Make sure you have:
 * 1. Created a Supabase project at https://supabase.com
 * 2. Added your API keys to the .env file
 * 3. Installed @supabase/supabase-js package
 */

import { createClient } from '@supabase/supabase-js'

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate credentials are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please make sure you have:')
  console.error('1. Created a .env file in the root directory')
  console.error('2. Added VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.error('3. Restarted your development server')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check connection
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) throw error
    console.log('✅ Connected to Supabase successfully!')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    return false
  }
}

// Export for convenience
export default supabase
