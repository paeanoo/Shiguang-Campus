<template>
  <section class="max-w-5xl mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight font-serif text-foreground">
        在拾光志，看见校园的每一面
      </h1>
      <p class="text-base max-w-md mx-auto leading-relaxed text-muted-foreground">
        记录精彩瞬间 · 益起传递温暖
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <!-- 拾光·活动 Card -->
      <router-link to="/activities" class="group text-left block">
        <div
          class="h-full rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-white to-emerald-50 border border-transparent"
          :style="{ borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--amber-50)' }"
          >
            <div
              class="absolute inset-0 opacity-50"
              :style="{
                backgroundImage: 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }"
            />
            <div class="relative">
              <div class="w-18 h-18 rounded-full shadow-sm flex items-center justify-center bg-amber-100 text-amber-600 p-3">
                <Calendar class="w-9 h-9" />
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-bold mb-2 font-serif text-gray-800">
              拾光·活动
            </h2>
            <p class="text-sm mb-3 leading-relaxed text-gray-500">
              发现身边的讲座、演出与赛事。
            </p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--amber-600)' }">
              <span>探索时光</span>
              <ChevronRight class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </router-link>

      <!-- 益起·流转 Card -->
      <router-link to="/marketplace" class="group text-left block">
        <div
          class="h-full rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-white to-emerald-50 border border-transparent"
          :style="{ borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--teal-50)' }"
          >
            <div
              class="absolute inset-0 opacity-20"
              :style="{
                backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }"
            />
            <div class="relative">
              <div class="w-18 h-18 rounded-full shadow-sm flex items-center justify-center bg-teal-100 text-teal-600 p-3">
                <Gift class="w-9 h-9" />
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-bold mb-2 font-serif text-gray-800">
              益起·流转
            </h2>
            <p class="text-sm mb-3 leading-relaxed text-gray-500">
              闲置物品循环，让爱意在校园流动。
            </p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--teal-600)' }">
              <span>逛逛市集</span>
              <ChevronRight class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </router-link>

      <!-- 光币中心 Card -->
      <router-link to="/coins" class="group text-left block">
        <div
          class="h-full rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-white to-emerald-50 border border-transparent"
          :style="{ borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--emerald-50)' }"
          >
            <div
              class="absolute inset-0 opacity-30"
              :style="{
                backgroundImage: 'radial-gradient(circle, #d1fae5 2px, transparent 2px)',
                backgroundSize: '16px 16px'
              }"
            />
            <div class="relative">
              <div class="w-18 h-18 rounded-full shadow-sm flex items-center justify-center bg-emerald-100 text-emerald-600 p-3">
                <Coins class="w-9 h-9" />
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-bold mb-2 font-serif text-gray-800">
              光币中心
            </h2>
            <p class="text-sm mb-3 leading-relaxed text-gray-500">
              赚取光币，兑换好礼，记录减碳足迹。
            </p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--emerald-600)' }">
              <span>查看光币</span>
              <ChevronRight class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </router-link>

      <!-- 搭子广场 Card -->
      <router-link to="/buddy" class="group text-left block">
        <div
          class="h-full rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-gradient-to-br from-white to-emerald-50 border border-transparent"
          :style="{ borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundColor: 'var(--blue-50)' }"
          >
            <div
              class="absolute inset-0 opacity-30"
              :style="{
                backgroundImage: 'linear-gradient(135deg, #dbeafe 25%, transparent 25%), linear-gradient(225deg, #dbeafe 25%, transparent 25%)',
                backgroundSize: '24px 24px'
              }"
            />
            <div class="relative">
              <div class="w-18 h-18 rounded-full shadow-sm flex items-center justify-center bg-blue-100 text-blue-600 p-3">
                <Users class="w-9 h-9" />
              </div>
            </div>
          </div>
          <div class="p-5">
            <h2 class="text-lg font-bold mb-2 font-serif text-gray-800">
              搭子广场
            </h2>
            <p class="text-sm mb-3 leading-relaxed text-gray-500">
              找个伴一起学习、运动、看演出。
            </p>
            <div class="flex items-center text-sm font-medium transition-all" :style="{ color: 'var(--blue-500)' }">
              <span>找搭子</span>
              <ChevronRight class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { Calendar, Gift, Coins, Users, ChevronRight } from 'lucide-vue-next'
</script>
