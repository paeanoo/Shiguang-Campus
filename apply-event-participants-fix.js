import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function applyMigration() {
  console.log('Applying event participants fix migration...\n')

  try {
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'migrations', '20260114_fix_event_participants_display.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('Migration SQL loaded successfully')
    console.log('Executing migration...')

    // Note: Supabase client doesn't support executing arbitrary SQL directly
    // We need to use the SQL editor in Supabase dashboard or use psql
    // For now, let's print the SQL and provide instructions
    
    console.log('\n' + '='.repeat(80))
    console.log('MIGRATION SQL:')
    console.log('='.repeat(80))
    console.log(migrationSQL)
    console.log('='.repeat(80))
    console.log('\n⚠️  IMPORTANT: This migration needs to be executed manually!')
    console.log('\nTo apply this migration:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above')
    console.log('4. Click "Run" to execute')
    console.log('\nOr use psql command:')
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260114_fix_event_participants_display.sql`)
    console.log('='.repeat(80) + '\n')

    // Test if the fix would work by checking current state
    console.log('Testing current database state...')
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError.message)
    } else if (events && events.length > 0) {
      const eventId = events[0].id
      console.log(`Test event: ${events[0].title} (ID: ${eventId})`)
      
      const { data: registrations, error: regsError } = await supabase
        .from('event_registrations')
        .select('user_id, created_at')
        .eq('event_id', eventId)
        .limit(1)
      
      if (regsError) {
        console.error('✗ Current state: Cannot fetch registrations')
        console.error('  Error:', regsError.message)
        console.log('\nThis confirms the RLS policy issue. Please apply the migration above.')
      } else {
        console.log('✓ Current state: Can fetch registrations')
        console.log('  The migration may already be applied or the issue is fixed.')
      }
    } else {
      console.log('No events found in database')
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration()
