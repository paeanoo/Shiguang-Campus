<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <router-link
              to="/"
              class="flex items-center gap-2 text-sm mb-4 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft class="w-4 h-4" />
              返回首页
            </router-link>
            <h1 class="text-2xl md:text-3xl font-semibold font-serif text-foreground">找到你的校园搭子</h1>
            <p class="mt-2 text-muted-foreground">别一个人！找个伴一起学习、运动、看演出</p>
          </div>
          <button
            class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-600)' }"
          >
            <Plus class="w-4 h-4" />
            发布需求
          </button>
        </div>
      </div>
    </section>

    <!-- Filter & Search Bar -->
    <section
      class="sticky top-16 z-10 border-b"
      :style="{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Category Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="activeCategory === category.id ? 'text-white' : 'bg-secondary text-muted-foreground hover:bg-muted'"
              :style="activeCategory === category.id ? { backgroundColor: 'var(--emerald-600)' } : {}"
            >
              {{ category.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex-1 md:max-w-sm md:ml-auto">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索「音乐节」或「图书馆」..."
                v-model="searchQuery"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <!-- Partner Request Cards -->
        <div class="flex-1">
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="request in filteredRequests"
              :key="request.id"
              class="rounded-xl border p-5 transition-all hover:shadow-md"
              :style="{
                backgroundColor: 'var(--card)',
                borderColor: isJoined(request.id) ? 'var(--emerald-500)' : 'var(--border)'
              }"
            >
              <div
                v-if="isJoined(request.id)"
                class="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit mb-3"
                :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
              >
                <Check class="w-3 h-3" />
                已加入
              </div>

              <!-- User Header -->
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  :style="{ backgroundColor: 'var(--secondary)' }"
                >
                  {{ request.user.avatar }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-sm text-foreground">{{ request.user.name }}</p>
                  <p class="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    {{ request.user.time }}
                  </p>
                </div>
              </div>

              <!-- Title -->
              <h3 class="font-semibold text-foreground mb-3">{{ request.title }}</h3>

              <!-- Linked Event Badge -->
              <div
                v-if="request.linkedEvent"
                class="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 cursor-pointer transition-all hover:opacity-80"
                :style="{ backgroundColor: 'var(--orange-100)' }"
              >
                <Ticket class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" />
                <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
                  关联活动: {{ request.linkedEvent.name }}
                </span>
                <span class="text-xs ml-auto" :style="{ color: 'var(--orange-700)' }">
                  {{ request.linkedEvent.date }}
                </span>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="(tag, index) in request.tags"
                  :key="index"
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{ backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-3 border-t" :style="{ borderColor: 'var(--border)' }">
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users class="w-4 h-4" />
                  <span>
                    <span class="font-medium" :style="{ color: 'var(--emerald-600)' }">{{ request.slots.filled }}</span>
                    /{{ request.slots.total }} 已加入
                  </span>
                  <!-- Progress bar -->
                  <div class="w-16 h-1.5 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--secondary)' }">
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{
                        backgroundColor: 'var(--emerald-500)',
                        width: `${(request.slots.filled / request.slots.total) * 100}%`
                      }"
                    />
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-secondary"
                    :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
                  >
                    <MessageCircle class="w-3.5 h-3.5" />
                    私聊
                  </button>
                  <button
                    v-if="isJoined(request.id)"
                    @click="handleViewDetail(request)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
                  >
                    <Users class="w-3.5 h-3.5" />
                    查看详情
                  </button>
                  <button
                    v-else-if="isFull(request)"
                    disabled
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground bg-secondary cursor-not-allowed"
                  >
                    已满员
                  </button>
                  <button
                    v-else
                    @click="handleJoin(request.id)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    :style="{ backgroundColor: 'var(--emerald-600)' }"
                  >
                    <UserPlus class="w-3.5 h-3.5" />
                    加入
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredRequests.length === 0" class="text-center py-16">
            <Users class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p class="text-muted-foreground">暂无匹配的搭子需求</p>
          </div>
        </div>

        <!-- Sidebar - Desktop Only -->
        <aside class="hidden lg:block w-72 shrink-0">
          <div
            v-if="joinedIds.length > 0"
            class="rounded-xl border p-5 mb-6"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Check class="w-4 h-4" :style="{ color: 'var(--emerald-600)' }" />
              我加入的 ({{ joinedIds.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="request in joinedRequests"
                :key="request.id"
                @click="handleViewDetail(request)"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  :style="{ backgroundColor: 'var(--emerald-50)' }"
                >
                  {{ request.user.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-foreground truncate">{{ request.title }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ request.slots.filled }}/{{ request.slots.total }} 人
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-xl border p-5 sticky top-36"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar class="w-4 h-4" :style="{ color: 'var(--amber-600)' }" />
              热门活动找搭子
            </h3>
            <div class="space-y-4">
              <div
                v-for="event in trendingEvents"
                :key="event.id"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: 'var(--amber-50)' }"
                >
                  <Ticket class="w-5 h-5" :style="{ color: 'var(--amber-600)' }" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-foreground truncate">{{ event.name }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ event.date }}</p>
                  <p class="text-xs mt-1" :style="{ color: 'var(--emerald-600)' }">
                    {{ event.buddyCount }} 人正在找搭子
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Mobile FAB -->
    <button
      class="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105"
      :style="{ backgroundColor: 'var(--emerald-600)' }"
    >
      <Plus class="w-6 h-6" />
    </button>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedRequest" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showDetailModal = false" />
      <div
        class="relative w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        :style="{ backgroundColor: 'var(--card)' }"
      >
        <button
          @click="showDetailModal = false"
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <X class="w-5 h-5 text-muted-foreground" />
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            :style="{ backgroundColor: 'var(--secondary)' }"
          >
            {{ selectedRequest.user.avatar }}
          </div>
          <div>
            <h3 class="font-semibold text-lg text-foreground">{{ selectedRequest.title }}</h3>
            <p class="text-sm text-muted-foreground">
              由 {{ selectedRequest.user.name }} 创建 · {{ selectedRequest.user.time }}
            </p>
          </div>
        </div>

        <p class="text-muted-foreground text-sm mb-4 leading-relaxed">{{ selectedRequest.description }}</p>

        <div
          v-if="selectedRequest.linkedEvent"
          class="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
          :style="{ backgroundColor: 'var(--orange-100)' }"
        >
          <Ticket class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" />
          <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
            关联活动: {{ selectedRequest.linkedEvent.name }} ({{ selectedRequest.linkedEvent.date }})
          </span>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="(tag, index) in selectedRequest.tags"
            :key="index"
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :style="{ backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="border-t pt-4 mb-4" :style="{ borderColor: 'var(--border)' }">
          <h4 class="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
            <Users class="w-4 h-4" />
            成员 ({{ selectedRequest.slots.filled }}/{{ selectedRequest.slots.total }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="(member, index) in selectedRequest.members"
              :key="index"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary group"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                :style="{ backgroundColor: 'var(--secondary)' }"
              >
                {{ member.avatar }}
              </div>
              <span class="text-sm text-foreground flex-1">{{ member.name }}</span>
              <span
                v-if="member.isHost"
                class="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                :style="{ backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' }"
              >
                <Crown class="w-3 h-3" />
                房主
              </span>
              <span
                v-if="member.name === '我' && !member.isHost"
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
              >
                我
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <button
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
              :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
            >
              <MessageCircle class="w-4 h-4" />
              群聊
            </button>
            <button
              v-if="isJoined(selectedRequest.id)"
              @click="handleLeave(selectedRequest.id)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50"
              :style="{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }"
            >
              <LogOut class="w-4 h-4" />
              退出房间
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@lib/supabase'
import {
  ArrowLeft,
  Search,
  Users,
  Calendar,
  MessageCircle,
  Ticket,
  Clock,
  Plus,
  X,
  Check,
  LogOut,
  UserPlus,
  Crown
} from 'lucide-vue-next'

const categories = [
  { id: 'all', label: '全部' },
  { id: 'event', label: '活动搭子' },
  { id: 'study', label: '学习' },
  { id: 'sports', label: '运动' },
  { id: 'dining', label: '约饭' },
  { id: 'travel', label: '旅行' },
  { id: 'gaming', label: '游戏' },
  { id: 'other', label: '其它' }
]

const activeCategory = ref('all')
const searchQuery = ref('')
const buddyRequests = ref([])
const trendingEvents = ref([])
const joinedIds = ref([])
const selectedRequest = ref(null)
const showDetailModal = ref(false)

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return date.toLocaleDateString('zh-CN')
}

const loadBuddyRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('buddy_requests')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) throw error

    buddyRequests.value = data.map(request => ({
      ...request,
      user: {
        name: request.profiles?.username || '未知用户',
        avatar: request.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        time: formatTimeAgo(new Date(request.created_at))
      },
      slots: {
        filled: request.joined_count || 0,
        total: request.max_members || 5
      },
      tags: request.tags || []
    }))
  } catch (error) {
    console.error('Load buddy requests error:', error)
  }
}

const loadTrendingEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, name, date, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error

    trendingEvents.value = data.map(event => ({
      ...event,
      buddyCount: Math.floor(Math.random() * 50) + 20
    }))
  } catch (error) {
    console.error('Load trending events error:', error)
  }
}

onMounted(() => {
  loadBuddyRequests()
  loadTrendingEvents()
})

const filteredRequests = computed(() => {
  return buddyRequests.value.filter(request => {
    const matchesCategory = activeCategory.value === 'all' || request.category === activeCategory.value
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      request.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesCategory && matchesSearch
  })
})

const joinedRequests = computed(() => {
  return buddyRequests.value.filter(r => joinedIds.value.includes(r.id))
})

const isJoined = (requestId) => joinedIds.value.includes(requestId)
const isFull = (request) => request.slots.filled >= request.slots.total

const handleJoin = (requestId) => {
  const request = buddyRequests.value.find(r => r.id === requestId)
  if (!request || request.slots.filled >= request.slots.total) return

  joinedIds.value.push(requestId)
  const index = buddyRequests.value.findIndex(r => r.id === requestId)
  if (index !== -1) {
    buddyRequests.value[index] = {
      ...buddyRequests.value[index],
      slots: { ...buddyRequests.value[index].slots, filled: buddyRequests.value[index].slots.filled + 1 },
      members: [...buddyRequests.value[index].members, { name: '我', avatar: '😊', isHost: false }]
    }
  }
}

const handleLeave = (requestId) => {
  const index = buddyRequests.value.findIndex(r => r.id === requestId)
  if (index !== -1) {
    buddyRequests.value[index] = {
      ...buddyRequests.value[index],
      slots: { ...buddyRequests.value[index].slots, filled: Math.max(0, buddyRequests.value[index].slots.filled - 1) },
      members: buddyRequests.value[index].members.filter(m => m.name !== '我')
    }
  }
  joinedIds.value = joinedIds.value.filter(id => id !== requestId)
  showDetailModal.value = false
}

const handleViewDetail = (request) => {
  const latestRequest = buddyRequests.value.find(r => r.id === request.id)
  selectedRequest.value = latestRequest || request
  showDetailModal.value = true
}
</script>
