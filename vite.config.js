import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 路径可配置：GitHub Pages 用 /life-journal/，本地局域网部署用 /
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5173,
    open: true
  }
})
