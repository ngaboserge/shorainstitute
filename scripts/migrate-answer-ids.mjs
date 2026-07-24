import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ydldtedpcnpoeznhgsot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkbGR0ZWRwY25wb2V6bmhnc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTE2NDgsImV4cCI6MjA5OTI2NzY0OH0.r8_LSrbDUqi_11LXEpUBjb4bAdxB-EHhdphvxuzsQGk'
)

async function migrateAnswerIds() {
  const seminarId = '9997ea9a-64f2-4fa9-9b28-251481f3651b'
  
  console.log('🔄 Migrating answer IDs to match current question IDs...\n')
  
  // ID mapping (old ID -> new ID)
  // Based on the similar question content
  const idMapping = {
    'q1784907288293': 'q1784908465665', // How did you hear about Shora
    'q1784907395058': 'q1784908525058', // How is your experience in investment
    'q1784907974248': 'q1784908634987'  // Skills/job related
  }
  
  // Get all registrations
  const { data: registrations, error: fetchError } = await supabase
    .from('seminar_registrations')
    .select('id, user_name, registration_answers')
    .eq('seminar_id', seminarId)
  
  if (fetchError) {
    console.error('❌ Error fetching registrations:', fetchError)
    return
  }
  
  console.log(`Found ${registrations.length} registration(s) to migrate\n`)
  
  for (const reg of registrations) {
    console.log(`Processing ${reg.user_name}...`)
    
    if (!reg.registration_answers || Object.keys(reg.registration_answers).length === 0) {
      console.log('  ⚠️  No answers to migrate')
      continue
    }
    
    const oldAnswers = reg.registration_answers
    const newAnswers = {}
    
    // Map old IDs to new IDs
    for (const [oldId, value] of Object.entries(oldAnswers)) {
      const newId = idMapping[oldId]
      if (newId) {
        newAnswers[newId] = value
        console.log(`  ✓ Mapped ${oldId} -> ${newId}: ${Array.isArray(value) ? `[${value.join(', ')}]` : value}`)
      } else {
        console.log(`  ⚠️  No mapping for ${oldId}, keeping as is`)
        newAnswers[oldId] = value
      }
    }
    
    // Update registration with new answer IDs
    const { error: updateError } = await supabase
      .from('seminar_registrations')
      .update({ registration_answers: newAnswers })
      .eq('id', reg.id)
    
    if (updateError) {
      console.error(`  ❌ Error updating ${reg.user_name}:`, updateError)
    } else {
      console.log(`  ✅ Updated ${reg.user_name}'s answers`)
    }
    console.log('')
  }
  
  console.log('🎉 Migration complete! Refresh the trainer dashboard to see answers.')
}

migrateAnswerIds()
