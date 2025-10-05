import { test, expect } from "@playwright/test";
const PORT = process.env.PORT || "3010"; const BASE = `http://localhost:${PORT}`;

test.beforeAll(async ({ request }) => { for (let i=0;i<80;i++){ const r = await request.get(`${BASE}/api/health`); if (r.status()===200) break; await new Promise(r=>setTimeout(r,200)); } await request.get(`${BASE}/api/test/rl-reset`); });

test("bursts yield 429 via probe (deterministic)", async ({ request }) => {
  const hdr = { "X-RL-Max": "3", "X-RL-Window": "8", "X-Forwarded-For": "203.0.113.10", "X-Test-IP": "203.0.113.10" };
  const statuses:number[] = [];
  for (let i=0;i<6;i++){ const r = await request.get(`${BASE}/api/test/rl-probe`, { headers: hdr }); statuses.push(r.status()); }
  expect(statuses.some(s => s === 429)).toBeTruthy();
});

test("idempotent write returns 201 then 202", async ({ request }) => {
  const url = `${BASE}/api/example/write`; const hdr = { "Idempotency-Key": "play-fixed-123", "X-RL-Bypass": "1" };
  const r1 = await request.post(url, { headers: hdr }); expect(r1.status()).toBe(201);
  const r2 = await request.post(url, { headers: hdr }); expect([200,202]).toContain(r2.status());
  const j2 = await r2.json(); expect(Boolean(j2.deduped)).toBeTruthy();
});
