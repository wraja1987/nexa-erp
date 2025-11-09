import request from "supertest";
import { describe, test, expect } from "vitest";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const hasBase = Boolean(process.env.TEST_BASE_URL);
const t = hasBase ? test : test.skip;

describe("Finance GL APIs", () => {
  t("trial balance returns 200", async () => {
    const res = await request(base).get("/api/finance/reports/trial-balance").set("x-role", "SUPER_ADMIN");
    expect(res.status).toBe(200);
    expect(res.body?.ok).toBe(true);
  });

  t("post journal accepts balanced entry", async () => {
    const payload = {
      lines: [
        { accountCode: "TEST-CASH", debitMinor: 1000 },
        { accountCode: "TEST-REV", creditMinor: 1000 },
      ],
    };
    const res = await request(base).post("/api/finance/gl/post").set("x-role", "SUPER_ADMIN").send(payload);
    expect(res.status).toBe(200);
    expect(res.body?.ok).toBe(true);
    expect(res.body?.entry?.id).toBeTruthy();
  });
});


