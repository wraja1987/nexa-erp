export function loadExpanded(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(`ns:sb:${userId}`) || "[]"); } catch { return []; }
}
export function saveExpanded(userId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(`ns:sb:${userId}`, JSON.stringify(ids)); } catch {}
}
