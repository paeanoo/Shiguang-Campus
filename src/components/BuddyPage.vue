<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <router-link
              to="/"
              class="flex items-center gap-2 text-sm mb-4 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft class="w-4 h-4" />
              返回首页
            </router-link>
            <h1 class="text-2xl md:text-3xl font-semibold font-serif text-foreground">找到你的校园搭子</h1>
            <p class="mt-2 text-muted-foreground">别一个人！找个伴一起学习、运动、看演出</p>
          </div>
          <div class="hidden md:flex items-center gap-3">
          <button
              @click="showPublishModal = true"
              class="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-600)' }"
          >
            <Plus class="w-4 h-4" />
            发布需求
          </button>
            <button
              @click="showPlazaModal = true"
              class="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all hover:bg-secondary"
            >
              广场
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter & Search Bar -->
    <section
      class="sticky top-16 z-10 border-b"
      :style="{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }"
    >
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Category Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              :class="activeCategory === category.id ? 'text-white' : 'bg-secondary text-muted-foreground hover:bg-muted'"
              :style="activeCategory === category.id ? { backgroundColor: 'var(--emerald-600)' } : {}"
            >
              {{ category.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex-1 md:max-w-sm md:ml-auto">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索「音乐节」或「图书馆」..."
                v-model="searchQuery"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Buddy requests list (card grid) -->
    <section class="max-w-6xl mx-auto px-6 py-6">
      <div v-if="filteredRequests.length === 0" class="text-center text-muted-foreground py-20">
        暂无匹配搭子，试试发布一个吧
              </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="req in filteredRequests"
          :key="req.id"
          class="rounded-2xl p-4 shadow-sm"
          :style="{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }"
        >
          <div class="flex items-start gap-3">
            <img
              @click="openChatWith(req)"
              :src="req.user?.avatar || defaultAvatar"
              @error="onAvatarError"
              alt="avatar"
              class="w-12 h-12 rounded-full object-cover cursor-pointer"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="font-medium text-sm">{{ req.user?.name || '匿名' }}</div>
                    <div v-if="req.isOfficial" class="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">官方</div>
                </div>
                  <div class="text-xs text-muted-foreground">{{ req.user?.time || formatTimeAgo(req.created_at) }}</div>
                </div>
                <div class="text-xs text-muted-foreground">{{ req.category || '—' }}</div>
              </div>

              <h3 class="mt-3 font-semibold text-lg">{{ req.title }}</h3>
              <p class="text-sm text-muted-foreground mt-2 line-clamp-3">{{ req.description }}</p>

              <div class="flex flex-wrap gap-2 mt-3">
                <span v-for="tag in req.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{{ tag }}</span>
              </div>

              <div class="mt-3">
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div :style="{ width: progressPercent(req) + '%' , backgroundColor: 'var(--emerald-500)' }" class="h-2"></div>
                </div>
                <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <div>{{ req.slots?.filled || 0 }} / {{ req.slots?.total || req.slots_total || '—' }} 人</div>
                  <div>{{ req.created_at ? new Date(req.created_at).toLocaleString() : '' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex gap-3">
            <button @click="handleViewDetail(req)" class="flex-1 px-3 py-2 rounded-lg border text-sm flex items-center justify-center gap-2" :style="{ borderColor: 'var(--border)' }">
              <span>查看详情</span>
            </button>
            <button v-if="isJoined(req.id)" @click="toggleJoin(req.id)" class="flex-1 px-3 py-2 rounded-lg text-white text-sm" :style="{ backgroundColor: 'var(--red-500)' }">
              退出房间
            </button>
            <button v-else @click="toggleJoin(req.id)" :disabled="isFull(req)" class="flex-1 px-3 py-2 rounded-lg text-white text-sm" :style="{ backgroundColor: isFull(req) ? 'gray' : 'var(--emerald-600)' }">
              {{ isFull(req) ? '已满' : '加入' }}
            </button>
          </div>
        </div>
      </div>
    </section>

                </div>

  <!-- Toast / status -->
  <teleport to="body">
    <div v-if="publishToastVisible" class="fixed bottom-6 right-6 z-[99999]">
      <div class="px-4 py-2 rounded-full shadow-lg text-white" :style="{ backgroundColor: 'var(--emerald-600)' }">
        {{ publishToastMessage }}
                </div>
              </div>
  </teleport>

<!-- Plaza Modal -->
<teleport to="body" v-if="showPlazaModal">
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="showPlazaModal = false" />
    <div class="relative w-full max-w-3xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" :style="{ backgroundColor: 'var(--card)' }">
      <button @click="showPlazaModal = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors">
        <X class="w-5 h-5 text-muted-foreground" />
      </button>
      <h3 class="font-semibold text-lg text-foreground mb-4">搭子广场</h3>

      <div class="mb-4">
        <input v-model="newPostTitle" placeholder="标题（可选）" class="w-full mb-2 px-3 py-2 rounded-lg border" :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }" />
        <textarea v-model="newPostContent" placeholder="说点什么..." class="w-full px-3 py-2 rounded-lg border" rows="4" :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }"></textarea>
        <div class="flex justify-end mt-2">
          <button @click="handleCreatePlazaPost" class="px-4 py-2 rounded-lg text-white" :style="{ backgroundColor: 'var(--emerald-600)' }">发布</button>
            </div>
          </div>

            <div class="space-y-4">
        <div v-for="post in plazaPosts" :key="post.id" class="border rounded-lg p-4" :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }">
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-base">{{ post.title || '无标题' }}</h4>
                <span class="text-xs text-muted-foreground">{{ new Date(post.created_at).toLocaleString() }}</span>
              </div>
              <p class="text-sm text-muted-foreground mt-2">{{ post.content }}</p>
              <div class="mt-3">
                <button @click="loadCommentsForPost(post.id)" class="text-sm text-muted-foreground mr-3">查看评论</button>
                <button @click="handleLike(post.id)" class="text-sm">👍 {{ post.likes || 0 }}</button>
              </div>
              <div v-if="currentComments.length" class="mt-3 border-t pt-3">
                <div v-for="c in currentComments" :key="c.id" class="mb-2">
                  <p class="text-sm"><span class="font-medium text-foreground">{{ c.user_id }}</span> · <span class="text-xs text-muted-foreground">{{ new Date(c.created_at).toLocaleString() }}</span></p>
                  <p class="text-sm text-muted-foreground">{{ c.content }}</p>
                </div>
                <div class="flex gap-2 mt-2">
                  <input v-model="commentContent" placeholder="写评论..." class="flex-1 px-3 py-2 rounded-lg border" :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }" />
                  <button @click="createComment(post.id)" class="px-3 py-2 rounded-lg text-white" :style="{ backgroundColor: 'var(--emerald-600)' }">评论</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</teleport>

