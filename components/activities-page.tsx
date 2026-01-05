"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react"

interface ActivitiesPageProps {
  onBack: () => void
}

const events = [
  {
    id: 1,
    title: "AI 技术前沿讲座",
    description: "清华大学客座教授分享最新人工智能研究成果",
    type: "lecture",
    typeLabel: "讲座",
    day: 20,
    month: 12,
    time: "14:00-16:00",
    location: "图书馆报告厅",
    participantCount: 156,
  },
  {
    id: 2,
    title: "冬季篮球联赛决赛",
    description: "计算机学院 vs 商学院 年度总冠军争夺战",
    type: "sports",
    typeLabel: "体育",
    day: 22,
    month: 12,
    time: "18:30-20:30",
    location: "主体育馆",
    participantCount: 89,
  },
  {
    id: 3,
    title: "校园音乐节",
    description: "一年一度的音乐盛会，现场乐队表演",
    type: "club",
    typeLabel: "社团",
    day: 25,
    month: 12,
    time: "19:00-22:00",
    location: "学生活动中心",
    participantCount: 320,
  },
  {
    id: 4,
    title: "读书分享会",
    description: "本月主题：《人类简史》深度解读",
    type: "lecture",
    typeLabel: "讲座",
    day: 28,
    month: 12,
    time: "15:00-17:00",
    location: "图书馆二楼",
    participantCount: 45,
  },
]

const eventTags = [
  { label: "全部", value: "all" },
  { label: "讲座", value: "lecture" },
  { label: "社团", value: "club" },
  { label: "体育", value: "sports" },
]

const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

export function ActivitiesPage({ onBack }: ActivitiesPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeTag, setActiveTag] = useState("all")

  const currentMonthYear = useMemo(() => {
    return currentDate.toLocaleDateString("zh-CN", { month: "long", year: "numeric" })
  }, [currentDate])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: { date: Date | null; isToday?: boolean; isSelected?: boolean; hasEvent?: boolean }[] = []
    const today = new Date()

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: null })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      days.push({
        date,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        hasEvent: events.some((e) => e.day === d && e.month === month + 1),
      })
    }

    return days
  }, [currentDate, selectedDate])

  const filteredEvents = useMemo(() => {
    return activeTag === "all" ? events : events.filter((e) => e.type === activeTag)
  }, [activeTag])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getTypeBadgeStyle = (type: string) => {
    const styles: Record<string, React.CSSProperties> = {
      lecture: { backgroundColor: "var(--amber-100)", color: "var(--amber-700)" },
      club: { backgroundColor: "var(--orange-100)", color: "var(--orange-700)" },
      sports: { backgroundColor: "var(--yellow-100)", color: "var(--yellow-700)" },
    }
    return styles[type] || { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
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
        <h1 className="text-2xl font-semibold mb-2 font-serif" style={{ color: "var(--amber-700)" }}>
          拾光·活动
        </h1>
        <p className="text-sm text-muted-foreground">发现身边的讲座、演出与赛事</p>
      </div>

      <div className="flex gap-8">
        {/* Calendar */}
        <div className="w-72 flex-shrink-0">
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-medium text-foreground">{currentMonthYear}</h3>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs py-1 text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day.date && setSelectedDate(day.date)}
                  disabled={!day.date}
                  className={`relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${!day.date ? "invisible" : ""}`}
                  style={
                    day.isSelected
                      ? { backgroundColor: "var(--amber-600)", color: "white", fontWeight: 500 }
                      : day.isToday
                        ? { backgroundColor: "var(--amber-100)", color: "var(--amber-700)", fontWeight: 500 }
                        : { color: "var(--foreground)" }
                  }
                >
                  {day.date?.getDate()}
                  {day.hasEvent && !day.isSelected && (
                    <span
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ backgroundColor: "var(--amber-600)" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-6">
            {eventTags.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                className="px-3 py-1.5 text-sm rounded-lg transition-all"
                style={
                  activeTag === tag.value
                    ? { backgroundColor: "var(--amber-600)", color: "white" }
                    : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                }
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 rounded-xl p-4 transition-all duration-200 hover:border-amber-300"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="rounded-lg py-2 px-2" style={{ backgroundColor: "var(--amber-50)" }}>
                    <div className="text-lg font-semibold" style={{ color: "var(--amber-700)" }}>
                      {event.day}
                    </div>
                    <div className="text-xs" style={{ color: "var(--amber-600)", opacity: 0.7 }}>
                      12月
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-medium rounded mb-1.5"
                        style={getTypeBadgeStyle(event.type)}
                      >
                        {event.typeLabel}
                      </span>
                      <h3 className="text-base font-medium text-foreground">{event.title}</h3>
                    </div>
                    <button
                      className="px-4 h-8 text-xs text-white rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
                      style={{ backgroundColor: "var(--amber-600)" }}
                    >
                      报名
                    </button>
                  </div>
                  <p className="text-sm mb-3 line-clamp-1 text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.participantCount} 人
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
