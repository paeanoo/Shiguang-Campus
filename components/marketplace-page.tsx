"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, Search, Heart } from "lucide-react"

interface MarketplacePageProps {
  onBack: () => void
}

const categories = [
  { label: "全部", value: "all" },
  { label: "数码", value: "digital" },
  { label: "书籍", value: "books" },
  { label: "服饰", value: "clothes" },
]

const products = [
  {
    id: 1,
    title: "iPad Pro 11英寸 2021款",
    price: 3200,
    originalPrice: 6799,
    category: "digital",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    likes: 128,
    publisher: {
      name: "张三",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  },
  {
    id: 2,
    title: "人类简史三部曲套装",
    price: 45,
    originalPrice: 168,
    category: "books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
    likes: 86,
    publisher: {
      name: "李四",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
  },
  {
    id: 3,
    title: "优衣库轻羽绒服 M码",
    price: 120,
    originalPrice: 499,
    category: "clothes",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
    likes: 52,
    publisher: {
      name: "王五",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  },
  {
    id: 4,
    title: "索尼 WH-1000XM4 降噪耳机",
    price: 980,
    originalPrice: 2499,
    category: "digital",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    likes: 234,
    publisher: {
      name: "赵六",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
  },
  {
    id: 5,
    title: "米家台灯 Pro",
    price: 85,
    originalPrice: 199,
    category: "digital",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    likes: 67,
    publisher: {
      name: "孙七",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
  },
  {
    id: 6,
    title: "樱桃轴机械键盘",
    price: 280,
    originalPrice: 599,
    category: "digital",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop",
    likes: 156,
    publisher: {
      name: "周八",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
  },
]

export function MarketplacePage({ onBack }: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => activeCategory === "all" || p.category === activeCategory)
      .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [activeCategory, searchQuery])

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
        <h1 className="text-2xl font-semibold mb-2 font-serif" style={{ color: "var(--teal-700)" }}>
          益起·流转
        </h1>
        <p className="text-sm text-muted-foreground">闲置物品循环，让爱意在校园流动</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索物品..."
            className="w-full pl-9 h-10 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="px-3 py-1.5 text-sm rounded-lg transition-all"
              style={
                activeCategory === cat.value
                  ? { backgroundColor: "var(--teal-600)", color: "white" }
                  : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: "var(--teal-600)" }}
              >
                公益
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium mb-2 line-clamp-1 text-foreground">{product.title}</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-semibold" style={{ color: "var(--teal-700)" }}>
                  ¥{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs line-through text-muted-foreground">¥{product.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <img
                    src={product.publisher.avatar || "/placeholder.svg"}
                    alt={product.publisher.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-muted-foreground">{product.publisher.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{product.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
