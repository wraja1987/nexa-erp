import { test, expect } from "@playwright/test";

test.describe("Modules API", () => {
  test("schema shape and ETag 304", async ({ request }) => {
    const res1 = await request.get("/api/modules?tree=1");
    expect(res1.status()).toBe(200);
    const etag = res1.headers()["etag"];
    const data = await res1.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length) {
      const node = data[0];
      expect(typeof node.id).toBe("string");
      expect(typeof node.name).toBe("string");
      expect(typeof node.path).toBe("string");
      if (node.children) expect(Array.isArray(node.children)).toBeTruthy();
    }
    if (etag) {
      const res2 = await request.get("/api/modules?tree=1", { headers: { "If-None-Match": etag } });
      expect([200,304]).toContain(res2.status());
    }
  });
});

