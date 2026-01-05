<template>
  <div class="app" :class="{ 'dark': isDark }">
    <AppHeader
      :is-logged-in="authStore.isLoggedIn"
      :user="authStore.user"
      :coins="authStore.coins"
      @toggle-auth="showAuthModal = true"
      @logout="authStore.logout"
      @toggle-theme="toggleTheme"
    />
    <main>
      <router-view />
    </main>
    <AuthModal
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @login="handleLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AuthModal from '@/components/common/AuthModal.vue'

const authStore = useAuthStore()
const showAuthModal = ref(false)
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogin = (credentials: { phone: string; code: string }) => {
  authStore.login(credentials)
  showAuthModal.value = false
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--background);
}
</style>
