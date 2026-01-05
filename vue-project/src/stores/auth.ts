import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { User } from "@/types"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const coins = ref(128)

  const isLoggedIn = computed(() => !!user.value)

  function login(credentials: { phone: string; code: string }) {
    user.value = {
      id: "1",
      name: "小明",
      avatar: "👤",
      phone: credentials.phone,
    }
  }

  function logout() {
    user.value = null
  }

  function addCoins(amount: number) {
    coins.value += amount
  }

  function spendCoins(amount: number) {
    if (coins.value >= amount) {
      coins.value -= amount
      return true
    }
    return false
  }

  return {
    user,
    coins,
    isLoggedIn,
    login,
    logout,
    addCoins,
    spendCoins,
  }
})
