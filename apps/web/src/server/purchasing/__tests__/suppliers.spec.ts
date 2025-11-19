import { describe, it, expect } from "vitest";
import { canApprove } from "@/lib/purchasing/po-lifecycle";

describe("purchasing scaffolding", () => {
  it("po lifecycle helper available", () => {
    expect(typeof canApprove).toBe("function");
  });
});


