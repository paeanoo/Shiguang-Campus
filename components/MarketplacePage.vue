<template>
  <section class="max-w-5xl mx-auto px-6 py-8">
    <div class="mb-8">
      <button
        @click="$emit('back')"
        class="text-sm mb-4 flex items-center gap-1 transition-colors"
        :style="{ color: 'var(--muted-foreground)' }"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
      <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--teal-700)' }">
        益起·流转
      </h1>
      <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">闲置物品循环，让爱意在校园流动</p>
    </div>

    <div class="flex items-center gap-4 mb-8">
      <div class="relative flex-1 max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索物品..."
          class="w-full pl-9 h-10 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        />
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="activeCategory = cat.value"
          class="px-3 py-1.5 text-sm rounded-lg transition-all"
          :style="activeCategory === cat.value
            ? { backgroundColor: 'var(--teal-600)', color: 'white' }
            : { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="group rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
      >
        <div class="relative aspect-square overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
          <img
            :src="product.image"
            :alt="product.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white"
            :style="{ backgroundColor: 'var(--teal-600)' }"
          >
            公益
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-sm font-medium mb-2 line-clamp-1" :style="{ color: 'var(--foreground)' }">{{ product.title }}</h3>
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-lg font-semibold" :style="{ color: 'var(--teal-700)' }">
              ¥{{ product.price }}
            </span>
            <span v-if="product.originalPrice" class="text-xs line-through" :style="{ color: 'var(--muted-foreground)' }">¥{{ product.originalPrice }}</span>
          </div>
          <div class="flex items-center justify-between pt-3" :style="{ borderTop: '1px solid var(--border)' }">
            <div class="flex items-center gap-2">
              <img
                :src="product.publisher.avatar"
                :alt="product.publisher.name"
                class="w-5 h-5 rounded-full object-cover"
              />
              <span class="text-xs" :style="{ color: 'var(--muted-foreground)' }">{{ product.publisher.name }}</span>
            </div>
            <div class="flex items-center gap-1 text-xs" :style="{ color: 'var(--muted-foreground)' }">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span>{{ product.likes }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['back'])

const categories = [
  { label: "全部", value: "all" },
  { label: "数码", value: "digital" },
  { label: "书籍", value: "books" },
  { label: "服饰", value: "clothes" },
]

const products = [
  {
    id: 1,
    title: "iPad Pro 11英寸 2021款",
    price: 3200,
    originalPrice: 6799,
    category: "digital",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    likes: 128,
    publisher: {
      name: "小明",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  },
  {
    id: 2,
    title: "人类简史三部曲套装",
    price: 45,
    originalPrice: 168,
    category: "books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    likes: 86,
    publisher: {
      name: "小红",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
  },
  {
    id: 3,
    title: "优衣库轻羽绒服 M码",
    price: 120,
    originalPrice: 499,
    category: "clothes",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
    likes: 52,
    publisher: {
      name: "小美",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  },
  {
    id: 4,
    title: "索尼 WH-1000XM4 降噪耳机",
    price: 980,
    originalPrice: 2499,
    category: "digital",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    likes: 234,
    publisher: {
      name: "阿杰",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
  },
  {
    id: 5,
    title: "米家台灯 Pro",
    price: 85,
    originalPrice: 199,
    category: "digital",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    likes: 67,
    publisher: {
      name: "小丽",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
  },
  {
    id: 6,
    title: "樱桃轴机械键盘",
    price: 280,
    originalPrice: 599,
    category: "digital",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop",
    likes: 156,
    publisher: {
      name: "小涛",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
  },
]

const searchQuery = ref('')
const activeCategory = ref('all')

const filteredProducts = computed(() => {
  return products
    .filter((p) => activeCategory.value === "all" || p.category === activeCategory.value)
    .filter((p) => p.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>
