<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      class="absolute inset-0 backdrop-blur-sm"
      :style="{ backgroundColor: 'rgba(45, 42, 38, 0.4)' }"
      @click="$emit('close')"
    />
    <div
      class="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
      :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <X class="w-5 h-5" />
      </button>
      <div class="p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" :style="{ backgroundColor: 'var(--amber-100)' }">
            <User v-if="mode === 'login'" class="w-8 h-8" :style="{ color: 'var(--amber-600)' }" />
            <Shield v-else class="w-8 h-8" :style="{ color: 'var(--amber-600)' }" />
          </div>
          <h2 class="text-2xl font-semibold mb-2 font-serif text-foreground">
            {{ mode === 'login' ? '欢迎回来' : '加入拾光志' }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ mode === 'login' ? '登录以继续你的校园之旅' : '开启你的拾光之旅' }}
          </p>
        </div>

        <transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div v-if="successMessage" class="mb-6 p-4 rounded-xl flex items-start gap-3 shadow-md" :style="{ backgroundColor: 'var(--teal-50)', border: '1px solid var(--teal-200)' }">
            <CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" :style="{ color: 'var(--teal-600)' }" />
            <div>
              <p class="text-sm font-medium" :style="{ color: 'var(--teal-700)' }">{{ successMessage }}</p>
              <p v-if="mode === 'register'" class="text-xs mt-1" :style="{ color: 'var(--teal-600)' }">请查收邮箱中的验证邮件</p>
            </div>
          </div>
        </transition>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">邮箱</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                v-model="email"
                placeholder="请输入你的邮箱"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                :disabled="loading"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                v-model="password"
                placeholder="••••••••"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                :disabled="loading"
              />
            </div>
          </div>
          <div v-if="mode === 'register'" class="space-y-2">
            <label class="text-sm font-medium text-foreground">用户名</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                v-model="username"
                placeholder="请输入用户名"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                :disabled="loading"
              />
            </div>
          </div>
          <div v-if="mode === 'register'" class="space-y-2">
            <label class="text-sm font-medium text-foreground">用户类型</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="userType = 'user'"
                class="p-3 rounded-xl text-sm transition-all border"
                :class="userType === 'user' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-300'"
                :disabled="loading"
              >
                <div class="flex items-center justify-center gap-2">
                  <User class="w-4 h-4" />
                  <span>普通用户</span>
                </div>
              </button>
              <button
                type="button"
                @click="userType = 'organizer'"
                class="p-3 rounded-xl text-sm transition-all border"
                :class="userType === 'organizer' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-200 hover:border-amber-300'"
                :disabled="loading"
              >
                <div class="flex items-center justify-center gap-2">
                  <Shield class="w-4 h-4" />
                  <span>活动负责人</span>
                </div>
              </button>
            </div>
          </div>
          <div v-if="mode === 'register' && userType === 'organizer'" class="space-y-2">
            <label class="text-sm font-medium text-foreground">认证码</label>
            <div class="relative">
              <Key class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                v-model="authCode"
                placeholder="请输入负责人认证码"
                class="w-full pl-10 h-11 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                :disabled="loading"
              />
            </div>
            <p class="text-xs text-muted-foreground">负责人需要提供正确的认证码才能注册</p>
          </div>

          <transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div v-if="errorMessage" class="p-4 rounded-xl flex items-start gap-3 shadow-md" :style="{ backgroundColor: 'var(--red-50)', border: '1px solid var(--red-200)' }">
              <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" :style="{ color: 'var(--destructive)' }" />
              <p class="text-sm" :style="{ color: 'var(--destructive)' }">{{ errorMessage }}</p>
            </div>
          </transition>

          <button
            type="submit"
            class="w-full h-11 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
            :style="{ backgroundColor: 'var(--amber-600)' }"
            :disabled="loading"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
          </button>
        </form>

        <div v-if="!successMessage" class="mt-6 text-center text-sm">
          <span class="text-muted-foreground">{{ mode === 'login' ? '还没有账户？' : '已有账户？' }}</span>
          <button
            @click="$emit('mode-change', mode === 'login' ? 'register' : 'login')"
            class="font-medium ml-1"
            :style="{ color: 'var(--amber-600)' }"
            :disabled="loading"
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
import { X, Mail, Lock, User, Shield, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  mode: String
})

const emit = defineEmits(['close', 'mode-change', 'auth-success'])

const email = ref('')
const password = ref('')
const username = ref('')
const userType = ref('user')
const authCode = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (props.mode === 'login') {
      emit('auth-success', { type: 'login', email: email.value, password: password.value })
    } else {
      // normalize auth code
      authCode.value = authCode.value ? authCode.value.trim().toUpperCase() : ''
      if (userType.value === 'organizer' && !authCode.value) {
        errorMessage.value = '请输入负责人认证码'
        loading.value = false
        return
      }
      emit('auth-success', {
        type: 'register',
        email: email.value,
        password: password.value,
        username: username.value,
        userType: userType.value,
        authCode: authCode.value
      })
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  errorMessage.value = ''
}

const showError = (message) => {
  errorMessage.value = message
  successMessage.value = ''
}

defineExpose({
  showSuccess,
  showError
})
</script>
