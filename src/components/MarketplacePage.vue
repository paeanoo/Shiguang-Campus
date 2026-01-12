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
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold mb-2 font-serif" :style="{ color: 'var(--teal-700)' }">
            益起·流转
          </h1>
          <p class="text-sm text-muted-foreground">闲置物品循环，让爱意在校园流动</p>
        </div>
        <button
          v-if="user"
          @click="showPublishModal = true"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90"
          :style="{ backgroundColor: 'var(--teal-600)' }"
        >
          <Plus class="w-4 h-4" />
          发布物品
        </button>
      </div>
    </div>

    <div class="flex items-center gap-4 mb-8">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              class="w-5 h-5"
              :class="isFavorited(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'"
              :fill="isFavorited(product.id) ? 'currentColor' : 'none'"
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
            <div 
              class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              @click.stop="openUserProfileModal(product.publisher.id)"
            >
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

    <!-- Publish Product Modal -->
    <div v-if="showPublishModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="absolute inset-0 backdrop-blur-sm"
        :style="{ backgroundColor: 'rgba(45, 42, 38, 0.2)' }"
        @click="showPublishModal = false"
      />
      <div
        class="relative w-full max-w-lg mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
        :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
      >
        <button
          @click="showPublishModal = false"
          class="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="p-8">
          <h2 class="text-xl font-semibold mb-2 font-serif text-foreground">{{ productForm.id ? '编辑商品' : '发布闲置物品' }}</h2>
          <p class="text-sm text-muted-foreground mb-6">{{ productForm.id ? '修改商品信息' : '让闲置物品流转起来，传递校园温暖' }}</p>
          
          <form @submit.prevent="handlePublish" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">物品标题</label>
              <input
                type="text"
                v-model="productForm.title"
                placeholder="请输入物品标题"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">物品描述</label>
              <textarea
                v-model="productForm.description"
                placeholder="请输入物品描述"
                rows="3"
                class="w-full rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4 py-3"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">价格（元）</label>
                <input
                  type="number"
                  v-model="productForm.price"
                  placeholder="0"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">原价（元）</label>
                <input
                  type="number"
                  v-model="productForm.originalPrice"
                  placeholder="可选"
                  class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4"
                  :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">物品分类</label>
              <select
                v-model="productForm.category"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              >
                <option value="digital">数码</option>
                <option value="books">书籍</option>
                <option value="clothes">服饰</option>
                <option value="electronics">电子产品</option>
                <option value="furniture">家具</option>
                <option value="daily">日用品</option>
                <option value="other">其它</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">商品成色</label>
              <select
                v-model="productForm.condition"
                class="w-full h-11 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 px-4"
                :style="{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }"
              >
                <option value="brand_new">全新</option>
                <option value="like_new">几乎全新</option>
                <option value="good">良好</option>
                <option value="fair">一般</option>
                <option value="poor">较差</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">公益捐赠比例（%）</label>
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  v-model="productForm.donationPercentage"
                  min="0"
                  max="100"
                  step="5"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12 text-right">{{ productForm.donationPercentage }}%</span>
              </div>
              <p class="text-xs text-muted-foreground">
                将部分收入捐赠给公益项目，传递校园温暖
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">物品图片</label>
              <div
                class="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-teal-400"
                :style="{ borderColor: 'var(--border)' }"
                @click="$refs.imageInput.click()"
              >
                <img
                  v-if="productForm.imagePreview"
                  :src="productForm.imagePreview"
                  alt="物品图片"
                  class="w-full h-full object-cover"
                />
                <div v-else class="text-center">
                  <Upload class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p class="text-sm text-muted-foreground">点击上传图片</p>
                </div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full h-11 text-white rounded-xl text-sm font-medium transition-colors"
              :style="{ backgroundColor: 'var(--teal-600)' }"
              :disabled="publishing"
            >
              {{ publishing ? '发布中...' : '发布物品' }}
            </button>
          </form>
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
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <span
              v-if="selectedProduct.condition"
              class="px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: 'var(--teal-500)' }"
            >
              {{ getConditionLabel(selectedProduct.condition) }}
            </span>
            <span
              v-if="selectedProduct.category"
              class="px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: 'var(--teal-600)' }"
            >
              {{ getCategoryLabel(selectedProduct.category) }}
            </span>
            <span
              v-if="selectedProduct.donationPercentage > 0"
              class="px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: 'var(--amber-500)' }"
            >
              公益 {{ selectedProduct.donationPercentage }}%
            </span>
          </div>
          <h2 class="text-xl font-semibold mb-2 text-foreground">{{ selectedProduct.title }}</h2>
          <p class="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{{ selectedProduct.description }}</p>
          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-2xl font-semibold" :style="{ color: 'var(--teal-700)' }">
              ¥{{ selectedProduct.price }}
            </span>
            <span v-if="selectedProduct.originalPrice" class="text-sm line-through text-muted-foreground">
              ¥{{ selectedProduct.originalPrice }}
            </span>
          </div>
          <div class="text-xs text-muted-foreground mb-6">
            <p>发布时间：{{ formatDate(selectedProduct.created_at) }}</p>
          </div>
          <div 
            class="flex items-center gap-3 mb-6 pb-4 cursor-pointer hover:opacity-80 transition-opacity"
            :style="{ borderBottom: '1px solid var(--border)' }"
            @click="openUserProfileModal(selectedProduct.publisher.id)"
          >
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
          <div class="flex gap-3">
            <button
              v-if="user && user.id === selectedProduct.seller_id"
              @click="handleEditProduct(selectedProduct)"
              class="flex-1 h-11 rounded-xl text-sm font-medium border transition-all hover:bg-secondary flex items-center justify-center gap-2"
              :style="{ borderColor: 'var(--teal-600)', color: 'var(--teal-600)' }"
            >
              <Edit class="w-4 h-4" />
              编辑
            </button>
            <button
              v-if="user && user.id === selectedProduct.seller_id"
              @click="handleDeleteProduct(selectedProduct)"
              class="flex-1 h-11 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              :style="{ backgroundColor: 'var(--destructive)' }"
            >
              <Trash2 class="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <UserProfileModal />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, Search, Heart, Plus, X, Upload, Edit, Trash2 } from 'lucide-vue-next'
