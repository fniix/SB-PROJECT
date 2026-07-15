import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  const tables = [
    'profiles',
    'parent_profiles',
    'beneficiaries',
    'tutor_profiles',
    'specialist_profiles',
    'specialist_applications',
    'bookings',
    'students'
  ]
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      console.log(`❌ Table [${t}] ERROR:`, error.message)
    } else {
      console.log(`✅ Table [${t}] EXISTS! Row count or data:`, data.length)
    }
  }
}

testTables()
