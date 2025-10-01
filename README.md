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

- [Nexa ERP Documents — Index](./Nexa%20ERP%20Documents/00-INDEX.md)
- [Runbook (Operations)](./Nexa%20ERP%20Documents/RUNBOOK.md)
- [01 Overview](./Nexa%20ERP%20Documents/01-Overview.md)
- [02 Architecture](./Nexa%20ERP%20Documents/02-Architecture.md)
- [03 Processes](./Nexa%20ERP%20Documents/03-Processes.md)
- [04 Data Schema and Contracts](./Nexa%20ERP%20Documents/04-Data-Schema-and-Contracts.md)
- [05 Security and Compliance](./Nexa%20ERP%20Documents/05-Security-and-Compliance.md)
- [06 Operations and Monitoring](./Nexa%20ERP%20Documents/06-Operations-and-Monitoring.md)
- [07 Deployment and Environments](./Nexa%20ERP%20Documents/07-Deployment-and-Environments.md)
- [08 Verification and Testing](./Nexa%20ERP%20Documents/08-Verification-and-Testing.md)
- [09 Branch Discipline and Workflow](./Nexa%20ERP%20Documents/09-Branch-Discipline-and-Workflow.md)
- [10 User Manuals](./Nexa%20ERP%20Documents/10-User-Manuals.md)
- [11 How To Guides](./Nexa%20ERP%20Documents/11-How-To-Guides.md)
- [12 Glossary](./Nexa%20ERP%20Documents/12-Glossary.md)
- [13 Change Log Template](./Nexa%20ERP%20Documents/13-Change-Log-Template.md)
- how-to/
  - [Add User](./Nexa%20ERP%20Documents/how-to/Add-User.md)
  - [Check KPIs](./Nexa%20ERP%20Documents/how-to/Check-KPIs.md)
  - [Login](./Nexa%20ERP%20Documents/how-to/Login.md)
  - [Reset Password](./Nexa%20ERP%20Documents/how-to/Reset-Password.md)
  - [Run Backup](./Nexa%20ERP%20Documents/how-to/Run-Backup.md)
- user-manuals/
  - [Admin Guide](./Nexa%20ERP%20Documents/user-manuals/Admin-Guide.md)
  - [Standard User Guide](./Nexa%20ERP%20Documents/user-manuals/Standard-User-Guide.md)
  - [Super Admin Guide](./Nexa%20ERP%20Documents/user-manuals/Super-Admin-Guide.md)

### Quick checks
- Dev: http://localhost:3001
- Verify modules: pnpm -w verify:modules
- UI smoke: pnpm -w verify:ui
- E2E: pnpm -w test:e2e -- --run
- Probes: curl -sf http://localhost:3001/login, curl -sf http://localhost:3001/dashboard, curl -sf "http://localhost:3001/api/modules?tree=1"
