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
          v-if="user"
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
                  <div class="flex items-center gap-2 mb-1.5">
                    <span
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                      :style="getTypeBadgeStyle(event.type)"
                    >
                      {{ event.typeLabel }}
                    </span>
                    <span
                      v-if="event.isOfficial"
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700"
                    >
                      官方
                    </span>
                    <span
                      v-if="String(event.organizerId) === String(props.user?.id)"
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
                    >
                      我创建的
                    </span>
                  </div>
                  <h3 @click="openEventDetail(event)" class="text-base font-medium text-foreground cursor-pointer">{{ event.title }}</h3>
                </div>
                <button
                  v-if="!event.isRegistered"
                  @click="openEventDetail(event)"
                  class="px-4 h-8 text-xs text-white rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
                  :style="{ backgroundColor: 'var(--amber-600)' }"
                >
                  报名
                </button>
                <button
                  v-else
                  @click="handleUnregister(event)"
                  class="px-4 h-8 text-xs border rounded-lg flex-shrink-0 transition-colors hover:bg-secondary"
                  :style="{ borderColor: 'var(--border)' }"
                >
                  已报名
                </button>
              </div>
              <p class="text-sm mb-3 line-clamp-1 text-muted-foreground">{{ event.description }}</p>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  {{ event.date ? `${event.date} ${event.time}` : event.time }}
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
            <div class="flex items-center gap-4 mt-3">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="eventForm.isOfficial" class="w-4 h-4" />
                <span class="text-sm">标记为官方活动（可选）</span>
              </label>
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
              <label class="text-sm font-medium text-foreground">报名方式</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="eventForm.registrationType"
                    value="internal"
                    class="text-amber-600"
                  />
                  <span class="text-sm">站内报名</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="eventForm.registrationType"
                    value="external"
                    class="text-amber-600"
                  />
                  <span class="text-sm">外部链接</span>
                </label>
              </div>
            </div>

            <div v-if="eventForm.registrationType === 'external'" class="space-y-2">
              <label class="text-sm font-medium text-foreground">外部报名链接</label>
              <input
                type="url"
                v-model="eventForm.externalUrl"
                placeholder="请输入外部报名链接 (e.g., Google Forms, WJX)"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div v-if="eventForm.registrationType === 'internal'" class="space-y-2">
              <label class="text-sm font-medium text-foreground">信息收集</label>
              <div class="space-y-3">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="eventForm.requiresIdentity"
                    class="text-amber-600"
                  />
                  <span class="text-sm">是否为官方/正式活动？</span>
                </label>
                <p v-if="eventForm.requiresIdentity" class="text-xs text-muted-foreground">
                  开启后，报名者必须填写姓名、学号、学院、专业。适用于讲座、比赛等正式活动。
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">报名名单可见性</label>
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="eventForm.showParticipants" id="showParticipants" class="w-4 h-4" />
                <label for="showParticipants" class="text-sm">公开报名名单（创建者可随时切换）</label>
              </div>
              <p class="text-xs text-muted-foreground">关闭后，除创建者外其他用户无法在详情页看到报名者列表。</p>
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

  <!-- Event Detail Modal (replaced inline markup with reusable component) -->
  <EventDetailModal
    :show="showEventDetailModal"
    :event="selectedEvent"
    :user="userProp"
    @close="showEventDetailModal = false"
    @edit="handleEditEvent(selectedEvent)"
  />

  <!-- Identity Collection Modal -->
  <teleport to="body" v-if="showIdentityModal && selectedEvent">
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showIdentityModal = false" />
      <div class="relative w-full max-w-md rounded-2xl shadow-xl" :style="{ backgroundColor: 'var(--card)' }">
        <button @click="showIdentityModal = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors">
          <X class="w-5 h-5 text-muted-foreground" />
        </button>

        <div class="p-6">
          <h3 class="text-lg font-semibold text-foreground mb-2">完善报名信息</h3>
          <p class="text-sm text-muted-foreground mb-4">此活动需要您提供身份信息以完成报名</p>

          <form @submit.prevent="submitIdentityRegistration" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">姓名</label>
              <input
                type="text"
                v-model="identityForm.realName"
                placeholder="请输入真实姓名"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">学号</label>
              <input
                type="text"
                v-model="identityForm.studentId"
                placeholder="请输入学号"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">学院</label>
              <input
                type="text"
                v-model="identityForm.college"
                placeholder="请输入学院名称"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">专业</label>
              <input
                type="text"
                v-model="identityForm.major"
                placeholder="请输入专业名称"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                required
              />
            </div>

            <button
              type="submit"
              class="w-full h-11 text-white rounded-xl font-medium transition-colors hover:opacity-90"
              :style="{ backgroundColor: 'var(--amber-600)' }"
            >
              提交报名
            </button>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, X, Upload } from 'lucide-vue-next'
