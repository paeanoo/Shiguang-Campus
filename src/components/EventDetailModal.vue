<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

      <div class="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">

        <div class="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-start shrink-0 z-10">
          <div>
            <div class="flex items-center space-x-2 mb-2">
              <span v-if="event.is_official" class="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                官方认证
              </span>
              <span class="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                {{ event.event_type || '活动' }}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {{ event.title }}
            </h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div class="flex items-center text-gray-600">
              <ClockIcon class="w-5 h-5 mr-3 text-emerald-500" />
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-medium">活动时间</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ formatDateRange(event.start_time, event.end_time) }}
                </span>
              </div>
            </div>

            <div class="flex items-center text-gray-600">
              <MapPinIcon class="w-5 h-5 mr-3 text-emerald-500" />
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-medium">活动地点</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ event.location || '线上/待定' }}
                </span>
              </div>
            </div>

             <div class="flex items-center text-gray-600">
              <FlameIcon class="w-5 h-5 mr-3 text-orange-500" />
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-medium">当前热度</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ localClickCount || props.event.click_count || 0 }} 人关注
                </span>
              </div>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-l-4 border-emerald-500 pl-3">
              活动详情
            </h3>
            <div class="prose prose-sm prose-emerald text-gray-600 leading-relaxed whitespace-pre-wrap">
              {{ event.description || '暂无详细描述...' }}
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider border-l-4 border-blue-500 pl-3">
                已加入伙伴 ({{ participants.length }})
              </h3>
              <span v-if="loadingParticipants" class="text-xs text-gray-400 animate-pulse">加载中...</span>
            </div>

            <div v-if="participants.length > 0" class="flex flex-wrap gap-3">
               <div
                v-for="p in participants"
                :key="p.id"
                class="relative group"
              >
                <button
                  @click="showUserProfile(p)"
                  class="relative"
                >
                  <img
                    :src="p.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.id"
                    class="w-10 h-10 rounded-full object-cover border-2 border-white ring-1 ring-gray-100 shadow-sm hover:ring-2 hover:ring-emerald-300 transition-all"
                  >
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {{ p.profiles?.nickname || p.profiles?.username || '未知用户' }}
                  </div>
                </button>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div class="bg-white p-2 rounded-full mb-2">
                <UsersIcon class="w-6 h-6 text-gray-300" />
              </div>
              <p class="text-sm text-gray-500">还没有人标记加入，快来抢沙发！</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">

          <div class="text-sm text-gray-500 hidden sm:block">
            <span v-if="hasJoined" class="flex items-center text-emerald-600 font-medium">
              <CheckCircleIcon class="w-4 h-4 mr-1" />
              你已加入此活动
            </span>
            <span v-else>感兴趣就加入吧 👇</span>
          </div>

          <div class="flex w-full sm:w-auto gap-3">
            <button
              v-if="isOrganizer"
              @click="$emit('edit')"
              class="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-amber-600 text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-all"
            >
              编辑
            </button>

            <button
              v-if="event.external_url"
              @click="handleExternalClick"
              class="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              <ExternalLinkIcon class="w-4 h-4 mr-2" />
              {{ event.click_count > 0 ? '前往报名' : '立即前往' }}
            </button>

            <button
              @click="handleToggleJoin"
              :class="[
                'flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl font-medium border transition-all active:scale-95',
                hasJoined
                  ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
              ]"
            >
              <span v-if="loadingToggle" class="animate-spin mr-2">⏳</span>
              {{ hasJoined ? '取消标记' : (event.external_url ? '我已报名，标记加入' : '加入活动') }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>

  <UserProfileModal
    :show="showUserProfileModal"
    :user="selectedUserProfile"
    :current-user="currentUser"
    @close="showUserProfileModal = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@lib/supabase'
import {
  XIcon, ClockIcon, MapPinIcon, FlameIcon, UsersIcon,
  ExternalLinkIcon, CheckCircleIcon
} from 'lucide-vue-next'
import UserProfileModal from './UserProfileModal.vue'

const props = defineProps({
  show: Boolean,
  event: {
    type: Object,
    required: true,
    default: () => ({})
  },
  user: {
    type: Object,
    required: false,
    default: null
  }
})

const emit = defineEmits(['close'])

const participants = ref([])
const loadingParticipants = ref(false)
const loadingToggle = ref(false)
const currentUser = ref(null)
const showUserProfileModal = ref(false)
const selectedUserProfile = ref(null)
const localClickCount = ref(0)

// 检查当前用户是否已加入
const hasJoined = computed(() => {
  if (!currentUser.value) return false
  return participants.value.some(p => p.user_id === currentUser.value.id)
})

// 初始化
onMounted(async () => {
  if (props.user) {
    currentUser.value = props.user
    return
  }
  try {
    const { data: { user } } = await supabase.auth.getUser()
    currentUser.value = user
  } catch (e) {
    console.warn('supabase.getUser failed', e)
    currentUser.value = null
  }
})

// 监听弹窗打开，加载参与者
watch(() => props.show, async (newVal) => {
  if (newVal && props.event?.id) {
    fetchParticipants()
  } else {
    // 关闭弹窗时重置本地计数
    localClickCount.value = 0
  }
})

const fetchingParticipants = ref(false)
const fetchParticipants = async () => {
  if (!props.event?.id) return
  if (fetchingParticipants.value) return
  fetchingParticipants.value = true
  loadingParticipants.value = true
  try {
    // 先只获取 registrations 的 user_id（避免复杂嵌套 select 导致 REST 编码问题）
    const { data: regs, error: regsErr, status: regsStatus } = await supabase
      .from('event_registrations')
      .select('user_id, created_at')
      .eq('event_id', props.event.id)
      .order('created_at', { ascending: false })

    if (regsErr) {
      console.error('fetchParticipants regs error:', { error: regsErr, status: regsStatus })
      // 如果是权限/RLS 导致无法读取，则默认为空列表（以免 UI 报错）
      participants.value = []
      return
    }

    const userIds = (Array.isArray(regs) ? regs.map(r => r.user_id) : []).filter(Boolean)
    if (userIds.length === 0) {
      participants.value = []
      return
    }

    // 再查询 profiles 表获取头像/昵称
    const { data: profiles, error: profilesErr, status: profilesStatus } = await supabase
      .from('profiles')
      .select('id, nickname, username, avatar_url, coins, carbon_reduced, bio, location')
      .in('id', userIds)

    if (profilesErr) {
      console.error('fetchParticipants profiles error:', { error: profilesErr, status: profilesStatus })
      participants.value = regs.map(r => ({ user_id: r.user_id, profiles: null, created_at: r.created_at }))
      return
    }

    const profileById = {}
    profiles.forEach(p => { profileById[String(p.id)] = p })

    participants.value = regs.map(r => ({
      id: r.user_id,
      user_id: r.user_id,
      profiles: profileById[String(r.user_id)] || null,
      created_at: r.created_at
    }))
  } catch (err) {
    console.error('Fetch participants exception:', err)
    participants.value = []
  } finally {
    loadingParticipants.value = false
    fetchingParticipants.value = false
  }
}

const handleToggleJoin = async () => {
  if (!currentUser.value) {
    alert('请先登录')
    return
  }

  loadingToggle.value = true
  try {
    // use a timeout wrapper to avoid hanging requests
    const withTimeout = (p, ms = 8000) => {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('请求超时')), ms))
      return Promise.race([p, timeout])
    }

    if (hasJoined.value) {
      // 取消加入
      const op = supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', props.event.id)
        .eq('user_id', currentUser.value.id)
      const { error } = await withTimeout(op, 8000)
      if (error) throw error
    } else {
      // 加入活动
      const op = supabase
        .from('event_registrations')
        .insert([{
          event_id: props.event.id,
          user_id: currentUser.value.id,
          created_at: new Date().toISOString()
        }])
      const { error } = await withTimeout(op, 8000)
      if (error) {
        // 已存在的重复键视为成功（幂等）
        if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate'))) {
          console.warn('Registration duplicate treated as success', error)
        } else {
          throw error
        }
      }
    }

    // 刷新参与者列表
    await fetchParticipants()
  } catch (err) {
  console.error('Toggle join error:', err)
  const msg = err?.message || (err?.error && err.error.message) || String(err)
  alert('操作失败：' + msg)
  } finally {
    loadingToggle.value = false
  }
}

