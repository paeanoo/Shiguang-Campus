<template>
  <section class="max-w-5xl mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight font-serif" :style="{ color: 'var(--foreground)' }">
        在拾光志，看见校园的每一面
      </h1>
      <p class="text-base max-w-md mx-auto leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">记录精彩瞬间 · 益起传递温暖</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <!-- 拾光·活动 Card -->
      <button @click="$emit('navigate', 'activities')" class="group text-left">
        <div
          class="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--amber-50)' }"
          >
            <div
              class="absolute inset-0 opacity-50"
              :style="{
                backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }"
            />
            <div class="relative">
              <div class="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                <svg class="w-8 h-8" :style="{ color: 'var(--amber-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-2 font-serif" :style="{ color: 'var(--amber-700)' }">
              拾光·活动
            </h2>
            <p class="text-sm mb-3 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">发现身边的讲座、演出与赛事。</p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--amber-600)' }">
              <span>探索时光</span>
              <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </button>

      <!-- 益起·流转 Card -->
      <button @click="$emit('navigate', 'marketplace')" class="group text-left">
        <div
          class="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--teal-50)' }"
          >
            <div class="relative">
              <div class="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                <svg class="w-8 h-8" :style="{ color: 'var(--teal-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-2 font-serif" :style="{ color: 'var(--teal-700)' }">
              益起·流转
            </h2>
            <p class="text-sm mb-3 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">闲置物品循环，让爱意在校园流动。</p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--teal-600)' }">
              <span>逛逛市集</span>
              <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </button>

      <!-- 光币中心 Card -->
      <button @click="$emit('navigate', 'coins')" class="group text-left">
        <div
          class="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--emerald-50)' }"
          >
            <div class="relative">
              <div class="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                <svg class="w-8 h-8" :style="{ color: 'var(--emerald-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-2 font-serif" :style="{ color: 'var(--emerald-600)' }">
              光币中心
            </h2>
            <p class="text-sm mb-3 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">赚取光币，兑换好礼，记录减碳足迹。</p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--emerald-600)' }">
              <span>查看光币</span>
              <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </button>

      <!-- 搭子广场 Card -->
      <button @click="$emit('navigate', 'buddy')" class="group text-left">
        <div
          class="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--blue-50)' }"
          >
            <div class="relative">
              <div class="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                <svg class="w-8 h-8" :style="{ color: 'var(--blue-500)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-semibold mb-2 font-serif" style="color: #1d4ed8">
              搭子广场
            </h2>
            <p class="text-sm mb-3 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">找个伴一起学习、运动、看演出。</p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--blue-500)' }">
              <span>找搭子</span>
              <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup>
defineEmits(['navigate'])
</script>
