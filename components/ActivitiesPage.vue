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
      <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--amber-700)' }">
        拾光·活动
      </h1>
      <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">发现身边的讲座、演出与赛事</p>
    </div>

    <div class="flex gap-8">
      <!-- Calendar -->
      <div class="w-72 flex-shrink-0">
        <div class="rounded-xl p-5" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="p-1.5 rounded-lg transition-colors" :style="{ color: 'var(--muted-foreground)' }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h3 class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">{{ currentMonthYear }}</h3>
            <button @click="nextMonth" class="p-1.5 rounded-lg transition-colors" :style="{ color: 'var(--muted-foreground)' }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekDays" :key="day" class="text-center text-xs py-1" :style="{ color: 'var(--muted-foreground)' }">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="day.date && (selectedDate = day.date)"
              :disabled="!day.date"
              class="relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all"
              :class="{ invisible: !day.date }"
              :style="getDayStyle(day)"
            >
              {{ day.date?.getDate() }}
              <span
                v-if="day.hasEvent && !day.isSelected"
                class="absolute bottom-1 w-1 h-1 rounded-full"
                :style="{ backgroundColor: 'var(--amber-600)' }"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Event List -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-6">
          <button
            v-for="tag in eventTags"
            :key="tag.value"
            @click="activeTag = tag.value"
            class="px-3 py-1.5 text-sm rounded-lg transition-all"
            :style="activeTag === tag.value 
              ? { backgroundColor: 'var(--amber-600)', color: 'white' }
              : { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }"
          >
            {{ tag.label }}
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="flex gap-4 rounded-xl p-4 transition-all duration-200 hover:border-amber-300"
            :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
          >
            <div class="flex-shrink-0 w-14 text-center">
              <div class="rounded-lg py-2 px-2" :style="{ backgroundColor: 'var(--amber-50)' }">
                <div class="text-lg font-semibold" :style="{ color: 'var(--amber-700)' }">
                  {{ event.day }}
                </div>
                <div class="text-xs" :style="{ color: 'var(--amber-600)', opacity: 0.7 }">
                  12月
                </div>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span
                    class="inline-block px-2 py-0.5 text-xs font-medium rounded mb-1.5"
                    :style="getTypeBadgeStyle(event.type)"
                  >
                    {{ event.typeLabel }}
                  </span>
                  <h3 class="text-base font-medium" :style="{ color: 'var(--foreground)' }">{{ event.title }}</h3>
                </div>
                <button
                  class="px-4 h-8 text-xs text-white rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
                  :style="{ backgroundColor: 'var(--amber-600)' }"
                >
                  报名
                </button>
              </div>
              <p class="text-sm mb-3 line-clamp-1" :style="{ color: 'var(--muted-foreground)' }">{{ event.description }}</p>
              <div class="flex items-center gap-4 text-xs" :style="{ color: 'var(--muted-foreground)' }">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ event.time }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ event.location }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  {{ event.participantCount }} 人
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['back'])

const events = [
  {
    id: 1,
    title: "AI 技术前沿讲座",
    description: "清华大学客座教授分享最新人工智能研究成果",
    type: "lecture",
    typeLabel: "讲座",
    day: 20,
    month: 12,
    time: "14:00-16:00",
    location: "图书馆报告厅",
    participantCount: 156,
  },
  {
    id: 2,
    title: "冬季篮球联赛决赛",
    description: "计算机学院 vs 商学院 年度总冠军争夺战",
    type: "sports",
    typeLabel: "体育",
    day: 22,
    month: 12,
    time: "18:30-20:30",
    location: "主体育馆",
    participantCount: 89,
  },
  {
    id: 3,
    title: "校园音乐节",
    description: "一年一度的音乐盛会，现场乐队表演",
    type: "club",
    typeLabel: "社团",
    day: 25,
    month: 12,
    time: "19:00-22:00",
    location: "学生活动中心",
    participantCount: 320,
  },
  {
    id: 4,
    title: "读书分享会",
    description: "本月主题：《人类简史》深度解读",
    type: "lecture",
    typeLabel: "讲座",
    day: 28,
    month: 12,
    time: "15:00-17:00",
    location: "图书馆二楼",
    participantCount: 45,
  },
]

const eventTags = [
  { label: "全部", value: "all" },
  { label: "讲座", value: "lecture" },
  { label: "社团", value: "club" },
  { label: "体育", value: "sports" },
]

const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

const currentDate = ref(new Date(2024, 11, 1))
const selectedDate = ref(null)
const activeTag = ref("all")

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString("zh-CN", { month: "long", year: "numeric" })
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

const filteredEvents = computed(() => {
  return activeTag.value === "all" ? events : events.filter((e) => e.type === activeTag.value)
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const getDayStyle = (day) => {
  if (day.isSelected) {
    return { backgroundColor: 'var(--amber-600)', color: 'white', fontWeight: 500 }
  }
  if (day.isToday) {
    return { backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)', fontWeight: 500 }
  }
  return { color: 'var(--foreground)' }
}

const getTypeBadgeStyle = (type) => {
  const styles = {
    lecture: { backgroundColor: "var(--amber-100)", color: "var(--amber-700)" },
    club: { backgroundColor: "var(--orange-100)", color: "var(--orange-700)" },
    sports: { backgroundColor: "var(--yellow-100)", color: "var(--yellow-700)" },
  }
  return styles[type] || { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
}
</script>
