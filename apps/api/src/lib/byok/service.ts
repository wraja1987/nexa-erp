import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { wrapDEK, unwrapDEK } from "./crypto";
import { Audit } from "../audit";

const prisma = new PrismaClient();

export async function ensureTenantKey(tenantId: string) {
  const found = await prisma.$queryRawUnsafe<any[]>(
    "SELECT enc_key FROM tenant_keys WHERE tenant_id=$1",
    tenantId
  );
  if (found.length) return true;
  const dek = randomBytes(32);
  const enc = wrapDEK(dek);
  await prisma.$executeRawUnsafe(
    "INSERT INTO tenant_keys (tenant_id, enc_key) VALUES ($1, $2)",
    tenantId, enc
  );
  Audit.audit({ type: "byok.ensure", actor: "system", tenantId, ok: true, target: "tenant_keys" });
  return true;
}

export async function getTenantDEK(tenantId: string): Promise<Buffer> {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT enc_key FROM tenant_keys WHERE tenant_id=$1",
    tenantId
  );
  if (!rows.length) throw new Error("No tenant key present");
  return unwrapDEK(rows[0].enc_key);
}

export async function rotateTenantKey(tenantId: string) {
  const newDek = randomBytes(32);
  const enc = wrapDEK(newDek);
  await prisma.$executeRawUnsafe(
    "UPDATE tenant_keys SET enc_key=$2, version=version+1, rotated_at=NOW() WHERE tenant_id=$1",
    tenantId, enc
  );
  Audit.audit({ type: "byok.rotate", actor: "job:byok", tenantId, ok: true, target: "tenant_keys" });
}




