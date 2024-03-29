/// <reference types="vitest" />
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cypress": path.resolve(__dirname, "./cypress"),
    }
  },
  test: {
    include: ["**/cypress/**/*.test.ts", "**/src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*"],
    globals: true,
    // deps: {
    //   // inline: true
    //   inline:
    //     // TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
    //     [/^(?!.*vitest).*$/],
    // },
    // server: {
    //   deps: {
    //     inline: [/^(?!.*vitest).*$/],
    //   }
    // }
  },
})
