<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    :style="{
      backgroundColor: 'rgba(253, 251, 247, 0.9)',
      borderBottom: '1px solid var(--border)'
    }"
  >
    <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <router-link
        to="/"
        class="text-xl font-semibold tracking-wide font-serif text-foreground hover:opacity-80 transition-opacity"
      >
        拾光志
      </router-link>
      <div class="flex items-center gap-4">
        <template v-if="user">
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-foreground">{{ user.username || user.email }}</p>
              <p class="text-xs" :style="{ color: user.user_type === 'organizer' ? 'var(--amber-600)' : 'var(--muted-foreground)' }">
                {{ user.user_type === 'organizer' ? '活动负责人' : '普通用户' }}
              </p>
            </div>
            <div class="relative">
              <button
                @click="showDropdown = !showDropdown"
                class="relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                :style="{ borderColor: user.user_type === 'organizer' ? 'var(--amber-500)' : 'var(--border)' }"
              >
                <img
                  :src="user.avatar_url || defaultAvatar"
                  :alt="user.username || user.email"
                  class="w-full h-full object-cover"
                />
              </button>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showDropdown"
                  class="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl overflow-hidden"
                  :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
                >
                  <div class="p-3 border-b" :style="{ borderColor: 'var(--border)' }">
                    <p class="text-sm font-medium text-foreground truncate">{{ user.username || user.email }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                  </div>
                  <router-link
                    to="/settings"
                    @click="showDropdown = false"
                    class="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <User class="w-4 h-4" />
                    个人中心
                  </router-link>
                  <router-link
                    to="/favorites"
                    @click="showDropdown = false"
                    class="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Heart class="w-4 h-4" />
                    收藏中心
                  </router-link>
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut class="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </template>
        <template v-else>
          <button
            @click="$emit('open-login')"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            登录
          </button>
          <button
            @click="$emit('open-register')"
            class="text-sm font-medium text-white rounded-full px-5 py-2 transition-all hover:shadow-lg hover:scale-105"
            :style="{ backgroundColor: 'var(--amber-600)' }"
          >
            注册
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { LogOut, User, Heart } from 'lucide-vue-next'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['open-login', 'open-register', 'logout'])

const showDropdown = ref(false)

const handleLogout = () => {
  showDropdown.value = false
  emit('logout')
}

const defaultAvatar = computed(() => {
  if (props.user?.email) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.user.email}`
  }
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
})
</script>
