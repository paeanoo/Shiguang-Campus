<template>
  <div class="min-h-screen" style="background-color: var(--background)">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style="background-color: rgba(253, 251, 247, 0.8); border-bottom: 1px solid var(--border)">
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" @click.prevent="currentPage = 'home'" class="text-xl font-semibold tracking-wide font-serif" style="color: var(--foreground)">
          拾光志
        </a>
        <div class="flex items-center gap-4">
          <button @click="openLogin" class="text-sm transition-colors" style="color: var(--muted-foreground)" @mouseenter="$event.target.style.color = 'var(--foreground)'" @mouseleave="$event.target.style.color = 'var(--muted-foreground)'">
            登录
          </button>
          <button @click="openRegister" class="text-sm font-medium text-white rounded-full px-5 py-2 transition-colors" style="background-color: var(--amber-600)" @mouseenter="$event.target.style.backgroundColor = 'var(--amber-700)'" @mouseleave="$event.target.style.backgroundColor = 'var(--amber-600)'">
            注册
          </button>
        </div>
      </div>
    </header>

    <!-- Auth Modal -->
    <div v-if="authModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 backdrop-blur-sm" style="background-color: rgba(45, 42, 38, 0.2)" @click="authModalOpen = false"></div>
      <div class="relative w-full max-w-sm mx-4 rounded-xl shadow-2xl" style="background-color: var(--card); border: 1px solid var(--border)">
        <button @click="authModalOpen = false" class="absolute top-4 right-4 p-1 rounded-lg transition-colors" style="color: var(--muted-foreground)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold mb-2 font-serif" style="color: var(--foreground)">
              {{ authMode === 'login' ? '欢迎回来' : '加入拾光志' }}
            </h2>
            <p class="text-sm" style="color: var(--muted-foreground)">
              {{ authMode === 'login' ? '登录以继续你的校园之旅' : '开启你的拾光之旅' }}
            </p>
          </div>
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="space-y-2">
              <label class="text-sm font-medium" style="color: var(--foreground)">学号</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--muted-foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <input v-model="studentId" type="text" placeholder="请输入你的学号" class="w-full pl-10 h-11 rounded-xl outline-none" style="background-color: var(--background); border: 1px solid var(--border)">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium" style="color: var(--foreground)">密码</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--muted-foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input v-model="password" type="password" placeholder="••••••••" class="w-full pl-10 h-11 rounded-xl outline-none" style="background-color: var(--background); border: 1px solid var(--border)">
              </div>
            </div>
            <button type="submit" class="w-full h-11 text-white rounded-xl text-sm font-medium transition-colors" style="background-color: var(--amber-600)">
              {{ authMode === 'login' ? '登录' : '注册' }}
            </button>
          </form>
          <div class="mt-6 text-center text-sm">
            <span style="color: var(--muted-foreground)">{{ authMode === 'login' ? '还没有账户？' : '已有账户？' }}</span>
            <button @click="authMode = authMode === 'login' ? 'register' : 'login'" class="font-medium ml-1" style="color: var(--amber-600)">
              {{ authMode === 'login' ? '立即注册' : '立即登录' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="pt-16">
      <!-- Home Page -->
      <section v-if="currentPage === 'home'" class="max-w-5xl mx-auto px-6 py-20">
        <div class="text-center mb-16">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight font-serif" style="color: var(--foreground)">
            在拾光志，看见校园的每一面
          </h1>
          <p class="text-base max-w-md mx-auto leading-relaxed" style="color: var(--muted-foreground)">
            记录精彩瞬间 · 益起传递温暖
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <!-- 拾光·活动 Card -->
          <a href="#" @click.prevent="currentPage = 'activities'" class="group">
            <div class="h-full rounded-xl overflow-hidden transition-all duration-300" style="background-color: var(--card); border: 1px solid var(--border)" @mouseenter="$event.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; $event.currentTarget.style.borderColor = 'var(--amber-300)'" @mouseleave="$event.currentTarget.style.boxShadow = 'none'; $event.currentTarget.style.borderColor = 'var(--border)'">
              <div class="aspect-[4/3] flex items-center justify-center relative overflow-hidden" style="background-color: var(--amber-50)">
                <div class="absolute inset-0 opacity-50" style="background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px); background-size: 20px 20px"></div>
                <div class="relative">
                  <div class="w-20 h-20 rounded-xl shadow-sm flex items-center justify-center" style="background-color: white">
                    <svg class="w-10 h-10" style="color: var(--amber-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                </div>
              </div>
              <div class="p-6">
                <h2 class="text-xl font-semibold mb-2 font-serif" style="color: var(--amber-700)">拾光·活动</h2>
                <p class="text-sm mb-4 leading-relaxed" style="color: var(--muted-foreground)">发现身边的讲座、演出与赛事。</p>
                <div class="flex items-center text-sm font-medium transition-all" style="color: var(--amber-600)">
                  <span>探索时光</span>
                  <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </a>

          <!-- 益起·流转 Card -->
          <a href="#" @click.prevent="currentPage = 'marketplace'" class="group">
            <div class="h-full rounded-xl overflow-hidden transition-all duration-300" style="background-color: var(--card); border: 1px solid var(--border)" @mouseenter="$event.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; $event.currentTarget.style.borderColor = 'var(--teal-300)'" @mouseleave="$event.currentTarget.style.boxShadow = 'none'; $event.currentTarget.style.borderColor = 'var(--border)'">
              <div class="aspect-[4/3] flex items-center justify-center relative overflow-hidden" style="background-color: var(--teal-50)">
                <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px"></div>
                <div class="relative">
                  <div class="w-20 h-20 rounded-xl shadow-sm flex items-center justify-center" style="background-color: white">
                    <svg class="w-10 h-10" style="color: var(--teal-600)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                  </div>
                </div>
              </div>
              <div class="p-6">
                <h2 class="text-xl font-semibold mb-2 font-serif" style="color: var(--teal-700)">益起·流转</h2>
                <p class="text-sm mb-4 leading-relaxed" style="color: var(--muted-foreground)">闲置物品循环，让爱意在校园流动。</p>
                <div class="flex items-center text-sm font-medium transition-all" style="color: var(--teal-600)">
                  <span>逛逛市集</span>
                  <svg class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <!-- Activities Page -->
      <section v-else-if="currentPage === 'activities'" class="max-w-5xl mx-auto px-6 py-8">
        <div class="mb-8">
          <button @click="currentPage = 'home'" class="text-sm mb-4 flex items-center gap-1" style="color: var(--muted-foreground)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            返回
          </button>
          <h1 class="text-2xl font-semibold mb-2 font-serif" style="color: var(--amber-700)">拾光·活动</h1>
          <p class="text-sm" style="color: var(--muted-foreground)">发现身边的讲座、演出与赛事</p>
        </div>

        <div class="flex gap-8">
          <!-- Calendar -->
          <div class="w-72 flex-shrink-0">
            <div class="rounded-xl p-5" style="background-color: var(--card); border: 1px solid var(--border)">
              <div class="flex items-center justify-between mb-4">
                <button @click="prevMonth" class="p-1.5 rounded-lg transition-colors" style="color: var(--muted-foreground)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <h3 class="text-sm font-medium" style="color: var(--foreground)">{{ currentMonthYear }}</h3>
                <button @click="nextMonth" class="p-1.5 rounded-lg transition-colors" style="color: var(--muted-foreground)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div v-for="day in weekDays" :key="day" class="text-center text-xs py-1" style="color: var(--muted-foreground)">{{ day }}</div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <button v-for="(day, index) in calendarDays" :key="index" @click="day.date && (selectedDate = day.date)" :disabled="!day.date" class="relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all" :class="{ 'invisible': !day.date }" :style="getDayStyle(day)">
                  {{ day.date?.getDate() }}
                  <span v-if="day.hasEvent && !day.isSelected" class="absolute bottom-1 w-1 h-1 rounded-full" style="background-color: var(--amber-600)"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Event List -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-6">
              <button v-for="tag in eventTags" :key="tag.value" @click="activeTag = tag.value" class="px-3 py-1.5 text-sm rounded-lg transition-all" :style="activeTag === tag.value ? 'background-color: var(--amber-600); color: white' : 'background-color: var(--muted); color: var(--muted-foreground)'">
                {{ tag.label }}
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="event in filteredEvents" :key="event.id" class="flex gap-4 rounded-xl p-4 transition-all duration-200" style="background-color: var(--card); border: 1px solid var(--border)" @mouseenter="$event.currentTarget.style.borderColor = 'var(--amber-300)'" @mouseleave="$event.currentTarget.style.borderColor = 'var(--border)'">
                <div class="flex-shrink-0 w-14 text-center">
                  <div class="rounded-lg py-2 px-2" style="background-color: var(--amber-50)">
                    <div class="text-lg font-semibold" style="color: var(--amber-700)">{{ event.day }}</div>
                    <div class="text-xs" style="color: var(--amber-600); opacity: 0.7">12月</div>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span class="inline-block px-2 py-0.5 text-xs font-medium rounded mb-1.5" :style="getTypeBadgeStyle(event.type)">{{ event.typeLabel }}</span>
                      <h3 class="text-base font-medium" style="color: var(--foreground)">{{ event.title }}</h3>
                    </div>
                    <button class="px-4 h-8 text-xs text-white rounded-lg flex-shrink-0 transition-colors" style="background-color: var(--amber-600)">报名</button>
                  </div>
                  <p class="text-sm mb-3 line-clamp-1" style="color: var(--muted-foreground)">{{ event.description }}</p>
                  <div class="flex items-center gap-4 text-xs" style="color: var(--muted-foreground)">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {{ event.time }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ event.location }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v-1a6 6 0 00-9-5.197"/></svg>
                      {{ event.participantCount }} 人
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Marketplace Page -->
      <section v-else-if="currentPage === 'marketplace'" class="max-w-5xl mx-auto px-6 py-8">
        <div class="mb-8">
          <button @click="currentPage = 'home'" class="text-sm mb-4 flex items-center gap-1" style="color: var(--muted-foreground)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            返回
          </button>
          <h1 class="text-2xl font-semibold mb-2 font-serif" style="color: var(--teal-700)">益起·流转</h1>
          <p class="text-sm" style="color: var(--muted-foreground)">闲置物品循环，让爱意在校园流动</p>
        </div>

        <div class="flex items-center gap-4 mb-8">
          <div class="relative flex-1 max-w-sm">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--muted-foreground)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input v-model="searchQuery" type="text" placeholder="搜索物品..." class="w-full pl-9 h-10 rounded-xl outline-none" style="background-color: var(--card); border: 1px solid var(--border)">
          </div>
          <div class="flex items-center gap-2">
            <button v-for="cat in categories" :key="cat.value" @click="activeCategory = cat.value" class="px-3 py-1.5 text-sm rounded-lg transition-all" :style="activeCategory === cat.value ? 'background-color: var(--teal-600); color: white' : 'background-color: var(--muted); color: var(--muted-foreground)'">
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div v-for="product in filteredProducts" :key="product.id" class="group rounded-xl overflow-hidden transition-all duration-200" style="background-color: var(--card); border: 1px solid var(--border)" @mouseenter="$event.currentTarget.style.borderColor = 'var(--teal-300)'" @mouseleave="$event.currentTarget.style.borderColor = 'var(--border)'">
            <div class="relative aspect-square overflow-hidden" style="background-color: var(--muted)">
              <img :src="product.image" :alt="product.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
              <div class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white" style="background-color: var(--teal-600)">公益</div>
            </div>
            <div class="p-4">
              <h3 class="text-sm font-medium mb-2 line-clamp-1" style="color: var(--foreground)">{{ product.title }}</h3>
              <div class="flex items-baseline gap-2 mb-3">
                <span class="text-lg font-semibold" style="color: var(--teal-700)">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="text-xs line-through" style="color: var(--muted-foreground)">¥{{ product.originalPrice }}</span>
              </div>
              <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border)">
                <div class="flex items-center gap-2">
                  <img :src="product.publisher.avatar" :alt="product.publisher.name" class="w-5 h-5 rounded-full object-cover">
                  <span class="text-xs" style="color: var(--muted-foreground)">{{ product.publisher.name }}</span>
                </div>
                <div class="flex items-center gap-1 text-xs" style="color: var(--muted-foreground)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  <span>{{ product.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Page state
