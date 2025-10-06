# Nexa ERP – Incident Response Runbook

## 1. Purpose
Defines how to detect, triage, mitigate, and resolve incidents in production.

## 2. Detection
Triggered via Prometheus Alertmanager, logs, uptime monitors, or manual reports.

## 3. Response Steps
1. **Acknowledge** the alert email.
2. **Identify** the affected system (API, DB, website, etc.).
3. **Mitigate** immediate user impact (restart service, scale up, restore backup).
4. **Communicate** status to the escalation list if SEV-1/2.
5. **Document** all actions in the post-mortem template.

## 4. Recovery
Confirm service stability for at least 15 minutes, monitor KPIs, close alert.

## 5. Logging
Every incident is recorded in `reports/audit-oncall-<date>.md` with timestamp.
