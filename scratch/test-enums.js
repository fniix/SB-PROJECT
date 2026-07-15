import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'
const supabase = createClient(supabaseUrl, supabaseKey)

async function getEnumValues() {
  const { data, error } = await supabase.rpc('get_enum_values') // might not exist
  if (error) {
    // Let's run a raw query via a function if we can, or query a catalog table
    const { data: enumData, error: enumError } = await supabase
      .from('profiles')
      .select('role')
      .limit(1)
    console.log('Enum test query error:', enumError)
    
    // Let's try to query pg_enum using a standard select on a public view or table if mapped,
    // or try different values dynamically.
    const testRoles = ['student', 'child', 'specialist', 'tutor', 'parent', 'admin', 'specialist_profile']
    for (const r of testRoles) {
      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000009',
          full_name: 'Test',
          role: r,
          email: 'test_role@test.com'
        })
      if (insertErr && insertErr.message.includes('invalid input value for enum')) {
        console.log(`❌ Role [${r}] is NOT in the database enum.`)
      } else {
        console.log(`✅ Role [${r}] is IN the database enum! Error if any:`, insertErr?.message)
        await supabase.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000009')
      }
    }
  }
}

getEnumValues()
