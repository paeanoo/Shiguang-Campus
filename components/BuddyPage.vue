<template>
  <div class="min-h-screen" :style="{ backgroundColor: 'var(--background)' }">
    <!-- Hero Section -->
    <section class="border-b" :style="{ borderColor: 'var(--border)' }">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <button
              @click="$emit('back')"
              class="flex items-center gap-2 text-sm mb-4 transition-colors"
              :style="{ color: 'var(--muted-foreground)' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              返回首页
            </button>
            <h1 class="text-2xl md:text-3xl font-semibold font-serif" :style="{ color: 'var(--foreground)' }">找到你的校园搭子</h1>
            <p class="mt-2" :style="{ color: 'var(--muted-foreground)' }">别一个人！找个伴一起学习、运动、看演出</p>
          </div>
          <button
            class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
            :style="{ backgroundColor: 'var(--emerald-600)' }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            发布需求
          </button>
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
              :class="activeCategory === category.id ? 'text-white' : 'bg-secondary hover:bg-muted'"
              :style="activeCategory === category.id ? { backgroundColor: 'var(--emerald-600)' } : { color: 'var(--muted-foreground)' }"
            >
              {{ category.label }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex-1 md:max-w-sm md:ml-auto">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
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

    <!-- Main Content -->
    <section class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <!-- Partner Request Cards -->
        <div class="flex-1">
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="request in filteredRequests"
              :key="request.id"
              class="rounded-xl border p-5 transition-all hover:shadow-md"
              :style="{
                backgroundColor: 'var(--card)',
                borderColor: isJoined(request.id) ? 'var(--emerald-500)' : 'var(--border)',
              }"
            >
              <div
                v-if="isJoined(request.id)"
                class="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit mb-3"
                :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                已加入
              </div>

              <!-- User Header -->
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  :style="{ backgroundColor: 'var(--secondary)' }"
                >
                  {{ request.user.avatar }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-sm" :style="{ color: 'var(--foreground)' }">{{ request.user.name }}</p>
                  <p class="text-xs flex items-center gap-1" :style="{ color: 'var(--muted-foreground)' }">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ request.user.time }}
                  </p>
                </div>
              </div>

              <!-- Title -->
              <h3 class="font-semibold mb-3" :style="{ color: 'var(--foreground)' }">{{ request.title }}</h3>

              <!-- Linked Event Badge -->
              <div
                v-if="request.linkedEvent"
                class="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 cursor-pointer transition-all hover:opacity-80"
                :style="{ backgroundColor: 'var(--orange-100)' }"
              >
                <svg class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
                <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
                  关联活动: {{ request.linkedEvent.name }}
                </span>
                <span class="text-xs ml-auto" :style="{ color: 'var(--orange-700)' }">
                  {{ request.linkedEvent.date }}
                </span>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="(tag, index) in request.tags"
                  :key="index"
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--muted-foreground)',
                  }"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Footer -->
              <div
                class="flex items-center justify-between pt-3 border-t"
                :style="{ borderColor: 'var(--border)' }"
              >
                <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--muted-foreground)' }">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>
                    <span class="font-medium" :style="{ color: 'var(--emerald-600)' }">
                      {{ request.slots.filled }}
                    </span>
                    /{{ request.slots.total }} 已加入
                  </span>
                  <!-- Progress bar -->
                  <div
                    class="w-16 h-1.5 rounded-full overflow-hidden"
                    :style="{ backgroundColor: 'var(--secondary)' }"
                  >
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{
                        backgroundColor: 'var(--emerald-500)',
                        width: `${(request.slots.filled / request.slots.total) * 100}%`,
                      }"
                    />
                  </div>
                </div>

                <div class="flex gap-2">
                  <button
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-secondary"
                    :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    私聊
                  </button>
                  <button
                    v-if="isJoined(request.id)"
                    @click="handleViewDetail(request)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    查看详情
                  </button>
                  <button
                    v-else-if="isFull(request)"
                    disabled
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed"
                    :style="{ backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }"
                  >
                    已满员
                  </button>
                  <button
                    v-else
                    @click="handleJoin(request.id)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    :style="{ backgroundColor: 'var(--emerald-600)' }"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    加入
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredRequests.length === 0" class="text-center py-16">
            <svg class="w-12 h-12 mx-auto mb-4" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <p :style="{ color: 'var(--muted-foreground)' }">暂无匹配的搭子需求</p>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="hidden lg:block w-72 shrink-0">
          <div
            v-if="joinedIds.length > 0"
            class="rounded-xl border p-5 mb-6"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
              <svg class="w-4 h-4" :style="{ color: 'var(--emerald-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              我加入的 ({{ joinedIds.length }})
            </h3>
            <div class="space-y-3">
              <div
                v-for="request in buddyRequests.filter((r) => joinedIds.includes(r.id))"
                :key="request.id"
                @click="handleViewDetail(request)"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  :style="{ backgroundColor: 'var(--emerald-50)' }"
                >
                  {{ request.user.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" :style="{ color: 'var(--foreground)' }">{{ request.title }}</p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--muted-foreground)' }">
                    {{ request.slots.filled }}/{{ request.slots.total }} 人
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-xl border p-5 sticky top-36"
            :style="{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }"
          >
            <h3 class="font-semibold mb-4 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
              <svg class="w-4 h-4" :style="{ color: 'var(--amber-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              热门活动找搭子
            </h3>
            <div class="space-y-4">
              <div
                v-for="event in trendingEvents"
                :key="event.id"
                class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: 'var(--amber-50)' }"
                >
                  <svg class="w-5 h-5" :style="{ color: 'var(--amber-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" :style="{ color: 'var(--foreground)' }">{{ event.name }}</p>
                  <p class="text-xs mt-0.5" :style="{ color: 'var(--muted-foreground)' }">{{ event.date }}</p>
                  <p class="text-xs mt-1" :style="{ color: 'var(--emerald-600)' }">
                    {{ event.buddyCount }} 人正在找搭子
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Mobile FAB -->
    <button
      class="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105"
      :style="{ backgroundColor: 'var(--emerald-600)' }"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedRequest" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showDetailModal = false" />
      <div
        class="relative w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        :style="{ backgroundColor: 'var(--card)' }"
      >
        <button
          @click="showDetailModal = false"
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <svg class="w-5 h-5" :style="{ color: 'var(--muted-foreground)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            :style="{ backgroundColor: 'var(--secondary)' }"
          >
            {{ selectedRequest.user.avatar }}
          </div>
          <div>
            <h3 class="font-semibold text-lg" :style="{ color: 'var(--foreground)' }">{{ selectedRequest.title }}</h3>
            <p class="text-sm" :style="{ color: 'var(--muted-foreground)' }">
              由 {{ selectedRequest.user.name }} 创建 · {{ selectedRequest.user.time }}
            </p>
          </div>
        </div>

        <p class="text-sm mb-4 leading-relaxed" :style="{ color: 'var(--muted-foreground)' }">{{ selectedRequest.description }}</p>

        <div
          v-if="selectedRequest.linkedEvent"
          class="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
          :style="{ backgroundColor: 'var(--orange-100)' }"
        >
          <svg class="w-4 h-4" :style="{ color: 'var(--orange-700)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
          </svg>
          <span class="text-sm font-medium" :style="{ color: 'var(--orange-700)' }">
            关联活动: {{ selectedRequest.linkedEvent.name }} ({{ selectedRequest.linkedEvent.date }})
          </span>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="(tag, index) in selectedRequest.tags"
            :key="index"
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :style="{
              backgroundColor: 'var(--secondary)',
              color: 'var(--muted-foreground)',
            }"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- Members -->
        <div class="border-t pt-4 mb-4" :style="{ borderColor: 'var(--border)' }">
          <h4 class="font-medium text-sm mb-3 flex items-center gap-2" :style="{ color: 'var(--foreground)' }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            成员 ({{ selectedRequest.slots.filled }}/{{ selectedRequest.slots.total }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="(member, index) in selectedRequest.members"
              :key="index"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary group"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                :style="{ backgroundColor: 'var(--secondary)' }"
              >
                {{ member.avatar }}
              </div>
              <span class="text-sm flex-1" :style="{ color: 'var(--foreground)' }">{{ member.name }}</span>
              <span
                v-if="member.isHost"
                class="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                :style="{ backgroundColor: 'var(--amber-100)', color: 'var(--amber-700)' }"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
                房主
              </span>
              <span
                v-if="member.name === '我' && !member.isHost"
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :style="{ backgroundColor: 'var(--emerald-100)', color: 'var(--emerald-700)' }"
              >
                我
              </span>
              <div v-if="isOwner(selectedRequest) && member.name !== '我'" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openConfirmModal('transfer', member.name)"
                  class="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  title="转让房主"
                >
                  <svg class="w-3.5 h-3.5" :style="{ color: 'var(--amber-600)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </button>
                <button
                  @click="openConfirmModal('kick', member.name)"
                  class="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  title="移出房间"
                >
                  <svg class="w-3.5 h-3.5" :style="{ color: 'var(--destructive)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <button
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
              :style="{ borderColor: 'var(--emerald-600)', color: 'var(--emerald-600)' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              群聊
            </button>
            <button
              v-if="isJoined(selectedRequest.id)"
              @click="openConfirmModal('leave')"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50"
              :style="{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              退出房间
            </button>
          </div>
          <button
            v-if="isOwner(selectedRequest)"
            @click="openConfirmModal('dissolve')"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-50 text-white"
            :style="{ backgroundColor: 'var(--destructive)' }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            解散房间
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal && confirmAction" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showConfirmModal = false" />
      <div
        class="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
        :style="{ backgroundColor: 'var(--card)' }"
      >
        <h3 class="font-semibold text-lg mb-2" :style="{ color: 'var(--foreground)' }">
          {{ confirmAction.type === 'kick' ? '确认移出成员' : '' }}
          {{ confirmAction.type === 'transfer' ? '确认转让房主' : '' }}
          {{ confirmAction.type === 'dissolve' ? '确认解散房间' : '' }}
          {{ confirmAction.type === 'leave' ? '确认退出房间' : '' }}
        </h3>
        <p class="text-sm mb-6" :style="{ color: 'var(--muted-foreground)' }">
          <template v-if="confirmAction.type === 'kick'">确定要将「{{ confirmAction.memberName }}」移出房间吗？</template>
          <template v-if="confirmAction.type === 'transfer'">确定要将房主转让给「{{ confirmAction.memberName }}」吗？转让后你将成为普通成员。</template>
          <template v-if="confirmAction.type === 'dissolve'">确定要解散房间吗？此操作不可撤销，所有成员将被移出。</template>
          <template v-if="confirmAction.type === 'leave'">
            {{ isOwner(selectedRequest) && selectedRequest.members.length > 1 ? '你是房主，退出后房主将自动转让给其他成员。确定要退出吗？' : '确定要退出房间吗？' }}
          </template>
        </p>
        <div class="flex gap-3">
          <button
            @click="showConfirmModal = false"
            class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
            :style="{ borderColor: 'var(--border)' }"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            :style="{
              backgroundColor: confirmAction.type === 'transfer' ? 'var(--amber-600)' : 'var(--destructive)',
            }"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['back'])

