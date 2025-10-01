type Entry<T> = { value: T; expires: number; tags: Set<string> };
const store = new Map<string, Entry<any>>();

function now() { return Date.now(); }

export function setCache<T>(key: string, value: T, seconds: number, tags: string[] = []) {
  store.set(key, { value, expires: now() + seconds*1000, tags: new Set(tags) });
}

export function getCache<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (e.expires < now()) { store.delete(key); return undefined; }
  return e.value as T;
}

export function revalidateTags(tags: string[]) {
  if (!tags.length) return 0;
  let removed = 0;
  for (const [k, e] of store.entries()) {
    for (const t of tags) {
      if (e.tags.has(t)) { store.delete(k); removed++; break; }
    }
  }
  return removed;
}
