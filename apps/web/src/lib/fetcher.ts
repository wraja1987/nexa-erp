export async function safeJson<T=any>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export async function getJSON<T=any>(url: string, fallback?: T): Promise<T> {
  try { return await safeJson<T>(await fetch(url, { cache: "no-store" })); }
  catch (e) { if (fallback !== undefined) return fallback as T; throw e; }
}
