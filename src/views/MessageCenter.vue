<template>
  <section class="max-w-7xl mx-auto px-6 py-8">
    <h1 class="text-2xl font-semibold mb-6">消息中心</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-1">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b">
            <input 
              v-model="filter" 
              placeholder="搜索联系人或群聊..." 
              class="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div class="p-2 max-h-[70vh] overflow-y-auto">
            <div v-if="loading" class="p-4 text-center text-gray-500">
              加载中...
            </div>
            
            <div v-else-if="filteredConversations.length === 0" class="p-4 text-center text-gray-500">
              {{ filter ? '未找到匹配的会话' : '暂无消息' }}
            </div>
            
            <div v-else class="space-y-2">
              <div
                v-for="c in filteredConversations"
                :key="c.id"
                :class="[
                  'relative group p-3 hover:bg-gray-50 cursor-pointer rounded-xl transition-all',
                  activeConversation?.id === c.id ? 'bg-emerald-50 ring-2 ring-emerald-200' : 'hover:shadow-md'
                ]"
                @click="openConversation(c)"
                @contextmenu.stop.prevent="confirmDeleteConversation(c)"
              >
                <div class="flex items-center gap-3">
                  <div class="relative flex-shrink-0">
                <img
                      v-if="c.type === 'private'"
                      @click.stop="openUserProfileModal(c.user?.id)"
                      :src="c.user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + c.user?.id"
                      class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                    >
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {{ c.room?.title?.charAt(0) || '群' }}
                    </div>
                    <div v-if="c.unread > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {{ c.unread > 99 ? '99+' : c.unread }}
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <div class="font-semibold text-gray-900 truncate">
                        {{ c.type === 'private' ? (c.user?.nickname || c.user?.username || c.user?.email) : c.room?.title }}
                      </div>
                      <div class="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {{ formatTime(c.lastMessage?.created_at) }}
                      </div>
                    </div>
                    <div class="text-sm text-gray-500 truncate">
                      {{ formatLastMessage(c) }}
                    </div>
                  </div>
                </div>
                
                <div 
                  v-if="showDeleteButtons && activeConversation?.id === c.id"
                  class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click.stop
                >
                  <button
                    @click="markAsRead(c)"
                    class="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
                    title="标记为已读"
                  >
                    <CheckIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeleteConversation(c)"
                    class="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors"
                    title="删除会话"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-2">
        <div v-if="activeConversation" class="bg-white rounded-xl shadow-sm overflow-hidden h-[75vh] flex flex-col">
          <div class="p-4 border-b bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  v-if="activeConversation.type === 'private' && activeConversation.user?.avatar_url"
                  @click.stop="openUserProfileModal(activeConversation.user?.id)"
                  :src="activeConversation.user.avatar_url"
                  class="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer"
                >
                <div v-else-if="activeConversation.type === 'room'" class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {{ activeConversation.room?.title?.charAt(0) || '群' }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">
                    {{ activeConversation.type === 'private' 
                        ? (activeConversation.user?.nickname || activeConversation.user?.username || activeConversation.user?.email) 
                        : activeConversation.room?.title }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ activeConversation.type === 'private' ? '私聊' : '群聊' }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button
                  v-if="activeConversation.type === 'private'"
                  @click="showUserProfile"
                  class="px-3 py-1.5 text-sm bg-white hover:bg-gray-100 text-gray-700 rounded-lg border transition-colors"
                  title="查看资料"
                >
                  <UserIcon class="w-4 h-4" />
                </button>
                <button
                  @click="showDeleteButtons = !showDeleteButtons"
                  class="p-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border transition-colors"
                  title="更多操作"
                >
                  <MoreVerticalIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="scrollEl">
            <div v-if="loadingMessages" class="text-center text-gray-500 py-8">
              <Loader2Icon class="w-8 h-8 animate-spin mx-auto mb-2" />
              加载消息中...
            </div>
            
            <div v-else-if="messages.length === 0" class="text-center text-gray-400 py-8">
              <MessageCircle class="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>暂无消息，开始聊天吧！</p>
            </div>
            
            <div v-else>
              <div
                v-for="m in messages"
                :key="m.id"
                class="group relative"
                @contextmenu.stop.prevent="confirmDeleteMessage(m)"
              >
                <div :class="m.sender_id === meId ? 'flex justify-end' : 'flex justify-start'">
                  <div :class="[
                    'relative max-w-[70%] p-3 rounded-2xl break-words',
                    m.sender_id === meId
                      ? 'ml-auto bg-emerald-500 text-white rounded-tr-sm'
                      : 'mr-auto bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                  ]">
                    <!-- 发送者信息区域 -->
                    <div class="flex items-center gap-2 mb-2">
                      <img
                        @click.stop="openUserProfileModal(m.sender_id)"
                        :src="getSenderAvatar(m.sender_id)"
                        class="w-6 h-6 rounded-full object-cover border border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        :title="getSenderName(m.sender_id)"
                      >
                      <div class="text-xs font-medium" :class="m.sender_id === meId ? 'text-white/70' : 'text-gray-500'">
                        {{ getSenderName(m.sender_id) }}
                      </div>
                    </div>

                    <div class="break-words">{{ m.content }}</div>
                    <div :class="[
                      'text-xs mt-1',
                      m.sender_id === meId ? 'text-white/70' : 'text-gray-400'
                    ]">
                      {{ formatTime(m.created_at) }}
                    </div>
                  </div>
                  
                  <div 
                    v-if="showDeleteButtons"
                    class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop
                  >
                    <button
                      @click="confirmDeleteMessage(m)"
                      class="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors"
                      title="删除消息"
                    >
                      <Trash2Icon class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-white border-t">
            <div class="flex items-center gap-2 mb-3">
              <button
                @click="showDeleteButtons = !showDeleteButtons"
                class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {{ showDeleteButtons ? '隐藏删除按钮' : '更多' }}
              </button>
              <div class="flex-1"></div>
            </div>
            
            <form @submit.prevent="onSend" class="flex gap-2">
              <input
                v-model="input"
                class="flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                placeholder="输入消息..."
                :disabled="sending"
              />
              <button
                type="submit"
                :disabled="!input.trim() || sending"
                class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SendIcon v-if="!sending" class="w-4 h-4" />
                <Loader2Icon v-else class="w-4 h-4 animate-spin" />
                {{ sending ? '发送中...' : '发送' }}
              </button>
            </form>
          </div>
        </div>
        
        <div v-else class="bg-white rounded-xl shadow-sm p-8 h-[75vh] flex flex-col items-center justify-center text-gray-500">
          <MessageCircle class="w-20 h-20 mb-4 text-gray-300" />
          <p class="text-lg mb-2">选择一个会话开始聊天</p>
          <p class="text-sm text-gray-400">或者点击用户头像发送新消息</p>
        </div>
      </div>
    </div>
  </section>

  <teleport to="body">
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-2">确认删除</h3>
        <p class="text-gray-600 mb-6">{{ deleteConfirmMessage }}</p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="executeDelete"
            class="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@lib/supabase'
