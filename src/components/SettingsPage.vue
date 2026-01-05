<template>
  <section class="max-w-4xl mx-auto px-6 py-8">
    <div class="mb-8">
      <router-link
        to="/"
        class="inline-flex items-center gap-1 text-sm mb-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        返回首页
      </router-link>
      <div>
        <h1 class="text-3xl font-semibold mb-2 font-serif" :style="{ color: 'var(--teal-700)' }">
          个人中心
        </h1>
        <p class="text-base text-muted-foreground">管理你的账户信息和偏好设置</p>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-1 space-y-6">
        <div class="rounded-2xl p-6" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <h2 class="text-lg font-semibold mb-6 text-foreground">头像</h2>
          <div class="flex flex-col items-center gap-4">
            <div
              class="relative w-36 h-36 rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg"
              :style="{ backgroundColor: 'var(--muted)' }"
              @click="$refs.avatarInput.click()"
            >
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                :alt="user.username || user.email"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <User class="w-16 h-16 text-muted-foreground" />
              </div>
              <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
              >
                <div class="text-center text-white">
                  <Camera class="w-8 h-8 mx-auto mb-1" />
                  <span class="text-xs">更换头像</span>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
            </div>
            <p class="text-sm text-center text-muted-foreground">点击头像上传图片，或从下方选择预设头像</p>
          </div>

          <div class="mt-6">
            <h3 class="text-sm font-medium mb-3 text-foreground">预设头像</h3>
            <div class="grid grid-cols-5 gap-3">
              <button
                v-for="(avatar, index) in presetAvatars"
                :key="index"
                @click="selectPresetAvatar(avatar)"
                class="w-12 h-12 rounded-full overflow-hidden transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                :class="{ 'ring-2 ring-teal-500': user?.avatar_url === avatar }"
              >
                <img
                  :src="avatar"
                  :alt="`预设头像 ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-6" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <h2 class="text-lg font-semibold mb-6 text-foreground">基本信息</h2>
          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">用户名</label>
              <input
                type="text"
                v-model="form.username"
                placeholder="请输入用户名"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">邮箱</label>
              <input
                type="email"
                :value="user?.email"
                disabled
                class="w-full h-11 rounded-xl outline-none px-4 cursor-not-allowed"
                :style="{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">用户类型</label>
              <div
                class="w-full h-11 rounded-xl px-4 flex items-center gap-2"
                :style="{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }"
              >
                <Shield v-if="user?.user_type === 'organizer'" class="w-4 h-4 text-amber-600" />
                <User v-else class="w-4 h-4 text-teal-600" />
                <span class="text-sm text-foreground">
                  {{ user?.user_type === 'organizer' ? '活动负责人' : '普通用户' }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">认证码（用于提升为活动负责人）</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="promoteCode"
                  placeholder="输入认证码"
                  class="flex-1 h-11 rounded-xl outline-none px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
                <button
                  type="button"
                  class="h-11 px-4 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg"
                  :style="{ backgroundColor: 'var(--teal-600)' }"
                  :disabled="promoting || !promoteCode"
                  :class="{ 'opacity-50 cursor-not-allowed': promoting || !promoteCode }"
                  @click="handlePromote"
                >
                  {{ promoting ? '提交中...' : '使用认证码' }}
                </button>
              </div>
              <p class="text-xs text-muted-foreground">使用有效认证码后，你的用户类型将变为活动负责人。</p>
            </div>
            <button
              type="submit"
              class="w-full h-11 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:scale-105"
              :style="{ backgroundColor: 'var(--teal-600)' }"
              :disabled="updatingProfile"
              :class="{ 'opacity-50 cursor-not-allowed': updatingProfile }"
            >
              {{ updatingProfile ? '保存中...' : '保存更改' }}
            </button>
          </form>
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="rounded-2xl p-6" :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }">
          <h2 class="text-lg font-semibold mb-6 text-foreground">修改密码</h2>
          <form @submit.prevent="handleUpdatePassword" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">当前密码</label>
              <input
                type="password"
                v-model="passwordForm.currentPassword"
                placeholder="请输入当前密码"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">新密码</label>
              <input
                type="password"
                v-model="passwordForm.newPassword"
                placeholder="请输入新密码（至少6位）"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">确认新密码</label>
              <input
                type="password"
                v-model="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>
            <button
              type="submit"
              class="w-full h-11 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:scale-105"
              :style="{ backgroundColor: 'var(--teal-600)' }"
              :disabled="updatingPassword"
              :class="{ 'opacity-50 cursor-not-allowed': updatingPassword }"
            >
              {{ updatingPassword ? '更新中...' : '更新密码' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="errorMessage" class="mt-6 p-4 rounded-xl flex items-start gap-3 shadow-lg" :style="{ backgroundColor: 'var(--red-50)', border: '1px solid var(--red-200)' }">
        <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" :style="{ color: 'var(--destructive)' }" />
        <p class="text-sm" :style="{ color: 'var(--destructive)' }">{{ errorMessage }}</p>
      </div>
    </transition>

    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="successMessage" class="mt-6 p-4 rounded-xl flex items-start gap-3 shadow-lg" :style="{ backgroundColor: 'var(--teal-50)', border: '1px solid var(--teal-200)' }">
        <CheckCircle class="w-5 h-5 flex-shrink-0 mt-0.5" :style="{ color: 'var(--teal-600)' }" />
        <p class="text-sm" :style="{ color: 'var(--teal-700)' }">{{ successMessage }}</p>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ChevronLeft, User, Shield, Camera, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { supabase } from '@lib/supabase'
import { storageService } from '@lib/storage'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['user-updated'])

const presetAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas'
]

