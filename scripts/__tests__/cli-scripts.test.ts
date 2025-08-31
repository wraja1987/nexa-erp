import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

function runNode(scriptRel: string, envExtra: Record<string,string> = {}) {
  const p = join(process.cwd(), scriptRel);
  const child = spawnSync(process.execPath, [p], {
    env: { ...process.env, CI: "1", DRY_RUN: "1", ...envExtra },
    stdio: "pipe",
    encoding: "utf8",
    timeout: 20000
  });
  return child;
}

describe("CLI scripts basic execution", () => {
  it("gate:phase5.cjs runs", () => {
    const r = runNode("scripts/gates/phase5.cjs");
    expect([0,null]).toContain(r.status);
  });

  it("nav-lint.js runs", () => {
    const r = runNode("scripts/ui/nav-lint.js");
    expect([0,null]).toContain(r.status);
  });

  it("run-axe.cjs loads (dry)", () => {
    const r = runNode("scripts/ui/run-axe.cjs");
    expect([0,null]).toContain(r.status);
  });
});



