import { describe, it, expect } from 'vitest'
import { OrchestrationStartSchema, OrchestrationStartResultSchema } from '../../../../types/phase6'
import { POST } from './route'
import { getQueueLength, clearQueue } from '../../../../lib/orchestration/runner'

describe('orchestration start DTO', () => {
  it('accepts minimal payload and returns shaped result', () => {
    const ok = OrchestrationStartSchema.safeParse({ workflowId: 'wf1' })
    expect(ok.success).toBe(true)
    const res = OrchestrationStartResultSchema.safeParse({ orchestrationId: 'orc_abc', acceptedAt: new Date().toISOString() })
    expect(res.success).toBe(true)
  })
  it('enqueues on POST and returns orchestration id', async () => {
    clearQueue()
    const req = new Request('http://localhost/api/orchestration/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.4', 'x-session': 'session-1' },
      body: JSON.stringify({ workflowId: 'wf1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(202)
    const body = await res.json()
    expect(body.orchestrationId).toMatch(/^orc_/)
    expect(getQueueLength()).toBe(1)
  })
  it('rejects invalid JSON with 400', async () => {
    const bad = new Request('http://localhost/api/orchestration/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{bad json',
    })
    const res = await POST(bad)
    expect(res.status).toBe(400)
  })
  it('rejects invalid payload with 400', async () => {
    const req = new Request('http://localhost/api/orchestration/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ noWorkflowId: true }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})


