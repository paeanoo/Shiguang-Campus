<template>
  <section class="max-w-5xl mx-auto px-6 py-8">
    <div class="mb-8">
      <button
        @click="$emit('back')"
        class="text-sm mb-4 flex items-center gap-1 transition-colors"
        :style="{ color: 'var(--muted-foreground)' }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--emerald-600)' }">
            光币中心
          </h1>
          <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">赚取光币，兑换好礼，记录减碳足迹</p>
        </div>
        <button class="text-sm font-medium flex items-center gap-1" :style="{ color: 'var(--emerald-600)' }">
          兑换记录
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
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
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
            每日签到
          </button>

          <div class="pt-4 pb-2">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-7 h-7" :style="{ color: 'var(--amber-500)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-4xl font-bold" :style="{ color: 'var(--foreground)' }">{{ balance.toLocaleString() }}</span>
            </div>
            <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">光币余额</p>
          </div>

          <div class="flex items-center gap-1.5 mt-4" :style="{ color: 'var(--emerald-600)' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
            <span class="text-sm font-medium">累计减碳: {{ carbonReduced }}kg</span>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="rounded-xl p-5" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" :style="{ color: 'var(--amber-500)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              <h3 class="font-semibold" :style="{ color: 'var(--foreground)' }">减碳排行榜</h3>
            </div>
            <button class="text-sm font-medium flex items-center gap-0.5" :style="{ color: 'var(--emerald-600)' }">
              全部
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="user in topUsers" :key="user.id" class="flex items-center gap-3">
              <div
                class="relative w-10 h-10 rounded-full overflow-hidden border-2"
                :style="{
                  borderColor: user.rank === 1 ? 'var(--amber-400)' : user.rank === 2 ? '#9ca3af' : 'var(--amber-700)',
                }"
              >
                <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                <div
                  class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  :style="{
                    backgroundColor: user.rank === 1 ? 'var(--amber-400)' : user.rank === 2 ? '#9ca3af' : 'var(--amber-700)',
                  }"
                >
                  {{ user.rank }}
                </div>
              </div>
              <div class="flex-1">
                <span class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">{{ user.name }}</span>
                <div class="text-xs" :style="{ color: 'var(--emerald-600)' }">
                  {{ user.carbon }}kg
                </div>
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
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            赚取光币
          </button>
          <button
            @click="activeTab = 'redeem'"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === 'redeem' ? 'text-white' : 'text-muted-foreground'"
            :style="activeTab === 'redeem' ? { backgroundColor: 'var(--emerald-500)' } : { backgroundColor: 'var(--muted)' }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
            </svg>
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
              <component :is="task.iconComponent" class="w-6 h-6" :style="{ color: task.iconColor }" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium" :style="{ color: 'var(--foreground)' }">{{ task.title }}</h3>
              <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">{{ task.subtitle }}</p>
              <div v-if="task.status === 'progress' && task.progress !== undefined" class="mt-2">
                <div class="flex items-center justify-between text-xs mb-1" :style="{ color: 'var(--muted-foreground)' }">
                  <span>进度</span>
                  <span>{{ task.progress }}/{{ task.maxProgress }}天</span>
                </div>
                <div class="h-1.5 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{
                      width: `${(task.progress / task.maxProgress) * 100}%`,
                      backgroundColor: 'var(--emerald-500)',
                    }"
                  />
                </div>
              </div>
            </div>
            <div class="flex-shrink-0">
              <div v-if="task.status === 'done'" class="flex items-center gap-1 text-sm font-medium" :style="{ color: 'var(--emerald-600)' }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
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
                  backgroundColor: 'transparent',
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
            <h3 class="font-medium text-sm mb-2 truncate" :style="{ color: 'var(--foreground)' }">{{ gift.title }}</h3>
            <div class="flex items-center gap-1 text-sm font-semibold mb-3" :style="{ color: 'var(--amber-500)' }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
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
import { ref, h } from 'vue'

defineEmits(['back'])

const ZapIcon = {
  render() {
    return h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
    ])
  }
}

const UploadIcon = {
  render() {
    return h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' })
    ])
  }
}

const ShoppingBagIcon = {
  render() {
    return h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
    ])
  }
}

const ShareIcon = {
  render() {
    return h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' })
    ])
  }
}

const tasks = [
  {
    id: 1,
    iconComponent: ZapIcon,
    iconBg: "var(--amber-50)",
    iconColor: "var(--amber-500)",
    title: "每日签到",
    subtitle: "连续签到7天额外奖励",
    reward: 10,
    progress: 5,
    maxProgress: 7,
    status: "progress",
  },
  {
    id: 2,
    iconComponent: UploadIcon,
    iconBg: "var(--blue-50)",
    iconColor: "var(--blue-500)",
    title: "发布闲置物品",
    subtitle: "上传一件二手物品",
    reward: 50,
    status: "available",
  },
  {
    id: 3,
    iconComponent: ShoppingBagIcon,
    iconBg: "var(--emerald-50)",
    iconColor: "var(--emerald-500)",
    title: "完成一笔交易",
    subtitle: "成功买卖一件物品",
    reward: 100,
    status: "available",
  },
  {
    id: 4,
    iconComponent: ShareIcon,
    iconBg: "var(--purple-50)",
    iconColor: "var(--purple-500)",
    title: "分享给好友",
    subtitle: "邀请好友加入拾光志",
    reward: 30,
    status: "done",
  },
]

const gifts = [
  { id: 1, image: "/placeholder.svg?height=200&width=200", title: "校园咖啡券", price: 200 },
  { id: 2, image: "/placeholder.svg?height=200&width=200", title: "物品曝光卡", price: 150 },
  { id: 3, image: "/placeholder.svg?height=200&width=200", title: "精美笔记本", price: 300 },
  { id: 4, image: "/placeholder.svg?height=200&width=200", title: "多肉植物盆栽", price: 250 },
]

const topUsers = [
  { id: 1, name: "小明", avatar: "/placeholder.svg?height=100&width=100", carbon: 28.5, rank: 1 },
  { id: 2, name: "小红", avatar: "/placeholder.svg?height=100&width=100", carbon: 24.2, rank: 2 },
  { id: 3, name: "阿杰", avatar: "/placeholder.svg?height=100&width=100", carbon: 19.8, rank: 3 },
]

const activeTab = ref('earn')
const balance = ref(1280)
const carbonReduced = ref(5.2)
</script>
