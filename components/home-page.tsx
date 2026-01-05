"use client"

import { Calendar, Gift, Coins, Users } from "lucide-react"
import { ChevronRight } from "lucide-react"

interface HomePageProps {
  onNavigate: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight font-serif text-foreground">
          在拾光志，看见校园的每一面
        </h1>
        <p className="text-base max-w-md mx-auto leading-relaxed text-muted-foreground">记录精彩瞬间 · 益起传递温暖</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* 拾光·活动 Card */}
        <button onClick={() => onNavigate("activities")} className="group text-left">
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: "var(--amber-50)" }}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                  <Calendar className="w-8 h-8" style={{ color: "var(--amber-600)" }} />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2 font-serif" style={{ color: "var(--amber-700)" }}>
                拾光·活动
              </h2>
              <p className="text-sm mb-3 leading-relaxed text-muted-foreground">发现身边的讲座、演出与赛事。</p>
              <div
                className="flex items-center text-sm font-medium transition-all"
                style={{ color: "var(--amber-600)" }}
              >
                <span>探索时光</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </button>

        {/* 益起·流转 Card */}
        <button onClick={() => onNavigate("marketplace")} className="group text-left">
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: "var(--teal-50)" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                  <Gift className="w-8 h-8" style={{ color: "var(--teal-600)" }} />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2 font-serif" style={{ color: "var(--teal-700)" }}>
                益起·流转
              </h2>
              <p className="text-sm mb-3 leading-relaxed text-muted-foreground">闲置物品循环，让爱意在校园流动。</p>
              <div
                className="flex items-center text-sm font-medium transition-all"
                style={{ color: "var(--teal-600)" }}
              >
                <span>逛逛市集</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </button>

        {/* 光币中心 Card */}
        <button onClick={() => onNavigate("coins")} className="group text-left">
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: "var(--emerald-50)" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle, #d1fae5 2px, transparent 2px)",
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                  <Coins className="w-8 h-8" style={{ color: "var(--emerald-600)" }} />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2 font-serif" style={{ color: "var(--emerald-600)" }}>
                光币中心
              </h2>
              <p className="text-sm mb-3 leading-relaxed text-muted-foreground">赚取光币，兑换好礼，记录减碳足迹。</p>
              <div
                className="flex items-center text-sm font-medium transition-all"
                style={{ color: "var(--emerald-600)" }}
              >
                <span>查看光币</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </button>

        <button onClick={() => onNavigate("buddy")} className="group text-left">
          <div
            className="h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: "var(--blue-50)" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #dbeafe 25%, transparent 25%), linear-gradient(225deg, #dbeafe 25%, transparent 25%)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center bg-white">
                  <Users className="w-8 h-8" style={{ color: "var(--blue-500)" }} />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2 font-serif" style={{ color: "#1d4ed8" }}>
                搭子广场
              </h2>
              <p className="text-sm mb-3 leading-relaxed text-muted-foreground">找个伴一起学习、运动、看演出。</p>
              <div
                className="flex items-center text-sm font-medium transition-all"
                style={{ color: "var(--blue-500)" }}
              >
                <span>找搭子</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </button>
      </div>
    </section>
  )
}