<UserProfileModal
  :show="showUserProfileModal"
  :user="selectedUserProfile"
  :current-user="props.user"
  @close="showUserProfileModal = false"
/>

<!-- Publish Request Modal -->
<teleport to="body" v-if="showPublishModal">
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="showPublishModal = false" />
    <div class="relative w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" :style="{ backgroundColor: 'var(--card)' }">
      <button @click="showPublishModal = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors" aria-label="关闭">
          <X class="w-5 h-5 text-muted-foreground" />
        </button>

      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-foreground mb-2">{{ editingRequestId ? '编辑搭子需求' : '发布搭子需求' }}</h3>

          <label class="text-sm text-muted-foreground">标题</label>
          <input
            v-model="newReqTitle"
            placeholder="一句话概括你的需求（例如：周末图书馆自习）"
            class="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />

          <label class="text-sm text-muted-foreground">描述</label>
          <textarea
            v-model="newReqDescription"
            placeholder="具体描述（时间、地点、频率、要求等）"
            class="w-full mt-1 px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            rows="5"
          ></textarea>

          <label class="text-sm text-muted-foreground mt-3">标签</label>
          
          <div class="mt-2">
            <div class="text-xs text-muted-foreground mb-2">快速选择（点击添加）</div>
            <div class="flex flex-wrap gap-2 mb-3">
              <button
                v-for="tag in presetTags"
                :key="tag"
                @click="toggleTag(tag)"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs transition-all',
                  newReqSelectedTags.includes(tag)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <label class="text-sm text-muted-foreground">自定义标签（逗号分隔，回车添加）</label>
          <input 
            v-model="newReqTagsInput" 
            @keyup.enter="addCustomTags"
            @blur="addCustomTags"
            placeholder="例如：学习,音乐,周末" 
            class="w-full mt-2 px-3 py-2 rounded-lg border" 
            :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }" 
          />

          <div class="mt-3">
            <div class="text-sm text-muted-foreground">关联拾光·活动（可选）</div>
            <select v-model="selectedEventId" class="w-full mt-2 px-3 py-2 rounded-lg border" :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }">
              <option :value="null">无</option>
              <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.title }}</option>
            </select>
          </div>

          <div class="flex items-center justify-between mt-4">
            <div class="flex-1">
              <div class="text-sm text-muted-foreground mb-2">已选标签：</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in newReqSelectedTags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  class="px-3 py-1.5 rounded-full text-xs bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-colors"
                >
                  {{ tag }} ×
                </span>
                <span v-if="newReqSelectedTags.length === 0" class="text-xs text-muted-foreground">无</span>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <label class="text-sm text-muted-foreground">人数上限</label>
              <input
                type="number"
                v-model.number="newReqMaxMembers"
                min="1"
                class="w-20 px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
          </div>
          </div>
        </div>

      <div class="flex justify-end mt-4">
        <button
          @click="editingRequestId ? handleUpdateRequest() : handleCreateRequest()"
          :disabled="isPublishing"
          class="px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          :style="{ backgroundColor: 'var(--emerald-600)' }"
        >
          <span v-if="!isPublishing">{{ editingRequestId ? '更新' : '发布' }}</span>
          <span v-else>{{ editingRequestId ? '更新中...' : '发布中...' }}</span>
        </button>
      </div>
    </div>
  </div>
</teleport>

<!-- Detail Modal -->
<teleport to="body" v-if="showDetailModal">
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40" @click="showDetailModal = false" />
    <div class="relative w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" :style="{ backgroundColor: 'var(--card)' }">
      <button @click="showDetailModal = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors" aria-label="关闭">
        <X class="w-5 h-5 text-muted-foreground" />
      </button>

      <h3 class="font-semibold text-lg text-foreground mb-2">{{ selectedRequest.title }}</h3>
      <div class="text-sm text-muted-foreground mb-4">{{ selectedRequest.description }}</div>

      <div class="mb-4">
        <div class="text-sm text-muted-foreground mb-2">关联活动</div>
        <div v-if="selectedRequest.related_event_id" class="px-3 py-2 rounded-md bg-amber-100 text-amber-700 inline-block">
          {{ selectedRequest.related_event_name || '关联活动' }}
        </div>
        <div v-else class="text-xs text-muted-foreground">无</div>
      </div>

      <div class="mb-4">
        <div class="text-sm text-muted-foreground mb-2">标签</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="t in selectedRequest.tags || []" :key="t" class="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">{{ t }}</span>
        </div>
        </div>

      <div class="border-t pt-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-medium">成员 ({{ modalMemberCount }})</div>
          <button 
            v-if="isJoined(selectedRequest.id)" 
            @click="openRoomChat(selectedRequest)"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-600)' }"
          >
            <MessageCircle class="w-4 h-4" />
            <span>进入群聊</span>
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="m in modalMembers" :key="m.user_id || m.name" class="flex items-center gap-3">
            <button @click="showUserProfile(m)" class="relative group">
              <img :src="m.avatar || defaultAvatar" @error="onAvatarError" class="w-8 h-8 rounded-full hover:ring-2 hover:ring-emerald-300 transition-all" />
            </button>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="font-medium">{{ m.name }}</div>
                <div v-if="m.isHost" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">房主</div>
                <div v-if="m.isOfficial && m.isHost" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">官方</div>
                <div v-else-if="m.user_id === modalUserId" class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">我</div>
              </div>
            </div>
            </div>
          </div>
        </div>

          <div class="flex gap-3">
        <button v-if="!isJoined(selectedRequest.id)" @click="toggleJoin(selectedRequest.id)" class="flex-1 px-4 py-2 rounded-lg text-white" :style="{ backgroundColor: 'var(--emerald-600)' }">加入</button>
        <button v-else @click="toggleJoin(selectedRequest.id)" class="flex-1 px-4 py-2 rounded-lg text-white" :style="{ backgroundColor: 'var(--red-500)' }">退出房间</button>
        <button v-if="modalUserId === selectedRequest.creator_id" @click="handleEditRequest" class="flex-1 px-4 py-2 rounded-lg text-white" :style="{ backgroundColor: 'var(--amber-600)' }">编辑</button>
        <button v-if="modalUserId === selectedRequest.creator_id" @click="deleteRoom" class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white">删除房间</button>
      </div>
    </div>
  </div>
