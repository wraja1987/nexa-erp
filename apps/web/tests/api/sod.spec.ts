import request from "supertest";

// These tests hit a running server (TEST_BASE_URL or local dev)
const base = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("Separation of duties — role change", () => {
  test("ADMIN cannot grant SUPER_ADMIN (403)", async () => {
    const res = await request(base)
      .post("/api/admin/users/role")
      .set("content-type", "application/json")
      // In non-production, guard honors x-role; in production it's ignored
      .set("x-role", "ADMIN")
      .send({ userId: "some-user", role: "SUPER_ADMIN" });
    expect([401, 403]).toContain(res.status); // 403 in dev/test; 401/403 in prod without session
  });

  test("Cross-tenant role change is rejected (401/403)", async () => {
    const res = await request(base)
      .post("/api/admin/users/role")
      .set("content-type", "application/json")
      .set("x-role", "SUPER_ADMIN")
      .send({ userId: "some-user", role: "ADMIN", tenantId: "wrong" });
    expect([401, 403]).toContain(res.status);
  });
});



