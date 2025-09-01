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
    include: [
      'apps/web/src/app/api/**/*.ts',
      'apps/web/src/lib/**/*.ts',
      'packages/sdk-nexa/src/**/*.ts',
      'packages/core/src/**/*.js',
    ],
    exclude: [
      // build/runtime
      'apps/web/.next/**',
      'dist/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.{js,ts}',
      // UI surfaces (covered by a11y/visual/perf suites; excluded from unit coverage)
      'apps/web/src/app/**/page.tsx',
      'apps/web/src/app/**/layout.tsx',
      'apps/web/src/components/**',
      'apps/web/src/config/**',
      'apps/web/src/types/**',
      // mobile app (covered by separate Jest smoke)
      'apps/mobile/**',
      // scripts and generated artifacts
      'scripts/**',
      'docs/**',
      'PLANS/**',
      'packages/sdk-nexa/dist/**',
    ],
    thresholds: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
})


