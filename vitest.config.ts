// @ts-nocheck
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'packages/**/?(*.)+(test).js',
      'packages/**/?(*.)+(test).ts',
      'apps/web/src/**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      'dist/**',
      'apps/mobile/**',
      'apps/web/node_modules/**',
    ],
    passWithNoTests: false,
  },
  coverage: {
    provider: 'v8',
    exclude: ['scripts/**'],
    thresholds: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
})


