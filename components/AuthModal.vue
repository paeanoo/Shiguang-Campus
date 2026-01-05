<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div
      class="absolute inset-0 backdrop-blur-sm"
      :style="{ backgroundColor: 'rgba(45, 42, 38, 0.2)' }"
      @click="$emit('close')"
    />
    <div
      class="relative w-full max-w-sm mx-4 rounded-xl shadow-2xl"
      :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-1 rounded-lg transition-colors"
        :style="{ color: 'var(--muted-foreground)' }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--foreground)' }">
            {{ mode === 'login' ? '欢迎回来' : '加入拾光志' }}
          </h2>
          <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">
            {{ mode === 'login' ? '登录以继续你的校园之旅' : '开启你的拾光之旅' }}
          </p>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">学号</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input
                type="text"
                v-model="studentId"
                placeholder="请输入你的学号"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium" :style="{ color: 'var(--foreground)' }">密码</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                type="password"
                v-model="password"
                placeholder="••••••••"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full h-11 text-white rounded-xl text-sm font-medium transition-colors"
            :style="{ backgroundColor: 'var(--amber-600)' }"
          >
            {{ mode === 'login' ? '登录' : '注册' }}
          </button>
        </form>
        <div class="mt-6 text-center text-sm">
          <span :style="{ color: 'var(--muted-foreground)' }">{{ mode === 'login' ? '还没有账户？' : '已有账户？' }}</span>
          <button
            @click="$emit('mode-change', mode === 'login' ? 'register' : 'login')"
            class="font-medium ml-1"
            :style="{ color: 'var(--amber-600)' }"
          >
            {{ mode === 'login' ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: Boolean,
  mode: String
})

defineEmits(['close', 'mode-change'])

const studentId = ref('')
const password = ref('')

const handleSubmit = () => {
  // Handle form submission
}
</script>
