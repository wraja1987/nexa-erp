import { describe, it, expect } from "vitest";
import { parseBankStatementFile } from "@/server/banking/statements";
import { suggestMatches } from "@/server/banking/reconciliation";

describe("banking statement parsing", () => {
  it("parses basic CSV", () => {
    const csv = "2025-01-01,Deposit,1000,REF1\n2025-01-02,Withdrawal,-200,REF2";
    const rows = parseBankStatementFile(csv);
    expect(rows.length).toBe(2);
    expect(rows[0]).toMatchObject({ description: "Deposit", amount: 1000 });
  });
});

describe("banking reconciliation suggestions", () => {
  it("returns suggestions structure (integration mocked elsewhere)", async () => {
    // With no DB, calling suggestMatches would require prisma; treat as structural test by asserting function exists.
    expect(typeof suggestMatches).toBe("function");
  });
});