import { useChatStore } from '@/stores/chatStore'
import { openUserProfileModal } from '@/stores/userProfileModal'
import {
  MessageCircle,
  Trash2Icon,
  UserIcon,
  SendIcon,
  Loader2Icon,
  ArrowLeft
} from 'lucide-vue-next'

const router = useRouter()
const chat = useChatStore()
const filter = ref('')
const meId = ref(null)
const activeConversation = ref(null)
const input = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const scrollEl = ref(null)
const senderNames = ref(new Map())
const showDeleteButtons = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const deleteAction = ref(null)

onMounted(async () => {
  const res = await supabase.auth.getUser()
  meId.value = res?.data?.user?.id
  loading.value = true
  try {
    await chat.loadConversations()
    // enable realtime subscription so inserts are pushed into open views
    try {
      chat.subscribeToMessages()
    } catch (e) {
      console.warn('subscribeToMessages failed', e)
    }
  } finally {
    loading.value = false
  }
})

const conversations = computed(() => chat.conversations)
const messages = computed(() => chat.messages)

const filteredConversations = computed(() => {
  return conversations.value.filter(c => {
    if (!filter.value) return true
    const key = c.type === 'private'
      ? (c.user?.nickname || c.user?.username || c.user?.email || '').toLowerCase()
      : (c.room?.title || '').toLowerCase()
    return key.includes(filter.value.toLowerCase())
  })
})

