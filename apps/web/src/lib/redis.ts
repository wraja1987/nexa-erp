import { createClient, RedisClientType } from 'redis'

let client: RedisClientType | null = null

export function getRedis(): RedisClientType | null {
  if (client) return client
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
  if (!url) return null
  try {
    client = createClient({ url })
    client.on('error', () => {})
    // Connect lazily; callers should await ensureRedis()
  } catch {
    client = null
  }
  return client
}

export async function ensureRedis(): Promise<RedisClientType | null> {
  const c = getRedis()
  if (!c) return null
  if (!c.isOpen) {
    try {
      await c.connect()
    } catch {
      return null
    }
  }
  return c
}






