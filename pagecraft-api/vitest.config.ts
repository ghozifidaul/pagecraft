import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    testTimeout: 30000,
    setupFiles: ["src/services/__tests__/setup.ts"],
  },
})
