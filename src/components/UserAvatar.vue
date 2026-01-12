<template>
  <button
    @click="handleClick"
    :class="[
      'relative group transition-all',
      clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
    ]"
    :disabled="!clickable"
  >
    <img
      :src="avatarUrl"
      :alt="alt"
      :class="[
        'object-cover',
        sizeClass,
        rounded ? 'rounded-full' : 'rounded-lg'
      ]"
      @error="handleAvatarError"
    >
    <div v-if="showBadge && unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </div>
    <div v-if="showTooltip && name" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
      {{ name }}
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: true
  },
  showBadge: {
    type: Boolean,
    default: false
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'avatarError'])

const sizeClass = computed(() => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  return sizes[props.size] || sizes.md
})

const computedAvatarUrl = computed(() => {
  if (props.avatarUrl) return props.avatarUrl
  if (props.user?.avatar_url) return props.user.avatar_url
  if (props.user?.id) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.user.id}`
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
})

const computedName = computed(() => {
  if (props.name) return props.name
  if (props.user?.nickname) return props.user.nickname
  if (props.user?.username) return props.user.username
  if (props.user?.email) return props.user.email.split('@')[0]
  return '用户'
})

function handleClick() {
  if (props.clickable) {
    emit('click', props.user || { avatar_url: computedAvatarUrl.value, name: computedName.value })
  }
}

function handleAvatarError(event) {
  emit('avatarError', event)
  event.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.user?.id || 'default'}`
}
</script>
