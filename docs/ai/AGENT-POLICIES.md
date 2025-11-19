# Agent Policies — Read-Only AI Assistant

**Last updated**: 2025-01-18

---

## Purpose

This document defines the policies and rules governing the Agentic AI layer in Nexa ERP. All agents operate under strict read-only constraints.

---

## Core Rules

### 1. Read-Only Guarantee

- **No Writes**: Agents must never insert, update, or delete ERP entities
- **No Mutations**: Agents must not modify any ERP state
- **No Side-Effects**: Agents must not trigger workflows, send emails, or change configuration
- **Validation**: All tools are validated as read-only before registration

### 2. RBAC and Tenancy

- **Tenant Scoping**: All agent operations are scoped to the current tenant
- **Permission Checks**: Agents respect existing RBAC permissions (e.g., `ui:finance:view`)
- **No Bypass**: Agent flows use the same RBAC checks as normal APIs
- **Deny by Default**: If permission check fails, agent returns error (no data leak)

### 3. No Direct Code Execution

- **No Eval**: Agents cannot execute arbitrary code
- **No Database Direct Access**: Agents use service layer, not direct Prisma queries
- **No File System**: Agents cannot read/write files
- **Sandboxed**: All tool execution is sandboxed within service boundaries

### 4. Kill-Switch and Flags

- **Global Flag**: `AGENT_ENABLED` (default: false)
- **Per-Tenant Flag**: `isAgentEnabledForTenant()` (default: false)
- **Per-Module Flags**: `AGENT_FINANCE_ENABLED`, etc. (default: false)
- **Fail Closed**: When disabled, all agent APIs return 403/501 with clear message

---

## Tool Registry Rules

1. **Registration**: All tools must be explicitly registered with `readOnly: true`
2. **Validation**: Tool registry validates that tools are read-only before registration
3. **Discovery**: Tools are discoverable via `getAvailableToolsForModule()`
4. **Execution**: Tool execution is sandboxed and validated

---

## Prompt Guidelines

All agent prompts must explicitly state:
- "You must only call read-only tools"
- "You must not attempt to change ERP data"
- "Respect RBAC and tenant boundaries"

---

## Audit and Observability

- All agent operations are logged (non-PII)
- Agent runs/steps are recorded (if schema supports)
- Telemetry includes agent metadata (`agentRunId`, `agentStepId`, `toolName`)
- Metrics track agent tool calls, runs, errors

---

## Schema Gaps

When schema gaps exist (e.g., no `AgentRun` model):
- Agent logs return `supported:false`
- Transient IDs are used for in-memory correlation
- No persistence occurs, but functionality degrades gracefully

---

## Security Model

- **Access Control**: Requires `ui:ai:admin` or module-specific permissions
- **Roles**: ADMIN, SUPER_ADMIN (configurable via RBAC matrix)
- **Scope**: Tenant-scoped; no cross-tenant access
- **Audit**: All agent operations are audited

---

## Violations

If an agent attempts to:
- Call a write operation → Tool execution fails with error
- Bypass RBAC → Permission check fails, no data returned
- Execute arbitrary code → Sandbox prevents execution
- Access unauthorized tenant → Tenant check fails, no data returned

---

## Compliance

All agent features comply with:
- GDPR (no PII in logs unless necessary)
- SOC 2 (audit trail, access controls)
- ISO 27001 (security controls, monitoring)

