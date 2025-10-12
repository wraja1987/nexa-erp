export function apiSafe<T extends (...a: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try { return await fn(...args) as any; }
    catch (err) { throw err; }
  }) as T;
}
export const safe = apiSafe;
