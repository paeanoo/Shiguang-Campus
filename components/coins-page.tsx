"use client"

import { useState } from "react"
import {
  Leaf,
  Coins,
  Gift,
  CheckCircle,
  Upload,
  Zap,
  Share2,
  ShoppingBag,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

interface CoinsPageProps {
  onBack: () => void
}

const tasks = [
  {
    id: 1,
    icon: Zap,
    iconBg: "var(--amber-50)",
    iconColor: "var(--amber-500)",
    title: "每日签到",
    subtitle: "连续签到7天额外奖励",
    reward: 10,
    progress: 5,
    maxProgress: 7,
    status: "progress",
  },
  {
    id: 2,
    icon: Upload,
    iconBg: "var(--blue-50)",
    iconColor: "var(--blue-500)",
    title: "发布闲置物品",
    subtitle: "上传一件二手物品",
    reward: 50,
    status: "available",
  },
  {
    id: 3,
    icon: ShoppingBag,
    iconBg: "var(--emerald-50)",
    iconColor: "var(--emerald-500)",
    title: "完成一笔交易",
    subtitle: "成功买卖一件物品",
    reward: 100,
    status: "available",
  },
  {
    id: 4,
    icon: Share2,
    iconBg: "var(--purple-50)",
    iconColor: "var(--purple-500)",
    title: "分享给好友",
    subtitle: "邀请好友加入拾光志",
    reward: 30,
    status: "done",
  },
]

const gifts = [
  { id: 1, image: "/coffee-coupon-voucher.jpg", title: "校园咖啡券", price: 200 },
  { id: 2, image: "/item-boost-card-golden.jpg", title: "物品曝光卡", price: 150 },
  { id: 3, image: "/notebook-stationery.jpg", title: "精美笔记本", price: 300 },
  { id: 4, image: "/plant-succulent-pot.jpg", title: "多肉植物盆栽", price: 250 },
]

const topUsers = [
  { id: 1, name: "小明", avatar: "/student-avatar-boy.jpg", carbon: 28.5, rank: 1 },
  { id: 2, name: "小红", avatar: "/student-avatar-girl.jpg", carbon: 24.2, rank: 2 },
  { id: 3, name: "阿杰", avatar: "/male-student-avatar.png", carbon: 19.8, rank: 3 },
]

export function CoinsPage({ onBack }: CoinsPageProps) {
  const [activeTab, setActiveTab] = useState<"earn" | "redeem">("earn")
  const [balance] = useState(1280)
  const [carbonReduced] = useState(5.2)

  return (
    <section className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-sm mb-4 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2 font-serif" style={{ color: "var(--emerald-600)" }}>
              光币中心
            </h1>
            <p className="text-sm text-muted-foreground">赚取光币，兑换好礼，记录减碳足迹</p>
          </div>
          <button className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--emerald-600)" }}>
            兑换记录
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Balance Card & Leaderboard */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div
            className="rounded-xl p-6 relative overflow-hidden"
            style={{ backgroundColor: "var(--emerald-50)", border: "1px solid var(--border)" }}
          >
            <button
              className="absolute top-4 right-4 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: "var(--emerald-500)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              每日签到
            </button>

            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-7 h-7" style={{ color: "var(--amber-500)" }} />
                <span className="text-4xl font-bold text-foreground">{balance.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">光币余额</p>
            </div>

            <div className="flex items-center gap-1.5 mt-4" style={{ color: "var(--emerald-600)" }}>
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">累计减碳: {carbonReduced}kg</span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: "var(--amber-500)" }} />
                <h3 className="font-semibold text-foreground">减碳排行榜</h3>
              </div>
              <button className="text-sm font-medium flex items-center gap-0.5" style={{ color: "var(--emerald-600)" }}>
                全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {topUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2`}
                    style={{
                      borderColor:
                        user.rank === 1 ? "var(--amber-400)" : user.rank === 2 ? "#9ca3af" : "var(--amber-700)",
                    }}
                  >
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor:
                          user.rank === 1 ? "var(--amber-400)" : user.rank === 2 ? "#9ca3af" : "var(--amber-700)",
                      }}
                    >
                      {user.rank}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    <div className="text-xs" style={{ color: "var(--emerald-600)" }}>
                      {user.carbon}kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs & Content */}
        <div className="col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("earn")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "earn" ? "text-white" : "text-muted-foreground"
              }`}
              style={
                activeTab === "earn" ? { backgroundColor: "var(--emerald-500)" } : { backgroundColor: "var(--muted)" }
              }
            >
              <Zap className="w-4 h-4" />
              赚取光币
            </button>
            <button
              onClick={() => setActiveTab("redeem")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "redeem" ? "text-white" : "text-muted-foreground"
              }`}
              style={
                activeTab === "redeem" ? { backgroundColor: "var(--emerald-500)" } : { backgroundColor: "var(--muted)" }
              }
            >
              <Gift className="w-4 h-4" />
              兑换好礼
            </button>
          </div>

          {/* Content */}
          {activeTab === "earn" ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: task.iconBg }}
                  >
                    <task.icon className="w-6 h-6" style={{ color: task.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.subtitle}</p>
                    {task.status === "progress" && task.progress !== undefined && task.maxProgress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>进度</span>
                          <span>
                            {task.progress}/{task.maxProgress}天
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(task.progress / task.maxProgress) * 100}%`,
                              backgroundColor: "var(--emerald-500)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {task.status === "done" ? (
                      <div
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: "var(--emerald-600)" }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        已完成
                      </div>
                    ) : task.status === "progress" ? (
                      <div className="text-sm font-medium" style={{ color: "var(--amber-500)" }}>
                        +{task.reward}
                      </div>
                    ) : (
                      <button
                        className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                        style={{
                          border: "1px solid var(--emerald-500)",
                          color: "var(--emerald-600)",
                          backgroundColor: "transparent",
                        }}
                      >
                        +{task.reward}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="aspect-square rounded-lg mb-3 overflow-hidden"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <img
                      src={gift.image || "/placeholder.svg"}
                      alt={gift.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-foreground font-medium text-sm mb-2 truncate">{gift.title}</h3>
                  <div
                    className="flex items-center gap-1 text-sm font-semibold mb-3"
                    style={{ color: "var(--amber-500)" }}
                  >
                    <Coins className="w-4 h-4" />
                    {gift.price}
                  </div>
                  <button
                    className="w-full text-white text-sm font-medium py-2 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--emerald-500)" }}
                  >
                    立即兑换
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
