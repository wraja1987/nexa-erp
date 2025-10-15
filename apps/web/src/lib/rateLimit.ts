const hits = new Map<string, { count: number; ts: number }>();
// Very light in-memory limiter (per Vercel region instance). Enough to curb abuse.
export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const v = hits.get(key);
  if (!v || now - v.ts > windowMs) {
    hits.set(key, { count: 1, ts: now });
    return true;
  }
  if (v.count >= limit) return false;
  v.count += 1;
  return true;
}



