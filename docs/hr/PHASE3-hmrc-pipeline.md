Last updated: 2025-11-16

Purpose
- Capture HMRC RTI/MFPS integration status and what is needed next.

What exists now
- Schema has WebhookSource.hmrc enum, but no RTI submission tables or token storage.
- No HMRC client registration or endpoints configured.

Phase 3 scaffolding (implemented)
- Server module can build an exportable JSON payload for a payroll run.
- An API endpoint returns the payload for download/inspection.
- No network calls to HMRC; export-only.

Gaps (for future task)
- RTI schemas (FPS/EPS) and file formats.
- OAuth/tokens, client registration, endpoints and test environment.
- Secure storage of submissions and acknowledgements.


