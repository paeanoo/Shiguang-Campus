import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoomMessages() {
  console.log('=== 检查群聊消息数据 ===\n')

  try {
    // 1. 检查是否有房间消息
    console.log('1. 检查 room_messages 表:')
    const { data: roomMessages, error: roomMessagesError } = await supabase
      .from('room_messages')
      .select('*')
      .limit(10)
    
    if (roomMessagesError) {
      console.error('  ❌ 查询 room_messages 失败:', roomMessagesError.message)
    } else {
      console.log(`  ✅ 找到 ${roomMessages.length} 条消息`)
      if (roomMessages.length > 0) {
        roomMessages.forEach(m => {
          console.log(`     - ID: ${m.id}, 房间ID: ${m.room_id}, 发送者ID: ${m.sender_id}, 内容: ${m.content.substring(0, 30)}...`)
        })
      }
    }

    // 2. 如果有消息，检查发送者的 profile
    if (roomMessages && roomMessages.length > 0) {
      console.log('\n2. 检查发送者的 profiles:')
      const senderIds = [...new Set(roomMessages.map(m => m.sender_id))]
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, nickname, avatar_url')
        .in('id', senderIds)
      
      if (profilesError) {
        console.error('  ❌ 查询 profiles 失败:', profilesError.message)
      } else {
        console.log('  ✅ 发送者信息:')
        profiles.forEach(p => {
          console.log(`     - ID: ${p.id}, 昵称: ${p.nickname || '无'}, 用户名: ${p.username || '无'}, 头像: ${p.avatar_url ? '有' : '无'}`)
        })
      }

      // 3. 模拟前端的数据处理
      console.log('\n3. 模拟前端数据处理:')
      const profileById = {}
      profiles.forEach(p => { profileById[String(p.id)] = p })
      
      roomMessages.forEach(m => {
        const sender = profileById[String(m.sender_id)] || null
        console.log(`     消息: ${m.content.substring(0, 30)}...`)
        console.log(`       发送者ID: ${m.sender_id}`)
        console.log(`       发送者信息: ${sender ? JSON.stringify(sender) : '未找到'}`)
        console.log(`       显示名称: ${sender ? (sender.nickname || sender.username || '未知用户') : '未知用户'}`)
        console.log('')
      })
    }

    // 4. 检查 buddy_requests
    console.log('\n4. 检查 buddy_requests 表:')
    const { data: buddyRequests, error: buddyRequestsError } = await supabase
      .from('buddy_requests')
      .select('id, title, creator_id')
      .limit(5)
    
    if (buddyRequestsError) {
      console.error('  ❌ 查询 buddy_requests 失败:', buddyRequestsError.message)
    } else {
      console.log('  ✅ 搭子房间:')
      buddyRequests.forEach(r => {
        console.log(`     - ID: ${r.id}, 标题: ${r.title}, 创建者ID: ${r.creator_id}`)
      })
    }

  } catch (error) {
    console.error('❌ 检查失败:', error)
  }
}

checkRoomMessages()
