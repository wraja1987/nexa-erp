import { z } from 'zod'

export const OrchestrationStartSchema = z.object({
  workflowId: z.string().min(1),
  input: z.record(z.any()).default({}),
})
export type OrchestrationStart = z.infer<typeof OrchestrationStartSchema>

export const OrchestrationStartResultSchema = z.object({
  orchestrationId: z.string(),
  acceptedAt: z.string(),
})
export type OrchestrationStartResult = z.infer<typeof OrchestrationStartResultSchema>

export const ConnectorKey = z.enum(['shopify', 'amazon', 'ebay', 'hmrc_rti', 'open_banking', 'edi'])
export type ConnectorKey = z.infer<typeof ConnectorKey>

export const ConnectorHealthSchema = z.object({
  key: ConnectorKey,
  healthy: z.boolean(),
  checkedAt: z.string(),
})
export type ConnectorHealth = z.infer<typeof ConnectorHealthSchema>