async function openConversation(conv) {
  // switch active conversation immediately so UI reflects selection
  activeConversation.value = conv
  // clear senderNames for new conversation and let loadMessages populate it
  senderNames.value.clear()
  // loadMessages handles private and room cases and sets loadingMessages
  await loadMessages(conv)
  await markAsRead(conv)
  // ensure realtime updates are active when viewing a conversation
  try {
    chat.subscribeToMessages()
  } catch (e) {
    console.warn('subscribeToMessages failed', e)
  }
  // ensure private conversation has full user profile for header/avatar (if missing)
  if (conv.type === 'private' && conv.user && (!conv.user.nickname || !conv.user.avatar_url || !conv.user.username)) {
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('id, nickname, username, avatar_url')
        .eq('id', conv.user.id)
        .single()
      if (!profErr && prof) {
        activeConversation.value.user = { ...conv.user, ...prof }
      }
    } catch (e) {
      console.warn('fetch private convo profile failed', e)
    }
  }
}

async function loadMessages(conv) {
  loadingMessages.value = true
  senderNames.value.clear()
  try {
    const me = meId.value
    try { console.log('[MessageCenter] loadMessages called for conv:', conv?.id, 'type:', conv?.type, 'userId:', conv?.user?.id, 'roomId:', conv?.room?.id, 'meId:', me) } catch (e) {}
    if (conv.type === 'private') {
      await chat.loadMessages(conv.user.id)
      // 为私聊消息设置发送者信息
      try { console.log('[MessageCenter] after chat.loadMessages, chat.messages length:', Array.isArray(chat.messages) ? chat.messages.length : (chat.messages?.value ? chat.messages.value.length : 'unknown')) } catch (e) {}
      // 优先使用 messages 中已有的 profile 数据，缺失的按需拉取
      const missingIds = new Set()
      for (const m of chat.messages.value || []) {
        if (m.sender && m.sender.id) {
          if (m.sender.id === me) {
            senderNames.value.set(m.sender.id, m.sender)
          } else {
            if (m.sender.nickname || m.sender.username || m.sender.avatar_url) {
              senderNames.value.set(m.sender.id, m.sender)
            } else {
              missingIds.add(m.sender.id)
            }
          }
        }
        if (m.receiver && m.receiver.id) {
          if (m.receiver.id === me) {
            senderNames.value.set(m.receiver.id, m.receiver)
          } else {
            if (m.receiver.nickname || m.receiver.username || m.receiver.avatar_url) {
              senderNames.value.set(m.receiver.id, m.receiver)
            } else {
              missingIds.add(m.receiver.id)
            }
          }
        }
      }
      // 异步批量拉取缺失的 profile
      if (missingIds.size > 0) {
        const ids = Array.from(missingIds)
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, username, avatar_url')
            .in('id', ids)
          ;(profiles || []).forEach(p => {
            senderNames.value.set(String(p.id), p)
          })
        } catch (e) {
          // 对于仍然缺失的 id，尝试逐个拉取（fetchProfileIfMissing 已做保护）
          for (const id of ids) {
            fetchProfileIfMissing(id).catch(() => {})
          }
        }
      }
    } else {
      // 使用 chatStore 的加载方法，确保 chat.messages 被正确填充以供模板渲染
      try {
        await chat.loadRoomMessages(conv.room.id)
        // 从 chat.messages 中填充发送者缓存，和私聊分支保持一致
        for (const m of chat.messages.value || []) {
          if (m.sender && m.sender.id !== me) {
            senderNames.value.set(m.sender.id, m.sender)
          }
        }
        try { console.log('[MessageCenter] chat.messages after loadRoomMessages:', (chat.messages.value || []).length) } catch (e) {}
      } catch (e) {
        console.error('Load room messages via chat.loadRoomMessages failed', e)
      }
    }
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  } catch (err) {
    console.error('Load messages error:', err)
  } finally {
    loadingMessages.value = false
  }
}

function getSenderName(senderId) {
  const sender = senderNames.value.get(senderId)
  // 如果已有缓存，直接返回（昵称 -> 用户名 -> 占位）
  if (sender) return sender.nickname || sender.username || '用户'
  // 启动后台拉取资料（非阻塞），以便下次渲染显示真实信息
  fetchProfileIfMissing(senderId).catch(e => {
    // ignore
  })
  // 返回占位，界面会在 fetch 完成后自动更新
  return '用户'
}

