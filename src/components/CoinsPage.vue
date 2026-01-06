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
          <button
            @click="activeTab = 'records'"
            class="text-sm font-medium flex items-center gap-1"
            :style="{ color: 'var(--emerald-600)' }"
          >
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
            @click="handleCheckIn"
            :disabled="isCheckingIn || !canCheckInToday"
            class="absolute top-4 right-4 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:shadow-lg transition-shadow"
            :class="{ 'opacity-50 cursor-not-allowed': !canCheckInToday }"
            :style="{ backgroundColor: 'var(--emerald-500)' }"
          >
            <Sparkles class="w-3.5 h-3.5" />
            {{ isCheckingIn ? '签到中...' : canCheckInToday ? '每日签到' : '已签到' }}
          </button>

          <div class="pt-4 pb-2">
            <div class="flex items-center gap-2 mb-1">
              <Coins class="w-7 h-7" :style="{ color: 'var(--amber-500)' }" />
              <span class="text-4xl font-bold text-foreground">{{ balance.toLocaleString() }}</span>
            </div>
            <p class="text-sm text-muted-foreground">光币余额</p>
            <p v-if="checkInStreak > 0" class="text-xs text-muted-foreground mt-1">连续签到 {{ checkInStreak }} 天</p>
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
          <button
            @click="activeTab = 'records'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === 'records' ? 'text-white' : 'text-muted-foreground'"
            :style="activeTab === 'records' ? { backgroundColor: 'var(--emerald-500)' } : { backgroundColor: 'var(--muted)' }"
          >
            <CheckCircle class="w-4 h-4" />
            兑换记录
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
              :style="{ backgroundColor: getTaskIconColors(task.task_type).bg }"
            >
              <component :is="getTaskIcon(task.task_type)" class="w-6 h-6" :style="{ color: getTaskIconColors(task.task_type).color }" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-foreground font-medium">{{ task.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ task.description }}</p>
              <div v-if="task.user_task && task.user_task.status === 'in_progress'" class="mt-2">
                <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>进度</span>
                  <span>{{ task.user_task.progress || 0 }}/{{ task.requirements?.count || 1 }}</span>
                </div>
                <div class="h-1.5 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{
                      width: `${((task.user_task.progress || 0) / (task.requirements?.count || 1)) * 100}%`,
                      backgroundColor: 'var(--emerald-500)'
                    }"
                  />
                </div>
              </div>
            </div>
            <div class="flex-shrink-0 flex items-center gap-2">
              <div class="text-sm text-muted-foreground">
                +{{ task.reward_coins }}币 +{{ task.reward_carbon }}kg
              </div>
              <div
                v-if="task.user_task && task.user_task.status === 'claimed'"
                class="flex items-center gap-1 text-sm font-medium"
                :style="{ color: 'var(--emerald-600)' }"
              >
                <CheckCircle class="w-4 h-4" />
                已完成
              </div>
              <button
                v-else-if="task.user_task && task.user_task.status === 'completed'"
                @click="handleClaimTask(task)"
                class="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                :style="{
                  backgroundColor: 'var(--emerald-500)',
                  color: 'white'
                }"
              >
                领取
              </button>
              <button
                v-else
                @click="handleCompleteTask(task)"
                class="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                :style="{
                  border: '1px solid var(--emerald-500)',
                  color: 'var(--emerald-600)',
                  backgroundColor: 'transparent'
                }"
              >
                去完成
              </button>
            </div>
          </div>
        </div>

        <!-- Redeem Content -->
        <div v-else-if="activeTab === 'redeem'" class="grid grid-cols-2 gap-4">
          <div
            v-for="gift in gifts"
            :key="gift.id"
            class="rounded-xl p-4"
            :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
          >
            <div class="aspect-square rounded-lg mb-3 overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
              <img :src="gift.image_url || '/placeholder.svg'" :alt="gift.title" class="w-full h-full object-cover" />
            </div>
            <h3 class="text-foreground font-medium text-sm mb-2 truncate">{{ gift.title }}</h3>
            <p class="text-xs text-muted-foreground mb-2 line-clamp-2">{{ gift.description }}</p>
            <div class="flex items-center gap-1 text-sm font-semibold mb-3" :style="{ color: 'var(--amber-500)' }">
              <Coins class="w-4 h-4" />
              {{ gift.price }}
            </div>
            <button
              @click="handleRedeemGift(gift)"
              :disabled="balance < gift.price"
              class="w-full text-sm font-medium py-2 rounded-lg transition-colors hover:opacity-90"
              :class="[{ 'opacity-50 cursor-not-allowed text-muted-foreground': balance < gift.price }, balance >= gift.price ? 'text-white' : '']"
              :style="{ backgroundColor: balance >= gift.price ? 'var(--emerald-500)' : 'var(--muted)' }"
            >
              {{ balance < gift.price ? '光币不足' : '立即兑换' }}
            </button>
          </div>
        </div>

        <!-- Records Content -->
        <div v-else class="space-y-3">
          <div v-if="redemptionRecords.length === 0" class="text-center py-8 text-muted-foreground">
            <Gift class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无兑换记录</p>
          </div>
          <div
            v-else
            v-for="record in redemptionRecords"
            :key="record.id"
            class="rounded-xl p-4 flex items-center gap-4"
            :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: 'var(--emerald-50)' }"
            >
              <Gift class="w-6 h-6" :style="{ color: 'var(--emerald-500)' }" />
            </div>
            <div class="flex-1">
              <h3 class="text-foreground font-medium">{{ record.gift_title || record.gifts?.title }}</h3>
              <p class="text-sm text-muted-foreground">
                兑换码: {{ record.redemption_code }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ new Date(record.created_at).toLocaleString('zh-CN') }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="{
                  'bg-green-100 text-green-700': record.status === 'completed',
                  'bg-red-100 text-red-700': record.status === 'expired',
                  'bg-yellow-100 text-yellow-700': record.status === 'pending'
                }"
              >
                {{ record.status === 'completed' ? '已兑换' : record.status === 'expired' ? '已过期' : '待兑换' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Redemption Modal -->
    <div v-if="showRedemptionModal && currentRedemption" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 backdrop-blur-sm"
        :style="{ backgroundColor: 'rgba(45, 42, 38, 0.2)' }"
        @click="showRedemptionModal = false"
      />
      <div
        class="relative w-full max-w-md mx-4 rounded-xl shadow-2xl p-6"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
      >
        <button
          @click="showRedemptionModal = false"
          class="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="text-center mb-6">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            :style="{ backgroundColor: 'var(--emerald-50)' }"
          >
            <Check class="w-8 h-8" :style="{ color: 'var(--emerald-500)' }" />
          </div>
          <h2 class="text-xl font-semibold text-foreground mb-2">兑换成功！</h2>
          <p class="text-sm text-muted-foreground">
            恭喜您成功兑换 {{ currentRedemption.gift_title }}
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="bg-muted p-4 rounded-lg">
            <div class="text-center">
              <p class="text-sm text-muted-foreground mb-2">兑换码</p>
              <p class="text-2xl font-bold text-foreground font-mono">
                {{ currentRedemption.redemption_code }}
              </p>
            </div>
          </div>

          <div class="text-sm text-muted-foreground">
            <h3 class="font-medium text-foreground mb-2">兑换说明：</h3>
            <p>{{ currentRedemption.redemption_instructions }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="generateReceipt"
            class="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors hover:opacity-90"
            :style="{
              border: '1px solid var(--emerald-500)',
              color: 'var(--emerald-600)',
              backgroundColor: 'transparent',
            }"
          >
            <Printer class="w-4 h-4" />
            打印小票
          </button>
          <button
            @click="copyRedemptionCode"
            class="flex-1 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-500)' }"
          >
            复制兑换码
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
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
  ChevronLeft,
  User,
  Calendar,
  Check,
  X,
  Printer,
  Download
} from 'lucide-vue-next'
import { supabase } from '@lib/supabase'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['navigate'])

