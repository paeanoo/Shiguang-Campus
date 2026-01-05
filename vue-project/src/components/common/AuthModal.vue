<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

    <!-- Modal -->
    <div
      class="relative w-full max-w-md rounded-2xl p-8 shadow-xl"
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
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          :style="{ backgroundColor: 'var(--amber-100)' }"
        >
          <Sparkles class="w-7 h-7" :style="{ color: 'var(--amber-600)' }" />
        </div>
        <h2 class="text-2xl font-semibold font-serif" :style="{ color: 'var(--foreground)' }">
          欢迎来到拾光志
        </h2>
        <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">
          登录后解锁更多精彩功能
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--foreground)' }">
            手机号
          </label>
          <input
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)'
            }"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--foreground)' }">
            验证码
          </label>
          <div class="flex gap-3">
            <input
              v-model="code"
              type="text"
              placeholder="请输入验证码"
              class="flex-1 px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)'
              }"
            />
            <button
              type="button"
              :disabled="countdown > 0"
              @click="sendCode"
              class="px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
              :style="{
                backgroundColor: countdown > 0 ? 'var(--secondary)' : 'var(--secondary)',
                color: countdown > 0 ? 'var(--muted-foreground)' : 'var(--foreground)'
              }"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl text-sm font-medium text-white transition-colors hover:opacity-90"
          :style="{ backgroundColor: 'var(--foreground)' }"
        >
          登录 / 注册
        </button>
      </form>

      <!-- Terms -->
      <p class="mt-6 text-center text-xs" :style="{ color: 'var(--muted-foreground)' }">
        登录即表示同意
        <a href="#" class="underline">用户协议</a>
        和
        <a href="#" class="underline">隐私政策</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['close', 'login'])

const phone = ref('')
const code = ref('')
const countdown = ref(0)

const sendCode = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSubmit = () => {
  emit('login', { phone: phone.value, code: code.value })
}
</script>
