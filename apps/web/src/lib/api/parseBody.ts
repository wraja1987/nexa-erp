export async function parseBody<T = unknown>(req: Request): Promise<T> {
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  try {
    const c = req.clone()
    if (ct.includes('application/json')) {
      return (await c.json()) as T
    }
  } catch {}
  try {
    const c2 = req.clone()
    const txt = await c2.text()
    if (!txt) return {} as T
    // Try JSON first
    try {
      return JSON.parse(txt) as T
    } catch {}
    // Fallback to URL-encoded or query-like strings
    if (ct.includes('application/x-www-form-urlencoded') || txt.includes('=')) {
      const params = new URLSearchParams(txt)
      const obj: Record<string, string> = {}
      params.forEach((v, k) => (obj[k] = v))
      return obj as unknown as T
    }
    return {} as T
  } catch {
    return {} as T
  }
}