const categories = [
  { id: 'all', label: '全部' },
  { id: 'event', label: '活动搭子' },
  { id: 'study', label: '学习' },
  { id: 'sports', label: '运动' },
  { id: 'dining', label: '约饭' },
]

const initialBuddyRequests = [
  {
    id: 1,
    user: { name: '小雨', avatar: '🌸', time: '10分钟前' },
    title: '求一个女生搭子一起跑彩色跑',
    description: '12月28日的校园彩色跑，想找一个女生小伙伴一起参加！可以一起拍照打卡，跑完去吃好吃的~',
    linkedEvent: { name: '校园彩色跑', date: '12月28日' },
    tags: ['限女生', 'AA制', '周末'],
    slots: { filled: 1, total: 2 },
    category: 'event',
    members: [{ name: '小雨', avatar: '🌸', isHost: true }],
  },
  {
    id: 2,
    user: { name: '阿杰', avatar: '🎸', time: '30分钟前' },
    title: '音乐节求拼车！从南门出发',
    description: '草莓音乐节拼车，从学校南门出发，大概1个半小时车程。可以分摊油费和过路费，回程时间灵活~',
    linkedEvent: { name: '草莓音乐节', date: '1月15日' },
    tags: ['拼车', '男女不限'],
    slots: { filled: 2, total: 4 },
    category: 'event',
    members: [
      { name: '阿杰', avatar: '🎸', isHost: true },
      { name: '小明', avatar: '🎧', isHost: false },
    ],
  },
  {
    id: 3,
    user: { name: '学霸君', avatar: '📚', time: '1小时前' },
    title: '期末复习找小伙伴一起图书馆',
    description: '期末复习季，找几个小伙伴一起在图书馆自习，互相监督，一起加油！主要复习高数和线代。',
    linkedEvent: null,
    tags: ['图书馆', '安静学习', '长期'],
    slots: { filled: 0, total: 3 },
    category: 'study',
    members: [{ name: '学霸君', avatar: '📚', isHost: true }],
  },
  {
    id: 4,
    user: { name: '运动达人', avatar: '🏀', time: '2小时前' },
    title: '每周三晚篮球约起来！',
    description: '每周三晚上7点在东区篮球场打球，欢迎各种水平的同学加入！主要是娱乐为主，不卷~',
    linkedEvent: null,
    tags: ['篮球', '每周固定', '男生优先'],
    slots: { filled: 3, total: 5 },
    category: 'sports',
    members: [
      { name: '运动达人', avatar: '🏀', isHost: true },
      { name: '小李', avatar: '⚽', isHost: false },
      { name: '大伟', avatar: '🏃', isHost: false },
    ],
  },
  {
    id: 5,
    user: { name: '吃货小分队', avatar: '🍜', time: '3小时前' },
    title: '周末探店！新开的川菜馆',
    description: '听说学校旁边新开了一家川菜馆，评价不错！想找几个人一起去尝尝，AA制，预计人均50左右。',
    linkedEvent: null,
    tags: ['探店', 'AA制', '周末'],
    slots: { filled: 2, total: 4 },
    category: 'dining',
    members: [
      { name: '吃货小分队', avatar: '🍜', isHost: true },
      { name: '美食家', avatar: '🍕', isHost: false },
    ],
  },
  {
    id: 6,
    user: { name: '文艺青年', avatar: '🎭', time: '5小时前' },
    title: '话剧社演出求陪看',
    description: '话剧社年度大戏《暗恋桃花源》12月30日晚上演出，我有两张票，想找个人一起看！',
    linkedEvent: { name: '年度话剧《暗恋桃花源》', date: '12月30日' },
    tags: ['话剧', '限1人', '有票'],
    slots: { filled: 0, total: 1 },
    category: 'event',
    members: [{ name: '文艺青年', avatar: '🎭', isHost: true }],
  },
]