const handleExternalClick = async () => {
  try {
    // 使用 RPC 函数更新点击计数
    const { data: newCount, error } = await supabase.rpc('increment_event_clicks', {
      event_id_param: props.event.id
    })

    if (error) {
      console.error('Update click count error:', error)
    } else {
      // 更新本地计数
      localClickCount.value = newCount
    }

    // 打开外部链接
    window.open(props.event.external_url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    console.error('External click error:', err)
  }
}

const formatDate = (date) => {
  if (!date) return '时间待定'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '时间待定'
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${Y}年${M}月${D}日 ${hh}:${mm}`
}

const displayEventTime = (ev) => {
  if (!ev) return '时间待定'
  
  // Prefer explicit start/end timestamps if present
  if (ev.start_time && ev.end_time) {
    try {
      const start = new Date(ev.start_time)
      const end = new Date(ev.end_time)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return `${formatDate(ev.start_time)} - ${formatDate(ev.end_time)}`
      }
    } catch (e) {
      // ignore and fallback
    }
  }
  
  if (ev.start_time) return formatDate(ev.start_time)
  
  // If event.time exists and event.date exists, combine them to show a full date+time
  if (ev.time && ev.date) return `${ev.date} ${ev.time}`

  // Fallback: if we have day/month (calendar fields), construct a date string using created year or current year
  if ((ev.day || ev.month)) {
    const year = (ev.created_at ? (() => { const d = new Date(ev.created_at); return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear() })() : new Date().getFullYear())
    const day = ev.day || ''
    const month = ev.month || ''
    const dateStr = (year && month && day) ? `${year}年${String(month).padStart(2,'0')}月${String(day).padStart(2,'0')}日` : null
    if (dateStr && ev.time) return `${dateStr} ${ev.time}`
    if (dateStr) return dateStr
  }

  // fallback to human-readable event.time field used in list cards
  if (ev.time) return ev.time
  if (ev.date) return ev.date
  
  // If we have created_at, use it as fallback
  if (ev.created_at) {
    try {
      const d = new Date(ev.created_at)
      if (!isNaN(d.getTime())) {
        return formatDate(ev.created_at)
      }
    } catch (e) {
      // ignore
    }
  }
  
  return '时间待定'
}

// Return just HH:MM from an ISO timestamp or comparable string
const formatTime = (ts) => {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ''
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } catch (e) {
    return ''
  }
}

// Force a full date/time range display. Prefer ISO start/end; fallback to date+time or time-only.
const formatDateRange = (startTs, endTs) => {
  const ev = props.event
  
  if (startTs && endTs) {
    try {
      const s = new Date(startTs)
      const e = new Date(endTs)
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const Y = s.getFullYear()
        const M = String(s.getMonth() + 1).padStart(2, '0')
        const D = String(s.getDate()).padStart(2, '0')
        const sh = String(s.getHours()).padStart(2, '0')
        const sm = String(s.getMinutes()).padStart(2, '0')
        const eh = String(e.getHours()).padStart(2, '0')
        const em = String(e.getMinutes()).padStart(2, '0')
        
        const isSameDay = s.getFullYear() === e.getFullYear() && 
                        s.getMonth() === e.getMonth() && 
                        s.getDate() === e.getDate()
        
        if (isSameDay) {
          return `${Y}年${M}月${D}日 ${sh}:${sm} - ${eh}:${em}`
        } else {
          const eY = e.getFullYear()
          const eM = String(e.getMonth() + 1).padStart(2, '0')
          const eD = String(e.getDate()).padStart(2, '0')
          return `${Y}年${M}月${D}日 ${sh}:${sm} - ${eY}年${eM}月${eD}日 ${eh}:${em}`
        }
      }
    } catch (e) {
    }
  }

  if (startTs) {
    const fd = formatDate(startTs)
    if (fd !== '时间待定') return fd
  }

  if (ev.date && ev.time) {
    return `${ev.date} ${ev.time}`
  }

  if (ev.date) {
    return ev.date
  }

  if (ev.time) {
    return ev.time
  }

  if (ev.day && ev.month) {
    const year = (ev.created_at ? (() => { const d = new Date(ev.created_at); return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear() })() : new Date().getFullYear())
    return `${year}年${String(ev.month).padStart(2,'0')}月${String(ev.day).padStart(2,'0')}日 ${ev.time || ''}`
  }

  return '时间待定'
}

const showUserProfile = (participant) => {
  console.log('showUserProfile called with:', participant)
  console.log('participant.profiles:', participant.profiles)
  if (participant.profiles) {
    selectedUserProfile.value = participant.profiles
    showUserProfileModal.value = true
    console.log('Opening user profile modal for:', selectedUserProfile.value)
  } else {
    console.warn('No profile data available for participant:', participant)
  }
}

const isOrganizer = computed(() => {
  const oid = props.event?.organizerId ?? props.event?.organizer_id ?? props.event?.creator_id ?? props.event?.creator?.id ?? props.event?.organizer?.id ?? props.event?.organizer?.user_id
  if (!currentUser.value || !oid) return false
  return String(currentUser.value.id) === String(oid)
})
</script>