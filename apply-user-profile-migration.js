import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applyMigration() {
  console.log('Applying user profile fields migration...\n')

  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'migrations', '20260114_add_user_profile_fields.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('Migration SQL loaded successfully')
    console.log('⚠️  IMPORTANT: This migration needs to be executed manually!')
    console.log('\n' + '='.repeat(80))
    console.log('MIGRATION SQL:')
    console.log('='.repeat(80))
    console.log(migrationSQL)
    console.log('='.repeat(80))
    console.log('\nTo apply this migration:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above')
    console.log('4. Click "Run" to execute')
    console.log('\nOr use psql command:')
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260114_add_user_profile_fields.sql`)
    console.log('='.repeat(80) + '\n')

    // Test if the fields exist
    console.log('Testing database state...')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nickname, bio, location, website')
      .limit(1)
    
    if (profilesError) {
      console.error('✗ Error querying profiles table:', profilesError.message)
      console.log('\nThe migration may not have been applied yet.')
      console.log('Please execute the SQL above in your Supabase dashboard.')
    } else {
      console.log('✓ Successfully queried profiles table')
      console.log('  The migration appears to be applied.')
      
      if (profiles && profiles.length > 0) {
        const profile = profiles[0]
        console.log('\nSample profile data:')
        console.log(`  nickname: ${profile.nickname || 'not set'}`)
        console.log(`  bio: ${profile.bio || 'not set'}`)
        console.log(`  location: ${profile.location || 'not set'}`)
        console.log(`  website: ${profile.website || 'not set'}`)
      }
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration()