</teleport>

<GlobalChatOverlay />
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@lib/supabase'
import {
  ArrowLeft,
  Search,
  Users,
  Calendar,
  MessageCircle,
  Ticket,
  Clock,
  Plus,
  X,
  Check,
  LogOut,
  UserPlus,
  Crown
} from 'lucide-vue-next'
import { useChatStore } from '../stores/chatStore'
import UserProfileModal from './UserProfileModal.vue'
import GlobalChatOverlay from './GlobalChatOverlay.vue'

// accept user prop from parent (auth state)
const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['navigate'])

const categories = [
  { id: 'all', label: '全部' },
  { id: 'event', label: '活动搭子' },
  { id: 'study', label: '学习' },
  { id: 'sports', label: '运动' },
  { id: 'dining', label: '约饭' },
  { id: 'travel', label: '旅行' },
  { id: 'gaming', label: '游戏' },
  { id: 'other', label: '其它' }
];

const activeCategory = ref('all')
const searchQuery = ref('')
const buddyRequests = ref([])
const trendingEvents = ref([])
const joinedIds = ref([])
// local persistence key for joined room ids (fallback)
const JOINED_IDS_KEY = 'joined_buddy_ids'
// try restore optimistic joins from localStorage so refresh doesn't immediately lose UI state
try {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(JOINED_IDS_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      joinedIds.value = Array.isArray(parsed) ? parsed.map(String) : []
    }
  }
} catch (e) {
  console.warn('restore joinedIds from localStorage failed', e)
}
const selectedRequest = ref(null)
const showDetailModal = ref(false)
const defaultAvatar = 'placeholder-user.jpg'
const showUserProfileModal = ref(false)
const selectedUserProfile = ref(null)
const currentUserId = ref(null)

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return date.toLocaleDateString('zh-CN')
}

const loadBuddyRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('buddy_requests')
      .select('*, profiles(username, avatar_url, user_type)')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Load members for all requests
    const { data: membersData, error: membersError } = await supabase
      .from('buddy_request_members')
      .select('request_id, user_id')
      .in('request_id', data.map(r => r.id))
    
    if (membersError) {
      console.warn('Load members failed', membersError)
    }

    // Get all unique user_ids from members
    const userIds = [...new Set(membersData?.map(m => m.user_id) || [])]
    
    // Load profiles for all users
    let profilesMap = {}
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds)
      
      if (!profilesError && profilesData) {
        profilesData.forEach(p => {
          profilesMap[p.id] = p
        })
      }
    }

    // Group members by request_id
    const membersByRequest = {}
    if (membersData) {
      membersData.forEach(m => {
        if (!membersByRequest[m.request_id]) {
          membersByRequest[m.request_id] = []
        }
        const profile = profilesMap[m.user_id]
        membersByRequest[m.request_id].push({
          user_id: m.user_id,
          name: profile?.username || '成员',
          avatar: profile?.avatar_url || defaultAvatar,
          isHost: false
        })
      })
    }

    buddyRequests.value = data.map(request => {
      const members = membersByRequest[request.id] || []
      // Count actual members from buddy_request_members table
      const actualFilled = members.length > 0 ? members.length : (request.creator_id ? 1 : 0)
      
      return {
        ...request,
        user: {
          name: request.profiles?.username || '未知用户',
          avatar: request.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          time: formatTimeAgo(new Date(request.created_at))
        },
        isOfficial: request.profiles?.user_type === 'organizer',
        slots: {
          // Use actual member count from database
          filled: actualFilled,
          total: request.slots_total ?? request.max_slots ?? request.max_members ?? 5
        },
        members: members,
        tags: request.tags || []
      }
    }).map(r => {
      // attach related event name if we have loaded events
      if (r.related_event_id && events.value && events.value.length) {
        const ev = events.value.find(e => String(e.id) === String(r.related_event_id))
        if (ev) r.related_event_name = ev.title || ev.name || ''
      }
      return r
    })
  } catch (error) {
    console.error('Load buddy requests error:', error)
  }
}
 
