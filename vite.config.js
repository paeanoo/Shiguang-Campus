import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { fileURLToPath, URL } from "node:url"
import path from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "@/lib": path.resolve(process.cwd(), "./lib"),
      "@lib": path.resolve(process.cwd(), "./lib"),
    },
  },
  server: {
    port: 9000,
  },
})
