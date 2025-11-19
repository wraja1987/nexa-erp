/**
 * Module Subscribers
 * Registers event handlers across all major modules.
 * All handlers are idempotent by design.
 */

import { registerHandler } from "../bus";
import type {
  FinanceInvoicePaid,
  FinancePaymentApplied,
  InventoryTransferCreated,
  ManufacturingWorkorderCompleted,
  PurchasingPoApproved,
  HrPayrollRunCommitted,
  PosCashupPreviewed,
  TaxVatReturnDrafted,
  AttachmentsAttachmentCreated,
  ImportsJobCompleted,
  SalesInvoiceCreated,
  SalesOrderCreated,
  SalesOrderFulfilled,
  SalesQuoteCreated,
  SalesQuoteAccepted,
  CrmOpportunityCreated,
  CrmOpportunityClosed,
  ProjectsTimesheetPosted,
  ProjectsInvoiceCreated,
  PosSessionOpened,
  PosSessionClosed,
  PosSaleCompleted,
  PosRefundCreated,
  WmsGrnReceived,
} from "../types";
import { prisma } from "@/lib/prisma";

/**
 * Register all subscribers.
 * This function should be called during application bootstrap.
 */
export function registerAllSubscribers(): void {
  // Finance subscribers
  registerHandler<FinanceInvoicePaid>("finance.invoice.paid", async (event) => {
    try {
      // Schedule analytics snapshot (idempotent - checks for existing snapshot)
      // This would call analytics service to generate snapshot if not exists
      console.log(`[Subscriber] Finance invoice paid: ${event.payload.invoiceId}`);

      // Schedule AI reconciliation (idempotent - checks for existing reconciliation)
      // This would call AI service to analyze reconciliation if not exists
    } catch (error: any) {
      console.error(`[Subscriber] Finance invoice paid handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<FinancePaymentApplied>("finance.payment.applied", async (event) => {
    try {
      // Update cached KPIs if any (idempotent - recomputes from source)
      console.log(`[Subscriber] Finance payment applied: ${event.payload.paymentId}`);

      // Trigger analytics update (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] Finance payment applied handler failed:`, error?.message || String(error));
    }
  });

  // Inventory subscribers
  registerHandler<InventoryTransferCreated>("inventory.transfer.created", async (event) => {
    try {
      // Trigger analytics/inventory anomaly AI call (idempotent)
      console.log(`[Subscriber] Inventory transfer created: ${event.payload.transferId}`);

      // Schedule inventory analytics snapshot (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] Inventory transfer created handler failed:`, error?.message || String(error));
    }
  });

  // Manufacturing subscribers
  registerHandler<ManufacturingWorkorderCompleted>("manufacturing.workorder.completed", async (event) => {
    try {
      // Trigger costing or analytics (idempotent - recomputes from source)
      console.log(`[Subscriber] Manufacturing work order completed: ${event.payload.workOrderId}`);

      // Schedule manufacturing analytics update (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] Manufacturing work order completed handler failed:`, error?.message || String(error));
    }
  });

  // Purchasing subscribers
  registerHandler<PurchasingPoApproved>("purchasing.po.approved", async (event) => {
    try {
      // Schedule MRP or analytics (idempotent)
      console.log(`[Subscriber] Purchase order approved: ${event.payload.poId}`);

      // Trigger MRP recalculation if needed (idempotent - checks for existing MRP plan)
    } catch (error: any) {
      console.error(`[Subscriber] Purchase order approved handler failed:`, error?.message || String(error));
    }
  });

  // HR/Payroll subscribers
  registerHandler<HrPayrollRunCommitted>("hr.payroll.run.committed", async (event) => {
    try {
      // Schedule payroll anomaly AI (idempotent - checks for existing analysis)
      console.log(`[Subscriber] Payroll run committed: ${event.payload.runId}`);

      // Trigger payroll analytics update (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] Payroll run committed handler failed:`, error?.message || String(error));
    }
  });

  // POS subscribers
  registerHandler<PosCashupPreviewed>("pos.cashup.previewed", async (event) => {
    try {
      // Schedule analytics snapshot (idempotent - checks for existing snapshot)
      console.log(`[Subscriber] POS cashup previewed: ${event.payload.cashupId}`);

      // Trigger POS analytics update (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] POS cashup previewed handler failed:`, error?.message || String(error));
    }
  });

  // Tax subscribers
  registerHandler<TaxVatReturnDrafted>("tax.vat.return.drafted", async (event) => {
    try {
      // Mark analytics flags (idempotent - updates flags if needed)
      console.log(`[Subscriber] VAT return drafted: ${event.payload.returnId}`);

      // Trigger tax analytics update (idempotent)
    } catch (error: any) {
      console.error(`[Subscriber] VAT return drafted handler failed:`, error?.message || String(error));
    }
  });

  // Attachments subscribers
  registerHandler<AttachmentsAttachmentCreated>("attachments.attachment.created", async (event) => {
    try {
      // Log or update metrics (idempotent)
      console.log(`[Subscriber] Attachment created: ${event.payload.attachmentId}`);

      // Update attachment metrics (idempotent - increments counters)
    } catch (error: any) {
      console.error(`[Subscriber] Attachment created handler failed:`, error?.message || String(error));
    }
  });

  // Imports subscribers
  registerHandler<ImportsJobCompleted>("imports.job.completed", async (event) => {
    try {
      // Schedule analytics updates (idempotent)
      console.log(`[Subscriber] Import job completed: ${event.payload.jobId}`);

      // Trigger analytics snapshot if needed (idempotent - checks for existing snapshot)
    } catch (error: any) {
      console.error(`[Subscriber] Import job completed handler failed:`, error?.message || String(error));
    }
  });

  // CRM/Sales subscribers (Phase 4A - Depth Pass)
  registerHandler<CrmOpportunityCreated>("crm.opportunity.created", async (event) => {
    try {
      // Update metrics (idempotent - checks for existing fact rows)
      // This would populate FactOrder or similar metrics tables
      console.log(`[Subscriber] CRM opportunity created: ${event.payload.opportunityId}`);
    } catch (error: any) {
      console.error(`[Subscriber] CRM opportunity created handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<CrmOpportunityClosed>("crm.opportunity.closed", async (event) => {
    try {
      // Update metrics for won/lost opportunities
      console.log(`[Subscriber] CRM opportunity closed: ${event.payload.opportunityId} (${event.payload.status})`);
    } catch (error: any) {
      console.error(`[Subscriber] CRM opportunity closed handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<SalesQuoteCreated>("sales.quote.created", async (event) => {
    try {
      // Update metrics (idempotent)
      console.log(`[Subscriber] Sales quote created: ${event.payload.quoteId}`);
    } catch (error: any) {
      console.error(`[Subscriber] Sales quote created handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<SalesQuoteAccepted>("sales.quote.accepted", async (event) => {
    try {
      // Update metrics for quote acceptance rate
      console.log(`[Subscriber] Sales quote accepted: ${event.payload.quoteId}`);
    } catch (error: any) {
      console.error(`[Subscriber] Sales quote accepted handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<SalesOrderCreated>("sales.order.created", async (event) => {
    try {
      // Reserve inventory if needed (idempotent - checks existing reservations)
      console.log(`[Subscriber] Sales order created: ${event.payload.orderId}`);

      // Update metrics - populate FactOrder
      // This would be implemented in Phase 4F (Metrics Store Wiring)
    } catch (error: any) {
      console.error(`[Subscriber] Sales order created handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<SalesOrderFulfilled>("sales.order.fulfilled", async (event) => {
    try {
      // Update inventory stock movements (idempotent)
      console.log(`[Subscriber] Sales order fulfilled: ${event.payload.orderId}`);

      // Update metrics
    } catch (error: any) {
      console.error(`[Subscriber] Sales order fulfilled handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<SalesInvoiceCreated>("sales.invoice.created", async (event) => {
    try {
      // Create Finance invoice posting (idempotent - checks for existing postings)
      console.log(`[Subscriber] Sales invoice created: ${event.payload.invoiceId}`);

      // Update metrics - populate FactInvoice (Phase 4F)
      const { invoiceId, customerId, number, total, tax, currency, issuedAt } = event.payload;
      const { upsertFactInvoice } = await import("@/server/metrics/store");
      await upsertFactInvoice(
        event.tenantId,
        invoiceId,
        number,
        customerId,
        total,
        tax,
        0, // discount
        currency,
        "draft", // status
        new Date(issuedAt)
      );
    } catch (error: any) {
      console.error(`[Subscriber] Sales invoice created handler failed:`, error?.message || String(error));
    }
  });

  // Projects/PSA subscribers (Phase 4B - Depth Pass)
  registerHandler<ProjectsTimesheetPosted>("projects.timesheet.posted", async (event) => {
    try {
      // Update metrics - populate FactProjectWip (Phase 4F)
      const { timesheetId, projectId, postedAt } = event.payload;
      // Note: WIP ledger entry is created in timesheets.ts, so we'd need to load it
      // For now, this is a placeholder - full implementation would load WipLedger and create FactProjectWip
      console.log(`[Subscriber] Projects timesheet posted: ${timesheetId} for project ${projectId}`);
    } catch (error: any) {
      console.error(`[Subscriber] Projects timesheet posted handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<ProjectsInvoiceCreated>("projects.invoice.created", async (event) => {
    try {
      // Update Finance and metrics
      console.log(`[Subscriber] Projects invoice created: ${event.payload.invoiceId}`);

      // Update metrics - populate FactInvoice (Phase 4F)
      const { invoiceId, customerId, number, total, tax, currency, issuedAt } = event.payload;
      const { upsertFactInvoice } = await import("@/server/metrics/store");
      await upsertFactInvoice(
        event.tenantId,
        invoiceId,
        number,
        customerId,
        total,
        tax,
        0, // discount
        currency,
        "draft", // status
        new Date(issuedAt)
      );
    } catch (error: any) {
      console.error(`[Subscriber] Projects invoice created handler failed:`, error?.message || String(error));
    }
  });

  // POS subscribers (Phase 4C - Depth Pass)
  registerHandler<PosSessionOpened>("pos.session.opened", async (event) => {
    try {
      console.log(`[Subscriber] POS session opened: ${event.payload.sessionId}`);
      // Update metrics - populate FactPosSession (Phase 4F)
    } catch (error: any) {
      console.error(`[Subscriber] POS session opened handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<PosSessionClosed>("pos.session.closed", async (event) => {
    try {
      console.log(`[Subscriber] POS session closed: ${event.payload.sessionId}`);
      // Update metrics - finalize FactPosSession (Phase 4F)
    } catch (error: any) {
      console.error(`[Subscriber] POS session closed handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<PosSaleCompleted>("pos.sale.completed", async (event) => {
    try {
      console.log(`[Subscriber] POS sale completed: ${event.payload.saleId}`);
      // Update Inventory (reduce stock), Finance (already done in finalisePosSale), Metrics (FactReceipt)
      const { saleId, saleNumber, customerId, storeId, subtotal, tax, total, currency, completedAt } = event.payload;
      const { upsertFactReceipt } = await import("@/server/metrics/store");
      await upsertFactReceipt(
        event.tenantId,
        saleId,
        saleNumber,
        customerId || null,
        storeId || null, // Using storeId as channelId
        total,
        0, // discount (could be calculated)
        tax,
        currency,
        "card", // paymentMethod (could be derived from PosPayment)
        new Date(completedAt)
      );
    } catch (error: any) {
      console.error(`[Subscriber] POS sale completed handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<PosRefundCreated>("pos.refund.created", async (event) => {
    try {
      console.log(`[Subscriber] POS refund created: ${event.payload.refundId}`);
      // Update Inventory (restore stock), Finance (reverse entries), Metrics
      const { refundId, saleId, amount } = event.payload;
      console.log(`[Subscriber] Would reverse inventory and finance entries for refund ${refundId}`);
      // Note: Could create negative FactReceipt entry or separate FactRefund table
    } catch (error: any) {
      console.error(`[Subscriber] POS refund created handler failed:`, error?.message || String(error));
    }
  });

  // WMS subscribers (Phase 5A)
  registerHandler<WmsGrnReceived>("wms.grn.received", async (event) => {
    try {
      const { sku, qty, unitCost, warehouseId, locationId, receivedAt } = event.payload;
      // Find the StockMove created by GRN service
      const { prisma } = await import("@/lib/prisma");
      const stockMove = await (prisma as any).stockMove.findFirst({
        where: {
          tenantId: event.tenantId,
          sku,
          type: "grn",
          sourceType: "grn",
          movedAt: { gte: new Date(Date.parse(receivedAt) - 5000), lte: new Date(Date.parse(receivedAt) + 5000) },
        },
        orderBy: { movedAt: "desc" },
      });

      if (stockMove) {
        const { upsertFactInventoryMovement } = await import("@/server/metrics/store");
        await upsertFactInventoryMovement(
          event.tenantId,
          stockMove.id,
          sku,
          warehouseId || "",
          locationId || null,
          qty,
          unitCost,
          qty * unitCost,
          "grn",
          new Date(receivedAt)
        );
      }
    } catch (error: any) {
      console.error(`[Subscriber] WMS GRN received handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<WmsPutawayCompleted>("wms.putaway.completed", async (event) => {
    try {
      const { putawayTaskId, sku, qty, toLocationId, completedAt } = event.payload;
      // Find StockMove created by putaway service
      const { prisma } = await import("@/lib/prisma");
      const stockMove = await (prisma as any).stockMove.findFirst({
        where: {
          tenantId: event.tenantId,
          sourceType: "putaway_task",
          sourceId: putawayTaskId,
        },
      });

      if (stockMove) {
        const { upsertFactInventoryMovement } = await import("@/server/metrics/store");
        await upsertFactInventoryMovement(
          event.tenantId,
          stockMove.id,
          sku,
          stockMove.warehouseId || "",
          toLocationId || null,
          qty,
          Number(stockMove.unitCost || 0),
          Number(stockMove.totalCost || 0),
          "putaway",
          new Date(completedAt)
        );
      }
    } catch (error: any) {
      console.error(`[Subscriber] WMS putaway completed handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<WmsPickCompleted>("wms.pick.completed", async (event) => {
    try {
      const { pickTaskId, sku, qty, fromLocationId, completedAt } = event.payload;
      // Find StockMove created by pick service
      const { prisma } = await import("@/lib/prisma");
      const stockMove = await (prisma as any).stockMove.findFirst({
        where: {
          tenantId: event.tenantId,
          sourceType: "pick_task",
          sourceId: pickTaskId,
        },
      });

      if (stockMove) {
        const { upsertFactInventoryMovement } = await import("@/server/metrics/store");
        await upsertFactInventoryMovement(
          event.tenantId,
          stockMove.id,
          sku,
          stockMove.warehouseId || "",
          fromLocationId || null,
          qty,
          Number(stockMove.unitCost || 0),
          Number(stockMove.totalCost || 0),
          "pick",
          new Date(completedAt)
        );
      }
    } catch (error: any) {
      console.error(`[Subscriber] WMS pick completed handler failed:`, error?.message || String(error));
    }
  });

  registerHandler<WmsCycleCountVariance>("wms.cyclecount.variance", async (event) => {
    try {
      const { cycleCountLineId, sku, locationId, varianceQty, approvedAt } = event.payload;
      // Find StockMove created by cycle count service
      const { prisma } = await import("@/lib/prisma");
      const stockMove = await (prisma as any).stockMove.findFirst({
        where: {
          tenantId: event.tenantId,
          sourceType: "cycle_count",
          sourceId: cycleCountLineId,
        },
      });

      if (stockMove) {
        const { upsertFactInventoryMovement } = await import("@/server/metrics/store");
        await upsertFactInventoryMovement(
          event.tenantId,
          stockMove.id,
          sku,
          stockMove.warehouseId || "",
          locationId || null,
          Math.abs(varianceQty),
          Number(stockMove.unitCost || 0),
          Number(stockMove.totalCost || 0),
          "cycle_count_adjustment",
          new Date(approvedAt)
        );
      }
    } catch (error: any) {
      console.error(`[Subscriber] WMS cycle count variance handler failed:`, error?.message || String(error));
    }
  });

  // Manufacturing subscribers (Phase 5A)
  registerHandler<ManufacturingWorkorderMaterialIssued>("manufacturing.workorder.material.issued", async (event) => {
    try {
      const { materialIssueId, sku, qty, unitCost, issuedAt } = event.payload;
      // Find StockMove created by material issue service
      const { prisma } = await import("@/lib/prisma");
      const stockMove = await (prisma as any).stockMove.findFirst({
        where: {
          tenantId: event.tenantId,
          sourceType: "work_order",
          sourceId: event.payload.workOrderId,
          sku,
          type: "work_order_issue",
        },
        orderBy: { movedAt: "desc" },
      });

      if (stockMove) {
        const { upsertFactInventoryMovement } = await import("@/server/metrics/store");
        await upsertFactInventoryMovement(
          event.tenantId,
          stockMove.id,
          sku,
          stockMove.warehouseId || "",
          stockMove.fromLocationId || null,
          qty,
          unitCost,
          qty * unitCost,
          "work_order_issue",
          new Date(issuedAt)
        );
      }
    } catch (error: any) {
      console.error(`[Subscriber] Manufacturing material issued handler failed:`, error?.message || String(error));
    }
  });
}

// Auto-register subscribers when module is imported
registerAllSubscribers();

