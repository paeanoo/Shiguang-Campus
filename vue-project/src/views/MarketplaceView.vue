<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <router-link
              to="/"
              class="flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
              :style="{ color: 'var(--muted-foreground)' }"
            >
              <ArrowLeft class="w-4 h-4" />
              返回首页
            </router-link>
            <h1 class="text-2xl md:text-3xl font-semibold font-serif" :style="{ color: 'var(--foreground)' }">
              益起·流转
            </h1>
            <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">
              闲置物品循环，让爱意在校园流动
            </p>
          </div>
          <button
            class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--teal-600)' }"
          >
            <Plus class="w-4 h-4" />
            发布闲置
          </button>
        </div>
      </div>
    </section>

    <!-- Filter Bar -->
    <section
      class="sticky top-16 z-10 border-b"
      :style="{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="activeCategory === category.id ? 'text-white' : 'hover:bg-muted'"
              :style="activeCategory === category.id
                ? { backgroundColor: 'var(--teal-600)' }
                : { backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
            >
              {{ category.label }}
            </button>
          </div>

          <div class="flex-1 md:max-w-sm md:ml-auto">
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                :style="{ color: 'var(--muted-foreground)' }"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索物品..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Items Grid -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-pointer"
          :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <div
            class="aspect-square flex items-center justify-center"
            :style="{ backgroundColor: 'var(--teal-50)' }"
          >
            <Package class="w-12 h-12" :style="{ color: 'var(--teal-400)' }" />
          </div>
          <div class="p-4">
            <h3 class="font-medium text-sm mb-1 truncate" :style="{ color: 'var(--foreground)' }">
              {{ item.title }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="font-semibold" :style="{ color: 'var(--teal-600)' }">
                {{ item.price }} 光币
              </span>
              <span
                v-if="item.originalPrice"
                class="text-xs line-through"
                :style="{ color: 'var(--muted-foreground)' }"
              >
                ¥{{ item.originalPrice }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                :style="{ backgroundColor: 'var(--secondary)' }"
              >
                {{ item.seller.avatar }}
              </div>
              <span class="text-xs" :style="{ color: 'var(--muted-foreground)' }">
                {{ item.seller.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="text-center py-16">
        <Package class="w-12 h-12 mx-auto mb-4" :style="{ color: 'var(--muted-foreground)' }" />
        <p :style="{ color: 'var(--muted-foreground)' }">暂无匹配的物品</p>
      </div>
    </section>

    <!-- Mobile FAB -->
    <button
      class="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105"
      :style="{ backgroundColor: 'var(--teal-600)' }"
    >
      <Plus class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Plus, Search, Package } from 'lucide-vue-next'

const activeCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'books', label: '书籍' },
  { id: 'electronics', label: '电子产品' },
  { id: 'clothing', label: '服饰' },
  { id: 'daily', label: '日用品' }
]

const items = ref([
  {
    id: 1,
    title: '高等数学同济版',
    price: 15,
    originalPrice: 68,
    categoryId: 'books',
    condition: '九成新',
    seller: { name: '学长', avatar: '📚' }
  },
  {
    id: 2,
    title: 'iPad Air 4',
    price: 200,
    originalPrice: 4799,
    categoryId: 'electronics',
    condition: '八成新',
    seller: { name: '毕业生', avatar: '🎓' }
  },
  {
    id: 3,
    title: '运动外套 L码',
    price: 20,
    originalPrice: 299,
    categoryId: 'clothing',
    condition: '九成新',
    seller: { name: '小美', avatar: '👧' }
  },
  {
    id: 4,
    title: '台灯护眼灯',
    price: 10,
    originalPrice: 89,
    categoryId: 'daily',
    condition: '全新',
    seller: { name: '室友', avatar: '💡' }
  },
  {
    id: 5,
    title: '考研政治资料',
    price: 25,
    categoryId: 'books',
    condition: '九成新',
    seller: { name: '上岸学姐', avatar: '✨' }
  },
  {
    id: 6,
    title: '机械键盘',
    price: 50,
    originalPrice: 399,
    categoryId: 'electronics',
    condition: '八成新',
    seller: { name: '码农', avatar: '⌨️' }
  }
])

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesCategory = activeCategory.value === 'all' || item.categoryId === activeCategory.value
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})
</script>
