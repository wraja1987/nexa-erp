import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

describe('Phase 6 seed runner', () => {
  it('exits 0 when DATABASE_URL is unset (skips safely)', () => {
    const script = path.join(process.cwd(), 'scripts', 'seeds', 'seed-phase6.ts')
    const r = spawnSync('npx', ['tsx', script], {
      env: { ...process.env, DATABASE_URL: '' },
      stdio: 'pipe',
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('skipping Phase 6 seed')
  })
})


