import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
  },

  env: {
    "API": "http://localhost:38080/api"
  },

  e2e: {
    baseUrl: "http://localhost:5173/vite",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
