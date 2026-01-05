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
          <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--amber-700)' }">
            拾光·活动
          </h1>
          <p class="text-sm text-muted-foreground">发现身边的讲座、演出与赛事</p>
        </div>
        <button
          v-if="user?.user_type === 'organizer'"
          @click="showPublishModal = true"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90"
          :style="{ backgroundColor: 'var(--amber-600)' }"
        >
          <Plus class="w-4 h-4" />
          发布活动
        </button>
      </div>
    </div>

    <div class="flex gap-8">
      <!-- Calendar -->
      <div class="w-72 flex-shrink-0">
        <div class="rounded-xl p-5" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <div class="flex items-center justify-between mb-4">
            <button
              @click="prevMonth"
              class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <h3 class="text-sm font-medium text-foreground">{{ currentMonthYear }}</h3>
            <button
              @click="nextMonth"
              class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs py-1 text-muted-foreground"
            >
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
              :class="{ 'invisible': !day.date }"
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
                  {{ event.month }}月
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
                  <h3 class="text-base font-medium text-foreground">{{ event.title }}</h3>
                </div>
                <button
                  @click="handleRegister(event)"
                  class="px-4 h-8 text-xs text-white rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
                  :style="{ backgroundColor: 'var(--amber-600)' }"
                >
                  {{ event.isRegistered ? '已报名' : '报名' }}
                </button>
              </div>
              <p class="text-sm mb-3 line-clamp-1 text-muted-foreground">{{ event.description }}</p>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  {{ event.time }}
                </span>
                <span class="flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5" />
                  {{ event.location }}
                </span>
                <span class="flex items-center gap-1">
                  <Users class="w-3.5 h-3.5" />
                  {{ event.participantCount }} 人
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Publish Event Modal -->
    <div v-if="showPublishModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 backdrop-blur-sm"
        :style="{ backgroundColor: 'rgba(45, 42, 38, 0.2)' }"
        @click="showPublishModal = false"
      />
      <div
        class="relative w-full max-w-lg mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
      >
        <button
          @click="showPublishModal = false"
          class="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="p-8">
          <h2 class="text-xl font-semibold mb-2 font-serif text-foreground">发布新活动</h2>
          <p class="text-sm text-muted-foreground mb-6">填写活动信息，让更多同学参与</p>
          
          <form @submit.prevent="handlePublish" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">活动标题</label>
              <input
                type="text"
                v-model="eventForm.title"
                placeholder="请输入活动标题"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">活动描述</label>
              <textarea
                v-model="eventForm.description"
                placeholder="请输入活动描述"
                rows="3"
                class="w-full rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4 py-3"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">活动类型</label>
                <select
                  v-model="eventForm.type"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                >
                  <option value="lecture">讲座</option>
                  <option value="club">社团</option>
                  <option value="sports">体育</option>
                  <option value="volunteer">公益</option>
                  <option value="workshop">工作坊</option>
                  <option value="competition">竞赛</option>
                  <option value="other">其它</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">活动日期</label>
                <input
                  type="date"
                  v-model="eventForm.date"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">开始时间</label>
                <input
                  type="time"
                  v-model="eventForm.startTime"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">结束时间</label>
                <input
                  type="time"
                  v-model="eventForm.endTime"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">活动地点</label>
              <input
                type="text"
                v-model="eventForm.location"
                placeholder="请输入活动地点"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">活动封面</label>
              <div
                class="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-amber-400"
                :style="{ borderColor: 'var(--border)' }"
                @click="$refs.imageInput.click()"
              >
                <img
                  v-if="eventForm.imagePreview"
                  :src="eventForm.imagePreview"
                  alt="活动封面"
                  class="w-full h-full object-cover"
                />
                <div v-else class="text-center">
                  <Upload class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p class="text-sm text-muted-foreground">点击上传图片</p>
                </div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full h-11 text-white rounded-xl text-sm font-medium transition-colors"
              :style="{ backgroundColor: 'var(--amber-600)' }"
              :disabled="publishing"
            >
              {{ publishing ? '发布中...' : '发布活动' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, X, Upload } from 'lucide-vue-next'
import { supabase } from '@lib/supabase'
import { storageService } from '@lib/storage'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const events = ref([])

const eventTags = [
  { label: "全部", value: "all" },
  { label: "讲座", value: "lecture" },
  { label: "社团", value: "club" },
  { label: "体育", value: "sports" },
  { label: "公益", value: "volunteer" },
  { label: "工作坊", value: "workshop" },
  { label: "竞赛", value: "competition" },
  { label: "其它", value: "other" }
]

const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

const currentDate = ref(new Date())
const selectedDate = ref(null)
const activeTag = ref("all")
const showPublishModal = ref(false)
const publishing = ref(false)

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    events.value = data.map(event => ({
      ...event,
      participantCount: event.participant_count ?? event.participantCount ?? 0,
      typeLabel: event.type_label ?? event.typeLabel,
      imageUrl: event.image_url ?? event.imageUrl,
      organizerId: event.organizer_id ?? event.organizerId,
      createdAt: event.created_at ?? event.createdAt,
      isRegistered: false
    }))
  } catch (error) {
    console.error('Load events error:', error)
  }
}

