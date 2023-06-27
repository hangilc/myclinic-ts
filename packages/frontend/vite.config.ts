import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig(({command, mode, ssrBuild }) => ({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        practice: resolve(__dirname, "practice/index.html"),
        reception: resolve(__dirname, "reception/index.html"),
        appoint: resolve(__dirname, "appoint/index.html"),
      }
    },
    chunkSizeWarningLimit: 5000
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@cypress": resolve(__dirname, "cypress")
    }
  },
  base: "/vite/",
  server: {
    fs: {
      allow: [
        "../../node_modules", 
        ".", 
        "../model",
        "../onshi-result",
        "../rezept",
      ],
    }
  }

}))

