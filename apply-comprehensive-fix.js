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

async function applyComprehensiveFix() {
  console.log('Applying comprehensive fix for user display and chat features...\n')

  try {
    const migrationPath = join(process.cwd(), 'migrations', '20260114_comprehensive_fix.sql')
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
    console.log(`psql -h ${new URL(supabaseUrl).hostname} -U postgres -d postgres -f migrations/20260114_comprehensive_fix.sql`)
    console.log('='.repeat(80) + '\n')

    // Test if fix works
    console.log('Testing if fix works...')
    
    // Test 1: Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, nickname, avatar_url, coins, carbon_reduced, bio, location')
      .limit(1)
    
    if (profilesError) {
      console.error('✗ Error querying profiles:', profilesError.message)
    } else if (profiles && profiles.length > 0) {
      const p = profiles[0]
      console.log('\n✓ Profiles query successful')
      console.log('  Sample profile:')
      console.log(`    username: ${p.username || 'NULL'}`)
      console.log(`    nickname: ${p.nickname || 'NULL'}`)
      console.log(`    avatar_url: ${p.avatar_url || 'NULL'}`)
    }

    // Test 2: Check event_registrations
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
    
    if (eventsError) {
      console.error('✗ Error querying events:', eventsError.message)
    } else if (events && events.length > 0) {
      const event = events[0]
      console.log(`\n✓ Events query successful`)
      console.log(`  Using event: ${event.title} (ID: ${event.id})`)
      
      const { data: registrations, error: regsError } = await supabase
        .from('event_registrations')
        .select('user_id, created_at')
        .eq('event_id', event.id)
        .limit(5)
      
      if (regsError) {
        console.error('✗ Error querying event_registrations:', regsError.message)
      } else {
        console.log(`\n✓ Event_registrations query successful`)
        console.log(`  Found ${registrations?.length || 0} registrations`)
        
        if (registrations && registrations.length > 0) {
          const userIds = registrations.map(r => r.user_id)
          console.log(`  User IDs: ${userIds.join(', ')}`)
          
          // Test 3: Query profiles for participants
          const { data: participantProfiles, error: participantError } = await supabase
            .from('profiles')
            .select('id, username, nickname, avatar_url, coins, carbon_reduced, bio, location')
            .in('id', userIds)
          
          if (participantError) {
            console.error('✗ Error querying participant profiles:', participantError.message)
          } else {
            console.log(`\n✓ Participant profiles query successful`)
            console.log(`  Found ${participantProfiles?.length || 0} profiles`)
            
            if (participantProfiles && participantProfiles.length > 0) {
              participantProfiles.forEach((p, i) => {
                console.log(`\n  Participant ${i + 1}:`)
                console.log(`    id: ${p.id}`)
                console.log(`    username: ${p.username || 'NULL'}`)
                console.log(`    nickname: ${p.nickname || 'NULL'}`)
                console.log(`    avatar_url: ${p.avatar_url || 'NULL'}`)
                console.log(`    coins: ${p.coins || 'NULL'}`)
                console.log(`    carbon_reduced: ${p.carbon_reduced || 'NULL'}`)
                console.log(`    bio: ${p.bio || 'NULL'}`)
                console.log(`    location: ${p.location || 'NULL'}`)
              })
            }
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80))
    console.log('SUMMARY:')
    console.log('='.repeat(80))
    console.log('The comprehensive migration includes:')
    console.log('  1. Add nickname, bio, location, website fields to profiles table')
    console.log('  2. Update RLS policies for profiles table')
    console.log('  3. Fix RLS policies for event_registrations table')
    console.log('  4. Set nicknames for existing users (nickname = username)')
    console.log('  5. Add all users as participants to the first event')
    console.log('\nAfter executing the migration:')
    console.log('  ✓ Users will have nicknames (same as username)')
    console.log('  ✓ Event will have participants')
    console.log('  ✓ User avatars will display correctly')
    console.log('  ✓ Clicking avatars will show user details')
    console.log('  ✓ Private chat will work')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

applyComprehensiveFix()