const form = ref({
  username: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const updatingProfile = ref(false)
const updatingPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const promoteCode = ref('')
const promoting = ref(false)

const handlePromote = async () => {
  if (!props.user || !promoteCode.value) return
  // normalize code
  promoteCode.value = promoteCode.value ? promoteCode.value.trim().toUpperCase() : ''
  promoting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data, error } = await supabase.rpc('consume_auth_code_and_promote', {
      p_code: promoteCode.value,
      p_user_id: props.user.id
    })

    if (error) throw error
    const result = data
    if (result && result.success) {
      successMessage.value = result.message || '已成功提升为活动负责人'
      emit('user-updated')
    } else {
      errorMessage.value = result?.message || '认证码无效或已被使用'
    }
  } catch (err) {
    errorMessage.value = err.message || '操作失败，请稍后重试'
  } finally {
    promoting.value = false
  }
}

watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value.username = newUser.username || ''
  }
}, { immediate: true })

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || !props.user) return

  updatingProfile.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { url, error } = await storageService.uploadAvatar(file, props.user.id)

    if (error) throw error

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', props.user.id)

    if (updateError) throw updateError

    successMessage.value = '头像更新成功！'
    emit('user-updated')
  } catch (error) {
    errorMessage.value = error.message || '头像上传失败，请稍后重试'
  } finally {
    updatingProfile.value = false
  }
}

const selectPresetAvatar = async (avatarUrl) => {
  if (!props.user) return

  updatingProfile.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', props.user.id)

    if (error) throw error

    successMessage.value = '头像更新成功！'
    emit('user-updated')
  } catch (error) {
    errorMessage.value = error.message || '头像更新失败，请稍后重试'
  } finally {
    updatingProfile.value = false
  }
}

const handleUpdateProfile = async () => {
  if (!props.user) return

  updatingProfile.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ username: form.value.username })
      .eq('id', props.user.id)

    if (error) throw error

    successMessage.value = '个人信息更新成功！'
    emit('user-updated')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    updatingProfile.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!props.user) return

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    errorMessage.value = '新密码至少需要6位'
    return
  }

  updatingPassword.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })

    if (error) throw error

    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    successMessage.value = '密码更新成功！'
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    updatingPassword.value = false
  }
}
</script>
