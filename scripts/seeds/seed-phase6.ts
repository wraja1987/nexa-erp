/*
  Phase 6 Seed — idempotent and safe when DATABASE_URL is unset
  Intent: provide a deterministic hook for Phase 6 demo data without failing CI when DB is unavailable.
*/
/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim().length > 0)
}

async function main() {
  if (!hasDatabaseUrl()) {
    console.log('[phase6:seed] DATABASE_URL not set; skipping Phase 6 seed (ok)')
    return
  }
  // Placeholder: future deterministic upserts go here (Prisma or psql). Keep idempotent.
  try {
    // Deterministic marker to prove seed ran without DB writes
    const markerDir = path.join(process.cwd(), 'reports')
    fs.mkdirSync(markerDir, { recursive: true })
    const marker = path.join(markerDir, 'phase6-seed-marker.txt')
    fs.writeFileSync(marker, 'phase6-seed-run\n', { flag: 'a', encoding: 'utf8' })
    console.log('[phase6:seed] wrote marker to reports/phase6-seed-marker.txt')
  } catch (err) {
    console.error('[phase6:seed] error:', err)
    process.exitCode = 1
  }
}

void main()


