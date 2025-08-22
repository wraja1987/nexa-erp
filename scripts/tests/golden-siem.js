#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ndjsonPath = path.join(__dirname, 'fixtures/siem-sample.ndjson')
const expectedSha = '1d47fae7161851a5a3da3c6b79b647288262603da0202c9a6ef19a2e24cfdc1e'

const content = fs.readFileSync(ndjsonPath)
const sha = crypto.createHash('sha256').update(content).digest('hex')
if (sha !== expectedSha) {
  console.error('SIEM NDJSON snapshot mismatch')
  console.error(' expected:', expectedSha)
  console.error('   actual:', sha)
  process.exit(1)
}
console.log('SIEM golden OK', sha)


