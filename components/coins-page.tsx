"use client"

import { useState, useEffect } from "react"
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
  User,
  Calendar,
  Check,
  X,
  Printer,
  Download,
} from "lucide-react"
import { supabase } from "../lib/supabase"

interface CoinsPageProps {
  onBack: () => void
  onNavigate?: (page: string, params?: any) => void
  user?: any
}

interface Task {
  id: string
  title: string
  description: string
  reward_coins: number
  reward_carbon: number
  task_type: string
  requirements: any
  user_task?: {
    status: string
    progress: number
  }
}

interface Gift {
  id: string
  title: string
  description: string
  image_url: string
  price: number
  stock: number
  category: string
  redemption_instructions: string
}

interface RedemptionRecord {
  id: string
  gift_title: string
  redemption_code: string
  redeemed_at: string
  created_at: string
}

export function CoinsPage({ onBack, onNavigate, user }: CoinsPageProps) {
  const [activeTab, setActiveTab] = useState<"earn" | "redeem" | "records">("earn")
  const [balance, setBalance] = useState(0)
  const [carbonReduced, setCarbonReduced] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [gifts, setGifts] = useState<Gift[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [redemptionRecords, setRedemptionRecords] = useState<RedemptionRecord[]>([])
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkInStreak, setCheckInStreak] = useState(0)
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [currentRedemption, setCurrentRedemption] = useState<any>(null)
  const [sessionBalance, setSessionBalance] = useState(0)

  const STORAGE_KEY = 'coins_page_data'

  const saveToLocalStorage = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Save to local storage error:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Load from local storage error:', error)
    }
    return null
  }

  // 加载用户数据
  const loadUserData = async () => {
    if (!user) return

    const storedData = loadFromLocalStorage()
    if (storedData && storedData.userId === user.id) {
      setSessionBalance(storedData.sessionBalance || 0)
      setCarbonReduced(storedData.carbonReduced || 0)
      setCheckInStreak(storedData.checkInStreak || 0)
      setLastCheckInDate(storedData.lastCheckInDate || null)
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('coins, carbon_reduced, last_check_in_date, check_in_streak')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const newBalance = profile?.coins || 0
      const newCarbonReduced = profile?.carbon_reduced || 0
      const newCheckInStreak = profile?.check_in_streak || 0
      const rawLast = profile?.last_check_in_date || null
      const newLastCheckInDate = rawLast ? String(rawLast).split('T')[0] : null

      setSessionBalance(newBalance)
      setBalance(newBalance)
      setCarbonReduced(newCarbonReduced)
      setCheckInStreak(newCheckInStreak)
      setLastCheckInDate(newLastCheckInDate)

      saveToLocalStorage({
        userId: user.id,
        sessionBalance: newBalance,
        carbonReduced: newCarbonReduced,
        checkInStreak: newCheckInStreak,
        lastCheckInDate: newLastCheckInDate
      })
    } catch (error) {
      console.error('Load user data error:', error)
    }
  }

  // 加载任务数据
  const loadTasks = async () => {
    const storedData = loadFromLocalStorage()
    if (storedData && storedData.userId === user?.id && storedData.tasks) {
      setTasks(storedData.tasks)
    }

    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      if (user) {
        const { data: userTasks, error: userTasksError } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id)

        if (userTasksError) throw userTasksError

        const tasksWithStatus = tasksData.map(task => ({
          ...task,
          user_task: userTasks.find(ut => ut.task_id === task.id)
        }))

        setTasks(tasksWithStatus)

        const storedData = loadFromLocalStorage()
        saveToLocalStorage({
          ...(storedData || {}),
          userId: user.id,
          tasks: tasksWithStatus
        })
      } else {
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Load tasks error:', error)
    }
  }

  // 加载礼品数据
  const loadGifts = async () => {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setGifts(data || [])
    } catch (error) {
      console.error('Load gifts error:', error)
    }
  }

  // 加载排行榜
  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, carbon_reduced')
        .order('carbon_reduced', { ascending: false })
        .limit(10)

      if (error) throw error

      const leaderboard = (data || []).map((user, index) => ({
        id: index + 1,
        name: user.username || '未知用户',
        avatar: user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        carbon: user.carbon_reduced || 0,
        rank: index + 1
      }))

      setTopUsers(leaderboard)
    } catch (error) {
      console.error('Load leaderboard error:', error)
    }
  }

  // 加载兑换记录
  const loadRedemptionRecords = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('gift_redemptions')
        .select(`
          *,
          gifts(title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRedemptionRecords(data || [])
    } catch (error) {
      console.error('Load redemption records error:', error)
    }
  }

  // 签到功能
  const handleCheckIn = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    setIsCheckingIn(true)

    try {
      const { data, error } = await supabase.rpc('perform_check_in', {
        user_uuid: user.id
      })

      if (error) throw error

      if (data.success) {
        const rewardCoins = data.reward_coins || 0
        const rewardCarbon = data.reward_carbon || 0
        const newSessionBalance = sessionBalance + rewardCoins
        const newBalance = balance + rewardCoins
        const newCarbonReduced = carbonReduced + rewardCarbon
        const newCheckInStreak = data.streak || checkInStreak
        const newLastCheckInDate = new Date().toISOString().split('T')[0]

        setSessionBalance(newSessionBalance)
        setBalance(newBalance)
        setCarbonReduced(newCarbonReduced)
        setCheckInStreak(newCheckInStreak)
        setLastCheckInDate(newLastCheckInDate)

        const storedData = loadFromLocalStorage()
        saveToLocalStorage({
          ...(storedData || {}),
          userId: user.id,
          sessionBalance: newSessionBalance,
          balance: newBalance,
          carbonReduced: newCarbonReduced,
          checkInStreak: newCheckInStreak,
          lastCheckInDate: newLastCheckInDate
        })

        if (rewardCoins > 0) {
          alert(`签到成功！获得 ${rewardCoins} 光币和 ${rewardCarbon}kg 碳减排值`)
        } else {
          alert('签到成功')
        }
        loadUserData()
      } else {
        alert(data.message || '签到失败')
      }
    } catch (error: any) {
      console.error('Check-in error:', error)
      alert('签到失败: ' + error.message)
    } finally {
      setIsCheckingIn(false)
    }
  }

  // 完成任务
  const handleCompleteTask = async (task: Task) => {
    if (!user) {
      alert('请先登录')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const dailyLimitTasks = ['publish_product', 'share', 'join_event']

    if (dailyLimitTasks.includes(task.task_type) && task.user_task?.status === 'claimed') {
      const lastCompleted = task.user_task?.updated_at?.split('T')[0]
      if (lastCompleted === today) {
        alert('今日已完成此任务，请明天再来')
        return
      }
    }

    switch (task.task_type) {
      case 'check_in':
        await handleCheckIn()
        break
      case 'publish_product':
        if (onNavigate) {
          onNavigate('marketplace', { showPublishModal: true })
        } else {
          window.location.href = '/marketplace'
        }
        break
      case 'join_event':
        onNavigate?.('activities')
        break
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: '拾光志 - 校园闲置物品循环平台',
            text: '加入拾光志，发现校园的每一面美好',
            url: window.location.origin
          })
        } else {
          navigator.clipboard.writeText(window.location.origin)
          alert('链接已复制到剪贴板，快去分享给好友吧！')
        }
        break
      case 'complete_profile':
        onNavigate?.('settings')
        break
      default:
        alert('此任务类型暂不支持直接完成，请通过其他方式完成任务')
    }
  }

  // 领取任务奖励
  const handleClaimTask = async (task: Task) => {
    if (!user || !task.user_task) return

    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        user_uuid: user.id,
        task_uuid: task.id
      })

      if (error) throw error

      if (data.success) {
        const newSessionBalance = sessionBalance + data.reward_coins
        const newBalance = balance + data.reward_coins
        const newCarbonReduced = carbonReduced + data.reward_carbon
        setSessionBalance(newSessionBalance)
        setBalance(newBalance)
        setCarbonReduced(newCarbonReduced)

        const storedData = loadFromLocalStorage()
        saveToLocalStorage({
          ...(storedData || {}),
          userId: user.id,
          sessionBalance: newSessionBalance,
          carbonReduced: newCarbonReduced
        })

        alert(`奖励领取成功！获得 ${data.reward_coins} 光币和 ${data.reward_carbon}kg 碳减排值`)
        loadTasks()
        loadUserData()
      } else {
        alert(data.message || '领取失败')
      }
    } catch (error: any) {
      console.error('Claim task error:', error)
      alert('领取失败: ' + error.message)
    }
  }

  // 兑换礼品
  const handleRedeemGift = async (gift: Gift) => {
    if (!user) {
      alert('请先登录')
      return
    }

    if (sessionBalance < gift.price) {
      alert('光币不足')
      return
    }

    try {
      const { data, error } = await supabase.rpc('redeem_gift', {
        user_uuid: user.id,
        gift_id: typeof gift.id === 'string' && /^\d+$/.test(gift.id) ? Number(gift.id) : gift.id
      })

      if (error) throw error

      if (data.success) {
        const newSessionBalance = sessionBalance - gift.price
        const newBalance = balance - gift.price
        setSessionBalance(newSessionBalance)
        setBalance(newBalance)

        const storedData = loadFromLocalStorage()
        saveToLocalStorage({
          ...(storedData || {}),
          userId: user.id,
          sessionBalance: newSessionBalance
        })

        setCurrentRedemption({
          ...data,
          gift_title: gift.title,
          redemption_instructions: gift.redemption_instructions
        })
        setShowRedemptionModal(true)
        loadUserData()
        loadGifts()
      } else {
        alert(data.message || '兑换失败')
      }
    } catch (error: any) {
      console.error('Redeem gift error:', error)
      alert('兑换失败: ' + error.message)
    }
  }

  // 生成小票
  const generateReceipt = () => {
    if (!currentRedemption) return

    const receiptHtml = `
      <div style="font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; border: 1px dashed #ccc;">
        <h2 style="text-align: center; margin-bottom: 20px;">拾光志 - 兑换小票</h2>
        <div style="margin-bottom: 15px;">
          <strong>兑换码:</strong> ${currentRedemption.redemption_code}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>礼品名称:</strong> ${currentRedemption.gift_title}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>消费光币:</strong> ${currentRedemption.price}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>兑换时间:</strong> ${new Date().toLocaleString('zh-CN')}
        </div>
        <div style="margin-bottom: 15px;">
          <strong>兑换说明:</strong><br>
          ${currentRedemption.redemption_instructions}
        </div>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
        <p style="text-align: center; font-size: 12px; color: #666;">
          请凭此小票到指定地点兑换礼品
        </p>
        <p style="text-align: center; font-size: 12px; color: #666;">
          感谢您参与校园环保事业！
        </p>
      </div>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(receiptHtml)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // 检查今日是否已签到
  const canCheckInToday = () => {
    if (!lastCheckInDate) return true
    const today = new Date().toISOString().split('T')[0]
    return lastCheckInDate !== today
  }

  useEffect(() => {
    loadUserData()
    loadTasks()
    loadGifts()
    loadLeaderboard()
    loadRedemptionRecords()
  }, [user])

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'check_in': return Calendar
      case 'publish_product': return Upload
      case 'complete_transaction': return ShoppingBag
      case 'share': return Share2
      case 'complete_profile': return User
      case 'join_event': return Zap
      default: return Zap
    }
  }

  const getTaskIconColors = (taskType: string) => {
    switch (taskType) {
      case 'check_in': return { bg: "var(--amber-50)", color: "var(--amber-500)" }
      case 'publish_product': return { bg: "var(--blue-50)", color: "var(--blue-500)" }
      case 'complete_transaction': return { bg: "var(--emerald-50)", color: "var(--emerald-500)" }
      case 'share': return { bg: "var(--purple-50)", color: "var(--purple-500)" }
      case 'complete_profile': return { bg: "var(--orange-50)", color: "var(--orange-500)" }
      case 'join_event': return { bg: "var(--pink-50)", color: "var(--pink-500)" }
      default: return { bg: "var(--gray-50)", color: "var(--gray-500)" }
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "var(--amber-400)"
    if (rank === 2) return "#9ca3af"
    return "var(--amber-700)"
  }

  const getTaskDisplayStatus = (task: Task) => {
    const userTask = task.user_task
    const today = new Date().toISOString().split('T')[0]

    if (userTask?.status === 'claimed') return 'claimed'
    if (userTask?.status === 'completed') return 'completed'
    // fallback for check_in: if user has checked in today
    if (task.task_type === 'check_in' && lastCheckInDate === today) return 'completed'
    if (userTask?.status === 'in_progress') return 'in_progress'
    return 'not_started'
  }

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
          <button
            onClick={() => setActiveTab("records")}
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: "var(--emerald-600)" }}
          >
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
              onClick={handleCheckIn}
              disabled={isCheckingIn || !canCheckInToday()}
              className={`absolute top-4 right-4 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:shadow-lg transition-shadow ${
                !canCheckInToday() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: "var(--emerald-500)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isCheckingIn ? '签到中...' : canCheckInToday() ? '每日签到' : '已签到'}
            </button>

            <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 mb-1">
                <Coins className="w-7 h-7" style={{ color: "var(--amber-500)" }} />
                <span className="text-4xl font-bold text-foreground">{balance.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">光币余额</p>
              {checkInStreak > 0 && (
                <p className="text-xs text-muted-foreground mt-1">连续签到 {checkInStreak} 天</p>
              )}
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
                      borderColor: getRankColor(user.rank),
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
                        backgroundColor: getRankColor(user.rank),
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
            <button
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "records" ? "text-white" : "text-muted-foreground"
              }`}
              style={
                activeTab === "records" ? { backgroundColor: "var(--emerald-500)" } : { backgroundColor: "var(--muted)" }
              }
            >
              <CheckCircle className="w-4 h-4" />
              兑换记录
            </button>
          </div>

          {/* Content */}
          {activeTab === "earn" ? (
            <div className="space-y-3">
              {tasks.map((task) => {
                const IconComponent = getTaskIcon(task.task_type)
                const iconColors = getTaskIconColors(task.task_type)
                const userTask = task.user_task

                return (
                  <div
                    key={task.id}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconColors.bg }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: iconColors.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {userTask?.status === 'in_progress' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>进度</span>
                            <span>{userTask.progress || 0}/{task.requirements?.count || 1}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${((userTask.progress || 0) / (task.requirements?.count || 1)) * 100}%`,
                                backgroundColor: "var(--emerald-500)",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        +{task.reward_coins}币 +{task.reward_carbon}kg
                      </div>
                      {(() => {
                        const status = getTaskDisplayStatus(task)
                        if (status === 'claimed') {
                          return (
                            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "var(--emerald-600)" }}>
                              <CheckCircle className="w-4 h-4" />
                              已领取
                            </div>
                          )
                        } else if (status === 'completed') {
                          return (
                            <button
                              onClick={() => handleClaimTask(task)}
                              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                              style={{
                                backgroundColor: "var(--emerald-500)",
                                color: "white",
                              }}
                            >
                              领取
                            </button>
                          )
                        } else if (status === 'in_progress') {
                          return (
                            <div className="text-sm text-muted-foreground">进行中</div>
                          )
                        } else {
                          return (
                            <button
                              onClick={() => handleCompleteTask(task)}
                              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-90"
                              style={{
                                border: "1px solid var(--emerald-500)",
                                color: "var(--emerald-600)",
                                backgroundColor: "transparent",
                              }}
                            >
                              去完成
                            </button>
                          )
                        }
                      })()}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : activeTab === "redeem" ? (
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
                      src={gift.image_url || "/placeholder.svg"}
                      alt={gift.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-foreground font-medium text-sm mb-2 truncate">{gift.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{gift.description}</p>
                  <div
                    className="flex items-center gap-1 text-sm font-semibold mb-3"
                    style={{ color: "var(--amber-500)" }}
                  >
                    <Coins className="w-4 h-4" />
                    {gift.price}
                  </div>
                  <button
                    onClick={() => handleRedeemGift(gift)}
                    disabled={balance < gift.price}
                    className={`w-full text-sm font-medium py-2 rounded-lg transition-colors hover:opacity-90 ${
                      balance < gift.price ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'text-white'
                    }`}
                    style={{ backgroundColor: balance >= gift.price ? "var(--emerald-500)" : "var(--muted)" }}
                  >
                    {balance < gift.price ? '光币不足' : '立即兑换'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {redemptionRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无兑换记录</p>
                </div>
              ) : (
                redemptionRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--emerald-50)" }}
                    >
                      <Gift className="w-6 h-6" style={{ color: "var(--emerald-500)" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium">{record.gift_title || record.gifts?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        兑换码: {record.redemption_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {record.status === 'completed' ? '已兑换' :
                         record.status === 'expired' ? '已过期' : '待兑换'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Redemption Modal */}
      {showRedemptionModal && currentRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(45, 42, 38, 0.2)" }}
            onClick={() => setShowRedemptionModal(false)}
          />
          <div
            className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl p-6"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setShowRedemptionModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--emerald-50)" }}
              >
                <Check className="w-8 h-8" style={{ color: "var(--emerald-500)" }} />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">兑换成功！</h2>
              <p className="text-sm text-muted-foreground">
                恭喜您成功兑换 {currentRedemption.gift_title}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">兑换码</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {currentRedemption.redemption_code}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <h3 className="font-medium text-foreground mb-2">兑换说明：</h3>
                <p>{currentRedemption.redemption_instructions}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={generateReceipt}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors hover:opacity-90"
                style={{
                  border: "1px solid var(--emerald-500)",
                  color: "var(--emerald-600)",
                  backgroundColor: "transparent",
                }}
              >
                <Printer className="w-4 h-4" />
                打印小票
              </button>
              <button
                onClick={() => {
                  try {
                    const code = currentRedemption.redemption_code
                    if (!code) return
                    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                      navigator.clipboard.writeText(code).then(() => {
                        alert('兑换码已复制到剪贴板')
                      }).catch(() => {
                        const ta = document.createElement('textarea')
                        ta.value = code
                        document.body.appendChild(ta)
                        ta.select()
                        document.execCommand('copy')
                        document.body.removeChild(ta)
                        alert('兑换码已复制到剪贴板')
                      })
                    } else {
                      const ta = document.createElement('textarea')
                      ta.value = code
                      document.body.appendChild(ta)
                      ta.select()
                      document.execCommand('copy')
                      document.body.removeChild(ta)
                      alert('兑换码已复制到剪贴板')
                    }
                  } catch (err) {
                    console.error('Copy redemption code error:', err)
                  }
                }}
                className="flex-1 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--emerald-500)" }}
              >
                复制兑换码
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
