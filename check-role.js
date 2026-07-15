import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRole() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    
  if (error) {
    console.error('Error fetching profiles:', error)
  } else {
    console.log('Profiles in DB:', data)
  }
}

checkRole()
