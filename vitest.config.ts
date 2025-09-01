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
      'apps/web/.next/**',
      'coverage/**',
    ],
    passWithNoTests: false,
  },
  coverage: {
    provider: 'v8',
    exclude: [
      'scripts/**',
      'apps/web/.next/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
      'packages/sdk-nexa/dist/**'
    ],
    thresholds: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
})


