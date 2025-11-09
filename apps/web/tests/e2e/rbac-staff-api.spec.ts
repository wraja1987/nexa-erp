import { test, expect, request as pwRequest } from "@playwright/test";

test("STAFF cannot call admin role change API", async () => {
  const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
  const ctx = await pwRequest.newContext({ baseURL, storageState: "tests/e2e/.auth/staff.json" });
  const res = await ctx.post("/api/admin/users/role", {
    headers: { "content-type": "application/json" },
    data: { userId: "u1", role: "ADMIN" },
  });
  expect(res.status()).toBe(403);
  await ctx.dispose();
});