// Load current user's memberships (persisted) into joinedIds
const loadMyMemberships = async () => {
  try {
    // wait for auth to be ready (some environments restore session asynchronously)
    let me = await getCurrentUser()
    let attempts = 0
    while (!me && attempts < 8) {
      // small delay and retry
      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, 200))
      // eslint-disable-next-line no-await-in-loop
      me = await getCurrentUser()
      attempts += 1
    }
    if (!me) {
      console.warn('loadMyMemberships: no authenticated user found after retries')
      return
    }
    const { data, error } = await supabase
      .from('buddy_request_members')
      .select('request_id')
      .eq('user_id', me.id)
    if (error) {
      // table may not exist or RLS may prevent; log and continue
      console.warn('loadMyMemberships failed', error)
      try { alert('加载我的房间成员信息失败：' + (error.message || JSON.stringify(error))) } catch (e) {}
      return
    }
    const serverIds = (data || []).map(r => String(r.request_id))
    // Only use server data if it's not empty. If server returns empty but we have local state,
    // preserve local state to avoid losing UI state when RLS/table blocks select.
    if (serverIds.length > 0) {
      joinedIds.value = serverIds
      // persist to localStorage as a fallback so refresh keeps UI state
      try {
        if (typeof window !== 'undefined') localStorage.setItem(JOINED_IDS_KEY, JSON.stringify(joinedIds.value))
      } catch (e) { console.warn('persist joinedIds to localStorage failed', e) }
    } else if (joinedIds.value.length === 0) {
      // Only clear local state if server returns empty and we have no local state
      joinedIds.value = serverIds
      try {
        if (typeof window !== 'undefined') localStorage.setItem(JOINED_IDS_KEY, JSON.stringify(joinedIds.value))
      } catch (e) { console.warn('persist joinedIds to localStorage failed', e) }
    }
    // If server returns empty but we already have local state (joinedIds.value.length > 0),
    // preserve local state to avoid losing UI state
  } catch (e) {
    console.warn('loadMyMemberships exception', e)
    try { alert('加载我的房间成员信息异常：' + (e.message || String(e))) } catch (er) {}
  }
}

const loadTrendingEvents = async () => {
  try {
    // select all columns to avoid referencing missing column names
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error

    trendingEvents.value = (data || []).map(event => ({
      ...event,
      buddyCount: Math.floor(Math.random() * 50) + 20
    }))
  } catch (error) {
    console.error('Load trending events error:', error)
    // fallback: show nothing rather than crashing
    trendingEvents.value = []
  }
}

onMounted(() => {
  loadBuddyRequests()
  loadTrendingEvents()
  loadPlazaPosts()
  loadEvents()
  // also load persisted memberships for current user
  loadMyMemberships().catch(e => console.warn('loadMyMemberships onMounted failed', e))
  // resolve current user id synchronously so isJoined can check request.members
  ;(async () => {
    try {
      if (supabase.auth && typeof supabase.auth.getUser === 'function') {
        const res = await supabase.auth.getUser()
        currentUserId.value = res?.data?.user?.id || null
      }
    } catch (e) {
      console.warn('resolve currentUserId failed', e)
    }
  })()
})

// events list for linking
const events = ref([])
const selectedEventId = ref(null)
const loadEvents = async () => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    if (error) throw error
    events.value = (data || []).map(ev => ({ ...ev, title: ev.title || ev.name }))
  } catch (e) {
    console.warn('loadEvents failed', e)
    events.value = []
  }
}

// chat store
const chat = useChatStore()

const progressPercent = (r) => {
  const filled = (r.slots && r.slots.filled) || 0
  const total = (r.slots && r.slots.total) || r.slots_total || 1
  return Math.min(100, Math.round((filled / Math.max(1, total)) * 100))
}

const openChatWith = (req) => {
  if (!req) return
  try { chat.openRoomChat({ id: req.id, title: req.title || '房间聊天' }) } catch (e) { console.warn('openRoomChat failed', e) }
}

const openRoomChat = async (request) => {
  if (!request) return
  console.log('openRoomChat called with request:', request)
  try {
    await chat.openRoomChat({ id: request.id, title: request.title || '房间聊天' })
    console.log('chat state after openRoomChat:', { isChatOpen: chat.isChatOpen, currentRoom: chat.currentRoom })
    showDetailModal.value = false
  } catch (e) {
    console.warn('openRoomChat failed', e)
  }
}
// --- Plaza logic ---
const plazaPosts = ref([])
const showPlazaModal = ref(false)
const plazaPage = ref(1)
const plazaPageSize = ref(10)
const newPostTitle = ref('')
const newPostContent = ref('')
const currentComments = ref([])
const commentContent = ref('')
const isPostingPlaza = ref(false)
// publish modal inputs
const newReqTagsInput = ref('')
const newReqSelectedTags = ref([])
const presetTags = [
  '学习', '运动', '约饭', '娱乐', '音乐', '电影', '游戏', 
  '拼车', 'AA制', '周末', '限女生', '限男生', '长期', '短期',
  '图书馆', '健身房', '户外', '室内', '线上', '线下'
]

const loadPlazaPosts = async () => {
  try {
    // prefer RPC; if RPC not available, fallback to direct table select
    try {
      const { data, error } = await supabase.rpc('list_plaza_posts', { page: plazaPage.value, page_size: plazaPageSize.value })
      if (error) throw error
      plazaPosts.value = data || []
      return
    } catch (rpcErr) {
      console.warn('list_plaza_posts rpc failed, falling back to table select:', rpcErr)
      const offset = (plazaPage.value - 1) * plazaPageSize.value
      const { data, error } = await supabase
        .from('plaza_posts')
        .select('id, user_id, title, content, tags, images, likes, created_at, updated_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + plazaPageSize.value - 1)
      if (error) throw error
      plazaPosts.value = data || []
      return
    }
  } catch (err) {
    console.error('Load plaza posts error:', err)
    plazaPosts.value = []
  }
}

// helper to robustly get current user
const getCurrentUser = async () => {
  if (props.user) return props.user
  try {
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      const res = await supabase.auth.getUser()
      return res?.data?.user || null
    }
    if (supabase.auth && typeof supabase.auth.user === 'function') {
      return supabase.auth.user() || null
    }
  } catch (e) {
    console.error('getCurrentUser error', e)
  }
  return null
}

// avatar fallback handler
function onAvatarError(e) {
  try { e.target.src = defaultAvatar } catch (err) {}
}

