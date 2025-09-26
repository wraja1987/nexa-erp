# Nexa Security & Compliance — End-to-End Verification

- Date: 2025-09-14T19:59:39.051Z
- Passed: 2
- Failed: 4

## Results
- **ENV: DATABASE_URL present** — OK
- **ENV: NEXA_KMS_MASTER present (base64 32B)** — FAIL — NEXA_KMS_MASTER missing
- **DR: backup/restore/report** — FAIL — Command failed: pnpm -s dr:run
node:internal/errors:865
  const err = new Error(message);
              ^

Error: Command failed: pg_dump --no-owner --no-privileges --format=plain "postgresql://postgres@localhost:5432/nexa?schema=public" > reports/backup-20250914-205937.sql
pg_dump: error: invalid URI query parameter: "schema"

    at __node_internal_genericNodeError (node:internal/errors:865:15)
    at checkExecSyncError (node:child_process:890:11)
    at execSync (node:child_process:962:15)
    at shell (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/tools/drill.ts:15:38)
    at backup (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/tools/drill.ts:29:3)
    at <anonymous> (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/tools/drill.ts:82:8)
    at Object.<anonymous> (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/tools/drill.ts:82:39)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at Object.transformer (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/node_modules/.pnpm/tsx@4.20.4/node_modules/tsx/dist/register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1203:32) {
  status: 1,
  signal: null,
  output: [
    null,
    Buffer(0) [Uint8Array] [],
    Buffer(54) [Uint8Array] [
      112, 103,  95, 100, 117, 109, 112,  58,  32, 101,
      114, 114, 111, 114,  58,  32, 105, 110, 118,  97,
      108, 105, 100,  32,  85,  82,  73,  32, 113, 117,
      101, 114, 121,  32, 112,  97, 114,  97, 109, 101,
      116, 101, 114,  58,  32,  34, 115,  99, 104, 101,
      109,  97,  34,  10
    ]
  ],
  pid: 5609,
  stdout: Buffer(0) [Uint8Array] [],
  stderr: Buffer(54) [Uint8Array] [
    112, 103,  95, 100, 117, 109, 112,  58,  32, 101,
    114, 114, 111, 114,  58,  32, 105, 110, 118,  97,
    108, 105, 100,  32,  85,  82,  73,  32, 113, 117,
    101, 114, 121,  32, 112,  97, 114,  97, 109, 101,
    116, 101, 114,  58,  32,  34, 115,  99, 104, 101,
    109,  97,  34,  10
  ]
}

Node.js v18.20.7

- **Retention: job audited** — OK
- **BYOK: info/verify/rotate/verify** — FAIL — Command failed: pnpm -s byok:info -- demo-tenant
Error: NEXA_KMS_MASTER not set (base64 32 bytes).
    at master (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/crypto.ts:5:19)
    at wrapDEK (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/crypto.ts:12:14)
    at ensureTenantKey (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/service.ts:15:15)
    at main (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/cli.ts:13:5)

- **GDPR/PECR: pages + consent gate** — FAIL — Plausible not gated by consent

## Artefacts
- DR Report: latest `reports/DR-Report-*.md`
- Backups: `reports/backup-*.sql`
- Audit trail: `reports/audit.jsonl`

> Re-run: `pnpm sec:verify`
