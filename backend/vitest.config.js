import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.js'],
    testTimeout: 15000,
    setupFiles: ['src/tests/setup.js'],
  },
})
