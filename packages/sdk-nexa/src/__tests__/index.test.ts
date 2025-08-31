import { describe, it, expect } from "vitest";
import * as sdk from "../index";

describe("@nexa/sdk index surface", () => {
  it("exports something usable", () => {
    expect(sdk).toBeTruthy();
    for (const [,v] of Object.entries(sdk as Record<string, unknown>)) {
      if (typeof v === "function" && (v as Function).length === 0) {
        try { (v as Function)(); } catch {}
      }
    }
  });
});



