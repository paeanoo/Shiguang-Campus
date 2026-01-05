<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <router-link
          to="/"
          class="flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
          :style="{ color: 'var(--muted-foreground)' }"
        >
          <ArrowLeft class="w-4 h-4" />
          返回首页
        </router-link>
        <h1 class="text-2xl md:text-3xl font-semibold font-serif" :style="{ color: 'var(--foreground)' }">
          光币中心
        </h1>
        <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">
          赚取光币，兑换好礼，记录减碳足迹
        </p>
      </div>
    </section>

    <!-- Balance Card -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div
        class="rounded-2xl p-6 mb-8"
        :style="{ backgroundColor: 'var(--emerald-600)' }"
      >
        <div class="flex items-center justify-between text-white">
          <div>
            <p class="text-sm opacity-80 mb-1">我的光币</p>
            <p class="text-4xl font-bold">{{ authStore.coins }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm opacity-80 mb-1">累计减碳</p>
            <p class="text-2xl font-semibold">12.5 kg</p>
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            :style="{ backgroundColor: 'white', color: 'var(--emerald-700)' }"
          >
            赚取光币
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/30"
            style="color: white"
          >
            兑换好礼
          </button>
        </div>
      </div>

      <!-- Tasks Section -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Daily Tasks -->
        <div
          class="rounded-xl border p-6"
          :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <h2 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
            <Target class="w-5 h-5" :style="{ color: 'var(--emerald-600)' }" />
            每日任务
          </h2>
          <div class="space-y-3">
            <div
              v-for="task in dailyTasks"
              :key="task.id"
              class="flex items-center justify-between p-3 rounded-lg"
              :style="{ backgroundColor: task.completed ? 'var(--emerald-50)' : 'var(--secondary)' }"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: task.completed ? 'var(--emerald-100)' : 'var(--background)' }"
                >
                  <Check v-if="task.completed" class="w-4 h-4" :style="{ color: 'var(--emerald-600)' }" />
                  <component v-else :is="task.icon" class="w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" />
                </div>
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">{{ task.title }}</p>
                  <p class="text-xs" :style="{ color: 'var(--muted-foreground)' }">+{{ task.coins }} 光币</p>
                </div>
              </div>
              <button
                :disabled="task.completed"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                :style="task.completed
                  ? { backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }
                  : { backgroundColor: 'var(--emerald-600)', color: 'white' }"
              >
                {{ task.completed ? '已完成' : '去完成' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Rewards -->
        <div
          class="rounded-xl border p-6"
          :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <h2 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
            <Gift class="w-5 h-5" :style="{ color: 'var(--amber-600)' }" />
            热门兑换
          </h2>
          <div class="space-y-3">
            <div
              v-for="reward in rewards"
              :key="reward.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  :style="{ backgroundColor: 'var(--amber-50)' }"
                >
                  {{ reward.icon }}
                </div>
                <div>
                  <p class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">{{ reward.title }}</p>
                  <p class="text-xs" :style="{ color: 'var(--amber-600)' }">{{ reward.coins }} 光币</p>
                </div>
              </div>
              <button
                :disabled="authStore.coins < reward.coins"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                :style="authStore.coins >= reward.coins
                  ? { backgroundColor: 'var(--amber-600)', color: 'white' }
                  : { backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
              >
                兑换
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Target, Check, Gift, BookOpen, Recycle, Calendar } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const dailyTasks = ref([
  { id: 1, title: '完成签到', coins: 5, completed: true, icon: 'Check' },
  { id: 2, title: '浏览3个活动', coins: 10, completed: false, icon: 'Calendar' },
  { id: 3, title: '发布闲置物品', coins: 20, completed: false, icon: 'Recycle' },
  { id: 4, title: '阅读环保知识', coins: 5, completed: false, icon: 'BookOpen' }
])

const rewards = ref([
  { id: 1, title: '咖啡优惠券', coins: 50, icon: '☕' },
  { id: 2, title: '文创帆布袋', coins: 100, icon: '👜' },
  { id: 3, title: '校园定制水杯', coins: 150, icon: '🥤' },
  { id: 4, title: '电影票兑换券', coins: 200, icon: '🎬' }
])
</script>