onMounted(() => {
  loadEvents()
})

const eventForm = ref({
  title: '',
  description: '',
  type: 'lecture',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  image: null,
  imagePreview: ''
})

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
      hasEvent: events.value.some(e => e.day === d && e.month === month + 1)
    })
  }

  return days
})

const filteredEvents = computed(() => {
  return activeTag.value === "all" ? events.value : events.value.filter(e => e.type === activeTag.value)
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
    lecture: { backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' },
    club: { backgroundColor: 'var(--orange-100)', color: 'var(--orange-700)' },
    sports: { backgroundColor: 'var(--yellow-100)', color: 'var(--yellow-700)' },
    volunteer: { backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' },
    workshop: { backgroundColor: 'var(--blue-100)', color: 'var(--blue-700)' },
    competition: { backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)' },
    other: { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }
  }
  return styles[type] || { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    eventForm.value.image = file
    eventForm.value.imagePreview = URL.createObjectURL(file)
  }
}

const handlePublish = async () => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  if (props.user.user_type !== 'organizer') {
    alert('只有活动负责人才能发布活动')
    return
  }

  publishing.value = true

  try {
    let imageUrl = ''
    if (eventForm.value.image) {
      const { url, error } = await storageService.uploadEventImage(eventForm.value.image)
      if (error) throw error
      imageUrl = url
    }

    const dateObj = new Date(eventForm.value.date)
    const typeLabels = {
      lecture: '讲座',
      club: '社团',
      sports: '体育',
      volunteer: '公益',
      workshop: '工作坊',
      competition: '竞赛',
      other: '其它'
    }
    const newEvent = {
      title: eventForm.value.title,
      description: eventForm.value.description,
      type: eventForm.value.type,
      type_label: typeLabels[eventForm.value.type] || '其它',
      day: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      time: `${eventForm.value.startTime}-${eventForm.value.endTime}`,
      location: eventForm.value.location,
      participant_count: 0,
      image_url: imageUrl,
      organizer_id: props.user.id,
      created_at: new Date().toISOString()
    }

    const { data: inserted, error } = await supabase.from('events').insert([newEvent]).select('*')
    if (error) throw error
    // push mapped event for UI (use returned id and map snake_case -> camelCase)
    const insertedRow = inserted && inserted[0]
    if (insertedRow) {
      events.value.push({
        ...insertedRow,
        participantCount: insertedRow.participant_count ?? 0,
        typeLabel: insertedRow.type_label,
        imageUrl: insertedRow.image_url,
        organizerId: insertedRow.organizer_id,
        createdAt: insertedRow.created_at,
        isRegistered: false
      })
    } else {
    events.value.push({
      ...newEvent,
      id: Date.now(),
        participantCount: 0,
        typeLabel: typeLabels[eventForm.value.type] || '其它',
        imageUrl: imageUrl,
        organizerId: props.user.id,
        createdAt: new Date().toISOString(),
      isRegistered: false
    })
    }

    showPublishModal.value = false
    eventForm.value = {
      title: '',
      description: '',
      type: 'lecture',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      image: null,
      imagePreview: ''
    }

    alert('活动发布成功！')
  } catch (error) {
    console.error('Publish error:', error)
    alert('发布失败: ' + error.message)
  } finally {
    publishing.value = false
  }
}

const handleRegister = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  try {
    if (event.isRegistered) {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', event.id)
        .eq('user_id', props.user.id)

      if (error) throw error

      event.isRegistered = false
      event.participantCount--
    } else {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: event.id,
          user_id: props.user.id,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      event.isRegistered = true
      event.participantCount++
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('操作失败: ' + error.message)
  }
}
</script>
