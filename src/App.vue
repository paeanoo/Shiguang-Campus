<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <AppHeader 
      :user="currentUser"
      @open-login="openLogin" 
      @open-register="openRegister"
      @logout="handleLogout"
    />
    
    <AuthModal 
      ref="authModalRef"
      :is-open="authModalOpen" 
      :mode="authMode" 
      @close="authModalOpen = false" 
      @mode-change="authMode = $event"
      @auth-success="handleAuthSuccess"
    />
    
    <main class="pt-16">
      <router-view :user="currentUser" @user-updated="loadCurrentUser" @open-login="openLogin" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AuthModal from '@/components/AuthModal.vue'
import { authService } from '@lib/auth'

const authModalOpen = ref(false)
const authMode = ref('login')
const currentUser = ref(null)
const authModalRef = ref(null)

const openLogin = () => {
  authMode.value = 'login'
  authModalOpen.value = true
}

const openRegister = () => {
  authMode.value = 'register'
  authModalOpen.value = true
}

const handleAuthSuccess = async (authData) => {
  if (authData.type === 'login') {
    const { data, error } = await authService.login(authData.email, authData.password)
    if (error) {
      if (authModalRef.value) {
        authModalRef.value.showError('登录失败：' + getErrorMessage(error))
      }
      return
    }
    if (authModalRef.value) {
      authModalRef.value.showSuccess('登录成功！')
    }
    setTimeout(() => {
      authModalOpen.value = false
    }, 1500)
  } else if (authData.type === 'register') {
    const { data, error } = await authService.register(
      authData.email,
      authData.password,
      authData.username,
      authData.userType,
      authData.authCode
    )
    if (error) {
      if (authModalRef.value) {
        authModalRef.value.showError('注册失败：' + getErrorMessage(error))
      }
      return
    }
    if (authModalRef.value) {
      authModalRef.value.showSuccess('注册成功！')
    }
    setTimeout(() => {
      authModalOpen.value = false
    }, 3000)
  }
  
  await loadCurrentUser()
}

const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    const message = error.message
    
    if (message.includes('认证码无效或已被使用')) {
      return '认证码无效或已被使用'
    }
    if (message.includes('请输入认证码')) {
      return '请输入认证码'
    }
    if (message.includes('认证码')) {
      return message
    }
    if (message.includes('User already registered')) {
      return '该邮箱已被注册'
    }
    if (message.includes('Invalid login credentials')) {
      return '邮箱或密码错误'
    }
    if (message.includes('Email not confirmed')) {
      return '请先验证邮箱'
    }
    if (message.includes('Database error saving new user')) {
      console.error('注册失败详情:', error)
      return '注册失败，可能是认证码问题或系统错误'
    }
    
    console.error('未知错误:', error)
    return message
  }
  
  console.error('未知错误类型:', error)
  return '操作失败，请稍后重试'
}

const handleLogout = async () => {
  const { error } = await authService.logout()
  if (error) {
    console.error('Logout error:', error)
    return
  }
  currentUser.value = null
  window.location.reload()
}

const loadCurrentUser = async () => {
  const { user, error } = await authService.getCurrentUser()
  if (!error && user) {
    currentUser.value = user
  }
}

onMounted(() => {
  loadCurrentUser()
  
  authService.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      await loadCurrentUser()
    } else if (event === 'SIGNED_OUT') {
      currentUser.value = null
    }
  })
})
</script>
