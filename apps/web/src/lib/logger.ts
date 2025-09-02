/* eslint-disable no-console */
import { randomUUID } from 'node:crypto'

export type LogLevel = 'info' | 'warn' | 'error'

function redact(value: unknown): unknown {
  if (typeof value !== 'string') return value
  return value.replace(/(sk_live|sk_test|whsec|Bearer\s+[A-Za-z0-9._-]+)/g, '****')
}

export function withCorrelation<T extends object>(obj?: T): T & { correlationId: string } {
  const id: string = randomUUID()
  return { ...((obj || {}) as object), correlationId: id } as T & { correlationId: string }
}

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const safe: Record<string, unknown> = {}
  if (meta) {
    for (const [k, v] of Object.entries(meta)) safe[k] = redact(v)
  }
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, message, ...safe }))
}

export function audit(event: string, meta?: Record<string, unknown>) {
  log('info', `[audit] ${event}`, { ...(meta || {}), hasMasked: true })
}