const activeTab = ref('earn')
const balance = ref(0)
const carbonReduced = ref(0)
const checkInStreak = ref(0)
const lastCheckInDate = ref(null)
const isCheckingIn = ref(false)

const tasks = ref([])
const gifts = ref([])
const topUsers = ref([])
const redemptionRecords = ref([])
const showRedemptionModal = ref(false)
const currentRedemption = ref(null)

// 加载用户数据
const loadUserData = async () => {
  if (!props.user) return

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('coins, carbon_reduced, last_check_in_date, check_in_streak')
      .eq('id', props.user.id)
      .single()

    if (error) throw error

    const rawLast = profile?.last_check_in_date || null
    const dateOnly = rawLast ? String(rawLast).split('T')[0] : null

    balance.value = profile?.coins || 0
    carbonReduced.value = profile?.carbon_reduced || 0
    checkInStreak.value = profile?.check_in_streak || 0
    lastCheckInDate.value = dateOnly
  } catch (error) {
    console.error('Load user data error:', error)
  }
}

// 加载任务数据
const loadTasks = async () => {
  try {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (tasksError) throw tasksError

    if (props.user) {
      const { data: userTasks, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', props.user.id)

      if (userTasksError) throw userTasksError

      tasks.value = tasksData.map(task => ({
        ...task,
        user_task: userTasks.find(ut => ut.task_id === task.id)
      }))
    } else {
      tasks.value = tasksData
    }
  } catch (error) {
    console.error('Load tasks error:', error)
  }
}

// 加载礼品数据
const loadGifts = async () => {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    gifts.value = data || []
  } catch (error) {
    console.error('Load gifts error:', error)
  }
}

