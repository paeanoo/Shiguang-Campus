<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    :style="{
      backgroundColor: 'rgba(253, 251, 247, 0.8)',
      borderBottom: '1px solid var(--border)',
    }"
  >
    <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <button
        @click="$emit('navigate', 'home')"
        class="text-xl font-semibold tracking-wide font-serif hover:opacity-80 transition-opacity"
        :style="{ color: 'var(--foreground)' }"
      >
        拾光志
      </button>
      <div class="flex items-center gap-4">
        <button
          @click="$emit('open-login')"
          class="text-sm transition-colors hover:opacity-80"
          :style="{ color: 'var(--muted-foreground)' }"
        >
          登录
        </button>
        <button
          @click="$emit('open-register')"
          class="text-sm font-medium text-white rounded-full px-5 py-2 transition-colors"
          :style="{ backgroundColor: 'var(--amber-600)' }"
          @mouseenter="$event.target.style.backgroundColor = 'var(--amber-700)'"
          @mouseleave="$event.target.style.backgroundColor = 'var(--amber-600)'"
        >
          注册
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['open-login', 'open-register', 'navigate'])
</script>
