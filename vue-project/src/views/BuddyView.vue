<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <router-link
              to="/"
              class="flex items-center gap-2 transition-colors hover:opacity-80"
              :style="{ color: 'var(--muted-foreground)' }"
            >
              <ArrowLeft class="w-4 h-4" />
              返回首页
            </router-link>
            <h1 class="text-2xl md:text-3xl font-semibold font-serif" :style="{ color: 'var(--foreground)' }">
              找到你的校园搭子
            </h1>
            <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">
              别一个人！找个伴一起学习、运动、看演出
            </p>
          </div>
          <button
            class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-600)' }"
          >
            <Plus class="w-4 h-4" />
            发布需求
          </button>
        </div>
      </div>
    </section>

    <!-- Filter & Search Bar -->
    <section
      class="sticky top-16 z-10 border-b"
      :style="{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="category in buddyStore.categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="activeCategory === category.id ? 'text-white' : 'hover:bg-muted'"
              :style="activeCategory === category.id
                ? { backgroundColor: 'var(--emerald-600)' }
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
                placeholder="搜索「音乐节」或「图书馆」..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <!-- Partner Request Cards -->
        <div class="flex-1">
          <div class="grid md:grid-cols-2 gap-4">
            <BuddyCard
              v-for="request in filteredRequests"
              :key="request.id"
              :request="request"
              :is-joined="buddyStore.isJoined(request.id)"
              :is-full="buddyStore.isFull(request)"
              @join="buddyStore.handleJoin"
              @view-detail="buddyStore.handleViewDetail"
            />
          </div>

          <div v-if="filteredRequests.length === 0" class="text-center py-16">
            <Users class="w-12 h-12 mx-auto mb-4" :style="{ color: 'var(--muted-foreground)' }" />
            <p :style="{ color: 'var(--muted-foreground)' }">暂无匹配的搭子需求</p>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="hidden lg:block w-72 shrink-0">
          <!-- Joined List -->
          <div
            v-if="buddyStore.joinedIds.length > 0"
            class="rounded-xl border p-5 mb-6"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
              <Check class="w-4 h-4" :style="{ color: 'var(--emerald-600)' }" />
              我加入的 ({{ buddyStore.joinedIds.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="request in joinedRequests"
                :key="request.id"
                @click="buddyStore.handleViewDetail(request)"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  :style="{ backgroundColor: 'var(--emerald-50)' }"
                >
                  {{ request.user.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" :style="{ color: 'var(--foreground)' }">
                    {{ request.title }}
                  </p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--muted-foreground)' }">
                    {{ request.slots.filled }}/{{ request.slots.total }} 人
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Trending Events -->
          <div
            class="rounded-xl border p-5 sticky top-36"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
              <Calendar class="w-4 h-4" :style="{ color: 'var(--amber-600)' }" />
              热门活动找搭子
            </h3>
            <div class="space-y-4">
              <div
                v-for="event in buddyStore.trendingEvents"
                :key="event.id"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: 'var(--amber-50)' }"
                >
                  <Ticket class="w-5 h-5" :style="{ color: 'var(--amber-600)' }" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" :style="{ color: 'var(--foreground)' }">
                    {{ event.name }}
                  </p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--muted-foreground)' }">
                    {{ event.date }}
                  </p>
                  <p class="text-xs mt-1" :style="{ color: 'var(--emerald-600)' }">
                    {{ event.buddyCount }} 人正在找搭子
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Mobile FAB -->
    <button
      class="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105"
      :style="{ backgroundColor: 'var(--emerald-600)' }"
    >
      <Plus class="w-6 h-6" />
    </button>

    <!-- Detail Modal -->
    <BuddyDetailModal
      v-if="buddyStore.showDetailModal && buddyStore.selectedRequest"
      :request="buddyStore.selectedRequest"
      :is-joined="buddyStore.isJoined(buddyStore.selectedRequest.id)"
      :is-owner="buddyStore.isOwner(buddyStore.selectedRequest)"
      @close="buddyStore.showDetailModal = false"
      @leave="buddyStore.openConfirmModal('leave')"
      @dissolve="buddyStore.openConfirmModal('dissolve')"
      @kick="(name: string) => buddyStore.openConfirmModal('kick', name)"
      @transfer="(name: string) => buddyStore.openConfirmModal('transfer', name)"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="buddyStore.showConfirmModal && buddyStore.confirmAction"
      :title="confirmTitle"
      :message="confirmMessage"
      :type="buddyStore.confirmAction.type === 'transfer' ? 'warning' : 'danger'"
      @confirm="buddyStore.handleConfirm"
      @cancel="buddyStore.showConfirmModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Check,
  Calendar,
  Ticket
} from 'lucide-vue-next'
import { useBuddyStore } from '@/stores/buddy'
import BuddyCard from '@/components/buddy/BuddyCard.vue'
import BuddyDetailModal from '@/components/buddy/BuddyDetailModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const buddyStore = useBuddyStore()
const activeCategory = ref('all')
const searchQuery = ref('')

const filteredRequests = computed(() => {
  return buddyStore.buddyRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      request.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesSearch
  })
})

const joinedRequests = computed(() => {
  return buddyStore.buddyRequests.filter(r => buddyStore.joinedIds.includes(r.id))
})

const confirmTitle = computed(() => {
  const action = buddyStore.confirmAction
  if (!action) return ''
  switch (action.type) {
    case 'kick': return '确认移出成员'
    case 'transfer': return '确认转让房主'
    case 'dissolve': return '确认解散房间'
    case 'leave': return '确认退出房间'
    default: return ''
  }
})

const confirmMessage = computed(() => {
  const action = buddyStore.confirmAction
  const request = buddyStore.selectedRequest
  if (!action) return ''
  switch (action.type) {
    case 'kick':
      return `确定要将「${action.memberName}」移出房间吗？`
    case 'transfer':
      return `确定要将房主转让给「${action.memberName}」吗？转让后你将成为普通成员。`
    case 'dissolve':
      return '确定要解散房间吗？此操作不可撤销，所有成员将被移出。'
    case 'leave':
      return buddyStore.isOwner(request) && request && request.members.length > 1
        ? '你是房主，退出后房主将自动转让给其他成员。确定要退出吗？'
        : '确定要退出房间吗？'
    default:
      return ''
  }
})
</script>
