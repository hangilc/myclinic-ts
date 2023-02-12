import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  component: {
    devServer: {
      framework: "svelte",
      bundler: "vite",
    },
    env: {
      "PRINTER-API": "http://localhost:48080",
    }
  },

  e2e: {
    baseUrl: "http://localhost:5173/vite",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      "PRINTER-API": "http://localhost:48080",
    }
  },
});
