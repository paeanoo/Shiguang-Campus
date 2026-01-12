<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[999999]" @click="$emit('close')"></div>

      <div class="relative z-[1000000] bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div class="relative h-32 bg-gradient-to-r from-emerald-500 to-blue-500">
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="relative px-6 pb-6">
          <div class="flex items-end -mt-16 mb-4">
            <div class="relative">
              <img
                :src="user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id"
                class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              >
              <div v-if="user.user_type === 'admin'" class="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                管理员
              </div>
            </div>
            <div class="ml-4 mb-2 flex-1">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ displayName }}
              </h2>
              <p class="text-sm text-gray-500">@{{ handleUsername }}</p>
            </div>
          </div>

          <div v-if="user.bio" class="mb-6">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">个人简介</h3>
            <p class="text-gray-600 leading-relaxed">{{ user.bio }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-2 text-emerald-600 mb-1">
                <CoinsIcon class="w-5 h-5" />
                <span class="text-sm font-medium">金币</span>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ user.coins || 0 }}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center gap-2 text-blue-600 mb-1">
                <LeafIcon class="w-5 h-5" />
                <span class="text-sm font-medium">碳减排</span>
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ user.carbon_reduced || 0 }}kg</div>
            </div>
          </div>

          <div v-if="user.location" class="flex items-center gap-2 text-gray-600 mb-6">
            <MapPinIcon class="w-5 h-5" />
            <span>{{ user.location }}</span>
          </div>

          <div v-if="user.website" class="mb-6">
            <a
              :href="user.website"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <GlobeIcon class="w-5 h-5" />
              <span>个人网站</span>
              <ExternalLinkIcon class="w-4 h-4" />
            </a>
          </div>

          <div class="flex gap-3">
            <button
              @click="handleStartChat"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md shadow-emerald-200 transition-all active:scale-95"
            >
              <MessageCircle class="w-5 h-5" />
              发送消息
            </button>
          </div>

          <div v-if="user.created_at" class="mt-6 text-center text-sm text-gray-400">
            加入时间：{{ formatDate(user.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { supabase } from '@lib/supabase'
import {
  XIcon, CoinsIcon, LeafIcon, MapPinIcon, GlobeIcon,
  ExternalLinkIcon, MessageCircle
} from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  user: {
    type: Object,
    required: true,
    default: () => ({})
  },
  currentUser: {
    type: Object,
    required: false,
    default: null
  }
})

const emit = defineEmits(['close'])

const chat = useChatStore()

console.log('UserProfileModal props:', props)

const isCurrentUser = computed(() => {
  return props.currentUser?.id === props.user.id
})

const displayName = computed(() => {
  return props.user?.nickname || props.user?.username || props.user?.email?.split('@')[0] || '用户'
})

const handleUsername = computed(() => {
  return props.user?.username || props.user?.email?.split('@')[0] || 'user'
})


function handleStartChat() {
  if (isCurrentUser.value) {
    alert('不能给自己发送消息')
    return
  }
  chat.openChat(props.user)
  emit('close')
}

// handleViewProfile removed because there is no separate homepage

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${Y}年${M}月${D}日`
}
</script>
