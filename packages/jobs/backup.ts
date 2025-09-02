/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString()
  } catch (e) {
    return ''
  }
}

function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '')
  const dir = join(process.cwd(), '..', '..', 'backups')
  try { mkdirSync(dir, { recursive: true }) } catch {}
  const out = join(dir, `pg-backup-${ts}.sql`)
  // Mask credentials not printed
  const cmd = `pg_dump "$DATABASE_URL" > "${out}"`
  const res = run(cmd)
  writeFileSync(join(dir, 'last-backup.txt'), ts + '\n')
  console.log('[backup] done', Boolean(res))
}

main()


