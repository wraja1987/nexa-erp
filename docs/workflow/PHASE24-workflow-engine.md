# Phase 24 — Workflow Engine (Cross-Module)

**Last updated**: 2025-01-18  
**Status**: ✅ Complete

---

## Purpose

Phase 24 implements a schema-safe, additive workflow engine that can define workflows per tenant/entity type, enforce workflow rules at the application/service layer, emit workflow-related events, and provide workflow history views and a designer UI.

---

## Who Should Read This

- Developers implementing workflow features
- QA engineers testing workflow enforcement
- Product managers reviewing workflow capabilities
- Future schema migration planners

---

## Supported Entities

### Currently Supported (Policy Layer)

1. **Finance Invoices** (`finance.invoice`)
   - States: `draft` → `approved` → `sent` → `part_paid` → `paid` → `void`
   - Transitions: `approve`, `send`, `pay`, `void`
   - Conditions: Role-based (FINANCE_MANAGER), amount-based (approval limits)

2. **Purchase Orders** (`purchasing.po`)
   - States: `draft` → `approved` → `sent` → `received` → `closed` → `cancelled`
   - Transitions: `approve`, `cancel`
   - Conditions: Role-based (PURCHASING_MANAGER), amount-based (approval limits)

3. **Manufacturing Work Orders** (`manufacturing.workorder`)
   - States: `planned` → `released` → `completed` → `cancelled`
   - Transitions: `start` (planned → released), `complete` (released → completed), `cancel`
   - Conditions: Role-based (MANUFACTURING_MANAGER), resource-based (stubbed)

### Future Support (Stubbed)

- HR Timesheets (`hr.timesheet`)
- HR Payroll Runs (`hr.payroll`)
- Sales Quotes (`sales.quote`)
- Sales Orders (`sales.order`)

---

## What Can Be Enforced Now

### Policy Layer Enforcement

**Current Schema Support**:
- ✅ Entity status fields exist (Invoice.status, PurchaseOrder.status, WorkOrder.status)
- ✅ RBAC roles exist (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER)
- ✅ Tenant isolation exists
- ✅ Event bus exists (Phase 18)

**Enforcement Points**:
- ✅ Pre-transition checks (before status change)
- ✅ Role-based conditions (check user role)
- ✅ Amount-based conditions (check entity total against limits)
- ✅ Event emission (workflow.state.changed, workflow.transition.denied)

**Limitations**:
- ❌ No WorkflowDefinition table (definitions are code-based)
- ❌ No WorkflowInstance table (instances are virtual)
- ❌ No WorkflowHistory table (history is event-based only)
- ❌ No WorkflowApproval table (approvals are policy checks only)

---

## Virtual Workflow (Policy Evaluation + Events)

Where persistence isn't possible, we provide:

1. **Workflow Definitions**: Hard-coded in registry (`apps/web/src/server/workflow/registry.ts`)
2. **Workflow Instances**: Virtual (derived from entity status)
3. **Workflow History**: Event-based (via AuditLog + event bus)
4. **Workflow Approvals**: Policy checks (no approval records)

---

## Event Integration

### New Event Types

Added to `apps/web/src/server/events/types.ts`:

```typescript
export interface WorkflowStateChanged extends NexaEventBase {
  type: "workflow.state.changed";
  payload: {
    entityType: string;
    entityId: string;
    fromState: string;
    toState: string;
    action: string;
    actorId: string;
  };
}

export interface WorkflowTransitionDenied extends NexaEventBase {
  type: "workflow.transition.denied";
  payload: {
    entityType: string;
    entityId: string;
    currentState: string;
    attemptedAction: string;
    reason: string;
    actorId: string;
  };
}
```

### Event Usage

- **On successful transition**: Emit `workflow.state.changed`
- **On denied transition**: Emit `workflow.transition.denied`
- **History queries**: Query AuditLog + event bus for workflow events

---

## Approvals Representation

### Conditions

1. **Role-Based**:
   - `role: FINANCE_MANAGER` — User must have FINANCE_MANAGER role
   - `role: ADMIN` — User must be ADMIN or SUPER_ADMIN
   - `role: MANAGER` — User must be MANAGER, ADMIN, or SUPER_ADMIN

2. **Amount-Based**:
   - `amount: < 1000` — Entity total must be less than 1000
   - `amount: >= 1000` — Entity total must be >= 1000 (requires approval)
   - `amount: >= 10000` — Entity total must be >= 10000 (requires higher approval)

3. **Dimension-Based** (Stubbed):
   - `costCentre: OPERATIONS` — Cost centre must match (stubbed, always passes)
   - `department: SALES` — Department must match (stubbed, always passes)

### Approval Limits

- **Low**: < £1,000 — STAFF can approve
- **Medium**: £1,000 - £9,999 — MANAGER required
- **High**: >= £10,000 — ADMIN required

