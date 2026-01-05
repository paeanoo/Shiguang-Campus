<template>
  <section class="max-w-5xl mx-auto px-6 py-8">
    <div class="mb-8">
      <router-link
        to="/"
        class="text-sm mb-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        返回
      </router-link>
      <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--teal-700)' }">
        我的收藏
      </h1>
      <p class="text-sm text-muted-foreground">收藏的闲置物品</p>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-muted-foreground">加载中...</p>
    </div>

    <div v-else-if="!user" class="text-center py-16">
      <Heart class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p class="text-muted-foreground">请先登录</p>
      <button
        @click="$emit('open-login')"
        class="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
        :style="{ backgroundColor: 'var(--teal-600)' }"
      >
        去登录
      </button>
    </div>

    <div v-else-if="favoriteProducts.length === 0" class="text-center py-16">
      <Heart class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p class="text-muted-foreground">暂无收藏</p>
      <router-link
        to="/marketplace"
        class="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
        :style="{ backgroundColor: 'var(--teal-600)' }"
      >
        去逛逛
      </router-link>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-5">
      <div
        v-for="product in favoriteProducts"
        :key="product.id"
        class="group rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300 cursor-pointer"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        @click="showProductDetail(product)"
      >
        <div class="relative aspect-square overflow-hidden" :style="{ backgroundColor: 'var(--muted)' }">
          <img
            :src="product.image"
            :alt="product.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            v-if="product.donationPercentage > 0"
            class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white"
            :style="{ backgroundColor: 'var(--teal-600)' }"
          >
            公益 {{ product.donationPercentage }}%
          </div>
          <div
            v-if="product.condition"
            class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
            :style="{ backgroundColor: 'var(--teal-500)' }"
          >
            {{ getConditionLabel(product.condition) }}
          </div>
          <button
            @click.stop="toggleFavorite(product)"
            class="absolute bottom-2 right-2 p-2 rounded-full transition-all hover:scale-110"
            :style="{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }"
          >
            <Heart
              class="w-5 h-5 text-red-500"
              fill="currentColor"
            />
          </button>
        </div>
        <div class="p-4">
          <h3 class="text-sm font-medium mb-2 line-clamp-1 text-foreground">{{ product.title }}</h3>
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-lg font-semibold" :style="{ color: 'var(--teal-700)' }">
              ¥{{ product.price }}
            </span>
            <span v-if="product.originalPrice" class="text-xs line-through text-muted-foreground">
              ¥{{ product.originalPrice }}
            </span>
          </div>
          <div class="flex items-center justify-between pt-3" :style="{ borderTop: '1px solid var(--border)' }">
            <div class="flex items-center gap-2">
              <img
                :src="product.publisher.avatar"
                :alt="product.publisher.name"
                class="w-5 h-5 rounded-full object-cover"
              />
              <span class="text-xs text-muted-foreground">{{ product.publisher.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <div v-if="showDetailModal && selectedProduct" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 backdrop-blur-sm"
        :style="{ backgroundColor: 'rgba(45, 42, 38, 0.2)' }"
        @click="showDetailModal = false"
      />
      <div
        class="relative w-full max-w-lg mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
      >
        <button
          @click="showDetailModal = false"
          class="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="p-6">
          <div class="aspect-square rounded-xl overflow-hidden mb-4" :style="{ backgroundColor: 'var(--muted)' }">
            <img
              :src="selectedProduct.image"
              :alt="selectedProduct.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex items-center gap-2 mb-3">
            <span
              v-if="selectedProduct.condition"
              class="px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: 'var(--teal-500)' }"
            >
              {{ getConditionLabel(selectedProduct.condition) }}
            </span>
            <span
              v-if="selectedProduct.donationPercentage > 0"
              class="px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: 'var(--teal-600)' }"
            >
              公益 {{ selectedProduct.donationPercentage }}%
            </span>
          </div>
          <h2 class="text-xl font-semibold mb-2 text-foreground">{{ selectedProduct.title }}</h2>
          <p class="text-sm text-muted-foreground mb-4">{{ selectedProduct.description }}</p>
          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-2xl font-semibold" :style="{ color: 'var(--teal-700)' }">
              ¥{{ selectedProduct.price }}
            </span>
            <span v-if="selectedProduct.originalPrice" class="text-sm line-through text-muted-foreground">
              ¥{{ selectedProduct.originalPrice }}
            </span>
          </div>
          <div class="flex items-center gap-3 mb-6 pb-4" :style="{ borderBottom: '1px solid var(--border)' }">
            <img
              :src="selectedProduct.publisher.avatar"
              :alt="selectedProduct.publisher.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p class="text-sm font-medium text-foreground">{{ selectedProduct.publisher.name }}</p>
              <p class="text-xs text-muted-foreground">发布者</p>
            </div>
          </div>
          <button
            class="w-full h-11 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--teal-600)' }"
          >
            联系卖家
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ChevronLeft, Heart, X } from 'lucide-vue-next'
import { supabase } from '@lib/supabase'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['user-updated', 'open-login'])

const loading = ref(true)
const favoriteProducts = ref([])
const showDetailModal = ref(false)
const selectedProduct = ref(null)

const loadFavorites = async () => {
  if (!props.user) {
    loading.value = false
    return
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*, profiles(username, avatar_url))')
      .eq('user_id', props.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    favoriteProducts.value = data.map(fav => ({
      ...fav.products,
      image: fav.products.image_url || 'https://via.placeholder.com/300?text=No+Image',
      donationPercentage: fav.products.donation_percentage || 0,
      originalPrice: fav.products.original_price,
      publisher: {
        name: fav.products.profiles?.username || fav.products.profiles?.email || '未知用户',
        avatar: fav.products.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      }
    }))
  } catch (error) {
    console.error('Load favorites error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFavorites()
})

const getConditionLabel = (condition) => {
  const labels = {
    brand_new: '全新',
    like_new: '几乎全新',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return labels[condition] || condition
}

const toggleFavorite = async (product) => {
  if (!props.user) return

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', props.user.id)
      .eq('product_id', product.id)

    if (error) {
      if (error.message && error.message.includes('duplicate key')) {
        return
      }
      throw error
    }

    favoriteProducts.value = favoriteProducts.value.filter(p => p.id !== product.id)
    alert('已取消收藏')
  } catch (error) {
    console.error('Toggle favorite error:', error)
    alert('操作失败: ' + error.message)
  }
}

const showProductDetail = (product) => {
  selectedProduct.value = product
  showDetailModal.value = true
}
</script>
