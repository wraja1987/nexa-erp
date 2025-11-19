import { describe, it, expect } from "vitest";
import { evaluateTransition, getAvailableActions } from "../engine";
import type { WorkflowDefinition, WorkflowContext } from "../types";

describe("Workflow Engine", () => {
  const sampleDefinition: WorkflowDefinition = {
    entityType: "test.entity",
    states: [
      { id: "draft", label: "Draft" },
      { id: "approved", label: "Approved" },
      { id: "completed", label: "Completed", isTerminal: true },
    ],
    transitions: [
      {
        id: "approve",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve",
        conditions: [{ type: "role", role: "MANAGER" }],
      },
      {
        id: "complete",
        fromState: "approved",
        toState: "completed",
        action: "complete",
        label: "Complete",
        conditions: [{ type: "role", role: "STAFF" }],
      },
    ],
    initialState: "draft",
  };

  describe("evaluateTransition", () => {
    it("allows transition when conditions are met", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "MANAGER",
      };

      const decision = evaluateTransition(sampleDefinition, "draft", "approve", context);
      expect(decision.allowed).toBe(true);
      expect(decision.nextState).toBe("approved");
    });

    it("denies transition when role condition is not met", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "STAFF", // STAFF cannot approve (requires MANAGER)
      };

      const decision = evaluateTransition(sampleDefinition, "draft", "approve", context);
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("Conditions not met");
    });

    it("denies transition when amount condition is not met", () => {
      const defWithAmount: WorkflowDefinition = {
        ...sampleDefinition,
        transitions: [
          {
            id: "approve",
            fromState: "draft",
            toState: "approved",
            action: "approve",
            label: "Approve",
            conditions: [
              { type: "role", role: "STAFF" },
              { type: "amount", operator: "<", value: 1000 },
            ],
          },
        ],
      };

      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "STAFF",
        amount: 2000, // Amount is >= 1000, so condition fails
      };

      const decision = evaluateTransition(defWithAmount, "draft", "approve", context);
      expect(decision.allowed).toBe(false);
    });

    it("allows transition when amount condition is met", () => {
      const defWithAmount: WorkflowDefinition = {
        ...sampleDefinition,
        transitions: [
          {
            id: "approve",
            fromState: "draft",
            toState: "approved",
            action: "approve",
            label: "Approve",
            conditions: [
              { type: "role", role: "STAFF" },
              { type: "amount", operator: "<", value: 1000 },
            ],
          },
        ],
      };

      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "STAFF",
        amount: 500, // Amount is < 1000, so condition passes
      };

      const decision = evaluateTransition(defWithAmount, "draft", "approve", context);
      expect(decision.allowed).toBe(true);
    });

    it("denies transition when no matching transition exists", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "MANAGER",
      };

      const decision = evaluateTransition(sampleDefinition, "draft", "invalid-action", context);
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toContain("No transition found");
    });

    it("allows SUPER_ADMIN to bypass role checks", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "SUPER_ADMIN",
      };

      const decision = evaluateTransition(sampleDefinition, "draft", "approve", context);
      expect(decision.allowed).toBe(true);
    });
  });

  describe("getAvailableActions", () => {
    it("returns available actions for current state", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "MANAGER",
      };

      const actions = getAvailableActions(sampleDefinition, "draft", context);
      expect(actions.length).toBe(1);
      expect(actions[0].action).toBe("approve");
    });

    it("returns empty array when no actions are available", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "completed",
        actorId: "user-1",
        actorRole: "MANAGER",
      };

      const actions = getAvailableActions(sampleDefinition, "completed", context);
      expect(actions.length).toBe(0);
    });

    it("filters actions based on conditions", () => {
      const context: WorkflowContext = {
        tenantId: "test-tenant",
        entityType: "test.entity",
        entityId: "test-id",
        currentState: "draft",
        actorId: "user-1",
        actorRole: "STAFF", // STAFF cannot approve (requires MANAGER)
      };

      const actions = getAvailableActions(sampleDefinition, "draft", context);
      expect(actions.length).toBe(0);
    });
  });
});

