import { describe, it, expect } from "vitest";
import * as sessions from "@/server/pos/sessions";
import * as cashup from "@/server/pos/cashup";
import * as variance from "@/server/pos/variance";
import * as promotions from "@/server/pos/promotions";
import * as reports from "@/server/pos/reports";

describe("POS scaffolding", () => {
  it("sessions exports exist", () => {
    expect(typeof sessions.listSessions).toBe("function");
    expect(typeof sessions.getSession).toBe("function");
  });
  it("cashup/reports exports exist", () => {
    expect(typeof cashup.getCashupPreview).toBe("function");
    expect(typeof reports.getZReport).toBe("function");
    expect(typeof reports.getXReport).toBe("function");
  });
  it("variance/promotions exports exist", () => {
    expect(typeof variance.listVariances).toBe("function");
    expect(typeof promotions.listPromotions).toBe("function");
  });
});