import { supabase } from '@lib/supabase'
import { storageService } from '@lib/storage'
import EventDetailModal from '@/components/EventDetailModal.vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})
const userProp = props.user

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
const selectedEvent = ref(null)
const showEventDetailModal = ref(false)
const showIdentityModal = ref(false)
const identityForm = ref({
  realName: '',
  studentId: '',
  college: '',
  major: ''
})

// Computed properties for event management
const isOwner = computed(() => {
  return props.user?.id && String(selectedEvent.value?.organizerId) === String(props.user.id)
})

const hasJoined = computed(() => {
  if (!props.user?.id || !selectedEvent.value) return false

  // Check if user has registered for this event
  return selectedEvent.value.isRegistered === true
})

const isExternalEvent = computed(() => {
  return selectedEvent.value?.registrationType === 'external' ||
         Boolean(selectedEvent.value?.externalUrl || selectedEvent.value?.external_url)
})

const isOfficialInternal = computed(() => {
  return !isExternalEvent.value && selectedEvent.value?.requiresIdentity
})

const isCasualInternal = computed(() => {
  return !isExternalEvent.value && !selectedEvent.value?.requiresIdentity
})

const loadEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, profiles(username, user_type)')
      .order('created_at', { ascending: false })

    if (error) throw error
    events.value = data.map(ev => {
      // normalize organizer id
      const organizerId = ev.organizer_id ?? ev.organizerId ?? ev.creator_id ?? ev.creator?.id ?? ev.organizer?.id ?? ev.organizer?.user_id

      // determine date/time display values
      let dateOnly = ev.date || null
      let timeStr = ev.time || null

      // support ISO timestamps start_time / end_time (priority over date/time fields)
      const startTs = ev.start_time ?? ev.startTime ?? ev.start_at ?? null
      const endTs = ev.end_time ?? ev.endTime ?? ev.end_at ?? null
      
      if (startTs) {
        try {
          const s = new Date(startTs)
          if (!isNaN(s.getTime())) {
            const Y = s.getFullYear()
            const M = String(s.getMonth() + 1).padStart(2, '0')
            const D = String(s.getDate()).padStart(2, '0')
            dateOnly = `${Y}年${M}月${D}日`
            const hh = String(s.getHours()).padStart(2, '0')
            const mm = String(s.getMinutes()).padStart(2, '0')
            if (endTs) {
              const e = new Date(endTs)
              if (!isNaN(e.getTime())) {
                const eh = String(e.getHours()).padStart(2, '0')
                const em = String(e.getMinutes()).padStart(2, '0')
                timeStr = `${hh}:${mm}-${eh}:${em}`
              } else {
                timeStr = `${hh}:${mm}`
              }
            } else {
              timeStr = `${hh}:${mm}`
            }
          }
        } catch (e) {
          // ignore
        }
      } else if (ev.time) {
        // Parse time format "HH:MM-HH:MM" from database
        const timeMatch = String(ev.time).match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)
        if (timeMatch) {
          timeStr = ev.time
        } else {
          timeStr = ev.time
        }
      }

      // if dateOnly still null but ev.date exists (different format), use it
      if (!dateOnly && ev.date) dateOnly = ev.date

      // compute calendar day/month numeric if possible
      let day = null, month = null
      if (dateOnly) {
        // try parse from ISO or from our 'YYYY年MM月DD日' format
        const iso = ev.start_time ?? ev.date ?? null
        if (iso) {
          const dt = new Date(iso)
          if (!isNaN(dt.getTime())) {
            day = dt.getDate()
            month = dt.getMonth() + 1
          } else {
            // attempt to parse YYYY年MM月DD日
            const m = String(dateOnly).match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
            if (m) {
              day = Number(m[3])
              month = Number(m[2])
            }
          }
        }
      } else if (ev.created_at) {
        // Use created_at date as fallback for day/month
        const dt = new Date(ev.created_at)
        if (!isNaN(dt.getTime())) {
          day = dt.getDate()
          month = dt.getMonth() + 1
        }
      }

      return {
        ...ev,
        participantCount: ev.participant_count ?? ev.participantCount ?? 0,
        typeLabel: ev.type_label ?? ev.typeLabel,
        imageUrl: ev.image_url ?? ev.imageUrl,
        organizerId,
        createdAt: ev.created_at ?? ev.createdAt,
        isRegistered: false,
        isOfficial: ev.profiles?.user_type === 'organizer',
        registrationType: ev.registration_type ?? 'internal',
        externalUrl: ev.external_url ?? ev.externalUrl ?? null,
        external_url: ev.external_url ?? ev.externalUrl ?? null,
        requiresIdentity: ev.requires_identity ?? false,
        clickCount: ev.click_count ?? 0,
        show_participants: ev.show_participants ?? ev.showParticipants ?? true,
        // normalized display fields
        date: dateOnly,
        time: timeStr,
        day,
        month
      }
    })
  } catch (error) {
    console.error('Load events error:', error)
  }
}