const currentPage = ref('home')

// Auth modal state
const authModalOpen = ref(false)
const authMode = ref('login')
const studentId = ref('')
const password = ref('')

const openLogin = () => {
  authMode.value = 'login'
  authModalOpen.value = true
}

const openRegister = () => {
  authMode.value = 'register'
  authModalOpen.value = true
}

const handleSubmit = () => {
  authModalOpen.value = false
}

// Calendar state
const currentDate = ref(new Date(2024, 11, 1))
const selectedDate = ref(null)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', {
    month: 'long',
    year: 'numeric',
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  const today = new Date()

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: null })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({
      date,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: selectedDate.value ? date.toDateString() === selectedDate.value.toDateString() : false,
      hasEvent: events.some((e) => e.day === d && e.month === month + 1),
    })
  }

  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const getDayStyle = (day) => {
  if (!day.date) return {}
  if (day.isSelected) return { backgroundColor: 'var(--amber-600)', color: 'white', fontWeight: '500' }
  if (day.isToday) return { backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)', fontWeight: '500' }
  return { color: 'var(--foreground)' }
}

// Events data
const events = [
  { id: 1, title: 'AI 技术前沿讲座', description: '清华大学客座教授分享最新人工智能研究成果', type: 'lecture', typeLabel: '讲座', day: 20, month: 12, time: '14:00-16:00', location: '图书馆报告厅', participantCount: 156 },
  { id: 2, title: '冬季篮球联赛决赛', description: '计算机学院 vs 商学院 年度总冠军争夺战', type: 'sports', typeLabel: '体育', day: 22, month: 12, time: '18:30-20:30', location: '主体育馆', participantCount: 89 },
  { id: 3, title: '校园音乐节', description: '一年一度的音乐盛会，现场乐队表演', type: 'club', typeLabel: '社团', day: 25, month: 12, time: '19:00-22:00', location: '学生活动中心', participantCount: 320 },
  { id: 4, title: '读书分享会', description: '本月主题：《人类简史》深度解读', type: 'lecture', typeLabel: '讲座', day: 28, month: 12, time: '15:00-17:00', location: '图书馆二楼', participantCount: 45 },
]