import { supabase } from '@lib/supabase'
import { storageService } from '@lib/storage'
import UserProfileModal from './UserProfileModal.vue'
import { openUserProfileModal } from '@/stores/userProfileModal'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

const categories = [
  { label: "全部", value: "all" },
  { label: "数码", value: "digital" },
  { label: "书籍", value: "books" },
  { label: "服饰", value: "clothes" },
  { label: "电子产品", value: "electronics" },
  { label: "家具", value: "furniture" },
  { label: "日用品", value: "daily" },
  { label: "其它", value: "other" }
]

const products = ref([])

const searchQuery = ref("")
const activeCategory = ref("all")
const showPublishModal = ref(false)
const publishing = ref(false)
const showDetailModal = ref(false)
const selectedProduct = ref(null)
const favoriteIds = ref([])

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(id, username, nickname, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) throw error

    products.value = data.map(product => ({
      ...product,
      image: product.image_url || 'https://via.placeholder.com/300?text=No+Image',
      donationPercentage: product.donation_percentage || 0,
      originalPrice: product.original_price,
      publisher: {
        id: product.profiles?.id,
        name: product.profiles?.nickname || product.profiles?.username || (product.profiles?.email ? product.profiles.email.split('@')[0] : '未知用户'),
        username: product.profiles?.username,
        avatar: product.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      }
    }))
  } catch (error) {
    console.error('Load products error:', error)
  }
}

const loadFavorites = async () => {
  if (!props.user) return

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', props.user.id)

    if (error) throw error

    favoriteIds.value = data.map(f => f.product_id)
  } catch (error) {
    console.error('Load favorites error:', error)
  }
}

onMounted(() => {
  loadProducts()
  loadFavorites()
})

