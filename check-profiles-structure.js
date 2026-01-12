import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProfilesStructure() {
  console.log('Checking profiles table structure...\n')

  try {
    // Get a sample profile
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('Error querying profiles:', profilesError.message)
      console.error('Full error:', JSON.stringify(profilesError, null, 2))
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found in database')
      return
    }

    const profile = profiles[0]
    console.log('Sample profile data:')
    console.log('  Available fields:', Object.keys(profile).join(', '))
    console.log('\n  Profile details:')
    for (const [key, value] of Object.entries(profile)) {
      console.log(`    ${key}: ${value}`)
    }

    // Check specific fields
    console.log('\n  Field checks:')
    console.log(`    id: ${profile.id ? '✓' : '✗'}`)
    console.log(`    email: ${profile.email ? '✓' : '✗'}`)
    console.log(`    username: ${profile.username ? '✓' : '✗'}`)
    console.log(`    nickname: ${profile.nickname ? '✓' : '✗'}`)
    console.log(`    avatar_url: ${profile.avatar_url ? '✓' : '✗'}`)
    console.log(`    coins: ${profile.coins !== undefined ? '✓' : '✗'}`)
    console.log(`    carbon_reduced: ${profile.carbon_reduced !== undefined ? '✓' : '✗'}`)
    console.log(`    bio: ${profile.bio ? '✓' : '✗'}`)
    console.log(`    location: ${profile.location ? '✓' : '✗'}`)
    console.log(`    website: ${profile.website ? '✓' : '✗'}`)
    console.log(`    created_at: ${profile.created_at ? '✓' : '✗'}`)

    // Test querying with specific fields
    console.log('\n2. Testing query with specific fields...')
    const { data: testProfiles, error: testError } = await supabase
      .from('profiles')
      .select('id, nickname, username, avatar_url, coins, carbon_reduced, bio, location')
      .limit(1)
    
    if (testError) {
      console.error('  ✗ Error querying with specific fields:', testError.message)
      console.error('  Full error:', JSON.stringify(testError, null, 2))
    } else {
      console.log('  ✓ Successfully queried with specific fields')
      if (testProfiles && testProfiles.length > 0) {
        const tp = testProfiles[0]
        console.log('  Sample result:')
        console.log(`    id: ${tp.id}`)
        console.log(`    nickname: ${tp.nickname || 'NULL'}`)
        console.log(`    username: ${tp.username || 'NULL'}`)
        console.log(`    avatar_url: ${tp.avatar_url || 'NULL'}`)
      }
    }

    // Test event_registrations
    console.log('\n3. Testing event_registrations query...')
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title')
      .limit(1)
    
    if (eventsError) {
      console.error('  ✗ Error querying events:', eventsError.message)
    } else if (events && events.length > 0) {
      const eventId = events[0].id
      console.log(`  Using event: ${events[0].title} (ID: ${eventId})`)
      
      const { data: regs, error: regsError } = await supabase
        .from('event_registrations')
        .select('user_id, created_at')
        .eq('event_id', eventId)
        .limit(5)
      
      if (regsError) {
        console.error('  ✗ Error querying event_registrations:', regsError.message)
        console.error('  Full error:', JSON.stringify(regsError, null, 2))
      } else {
        console.log(`  ✓ Successfully queried event_registrations`)
        console.log(`  Found ${regs?.length || 0} registrations`)
        
        if (regs && regs.length > 0) {
          const userIds = regs.map(r => r.user_id)
          console.log(`  User IDs: ${userIds.join(', ')}`)
          
          // Test querying profiles for these users
          console.log('\n4. Testing profiles query for event participants...')
          const { data: participantProfiles, error: participantError } = await supabase
            .from('profiles')
            .select('id, nickname, username, avatar_url, coins, carbon_reduced, bio, location')
            .in('id', userIds)
          
          if (participantError) {
            console.error('  ✗ Error querying participant profiles:', participantError.message)
            console.error('  Full error:', JSON.stringify(participantError, null, 2))
          } else {
            console.log(`  ✓ Successfully queried participant profiles`)
            console.log(`  Found ${participantProfiles?.length || 0} profiles`)
            
            if (participantProfiles && participantProfiles.length > 0) {
              participantProfiles.forEach((p, i) => {
                console.log(`\n  Participant ${i + 1}:`)
                console.log(`    id: ${p.id}`)
                console.log(`    nickname: ${p.nickname || 'NULL'}`)
                console.log(`    username: ${p.username || 'NULL'}`)
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

  } catch (error) {
    console.error('Test failed:', error)
  }
}

checkProfilesStructure()
