import { describe, it, expect } from "vitest";
import { canStart, canComplete, canCancel } from "@/lib/manufacturing/lifecycle";

describe("work order lifecycle guards", () => {
  it("start only from planned", () => {
    expect(canStart("planned")).toBe(true);
    expect(canStart("released")).toBe(false);
    expect(canStart("completed")).toBe(false);
    expect(canStart("cancelled")).toBe(false);
  });
  it("complete only from released", () => {
    expect(canComplete("released")).toBe(true);
    expect(canComplete("planned")).toBe(false);
  });
  it("cancel from planned or released", () => {
    expect(canCancel("planned")).toBe(true);
    expect(canCancel("released")).toBe(true);
    expect(canCancel("completed")).toBe(false);
  });
});


