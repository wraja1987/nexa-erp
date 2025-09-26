import crypto from "crypto";

function master(): Buffer {
  const b64 = process.env.NEXA_KMS_MASTER;
  if (!b64) throw new Error("NEXA_KMS_MASTER not set (base64 32 bytes).");
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) throw new Error("NEXA_KMS_MASTER must be 32 bytes.");
  return buf;
}

export function wrapDEK(dek: Buffer): Buffer {
  const mk = master();
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", mk, iv);
  const ct = Buffer.concat([c.update(dek), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([iv, tag, ct]);
}

export function unwrapDEK(wrapped: Buffer): Buffer {
  const mk = master();
  const iv = wrapped.subarray(0,12);
  const tag = wrapped.subarray(12,28);
  const ct = wrapped.subarray(28);
  const d = crypto.createDecipheriv("aes-256-gcm", mk, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]);
}

export function encryptWithDEK(dek: Buffer, data: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const ct = Buffer.concat([c.update(data), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([iv, tag, ct]);
}

export function decryptWithDEK(dek: Buffer, wrapped: Buffer): Buffer {
  const iv = wrapped.subarray(0,12);
  const tag = wrapped.subarray(12,28);
  const ct = wrapped.subarray(28);
  const d = crypto.createDecipheriv("aes-256-gcm", dek, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]);
}







