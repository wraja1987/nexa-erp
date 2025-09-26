# Nexa Security & Compliance — End-to-End Verification

- Date: 2025-09-14T20:14:47.686Z
- Passed: 7
- Failed: 0

## Results
- **ENV: DATABASE_URL present** — OK
- **ENV: NEXA_KMS_MASTER present (base64 32B)** — OK
- **DR: RPO seconds** — OK — {"rpoSec":0}
- **DR: backup/restore/report** — OK
- **Retention: job audited** — OK
- **BYOK: info/verify/rotate/verify** — OK
- **GDPR/PECR: pages + consent gate** — OK

## Artefacts
- DR Report: latest `reports/DR-Report-*.md`
- Backups: `reports/backup-*.sql`
- Audit trail: `reports/audit.jsonl`

> Re-run: `pnpm sec:verify`
