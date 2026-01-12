import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('=== 检查数据库数据 ===\n')

  try {
    // 1. 检查 profiles 表
    console.log('1. 检查 profiles 表:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nickname, username, avatar_url')
      .limit(5)
    
    if (profilesError) {
      console.error('  ❌ 查询 profiles 失败:', profilesError.message)
    } else {
      console.log('  ✅ profiles 数据:')
      profiles.forEach(p => {
        console.log(`     - ID: ${p.id}, 昵称: ${p.nickname || '无'}, 用户名: ${p.username || '无'}, 头像: ${p.avatar_url ? '有' : '无'}`)
      })
    }

    // 2. 检查 room_messages 表
    console.log('\n2. 检查 room_messages 表:')
    const { data: roomMessages, error: roomMessagesError } = await supabase
      .from('room_messages')
      .select('*')
      .limit(5)
    
    if (roomMessagesError) {
      console.error('  ❌ 查询 room_messages 失败:', roomMessagesError.message)
    } else {
      console.log('  ✅ room_messages 数据:')
      roomMessages.forEach(m => {
        console.log(`     - ID: ${m.id}, 房间ID: ${m.room_id}, 发送者ID: ${m.sender_id}, 内容: ${m.content.substring(0, 30)}...`)
      })
    }

    // 3. 检查 messages 表
    console.log('\n3. 检查 messages 表:')
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5)
    
    if (messagesError) {
      console.error('  ❌ 查询 messages 失败:', messagesError.message)
    } else {
      console.log('  ✅ messages 数据:')
      messages.forEach(m => {
        console.log(`     - ID: ${m.id}, 发送者ID: ${m.sender_id}, 接收者ID: ${m.receiver_id}, 内容: ${m.content.substring(0, 30)}...`)
      })
    }

    // 4. 检查 buddy_requests 表
    console.log('\n4. 检查 buddy_requests 表:')
    const { data: buddyRequests, error: buddyRequestsError } = await supabase
      .from('buddy_requests')
      .select('id, title, creator_id')
      .limit(5)
    
    if (buddyRequestsError) {
      console.error('  ❌ 查询 buddy_requests 失败:', buddyRequestsError.message)
    } else {
      console.log('  ✅ buddy_requests 数据:')
      buddyRequests.forEach(r => {
        console.log(`     - ID: ${r.id}, 标题: ${r.title}, 创建者ID: ${r.creator_id}`)
      })
    }

    // 5. 测试联表查询
    console.log('\n5. 测试联表查询 (room_messages + profiles):')
    const { data: joinedData, error: joinedError } = await supabase
      .from('room_messages')
      .select(`
        *,
        profiles (id, nickname, username, avatar_url)
      `)
      .limit(3)
    
    if (joinedError) {
      console.error('  ❌ 联表查询失败:', joinedError.message)
    } else {
      console.log('  ✅ 联表查询结果:')
      joinedData.forEach(m => {
        console.log(`     - 消息: ${m.content.substring(0, 30)}...`)
        console.log(`       发送者: ${JSON.stringify(m.profiles)}`)
      })
    }

  } catch (error) {
    console.error('❌ 检查失败:', error)
  }
}

checkDatabase()
