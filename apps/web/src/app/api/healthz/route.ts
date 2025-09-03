import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, services: {
    payroll: true,
    wms: true,
    mfg: true,
    crm: true,
  } })
}

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}



