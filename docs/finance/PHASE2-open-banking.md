Last updated: 2025-11-16

Purpose
- Document Open Banking status and safe scaffolding only for Phase 2.

What exists now
- Schema: `BankConnection` with provider/status/institutionId/consentId (no live OAuth/token handling).
- No registered client credentials or callback handlers in codebase for production OB flows.

Gaps (require separate integration task)
- OB client registration and dynamic client onboarding (as required).
- Consent flows and redirect URI handling.
- Secure token storage/refresh; data minimisation controls.
- Webhooks for transaction updates; idempotent ingestion.

Phase 2 scaffolding (safe)
- Provide server functions that return supported providers and generate placeholder URLs.
- Callback handler returns 501 unless real integration is wired.