const productForm = ref({
  id: null,
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  category: 'digital',
  condition: 'good',
  donationPercentage: 0,
  image: null,
  imagePreview: ''
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

const getCategoryLabel = (category) => {
  const labels = {
    digital: '数码',
    books: '书籍',
    clothes: '服饰',
    electronics: '电子产品',
    furniture: '家具',
    daily: '日用品',
    other: '其它'
  }
  return labels[category] || category
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filteredProducts = computed(() => {
  return products.value
    .filter(p => activeCategory.value === "all" || p.category === activeCategory.value)
    .filter(p => p.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    productForm.value.image = file
    productForm.value.imagePreview = URL.createObjectURL(file)
  }
}

const handlePublish = async () => {
  if (!props.user) {
    alert('请先登录')
    return
  }

  publishing.value = true

  try {
    let imageUrl = productForm.value.imagePreview
    if (productForm.value.image) {
      const { url, error } = await storageService.uploadProductImage(productForm.value.image)
      if (error) throw error
      imageUrl = url
    }

    const productData = {
      title: productForm.value.title,
      description: productForm.value.description,
      price: parseFloat(productForm.value.price) || 0,
      original_price: parseFloat(productForm.value.originalPrice) || null,
      category: productForm.value.category,
      condition: productForm.value.condition,
      donation_percentage: parseInt(productForm.value.donationPercentage) || 0,
      image_url: imageUrl,
      seller_id: props.user.id,
      likes: 0
    }

    if (productForm.value.id) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productForm.value.id)

      if (error) throw error

      const index = products.value.findIndex(p => p.id === productForm.value.id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...productData,
          image: imageUrl,
          donationPercentage: productData.donation_percentage,
          originalPrice: productData.original_price
        }
      }
    } else {
      productData.created_at = new Date().toISOString()
      const { error } = await supabase.from('products').insert([productData])
      if (error) throw error

      products.value.unshift({
        ...productData,
        id: Date.now(),
        image: imageUrl,
        donationPercentage: productData.donation_percentage,
        originalPrice: productData.original_price,
        publisher: {
          name: props.user.username || props.user.email.split('@')[0],
          avatar: props.user.avatar_url
        }
      })
      // 标记发布物品任务为已完成（若存在 publish_product 任务）
      try {
        const { data: taskRow, error: taskError } = await supabase
          .from('tasks')
          .select('id')
          .eq('task_type', 'publish_product')
          .limit(1)
          .single()
        if (!taskError && taskRow && taskRow.id) {
          await supabase.rpc('complete_task', {
            user_uuid: props.user.id,
            task_uuid: taskRow.id
          })
          // 刷新任务状态与用户信息
          await supabase.from('user_tasks').select('*').eq('user_id', props.user.id)
          // refresh UI lists
          loadProducts()
          loadFavorites()
        }
      } catch (err) {
        console.error('Mark publish task completed error:', err)
      }
    }

    showPublishModal.value = false
    resetProductForm()
    alert(productForm.value.id ? '商品更新成功！' : '物品发布成功！')
  } catch (error) {
    console.error('Publish error:', error)
    alert('操作失败: ' + error.message)
  } finally {
    publishing.value = false
  }
}

const resetProductForm = () => {
  productForm.value = {
    id: null,
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'digital',
    condition: 'good',
    donationPercentage: 0,
    image: null,
    imagePreview: ''
  }
}

const isFavorited = (productId) => {
  return favoriteIds.value.includes(productId)
}

const toggleFavorite = async (product) => {
  if (!props.user) {
    return
  }

  try {
    if (isFavorited(product.id)) {
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

      favoriteIds.value = favoriteIds.value.filter(id => id !== product.id)
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: props.user.id,
          product_id: product.id,
          created_at: new Date().toISOString()
        }])

      if (error) {
        if (error.message && error.message.includes('duplicate key')) {
          favoriteIds.value.push(product.id)
          return
        }
        throw error
      }

      favoriteIds.value.push(product.id)
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
  }
}

const showProductDetail = (product) => {
  selectedProduct.value = product
  showDetailModal.value = true
}

const handleEditProduct = (product) => {
  showDetailModal.value = false
  showPublishModal.value = true
  productForm.value = {
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: product.original_price || '',
    category: product.category,
    condition: product.condition || 'good',
    donationPercentage: product.donation_percentage || 0,
    image: null,
    imagePreview: product.image_url || ''
  }
}

const handleDeleteProduct = async (product) => {
  if (!confirm('确定要删除这个商品吗？')) {
    return
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) throw error

    products.value = products.value.filter(p => p.id !== product.id)
    showDetailModal.value = false
    alert('商品已删除')
  } catch (error) {
    console.error('Delete error:', error)
    alert('删除失败: ' + error.message)
  }
}
</script>
