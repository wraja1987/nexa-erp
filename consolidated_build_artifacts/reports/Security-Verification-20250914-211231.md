# Nexa Security & Compliance — End-to-End Verification

- Date: 2025-09-14T20:12:31.926Z
- Passed: 5
- Failed: 2

## Results
- **ENV: DATABASE_URL present** — OK
- **ENV: NEXA_KMS_MASTER present (base64 32B)** — FAIL — NEXA_KMS_MASTER missing
- **DR: RPO seconds** — OK — {"rpoSec":0}
- **DR: backup/restore/report** — OK
- **Retention: job audited** — OK
- **BYOK: info/verify/rotate/verify** — FAIL — Command failed: pnpm -s byok:info -- demo-tenant
Error: NEXA_KMS_MASTER not set (base64 32 bytes).
    at master (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/crypto.ts:5:19)
    at wrapDEK (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/crypto.ts:12:14)
    at ensureTenantKey (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/service.ts:15:15)
    at main (/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/api/src/lib/byok/cli.ts:13:5)

- **GDPR/PECR: pages + consent gate** — OK

## Artefacts
- DR Report: latest `reports/DR-Report-*.md`
- Backups: `reports/backup-*.sql`
- Audit trail: `reports/audit.jsonl`

> Re-run: `pnpm sec:verify`
