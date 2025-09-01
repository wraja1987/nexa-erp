import { NextResponse } from 'next/server'
import { getQueueLength } from '../../../../lib/orchestration/runner'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const queued = getQueueLength()
  audit({ route: '/api/orchestration/queue', queued })
  return NextResponse.json({ queued })
}


