#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync } = require('child_process')

const url = process.argv[2]
if (!url) {
  // Test-friendly: if no URL passed, treat as a no-op success to allow coverage tests to import/execute
  console.log('run-axe.cjs: no URL provided, exiting 0 (dry mode)')
  process.exit(0)
}

const args = ['--yes', '@axe-core/cli', url, '--load-delay', '500']
const res = spawnSync('npx', args, { stdio: 'inherit' })
if (res.status === 0) {
  console.log(`AXE OK ${url}`)
  process.exit(0)
} else {
  console.error(`AXE FAIL ${url}`)
  process.exit(res.status || 1)
}


