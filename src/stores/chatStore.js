import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@lib/supabase'

export const useChatStore = defineStore('chat', () => {
  const isChatOpen = ref(false)
  const currentChatUser = ref(null)
  const currentRoom = ref(null)
  const conversations = ref([])
  const messages = ref([])
  let subscription = null

  async function loadConversations() {
    try {
      const res = await supabase.auth.getUser()
      const me = res?.data?.user
      // 调试日志：记录当前会话加载时的登录用户 ID，便于排查“所有用户共用消息中心”问题
      try {
        console.log('[chatStore] loadConversations - current user id:', me?.id)
      } catch (e) { /* ignore logging errors */ }
      if (!me) return

      // Fetch private messages where user is sender OR receiver (do NOT use FK-based joins)
      const privateRes = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${me.id},receiver_id.eq.${me.id}`)
        .order('created_at', { ascending: false })
        .limit(500)
      let privateMessages = privateRes.data || []
      const privateError = privateRes.error
      if (privateError) {
        console.warn('loadConversations private fetch error - proceeding with empty privateMessages', privateError)
        // degrade gracefully if messages table or permissions are not present
        privateMessages = []
      }

      // Attach sender/receiver profiles manually to avoid reliance on FK relationship naming
      const userIdsSet = new Set()
      for (const m of privateMessages || []) {
        if (m.sender_id) userIdsSet.add(m.sender_id)
        if (m.receiver_id) userIdsSet.add(m.receiver_id)
      }
      const userIds = Array.from(userIdsSet)
      let profileById = {}
      if (userIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
          .select('id, nickname, username, avatar_url')
            .in('id', userIds)
          profileById = {}
          ;(profiles || []).forEach(p => { profileById[String(p.id)] = p })
          for (const m of privateMessages || []) {
            m.sender = profileById[String(m.sender_id)] || null
            m.receiver = profileById[String(m.receiver_id)] || null
          }
        } catch (e) {
          console.warn('Failed to fetch profiles for messages', e)
        }
      }

      // Fetch room messages (group chats) only for rooms the user is a member of
      let roomMessages = []
      try {
        const { data: memberRows, error: memberErr } = await supabase
          .from('buddy_request_members')
          .select('request_id')
          .eq('user_id', me.id)
        if (memberErr) {
          console.warn('loadConversations failed to fetch buddy_request_members - proceeding with empty roomMessages', memberErr)
        } else {
          const memberRoomIds = (memberRows || []).map(r => r.request_id).filter(Boolean)
          if (memberRoomIds.length > 0) {
            const roomRes = await supabase
              .from('room_messages')
              .select('*')
              .in('room_id', memberRoomIds)
              .order('created_at', { ascending: false })
              .limit(200)
            roomMessages = roomRes.data || []
            if (roomRes.error) {
              console.warn('loadConversations room fetch error - proceeding with empty roomMessages', roomRes.error)
              roomMessages = []
            }
          } else {
            // user is not a member of any rooms
            roomMessages = []
          }
        }
      } catch (e) {
        console.warn('loadConversations room fetch failed', e)
        roomMessages = []
      }
      const roomError = null
      if (roomError) {
        // noop - kept for compatibility
      } else {
        // Attach room metadata (title, creator_id) by fetching buddy_requests separately
        try {
          const roomIds = Array.from(new Set(roomMessages.map(rm => rm.room_id).filter(Boolean)))
          if (roomIds.length > 0) {
            const { data: roomsData, error: roomsErr } = await supabase
              .from('buddy_requests')
              .select('id, title, creator_id')
              .in('id', roomIds)
            if (!roomsErr && roomsData) {
              const roomsById = {}
              roomsData.forEach(r => { roomsById[r.id] = r })
              roomMessages = roomMessages.map(m => ({ ...m, room: roomsById[m.room_id] || null }))
              // Attach sender profiles for room messages so conversation lastMessage shows real user info
              const roomSenderIds = Array.from(new Set(roomMessages.map(rm => rm.sender_id).filter(Boolean)))
              if (roomSenderIds.length > 0) {
                try {
                  const { data: roomProfiles } = await supabase
                    .from('profiles')
                    .select('id, nickname, username, avatar_url')
                    .in('id', roomSenderIds)
                  const roomProfileById = {}
                  ;(roomProfiles || []).forEach(p => { roomProfileById[String(p.id)] = p })
                  roomMessages = roomMessages.map(m => ({ ...m, sender: roomProfileById[String(m.sender_id)] || null }))
                } catch (e) {
                  console.warn('Failed to fetch profiles for roomMessages', e)
                }
              }
            } else {
              console.warn('failed to fetch buddy_requests for room messages', roomsErr)
              roomMessages = roomMessages.map(m => ({ ...m, room: null }))
            }
          } else {
            roomMessages = roomMessages.map(m => ({ ...m, room: null }))
          }
        } catch (e) {
          console.warn('attach room metadata failed', e)
          roomMessages = roomMessages.map(m => ({ ...m, room: null }))
        }
      }

      // Group private messages by partner
      const privateMap = new Map()
      for (const m of privateMessages || []) {
        const partnerId = m.sender_id === me.id ? m.receiver_id : m.sender_id
        const partnerProfile = m.sender_id === me.id ? m.receiver : m.sender

        if (!partnerId) continue

        // If not exists, add conversation with latest message
        if (!privateMap.has(partnerId)) {
          privateMap.set(partnerId, {
            id: `private-${partnerId}`,
            type: 'private',
            user: partnerProfile || { id: partnerId },
            lastMessage: m,
            unread: 0
          })
        } else {
          // ensure lastMessage is the newest
          const existing = privateMap.get(partnerId)
          if (!existing.lastMessage || new Date(m.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = m
          }
        }
      }

      // Group room messages by room_id
      const roomMap = new Map()
      for (const m of roomMessages || []) {
        const rid = m.room_id
        if (!rid) continue
        if (!roomMap.has(rid)) {
          roomMap.set(rid, {
            id: `room-${rid}`,
            type: 'room',
            room: m.room,
            lastMessage: m,
            unread: 0
          })
        } else {
          const existing = roomMap.get(rid)
          if (!existing.lastMessage || new Date(m.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = m
          }
        }
      }

      // Merge and sort by newest message
      const all = [...privateMap.values(), ...roomMap.values()]
      all.sort((a, b) => {
        const ta = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0
        const tb = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0
        return tb - ta
      })
      // Ensure any partner users without profile data are fetched
      const missingProfileIds = []
      for (const p of privateMap.values()) {
        if (p.type === 'private' && (!p.user || !p.user.id || (!p.user.nickname && !p.user.avatar_url))) {
          const uid = p.user?.id
          if (uid) missingProfileIds.push(uid)
        }
      }
      if (missingProfileIds.length > 0) {
        try {
          const { data: fetchedProfiles } = await supabase
            .from('profiles')
            .select('id, nickname, username, avatar_url')
            .in('id', missingProfileIds)
          const profileById = {}
          ;(fetchedProfiles || []).forEach(pr => { profileById[String(pr.id)] = pr })
          for (const p of privateMap.values()) {
            const uid = p.user?.id
            if (uid && (!p.user.nickname || !p.user.avatar_url)) {
              const pr = profileById[String(uid)]
              if (pr) p.user = { ...p.user, ...pr }
            }
          }
        } catch (e) {
          // ignore profile fetch errors, conversations still usable
          console.warn('loadConversations profile fetch failed', e)
        }
      }

      conversations.value = all
    } catch (err) {
      console.error('loadConversations error', err)
    }
  }

  async function loadMessages(partnerId) {
    try {
      const res = await supabase.auth.getUser()
      const me = res?.data?.user
      try { console.log('[chatStore] loadMessages - partnerId:', partnerId, 'currentUser:', me?.id) } catch (e) {}
      if (!me) return
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${me.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${me.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      try { console.log('[chatStore] loadMessages - fetched messages count:', (data || []).length) } catch (e) {}

      // attach profiles
      const idSet = new Set()
      for (const m of data || []) {
        if (m.sender_id) idSet.add(m.sender_id)
        if (m.receiver_id) idSet.add(m.receiver_id)
      }
      if (idSet.size > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url, username')
            .in('id', Array.from(idSet))
          const map = {}
          ;(profiles || []).forEach(p => { map[String(p.id)] = p })
          for (const m of data || []) {
            m.sender = map[String(m.sender_id)] || null
            m.receiver = map[String(m.receiver_id)] || null
          }
        } catch (e) {
          console.warn('loadMessages attach profiles failed', e)
        }
      }
      messages.value = data || []
    } catch (err) {
      console.error('loadMessages error', err)
    }
  }

  function openChat(targetUser) {
    currentRoom.value = null
    currentChatUser.value = targetUser
    isChatOpen.value = true
    loadMessagesFor(targetUser.id)
    if (!subscription) subscribeToMessages()
  }

  function closeChat() {
    isChatOpen.value = false
    currentChatUser.value = null
    currentRoom.value = null
    messages.value = []
  }

  async function loadMessagesFor(userId) {
    try {
      const res = await supabase.auth.getUser()
      const me = res?.data?.user
      if (!me) return
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${me.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${me.id})`)
        .order('created_at', { ascending: true })
      if (error) throw error
      
      const messagesWithProfiles = data || []
      
      const idSet = new Set()
      for (const m of messagesWithProfiles) {
        if (m.sender_id) idSet.add(m.sender_id)
        if (m.receiver_id) idSet.add(m.receiver_id)
      }
      if (idSet.size > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url, username')
            .in('id', Array.from(idSet))
          const map = {}
          ;(profiles || []).forEach(p => { map[String(p.id)] = p })
          for (const m of messagesWithProfiles) {
            m.sender = map[String(m.sender_id)] || null
            m.receiver = map[String(m.receiver_id)] || null
          }
        } catch (e) {
          console.warn('loadMessagesFor attach profiles failed', e)
        }
      }
      
      messages.value = messagesWithProfiles
    } catch (err) {
      console.error('loadMessagesFor error', err)
    }
  }

  async function openRoomChat(room) {
    console.log('chatStore.openRoomChat called with room:', room)
    // room: { id: <number>, title: <string> }
    currentChatUser.value = null
    currentRoom.value = room
    isChatOpen.value = true
    console.log('chatStore state after setting:', { currentRoom: currentRoom.value, isChatOpen: isChatOpen.value })
    await loadRoomMessages(room.id)
    if (!subscription) subscribeToMessages()
  }

  async function loadRoomMessages(roomId) {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
      if (error) throw error
      
      const messagesWithProfiles = data || []
      
      const senderIds = Array.from(new Set(messagesWithProfiles.map(m => m.sender_id).filter(Boolean)))
      let profileById = {}
      if (senderIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url, username')
            .in('id', senderIds)
          profileById = {}
          ;(profiles || []).forEach(p => { profileById[String(p.id)] = p })
        } catch (e) {
          console.warn('Failed to fetch profiles for room messages', e)
        }
      }
      
      messages.value = messagesWithProfiles.map(m => ({
        ...m,
        sender: profileById[String(m.sender_id)] || null
      }))
    } catch (err) {
      console.error('loadRoomMessages error', err)
    }
  }

  // sendMessage accepts optional receiverId for cases where currentChatUser is not set (e.g., MessageCenter)
  async function sendMessage(content, receiverId = null) {
    if (!content) return
    try {
      const res = await supabase.auth.getUser()
      const me = res?.data?.user
      if (!me) throw new Error('Not authenticated')
      
      console.log('sendMessage called:', { content, currentRoom: currentRoom.value, currentChatUser: currentChatUser.value, receiverId })
      
      const temp = {
        id: `temp-${Date.now()}`,
        sender_id: me.id,
        // derive receiver_id: prefer explicit receiverId, else currentChatUser (private), else null for room messages
        receiver_id: receiverId || (currentChatUser.value ? (currentChatUser.value.id || currentChatUser.value.user?.id) : null),
        content,
        is_read: false,
        created_at: new Date().toISOString()
      }
      // If there is an active private conversation represented elsewhere, prefer that source.
      // Guard: ensure receiver_id is present for private messages.
      let receiver_id = temp.receiver_id
      if (!currentRoom.value && !receiver_id) {
        // try fallback: some UI components may set currentChatUser via a nested 'user' object
        const possibleUser = currentChatUser.value?.user || currentChatUser.value
        receiver_id = possibleUser?.id || null
      }
      // final fallback: use provided receiverId argument if still missing
      if (!currentRoom.value && !receiver_id && receiverId) {
        receiver_id = receiverId
      }
      if (!currentRoom.value && !receiver_id) {
        // No receiver for private message -> throw so caller can handle gracefully
        throw new Error('Target user not found')
      }
      // ensure temp.receiver_id reflects our resolved id
      temp.receiver_id = receiver_id
      messages.value.push(temp)
      // if in a room chat, write to room_messages
      let data, error
      if (currentRoom.value) {
        console.log('Sending room message:', { room_id: currentRoom.value.id, sender_id: me.id, content })
        const payload = { sender_id: me.id, room_id: currentRoom.value.id, content }
        const resIns = await supabase.from('room_messages').insert([payload]).select('*').single()
        data = resIns.data; error = resIns.error
        console.log('Room message response:', { data, error })
        // attach sender profile (guard if insert returned no data)
        if (data) {
          try {
            const { data: pr } = await supabase.from('profiles').select('id, nickname, avatar_url, username').eq('id', data.sender_id).single()
            data.sender = pr || null
          } catch (e) {
            data.sender = null
          }
        }
      } else {
        const resIns = await supabase.from('messages').insert([{
          sender_id: me.id,
          receiver_id: temp.receiver_id,
          content
        }]).select('*').single()
        data = resIns.data; error = resIns.error
        // attach sender/receiver profiles
        // attach sender/receiver profiles (guard if insert returned no data)
        if (data) {
          try {
            const ids = [data.sender_id, data.receiver_id].filter(Boolean)
            const { data: pr } = await supabase.from('profiles').select('id, nickname, avatar_url, username').in('id', ids)
            const map = {}
            ;(pr || []).forEach(p => { map[String(p.id)] = p })
            data.sender = map[String(data.sender_id)] || null
            data.receiver = map[String(data.receiver_id)] || null
          } catch (e) {
            data.sender = null
            data.receiver = null
          }
        }
      }
      if (error) {
        messages.value = messages.value.filter(m => m.id !== temp.id)
        throw error
      }
      messages.value = messages.value.map(m => m.id === temp.id ? data : m)
      // refresh conversation list so the sidebar shows the newly sent conversation
      try {
        await loadConversations()
      } catch (e) {
        console.warn('sendMessage: loadConversations failed', e)
      }
    } catch (err) {
      console.error('sendMessage failed', err)
      throw err
    }
  }

  function subscribeToMessages() {
    if (subscription) return
    supabase.auth.getUser().then(res => {
      const me = res?.data?.user
      if (!me) return
      subscription = supabase.channel('public:realtime_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async payload => {
          const msg = payload.new
          // push to current open chat if it matches
          const otherId = currentChatUser.value?.id
          if (otherId && ((msg.sender_id === me.id && msg.receiver_id === otherId) || (msg.sender_id === otherId && msg.receiver_id === me.id))) {
            try {
              const ids = [msg.sender_id, msg.receiver_id].filter(Boolean)
              const { data: profiles } = await supabase.from('profiles').select('id, nickname, avatar_url, username').in('id', ids)
              const map = {}
              ;(profiles || []).forEach(p => { map[String(p.id)] = p })
              msg.sender = map[String(msg.sender_id)] || null
              msg.receiver = map[String(msg.receiver_id)] || null
            } catch (e) {
              msg.sender = null
              msg.receiver = null
            }
            messages.value.push(msg)
          }
          // if the message involves the current user, refresh conversations to update sidebar
          if (msg.sender_id === me.id || msg.receiver_id === me.id) {
            // fire-and-forget
            loadConversations().catch(e => console.warn('realtime loadConversations failed', e))
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages' }, async payload => {
          const msg = payload.new
          const roomId = currentRoom.value?.id
          if (!roomId) return
          if (msg.room_id === roomId) {
            try {
              const { data: profile } = await supabase.from('profiles').select('id, nickname, avatar_url, username').eq('id', msg.sender_id).single()
              msg.sender = profile || null
            } catch (e) {
              msg.sender = null
            }
            messages.value.push(msg)
          }
        })
        .subscribe()
    })
  }

  function unsubscribe() {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }
  }

  return {
    isChatOpen,
    currentChatUser,
    currentRoom,
    conversations,
    messages,
    loadConversations,
    loadMessages,
    loadMessagesFor,
    loadRoomMessages,
    openChat,
    openRoomChat,
    closeChat,
    sendMessage,
    subscribeToMessages,
    unsubscribe
  }
})

