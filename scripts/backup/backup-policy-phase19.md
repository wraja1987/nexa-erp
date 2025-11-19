Last updated: 2025-11-16

Purpose
- Document backup and retention policy requirements for Phase 19.
- Define encryption and retention requirements per region.

Who should read this
- DevOps engineers configuring backup infrastructure.
- Compliance and security teams.
- Database administrators.

---

## Current Neon Backup Configuration

### Neon Database Backups

- **Provider**: Neon (PostgreSQL managed service)
- **Backup Type**: Continuous (point-in-time recovery)
- **Retention**: 7 days (default Neon plan)
- **Encryption**: At-rest encryption via Neon (managed)
- **Backup Location**: Neon-managed (region-specific)

### Backup Verification

Backup encryption and retention are verified via environment variables:
- `NEXA_BACKUP_ENCRYPTED` — Must be "true" to indicate backups are encrypted
- `NEXA_BACKUP_RETENTION_DAYS` — Retention period in days (minimum 7)

---

## Desired Retention per Region

### UK Region

- **Retention**: 30 days
- **Reason**: GDPR compliance (30-day retention for audit trails)
- **Encryption**: Required (at-rest encryption via Neon)
- **Backup Location**: UK data centers only

### EU Region

- **Retention**: 30 days
- **Reason**: GDPR compliance (30-day retention for audit trails)
- **Encryption**: Required (at-rest encryption via Neon)
- **Backup Location**: EU data centers only

### GCC Region

- **Retention**: 90 days
- **Reason**: Local regulations (longer retention for compliance)
- **Encryption**: Required (at-rest encryption via Neon)
- **Backup Location**: GCC data centers only

### US Region

- **Retention**: 30 days
- **Reason**: Standard compliance (30-day retention)
- **Encryption**: Required (at-rest encryption via Neon)
- **Backup Location**: US data centers only

---

## Backup Encryption Requirements

### Encryption at Rest

- All backups must be encrypted at rest
- Encryption keys must be managed by Neon/cloud provider (separate from application encryption keys)
- Encryption must be verified via `NEXA_BACKUP_ENCRYPTED` environment variable

### Encryption in Transit

- Backups transferred to storage must use TLS 1.2+
- Backup storage must be accessible only via encrypted connections

### Key Management

- Backup encryption keys must be separate from application BYOK keys
- Backup keys must be managed by Neon/cloud provider (not application-managed)
- Backup keys must be rotated according to provider policies

---

## Backup Execution

### Automated Backups

- Neon provides continuous backups (no manual execution required)
- Backups are created automatically on every transaction commit
- Point-in-time recovery is available for the retention period

### Manual Backups

- Manual backups can be created via Neon console or API
- Manual backups should be encrypted and stored in region-specific storage
- Manual backups should follow the same retention policies as automated backups

---

## Retention Policy Enforcement

### Automatic Deletion

- Backups older than the retention period are automatically deleted by Neon
- Deletion is irreversible (backups cannot be recovered after deletion)

### Retention Overrides

- Retention periods can be extended for compliance purposes
- Extended retention must be documented and approved by compliance team
- Extended retention backups must still be encrypted

---

## Backup Verification

### Daily Checks

- Verify backup encryption is enabled (`NEXA_BACKUP_ENCRYPTED=true`)
- Verify retention period is set correctly (`NEXA_BACKUP_RETENTION_DAYS`)
- Verify backups are being created (check Neon console/logs)

### Weekly Checks

- Verify backup restoration process (test restore from backup)
- Verify backup encryption keys are accessible
- Verify backup storage is region-compliant

### Monthly Checks

- Review backup retention policies
- Verify compliance with regional regulations
- Review backup encryption key rotation status

---

## Disaster Recovery

### Recovery Time Objective (RTO)

- **Target**: < 1 hour
- **Method**: Point-in-time recovery via Neon

### Recovery Point Objective (RPO)

- **Target**: < 15 minutes
- **Method**: Continuous backups (transaction-level)

---

## Compliance Requirements

### GDPR (UK/EU)

- Backups must be encrypted at rest
- Backups must be retained for minimum 30 days
- Backups must be deleted after retention period
- Backup access must be logged and auditable

### GCC Regulations

- Backups must be encrypted at rest
- Backups must be retained for minimum 90 days
- Backups must be stored in GCC data centers only

---

## Future Enhancements

### When BackupPolicy Model Exists

- Store backup policies per tenant/region in database
- Track last backup time per tenant
- Enforce retention policies programmatically
- Generate backup compliance reports

### When TenantConfig Model Exists

- Store tenant-specific backup preferences
- Allow tenants to configure retention periods (within limits)
- Track backup compliance per tenant

