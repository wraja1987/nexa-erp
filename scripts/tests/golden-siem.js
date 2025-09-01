const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ndjsonPath = path.join(__dirname, 'fixtures/siem-sample.ndjson')
// Re-baselined snapshot as of hardened build
const expectedSha = '656c0dfea5cd6628490b6229d0cfed37350ca3b875ca5c9331e90622bbc27894'

const content = fs.readFileSync(ndjsonPath)
const sha = crypto.createHash('sha256').update(content).digest('hex')
if (sha !== expectedSha) {
  throw new Error(`SIEM NDJSON snapshot mismatch expected ${expectedSha} actual ${sha}`)
}
console.log('SIEM golden OK', sha)


