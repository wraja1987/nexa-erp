import { audit } from '../log/mask'

export function enforceTokenCaps(input: string, maxTokens: number): string {
  const cap = Math.max(0, Math.floor(maxTokens))
  if (!Number.isFinite(cap) || cap === 0) return ''
  // Approximate: treat 4 chars ~ 1 token for demo purposes
  const maxChars = cap * 4
  return input.length > maxChars ? input.slice(0, maxChars) : input
}

export function recordEvaluation(name: string, meta: Record<string, unknown> = {}): void {
  audit({ route: '/ai/eval', session: 'eval', ip: '0.0.0.0', name, ...meta })
}


