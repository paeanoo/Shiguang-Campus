<template>
  <section class="max-w-5xl mx-auto px-6 py-8">
    <div class="mb-8">
      <router-link
        to="/"
        class="text-sm mb-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        返回
      </router-link>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--emerald-600)' }">
            光币中心
          </h1>
          <p class="text-sm text-muted-foreground">赚取光币，兑换好礼，记录减碳足迹</p>
        </div>
        <button class="text-sm font-medium flex items-center gap-1" :style="{ color: 'var(--emerald-600)' }">
          兑换记录
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- Left Column - Balance Card & Leaderboard -->
      <div class="space-y-6">
        <!-- Balance Card -->
        <div
          class="rounded-xl p-6 relative overflow-hidden"
          :style="{ backgroundColor: 'var(--emerald-50)', border: '1px solid var(--border)' }"
        >
          <button
            class="absolute top-4 right-4 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:shadow-lg transition-shadow"
            :style="{ backgroundColor: 'var(--emerald-500)' }"
          >
            <Sparkles class="w-3.5 h-3.5" />
            每日签到
          </button>

          <div class="pt-4 pb-2">
            <div class="flex items-center gap-2 mb-1">
              <Coins class="w-7 h-7" :style="{ color: 'var(--amber-500)' }" />
              <span class="text-4xl font-bold text-foreground">{{ balance.toLocaleString() }}</span>
            </div>
            <p class="text-sm text-muted-foreground">光币余额</p>
          </div>

          <div class="flex items-center gap-1.5 mt-4" :style="{ color: 'var(--emerald-600)' }">
            <Leaf class="w-4 h-4" />
            <span class="text-sm font-medium">累计减碳: {{ carbonReduced }}kg</span>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="rounded-xl p-5" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Trophy class="w-5 h-5" :style="{ color: 'var(--amber-500)' }" />
              <h3 class="font-semibold text-foreground">减碳排行榜</h3>
            </div>
            <button class="text-sm font-medium flex items-center gap-0.5" :style="{ color: 'var(--emerald-600)' }">
              全部
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="user in topUsers" :key="user.id" class="flex items-center gap-3">
              <div
                class="relative w-10 h-10 rounded-full overflow-hidden border-2"
                :style="{ borderColor: getRankColor(user.rank) }"
              >
                <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                <div
                  class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  :style="{ backgroundColor: getRankColor(user.rank) }"
                >
                  {{ user.rank }}
                </div>
              </div>
              <div class="flex-1">
                <span class="text-sm font-medium text-foreground">{{ user.name }}</span>
                <div class="text-xs" :style="{ color: 'var(--emerald-600)' }">{{ user.carbon }}kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Tabs & Content -->
      <div class="col-span-2">
        <!-- Tab Navigation -->
        <div class="flex gap-4 mb-6">
          <button
            @click="activeTab = 'earn'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === 'earn' ? 'text-white' : 'text-muted-foreground'"
            :style="activeTab === 'earn' ? { backgroundColor: 'var(--emerald-500)' } : { backgroundColor: 'var(--muted)' }"
          >
            <Zap class="w-4 h-4" />
            赚取光币
          </button>
          <button
            @click="activeTab = 'redeem'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === 'redeem' ? 'text-white' : 'text-muted-foreground'"
            :style="activeTab === 'redeem' ? { backgroundColor: 'var(--emerald-500)' } : { backgroundColor: 'var(--muted)' }"
          >
            <Gift class="w-4 h-4" />
            兑换好礼
          </button>
        </div>

        <!-- Earn Content -->
        <div v-if="activeTab === 'earn'" class="space-y-3">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="rounded-xl p-4 flex items-center gap-4"
            :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: task.iconBg }"
            >
              <component :is="task.icon" class="w-6 h-6" :style="{ color: task.iconColor }" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-foreground font-medium">{{ task.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ task.subtitle }}</p>
              <div v-if="task.status === 'progress' && task.progress !== undefined" class="mt-2">
                <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>进度</span>
                  <span>{{ task.progress }}/{{ task.maxProgress }}天</span>
                </div>
                <div class="h-1.5 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{
                      width: `${(task.progress / task.maxProgress) * 100}%`,
                      backgroundColor: 'var(--emerald-500)'
                    }"
                  />
                </div>
              </div>
            </div>
            <div class="flex-shrink-0">
              <div
                v-if="task.status === 'done'"
                class="flex items-center gap-1 text-sm font-medium"
                :style="{ color: 'var(--emerald-600)' }"
              >
                <CheckCircle class="w-4 h-4" />
                已完成
              </div>
              <div v-else-if="task.status === 'progress'" class="text-sm font-medium" :style="{ color: 'var(--amber-500)' }">
                +{{ task.reward }}
              </div>
              <button
                v-else
                class="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                :style="{
                  border: '1px solid var(--emerald-500)',
                  color: 'var(--emerald-600)',
                  backgroundColor: 'transparent'
                }"
              >
                +{{ task.reward }}
              </button>
            </div>
          </div>
        </div>

        <!-- Redeem Content -->
        <div v-else class="grid grid-cols-2 gap-4">
          <div
            v-for="gift in gifts"
            :key="gift.id"
            class="rounded-xl p-4"
            :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
          >
            <div class="aspect-square rounded-lg mb-3 overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
              <img :src="gift.image" :alt="gift.title" class="w-full h-full object-cover" />
            </div>
            <h3 class="text-foreground font-medium text-sm mb-2 truncate">{{ gift.title }}</h3>
            <div class="flex items-center gap-1 text-sm font-semibold mb-3" :style="{ color: 'var(--amber-500)' }">
              <Coins class="w-4 h-4" />
              {{ gift.price }}
            </div>
            <button
              class="w-full text-white text-sm font-medium py-2 rounded-lg transition-colors hover:opacity-90"
              :style="{ backgroundColor: 'var(--emerald-500)' }"
            >
              立即兑换
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Leaf,
  Coins,
  Gift,
  CheckCircle,
  Upload,
  Zap,
  Share2,
  ShoppingBag,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-vue-next'
import { supabase } from '@lib/supabase'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const activeTab = ref('earn')
const balance = ref(0)
const carbonReduced = ref(0)

const tasks = ref([])
const gifts = ref([])
const topUsers = ref([])

const loadUserData = async () => {
  if (!props.user) return

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins, carbon_reduced')
      .eq('id', props.user.id)
      .single()

    if (profileError) throw profileError

    balance.value = profile?.coins || 0
    carbonReduced.value = profile?.carbon_reduced || 0
  } catch (error) {
    console.error('Load user data error:', error)
  }
}

const loadGifts = async () => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    gifts.value = data || []
  } catch (error) {
    console.error('Load gifts error:', error)
  }
}

const loadLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, carbon_reduced')
      .order('carbon_reduced', { ascending: false })
      .limit(10)

    if (error) throw error

    topUsers.value = (data || []).map((user, index) => ({
      id: index + 1,
      name: user.username || '未知用户',
      avatar: user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
      carbon: user.carbon_reduced || 0,
      rank: index + 1
    }))
  } catch (error) {
    console.error('Load leaderboard error:', error)
  }
}

onMounted(() => {
  loadUserData()
  loadGifts()
  loadLeaderboard()
})

const getRankColor = (rank) => {
  if (rank === 1) return 'var(--amber-400)'
  if (rank === 2) return '#9ca3af'
  return 'var(--amber-700)'
}
</script>
