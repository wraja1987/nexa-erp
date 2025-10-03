import { test, expect } from "@playwright/test";
const PORT = process.env.PORT || "3010";
const RL_HEADERS = { "X-RL-Max": "5", "X-RL-Window": "10" };

test("bursts yield 429 (deterministic with header overrides)", async ({ request }) => {
  let got429 = false;
  for (let i = 0; i < 20; i++) {
    const r = await request.get(`http://localhost:${PORT}/api/kpi/dashboard`, { headers: RL_HEADERS });
    if (r.status() === 429) { got429 = true; break; }
  }
  expect(got429).toBeTruthy();
});

test("idempotent write returns 201 then 202", async ({ request }) => {
  const url = `http://localhost:${PORT}/api/example/write`;
  const r1 = await request.post(url, { headers: { "Idempotency-Key": "play-abc123", ...RL_HEADERS } });
  expect(r1.status()).toBe(201);
  const r2 = await request.post(url, { headers: { "Idempotency-Key": "play-abc123", ...RL_HEADERS } });
  const s2 = r2.status();
  expect([200,202]).toContain(s2);
  const j2 = await r2.json();
  expect(Boolean(j2.deduped)).toBeTruthy();
});
