# Phase 18 — Event Bus + Outbox

**Status**: ✅ Complete (Task 8 Gap Closure)  
**Last Updated**: 2025-01-18

---

## Overview

Phase 18 implements a durable event outbox pattern using the `OutboxEvent` Prisma model. All events published via `publishWithOutbox` are persisted to the database before being dispatched to in-process handlers, enabling reliable replay and audit.

---

## Implementation

### Outbox Repository (`apps/web/src/server/events/outboxRepository.ts`)

**Status**: ✅ Fully DB-backed

- `enqueueOutboxEvent(event)` — Writes events to `OutboxEvent` table with status "pending"
- `fetchPendingOutboxBatch(limit, options)` — Queries pending events with filters (type, tenantId, since)
- `markOutboxEventProcessed(id, status, errorMessage)` — Updates event status (published/failed) with retry logic
- `getOutboxEvent(id)` — Retrieves single event by ID
- `listOutboxEvents(options)` — Paginated listing with filters

**Features**:
- Exponential backoff retry (max 3 attempts)
- Status tracking: pending → published/failed
- Error message storage for failed events
- Tenant-aware queries

### Event Publisher (`apps/web/src/server/events/publisher.ts`)

**Status**: ✅ Fully DB-backed

- `publishWithOutbox(event)` — Always writes to outbox first, then dispatches to in-process handlers
- Outbox write failures are logged but don't block immediate processing
- Correlation/trace IDs propagated from request context

### Consumer Runner (`apps/web/src/server/events/consumerRunner.ts`)

**Status**: ✅ Fully DB-backed

- `processOutboxBatch(options)` — Processes pending events with filters
- `runOutboxConsumersOnce(limit)` — Convenience wrapper for batch processing
- `replayOutboxEvents(ids)` — Replays specific events by ID

**Idempotency**: All handlers must be idempotent. The runner re-publishes events through the same bus, so handlers should check for existing records before creating duplicates.

### API Routes

**Status**: ✅ Fully DB-backed

#### `/api/events/list` (GET)
- **RBAC**: `ui:admin:super` only
- **Query params**: `type`, `status`, `since`, `limit`, `offset`
- **Returns**: Paginated list of outbox events with metadata

#### `/api/events/replay` (POST)
- **RBAC**: `ui:admin:super` only
- **Body**: `{ limit?, type?, since?, ids? }`
- **Returns**: `{ processed, failed, remaining }`
- Supports batch replay (filters) or specific IDs replay

---

## Schema

### OutboxEvent Model

```prisma
model OutboxEvent {
  id            String    @id @default(cuid())
  tenantId      String
  type          String
  payload       Json
  status        String    @default("pending") // pending, published, failed
  attempts      Int       @default(0)
  maxAttempts   Int       @default(3)
  nextAttemptAt DateTime?
  publishedAt   DateTime?
  error         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([tenantId, status, nextAttemptAt])
  @@index([tenantId, type])
}
```

---

## Task 8 Gap Closure

### Removed
- ✅ All `supported:false` schema gap stubs
- ✅ All 501 status codes in event API routes
- ✅ All "schema gap" messages in event code paths

### Implemented
- ✅ Full DB-backed outbox persistence
- ✅ Replay + inspection APIs working end-to-end
- ✅ Idempotent consumer runner
- ✅ RBAC protection on admin APIs
- ✅ Retry logic with exponential backoff
- ✅ Error tracking and reporting

---

## Testing

### Manual Testing
1. Publish an event via `publishWithOutbox`
2. Verify it appears in `/api/events/list` with status "pending"
3. Run `/api/events/replay` to process the batch
4. Verify event status changes to "published"
5. Replay the same event — handlers should be idempotent (no duplicates)

### Idempotency Verification
All event handlers must:
- Check for existing records before creating
- Use upsert operations where appropriate
- Avoid side effects that can't be safely repeated

---

## Notes

- Outbox persistence is best-effort: failures are logged but don't block immediate event processing
- Events are processed in order (FIFO) within each tenant
- Failed events are retried with exponential backoff (max 3 attempts)
- After max attempts, events are marked as "failed" and require manual intervention