function getSenderAvatar(senderId) {
  const sender = senderNames.value.get(senderId)
  if (sender && sender.avatar_url) return sender.avatar_url
  // 同上：若无缓存则异步拉取
  fetchProfileIfMissing(senderId).catch(() => {})
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + senderId
}

// 异步拉取单个 profile 并缓存到 senderNames，避免重复拉取
async function fetchProfileIfMissing(userId) {
  if (!userId) return
  // 已经存在或正在拉取则跳过
  const existing = senderNames.value.get(userId)
  if (existing && (existing.nickname || existing.fetching)) return
  // 标记为正在拉取，防止并发重复请求
  senderNames.value.set(userId, { fetching: true })
  try {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('id, nickname, username, avatar_url')
      .eq('id', userId)
      .single()
    if (!error && prof) {
      senderNames.value.set(userId, prof)
    } else {
      // 如果无资料，则清理 fetching 标记以便后续可重试
      senderNames.value.delete(userId)
    }
  } catch (e) {
    senderNames.value.delete(userId)
  }
}

async function onSend() {
  if (!input.value.trim() || !activeConversation.value) return
  sending.value = true
  try {
    const messageContent = input.value.trim()
    if (activeConversation.value.type === 'private') {
      // pass explicit receiver id because MessageCenter does not set chat.currentChatUser
      const receiverId = activeConversation.value.user?.id || activeConversation.value.user?.uid || null
      await chat.sendMessage(messageContent, receiverId)
      // optimistic update of last message to make sidebar reflect send immediately
      try {
        activeConversation.value.lastMessage = {
          content: messageContent,
          created_at: new Date().toISOString()
        }
      } catch (e) { /* ignore */ }
    } else {
      // insert and reload room messages so the new message appears immediately
      const resIns = await supabase
        .from('room_messages')
        .insert([{
          room_id: activeConversation.value.room.id,
          sender_id: meId.value,
          content: messageContent
        }])
        .select('*')
      if (resIns.error) throw resIns.error
      // reload messages for the room to include sender profile and correct ordering
      await chat.loadRoomMessages(activeConversation.value.room.id)
      try {
        activeConversation.value.lastMessage = {
          content: messageContent,
          created_at: new Date().toISOString()
        }
      } catch (e) { /* ignore */ }
    }
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
    input.value = ''
    await new Promise(resolve => setTimeout(resolve, 300))
    // refresh conversation list (fire-and-forget)
    chat.loadConversations().catch(e => console.warn('loadConversations after send failed', e))
  } catch (err) {
    console.error('Send message error:', err)
    alert('发送失败：' + (err.message || '未知错误'))
  } finally {
    sending.value = false
  }
}

function showUserProfile() {
  if (activeConversation.value?.type === 'private' && activeConversation.value?.user) {
    chat.openChat(activeConversation.value.user)
  }
}

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString()
}

function formatLastMessage(conv) {
  if (!conv.lastMessage?.content) return '暂无消息'

  if (conv.type === 'room') {
    // 群聊显示发送者名字
    const senderName = conv.lastMessage.sender?.nickname ||
                      conv.lastMessage.sender?.username ||
                      '未知用户'
    return `${senderName}: ${conv.lastMessage.content}`
  } else {
    // 私聊直接显示消息内容
    return conv.lastMessage.content
  }
}

async function markAsRead(conv) {
  try {
    const me = meId.value
    if (conv.type === 'private') {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', me)
        .eq('sender_id', conv.user.id)
        .is('is_read', false)
    }
    conv.unread = 0
  } catch (err) {
    console.error('Mark as read error:', err)
  }
}

async function confirmDeleteConversation(conv) {
  try { console.log('[MessageCenter] directDeleteConversation called for conv:', conv?.id, 'type:', conv?.type) } catch (e) {}
  // 直接删除（不再弹出确认框）
  try {
    await deleteConversation(conv)
  } catch (e) {
    console.error('direct deleteConversation failed', e)
    alert('删除会话失败：' + (e?.message || e))
  }
}