onMounted(async () => {
  await loadEvents()
})

const eventForm = ref({
  title: '',
  description: '',
  type: 'lecture',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  registrationType: 'internal',
  externalUrl: '',
  requiresIdentity: false,
  showParticipants: true,
  isOfficial: false,
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

  // Allow any logged-in user to publish events (ordinary users won't get 官方 tag)

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
      date: eventForm.value.date,
      day: dateObj.getDate(),
      month: dateObj.getMonth() + 1,
      time: `${eventForm.value.startTime}-${eventForm.value.endTime}`,
      is_official: eventForm.value.isOfficial === true,
      start_time: eventForm.value.date && eventForm.value.startTime ? new Date(`${eventForm.value.date}T${eventForm.value.startTime}`).toISOString() : null,
      end_time: eventForm.value.date && eventForm.value.endTime ? new Date(`${eventForm.value.date}T${eventForm.value.endTime}`).toISOString() : null,
      location: eventForm.value.location,
      participant_count: 0,
      image_url: imageUrl,
      organizer_id: props.user.id,
      registration_type: eventForm.value.registrationType,
      external_url: eventForm.value.registrationType === 'external' ? eventForm.value.externalUrl : null,
      requires_identity: eventForm.value.registrationType === 'internal' ? eventForm.value.requiresIdentity : false,
      show_participants: eventForm.value.showParticipants === undefined ? true : eventForm.value.showParticipants,
      click_count: 0,
      created_at: new Date().toISOString()
    }

    if (editingEventId.value) {
      // update existing event
      let updatedRow = null
      try {
        const { data: updated, error: updateErr } = await supabase
          .from('events')
          .update(newEvent)
          .eq('id', editingEventId.value)
          .select('*')
        if (updateErr) {
          // If schema missing date/start_time columns, retry without those fields
          const msg = (updateErr.message || '').toLowerCase()
          if (updateErr.code === 'PGRST204' || msg.includes('could not find the') || msg.includes('column')) {
            const sanitized = { ...newEvent }
            delete sanitized.date
            delete sanitized.start_time
            delete sanitized.end_time
            const { data: updated2, error: updateErr2 } = await supabase
              .from('events')
              .update(sanitized)
              .eq('id', editingEventId.value)
              .select('*')
            if (updateErr2) throw updateErr2
            updatedRow = updated2 && updated2[0]
          } else {
            throw updateErr
          }
        } else {
          updatedRow = updated && updated[0]
        }
      } catch (updateException) {
        throw updateException
      }
      if (updatedRow) {
        const idx = events.value.findIndex(e => e.id === editingEventId.value)
        if (idx !== -1) {
          events.value[idx] = {
            ...events.value[idx],
            ...updatedRow,
            participantCount: updatedRow.participant_count ?? events.value[idx].participantCount ?? 0,
            typeLabel: updatedRow.type_label ?? events.value[idx].typeLabel,
            imageUrl: updatedRow.image_url ?? events.value[idx].imageUrl,
            organizerId: updatedRow.organizer_id ?? events.value[idx].organizerId,
            createdAt: updatedRow.created_at ?? events.value[idx].createdAt,
            // update normalized display fields if returned
            date: updatedRow.date ?? (updatedRow.start_time ? (new Date(updatedRow.start_time).toISOString().split('T')[0]) : (newEvent?.date ?? events.value[idx].date)),
            time: updatedRow.time ?? (updatedRow.start_time && updatedRow.end_time ? `${String(new Date(updatedRow.start_time).getHours()).padStart(2,'0')}:${String(new Date(updatedRow.start_time).getMinutes()).padStart(2,'0')}-${String(new Date(updatedRow.end_time).getHours()).padStart(2,'0')}:${String(new Date(updatedRow.end_time).getMinutes()).padStart(2,'0')}` : (newEvent?.time ?? events.value[idx].time)),
            day: updatedRow.day ?? (updatedRow.start_time ? new Date(updatedRow.start_time).getDate() : (newEvent?.day ?? events.value[idx].day)),
            month: updatedRow.month ?? (updatedRow.start_time ? new Date(updatedRow.start_time).getMonth()+1 : (newEvent?.month ?? events.value[idx].month)),
            isRegistered: events.value[idx].isRegistered ?? false
          }
        }
      } 
      editingEventId.value = null
    } else {
      // insert new event, retry without date/time fields if schema doesn't have them
      let insertedRow = null
      try {
        const { data: inserted, error } = await supabase.from('events').insert([newEvent]).select('*')
        if (error) {
          const msg = (error.message || '').toLowerCase()
          if (error.code === 'PGRST204' || msg.includes('could not find the') || msg.includes('column')) {
            const sanitized = { ...newEvent }
            delete sanitized.date
            delete sanitized.start_time
            delete sanitized.end_time
            const { data: inserted2, error: err2 } = await supabase.from('events').insert([sanitized]).select('*')
            if (err2) throw err2
            insertedRow = inserted2 && inserted2[0]
          } else {
            throw error
          }
        } else {
          insertedRow = inserted && inserted[0]
        }
      } catch (insertException) {
        throw insertException
      }

      if (insertedRow) {
        events.value.push({
          ...insertedRow,
          participantCount: insertedRow.participant_count ?? 0,
          typeLabel: insertedRow.type_label,
          imageUrl: insertedRow.image_url,
          organizerId: insertedRow.organizer_id ?? props.user.id,
          createdAt: insertedRow.created_at ?? new Date().toISOString(),
          // ensure local display fields exist even if DB didn't store them
          date: insertedRow.date ?? newEvent.date ?? null,
          time: insertedRow.time ?? newEvent.time ?? null,
          day: insertedRow.day ?? newEvent.day ?? (newEvent.date ? new Date(newEvent.date).getDate() : null),
          month: insertedRow.month ?? newEvent.month ?? (newEvent.date ? (new Date(newEvent.date).getMonth()+1) : null),
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
      registrationType: 'internal',
      externalUrl: '',
      requiresIdentity: false,
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

const participantList = ref([])
const editingEventId = ref(null)

const openEventDetail = async (event) => {
  // Defensive mapping: ensure the modal has the expected fields so the footer logic shows buttons correctly
    // normalize organizer id and date/time fields for the detail view
    const organizerId = event.organizer_id ?? event.organizerId ?? event.creator_id ?? event.creator?.id ?? event.organizer?.id ?? event.organizer?.user_id
    // derive date/time similar to list mapping
    let dateOnly = event.date ?? null
    let timeStr = event.time ?? null
    const startTs = event.start_time ?? event.startTime ?? event.start_at ?? null
    const endTs = event.end_time ?? event.endTime ?? event.end_at ?? null
    if (startTs) {
      try {
        const s = new Date(startTs)
        if (!isNaN(s.getTime())) {
          const Y = s.getFullYear()
          const M = String(s.getMonth() + 1).padStart(2, '0')
          const D = String(s.getDate()).padStart(2, '0')
          dateOnly = `${Y}年${M}月${D}日`
          const hh = String(s.getHours()).padStart(2, '0')
          const mm = String(s.getMinutes()).padStart(2, '0')
          if (endTs) {
            const e = new Date(endTs)
            if (!isNaN(e.getTime())) {
              const eh = String(e.getHours()).padStart(2, '0')
              const em = String(e.getMinutes()).padStart(2, '0')
              timeStr = `${hh}:${mm}-${eh}:${em}`
            } else {
              timeStr = `${hh}:${mm}`
            }
          } else {
            timeStr = `${hh}:${mm}`
          }
        }
      } catch (e) {}
    }
    if (!dateOnly && event.date) dateOnly = event.date

    selectedEvent.value = {
      ...event,
      participantCount: event.participant_count ?? event.participantCount ?? 0,
      typeLabel: event.type_label ?? event.typeLabel,
      imageUrl: event.image_url ?? event.imageUrl ?? null,
      organizerId,
      createdAt: event.created_at ?? event.createdAt,
      // registration shape normalization
      registrationType: event.registration_type ?? (event.external_url ? 'external' : (event.registrationType ?? 'internal')),
      external_url: event.external_url ?? event.externalUrl ?? null,
      externalUrl: event.external_url ?? event.externalUrl ?? null,
      requiresIdentity: event.requires_identity ?? event.requiresIdentity ?? false,
      isOfficial: event.isOfficial ?? (event.profiles?.user_type === 'organizer'),
      show_participants: event.show_participants ?? event.showParticipants ?? true,
      // ensure boolean/defined values
      isRegistered: Boolean(event.isRegistered),
      clickCount: event.click_count ?? event.clickCount ?? 0,
      // normalized display fields for detail
      date: dateOnly,
      time: timeStr
    }

  showEventDetailModal.value = true

  // If user is logged in, check if they have a registration record to avoid duplicate marking
  try {
      if (props.user && selectedEvent.value?.id) {
      const { data: regData, error: regError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', selectedEvent.value.id)
        .eq('user_id', props.user.id)
      if (!regError && Array.isArray(regData) && regData.length > 0) {
        selectedEvent.value.isRegistered = true
      } else {
        selectedEvent.value.isRegistered = selectedEvent.value.isRegistered || false
      }

      // Fetch participant count from server to be authoritative
      const { count, error: countError } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: false })
        .eq('event_id', selectedEvent.value.id)
      if (!countError && typeof count === 'number') {
        selectedEvent.value.participantCount = count
      }

      // If owner, fetch participant list (with profiles) - use string compare to tolerate types
      if (props.user?.id && String(selectedEvent.value.organizerId) === String(props.user.id)) {
        await fetchParticipantList(selectedEvent.value.id)
      } else {
        participantList.value = []
      }
    }
  } catch (e) {
    console.error('openEventDetail fetch registration info error', e)
  }
}

const getRegistrationButtonText = (event) => {
  if (event.requires_identity) {
    return '立即报名'
  } else {
    return '加入'
  }
}

const handleExternalRegistration = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  try {
    // Increment click count via RPC function
    const { data: newCount, error } = await supabase.rpc('increment_event_clicks', {
      event_id_param: event.id
    })

    if (error) {
      console.error('Failed to increment click count:', error)
    } else {
      // Update local event data
      event.clickCount = newCount
    }

    // Open external link in new tab
    window.open(event.external_url, '_blank')
  } catch (error) {
    console.error('External registration error:', error)
    // Still open the link even if click tracking fails
    window.open(event.external_url, '_blank')
  }
}

const handleManualJoin = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: event.id,
        user_id: props.user.id,
        created_at: new Date().toISOString()
      }])

    if (error) {
      // If duplicate key error, treat as idempotent success
      if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate'))) {
        event.isRegistered = true
        // only increment if previously not registered
        if (!event.isRegistered) event.participantCount++
        showEventDetailModal.value = false
        alert('已标记为已加入！')
        return
      }
      throw error
    }

    // Success
    if (!event.isRegistered) {
      event.participantCount = (event.participantCount || 0) + 1
    }
    event.isRegistered = true
    showEventDetailModal.value = false
    alert('已标记为已加入！')
    // refresh participant list if current viewer is the organizer
    if (selectedEvent.value?.id && props.user && props.user.id === (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
      await fetchParticipantList(selectedEvent.value.id)
    }
  } catch (error) {
    console.error('Manual join error:', error)
    alert('操作失败: ' + error.message)
  }
}

