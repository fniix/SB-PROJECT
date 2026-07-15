import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase.from('profiles').select('id').limit(1)
  
  if (error) {
    console.error('ERROR connecting to Supabase:', error.message)
    console.error('Details:', error)
  } else {
    console.log('SUCCESS! Data:', data)
  }
}

test()