const handleCreatePlazaPost = async () => {
  if (!newPostTitle.value && !newPostContent.value) {
    alert('请输入标题或内容')
    return
  }
  if (isPostingPlaza.value) return

  const user = await getCurrentUser()
  if (!user) {
    alert('请先登录')
    return
  }

  // optimistic UI: insert a temporary post so user sees immediate feedback
  const tempId = `temp-${Date.now()}`
  const tempPost = {
    id: tempId,
    user_id: user.id,
    title: newPostTitle.value,
    content: newPostContent.value,
    tags: [],
    images: [],
    likes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: { name: user?.email || '我', avatar: user?.avatar_url || null }
  }
  plazaPosts.value.unshift(tempPost)
  isPostingPlaza.value = true

  try {
    // try RPC first
    const { data, error } = await supabase.rpc('create_plaza_post', {
      author_uuid: user.id,
      p_title: newPostTitle.value,
      p_content: newPostContent.value,
      p_tags: '[]',
      p_images: []
    })

    if (error) throw error

    if (data && data.success) {
      // reload list to replace temp with real data
      await loadPlazaPosts()
    } else {
      // RPC returned failure — remove temp and show message
      plazaPosts.value = plazaPosts.value.filter(p => p.id !== tempId)
      alert(data.message || '发布失败')
    }
  } catch (err) {
    console.error('Create plaza post error:', err)
    // remove temp on error
    plazaPosts.value = plazaPosts.value.filter(p => p.id !== tempId)
    alert('发布失败: ' + (err.message || err))
  } finally {
    isPostingPlaza.value = false
    newPostTitle.value = ''
    newPostContent.value = ''
  }
}

