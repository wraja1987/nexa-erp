const fs = require('fs')
const path = require('path')

const outPath = path.join(__dirname, '../../apps/web/public/openapi.json')
const doc = {
  openapi: '3.0.3',
  info: { title: 'Nexa ERP API', version: '0.1.0' },
  tags: [
    { name: 'Billing' },
    { name: 'Developer Portal' },
    { name: 'Monitoring' },
    { name: 'Settings' },
    { name: 'Assistant' }
  ],
  paths: {
    '/api/assistant': {
      post: {
        tags: ['Assistant'],
        requestBody: { required: true },
        responses: { '200': { description: 'assistant reply' } }
      }
    },
    '/api/healthz': { get: { tags: ['Monitoring'], responses: { '200': { description: 'ok' } } } },
    '/api/readyz': { get: { tags: ['Monitoring'], responses: { '200': { description: 'ready' } } } }
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2))
console.log('Wrote', outPath)


