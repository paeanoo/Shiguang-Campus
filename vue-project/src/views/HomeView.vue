<template>
  <section class="max-w-5xl mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <h1
        class="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight font-serif"
        :style="{ color: 'var(--foreground)' }"
      >
        在拾光志，看见校园的每一面
      </h1>
      <p
        class="text-base max-w-md mx-auto leading-relaxed"
        :style="{ color: 'var(--muted-foreground)' }"
      >
        记录精彩瞬间 · 益起传递温暖
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <!-- Feature Cards -->
      <router-link
        v-for="feature in features"
        :key="feature.id"
        :to="feature.path"
        class="group text-left"
      >
        <div
          class="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: feature.bgColor }"
          >
            <div class="relative">
              <div class="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                <component :is="feature.icon" class="w-8 h-8" :style="{ color: feature.iconColor }" />
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-2 font-serif" :style="{ color: feature.titleColor }">
              {{ feature.title }}
            </h2>
            <p class="text-sm mb-3 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">
              {{ feature.description }}
            </p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: feature.iconColor }">
              <span>{{ feature.cta }}</span>
              <ChevronRight class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Calendar, Gift, Coins, Users, ChevronRight } from 'lucide-vue-next'

const features = [
  {
    id: 'activities',
    path: '/activities',
    title: '拾光·活动',
    description: '发现身边的讲座、演出与赛事。',
    cta: '探索时光',
    icon: Calendar,
    bgColor: 'var(--amber-50)',
    iconColor: 'var(--amber-600)',
    titleColor: 'var(--amber-700)'
  },
  {
    id: 'marketplace',
    path: '/marketplace',
    title: '益起·流转',
    description: '闲置物品循环，让爱意在校园流动。',
    cta: '逛逛市集',
    icon: Gift,
    bgColor: 'var(--teal-50)',
    iconColor: 'var(--teal-600)',
    titleColor: 'var(--teal-700)'
  },
  {
    id: 'coins',
    path: '/coins',
    title: '光币中心',
    description: '赚取光币，兑换好礼，记录减碳足迹。',
    cta: '查看光币',
    icon: Coins,
    bgColor: 'var(--emerald-50)',
    iconColor: 'var(--emerald-600)',
    titleColor: 'var(--emerald-600)'
  },
  {
    id: 'buddy',
    path: '/buddy',
    title: '搭子广场',
    description: '找个伴一起学习、运动、看演出。',
    cta: '找搭子',
    icon: Users,
    bgColor: 'var(--blue-50)',
    iconColor: 'var(--blue-500)',
    titleColor: 'var(--blue-700)'
  }
]
</script>
