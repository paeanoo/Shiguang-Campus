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
          拾光·活动
        </h1>
        <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">
          发现身边的讲座、演出与赛事
        </p>
      </div>
    </section>

    <!-- Filter Bar -->
    <section
      class="sticky top-16 z-10 border-b"
      :style="{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="activeCategory === category.id ? 'text-white' : 'hover:bg-muted'"
              :style="activeCategory === category.id
                ? { backgroundColor: 'var(--amber-600)' }
                : { backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
            >
              {{ category.label }}
            </button>
          </div>

          <div class="flex-1 md:max-w-sm md:ml-auto">
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                :style="{ color: 'var(--muted-foreground)' }"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索活动..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Activities Grid -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="rounded-xl border overflow-hidden transition-all hover:shadow-md"
          :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-video flex items-center justify-center"
            :style="{ backgroundColor: 'var(--amber-50)' }"
          >
            <Calendar class="w-12 h-12" :style="{ color: 'var(--amber-400)' }" />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :style="{ backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' }"
              >
                {{ activity.category }}
              </span>
            </div>
            <h3 class="font-semibold mb-2" :style="{ color: 'var(--foreground)' }">
              {{ activity.title }}
            </h3>
            <div class="space-y-1.5 text-sm" :style="{ color: 'var(--muted-foreground)' }">
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                <span>{{ activity.date }} {{ activity.time }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Users class="w-4 h-4" />
                <span>{{ activity.participants }}/{{ activity.maxParticipants }} 人已报名</span>
              </div>
            </div>
            <button
              class="w-full mt-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              :style="{ backgroundColor: 'var(--amber-600)' }"
            >
              立即报名
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredActivities.length === 0" class="text-center py-16">
        <Calendar class="w-12 h-12 mx-auto mb-4" :style="{ color: 'var(--muted-foreground)' }" />
        <p :style="{ color: 'var(--muted-foreground)' }">暂无匹配的活动</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Search, Calendar, Clock, MapPin, Users } from 'lucide-vue-next'

const activeCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'lecture', label: '讲座' },
  { id: 'concert', label: '演出' },
  { id: 'sports', label: '体育' },
  { id: 'exhibition', label: '展览' }
]

const activities = ref([
  {
    id: 1,
    title: '人工智能前沿技术讲座',
    category: '讲座',
    categoryId: 'lecture',
    date: '2024-04-15',
    time: '14:00',
    location: '图书馆报告厅',
    participants: 45,
    maxParticipants: 100
  },
  {
    id: 2,
    title: '校园音乐节',
    category: '演出',
    categoryId: 'concert',
    date: '2024-04-20',
    time: '18:00',
    location: '大学生活动中心',
    participants: 200,
    maxParticipants: 500
  },
  {
    id: 3,
    title: '春季运动会',
    category: '体育',
    categoryId: 'sports',
    date: '2024-04-28',
    time: '08:00',
    location: '田径场',
    participants: 350,
    maxParticipants: 1000
  },
  {
    id: 4,
    title: '毕业设计作品展',
    category: '展览',
    categoryId: 'exhibition',
    date: '2024-05-01',
    time: '09:00',
    location: '美术馆',
    participants: 80,
    maxParticipants: 200
  }
])

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const matchesCategory = activeCategory.value === 'all' || activity.categoryId === activeCategory.value
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})
</script>
