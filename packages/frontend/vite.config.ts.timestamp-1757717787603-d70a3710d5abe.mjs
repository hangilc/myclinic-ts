// vite.config.ts
import { defineConfig } from "file:///home/hangil/myclinic-ts/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/hangil/myclinic-ts/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/hangil/myclinic-ts/packages/frontend";
var vite_config_default = defineConfig(({ command, mode, ssrBuild }) => ({
  plugins: [svelte()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        practice: resolve(__vite_injected_original_dirname, "practice/index.html"),
        reception: resolve(__vite_injected_original_dirname, "reception/index.html"),
        appoint: resolve(__vite_injected_original_dirname, "appoint/index.html")
      }
    },
    chunkSizeWarningLimit: 5e3
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@lib": resolve(__vite_injected_original_dirname, "src/lib")
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
        "../rezept"
      ]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9oYW5naWwvbXljbGluaWMtdHMvcGFja2FnZXMvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2hhbmdpbC9teWNsaW5pYy10cy9wYWNrYWdlcy9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW5naWwvbXljbGluaWMtdHMvcGFja2FnZXMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHtjb21tYW5kLCBtb2RlLCBzc3JCdWlsZCB9KSA9PiAoe1xuICBwbHVnaW5zOiBbc3ZlbHRlKCldLFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcidcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiaW5kZXguaHRtbFwiKSxcbiAgICAgICAgcHJhY3RpY2U6IHJlc29sdmUoX19kaXJuYW1lLCBcInByYWN0aWNlL2luZGV4Lmh0bWxcIiksXG4gICAgICAgIHJlY2VwdGlvbjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwicmVjZXB0aW9uL2luZGV4Lmh0bWxcIiksXG4gICAgICAgIGFwcG9pbnQ6IHJlc29sdmUoX19kaXJuYW1lLCBcImFwcG9pbnQvaW5kZXguaHRtbFwiKSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwMFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgICBcIkBsaWJcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2xpYlwiKSxcbiAgICB9XG4gIH0sXG4gIGJhc2U6IFwiL3ZpdGUvXCIsXG4gIHNlcnZlcjoge1xuICAgIGZzOiB7XG4gICAgICBhbGxvdzogW1xuICAgICAgICBcIi4uLy4uL25vZGVfbW9kdWxlc1wiLCBcbiAgICAgICAgXCIuXCIsIFxuICAgICAgICBcIi4uL21vZGVsXCIsXG4gICAgICAgIFwiLi4vb25zaGktcmVzdWx0XCIsXG4gICAgICAgIFwiLi4vcmV6ZXB0XCIsXG4gICAgICBdLFxuICAgIH1cbiAgfVxuXG59KSlcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLG9CQUFvQjtBQUM3VSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxlQUFlO0FBRnhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUMsU0FBUyxNQUFNLFNBQVMsT0FBTztBQUFBLEVBQzNELFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFBQSxFQUNsQixLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3JDLFVBQVUsUUFBUSxrQ0FBVyxxQkFBcUI7QUFBQSxRQUNsRCxXQUFXLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsUUFDcEQsU0FBUyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsRUFDekI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDN0IsUUFBUSxRQUFRLGtDQUFXLFNBQVM7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLE9BQU87QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
