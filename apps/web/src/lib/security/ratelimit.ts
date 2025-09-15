const buckets = new Map<string, {ts:number,cnt:number}>();
export const limiter = {
  async check(key: string, max: number, window: "1m"|"5m"|"1h"="1m"){
    const now = Date.now();
    const winMs = window==="1m"?60e3:window==="5m"?300e3:3600e3;
    const b = buckets.get(key);
    if (!b || (now - b.ts) > winMs) { buckets.set(key, { ts: now, cnt: 1 }); return true; }
    if (b.cnt >= max) return false;
    b.cnt++; return true;
  }
}
