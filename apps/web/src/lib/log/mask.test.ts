import { describe, it, expect } from "vitest";
import { maskPII, safeAudit } from "./mask";

describe("maskPII & safeAudit", () => {
  it("masks IPv4 and long tokens", () => {
    expect(maskPII("1.2.3.4")).toBe("1.xxx.xxx.xxx");
    expect(maskPII("abcdEFGH1")).toMatch(/^abcd\*{4}$/);
  });

  it("safeAudit sets hasMasked and redacts fields", () => {
    const out = safeAudit({ ip: "9.8.7.6", session: "SESSabcd1234", route: "/x" });
    expect(out.hasMasked).toBe(true);
    expect(out.ip).toBe("9.xxx.xxx.xxx");
    expect(String(out.session)).toMatch(/^SESS\*{4}$/);
  });
});


