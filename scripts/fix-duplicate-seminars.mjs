import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ydldtedpcnpoeznhgsot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbGR0ZWRwY25wb2V6bmhnc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTE2NDgsImV4cCI6MjA5OTI2NzY0OH0.r8_LSrbDUqi_11LXEpUBjb4bAdxB-EHhdphvxuzsQGk'
)

async function fixDuplicates() {
  console.log('🔍 Fixing duplicate "Shora institute hybrid seminar" seminars...\n')
  
  // The OLD seminar with registrations (status: upcoming, created first)
  const oldSeminarId = '64223399-5ecf-460f-9024-dea68141d9a5'
  
  // The NEW seminar without registrations (status: published, created later)
  const newSeminarId = '9997ea9a-64f2-4fa9-9b28-251481f3651b'
  
  console.log('Step 1: Migrating registrations from old seminar to new seminar...')
  
  // Get all registrations from the old seminar
  const { data: registrations, error: fetchError } = await supabase
    .from('seminar_registrations')
    .select('*')
    .eq('seminar_id', oldSeminarId)
  
  if (fetchError) {
    console.error('❌ Error fetching registrations:', fetchError)
    return
  }
  
  console.log(`   Found ${registrations.length} registration(s) to migrate`)
  
  if (registrations.length > 0) {
    // Update all registrations to point to the new seminar
    for (const reg of registrations) {
      console.log(`   Migrating registration for ${reg.user_name}...`)
      
      const { error: updateError } = await supabase
        .from('seminar_registrations')
        .update({ seminar_id: newSeminarId })
        .eq('id', reg.id)
      
      if (updateError) {
        console.error(`   ❌ Error updating registration ${reg.id}:`, updateError)
      } else {
        console.log(`   ✅ Migrated registration for ${reg.user_name}`)
      }
    }
  }
  
  console.log('\nStep 2: Deleting old duplicate seminar...')
  
  const { error: deleteError } = await supabase
    .from('seminars')
    .delete()
    .eq('id', oldSeminarId)
  
  if (deleteError) {
    console.error('❌ Error deleting old seminar:', deleteError)
    return
  }
  
  console.log('✅ Old seminar deleted successfully')
  
  console.log('\nStep 3: Verifying the fix...')
  
  const { data: finalRegs, error: verifyError } = await supabase
    .from('seminar_registrations')
    .select('id, user_name, registration_status')
    .eq('seminar_id', newSeminarId)
  
  if (verifyError) {
    console.error('❌ Error verifying:', verifyError)
    return
  }
  
  console.log(`✅ New seminar now has ${finalRegs.length} registration(s):`)
  finalRegs.forEach(r => {
    console.log(`   - ${r.user_name} (${r.registration_status})`)
  })
  
  console.log('\n🎉 Fix complete! The trainer should now see all registrations.')
  console.log('\nNext steps:')
  console.log('1. Refresh the trainer dashboard')
  console.log('2. Click on "Registrations" for the seminar')
  console.log('3. The registrations should now appear')
}

fixDuplicates()
