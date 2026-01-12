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
  console.log('Applying event_registrations RLS fix migration...\n')

  try {
    const migrationPath = join(process.cwd(), 'migrations', '20260114_fix_event_registrations_rls.sql')
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
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260114_fix_event_registrations_rls.sql`)
    console.log('='.repeat(80) + '\n')

    // Test if the fix works
    console.log('Testing if RLS policies allow insert...')
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
    
    if (eventsError) {
      console.error('✗ Error fetching events:', eventsError.message)
      return
    }

    if (events && events.length > 0) {
      const event = events[0]
      console.log(`Using event: ${event.title} (ID: ${event.id})`)
      
      // Try to insert a test registration
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profilesError) {
        console.error('✗ Error fetching profiles:', profilesError.message)
        return
      }

      if (profiles && profiles.length > 0) {
        const { error: insertError } = await supabase
          .from('event_registrations')
          .insert([{
            event_id: event.id,
            user_id: profiles[0].id,
            created_at: new Date().toISOString()
          }])
        
        if (insertError) {
          console.error('✗ Insert still blocked by RLS policy:', insertError.message)
          console.log('\nThe migration may not have been applied yet.')
          console.log('Please execute the SQL above in your Supabase dashboard.')
        } else {
          console.log('✓ Successfully inserted test registration')
          console.log('  The RLS policies are working correctly.')
          
          // Clean up test registration
          await supabase
            .from('event_registrations')
            .delete()
            .eq('event_id', event.id)
            .eq('user_id', profiles[0].id)
          
          console.log('✓ Cleaned up test registration')
        }
      }
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigration()