// 复制兑换码，兼容没有 navigator.clipboard 的环境
const copyRedemptionCode = (evt) => {
  try {
    const code = currentRedemption.value?.redemption_code
    if (!code) return

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(code).then(() => {
        alert('兑换码已复制到剪贴板')
      }).catch(() => {
        // fallback
        const ta = document.createElement('textarea')
        ta.value = code
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        alert('兑换码已复制到剪贴板')
      })
    } else {
      // old fallback
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('兑换码已复制到剪贴板')
    }
  } catch (err) {
    console.error('Copy redemption code error:', err)
  }
}

// 加载排行榜
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

// 加载兑换记录
const loadRedemptionRecords = async () => {
  if (!props.user) return

  try {
    const { data, error } = await supabase
      .from('gift_redemptions')
      .select(`
        *,
        gifts(title)
      `)
      .eq('user_id', props.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    redemptionRecords.value = data || []
  } catch (error) {
    console.error('Load redemption records error:', error)
  }
}

// 签到功能
const handleCheckIn = async () => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  isCheckingIn.value = true

  try {
    const { data, error } = await supabase.rpc('perform_check_in', {
      user_uuid: props.user.id
    })

    if (error) throw error

    if (data.success) {
      const rewardCoins = data.reward_coins || 0
      const rewardCarbon = data.reward_carbon || 0
      const newLastCheckInDate = new Date().toISOString().split('T')[0]

      if (rewardCoins > 0) {
        alert(`签到成功！获得 ${rewardCoins} 光币和 ${rewardCarbon}kg 碳减排值`)
      } else {
        alert('签到成功')
      }

      lastCheckInDate.value = newLastCheckInDate
      loadUserData()
    } else {
      alert(data.message || '签到失败')
    }
  } catch (error) {
    console.error('Check-in error:', error)
    alert('签到失败: ' + error.message)
  } finally {
    isCheckingIn.value = false
  }
}

// 完成任务
const handleCompleteTask = async (task) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  // 根据任务类型跳转到对应页面
  switch (task.task_type) {
    case 'publish_product':
      emit('navigate', 'marketplace')
      // fallback if parent doesn't handle navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/marketplace'
      }
      break
    case 'check_in':
      await handleCheckIn()
      break
    case 'join_event':
      emit('navigate', 'activities')
      break
    case 'share':
      if (navigator.share) {
        navigator.share({
          title: '拾光志 - 校园闲置物品循环平台',
          text: '加入拾光志，发现校园的每一面美好',
          url: window.location.origin
        })
      } else {
        navigator.clipboard.writeText(window.location.origin)
        alert('链接已复制到剪贴板，快去分享给好友吧！')
      }
      break
    case 'complete_profile':
      emit('navigate', 'settings')
      break
    default:
      // 直接完成任务
      try {
        const { data, error } = await supabase.rpc('complete_task', {
          user_uuid: props.user.id,
          task_uuid: task.id
        })

        if (error) throw error

        if (data.success) {
          alert(`任务完成！获得 ${data.reward_coins} 光币和 ${data.reward_carbon}kg 碳减排值`)
          loadTasks()
          loadUserData()
        } else {
          alert(data.message || '任务完成失败')
        }
      } catch (error) {
        console.error('Complete task error:', error)
        alert('任务完成失败: ' + error.message)
      }
  }
}

