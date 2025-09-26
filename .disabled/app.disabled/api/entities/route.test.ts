import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'

type EntityRow = { id: string; code: string; name: string; timezone?: string; active?: boolean }
type ListResponse = { items: EntityRow[] }
type CreateResponse = { entity: EntityRow }

describe('entities API', () => {
  it('lists entities', async () => {
    const res = (await GET()) as Response
    const json = (await res.json()) as ListResponse
    expect(Array.isArray(json.items)).toBe(true)
    expect(json.items.length).toBeGreaterThan(0)
  })

  it('creates an entity with valid payload', async () => {
    const req = new Request('http://localhost/api/entities', {
      method: 'POST',
      body: JSON.stringify({ code: 'EU', name: 'Nexa EU', timezone: 'Europe/Paris' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = (await POST(req)) as Response
    expect(res.status).toBe(201)
    const json = (await res.json()) as CreateResponse
    expect(json.entity.code).toBe('EU')
    expect(json.entity.id).toMatch(/[0-9a-f-]{36}/)
  })
  it('rejects invalid payload', async () => {
    const req = new Request('http://localhost/api/entities', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'X' }), // missing name
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid payload', async () => {
    const bad = new Request('http://localhost/api/entities', {
      method: 'POST',
      body: JSON.stringify({ code: 'E', name: '' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = (await POST(bad)) as Response
    expect(res.status).toBe(400)
  })
})


