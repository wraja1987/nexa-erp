/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString()
  } catch (e) {
    return ''
  }
}

function main() {
  const dir = join(process.cwd(), '..', '..', 'backups')
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  if (!files.length) { console.log('[dr] no backups'); return }
  const latest = files[files.length - 1]
  const dbname = `nexa_dr_test_${Date.now()}`
  run(`createdb "${dbname}"`)
  run(`psql "${process.env.DATABASE_URL}" -c 'select 1'`)
  run(`psql "${dbname}" -f "${join(dir, latest)}"`)
  const smoke = run(`psql "${dbname}" -c "select now();"`)
  console.log('[dr] smoke:', !!smoke)
  run(`dropdb "${dbname}"`)
}

main()


