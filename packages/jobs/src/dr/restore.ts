import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.log('Usage: pnpm -w dr:restore <dump.sql>')
  process.exit(0)
}
if (!existsSync(file)) {
  console.error('[dr] file not found:', file)
  process.exit(1)
}

const url = process.env.DATABASE_URL || ''
try {
  execSync(`psql ${url} -f ${file}`, { stdio: 'inherit' })
  console.log('[dr] restore completed from', file)
} catch (e) {
  console.error('[dr] restore failed; ensure psql is installed and URL is correct')
  process.exit(1)
}