const handleRegistration = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  if (event.requires_identity) {
    // Show identity collection modal
    showIdentityModal.value = true
    // Pre-fill form with user's existing profile data if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('real_name, student_id, college, major')
      .eq('id', props.user.id)
      .single()

    if (profile) {
      identityForm.value = {
        realName: profile.real_name || '',
        studentId: profile.student_id || '',
        college: profile.college || '',
        major: profile.major || ''
      }
    }
  } else {
    // Simple registration for casual events
    await performSimpleRegistration(event)
  }
}

const performSimpleRegistration = async (event) => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: event.id,
        user_id: props.user.id,
        created_at: new Date().toISOString()
      }])

    if (error) {
      if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate'))) {
        // Already registered, make UI reflect that
        if (!event.isRegistered) {
          event.participantCount = (event.participantCount || 0) + 1
        }
        event.isRegistered = true
        showEventDetailModal.value = false
        alert('报名成功！')
        return
      }
      throw error
    }

    if (!event.isRegistered) {
      event.participantCount = (event.participantCount || 0) + 1
    }
    event.isRegistered = true
    showEventDetailModal.value = false
    alert('报名成功！')

    // 自动完成"参加活动"任务
    try {
      const { data: taskRow, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('task_type', 'join_event')
        .limit(1)
        .single()
      if (!taskError && taskRow && taskRow.id) {
        await supabase.rpc('complete_task', {
          user_uuid: props.user.id,
          task_uuid: taskRow.id
        })
      }
    } catch (err) {
      console.error('Mark join event task completed error:', err)
    }

    // refresh participant list if current viewer is the organizer
    if (selectedEvent.value?.id && props.user && props.user.id === (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
      await fetchParticipantList(selectedEvent.value.id)
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('报名失败: ' + error.message)
  }
}

const submitIdentityRegistration = async () => {
  if (!selectedEvent.value || !props.user) return

  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: selectedEvent.value.id,
        user_id: props.user.id,
        real_name: identityForm.value.realName,
        student_id: identityForm.value.studentId,
        college: identityForm.value.college,
        major: identityForm.value.major,
        created_at: new Date().toISOString()
      }])

    if (error) {
      if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate'))) {
        // Already registered - treat as success
        if (!selectedEvent.value.isRegistered) {
          selectedEvent.value.participantCount = (selectedEvent.value.participantCount || 0) + 1
        }
        selectedEvent.value.isRegistered = true
        showIdentityModal.value = false
        showEventDetailModal.value = false
        alert('报名成功！')
        return
      }
      throw error
    }

    // Optionally update user's profile
    await supabase
      .from('profiles')
      .upsert({
        id: props.user.id,
        real_name: identityForm.value.realName,
        student_id: identityForm.value.studentId,
        college: identityForm.value.college,
        major: identityForm.value.major,
        updated_at: new Date().toISOString()
      })

    if (!selectedEvent.value.isRegistered) {
      selectedEvent.value.participantCount = (selectedEvent.value.participantCount || 0) + 1
    }
    selectedEvent.value.isRegistered = true
    showIdentityModal.value = false
    showEventDetailModal.value = false

    // 自动完成"参加活动"任务
    try {
      const { data: taskRow, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('task_type', 'join_event')
        .limit(1)
        .single()
      if (!taskError && taskRow && taskRow.id) {
        await supabase.rpc('complete_task', {
          user_uuid: props.user.id,
          task_uuid: taskRow.id
        })
      }
    } catch (err) {
      console.error('Mark join event task completed error:', err)
    }

    // Reset form
    identityForm.value = {
      realName: '',
      studentId: '',
      college: '',
      major: ''
    }

    alert('报名成功！')
    if (selectedEvent.value?.id && props.user && props.user.id === (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
      await fetchParticipantList(selectedEvent.value.id)
    }
  } catch (error) {
    console.error('Identity registration error:', error)
    alert('报名失败: ' + error.message)
  }
}

