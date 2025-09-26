import { ensureTenantKey, getTenantDEK, rotateTenantKey } from "./service";
import { encryptWithDEK, decryptWithDEK } from "./crypto";

async function main() {
  const cmd = process.argv[2];
  const tenantId = process.argv[3] || "demo-tenant";
  if (!cmd || !["info","rotate","verify"].includes(cmd)) {
    console.log("Usage: ts-node .../cli.ts <info|rotate|verify> <tenantId?>");
    process.exit(1);
  }

  if (cmd === "info") {
    await ensureTenantKey(tenantId);
    const dek = await getTenantDEK(tenantId);
    console.log(JSON.stringify({ tenantId, dekBytes: dek.length }, null, 2));
  }

  if (cmd === "rotate") {
    await ensureTenantKey(tenantId);
    await rotateTenantKey(tenantId);
    console.log(JSON.stringify({ ok: true, tenantId, rotated: true }, null, 2));
  }

  if (cmd === "verify") {
    await ensureTenantKey(tenantId);
    const dek = await getTenantDEK(tenantId);
    const ct = encryptWithDEK(dek, Buffer.from("test-data"));
    const pt = decryptWithDEK(dek, ct).toString("utf8");
    console.log(JSON.stringify({ ok: pt === "test-data", roundTrip: pt }, null, 2));
  }
}

main().catch(e => { console.error(e); process.exit(1); });







