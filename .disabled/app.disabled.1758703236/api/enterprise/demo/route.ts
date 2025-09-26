import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'reports', 'phase6-enterprise-demo.json')
    const raw = fs.readFileSync(p, 'utf8')
    const json = JSON.parse(raw) as { entities?: unknown[]; intercompanyJournals?: unknown[]; consolidations?: unknown[] }
    const out = {
      entities: Array.isArray(json.entities) ? json.entities.length : 0,
      intercompany: Array.isArray(json.intercompanyJournals) ? json.intercompanyJournals.length : 0,
      consolidations: Array.isArray(json.consolidations) ? json.consolidations.length : 0,
    }
    audit({ route: '/api/enterprise/demo', session: 'demo', ip: '0.0.0.0' })
    return NextResponse.json(out)
  } catch {
    return NextResponse.json({ entities: 0, intercompany: 0, consolidations: 0 })
  }
}


