<template>
  <div
    class="rounded-xl border p-5 transition-all hover:shadow-md"
    :style="{
      backgroundColor: 'var(--card)',
      borderColor: isJoined ? 'var(--emerald-500)' : 'var(--border)'
    }"
  >
    <!-- Joined Badge -->
    <div
      v-if="isJoined"
      class="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit mb-3"
      :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
    >
      <Check class="w-3 h-3" />
      已加入
    </div>

    <!-- User Header -->
    <div class="flex items-center gap-3 mb-3">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        :style="{ backgroundColor: 'var(--secondary)' }"
      >
        {{ request.user.avatar }}
      </div>
      <div class="flex-1">
        <p class="font-medium text-sm" :style="{ color: 'var(--foreground)' }">
          {{ request.user.name }}
        </p>
        <p class="text-xs flex items-center gap-1" :style="{ color: 'var(--muted-foreground)' }">
          <Clock class="w-3 h-3" />
          {{ request.user.time }}
        </p>
      </div>
    </div>

    <!-- Title -->
    <h3 class="font-semibold mb-3" :style="{ color: 'var(--foreground)' }">
      {{ request.title }}
    </h3>

    <!-- Linked Event -->
    <div
      v-if="request.linkedEvent"
      class="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 cursor-pointer transition-all hover:opacity-80"
      :style="{ backgroundColor: 'var(--orange-100)' }"
    >
      <Ticket class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" />
      <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
        关联活动: {{ request.linkedEvent.name }}
      </span>
      <span class="text-xs ml-auto" :style="{ color: 'var(--orange-700)' }">
        {{ request.linkedEvent.date }}
      </span>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="(tag, index) in request.tags"
        :key="index"
        class="px-2.5 py-1 rounded-full text-xs font-medium"
        :style="{
          backgroundColor: 'var(--secondary)',
          color: 'var(--muted-foreground)'
        }"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between pt-3 border-t"
      :style="{ borderColor: 'var(--border)' }"
    >
      <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--muted-foreground)' }">
        <Users class="w-4 h-4" />
        <span>
          <span class="font-medium" :style="{ color: 'var(--emerald-600)' }">
            {{ request.slots.filled }}
          </span>
          /{{ request.slots.total }} 已加入
        </span>
        <div
          class="w-16 h-1.5 rounded-full overflow-hidden"
          :style="{ backgroundColor: 'var(--secondary)' }"
        >
          <div
            class="h-full rounded-full transition-all"
            :style="{
              backgroundColor: 'var(--emerald-500)',
              width: `${(request.slots.filled / request.slots.total) * 100}%`
            }"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-secondary"
          :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
        >
          <MessageCircle class="w-3.5 h-3.5" />
          私聊
        </button>
        <button
          v-if="isJoined"
          @click="$emit('view-detail', request)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
          :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
        >
          <Users class="w-3.5 h-3.5" />
          查看详情
        </button>
        <button
          v-else-if="isFull"
          disabled
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed"
          :style="{ backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
        >
          已满员
        </button>
        <button
          v-else
          @click="$emit('join', request.id)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          :style="{ backgroundColor: 'var(--emerald-600)' }"
        >
          <UserPlus class="w-3.5 h-3.5" />
          加入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Clock,
  Ticket,
  Users,
  MessageCircle,
  UserPlus
} from 'lucide-vue-next'
import type { BuddyRequest } from '@/types'

interface Props {
  request: BuddyRequest
  isJoined: boolean
  isFull: boolean
}

defineProps<Props>()
defineEmits(['join', 'view-detail'])
</script>
