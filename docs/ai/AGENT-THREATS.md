# Agent Threat Scenarios and Mitigations

**Last updated**: 2025-01-18

---

## Purpose

This document describes threat scenarios for the Agentic AI layer and the mitigations in place.

---

## Threat Scenarios

### 1. Hallucinated Updates

**Scenario**: Agent hallucinates a write operation and attempts to modify ERP data.

**Mitigation**:
- All tools are read-only by design
- Tool registry validates `readOnly: true` at registration
- No write endpoints are exposed to agents
- Service layer enforces read-only constraints

**Detection**: Tool execution fails if write operation attempted.

---

### 2. Data Exfiltration Across Tenants

**Scenario**: Agent attempts to access data from a different tenant.

**Mitigation**:
- All tools receive `tenantId` from session/support context
- Tenant scoping enforced at service layer
- RBAC checks prevent unauthorized access
- No cross-tenant queries possible

**Detection**: Tenant check fails, no data returned.

---

### 3. Overly Broad Queries

**Scenario**: Agent makes expensive queries that impact performance.

**Mitigation**:
- Tool inputs include limits (e.g., `limit: 50`)
- Service layer enforces query limits
- Rate limiting on agent APIs
- Timeout on tool execution

**Detection**: Query limits enforced, rate limiting triggers.

---

### 4. Prompt Injection

**Scenario**: User injects malicious prompt to bypass constraints.

**Mitigation**:
- Prompts explicitly state read-only constraints
- Tool selection validated against registry
- No dynamic code execution
- Input sanitization

**Detection**: Invalid tool names rejected, prompts validated.

---

### 5. RBAC Bypass

**Scenario**: Agent attempts to bypass RBAC checks.

**Mitigation**:
- All tools use existing service layer (same RBAC as normal APIs)
- Permission checks enforced at service level
- No direct database access
- Deny by default

**Detection**: Permission check fails, no data returned.

---

### 6. Schema Manipulation

**Scenario**: Agent attempts to modify schema or database structure.

**Mitigation**:
- No schema modification tools available
- No direct database access
- Service layer abstracts database
- Read-only Prisma queries only

**Detection**: Schema modification not possible (no tools available).

---

### 7. Resource Exhaustion

**Scenario**: Agent makes excessive API calls or consumes too many resources.

**Mitigation**:
- Rate limiting on agent APIs
- Query limits enforced
- Timeout on tool execution
- Resource quotas per tenant

**Detection**: Rate limiting triggers, timeouts occur.

---

## Monitoring

All threats are monitored via:
- Agent telemetry (tool calls, errors)
- Audit logs (all agent operations)
- Metrics (tool execution times, error rates)
- Alerts (unusual patterns, failures)

---

## Incident Response

If a threat is detected:
1. Agent operation is immediately terminated
2. Error is logged with full context
3. Alert is raised (if configured)
4. Audit log entry created
5. User is notified of failure

---

## Compliance

Threat mitigations comply with:
- OWASP Top 10 (injection, broken access control)
- CWE Top 25 (improper access control, injection)
- NIST Cybersecurity Framework (detect, respond, recover)

