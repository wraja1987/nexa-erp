#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../../apps/web/src/config/modules.ts')
const s = fs.readFileSync(navPath, 'utf8')
const required = [
  'Industry Packs', 'Manufacturing', 'Construction', 'Logistics', 'Retail', 'Professional Services', 'SaaS/Tech',
  'AI Orchestration', 'Workflows', 'Runs', 'Audit Logs',
  'Enterprise', 'Entities', 'Intercompany', 'Consolidation',
  'Integrations', 'Shopify', 'Amazon', 'eBay', 'HMRC RTI', 'Open Banking', 'EDI', 'Health', 'Toggles',
  'Help & Docs', 'SIEM Export'
]
const missing = required.filter((t) => !s.includes(t))
if (missing.length) {
  console.error('Missing nav entries:', missing.join(', '))
  process.exit(1)
}
console.log('ui:nav:lint OK')