const eventTags = [
  { label: '全部', value: 'all' },
  { label: '讲座', value: 'lecture' },
  { label: '社团', value: 'club' },
  { label: '体育', value: 'sports' },
]

const activeTag = ref('all')

const filteredEvents = computed(() => {
  return activeTag.value === 'all' ? events : events.filter((e) => e.type === activeTag.value)
})

const getTypeBadgeStyle = (type) => {
  const styles = {
    lecture: 'background-color: var(--amber-100); color: var(--amber-700)',
    club: 'background-color: var(--orange-100); color: var(--orange-700)',
    sports: 'background-color: var(--yellow-100); color: var(--yellow-700)',
  }
  return styles[type] || 'background-color: var(--muted); color: var(--muted-foreground)'
}

// Marketplace data
const categories = [
  { label: '全部', value: 'all' },
  { label: '数码', value: 'digital' },
  { label: '书籍', value: 'books' },
  { label: '服饰', value: 'clothes' },
]

const products = [
  { id: 1, title: 'iPad Pro 11英寸 2021款', price: 3200, originalPrice: 6799, condition: '几乎全新', donationPercent: 15, category: 'digital', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', likes: 128, publisher: { name: '小明', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' } },
  { id: 2, title: '人类简史三部曲套装', price: 45, originalPrice: 168, condition: '品相良好', donationPercent: 20, category: 'books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', likes: 86, publisher: { name: '小红', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' } },
  { id: 3, title: '优衣库轻羽绒服 M码', price: 120, originalPrice: 499, condition: '品相良好', donationPercent: 15, category: 'clothes', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', likes: 52, publisher: { name: '小美', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' } },
  { id: 4, title: '索尼 WH-1000XM4 降噪耳机', price: 980, originalPrice: 2499, condition: '几乎全新', donationPercent: 18, category: 'digital', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', likes: 234, publisher: { name: '阿杰', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' } },
  { id: 5, title: '米家台灯 Pro', price: 85, originalPrice: 199, condition: '全新', donationPercent: 10, category: 'digital', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop', likes: 67, publisher: { name: '小丽', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' } },
  { id: 6, title: '樱桃轴机械键盘', price: 280, originalPrice: 599, condition: '品相良好', donationPercent: 15, category: 'digital', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop', likes: 156, publisher: { name: '小涛', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' } },
]

const searchQuery = ref('')
const activeCategory = ref('all')

const filteredProducts = computed(() => {
  return products
    .filter((p) => activeCategory.value === 'all' || p.category === activeCategory.value)
    .filter((p) => p.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@400;600&display=swap');

:root {
  --background: #fdfbf7;
  --foreground: #2d2a26;
  --card: #ffffff;
  --border: #e8e4de;
  --muted: #f5f3ef;
  --muted-foreground: #78756f;
  --amber-50: #fffbeb;
  --amber-100: #fef3c7;
  --amber-300: #fcd34d;
  --amber-600: #d97706;
  --amber-700: #b45309;
  --teal-50: #f0fdfa;
  --teal-300: #5eead4;
  --teal-600: #0d9488;
  --teal-700: #0f766e;
  --orange-100: #ffedd5;
  --orange-700: #c2410c;
  --yellow-100: #fef9c3;
  --yellow-700: #a16207;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.5;
}

.font-serif {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
</style>