const handleUnregister = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  if (!confirm('确定要取消报名吗？')) {
    return
  }

  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', props.user.id)

    if (error) throw error

    event.isRegistered = false
    event.participantCount = Math.max(0, event.participantCount - 1)
    showEventDetailModal.value = false
    alert('已取消报名')
    // refresh participant list if current viewer is the organizer
    if (selectedEvent.value?.id && props.user && props.user.id === (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
      await fetchParticipantList(selectedEvent.value.id)
    }
  } catch (error) {
    console.error('Unregister error:', error)
    alert('取消报名失败: ' + error.message)
  }
}

const handleQuickJoin = async (event) => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  try {
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
    showEventDetailModal.value = false
    alert('成功加入活动！')
    if (selectedEvent.value?.id && props.user && props.user.id === (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
      await fetchParticipantList(selectedEvent.value.id)
    }
  } catch (error) {
    console.error('Quick join error:', error)
    alert('加入失败: ' + error.message)
  }
}

const handleDeleteEvent = async (event) => {
  if (!props.user || !isOwner.value) {
    alert('无权限删除此活动')
    return
  }

  if (!confirm('确定要删除这个活动吗？此操作不可撤销，所有报名记录将被清除。')) {
    return
  }

  try {
    // Delete all registrations first (cascade should handle this, but let's be explicit)
    await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', event.id)

    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id)

    if (error) throw error

    // Remove from local events list
    events.value = events.value.filter(e => e.id !== event.id)
    showEventDetailModal.value = false

    alert('活动已删除')
  } catch (error) {
    console.error('Delete event error:', error)
    alert('删除失败: ' + error.message)
  }
}

