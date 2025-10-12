// Tiny try/catch wrapper used by some API routes
export function apiSafe<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...a: any[]) => {
    try { return await fn(...a); } catch (err) { throw err; }
  }) as T;
}
// Some places import `safe`
export const safe = apiSafe;
export default apiSafe;
