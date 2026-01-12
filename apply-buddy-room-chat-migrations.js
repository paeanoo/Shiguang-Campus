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

async function applyMigrations() {
  console.log('Applying buddy room chat migrations...\n')

  try {
    // Migration 1: Add is_host field to buddy_request_members
    console.log('1. Adding is_host field to buddy_request_members table...')
    const migration1Path = join(process.cwd(), 'migrations', '20260116_add_is_host_to_buddy_members.sql')
    const migration1SQL = readFileSync(migration1Path, 'utf-8')
    
    console.log('⚠️  IMPORTANT: This migration needs to be executed manually!')
    console.log('\n' + '='.repeat(80))
    console.log('MIGRATION 1: Add is_host field')
    console.log('='.repeat(80))
    console.log(migration1SQL)
    console.log('='.repeat(80))

    // Migration 2: Fix room_messages foreign key
    console.log('\n2. Fixing room_messages table foreign key to reference buddy_requests...')
    const migration2Path = join(process.cwd(), 'migrations', '20260116_fix_room_messages_fk_to_buddy_requests.sql')
    const migration2SQL = readFileSync(migration2Path, 'utf-8')
    
    console.log('\n' + '='.repeat(80))
    console.log('MIGRATION 2: Fix room_messages foreign key')
    console.log('='.repeat(80))
    console.log(migration2SQL)
    console.log('='.repeat(80))

    console.log('\nTo apply these migrations:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above for each migration')
    console.log('4. Click "Run" to execute each migration')
    console.log('\nOr use psql command:')
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260116_add_is_host_to_buddy_members.sql`)
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260116_fix_room_messages_fk_to_buddy_requests.sql`)
    console.log('='.repeat(80) + '\n')

    // Test if the migrations work
    console.log('Testing if migrations are applied correctly...')
    
    // Test buddy_request_members has is_host column
    const { data: membersData, error: membersError } = await supabase
      .from('buddy_request_members')
      .select('*')
      .limit(1)
    
    if (membersError) {
      console.error('✗ Error accessing buddy_request_members:', membersError.message)
    } else {
      console.log('✓ buddy_request_members table is accessible')
      if (membersData && membersData.length > 0) {
        const hasIsHost = 'is_host' in membersData[0]
        if (hasIsHost) {
          console.log('✓ is_host column exists in buddy_request_members')
        } else {
          console.log('✗ is_host column not found in buddy_request_members - migration may not be applied')
        }
      }
    }

    // Test room_messages table
    const { data: roomsData, error: roomsError } = await supabase
      .from('room_messages')
      .select('*')
      .limit(1)
    
    if (roomsError) {
      console.error('✗ Error accessing room_messages:', roomsError.message)
    } else {
      console.log('✓ room_messages table is accessible')
    }

    // Test creating a room message
    const { data: testRequests, error: testRequestsError } = await supabase
      .from('buddy_requests')
      .select('id, title')
      .limit(1)
    
    if (testRequestsError) {
      console.error('✗ Error fetching buddy_requests:', testRequestsError.message)
    } else if (testRequests && testRequests.length > 0) {
      const testRequest = testRequests[0]
      console.log(`✓ Found test request: ${testRequest.title} (ID: ${testRequest.id})`)
      
      // Try to insert a test room message
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: insertError } = await supabase
          .from('room_messages')
          .insert([{
            room_id: testRequest.id,
            sender_id: user.id,
            content: '测试消息'
          }])
        
        if (insertError) {
          console.error('✗ Insert room message failed:', insertError.message)
          console.log('\nThe foreign key migration may not have been applied yet.')
          console.log('Please execute the SQL above in your Supabase dashboard.')
        } else {
          console.log('✓ Successfully inserted test room message')
          console.log('  The migrations are working correctly.')
          
          // Clean up test message
          await supabase
            .from('room_messages')
            .delete()
            .eq('content', '测试消息')
          
          console.log('✓ Cleaned up test message')
        }
      } else {
        console.log('⚠️  No authenticated user - skipping room message insert test')
      }
    } else {
      console.log('⚠️  No buddy_requests found - skipping room message insert test')
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyMigrations()
