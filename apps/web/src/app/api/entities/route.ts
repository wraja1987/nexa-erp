import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { audit } from '../../../lib/log/mask'

export const runtime = 'nodejs'

const EntityCreateSchema = z.object({
  code: z.string().min(2).max(12),
  name: z.string().min(1),
  timezone: z.string().default('UTC').optional(),
  active: z.boolean().default(true).optional(),
})

type Entity = z.infer<typeof EntityCreateSchema> & { id: string }

const entities: Entity[] = [
  { id: '11111111-1111-4111-8111-111111111111', code: 'NEXA', name: 'Nexa HQ', timezone: 'UTC', active: true },
]

export async function GET() {
  audit({ route: '/api/entities', action: 'list', session: 'entities', ip: '0.0.0.0' })
  return NextResponse.json({ items: entities })
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const parsed = EntityCreateSchema.parse(data)
    const entity: Entity = {
      id: randomUUID(),
      code: parsed.code,
      name: parsed.name,
      timezone: parsed.timezone ?? 'UTC',
      active: parsed.active ?? true,
    }
    entities.push(entity)
    audit({ route: '/api/entities', action: 'create', session: 'entities', ip: '0.0.0.0' })
    return NextResponse.json({ entity }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


