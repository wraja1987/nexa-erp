export function apiSafe<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...a: any[]) => {
    try { return await fn(...a); } catch (e) { throw e; }
  }) as T;
}
// Back-compat alias some files use
export const safe = apiSafe;
export default apiSafe;
