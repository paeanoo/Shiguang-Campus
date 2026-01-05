<template>
  <header
    class="sticky top-0 z-40 border-b backdrop-blur-md"
    :style="{
      backgroundColor: 'rgba(250, 250, 250, 0.8)',
      borderColor: 'var(--border)'
    }"
  >
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-3 group">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          :style="{ backgroundColor: 'var(--amber-100)' }"
        >
          <Sparkles class="w-5 h-5" :style="{ color: 'var(--amber-600)' }" />
        </div>
        <span class="text-xl font-semibold tracking-tight font-serif" :style="{ color: 'var(--foreground)' }">
          拾光志
        </span>
      </router-link>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-8">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="text-sm font-medium transition-colors hover:text-foreground"
          :style="{ color: route.path === item.path ? 'var(--foreground)' : 'var(--muted-foreground)' }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Right Section -->
      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button
          @click="$emit('toggle-theme')"
          class="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Sun v-if="!isDark" class="w-5 h-5" :style="{ color: 'var(--muted-foreground)' }" />
          <Moon v-else class="w-5 h-5" :style="{ color: 'var(--muted-foreground)' }" />
        </button>

        <!-- Coins Display -->
        <router-link
          v-if="isLoggedIn"
          to="/coins"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80"
          :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
        >
          <Coins class="w-4 h-4" />
          {{ coins }}
        </router-link>

        <!-- User Menu or Login -->
        <template v-if="isLoggedIn">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors hover:bg-secondary"
            :style="{ borderColor: 'var(--border)' }"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              :style="{ backgroundColor: 'var(--secondary)' }"
            >
              {{ user?.avatar }}
            </div>
            <span class="text-sm font-medium hidden sm:block" :style="{ color: 'var(--foreground)' }">
              {{ user?.name }}
            </span>
            <ChevronDown class="w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" />
          </button>
        </template>
        <template v-else>
          <button
            @click="$emit('toggle-auth')"
            class="px-4 py-2 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
            :style="{ backgroundColor: 'var(--foreground)' }"
          >
            登录
          </button>
        </template>

        <!-- Mobile Menu -->
        <button class="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu class="w-5 h-5" :style="{ color: 'var(--foreground)' }" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Sparkles,
  Sun,
  Moon,
  Coins,
  ChevronDown,
  Menu
} from 'lucide-vue-next'
import type { User } from '@/types'

interface Props {
  isLoggedIn: boolean
  user: User | null
  coins: number
}

defineProps<Props>()
defineEmits(['toggle-auth', 'logout', 'toggle-theme'])

const route = useRoute()
const isDark = ref(false)

const navItems = [
  { path: '/activities', label: '拾光·活动' },
  { path: '/marketplace', label: '益起·流转' },
  { path: '/buddy', label: '搭子广场' },
  { path: '/coins', label: '光币中心' }
]
</script>
