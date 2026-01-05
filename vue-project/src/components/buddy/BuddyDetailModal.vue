<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

    <!-- Modal -->
    <div
      class="relative w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      :style="{ backgroundColor: 'var(--card)' }"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
      >
        <X class="w-5 h-5" :style="{ color: 'var(--muted-foreground)' }" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          :style="{ backgroundColor: 'var(--secondary)' }"
        >
          {{ request.user.avatar }}
        </div>
        <div>
          <h3 class="font-semibold text-lg" :style="{ color: 'var(--foreground)' }">
            {{ request.title }}
          </h3>
          <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">
            由 {{ request.user.name }} 创建 · {{ request.user.time }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm mb-4 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">
        {{ request.description }}
      </p>

      <!-- Linked Event -->
      <div
        v-if="request.linkedEvent"
        class="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
        :style="{ backgroundColor: 'var(--orange-100)' }"
      >
        <Ticket class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" />
        <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
          关联活动: {{ request.linkedEvent.name }} ({{ request.linkedEvent.date }})
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

      <!-- Members -->
      <div class="border-t pt-4 mb-4" :style="{ borderColor: 'var(--border)' }">
        <h4 class="font-medium text-sm mb-3 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
          <Users class="w-4 h-4" />
          成员 ({{ request.slots.filled }}/{{ request.slots.total }})
        </h4>
        <div class="space-y-2">
          <div
            v-for="(member, index) in request.members"
            :key="index"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary group"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              :style="{ backgroundColor: 'var(--secondary)' }"
            >
              {{ member.avatar }}
            </div>
            <span class="text-sm flex-1" :style="{ color: 'var(--foreground)' }">
              {{ member.name }}
            </span>
            <!-- Host Badge -->
            <span
              v-if="member.isHost"
              class="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
              :style="{ backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' }"
            >
              <Crown class="w-3 h-3" />
              房主
            </span>
            <!-- Me Badge -->
            <span
              v-if="member.name === '我' && !member.isHost"
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
            >
              我
            </span>
            <!-- Owner Actions -->
            <div
              v-if="isOwner && member.name !== '我'"
              class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                @click="$emit('transfer', member.name)"
                class="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                title="转让房主"
              >
                <ArrowRightLeft class="w-3.5 h-3.5" :style="{ color: 'var(--amber-600)' }" />
              </button>
              <button
                @click="$emit('kick', member.name)"
                class="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                title="移出房间"
              >
                <UserMinus class="w-3.5 h-3.5" :style="{ color: 'var(--destructive)' }" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <div class="flex gap-3">
          <button
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
            :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
          >
            <MessageCircle class="w-4 h-4" />
            群聊
          </button>
          <button
            v-if="isJoined"
            @click="$emit('leave')"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50"
            :style="{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }"
          >
            <LogOut class="w-4 h-4" />
            退出房间
          </button>
        </div>
        <button
          v-if="isOwner"
          @click="$emit('dissolve')"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          :style="{ backgroundColor: 'var(--destructive)', color: 'white' }"
        >
          <Trash2 class="w-4 h-4" />
          解散房间
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  X,
  Ticket,
  Users,
  Crown,
  ArrowRightLeft,
  UserMinus,
  MessageCircle,
  LogOut,
  Trash2
} from 'lucide-vue-next'
import type { BuddyRequest } from '@/types'

interface Props {
  request: BuddyRequest
  isJoined: boolean
  isOwner: boolean
}

defineProps<Props>()
defineEmits(['close', 'leave', 'dissolve', 'kick', 'transfer'])
</script>