async function deleteConversation(conv) {
  try {
    try { console.log('[MessageCenter] deleteConversation executing for conv:', conv?.id, 'type:', conv?.type) } catch (e) {}
    const me = meId.value
    if (conv.type === 'private') {
      await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${me},receiver_id.eq.${conv.user.id}),and(sender_id.eq.${conv.user.id},receiver_id.eq.${me})`)
    } else {
      await supabase
        .from('room_messages')
        .delete()
        .eq('room_id', conv.room.id)
    }
    // refresh conversations so sidebar reflects deletion immediately
    await chat.loadConversations()
    if (activeConversation.value?.id === conv.id) activeConversation.value = null
    showDeleteConfirm.value = false
  } catch (err) {
    console.error('Delete conversation error:', err)
    alert('删除失败：' + (err.message || '未知错误'))
  }
}

async function confirmDeleteMessage(msg) {
  try { console.log('[MessageCenter] directDeleteMessage called for msg:', msg?.id) } catch (e) {}
  // 直接删除消息（不再弹出确认框）
  try {
    await deleteMessage(msg)
  } catch (e) {
    console.error('direct deleteMessage failed', e)
    alert('删除消息失败：' + (e?.message || e))
  }
}

async function deleteMessage(msg) {
  try {
    try { console.log('[MessageCenter] deleteMessage executing for msg:', msg?.id, 'activeConversation:', activeConversation?.value?.id) } catch (e) {}
    if (activeConversation.value.type === 'private') {
      await supabase.from('messages').delete().eq('id', msg.id)
    } else {
      await supabase.from('room_messages').delete().eq('id', msg.id)
    }
    // 防御性处理：确保 chat.messages.value 为数组后再 filter
    try {
      chat.messages.value = (chat.messages.value || []).filter(m => m.id !== msg.id)
    } catch (e) {
      // 如果出错，回退到空数组以防止模板异常
      console.warn('Failed to filter chat.messages after delete, resetting to empty array', e)
      chat.messages.value = []
    }
    // refresh conversation list to update lastMessage etc.
    chat.loadConversations().catch(e => console.warn('loadConversations after delete failed', e))
    showDeleteConfirm.value = false
  } catch (err) {
    console.error('Delete message error:', err)
    alert('删除失败：' + (err.message || '未知错误'))
  }
}

function confirmClearConversation() {
  if (!activeConversation.value) return
  deleteConfirmMessage.value = activeConversation.value.type === 'private'
    ? `确定要清空与 ${activeConversation.value.user?.nickname || activeConversation.value.user?.username || '该用户'} 的对话记录吗？`
    : `确定要清空群聊 "${activeConversation.value.room?.title}" 的对话记录吗？`
  deleteAction.value = () => clearConversation()
  showDeleteConfirm.value = true
}

async function clearConversation() {
  try {
    const me = meId.value
    if (activeConversation.value.type === 'private') {
      await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${me},receiver_id.eq.${activeConversation.value.user.id}),and(sender_id.eq.${activeConversation.value.user.id},receiver_id.eq.${me})`)
    } else {
      await supabase.from('room_messages').delete().eq('room_id', activeConversation.value.room.id)
    }
    // 确保 messages 安全赋值
    try {
      chat.messages.value = []
    } catch (e) {
      console.warn('Failed to reset chat.messages after clearConversation', e)
      // best-effort fallback
      chat.messages.value = []
    }
    if (activeConversation.value) activeConversation.value.lastMessage = null
    showDeleteConfirm.value = false
  } catch (err) {
    console.error('Clear conversation error:', err)
    alert('清空失败：' + (err.message || '未知错误'))
  }
}

async function executeDelete() {
  try { console.log('[MessageCenter] executeDelete called, hasAction:', !!deleteAction.value) } catch (e) {}
  if (!deleteAction.value) {
    try { console.warn('[MessageCenter] executeDelete: no action to run') } catch (e) {}
    alert('删除操作未找到，请重试或刷新页面')
    showDeleteConfirm.value = false
    return
  }
  try {
    await deleteAction.value()
  } catch (e) {
    console.error('executeDelete action threw', e)
    alert('删除执行失败：' + (e?.message || e))
  }
  deleteAction.value = null
  showDeleteConfirm.value = false
}

function goBack() {
  // Prefer route back to buddy if exists else router.back()
  try {
    router.push('/buddy')
  } catch (e) {
    router.back()
  }
}
</script>