const handleEditEvent = async (event) => {
  // Use runtime current user (not just props) to decide owner permissions
  const me = await getCurrentUser()
  if (!me) {
    alert('无权限编辑此活动（请先登录）')
    return
  }
  // normalize organizer id from different possible shapes
  const organizerId = event.organizer_id ?? event.organizerId ?? event.creator_id ?? event.creator?.id ?? event.organizer?.id ?? event.organizer?.user_id ?? event.organizer?.profiles?.id
  if (!organizerId || String(me.id) !== String(organizerId)) {
    alert('无权限编辑此活动')
    return
  }

  // Prefill form with event data
  editingEventId.value = event.id
  // Prefill with priority: start_time/end_time -> event.time -> date field
  let prefillDate = ''
  let prefillStart = ''
  let prefillEnd = ''
  const sTs = event.start_time ?? event.startTime ?? event.start_at ?? null
  const eTs = event.end_time ?? event.endTime ?? event.end_at ?? null
  if (sTs) {
    try {
      const sdt = new Date(sTs)
      if (!isNaN(sdt.getTime())) {
        prefillDate = sdt.toISOString().split('T')[0]
        prefillStart = `${String(sdt.getHours()).padStart(2,'0')}:${String(sdt.getMinutes()).padStart(2,'0')}`
      }
    } catch (e) {}
  }
  if (eTs) {
    try {
      const edt = new Date(eTs)
      if (!isNaN(edt.getTime())) {
        prefillEnd = `${String(edt.getHours()).padStart(2,'0')}:${String(edt.getMinutes()).padStart(2,'0')}`
      }
    } catch (e) {}
  }
  if ((!prefillStart || !prefillEnd) && event.time) {
    const parts = String(event.time).split('-')
    prefillStart = prefillStart || (parts[0] || '')
    prefillEnd = prefillEnd || (parts[1] || '')
  }
  // Fallback to event.date if still no date
  if (!prefillDate && event.date) {
    try {
      const dt = new Date(event.date)
      if (!isNaN(dt.getTime())) {
        prefillDate = dt.toISOString().split('T')[0]
      } else {
        prefillDate = event.date
      }
    } catch (e) {
      prefillDate = event.date
    }
  }

  eventForm.value = {
    title: event.title || '',
    description: event.description || '',
    type: event.type || 'lecture',
    date: prefillDate,
    startTime: prefillStart,
    endTime: prefillEnd,
    location: event.location || '',
    registrationType: event.registration_type ?? event.registrationType ?? (event.external_url ? 'external' : 'internal'),
    externalUrl: event.external_url ?? event.externalUrl ?? '',
    requiresIdentity: event.requires_identity ?? event.requiresIdentity ?? false,
    showParticipants: event.show_participants ?? event.showParticipants ?? true,
    image: null,
    imagePreview: event.image_url ?? event.imageUrl ?? ''
  }

  showEventDetailModal.value = false
  showPublishModal.value = true
}

