import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoles() {
  const roles = ['parent', 'beneficiary', 'specialist', 'tutor', 'admin']
  for (const r of roles) {
    console.log(`Testing role insertion: ${r}`)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-00000000000' + roles.indexOf(r),
        full_name: `Test ${r}`,
        role: r,
        email: `test_${r}@test.com`
      })

    if (error) {
      console.log(`❌ Role [${r}] FAILED:`, error.message)
    } else {
      console.log(`✅ Role [${r}] SUCCESS!`)
      // Clean up
      await supabase.from('profiles').delete().eq('id', '00000000-0000-0000-0000-00000000000' + roles.indexOf(r))
    }
  }
}

testRoles()
