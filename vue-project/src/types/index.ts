export interface User {
  id: string
  name: string
  avatar: string
  phone?: string
}

export interface Member {
  name: string
  avatar: string
  isHost: boolean
}

export interface LinkedEvent {
  name: string
  date: string
}

export interface BuddyRequest {
  id: number
  user: {
    name: string
    avatar: string
    time: string
  }
  title: string
  description: string
  tags: string[]
  slots: {
    filled: number
    total: number
  }
  linkedEvent?: LinkedEvent
  members: Member[]
}

export interface ConfirmAction {
  type: "kick" | "transfer" | "dissolve" | "leave"
  memberName?: string
}

export interface Activity {
  id: number
  title: string
  category: string
  date: string
  time: string
  location: string
  image: string
  participants: number
  maxParticipants: number
  tags: string[]
}

export interface MarketItem {
  id: number
  title: string
  price: number
  originalPrice?: number
  image: string
  seller: {
    name: string
    avatar: string
  }
  condition: string
  category: string
  postedAt: string
}

export interface TrendingEvent {
  id: number
  name: string
  date: string
  buddyCount: number
}

export interface Category {
  id: string
  label: string
}
