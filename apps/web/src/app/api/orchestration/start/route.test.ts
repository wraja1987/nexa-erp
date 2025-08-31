import { describe, it, expect } from 'vitest'
import { OrchestrationStartSchema, OrchestrationStartResultSchema } from '../../../../types/phase6'

describe('orchestration start DTO', () => {
  it('accepts minimal payload and returns shaped result', () => {
    const ok = OrchestrationStartSchema.safeParse({ workflowId: 'wf1' })
    expect(ok.success).toBe(true)
    const res = OrchestrationStartResultSchema.safeParse({ orchestrationId: 'orc_abc', acceptedAt: new Date().toISOString() })
    expect(res.success).toBe(true)
  })
})


