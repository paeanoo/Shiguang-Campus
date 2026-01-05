<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />
    <div
      class="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
      :style="{ backgroundColor: 'var(--card)' }"
    >
      <h3 class="font-semibold text-lg mb-2" :style="{ color: 'var(--foreground)' }">
        {{ title }}
      </h3>
      <p class="text-sm mb-6" :style="{ color: 'var(--muted-foreground)' }">
        {{ message }}
      </p>
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
          :style="{ borderColor: 'var(--border)' }"
        >
          取消
        </button>
        <button
          @click="$emit('confirm')"
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          :style="{ backgroundColor: confirmColor }"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  message: string
  type?: 'danger' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'danger'
})

defineEmits(['confirm', 'cancel'])

const confirmColor = computed(() => {
  return props.type === 'warning' ? 'var(--amber-600)' : 'var(--destructive)'
})
</script>
