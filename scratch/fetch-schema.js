import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gljasqdpdqapfjznhdbt.supabase.co'
const supabaseKey = 'sb_publishable_Wcr-A2IzHRHjshIXHUCRNg_VmrBH99o'

async function fetchSchema() {
  console.log('Fetching database schema from Supabase OpenAPI spec...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`)
    }
    const schema = await response.json()
    
    // Parse tables and columns
    const tables = schema.definitions
    console.log('\n--- EXPOSED TABLES & COLUMNS ---')
    for (const tableName in tables) {
      console.log(`\nTable: ${tableName}`)
      const properties = tables[tableName].properties
      for (const colName in properties) {
        const col = properties[colName]
        console.log(` - ${colName}: ${col.type} ${col.format ? `(${col.format})` : ''}`)
      }
    }
  } catch (error) {
    console.error('Error fetching schema:', error.message)
  }
}

fetchSchema()
