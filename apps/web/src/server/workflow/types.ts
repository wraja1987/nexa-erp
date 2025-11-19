/**
 * Phase 24 — Workflow Engine Types
 * 
 * Core type definitions for the workflow engine.
 */

/**
 * Workflow state definition
 */
export interface WorkflowState {
  id: string;
  label: string;
  description?: string;
  isTerminal?: boolean; // Terminal states cannot transition
}

/**
 * Workflow condition types
 */
export type WorkflowCondition =
  | { type: "role"; role: string } // User must have this role
  | { type: "amount"; operator: "<" | ">=" | "<=" | ">"; value: number } // Entity total comparison
  | { type: "dimension"; dimension: string; value: string } // Cost centre, department, etc. (stubbed)
  | { type: "always" }; // Always allow

/**
 * Workflow transition definition
 */
export interface WorkflowTransition {
  id: string;
  fromState: string;
  toState: string;
  action: string; // e.g. "approve", "cancel", "start"
  label: string;
  conditions: WorkflowCondition[]; // All conditions must pass
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  entityType: string; // e.g. "finance.invoice", "purchasing.po"
  tenantId?: string; // Optional tenant-specific override
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  initialState: string; // Default initial state
}

/**
 * Workflow context (runtime data for evaluation)
 */
export interface WorkflowContext {
  tenantId: string;
  entityType: string;
  entityId: string;
  currentState: string;
  actorId: string;
  actorRole: string; // User's role
  amount?: number; // Entity total (for amount-based conditions)
  dimensions?: Record<string, string>; // Cost centre, department, etc. (stubbed)
}

/**
 * Workflow decision result
 */
export interface WorkflowDecision {
  allowed: boolean;
  reason?: string;
  nextState?: string;
  failedConditions?: WorkflowCondition[]; // Which conditions failed
}

/**
 * Workflow history entry (virtual, from events)
 */
export interface WorkflowHistoryEntry {
  id: string;
  entityType: string;
  entityId: string;
  fromState: string;
  toState: string;
  action: string;
  actorId: string;
  timestamp: string;
  reason?: string;
}

