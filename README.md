## Security & Compliance — Ops

- **Backups & DR**
  - `pnpm dr:run` → backup, restore to temp DB, produce `/reports/DR-Report-*.md`.
  - Separate: `pnpm dr:backup`, `pnpm dr:restore`, `pnpm dr:report`.
  - Audit: `reports/audit.jsonl`.

- **Retention**
  - `.env`: `RETENTION_LOG_DAYS=90`, `RETENTION_TRASH_DAYS=30`
  - Run: `pnpm jobs:retention:run` (schedule daily 02:00 on server).

- **BYOK**
  - Set `NEXA_KMS_MASTER` (base64 32 bytes). Dev sample: `openssl rand -base64 32`
  - `pnpm byok:info -- <tenantId>` | `pnpm byok:verify -- <tenantId>` | `pnpm byok:rotate -- <tenantId>`

- **PECR/GDPR**
  - `pnpm gdpr:check` → expect `{ "okPages": true, "plausibleGated": true }`.

## Suggested cron (server)
- `0 2 * * * cd /opt/nexa && pnpm jobs:retention:run >> /var/log/nexa-retention.log 2>&1`
- `0 3 * * * cd /opt/nexa && pnpm dr:backup >> /var/log/nexa-backup.log 2>&1`

# V5 Ultra ERP

Phase 0 scaffold for the Final Patched+++ benchmark.

Commands:

- pnpm -w lint && pnpm -w typecheck && pnpm -w test && pnpm -w cov && pnpm -w a11y && pnpm -w gate:phase0

## Performance & Ops Baseline (Nexa)
- **Lighthouse gates**: performance ≥ 0.85, accessibility ≥ 0.90  
  ```bash
  cd apps/web
  pnpm verify:lh
  ```
- **Sentry smoke**  
  ```bash
  cd apps/web
  pnpm sentry:smoke
  ```
- **Env check**  
  ```bash
  cd apps/web
  pnpm verify:envs
  ```



## Documentation

- [Nexa ERP Documents](./Nexa%20ERP%20Documents)
- [Runbook (Operations)](./Nexa%20ERP%20Documents/RUNBOOK.md)
- [Docs index](./docs/README.md)

### Quick checks
- Dev: http://localhost:3001
- Verify modules: \n- UI smoke: \n- E2E: \n- Probes: \, \, \n
