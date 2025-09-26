import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'
import fs from 'node:fs/promises'
import path from 'node:path'

type JobOutcome = 'success' | 'error'
type JobsStatus = Record<string, { lastRun: string; outcome: JobOutcome }>

export async function GET() {
  try {
    const file = path.join(process.cwd(), 'reports', 'jobs-status.json')
    let data: JobsStatus = {}
    try {
      const raw = await fs.readFile(file, 'utf8')
      data = JSON.parse(raw) as JobsStatus
    } catch {
      data = {}
    }
    audit({ route: '/api/jobs/status', ip: '0.0.0.0', session: 'jobs' })
    return NextResponse.json({ ok: true, status: 'active', data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 500 })
  }
}


