import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        practice: resolve(__dirname, "practice/index.html")
      }
    },
    chunkSizeWarningLimit: 5000
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  base: "/vite/"
})
