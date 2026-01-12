import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestMessages() {
  console.log('=== 创建测试群聊消息 ===\n')

  try {
    // 1. 获取第一个搭子房间
    console.log('1. 获取搭子房间:')
    const { data: buddyRequests, error: buddyRequestsError } = await supabase
      .from('buddy_requests')
      .select('id, title, creator_id')
      .limit(1)
    
    if (buddyRequestsError) {
      console.error('  ❌ 获取房间失败:', buddyRequestsError.message)
      return
    }
    
    if (!buddyRequests || buddyRequests.length === 0) {
      console.log('  ⚠️  没有找到搭子房间')
      return
    }
    
    const room = buddyRequests[0]
    console.log(`  ✅ 找到房间: ID=${room.id}, 标题=${room.title}, 创建者=${room.creator_id}`)

    // 2. 获取一些用户
    console.log('\n2. 获取用户:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, nickname, avatar_url')
      .limit(3)
    
    if (profilesError) {
      console.error('  ❌ 获取用户失败:', profilesError.message)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('  ⚠️  没有找到用户')
      return
    }
    
    console.log(`  ✅ 找到 ${profiles.length} 个用户`)
    profiles.forEach(p => {
      console.log(`     - ID: ${p.id}, 昵称: ${p.nickname || p.username}`)
    })

    // 3. 创建测试消息
    console.log('\n3. 创建测试消息:')
    const testMessages = [
      { sender_id: profiles[0].id, content: '大家好！' },
      { sender_id: profiles[1 % profiles.length].id, content: '你好！' },
      { sender_id: profiles[2 % profiles.length].id, content: '这个活动很有意思' },
      { sender_id: profiles[0].id, content: '是的，一起来参加吧！' },
      { sender_id: profiles[1 % profiles.length].id, content: '好的，我加入' }
    ]

    for (let i = 0; i < testMessages.length; i++) {
      const msg = testMessages[i]
      const { data, error } = await supabase
        .from('room_messages')
        .insert([{
          room_id: room.id,
          sender_id: msg.sender_id,
          content: msg.content
        }])
        .select()
        .single()
      
      if (error) {
        console.error(`  ❌ 消息 ${i+1} 创建失败:`, error.message)
      } else {
        const sender = profiles.find(p => p.id === msg.sender_id)
        console.log(`  ✅ 消息 ${i+1} 创建成功: "${msg.content}" - 发送者: ${sender?.nickname || sender?.username}`)
      }
    }

    // 4. 验证消息
    console.log('\n4. 验证创建的消息:')
    const { data: messages, error: messagesError } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      console.error('  ❌ 查询消息失败:', messagesError.message)
    } else {
      console.log(`  ✅ 房间中共有 ${messages.length} 条消息`)
      messages.forEach(m => {
        const sender = profiles.find(p => p.id === m.sender_id)
        console.log(`     - ${sender?.nickname || sender?.username || '未知'}: ${m.content}`)
      })
    }

    console.log('\n✅ 测试消息创建完成！')
    console.log(`\n现在可以刷新页面，进入房间 ID ${room.id} 的群聊查看效果了。`)

  } catch (error) {
    console.error('❌ 创建测试消息失败:', error)
  }
}

createTestMessages()
