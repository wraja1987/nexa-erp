# Phase 28 — Agentic AI Foundations (Non-Disruptive Module)

**Last updated**: 2025-01-18  
**Status**: ✅ Complete

---

## Purpose

Implement Agentic AI Foundations as a non-disruptive, read-only layer on top of existing Phase 12 AI infrastructure. This phase adds:
- Read-only tool registry per module
- Agent run/step logging (schema-gap aware)
- Global and per-tenant feature flags
- Minimal Agent Console UI
- Versioned agent prompts and policy docs
- Telemetry extensions
- Internal read-only scenario runner

All features are default-OFF, kill-switchable, and strictly read-only (no writes, no mutations).

---

## Existing AI Infrastructure (Phase 12)

### Core Components
- **AI Client**: `apps/web/src/server/ai/client.ts` — `NexaAiClient.callModel()`
- **Telemetry**: `apps/web/src/server/ai/telemetry.ts` — `recordAiTelemetry()`
- **Config**: `apps/web/src/server/ai/config.ts` — `AI_ENGINE_ENABLED` flag
- **Prompts**: `apps/web/src/server/ai/prompts/*` — Versioned prompts per module
- **Tasks**: `apps/web/src/server/ai/tasks/*` — Read-only AI tasks (reconciliation, anomalies, commentary)

### AI Tasks (Read-Only)
- Finance: Reconciliation, GL anomalies, management commentary
- Inventory: Stock anomalies
- Payroll: Payroll anomalies

---

## Module → Read-Only Tools Mapping

### Finance Module
| Tool Name | Description | Service/API | Read-Only |
|-----------|-------------|-------------|-----------|
| `finance.getOutstandingInvoices` | Get outstanding customer invoices | `getOutstandingInvoices()` | ✅ Yes |
| `finance.getCashPosition` | Get current cash position | Analytics/KPI service | ✅ Yes |
| `finance.getTrialBalance` | Get trial balance | Finance service | ✅ Yes |
| `finance.getReconciliationSuggestions` | Get reconciliation suggestions | `getReconciliationSuggestions()` | ✅ Yes |

### Inventory Module
| Tool Name | Description | Service/API | Read-Only |
|-----------|-------------|-------------|-----------|
| `inventory.getLowStockItems` | Get items below reorder point | Inventory service | ✅ Yes |
| `inventory.getStockLevels` | Get stock levels by warehouse | Inventory service | ✅ Yes |
| `inventory.getStockAnomalies` | Get stock anomalies (AI) | `getStockAnomalies()` | ✅ Yes |

### Planning Module (Phase 26)
| Tool Name | Description | Service/API | Read-Only |
|-----------|-------------|-------------|-----------|
| `planning.getDemandPlan` | Get demand plan | `getDemandPlan()` | ✅ Yes |
| `planning.getSupplyPlan` | Get supply plan | `getSupplyPlan()` | ✅ Yes |
| `planning.getRecommendations` | Get planning recommendations | `getRecommendations()` | ✅ Yes |
| `planning.getCapacityView` | Get capacity view | `getCapacityView()` | ✅ Yes |

### Analytics Module
| Tool Name | Description | Service/API | Read-Only |
|-----------|-------------|-------------|-----------|
| `analytics.getKpis` | Get KPIs for module | `getAllKpis()` | ✅ Yes |
| `analytics.getModuleMetrics` | Get module-specific metrics | Analytics service | ✅ Yes |

### Projects Module
| Tool Name | Description | Service/API | Read-Only |
|-----------|-------------|-------------|-----------|
| `projects.getWipSummary` | Get WIP summary | Projects service | ✅ Yes (if supported) |

---

## Safety Rules

### Read-Only Guarantee
1. **No Writes**: All tools must call only read-only services/APIs
2. **No Mutations**: Tools must never insert, update, or delete ERP entities
3. **No Side-Effects**: Tools must not trigger workflows, send emails, or change state
4. **Validation**: Tool registry validates that tools are read-only before registration

### RBAC and Tenancy
1. **Tenant Scoping**: All tools receive `tenantId` from session/support context
2. **Permission Checks**: Tools respect existing RBAC permissions (e.g., `ui:finance:view`)
3. **No Bypass**: Agent flows use the same RBAC checks as normal APIs
4. **Deny by Default**: If permission check fails, tool returns error (no data leak)

### No Direct Code Execution
1. **No Eval**: Tools cannot execute arbitrary code
2. **No Database Direct Access**: Tools use service layer, not direct Prisma queries
3. **No File System**: Tools cannot read/write files
4. **Sandboxed**: All tool execution is sandboxed within service boundaries

### Kill-Switch and Flags
1. **Global Flag**: `AGENT_ENABLED` (default: false)
2. **Per-Tenant Flag**: `isAgentEnabledForTenant()` (default: false)
3. **Per-Module Flags**: `AGENT_FINANCE_ENABLED`, etc. (default: false)
4. **Fail Closed**: When disabled, all agent APIs return 403/501 with clear message

---

## Schema Gaps

### AgentRun / AgentStep Models
- **Status**: Not present in schema
- **Impact**: Agent run/step logging returns `supported:false`
- **Workaround**: Use transient IDs (UUIDs) for in-memory correlation; no persistence
- **Future**: Requires schema migration to add `AgentRun` and `AgentStep` models

### AgentConfig Model
- **Status**: Not present in schema
- **Impact**: Per-tenant agent flags default to global flag only
- **Workaround**: Use global `AGENT_ENABLED` flag; per-tenant config requires schema
- **Future**: Requires `AgentConfig` model with `tenantId`, `module`, `enabled` fields

---

## Architecture

### Tool Registry
- **Location**: `apps/web/src/server/ai/agent/tools.ts`
- **Purpose**: Central registry of read-only tools per module
- **Validation**: Ensures tools are read-only before registration
- **Discovery**: `getAvailableToolsForModule()` returns tool metadata

### Agent Logs
- **Location**: `apps/web/src/server/ai/agent/logs.ts`
- **Purpose**: Logical layer for agent run/step logging
- **Persistence**: Conditional (only if schema supports it)
- **Degradation**: Returns `supported:false` when schema gaps exist

### Feature Flags
- **Location**: `apps/web/src/server/ai/config.ts` (extended)
- **Purpose**: Global and per-tenant agent enablement
- **Default**: All flags default to `false` (fail closed)

### Scenario Runner
- **Location**: `apps/web/src/server/ai/agent/scenarioRunner.ts`
- **Purpose**: Internal read-only scenario execution
- **Scope**: Admin/internal use only (not public UI)
- **Safety**: Validates tools, respects flags, no writes

---

## Security Model

### Access Control
- **Permission**: `ui:ai:admin` or module-specific permissions (e.g., `ui:ai:finance`)
- **Roles**: ADMIN, SUPER_ADMIN (configurable via RBAC matrix)
- **Scope**: Tenant-scoped; no cross-tenant access

### Audit and Observability
- **Events**: Agent run/step events (if schema supports)
- **Telemetry**: Extended with `agentRunId`, `agentStepId`, `toolName`, `module`
- **Metrics**: Agent tool calls, runs, errors
- **Logs**: All agent operations logged (non-PII)

---

## Implementation Notes

- All agent features are additive and non-disruptive
- Existing Phase 12 AI continues to work unchanged
- Agent layer is optional and can be disabled globally
- Schema gaps are explicitly documented and handled gracefully
- Read-only guarantee enforced at tool registration time

