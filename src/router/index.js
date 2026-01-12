import { createRouter, createWebHistory } from "vue-router"
import HomePage from "@/components/HomePage.vue"
import ActivitiesPage from "@/components/ActivitiesPage.vue"
import MarketplacePage from "@/components/MarketplacePage.vue"
import CoinsPage from "@/components/CoinsPage.vue"
import BuddyPage from "@/components/BuddyPage.vue"
import SettingsPage from "@/components/SettingsPage.vue"
import FavoritesPage from "@/components/FavoritesPage.vue"

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/activities",
    name: "activities",
    component: ActivitiesPage,
  },
  {
    path: "/marketplace",
    name: "marketplace",
    component: MarketplacePage,
  },
  {
    path: "/coins",
    name: "coins",
    component: CoinsPage,
  },
  {
    path: "/buddy",
    name: "buddy",
    component: BuddyPage,
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoritesPage,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
  {
    path: "/messages",
    name: "messages",
    component: () => import('@/views/MessageCenter.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