// 领取任务奖励
const handleClaimTask = async (task) => {
  if (!props.user || !task.user_task) return

  try {
    const { data, error } = await supabase.rpc('claim_task_reward', {
      user_uuid: props.user.id,
      task_uuid: task.id
    })

    if (error) throw error

    if (data.success) {
      alert(`奖励领取成功！获得 ${data.reward_coins} 光币和 ${data.reward_carbon}kg 碳减排值`)
      loadTasks()
      loadUserData()
    } else {
      alert(data.message || '领取失败')
    }
  } catch (error) {
    console.error('Claim task error:', error)
    alert('领取失败: ' + error.message)
  }
}

// 兑换礼品
const handleRedeemGift = async (gift) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  if (balance.value < gift.price) {
    alert('光币不足')
    return
  }

    try {
    const { data, error } = await supabase.rpc('redeem_gift', {
      user_uuid: props.user.id,
      gift_id: typeof gift.id === 'string' && /^\d+$/.test(gift.id) ? Number(gift.id) : gift.id
    })

    if (error) throw error

    if (data.success) {
      currentRedemption.value = {
        ...data,
        gift_title: gift.title,
        redemption_instructions: gift.redemption_instructions
      }
      showRedemptionModal.value = true
      loadUserData()
      loadGifts()
    } else {
      alert(data.message || '兑换失败')
    }
  } catch (error) {
    console.error('Redeem gift error:', error)
    alert('兑换失败: ' + error.message)
  }
}

// 生成小票
const generateReceipt = () => {
  if (!currentRedemption.value) return

  const receiptHtml = `
    <div style="font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; border: 1px dashed #ccc;">
      <h2 style="text-align: center; margin-bottom: 20px;">拾光志 - 兑换小票</h2>
      <div style="margin-bottom: 15px;">
        <strong>兑换码:</strong> ${currentRedemption.value.redemption_code}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>礼品名称:</strong> ${currentRedemption.value.gift_title}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>消费光币:</strong> ${currentRedemption.value.price}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>兑换时间:</strong> ${new Date().toLocaleString('zh-CN')}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>兑换说明:</strong><br>
        ${currentRedemption.value.redemption_instructions}
      </div>
      <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
      <p style="text-align: center; font-size: 12px; color: #666;">
        请凭此小票到指定地点兑换礼品
      </p>
      <p style="text-align: center; font-size: 12px; color: #666;">
        感谢您参与校园环保事业！
      </p>
    </div>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(receiptHtml)
    printWindow.document.close()
    printWindow.print()
  }
}

const canCheckInToday = computed(() => {
  if (!lastCheckInDate.value) return true
  const today = new Date().toISOString().split('T')[0]
  return lastCheckInDate.value !== today
})

const getTaskIcon = (taskType) => {
  switch (taskType) {
    case 'check_in': return Calendar
    case 'publish_product': return Upload
    case 'complete_transaction': return ShoppingBag
    case 'share': return Share2
    case 'complete_profile': return User
    case 'join_event': return Zap
    default: return Zap
  }
}

const getTaskIconColors = (taskType) => {
  switch (taskType) {
    case 'check_in': return { bg: "var(--amber-50)", color: "var(--amber-500)" }
    case 'publish_product': return { bg: "var(--blue-50)", color: "var(--blue-500)" }
    case 'complete_transaction': return { bg: "var(--emerald-50)", color: "var(--emerald-500)" }
    case 'share': return { bg: "var(--purple-50)", color: "var(--purple-500)" }
    case 'complete_profile': return { bg: "var(--orange-50)", color: "var(--orange-500)" }
    case 'join_event': return { bg: "var(--pink-50)", color: "var(--pink-500)" }
    default: return { bg: "var(--gray-50)", color: "var(--gray-500)" }
  }
}

const getRankColor = (rank) => {
  if (rank === 1) return 'var(--amber-400)'
  if (rank === 2) return '#9ca3af'
  return 'var(--amber-700)'
}

onMounted(() => {
  loadUserData()
  loadTasks()
  loadGifts()
  loadLeaderboard()
  loadRedemptionRecords()
})

// 如果父组件稍后传入 user（刷新后异步恢复 auth），监视并重新加载数据
watch(() => props.user, (newUser) => {
  if (newUser) {
    loadUserData()
    loadTasks()
    loadGifts()
    loadLeaderboard()
    loadRedemptionRecords()
  }
})
</script>
