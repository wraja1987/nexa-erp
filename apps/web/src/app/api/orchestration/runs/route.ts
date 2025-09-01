import { NextResponse } from 'next/server'
import { getQueueSnapshot } from '../../../../lib/orchestration/runner'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const items = getQueueSnapshot()
  audit({ route: '/api/orchestration/runs', count: items.length })
  return NextResponse.json({ items })
}


