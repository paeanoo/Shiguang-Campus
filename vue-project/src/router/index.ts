import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/activities",
    name: "Activities",
    component: () => import("@/views/ActivitiesView.vue"),
  },
  {
    path: "/marketplace",
    name: "Marketplace",
    component: () => import("@/views/MarketplaceView.vue"),
  },
  {
    path: "/coins",
    name: "Coins",
    component: () => import("@/views/CoinsView.vue"),
  },
  {
    path: "/buddy",
    name: "Buddy",
    component: () => import("@/views/BuddyView.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
