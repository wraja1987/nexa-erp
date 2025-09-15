Monitoring & Alerting Posture
-----------------------------
- Prometheus with recording rules and SLOs; Alertmanager sends email via Gmail SMTP.
- External uptime monitors recommended; optional self-hosted Uptime Kuma.

Email Deliverability
--------------------
- SMTP deliverability tested via `scripts/mailer/smtp-test.ts`.
- Validate SPF/DKIM/DMARC in Gmail (Show original) for PASS.

