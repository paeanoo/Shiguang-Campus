import { defineStore } from "pinia"
import { ref } from "vue"
import type { BuddyRequest, ConfirmAction } from "@/types"

export const useBuddyStore = defineStore("buddy", () => {
  const joinedIds = ref<number[]>([3])
  const selectedRequest = ref<BuddyRequest | null>(null)
  const showDetailModal = ref(false)
  const showConfirmModal = ref(false)
  const confirmAction = ref<ConfirmAction | null>(null)

  const buddyRequests = ref<BuddyRequest[]>([
    {
      id: 1,
      user: { name: "小林", avatar: "🎸", time: "10分钟前" },
      title: "草莓音乐节一起嗨！",
      description: "有没有人五一去草莓音乐节的？想找几个小伙伴一起去，可以拼车拼住宿～",
      tags: ["音乐节", "拼车", "五一"],
      slots: { filled: 2, total: 4 },
      linkedEvent: { name: "2024草莓音乐节", date: "5月1日-3日" },
      members: [
        { name: "小林", avatar: "🎸", isHost: true },
        { name: "阿杰", avatar: "🎹", isHost: false },
      ],
    },
    {
      id: 2,
      user: { name: "学霸君", avatar: "📚", time: "30分钟前" },
      title: "期末周图书馆占座互助",
      description: "期末周图书馆太难占座了！找几个研友互相帮忙占座，轮流去吃饭不怕丢座位",
      tags: ["学习", "图书馆", "期末"],
      slots: { filled: 3, total: 5 },
      members: [
        { name: "学霸君", avatar: "📚", isHost: true },
        { name: "小美", avatar: "📖", isHost: false },
        { name: "阿伟", avatar: "✏️", isHost: false },
      ],
    },
    {
      id: 3,
      user: { name: "我", avatar: "👤", time: "1小时前" },
      title: "周末羽毛球约起来",
      description: "每周六下午体育馆羽毛球，水平一般，主要是锻炼身体，欢迎萌新！",
      tags: ["运动", "羽毛球", "周末"],
      slots: { filled: 4, total: 6 },
      members: [
        { name: "我", avatar: "👤", isHost: true },
        { name: "运动达人", avatar: "🏃", isHost: false },
        { name: "小花", avatar: "🌸", isHost: false },
        { name: "阿强", avatar: "💪", isHost: false },
      ],
    },
    {
      id: 4,
      user: { name: "电影迷", avatar: "🎬", time: "2小时前" },
      title: "周末看《沙丘2》",
      description: "想去看沙丘2 IMAX版，一个人去有点无聊，有没有小伙伴一起？",
      tags: ["电影", "IMAX", "周末"],
      slots: { filled: 1, total: 3 },
      members: [{ name: "电影迷", avatar: "🎬", isHost: true }],
    },
    {
      id: 5,
      user: { name: "小吃货", avatar: "🍜", time: "3小时前" },
      title: "探店小分队招人啦",
      description: "喜欢探索校园周边美食的朋友们集合！每周一次探店活动，AA制，主打一个性价比",
      tags: ["美食", "探店", "AA制"],
      slots: { filled: 5, total: 8 },
      linkedEvent: { name: "校园美食节", date: "持续进行中" },
      members: [
        { name: "小吃货", avatar: "🍜", isHost: true },
        { name: "饭桶", avatar: "🍚", isHost: false },
        { name: "甜食控", avatar: "🍰", isHost: false },
        { name: "辣妹子", avatar: "🌶️", isHost: false },
        { name: "素食者", avatar: "🥗", isHost: false },
      ],
    },
    {
      id: 6,
      user: { name: "考研人", avatar: "✍️", time: "5小时前" },
      title: "25考研自习室组队",
      description: "25考研的朋友们，一起在自习室学习，互相监督打卡，坚持到12月！",
      tags: ["考研", "学习", "打卡"],
      slots: { filled: 6, total: 6 },
      members: [
        { name: "考研人", avatar: "✍️", isHost: true },
        { name: "数学选手", avatar: "🔢", isHost: false },
        { name: "英语达人", avatar: "🔤", isHost: false },
        { name: "政治课代表", avatar: "📜", isHost: false },
        { name: "专业课大神", avatar: "📊", isHost: false },
        { name: "上岸选手", avatar: "🎯", isHost: false },
      ],
    },
  ])

  const categories = [
    { id: "all", label: "全部" },
    { id: "study", label: "学习" },
    { id: "sports", label: "运动" },
    { id: "entertainment", label: "娱乐" },
    { id: "food", label: "美食" },
    { id: "events", label: "活动" },
  ]

  const trendingEvents = [
    { id: 1, name: "草莓音乐节", date: "5月1日-3日", buddyCount: 128 },
    { id: 2, name: "校园马拉松", date: "4月28日", buddyCount: 56 },
    { id: 3, name: "动漫展", date: "5月10日", buddyCount: 89 },
  ]

  function isJoined(id: number) {
    return joinedIds.value.includes(id)
  }

  function isFull(request: BuddyRequest) {
    return request.slots.filled >= request.slots.total
  }

  function isOwner(request: BuddyRequest | null) {
    if (!request) return false
    const me = request.members.find((m) => m.name === "我")
    return me?.isHost || false
  }

  function handleJoin(id: number) {
    const request = buddyRequests.value.find((r) => r.id === id)
    if (request && !isFull(request)) {
      joinedIds.value.push(id)
      request.slots.filled++
      request.members.push({ name: "我", avatar: "👤", isHost: false })
    }
  }

  function handleViewDetail(request: BuddyRequest) {
    selectedRequest.value = request
    showDetailModal.value = true
  }

  function openConfirmModal(type: ConfirmAction["type"], memberName?: string) {
    confirmAction.value = { type, memberName }
    showConfirmModal.value = true
  }

  function handleConfirm() {
    if (!confirmAction.value || !selectedRequest.value) return

    const request = selectedRequest.value
    const action = confirmAction.value

    switch (action.type) {
      case "kick":
        if (action.memberName) {
          const memberIndex = request.members.findIndex((m) => m.name === action.memberName)
          if (memberIndex !== -1) {
            request.members.splice(memberIndex, 1)
            request.slots.filled--
          }
        }
        break

      case "transfer":
        if (action.memberName) {
          const currentHost = request.members.find((m) => m.isHost)
          const newHost = request.members.find((m) => m.name === action.memberName)
          if (currentHost && newHost) {
            currentHost.isHost = false
            newHost.isHost = true
          }
        }
        break

      case "dissolve":
        const index = buddyRequests.value.findIndex((r) => r.id === request.id)
        if (index !== -1) {
          buddyRequests.value.splice(index, 1)
          joinedIds.value = joinedIds.value.filter((id) => id !== request.id)
        }
        showDetailModal.value = false
        break

      case "leave":
        const meIndex = request.members.findIndex((m) => m.name === "我")
        if (meIndex !== -1) {
          const wasHost = request.members[meIndex].isHost
          request.members.splice(meIndex, 1)
          request.slots.filled--
          joinedIds.value = joinedIds.value.filter((id) => id !== request.id)

          if (wasHost && request.members.length > 0) {
            request.members[0].isHost = true
          }
        }
        showDetailModal.value = false
        break
    }

    showConfirmModal.value = false
    confirmAction.value = null
  }

  return {
    joinedIds,
    selectedRequest,
    showDetailModal,
    showConfirmModal,
    confirmAction,
    buddyRequests,
    categories,
    trendingEvents,
    isJoined,
    isFull,
    isOwner,
    handleJoin,
    handleViewDetail,
    openConfirmModal,
    handleConfirm,
  }
})
