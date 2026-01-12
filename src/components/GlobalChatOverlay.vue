<template>
  <teleport to="body">
    <div v-if="chat.isChatOpen" class="fixed bottom-6 right-6 z-50 w-96 max-w-full">
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-96">
        <div class="px-4 py-3 border-b flex items-center gap-3">
          <img v-if="chat.currentRoom?.id" src="/placeholder-user.jpg" class="w-8 h-8 rounded-full" />
          <img v-else-if="chat.currentChatUser?.avatar_url" @click="openUserProfileModal(chat.currentChatUser?.id)" :src="chat.currentChatUser.avatar_url" class="w-8 h-8 rounded-full cursor-pointer" />
          <div class="flex-1">
            <div class="font-medium">{{ chat.currentRoom?.title || chat.currentChatUser?.username || chat.currentChatUser?.email || '聊天' }}</div>
            <div class="text-xs text-muted-foreground">{{ chat.currentRoom ? '房间聊天' : '在线聊天' }}</div>
          </div>
          <button @click="chat.closeChat" class="text-sm px-2 py-1">×</button>
        </div>

        <div class="flex-1 p-3 overflow-y-auto space-y-3" ref="scrollEl">
          <div v-for="m in chat.messages" :key="m.id" class="max-w-full">
            <div :class="m.sender_id === meId ? 'ml-auto text-right' : 'mr-auto text-left'" class="flex gap-2" :style="{ flexDirection: m.sender_id === meId ? 'row-reverse' : 'row' }">
              <img 
                v-if="m.sender?.avatar_url" 
                :src="m.sender.avatar_url" 
                class="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                @click.stop="openUserProfileModal(m.sender_id)"
              />
              <img 
                v-else 
                src="/placeholder-user.jpg" 
                class="w-8 h-8 rounded-full flex-shrink-0 bg-gray-200"
              />
              <div class="flex flex-col max-w-[80%]">
                <div v-if="m.sender" class="text-xs text-muted-foreground mb-1" :class="m.sender_id === meId ? 'text-right' : 'text-left'">
                  {{ m.sender.nickname || m.sender.username || '未知用户' }}
                </div>
                <div v-else class="text-xs text-muted-foreground mb-1" :class="m.sender_id === meId ? 'text-right' : 'text-left'">
                  未知用户 (ID: {{ m.sender_id }})
                </div>
                <div :class="['inline-block px-3 py-2 rounded-lg', m.sender_id === meId ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800 shadow-sm']">
                  {{ m.content }}
                </div>
                <div class="text-xs text-muted-foreground mt-1" :class="m.sender_id === meId ? 'text-right' : 'text-left'">{{ formatDate(m.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 border-t">
          <form @submit.prevent="onSend" class="flex gap-2">
            <input v-model="input" class="flex-1 px-3 py-2 rounded-lg border focus:outline-none" placeholder="输入消息..." />
            <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-600 text-white">发送</button>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { supabase } from '@lib/supabase'
import { openUserProfileModal } from '@/stores/userProfileModal'

  const chat = useChatStore()
const input = ref('')
const scrollEl = ref(null)
const meId = ref(null)

watch(() => chat.messages, (newMessages) => {
  console.log('GlobalChatOverlay: messages changed:', newMessages.map(m => ({
    id: m.id,
    content: m.content,
    sender_id: m.sender_id,
    sender: m.sender
  })))
}, { deep: true })

watch(() => chat.isChatOpen, (newVal) => {
  console.log('GlobalChatOverlay: isChatOpen changed to:', newVal)
})

watch(() => chat.currentRoom, (newVal) => {
  console.log('GlobalChatOverlay: currentRoom changed to:', newVal)
})

onMounted(async () => {
  const res = await supabase.auth.getUser()
  meId.value = res?.data?.user?.id
  chat.subscribeToMessages()
})

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString()
}

async function onSend() {
  if (!input.value) return
  console.log('onSend called:', { input: input.value, currentRoom: chat.currentRoom, currentChatUser: chat.currentChatUser })
  try {
    await chat.sendMessage(input.value)
    input.value = ''
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  } catch (err) {
    console.error('onSend error:', err)
    alert('发送失败: ' + err.message)
  }
}
</script>

<style scoped>
</style>

