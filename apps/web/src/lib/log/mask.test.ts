import { describe, it, expect } from 'vitest'
import { maskPII, safeAudit } from './mask'

describe('maskPII edge cases', () => {
  it('leaves empty/short tokens intact and masks IPv4', () => {
    expect(maskPII('')).toBe('')
    expect(maskPII('abc')).toBe('abc')
    expect(maskPII('9.8.7.6')).toBe('9.xxx.xxx.xxx')
  })
  it('masks long alphanumerics to first 4 chars + ****', () => {
    expect(maskPII('SESSabcd1234')).toMatch(/^SESS\*{4}$/)
  })
  it('safeAudit marks hasMasked and coalesces non-string inputs', () => {
    const out = safeAudit({ ip: 123, session: null as any, route: '/x' })
    expect(out.hasMasked).toBe(true)
    // Not an IPv4; stringified form is preserved while hasMasked=true
    expect(String(out.ip)).toBe('123')
  })
})

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


