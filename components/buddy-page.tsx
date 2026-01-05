"use client"

import type React from "react"

import { useState } from "react"
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
  Crown,
  UserMinus,
  Trash2,
  ArrowRightLeft,
} from "lucide-react"

interface BuddyPageProps {
  onBack: () => void
}

interface Member {
  name: string
  avatar: string
  isHost: boolean
}

interface BuddyRequest {
  id: number
  user: { name: string; avatar: string; time: string }
  title: string
  description: string
  linkedEvent: { name: string; date: string } | null
  tags: string[]
  slots: { filled: number; total: number }
  category: string
  members: Member[]
}

const categories = [
  { id: "all", label: "全部" },
  { id: "event", label: "活动搭子" },
  { id: "study", label: "学习" },
  { id: "sports", label: "运动" },
  { id: "dining", label: "约饭" },
]

const initialBuddyRequests: BuddyRequest[] = [
  {
    id: 1,
    user: { name: "小雨", avatar: "🌸", time: "10分钟前" },
    title: "求一个女生搭子一起跑彩色跑",
    description: "12月28日的校园彩色跑，想找一个女生小伙伴一起参加！可以一起拍照打卡，跑完去吃好吃的~",
    linkedEvent: { name: "校园彩色跑", date: "12月28日" },
    tags: ["限女生", "AA制", "周末"],
    slots: { filled: 1, total: 2 },
    category: "event",
    members: [{ name: "小雨", avatar: "🌸", isHost: true }],
  },
  {
    id: 2,
    user: { name: "阿杰", avatar: "🎸", time: "30分钟前" },
    title: "音乐节求拼车！从南门出发",
    description: "草莓音乐节拼车，从学校南门出发，大概1个半小时车程。可以分摊油费和过路费，回程时间灵活~",
    linkedEvent: { name: "草莓音乐节", date: "1月15日" },
    tags: ["拼车", "男女不限"],
    slots: { filled: 2, total: 4 },
    category: "event",
    members: [
      { name: "阿杰", avatar: "🎸", isHost: true },
      { name: "小明", avatar: "🎧", isHost: false },
    ],
  },
  {
    id: 3,
    user: { name: "学霸君", avatar: "📚", time: "1小时前" },
    title: "期末复习找小伙伴一起图书馆",
    description: "期末复习季，找几个小伙伴一起在图书馆自习，互相监督，一起加油！主要复习高数和线代。",
    linkedEvent: null,
    tags: ["图书馆", "安静学习", "长期"],
    slots: { filled: 0, total: 3 },
    category: "study",
    members: [{ name: "学霸君", avatar: "📚", isHost: true }],
  },
  {
    id: 4,
    user: { name: "运动达人", avatar: "🏀", time: "2小时前" },
    title: "每周三晚篮球约起来！",
    description: "每周三晚上7点在东区篮球场打球，欢迎各种水平的同学加入！主要是娱乐为主，不卷~",
    linkedEvent: null,
    tags: ["篮球", "每周固定", "男生优先"],
    slots: { filled: 3, total: 5 },
    category: "sports",
    members: [
      { name: "运动达人", avatar: "🏀", isHost: true },
      { name: "小李", avatar: "⚽", isHost: false },
      { name: "大伟", avatar: "🏃", isHost: false },
    ],
  },
  {
    id: 5,
    user: { name: "吃货小分队", avatar: "🍜", time: "3小时前" },
    title: "周末探店！新开的川菜馆",
    description: "听说学校旁边新开了一家川菜馆，评价不错！想找几个人一起去尝尝，AA制，预计人均50左右。",
    linkedEvent: null,
    tags: ["探店", "AA制", "周末"],
    slots: { filled: 2, total: 4 },
    category: "dining",
    members: [
      { name: "吃货小分队", avatar: "🍜", isHost: true },
      { name: "美食家", avatar: "🍕", isHost: false },
    ],
  },
  {
    id: 6,
    user: { name: "文艺青年", avatar: "🎭", time: "5小时前" },
    title: "话剧社演出求陪看",
    description: "话剧社年度大戏《暗恋桃花源》12月30日晚上演出，我有两张票，想找个人一起看！",
    linkedEvent: { name: "年度话剧《暗恋桃花源》", date: "12月30日" },
    tags: ["话剧", "限1人", "有票"],
    slots: { filled: 0, total: 1 },
    category: "event",
    members: [{ name: "文艺青年", avatar: "🎭", isHost: true }],
  },
]

