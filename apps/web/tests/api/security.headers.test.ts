import request from "supertest";
import { describe, test, expect } from "vitest";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Security headers (app)", () => {
  test("HSTS and other headers present; CSP if present should not use unsafe-inline", async () => {
    const res = await request(base).get("/").set("accept", "text/html");
    expect(res.status).toBeLessThan(500);
    const hsts = res.headers["strict-transport-security"];
    const xcto = res.headers["x-content-type-options"];
    const refpol = res.headers["referrer-policy"];
    expect(hsts).toBeTruthy();
    expect(xcto).toBeTruthy();
    expect(refpol).toBeTruthy();
    const csp = res.headers["content-security-policy"];
    if (csp) {
      expect(csp).not.toMatch(/unsafe-inline/);
    }
  });
});