---

## Architecture

### Core Components

1. **Types** (`apps/web/src/server/workflow/types.ts`)
   - WorkflowDefinition, WorkflowState, WorkflowTransition, WorkflowCondition
   - WorkflowContext, WorkflowDecision

2. **Engine** (`apps/web/src/server/workflow/engine.ts`)
   - Pure functions: `evaluateTransition()`, `getAvailableActions()`
   - Side-effect-free policy evaluation

3. **Registry** (`apps/web/src/server/workflow/registry.ts`)
   - Hard-coded workflow definitions per entity type
   - `getWorkflowDefinition()` returns supported flag + definition

4. **Context** (`apps/web/src/server/workflow/context.ts`)
   - Builders: `buildInvoiceContext()`, `buildPoContext()`, `buildWorkOrderContext()`
   - Fetches entities and computes amounts/dimensions

5. **History** (`apps/web/src/server/workflow/history.ts`)
   - Schema-gap stub: `recordWorkflowEvent()` (NOOP + observability)
   - `listWorkflowHistory()` returns event-based history or `supported:false`

### Integration Points

1. **Finance** (`apps/web/src/server/finance/lifecycle.ts`)
   - Wrap `approveCustomerInvoice()` with workflow check
   - Wrap `postCustomerInvoice()` with workflow check

2. **Purchasing** (`apps/web/src/server/purchasing/po.ts`)
   - Wrap `approvePurchaseOrder()` with workflow check
   - Wrap `cancelPurchaseOrder()` with workflow check

3. **Manufacturing** (`apps/web/src/server/manufacturing/workorders.ts`)
   - Wrap `startWorkOrder()` with workflow check
   - Wrap `completeWorkOrder()` with workflow check
   - Wrap `cancelWorkOrder()` with workflow check

### API Layer

1. **Definition** (`/api/workflow/definition`)
   - GET: Returns workflow definition for entity type

2. **Actions** (`/api/workflow/actions`)
   - GET: Returns allowed actions for current state + context

3. **History** (`/api/workflow/history`)
   - GET: Returns workflow history (event-based or schema-gap stub)

### UI Layer

1. **Overview** (`/workflow/overview`)
   - Lists entity types with workflow support
   - Shows status: supported/not supported

2. **Entity Workflow** (`/workflow/entity/[entityType]`)
   - Shows workflow definition (states, transitions)
   - Shows allowed actions for sample record

3. **History** (`/workflow/history/[entityType]/[entityId]`)
   - Shows workflow history (or schema-gap message)

---

## Schema Gaps and Workarounds

### Missing Tables

1. **WorkflowDefinition**
   - **Gap**: No table to store workflow definitions per tenant
   - **Workaround**: Hard-coded definitions in registry
   - **Future**: Add WorkflowDefinition table with tenantId, entityType, definition JSON

2. **WorkflowInstance**
   - **Gap**: No table to track workflow instances
   - **Workaround**: Virtual instances (derived from entity status)
   - **Future**: Add WorkflowInstance table with entityType, entityId, currentState

3. **WorkflowHistory**
   - **Gap**: No dedicated workflow history table
   - **Workaround**: Event-based history (AuditLog + event bus)
   - **Future**: Add WorkflowHistory table with entityType, entityId, fromState, toState, action, actorId, timestamp

4. **WorkflowApproval**
   - **Gap**: No approval records table
   - **Workaround**: Policy checks only (no approval records)
   - **Future**: Add WorkflowApproval table for multi-step approvals

### Schema-Safe Stubs

All persistence operations return `supported:false` with clear "schema gap" messaging when tables don't exist. Policy evaluation works without persistence.

---

## Deliberate Non-Enforced Paths

To avoid breaking existing flows:

1. **Backward Compatibility**: If `getWorkflowDefinition()` returns `supported:false`, skip workflow enforcement (log only)
2. **Existing Lifecycle Functions**: Keep `canTransitionInvoice()`, `canApprove()`, etc. as-is
3. **Additive Only**: Workflow checks are pre-checks, not replacements for existing logic
4. **Graceful Degradation**: If workflow engine fails, fall back to existing behavior

---

## Testing Strategy

1. **Unit Tests**: Engine logic (conditions, transitions)
2. **Integration Tests**: Finance/Purchasing/Manufacturing workflows
3. **UI Tests**: Workflow overview page rendering
4. **Schema Gap Tests**: Verify stubs return `supported:false`

---

## Future Enhancements

1. **Schema Migrations**: Add WorkflowDefinition, WorkflowInstance, WorkflowHistory tables
2. **Multi-Step Approvals**: Support approval chains
3. **Workflow Designer**: Visual workflow builder (requires persistence)
4. **Workflow Templates**: Pre-defined workflows per industry
5. **Workflow Analytics**: Track approval times, bottlenecks

---

**Last Updated**: 2025-01-18

