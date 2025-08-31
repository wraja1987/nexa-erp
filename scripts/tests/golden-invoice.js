const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const pdfPath = path.join(__dirname, 'fixtures/invoice-sample.pdf')
const expectedSha = '665b5c9318702d0962f26e29e139db3ff11a64b0632ac1f0fa8b61cf4998dc2b'

const buf = fs.readFileSync(pdfPath)
const sha = crypto.createHash('sha256').update(buf).digest('hex')
if (sha !== expectedSha) {
  throw new Error(`Invoice PDF hash mismatch expected ${expectedSha} actual ${sha}`)
}
console.log('Invoice golden OK', sha)