const handleToggleParticipantsVisibility = async () => {
  if (!props.user || !selectedEvent.value) {
    alert('无权限或未选择活动')
    return
  }
  // only owner can toggle
  if (props.user.id !== (selectedEvent.value.organizerId ?? selectedEvent.value.organizer_id)) {
    alert('仅活动创建者可更改公开设置')
    return
  }

  const newVal = Boolean(selectedEvent.value.show_participants)
  try {
    const { error } = await supabase
      .from('events')
      .update({ show_participants: newVal })
      .eq('id', selectedEvent.value.id)

    if (error) throw error

    // update local events array
    const idx = events.value.findIndex(e => e.id === selectedEvent.value.id)
    if (idx !== -1) {
      events.value[idx].show_participants = newVal
    }

    alert('设置已保存')
  } catch (e) {
    console.error('Toggle participants visibility error', e)
    alert('保存失败: ' + (e.message || e))
    // revert local change
    selectedEvent.value.show_participants = !newVal
  }
}

const fetchParticipantList = async (eventId) => {
  if (!eventId) return
  try {
    // Step 1: get registrations
    const { data: regs, error: regsErr } = await supabase
      .from('event_registrations')
      .select('user_id, created_at')
      .eq('event_id', eventId)

    if (regsErr) {
      console.error('fetchParticipantList regsErr', regsErr)
      participantList.value = []
      return
    }

    const userIds = Array.isArray(regs) ? regs.map(r => r.user_id) : []
    if (userIds.length === 0) {
      participantList.value = []
      return
    }

    // Step 2: fetch profiles for these user ids
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const profileById = {}
    if (!profilesErr && Array.isArray(profiles)) {
      profiles.forEach(p => {
        profileById[String(p.id)] = p
      })
    }

    participantList.value = regs.map(r => {
      const p = profileById[String(r.user_id)] || {}
      return {
        id: r.user_id,
        username: p.username ?? String(r.user_id),
        avatar: p.avatar_url ?? null,
        created_at: r.created_at
      }
    })
  } catch (e) {
    console.error('fetchParticipantList error', e)
    participantList.value = []
  }
}
</script>
