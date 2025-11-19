/**
 * Core Event Bus (In-Process, Typed)
 * Central dispatcher + handler registry for typed events.
 */

import type { NexaEvent, NexaEventType } from "./types";
import * as Sentry from "@sentry/nextjs";
import { incrementCounter, recordDuration } from "@/server/observability/metrics";

export type EventHandler<T extends NexaEvent = NexaEvent> = (event: T) => Promise<void> | void;

// In-memory handler registry
const handlers: Record<NexaEventType, EventHandler[]> = {
  "finance.invoice.created": [],
  "finance.invoice.paid": [],
  "finance.payment.applied": [],
  "inventory.transfer.created": [],
  "inventory.stock.adjusted": [],
  "manufacturing.workorder.released": [],
  "manufacturing.workorder.completed": [],
  "purchasing.po.approved": [],
  "hr.payroll.run.committed": [],
  "pos.cashup.previewed": [],
  "pos.cashup.submitted": [],
  "tax.vat.return.drafted": [],
  "analytics.snapshot.generated": [],
  "ai.task.completed": [],
  "healthcare.claim.previewed": [],
  "attachments.attachment.created": [],
  "imports.job.completed": [],
  "crm.lead.converted": [],
  "crm.opportunity.created": [],
  "crm.opportunity.updated": [],
  "crm.opportunity.closed": [],
  "sales.quote.created": [],
  "sales.quote.sent": [],
  "sales.quote.accepted": [],
  "sales.quote.rejected": [],
  "sales.order.created": [],
  "sales.order.fulfilled": [],
  "sales.invoice.created": [],
  "projects.timesheet.posted": [],
  "projects.expense.approved": [],
  "projects.wip.posted": [],
  "projects.invoice.created": [],
  "pos.session.opened": [],
  "pos.session.closed": [],
  "pos.sale.completed": [],
  "pos.refund.created": [],
  "wms.grn.received": [],
  "wms.putaway.completed": [],
  "wms.pick.completed": [],
  "wms.shipment.confirmed": [],
  "wms.cyclecount.variance": [],
  "manufacturing.workorder.material.issued": [],
  "manufacturing.workorder.completed": [],
  "manufacturing.variance.posted": [],
};

/**
 * Register an event handler.
 * Handlers are executed in registration order.
 */
export function registerHandler<T extends NexaEvent>(type: T["type"], handler: EventHandler<T>): void {
  if (!handlers[type]) {
    handlers[type] = [];
  }
  handlers[type].push(handler as EventHandler);
}

/**
 * Publish an event to all registered handlers.
 * Handlers execute synchronously (in-process).
 * Errors in handlers are caught and logged; never thrown upstream.
 */
export async function publishEvent<T extends NexaEvent>(event: T): Promise<void> {
  const eventHandlers = handlers[event.type] || [];

  if (eventHandlers.length === 0) {
    // No handlers registered for this event type
    return;
  }

  // Execute all handlers
  for (const handler of eventHandlers) {
    const handlerStart = Date.now();
    try {
      await handler(event);
      const handlerDuration = Date.now() - handlerStart;
      incrementCounter("events_handled_total", {
        module: "events",
        operation: "handle",
        tenantId: event.tenantId,
        eventType: event.type,
        status: "ok",
      });
      recordDuration("events_handler_duration_ms", handlerDuration, {
        module: "events",
        operation: "handle",
        tenantId: event.tenantId,
        eventType: event.type,
      });
    } catch (error: any) {
      const handlerDuration = Date.now() - handlerStart;
      incrementCounter("events_handled_total", {
        module: "events",
        operation: "handle",
        tenantId: event.tenantId,
        eventType: event.type,
        status: "error",
      });
      recordDuration("events_handler_duration_ms", handlerDuration, {
        module: "events",
        operation: "handle",
        tenantId: event.tenantId,
        eventType: event.type,
      });
      // Log error but don't throw upstream
      const errorMessage = error?.message || String(error);
      console.error(`[EventBus] Handler failed for event ${event.type}:`, errorMessage);

      // Report to Sentry if available
      if (typeof Sentry !== "undefined" && Sentry.captureException) {
        Sentry.captureException(error, {
          tags: {
            eventType: event.type,
            eventId: event.id,
            tenantId: event.tenantId,
          },
          extra: {
            event: {
              id: event.id,
              type: event.type,
              source: event.source,
            },
          },
        });
      }
    }
  }
}

/**
 * Get count of registered handlers for an event type.
 */
export function getHandlerCount(type: NexaEventType): number {
  return handlers[type]?.length || 0;
}

/**
 * Clear all handlers (useful for testing).
 */
export function clearHandlers(): void {
  for (const key in handlers) {
    handlers[key as NexaEventType] = [];
  }
}

