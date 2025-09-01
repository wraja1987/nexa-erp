import fs from 'node:fs'
import path from 'node:path'

function main() {
  const repo = process.cwd()
  const src = path.join(repo, 'apps/web/src/seeds/demo/phase6-stubs.json')
  const outDir = path.join(repo, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const dest = path.join(outDir, 'seed-phase6-stubs.json')
  const raw = fs.readFileSync(src, 'utf8')
  const json = JSON.parse(raw)
  // idempotent write
  fs.writeFileSync(dest, JSON.stringify(json, null, 2))
  console.log('Stubs seeded (demo copy only) ->', dest)
}

main()