const trendingEvents = [
  { id: 1, name: "校园彩色跑", date: "12月28日", buddyCount: 24 },
  { id: 2, name: "跨年晚会", date: "12月31日", buddyCount: 56 },
  { id: 3, name: "草莓音乐节", date: "1月15日", buddyCount: 38 },
]

export function BuddyPage({ onBack }: BuddyPageProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [buddyRequests, setBuddyRequests] = useState(initialBuddyRequests)
  const [joinedIds, setJoinedIds] = useState<number[]>([])
  const [selectedRequest, setSelectedRequest] = useState<BuddyRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "kick" | "transfer" | "dissolve" | "leave"
    memberName?: string
  } | null>(null)

  const filteredRequests = buddyRequests.filter((request) => {
    const matchesCategory = activeCategory === "all" || request.category === activeCategory
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const isOwner = (request: BuddyRequest) => {
    const myMember = request.members.find((m) => m.name === "我")
    return myMember?.isHost === true
  }

  const handleJoin = (requestId: number) => {
    const request = buddyRequests.find((r) => r.id === requestId)
    if (!request || request.slots.filled >= request.slots.total) return

    setJoinedIds((prev) => [...prev, requestId])
    setBuddyRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              slots: { ...r.slots, filled: r.slots.filled + 1 },
              members: [...r.members, { name: "我", avatar: "😊", isHost: false }],
            }
          : r,
      ),
    )
  }

  const handleLeave = (requestId: number) => {
    const request = buddyRequests.find((r) => r.id === requestId)
    if (!request) return

    const isCurrentOwner = isOwner(request)
    const otherMembers = request.members.filter((m) => m.name !== "我")

    // 如果是房主且还有其他成员，自动转让给第一个成员
    if (isCurrentOwner && otherMembers.length > 0) {
      setBuddyRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                slots: { ...r.slots, filled: Math.max(0, r.slots.filled - 1) },
                members: otherMembers.map((m, index) => (index === 0 ? { ...m, isHost: true } : m)),
                user: { ...r.user, name: otherMembers[0].name, avatar: otherMembers[0].avatar },
              }
            : r,
        ),
      )
    } else {
      setBuddyRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                slots: { ...r.slots, filled: Math.max(0, r.slots.filled - 1) },
                members: r.members.filter((m) => m.name !== "我"),
              }
            : r,
        ),
      )
    }

    setJoinedIds((prev) => prev.filter((id) => id !== requestId))
    setShowDetailModal(false)
    setShowConfirmModal(false)
  }

  const handleKick = (requestId: number, memberName: string) => {
    setBuddyRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              slots: { ...r.slots, filled: Math.max(0, r.slots.filled - 1) },
              members: r.members.filter((m) => m.name !== memberName),
            }
          : r,
      ),
    )
    // 更新选中的请求
    setSelectedRequest((prev) =>
      prev
        ? {
            ...prev,
            slots: { ...prev.slots, filled: Math.max(0, prev.slots.filled - 1) },
            members: prev.members.filter((m) => m.name !== memberName),
          }
        : null,
    )
    setShowConfirmModal(false)
  }

  const handleTransfer = (requestId: number, newOwnerName: string) => {
    setBuddyRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              members: r.members.map((m) => ({
                ...m,
                isHost: m.name === newOwnerName,
              })),
              user: {
                ...r.user,
                name: newOwnerName,
                avatar: r.members.find((m) => m.name === newOwnerName)?.avatar || r.user.avatar,
              },
            }
          : r,
      ),
    )
    // 更新选中的请求
    setSelectedRequest((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.map((m) => ({
              ...m,
              isHost: m.name === newOwnerName,
            })),
            user: {
              ...prev.user,
              name: newOwnerName,
              avatar: prev.members.find((m) => m.name === newOwnerName)?.avatar || prev.user.avatar,
            },
          }
        : null,
    )
    setShowConfirmModal(false)
  }

  const handleDissolve = (requestId: number) => {
    setBuddyRequests((prev) => prev.filter((r) => r.id !== requestId))
    setJoinedIds((prev) => prev.filter((id) => id !== requestId))
    setShowDetailModal(false)
    setShowConfirmModal(false)
  }

  const openConfirmModal = (type: "kick" | "transfer" | "dissolve" | "leave", memberName?: string) => {
    setConfirmAction({ type, memberName })
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    if (!selectedRequest || !confirmAction) return

    switch (confirmAction.type) {
      case "kick":
        if (confirmAction.memberName) {
          handleKick(selectedRequest.id, confirmAction.memberName)
        }
        break
      case "transfer":
        if (confirmAction.memberName) {
          handleTransfer(selectedRequest.id, confirmAction.memberName)
        }
        break
      case "dissolve":
        handleDissolve(selectedRequest.id)
        break
      case "leave":
        handleLeave(selectedRequest.id)
        break
    }
  }

  const handleViewDetail = (request: BuddyRequest) => {
    // 从最新状态获取请求数据
    const latestRequest = buddyRequests.find((r) => r.id === request.id)
    setSelectedRequest(latestRequest || request)
    setShowDetailModal(true)
  }

  const isJoined = (requestId: number) => joinedIds.includes(requestId)
  const isFull = (request: BuddyRequest) => request.slots.filled >= request.slots.total

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Hero Section */}
      <section className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm mb-4 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </button>
              <h1 className="text-2xl md:text-3xl font-semibold font-serif text-foreground">找到你的校园搭子</h1>
              <p className="mt-2 text-muted-foreground">别一个人！找个伴一起学习、运动、看演出</p>
            </div>
            <button
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--emerald-600)" }}
            >
              <Plus className="w-4 h-4" />
              发布需求
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section
        className="sticky top-16 z-10 border-b"
        style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category.id ? "text-white" : "bg-secondary text-muted-foreground hover:bg-muted"
                  }`}
                  style={activeCategory === category.id ? { backgroundColor: "var(--emerald-600)" } : {}}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 md:max-w-sm md:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索「音乐节」或「图书馆」..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2"
                  style={
                    {
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      "--tw-ring-color": "var(--emerald-500)",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Partner Request Cards */}
          <div className="flex-1">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border p-5 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: isJoined(request.id) ? "var(--emerald-500)" : "var(--border)",
                  }}
                >
                  {isJoined(request.id) && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit mb-3"
                      style={{ backgroundColor: "var(--emerald-100)", color: "var(--emerald-700)" }}
                    >
                      <Check className="w-3 h-3" />
                      已加入
                    </div>
                  )}

                  {/* User Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: "var(--secondary)" }}
                    >
                      {request.user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{request.user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.user.time}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground mb-3">{request.title}</h3>

                  {/* Linked Event Badge */}
                  {request.linkedEvent && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 cursor-pointer transition-all hover:opacity-80"
                      style={{ backgroundColor: "var(--orange-100)" }}
                    >
                      <Ticket className="w-4 h-4" style={{ color: "var(--orange-700)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--orange-700)" }}>
                        关联活动: {request.linkedEvent.name}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: "var(--orange-700)" }}>
                        {request.linkedEvent.date}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: "var(--secondary)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        <span className="font-medium" style={{ color: "var(--emerald-600)" }}>
                          {request.slots.filled}
                        </span>
                        /{request.slots.total} 已加入
                      </span>
                      {/* Progress bar */}
                      <div
                        className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--secondary)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: "var(--emerald-500)",
                            width: `${(request.slots.filled / request.slots.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-secondary"
                        style={{ borderColor: "var(--emerald-600)", color: "var(--emerald-600)" }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        私聊
                      </button>
                      {isJoined(request.id) ? (
                        <button
                          onClick={() => handleViewDetail(request)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                          style={{ backgroundColor: "var(--emerald-100)", color: "var(--emerald-700)" }}
                        >
                          <Users className="w-3.5 h-3.5" />
                          查看详情
                        </button>
                      ) : isFull(request) ? (
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground bg-secondary cursor-not-allowed"
                        >
                          已满员
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(request.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: "var(--emerald-600)" }}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          加入
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">暂无匹配的搭子需求</p>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-72 shrink-0">
            {joinedIds.length > 0 && (
              <div
                className="rounded-xl border p-5 mb-6"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4" style={{ color: "var(--emerald-600)" }} />
                  我加入的 ({joinedIds.length})
                </h3>
                <div className="space-y-3">
                  {buddyRequests
                    .filter((r) => joinedIds.includes(r.id))
                    .map((request) => (
                      <div
                        key={request.id}
                        onClick={() => handleViewDetail(request)}
                        className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: "var(--emerald-50)" }}
                        >
                          {request.user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{request.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {request.slots.filled}/{request.slots.total} 人
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div
              className="rounded-xl border p-5 sticky top-36"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: "var(--amber-600)" }} />
                热门活动找搭子
              </h3>
              <div className="space-y-4">
                {trendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "var(--amber-50)" }}
                    >
                      <Ticket className="w-5 h-5" style={{ color: "var(--amber-600)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{event.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--emerald-600)" }}>
                        {event.buddyCount} 人正在找搭子
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile FAB */}
      <button
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105"
        style={{ backgroundColor: "var(--emerald-600)" }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)} />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--card)" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                {selectedRequest.user.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{selectedRequest.title}</h3>
                <p className="text-sm text-muted-foreground">
                  由 {selectedRequest.user.name} 创建 · {selectedRequest.user.time}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{selectedRequest.description}</p>

            {/* Linked Event */}
            {selectedRequest.linkedEvent && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
                style={{ backgroundColor: "var(--orange-100)" }}
              >
                <Ticket className="w-4 h-4" style={{ color: "var(--orange-700)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--orange-700)" }}>
                  关联活动: {selectedRequest.linkedEvent.name} ({selectedRequest.linkedEvent.date})
                </span>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRequest.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Members */}
            <div className="border-t pt-4 mb-4" style={{ borderColor: "var(--border)" }}>
              <h4 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                成员 ({selectedRequest.slots.filled}/{selectedRequest.slots.total})
              </h4>
              <div className="space-y-2">
                {selectedRequest.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary group">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: "var(--secondary)" }}
                    >
                      {member.avatar}
                    </div>
                    <span className="text-sm text-foreground flex-1">{member.name}</span>
                    {member.isHost && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{ backgroundColor: "var(--amber-100)", color: "var(--amber-700)" }}
                      >
                        <Crown className="w-3 h-3" />
                        房主
                      </span>
                    )}
                    {member.name === "我" && !member.isHost && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "var(--emerald-100)", color: "var(--emerald-700)" }}
                      >
                        我
                      </span>
                    )}
                    {isOwner(selectedRequest) && member.name !== "我" && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openConfirmModal("transfer", member.name)}
                          className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                          title="转让房主"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: "var(--amber-600)" }} />
                        </button>
                        <button
                          onClick={() => openConfirmModal("kick", member.name)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          title="移出房间"
                        >
                          <UserMinus className="w-3.5 h-3.5" style={{ color: "var(--destructive)" }} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
                  style={{ borderColor: "var(--emerald-600)", color: "var(--emerald-600)" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  群聊
                </button>
                {isJoined(selectedRequest.id) && (
                  <button
                    onClick={() => openConfirmModal("leave")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-red-50"
                    style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
                  >
                    <LogOut className="w-4 h-4" />
                    退出房间
                  </button>
                )}
              </div>
              {isOwner(selectedRequest) && (
                <button
                  onClick={() => openConfirmModal("dissolve")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-50"
                  style={{ backgroundColor: "var(--destructive)", color: "white" }}
                >
                  <Trash2 className="w-4 h-4" />
                  解散房间
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: "var(--card)" }}
          >
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {confirmAction.type === "kick" && "确认移出成员"}
              {confirmAction.type === "transfer" && "确认转让房主"}
              {confirmAction.type === "dissolve" && "确认解散房间"}
              {confirmAction.type === "leave" && "确认退出房间"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {confirmAction.type === "kick" && `确定要将「${confirmAction.memberName}」移出房间吗？`}
              {confirmAction.type === "transfer" &&
                `确定要将房主转让给「${confirmAction.memberName}」吗？转让后你将成为普通成员。`}
              {confirmAction.type === "dissolve" && "确定要解散房间吗？此操作不可撤销，所有成员将被移出。"}
              {confirmAction.type === "leave" &&
                (isOwner(selectedRequest!) && selectedRequest!.members.length > 1
                  ? "你是房主，退出后房主将自动转让给其他成员。确定要退出吗？"
                  : "确定要退出房间吗？")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-secondary"
                style={{ borderColor: "var(--border)" }}
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{
                  backgroundColor: confirmAction.type === "transfer" ? "var(--amber-600)" : "var(--destructive)",
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
