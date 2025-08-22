const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const pdfPath = path.join(__dirname, 'fixtures/invoice-sample.pdf')
const expectedSha = '8a72462281b6dd8de026f3ca7ab870dfb81425fa6227a37789e526aea7d41673'

const buf = fs.readFileSync(pdfPath)
const sha = crypto.createHash('sha256').update(buf).digest('hex')
if (sha !== expectedSha) {
  throw new Error(`Invoice PDF hash mismatch expected ${expectedSha} actual ${sha}`)
}
console.log('Invoice golden OK', sha)


