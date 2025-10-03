import { test, expect } from "@playwright/test";
const PORT = process.env.PORT || "3010";
test("rate limit bursts eventually 429s", async ({ request }) => {
  let got429 = false;
  for (let i = 0; i < 120; i++) {
    const r = await request.get(`http://localhost:${PORT}/api/kpi/dashboard`);
    if (r.status() === 429) { got429 = true; break; }
  }
  expect(got429).toBeTruthy();
});
test("idempotent write: 201 then 202", async ({ request }) => {
  const url = `http://localhost:${PORT}/api/example/write`;
  let r1 = await request.post(url, { headers: { "Idempotency-Key": "abc123" }});
  expect(r1.status()).toBe(201);
  let r2 = await request.post(url, { headers: { "Idempotency-Key": "abc123" }});
  expect([200,202]).toContain(r2.status());
  const j = await r2.json();
  expect(j.deduped).toBeTruthy();
});