const trendingEvents = [
  { id: 1, name: '校园彩色跑', date: '12月28日', buddyCount: 24 },
  { id: 2, name: '跨年晚会', date: '12月31日', buddyCount: 56 },
  { id: 3, name: '草莓音乐节', date: '1月15日', buddyCount: 38 },
]

const activeCategory = ref('all')
const searchQuery = ref('')
const buddyRequests = ref([...initialBuddyRequests])
const joinedIds = ref([])
const selectedRequest = ref(null)
const showDetailModal = ref(false)
const showConfirmModal = ref(false)
const confirmAction = ref(null)

const filteredRequests = computed(() => {
  return buddyRequests.value.filter((request) => {
    const matchesCategory = activeCategory.value === 'all' || request.category === activeCategory.value
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      request.tags.some((tag) => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesCategory && matchesSearch
  })
})

const isOwner = (request) => {
  const myMember = request.members.find((m) => m.name === '我')
  return myMember?.isHost === true
}

const isJoined = (requestId) => joinedIds.value.includes(requestId)
const isFull = (request) => request.slots.filled >= request.slots.total

const handleJoin = (requestId) => {
  const request = buddyRequests.value.find((r) => r.id === requestId)
  if (!request || request.slots.filled >= request.slots.total) return

  joinedIds.value.push(requestId)
  request.slots.filled++
  request.members.push({ name: '我', avatar: '😊', isHost: false })
}

const handleLeave = (requestId) => {
  const request = buddyRequests.value.find((r) => r.id === requestId)
  if (!request) return

  const isCurrentOwner = isOwner(request)
  const otherMembers = request.members.filter((m) => m.name !== '我')

  if (isCurrentOwner && otherMembers.length > 0) {
    otherMembers[0].isHost = true
    request.user.name = otherMembers[0].name
    request.user.avatar = otherMembers[0].avatar
  }

  request.slots.filled = Math.max(0, request.slots.filled - 1)
  request.members = request.members.filter((m) => m.name !== '我')
  joinedIds.value = joinedIds.value.filter((id) => id !== requestId)
  showDetailModal.value = false
  showConfirmModal.value = false
}

const handleKick = (requestId, memberName) => {
  const request = buddyRequests.value.find((r) => r.id === requestId)
  if (!request) return

  request.slots.filled = Math.max(0, request.slots.filled - 1)
  request.members = request.members.filter((m) => m.name !== memberName)

  if (selectedRequest.value) {
    selectedRequest.value.slots.filled = Math.max(0, selectedRequest.value.slots.filled - 1)
    selectedRequest.value.members = selectedRequest.value.members.filter((m) => m.name !== memberName)
  }
  showConfirmModal.value = false
}

const handleTransfer = (requestId, newOwnerName) => {
  const request = buddyRequests.value.find((r) => r.id === requestId)
  if (!request) return

  request.members.forEach((m) => {
    m.isHost = m.name === newOwnerName
  })
  const newOwner = request.members.find((m) => m.name === newOwnerName)
  if (newOwner) {
    request.user.name = newOwnerName
    request.user.avatar = newOwner.avatar
  }

  if (selectedRequest.value) {
    selectedRequest.value.members.forEach((m) => {
      m.isHost = m.name === newOwnerName
    })
    if (newOwner) {
      selectedRequest.value.user.name = newOwnerName
      selectedRequest.value.user.avatar = newOwner.avatar
    }
  }
  showConfirmModal.value = false
}

const handleDissolve = (requestId) => {
  buddyRequests.value = buddyRequests.value.filter((r) => r.id !== requestId)
  joinedIds.value = joinedIds.value.filter((id) => id !== requestId)
  showDetailModal.value = false
  showConfirmModal.value = false
}

const openConfirmModal = (type, memberName) => {
  confirmAction.value = { type, memberName }
  showConfirmModal.value = true
}

const handleConfirm = () => {
  if (!selectedRequest.value || !confirmAction.value) return

  switch (confirmAction.value.type) {
    case 'kick':
      if (confirmAction.value.memberName) {
        handleKick(selectedRequest.value.id, confirmAction.value.memberName)
      }
      break
    case 'transfer':
      if (confirmAction.value.memberName) {
        handleTransfer(selectedRequest.value.id, confirmAction.value.memberName)
      }
      break
    case 'dissolve':
      handleDissolve(selectedRequest.value.id)
      break
    case 'leave':
      handleLeave(selectedRequest.value.id)
      break
  }
}

const handleViewDetail = (request) => {
  const latestRequest = buddyRequests.value.find((r) => r.id === request.id)
  selectedRequest.value = latestRequest || request
  showDetailModal.value = true
}
</script>
