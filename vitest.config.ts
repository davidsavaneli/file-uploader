import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Match the library's JSX transform (the build config uses esbuild's automatic runtime).
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
