import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerHandler, publishEvent, clearHandlers } from "../bus";
import { publishWithOutbox } from "../publisher";
import { getOutboxSupport, enqueueOutboxEvent } from "../outboxRepository";
import { runOutboxConsumersOnce } from "../consumerRunner";
import { newEventId, nowIso } from "../types";
import type { FinanceInvoicePaid } from "../types";

// Mock outbox repository
vi.mock("../outboxRepository", () => ({
  getOutboxSupport: vi.fn(),
  enqueueOutboxEvent: vi.fn(),
  fetchPendingOutboxBatch: vi.fn(),
  markOutboxEventProcessed: vi.fn(),
}));

// Mock metrics
vi.mock("../metrics", () => ({
  recordEventMetric: vi.fn(),
}));

describe("Event Bus Suite", () => {
  beforeEach(() => {
    clearHandlers();
    vi.clearAllMocks();
  });

  describe("Event Bus", () => {
    it("registers and executes handlers", async () => {
      let receivedEvent: FinanceInvoicePaid | null = null;

      registerHandler<FinanceInvoicePaid>("finance.invoice.paid", async (event) => {
        receivedEvent = event;
      });

      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      await publishEvent(event);

      expect(receivedEvent).toBeTruthy();
      expect(receivedEvent?.id).toBe(event.id);
      expect(receivedEvent?.payload.invoiceId).toBe("inv-001");
    });

    it("handles multiple handlers for same event type", async () => {
      const calls: string[] = [];

      registerHandler("finance.invoice.paid", async () => {
        calls.push("handler1");
      });
      registerHandler("finance.invoice.paid", async () => {
        calls.push("handler2");
      });

      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      await publishEvent(event);

      expect(calls).toHaveLength(2);
      expect(calls).toContain("handler1");
      expect(calls).toContain("handler2");
    });

    it("catches and logs handler errors without throwing", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      registerHandler("finance.invoice.paid", async () => {
        throw new Error("Handler error");
      });

      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      // Should not throw
      await expect(publishEvent(event)).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Publisher with Outbox", () => {
    it("publishes event even when outbox is unsupported", async () => {
      const { getOutboxSupport } = await import("../outboxRepository");
      vi.mocked(getOutboxSupport).mockResolvedValue({
        supported: false,
        reason: "Schema gap",
      });

      let handlerCalled = false;
      registerHandler("finance.invoice.paid", async () => {
        handlerCalled = true;
      });

      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      // Should not throw
      await expect(publishWithOutbox(event)).resolves.not.toThrow();

      expect(handlerCalled).toBe(true);
    });

    it("attempts outbox enqueue when supported", async () => {
      const { getOutboxSupport, enqueueOutboxEvent } = await import("../outboxRepository");
      vi.mocked(getOutboxSupport).mockResolvedValue({ supported: true });
      vi.mocked(enqueueOutboxEvent).mockResolvedValue({ supported: true });

      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      await publishWithOutbox(event);

      expect(enqueueOutboxEvent).toHaveBeenCalledWith(event);
    });
  });

  describe("Outbox Repository", () => {
    it("returns supported:false when outbox model missing", async () => {
      const support = await getOutboxSupport();
      expect(support.supported).toBe(false);
      expect(support.reason).toContain("Schema gap");
    });

    it("returns supported:false for enqueue when outbox unsupported", async () => {
      const event: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId: "t-123",
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: "inv-001",
          number: "INV-001",
          amountPaidMinor: 10000,
          currencyCode: "GBP",
          paidAt: nowIso(),
        },
      };

      const result = await enqueueOutboxEvent(event);
      expect(result.supported).toBe(false);
    });
  });

  describe("Consumer Runner", () => {
    it("returns supported:false when outbox unsupported", async () => {
      const { getOutboxSupport } = await import("../outboxRepository");
      vi.mocked(getOutboxSupport).mockResolvedValue({
        supported: false,
        reason: "Schema gap",
      });

      const result = await runOutboxConsumersOnce(100);
      expect(result.supported).toBe(false);
      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});

