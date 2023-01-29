import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173/vite/",
  },

  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
  },
});
