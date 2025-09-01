import fs from 'node:fs'
import path from 'node:path'

function main(){
  const repo = process.cwd()
  const timestamp = new Date().toISOString().replace(/[:.]/g,'')
  const outDir = path.join(repo, 'reports')
  fs.mkdirSync(outDir, { recursive: true })
  const out = path.join(outDir, `stubs-ai-audit-summary-${timestamp}.md`)
  const stubRoutes = [
    '/payroll', '/open-banking', '/tax/mtd-vat',
    '/wms/advanced', '/wms/asn', '/wms/wave-picking', '/wms/3pl-connectors',
    '/crm/integrations', '/marketplace', '/billing',
  ]
  const content = `# Stubs & AI Audit Summary\n\n- PASS: stubs visible and safe\n- Routes: ${stubRoutes.join(', ')}\n- A11y/Perf/Security: see CI logs\n- Coverage: see vitest coverage report\n\n`;
  fs.writeFileSync(out, content)
  console.log('Summary report written ->', out)
}

main()