const loadCommentsForPost = async (postId) => {
  try {
    // try RPC first, fallback to table select
    try {
      const { data, error } = await supabase.rpc('list_plaza_comments', { p_post_id: postId })
      if (error) throw error
      currentComments.value = data || []
      return
    } catch (rpcErr) {
      console.warn('list_plaza_comments rpc failed, falling back to table select:', rpcErr)
      const { data, error } = await supabase
        .from('plaza_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      currentComments.value = data || []
      return
    }
  } catch (err) {
    console.error('Load comments error:', err)
  }
}

const createComment = async (postId) => {
  if (!commentContent.value) return
  try {
    const user = await getCurrentUser()
    if (!user) {
      alert('请先登录')
      return
    }
    const { data, error } = await supabase.rpc('create_plaza_comment', {
      author_uuid: user.id,
      p_post_id: postId,
      p_content: commentContent.value
    })
    if (error) throw error
    if (data && data.success) {
      commentContent.value = ''
      loadCommentsForPost(postId)
    } else {
      alert(data.message || '评论失败')
    }
  } catch (err) {
    console.error('Create comment error:', err)
    alert('评论失败: ' + (err.message || err))
  }
}

const filteredRequests = computed(() => {
  return buddyRequests.value.filter(request => {
    const matchesCategory = activeCategory.value === 'all' || request.category === activeCategory.value
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      request.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesCategory && matchesSearch
  })
})

const joinedRequests = computed(() => {
  return buddyRequests.value.filter(r => joinedIds.value.includes(String(r.id)))
})

const isJoined = (requestId) => {
  const idStr = String(requestId)
  return joinedIds.value.includes(idStr)
}
const isFull = (request) => request.slots.filled >= request.slots.total

const handleJoin = async (requestId) => {
  const request = buddyRequests.value.find(r => r.id === requestId)
  if (!request || request.slots.filled >= request.slots.total) return

  const user = await getCurrentUser()
  if (!user) {
    alert('请先登录')
    return
  }

  // optimistic update (store as string for stable comparisons)
  joinedIds.value.push(String(requestId))
  const index = buddyRequests.value.findIndex(r => r.id === requestId)
  if (index !== -1) {
    buddyRequests.value[index] = {
      ...buddyRequests.value[index],
      slots: { ...buddyRequests.value[index].slots, filled: (buddyRequests.value[index].slots.filled || 0) + 1 },
      members: [...(buddyRequests.value[index].members || []), { name: '我', avatar: '😊', isHost: false }]
    }
  }

  // try to persist membership (best-effort; table may not exist)
  try {
    if (!user) throw new Error('未登录')
    try {
      const { data: memberInsert, error: memberInsertErr } = await supabase.from('buddy_request_members').insert([{ request_id: requestId, user_id: user.id }]).select('*')
      if (memberInsertErr) {
        console.warn('persist membership failed', memberInsertErr)
        try { alert('无法保存加入状态到服务器：' + (memberInsertErr.message || JSON.stringify(memberInsertErr))) } catch (e) {}
      } else {
        // Update slots_filled in database
        const { error: updateError } = await supabase
          .from('buddy_requests')
          .update({ slots_filled: request.slots.filled + 1 })
          .eq('id', requestId)
        if (updateError) {
          console.warn('update slots_filled failed', updateError)
        }
        // refresh persisted memberships to ensure durability across reloads
        await loadMyMemberships().catch(err => console.warn('reload memberships failed', err))
        
        // Create room chat message to make the room appear in message center
        try {
          const { error: msgError } = await supabase.from('room_messages').insert([{
            room_id: requestId,
            sender_id: user.id,
            content: `${user.email || '用户'} 加入了房间`
          }])
          if (msgError) {
            console.warn('create join message failed', msgError)
          } else {
            // Refresh chat conversations so the room appears in message center
            try { await chat.loadConversations() } catch (e) { console.warn('refresh chat conversations failed', e) }
          }
        } catch (msgErr) {
          console.warn('create room message exception', msgErr)
        }
      }
    } catch (e) {
      // ignore if membership table doesn't exist
      console.warn('persist membership failed', e)
      try { alert('无法保存加入状态到服务器：' + (e.message || String(e))) } catch (er) {}
    }
        // persist optimistic join locally as fallback
    try { if (typeof window !== 'undefined') localStorage.setItem(JOINED_IDS_KEY, JSON.stringify(joinedIds.value.map(String))) } catch (e) { console.warn('persist joinedIds to localStorage failed', e) }
  } catch (e) {
    // rollback on auth failure
    joinedIds.value = joinedIds.value.filter(id => id !== requestId)
    if (index !== -1) {
      buddyRequests.value[index].slots.filled = Math.max(0, (buddyRequests.value[index].slots.filled || 1) - 1)
      buddyRequests.value[index].members = (buddyRequests.value[index].members || []).filter(m => m.name !== '我')
    }
    alert('加入失败: ' + (e.message || e))
  }
}

const handleLeave = async (requestId) => {
  const request = buddyRequests.value.find(r => r.id === requestId)
  const index = buddyRequests.value.findIndex(r => r.id === requestId)
  if (index !== -1) {
    buddyRequests.value[index] = {
      ...buddyRequests.value[index],
      slots: { ...buddyRequests.value[index].slots, filled: Math.max(0, (buddyRequests.value[index].slots.filled || 1) - 1) },
      members: (buddyRequests.value[index].members || []).filter(m => m.name !== '我')
    }
  }
  joinedIds.value = joinedIds.value.filter(id => id !== String(requestId))
  showDetailModal.value = false
  // persist to localStorage fallback
  try { if (typeof window !== 'undefined') localStorage.setItem(JOINED_IDS_KEY, JSON.stringify(joinedIds.value.map(String))) } catch (e) { console.warn('persist joinedIds to localStorage failed', e) }
  // try backend cleanup
  try {
    const user = await getCurrentUser()
    if (user) {
      // determine if current user is the creator/host prior to deletion
      const isCreator = request && String(request.creator_id) === String(user.id)

      // delete membership record for current user
      await supabase.from('buddy_request_members').delete().match({ request_id: requestId, user_id: user.id })

      // Update slots_filled in database
      if (request) {
        const { error: updateError } = await supabase
          .from('buddy_requests')
          .update({ slots_filled: Math.max(0, request.slots.filled - 1) })
          .eq('id', requestId)
        if (updateError) {
          console.warn('update slots_filled failed', updateError)
        }
      }

      // If the leaving user was the creator/host, promote the earliest joined member (by created_at) to be the new creator
      if (isCreator) {
        try {
          const { data: nextMemberData, error: nextMemberErr } = await supabase
            .from('buddy_request_members')
            .select('user_id, profiles(username, avatar_url)')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

          if (nextMemberErr) {
            // no next member or permission issue; just log
            console.warn('find next member failed or none found', nextMemberErr)
          } else if (nextMemberData && nextMemberData.user_id) {
            const newCreatorId = nextMemberData.user_id
            const newCreatorProfile = nextMemberData.profiles
            
            // update buddy_requests.creator_id to newCreatorId
            const { error: updateCreatorErr } = await supabase
              .from('buddy_requests')
              .update({ creator_id: newCreatorId })
              .eq('id', requestId)

            if (updateCreatorErr) {
              console.warn('failed to update buddy_requests creator_id', updateCreatorErr)
            } else {
              // update buddy_request_members.is_host for new creator
              const { error: updateHostErr } = await supabase
                .from('buddy_request_members')
                .update({ is_host: true })
                .eq('request_id', requestId)
                .eq('user_id', newCreatorId)
              
              if (updateHostErr) {
                console.warn('failed to update is_host for new creator', updateHostErr)
              }
              // update local store so UI reflects new host immediately
              const idx2 = buddyRequests.value.findIndex(r => String(r.id) === String(requestId))
              if (idx2 !== -1) {
                buddyRequests.value[idx2].creator_id = newCreatorId
                // mark members: set isHost flag for new creator and clear for others
                buddyRequests.value[idx2].members = (buddyRequests.value[idx2].members || []).map(m => ({
                  ...m,
                  isHost: String(m.user_id) === String(newCreatorId)
                }))
                // if detail modal is open for this request, refresh selectedRequest to reflect change
                if (selectedRequest.value && String(selectedRequest.value.id) === String(requestId)) {
                  selectedRequest.value = { ...buddyRequests.value[idx2] }
                }
                // update displayed creator user info (name/avatar) if possible
                if (newCreatorProfile) {
                  buddyRequests.value[idx2].user = { 
                    name: newCreatorProfile.username || '未知用户', 
                    avatar: newCreatorProfile.avatar_url || defaultAvatar, 
                    time: formatTimeAgo(new Date(buddyRequests.value[idx2].created_at)) 
                  }
                  if (selectedRequest.value && String(selectedRequest.value.id) === String(requestId)) {
                    selectedRequest.value.user = { ...buddyRequests.value[idx2].user }
                  }
                }
                // refresh chat conversations so sidebar metadata (room owner/avatar) updates
                try { await chat.loadConversations() } catch (e) { console.warn('refresh chat after promotion failed', e) }
                
                // Send system message to room about host change
                try {
                  await supabase.from('room_messages').insert([{
                    room_id: requestId,
                    sender_id: user.id,
                    content: `房主已退出，${newCreatorProfile?.username || '新成员'} 成为新房主`
                  }])
                } catch (msgErr) {
                  console.warn('failed to send host change message', msgErr)
                }
              }
            }
          }
        } catch (e) {
          console.warn('promote next member failed', e)
        }
      } else {
        // If not creator, just send a leave message
        try {
          await supabase.from('room_messages').insert([{
            room_id: requestId,
            sender_id: user.id,
            content: `${user.email || '用户'} 退出了房间`
          }])
        } catch (msgErr) {
          console.warn('failed to send leave message', msgErr)
        }
      }
    }
  } catch (e) {
    console.warn('leave backend cleanup failed', e)
  }
}

const toggleJoin = async (requestId) => {
  if (isJoined(requestId)) {
    await handleLeave(requestId)
  } else {
    await handleJoin(requestId)
  }
}

const handleViewDetail = async (request) => {
  const latestRequest = buddyRequests.value.find(r => r.id === request.id)
  selectedRequest.value = latestRequest || request
  // ensure we have current user id for creator checks
  const me = await getCurrentUser()
  modalUserId.value = me?.id || null
  // if we have loaded events, attach a readable event name for display
  try {
    if (selectedRequest.value && selectedRequest.value.related_event_id && events.value && events.value.length) {
      const ev = events.value.find(e => String(e.id) === String(selectedRequest.value.related_event_id))
      if (ev) selectedRequest.value.related_event_name = ev.title || ev.name || ''
    }
  } catch (e) { console.warn('attach related event name failed', e) }
  showDetailModal.value = true
}

// Publish modal state and logic
const showPublishModal = ref(false)
const isPublishing = ref(false)
const editingRequestId = ref(null)
const newReqTitle = ref('')
const newReqDescription = ref('')
const newReqMaxMembers = ref(4)

const publishSuccess = ref('')

const handleCreateRequest = async () => {
  if (!newReqTitle.value && !newReqDescription.value) {
    alert('请输入标题或描述')
    return
  }

  if (newReqMaxMembers.value < 1) {
    alert('人数上限不能小于 1')
    return
  }

  // require login
  const user = await getCurrentUser()
  if (!user) {
    if (confirm('需要登录后才能发布，是否前往登录？')) {
      try { emit('navigate', 'login') } catch (e) {}
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return
  }

  console.log('handleCreateRequest invoked', { title: newReqTitle.value, description: newReqDescription.value, tags: newReqSelectedTags.value, max: newReqMaxMembers.value })
  isPublishing.value = true
  try {
    // attempt DB insert and request returned row
    const tagsArr = newReqSelectedTags.value.length > 0 ? newReqSelectedTags.value : (newReqTagsInput.value || '').split(',').map(t => t.trim()).filter(Boolean)
    // optimistic UI: show a temp request immediately so user sees feedback
    const tempId = `temp-${Date.now()}`
    const tempReq = {
      id: tempId,
      title: newReqTitle.value,
      description: newReqDescription.value,
      tags: tagsArr,
      slots: { filled: 1, total: newReqMaxMembers.value },
      members: [{ name: '我', avatar: '👤', isHost: true }],
      created_at: new Date().toISOString(),
      user: { name: user?.email || '我', avatar: user?.avatar_url || null }
    }
    buddyRequests.value.unshift(tempReq)
    // close modal immediately for UX
    showPublishModal.value = false

    // include creator_id and use DB column slots_total (not max_members)
    console.log('inserting buddy_request to DB', { creator_id: user.id, slots_total: newReqMaxMembers.value })
    const { data, error } = await supabase.from('buddy_requests').insert([{
      title: newReqTitle.value,
      description: newReqDescription.value,
      tags: tagsArr,
      related_event_id: selectedEventId.value || null,
      slots_total: newReqMaxMembers.value,
      slots_filled: 1,
      creator_id: user.id,
      category: 'other'
    }]).select().single()

    console.log('buddy_requests insert result', { data, error })

    if (error) {
      console.warn('Insert buddy_requests failed, removing temp and showing error:', error)
      // remove temporary item we added
      buddyRequests.value = buddyRequests.value.filter(r => r.id !== tempId)
      alert('发布失败: ' + (error.message || JSON.stringify(error)))
    } else {
      // success: reload from DB to get authoritative data
      await loadBuddyRequests()
      publishSuccess.value = '发布成功'
      // open the newly created request and create room chat
      const newId = data?.id || null
      if (newId) {
        const found = buddyRequests.value.find(r => r.id === newId)
        if (found) {
          selectedRequest.value = found
          showDetailModal.value = true
          // create room chat for this buddy request
          await createRoomChat(found, user)
        }
      } else if (buddyRequests.value.length > 0) {
        selectedRequest.value = buddyRequests.value[0]
        showDetailModal.value = true
      }
    }

    // reset and close
    newReqTitle.value = ''
    newReqDescription.value = ''
    newReqSelectedTags.value = []
    newReqTagsInput.value = ''
    newReqMaxMembers.value = 4
    showPublishModal.value = false
  } catch (err) {
    console.error('Create request error:', err)
    alert('发布失败: ' + (err.message || err))
  } finally {
    isPublishing.value = false
    // clear temporary success after short delay
    setTimeout(() => { publishSuccess.value = '' }, 2000)
  }
}

const handleEditRequest = () => {
  if (!selectedRequest.value) return
  // pre-fill edit form with current request data
  newReqTitle.value = selectedRequest.value.title || ''
  newReqDescription.value = selectedRequest.value.description || ''
  newReqSelectedTags.value = selectedRequest.value.tags || []
  newReqMaxMembers.value = selectedRequest.value.slots_total || selectedRequest.value.slots?.total || 4
  selectedEventId.value = selectedRequest.value.related_event_id || null
  editingRequestId.value = selectedRequest.value.id
  showDetailModal.value = false
  showPublishModal.value = true
}

const handleUpdateRequest = async () => {
  if (!editingRequestId.value) return
  if (!newReqTitle.value && !newReqDescription.value) {
    alert('请输入标题或描述')
    return
  }

  if (newReqMaxMembers.value < 1) {
    alert('人数上限不能小于 1')
    return
  }

  const user = await getCurrentUser()
  if (!user) return

  isPublishing.value = true
  try {
    const tagsArr = newReqSelectedTags.value.length > 0 ? newReqSelectedTags.value : (newReqTagsInput.value || '').split(',').map(t => t.trim()).filter(Boolean)
    
    const { data, error } = await supabase.from('buddy_requests').update({
      title: newReqTitle.value,
      description: newReqDescription.value,
      tags: tagsArr,
      related_event_id: selectedEventId.value || null,
      slots_total: newReqMaxMembers.value
    }).eq('id', editingRequestId.value).select().single()

    if (error) {
      alert('更新失败: ' + (error.message || JSON.stringify(error)))
    } else {
      await loadBuddyRequests()
      publishSuccess.value = '更新成功'
      const updated = buddyRequests.value.find(r => r.id === editingRequestId.value)
      if (updated) {
        selectedRequest.value = updated
        showDetailModal.value = true
      }
      editingRequestId.value = null
      showPublishModal.value = false
      // reset form
      newReqTitle.value = ''
      newReqDescription.value = ''
      newReqSelectedTags.value = []
      newReqTagsInput.value = ''
      newReqMaxMembers.value = 4
      selectedEventId.value = null
    }
  } catch (err) {
    console.error('Update request error:', err)
    alert('更新失败: ' + (err.message || err))
  } finally {
    isPublishing.value = false
    setTimeout(() => { publishSuccess.value = '' }, 2000)
  }
}

const createRoomChat = async (request, user) => {
  try {
    // create an initial room message so conversation appears in chat sidebar
    const { data: rmData, error: rmErr } = await supabase.from('room_messages').insert([{
      room_id: request.id,
      sender_id: user.id,
      content: '房间已创建'
    }]).select('*').single()
    if (rmErr) {
      console.warn('initial room_message insert failed', rmErr)
      try { alert('无法为房间创建聊天，聊天可能不会出现在侧栏：' + (rmErr.message || JSON.stringify(rmErr))) } catch (e) {}
    } else {
      // refresh chat conversations so the newly created room appears
      try { await chat.loadConversations() } catch (e) { console.warn('chat.loadConversations failed', e) }
    }
  } catch (e) {
    console.warn('create initial room_message failed', e)
    try { alert('创建房间聊天失败：' + (e.message || String(e))) } catch (er) {}
  }
  // ensure the creator is added as a member of the buddy_request (so they appear in members list)
  try {
    const { data: memberData, error: memberErr } = await supabase.from('buddy_request_members').insert([{
      request_id: request.id,
      user_id: user.id,
      is_host: true,
      created_at: new Date().toISOString()
    }]).select('*')
    if (memberErr) {
      console.warn('insert buddy_request_members failed', memberErr)
    } else {
      // update local buddyRequests to ensure UI shows creator as member immediately
      const idx = buddyRequests.value.findIndex(r => String(r.id) === String(request.id))
      if (idx !== -1) {
        const existing = buddyRequests.value[idx]
        existing.members = existing.members || []
        if (!existing.members.find(m => String(m.user_id) === String(user.id))) {
          existing.members.unshift({ user_id: user.id, name: user.username || user.email || '房主', avatar: user.avatar_url || defaultAvatar, isHost: true })
        }
        existing.slots = existing.slots || { filled: 1, total: existing.slots_total || existing.max_slots || 4 }
        existing.slots.filled = Math.max(existing.slots.filled || 0, 1)
      }
    }
  } catch (err) {
    console.warn('create buddy_request_members failed', err)
  }
}
// UI helpers
const toggleTag = (tag) => {
  if (!Array.isArray(newReqSelectedTags.value)) {
    newReqSelectedTags.value = []
  }
  const idx = newReqSelectedTags.value.indexOf(tag)
  if (idx !== -1) {
    newReqSelectedTags.value = newReqSelectedTags.value.filter(t => t !== tag)
  } else {
    newReqSelectedTags.value = [...newReqSelectedTags.value, tag]
  }
}

const addCustomTags = () => {
  if (!newReqTagsInput.value.trim()) return
  const customTags = newReqTagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
  customTags.forEach(tag => {
    if (!newReqSelectedTags.value.includes(tag)) {
      newReqSelectedTags.value.push(tag)
    }
  })
  newReqTagsInput.value = ''
}

const handleLike = (postId) => {
  const p = plazaPosts.value.find(x => x.id === postId)
  if (p) p.likes = (p.likes || 0) + 1
}

// modal helpers
const modalUserId = ref(null)
const modalMembers = computed(() => {
  const req = selectedRequest.value || {}
  if (req.members && req.members.length) return req.members
  // fallback: include creator and current user if joined
  const list = []
  // ensure creator present
  if (req.creator_id) list.push({ name: req.user?.name || '发起者', avatar: req.user?.avatar || defaultAvatar, user_id: req.creator_id, isHost: true, isOfficial: req.isOfficial })
  // include other members if present in req (e.g., req.members)
  if (req.members && Array.isArray(req.members)) {
    req.members.forEach(m => {
      if (!list.find(x => x.user_id === m.user_id)) {
        list.push({ name: m.name || '成员', avatar: m.avatar || defaultAvatar, user_id: m.user_id })
      }
    })
  }
  // include current user '我' if they joined
  if (req.id && joinedIds.value.includes(String(req.id)) && !list.find(x => x.user_id === modalUserId.value)) {
    list.push({ name: '我', avatar: defaultAvatar, user_id: modalUserId.value })
  }
  return list
})

const modalMemberCount = computed(() => {
  const req = selectedRequest.value || {}
  // prefer explicit members length, else use slots filled, but at least 1 for owner
  const membersLen = (req.members && req.members.length) || modalMembers.value.length
  const filled = (req.slots && req.slots.filled) || req.current_slots || membersLen
  return Math.max(1, filled)
})

const deleteRoom = async () => {
  if (!selectedRequest.value) return
  if (!confirm('确定要删除此房间吗？此操作不可撤销。')) return

  const requestId = selectedRequest.value.id
  console.log('Attempting to delete room:', requestId)

  try {
    // Delete from the same table where data is loaded (buddy_requests)
    const { error } = await supabase
      .from('buddy_requests')
      .delete()
      .eq('id', requestId)

    if (error) {
      console.error('Delete error:', error)
      throw error
    }

    console.log('Delete successful for room:', requestId)

    // Remove from local list immediately
    buddyRequests.value = buddyRequests.value.filter(r => r.id !== requestId)
    showDetailModal.value = false

    // Show success message
    showToast('房间已删除', 'success')

  } catch (e) {
    console.error('deleteRoom failed:', e)
    showToast('删除失败: ' + (e.message || e), 'error')
  }
}

const showUserProfile = (member) => {
  if (member.user_id) {
    selectedUserProfile.value = {
      id: member.user_id,
      username: member.name,
      avatar_url: member.avatar
    }
    showUserProfileModal.value = true
  }
}

</script>
