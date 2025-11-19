Last updated: 2025-11-16

Purpose
- Centralise Nexa AI usage via a single server-side client, add read-only AI tasks with guardrails, and surface suggestions safely. No schema changes. No writes.

Inventory (existing AI)
- Client/UI: `apps/web/src/lib/ai/AIProvider.tsx` (client-side stub), `apps/web/src/components/ai/*`, AI pages under `app/(app)/ai/*`.
- Env vars: `OPENAI_API_KEY` present for provider; no renaming performed.
- Existing governance helpers: `apps/web/src/lib/ai/governance.ts`.

What will be wrapped/centralised
- A new server-side `NexaAiClient` that any server AI feature uses. It respects flags, RBAC/tenancy, and logs telemetry.
- Legacy client-side hints remain, but server tasks route through the new abstraction.

Read-only scope
- Phase 12 is strictly read-only: no writes/mutations; no schema changes; no new tables.
- Event-driven tasks will be API-triggered only (Phase 18 adds the event bus).

Prompt library
- Versioned prompts under `apps/web/src/server/ai/prompts/`:
  - finance.ts: reconciliation, GL anomalies, commentary
  - inventory.ts: stock anomalies
  - payroll.ts: payroll anomalies
- Prompts state read-only analysis, RBAC/tenancy respect, and minimal PII.

Pseudonymisation
- Helpers in `apps/web/src/server/ai/pseudo.ts` removing names/emails/phones/addresses/notes; retains amounts/dates/statuses/codes.

Telemetry
- `recordAiTelemetry` logs call metadata (tenantId, module, task, latency, tokens if known, error).

Guardrails
- `AI_ENGINE_ENABLED` flag gates all server AI tasks.
- All tasks use tenancy/RBAC and return supported:false when disabled or schema gaps exist.


