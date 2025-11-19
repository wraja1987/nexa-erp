/**
 * Strongly Typed Event Definitions
 * Defines all event types and payloads for the Nexa ERP event bus.
 */

import { randomUUID } from "crypto";

/**
 * Base event structure
 */
export type NexaEventBase = {
  id: string; // eventId (UUID)
  tenantId: string;
  type: NexaEventType;
  occurredAt: string; // ISO date string
  source: string; // e.g. "finance.ap", "inventory.transfer"
  correlationId?: string;
  causationId?: string;
  version: number; // event schema version
};

/**
 * Finance Events
 */
export interface FinanceInvoiceCreated extends NexaEventBase {
  type: "finance.invoice.created";
  payload: {
    invoiceId: string;
    number: string;
    customerCode?: string;
    totalMinor: number;
    currencyCode: string;
    issuedAt: string;
  };
}

export interface FinanceInvoicePaid extends NexaEventBase {
  type: "finance.invoice.paid";
  payload: {
    invoiceId: string;
    number: string;
    amountPaidMinor: number;
    currencyCode: string;
    paidAt: string;
  };
}

export interface FinancePaymentApplied extends NexaEventBase {
  type: "finance.payment.applied";
  payload: {
    paymentId: string;
    invoiceId?: string;
    billId?: string;
    amountMinor: number;
    currencyCode: string;
    appliedAt: string;
  };
}

/**
 * Inventory Events
 */
export interface InventoryTransferCreated extends NexaEventBase {
  type: "inventory.transfer.created";
  payload: {
    transferId: string;
    fromWarehouseCode: string;
    toWarehouseCode: string;
    sku: string;
    quantity: number;
    createdAt: string;
  };
}

export interface InventoryStockAdjusted extends NexaEventBase {
  type: "inventory.stock.adjusted";
  payload: {
    adjustmentId: string;
    sku: string;
    warehouseCode: string;
    quantityDelta: number;
    reason: string;
    adjustedAt: string;
  };
}

/**
 * Manufacturing Events
 */
export interface ManufacturingWorkorderReleased extends NexaEventBase {
  type: "manufacturing.workorder.released";
  payload: {
    workOrderId: string;
    number: string;
    itemCode: string;
    quantity: number;
    releasedAt: string;
  };
}

export interface ManufacturingWorkorderCompleted extends NexaEventBase {
  type: "manufacturing.workorder.completed";
  payload: {
    workOrderId: string;
    number: string;
    itemCode: string;
    quantityCompleted: number;
    completedAt: string;
  };
}

/**
 * Purchasing Events
 */
export interface PurchasingPoApproved extends NexaEventBase {
  type: "purchasing.po.approved";
  payload: {
    poId: string;
    number: string;
    supplierCode: string;
    totalMinor: number;
    currencyCode: string;
    approvedAt: string;
  };
}

/**
 * HR/Payroll Events
 */
export interface HrPayrollRunCommitted extends NexaEventBase {
  type: "hr.payroll.run.committed";
  payload: {
    runId: string;
    periodStart: string;
    periodEnd: string;
    employeeCount: number;
    totalGrossPayMinor: number;
    committedAt: string;
  };
}

/**
 * POS Events
 */
export interface PosCashupPreviewed extends NexaEventBase {
  type: "pos.cashup.previewed";
  payload: {
    cashupId: string;
    storeCode: string;
    shiftId: string;
    totalCashMinor: number;
    totalCardMinor: number;
    previewedAt: string;
  };
}

export interface PosCashupSubmitted extends NexaEventBase {
  type: "pos.cashup.submitted";
  payload: {
    cashupId: string;
    storeCode: string;
    shiftId: string;
    totalCashMinor: number;
    totalCardMinor: number;
    submittedAt: string;
  };
}

/**
 * Tax Events
 */
export interface TaxVatReturnDrafted extends NexaEventBase {
  type: "tax.vat.return.drafted";
  payload: {
    returnId: string;
    vrn: string;
    periodKey: string;
    periodStart: string;
    periodEnd: string;
    totalDueMinor: number;
    draftedAt: string;
  };
}

/**
 * Analytics Events
 */
export interface AnalyticsSnapshotGenerated extends NexaEventBase {
  type: "analytics.snapshot.generated";
  payload: {
    snapshotId: string;
    snapshotType: string;
    asOf: string;
    generatedAt: string;
  };
}

/**
 * AI Events
 */
export interface AiTaskCompleted extends NexaEventBase {
  type: "ai.task.completed";
  payload: {
    taskId: string;
    taskType: string;
    result: any;
    completedAt: string;
  };
}

/**
 * Healthcare Events
 */
export interface HealthcareClaimPreviewed extends NexaEventBase {
  type: "healthcare.claim.previewed";
  payload: {
    claimId: string;
    practiceId: string;
    claimType: string;
    totalAmountMinor: number;
    previewedAt: string;
  };
}

/**
 * Attachments Events
 */
export interface AttachmentsAttachmentCreated extends NexaEventBase {
  type: "attachments.attachment.created";
  payload: {
    attachmentId: string;
    entityType: string;
    entityId: string;
    filename: string;
    sizeBytes: number;
    createdAt: string;
  };
}

/**
 * Imports Events
 */
export interface ImportsJobCompleted extends NexaEventBase {
  type: "imports.job.completed";
  payload: {
    jobId: string;
    importType: string;
    rowsProcessed: number;
    rowsSucceeded: number;
    rowsFailed: number;
    completedAt: string;
  };
}

/**
 * Workflow Events (Phase 24)
 */
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

/**
 * Custom Fields Events (Phase 25)
 */
export interface CustomFieldsDefinitionChanged extends NexaEventBase {
  type: "customfields.definition.changed";
  payload: {
    entityType: string;
    fieldId: string;
    action: "created" | "updated" | "deleted";
    actorId: string;
  };
}

export interface CustomFieldsValuesChanged extends NexaEventBase {
  type: "customfields.values.changed";
  payload: {
    entityType: string;
    entityId: string;
    fieldIds: string[];
    actorId: string;
  };
}

/**
 * Planning Events (Phase 26)
 */
export interface PlanningPlanGenerated extends NexaEventBase {
  type: "planning.plan.generated";
  payload: {
    horizonMonths: number;
    bucketSize: "week" | "month";
    recommendationsCount: number;
    constrainedItemsCount: number;
    actorId?: string; // Optional, may not have a user context
  };
}

/**
 * CRM/Sales Events (Phase 4 - Depth Pass)
 */
export interface CrmLeadConverted extends NexaEventBase {
  type: "crm.lead.converted";
  payload: {
    leadId: string;
    opportunityId: string;
    accountId?: string;
    contactId?: string;
    convertedAt: string;
    actorId: string;
  };
}

export interface CrmOpportunityCreated extends NexaEventBase {
  type: "crm.opportunity.created";
  payload: {
    opportunityId: string;
    accountId?: string;
    contactId?: string;
    stage: string;
    value?: number;
    currency: string;
    createdAt: string;
    actorId: string;
  };
}

export interface CrmOpportunityUpdated extends NexaEventBase {
  type: "crm.opportunity.updated";
  payload: {
    opportunityId: string;
    stage?: string;
    value?: number;
    status?: string;
    updatedAt: string;
    actorId: string;
  };
}

export interface CrmOpportunityClosed extends NexaEventBase {
  type: "crm.opportunity.closed";
  payload: {
    opportunityId: string;
    status: "won" | "lost";
    actualCloseDate: string;
    finalValue?: number;
    actorId: string;
  };
}

export interface SalesQuoteCreated extends NexaEventBase {
  type: "sales.quote.created";
  payload: {
    quoteId: string;
    opportunityId?: string;
    customerId: string;
    number: string;
    total: number;
    currency: string;
    createdAt: string;
    actorId: string;
  };
}

export interface SalesQuoteSent extends NexaEventBase {
  type: "sales.quote.sent";
  payload: {
    quoteId: string;
    sentAt: string;
    actorId: string;
  };
}

export interface SalesQuoteAccepted extends NexaEventBase {
  type: "sales.quote.accepted";
  payload: {
    quoteId: string;
    acceptedAt: string;
    actorId: string;
  };
}

export interface SalesQuoteRejected extends NexaEventBase {
  type: "sales.quote.rejected";
  payload: {
    quoteId: string;
    rejectedAt: string;
    actorId: string;
  };
}

export interface SalesOrderCreated extends NexaEventBase {
  type: "sales.order.created";
  payload: {
    orderId: string;
    quoteId?: string;
    customerId: string;
    number: string;
    total: number;
    currency: string;
    createdAt: string;
    actorId: string;
  };
}

export interface SalesOrderFulfilled extends NexaEventBase {
  type: "sales.order.fulfilled";
  payload: {
    orderId: string;
    fulfilledAt: string;
    actorId: string;
  };
}

export interface SalesInvoiceCreated extends NexaEventBase {
  type: "sales.invoice.created";
  payload: {
    invoiceId: string;
    orderId: string;
    customerId: string;
    number: string;
    total: number;
    tax: number;
    currency: string;
    issuedAt: string;
    actorId: string;
  };
}

/**
 * Projects/PSA Events (Phase 4B - Depth Pass)
 */
export interface ProjectsTimesheetPosted extends NexaEventBase {
  type: "projects.timesheet.posted";
  payload: {
    timesheetId: string;
    projectId: string;
    phaseId?: string;
    employeeId: string;
    hours: number;
    postedAt: string;
    actorId: string;
  };
}

export interface ProjectsExpenseApproved extends NexaEventBase {
  type: "projects.expense.approved";
  payload: {
    expenseId: string;
    projectId: string;
    phaseId?: string;
    amount: number;
    approvedAt: string;
    actorId: string;
  };
}

export interface ProjectsWipPosted extends NexaEventBase {
  type: "projects.wip.posted";
  payload: {
    wipLedgerId: string;
    projectId: string;
    phaseId?: string;
    type: string;
    amount: number;
    postedAt: string;
    actorId: string;
  };
}

export interface ProjectsInvoiceCreated extends NexaEventBase {
  type: "projects.invoice.created";
  payload: {
    invoiceId: string;
    projectId: string;
    customerId: string;
    number: string;
    total: number;
    tax: number;
    currency: string;
    issuedAt: string;
    actorId: string;
  };
}

/**
 * POS Events (Phase 4C - Depth Pass)
 */
export interface PosSessionOpened extends NexaEventBase {
  type: "pos.session.opened";
  payload: {
    sessionId: string;
    storeId: string;
    shiftId: string;
    openedBy: string;
    openingFloat: number;
    openedAt: string;
    actorId: string;
  };
}

export interface PosSessionClosed extends NexaEventBase {
  type: "pos.session.closed";
  payload: {
    sessionId: string;
    storeId: string;
    shiftId: string;
    closedBy: string;
    closingFloat: number;
    openedAt: string;
    closedAt: string;
    actorId: string;
  };
}

export interface PosSaleCompleted extends NexaEventBase {
  type: "pos.sale.completed";
  payload: {
    saleId: string;
    saleNumber: string;
    storeId: string;
    sessionId?: string;
    shiftId?: string;
    customerId?: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    completedAt: string;
    actorId: string;
  };
}

export interface PosRefundCreated extends NexaEventBase {
  type: "pos.refund.created";
  payload: {
    refundId: string;
    saleId: string;
    storeId: string;
    sessionId?: string;
    amount: number;
    reason?: string;
    createdAt: string;
    actorId: string;
  };
}

/**
 * WMS/Inventory Events (Phase 4E - Depth Pass)
 */
export interface WmsGrnReceived extends NexaEventBase {
  type: "wms.grn.received";
  payload: {
    sku: string;
    qty: number;
    unitCost: number;
    warehouseId?: string;
    locationId?: string;
    receivedAt: string;
    actorId: string;
  };
}

export interface WmsPutawayCompleted extends NexaEventBase {
  type: "wms.putaway.completed";
  payload: {
    putawayTaskId: string;
    sku: string;
    qty: number;
    fromLocationId: string;
    toLocationId: string;
    completedAt: string;
    actorId: string;
  };
}

export interface WmsPickCompleted extends NexaEventBase {
  type: "wms.pick.completed";
  payload: {
    pickTaskId: string;
    sku: string;
    qty: number;
    fromLocationId: string;
    orderId: string;
    orderType: string;
    completedAt: string;
    actorId: string;
  };
}

export interface WmsShipmentConfirmed extends NexaEventBase {
  type: "wms.shipment.confirmed";
  payload: {
    shipmentId: string;
    shipmentNumber: string;
    orderId: string;
    orderType: string;
    warehouseId: string;
    shippedAt: string;
    actorId: string;
  };
}

export interface WmsCycleCountVariance extends NexaEventBase {
  type: "wms.cyclecount.variance";
  payload: {
    cycleCountLineId: string;
    sku: string;
    locationId: string;
    expectedQty: number;
    countedQty: number;
    varianceQty: number;
    approvedAt: string;
    actorId: string;
  };
}

/**
 * Manufacturing Events (Phase 4E - Depth Pass)
 */
export interface ManufacturingWorkorderMaterialIssued extends NexaEventBase {
  type: "manufacturing.workorder.material.issued";
  payload: {
    workOrderId: string;
    materialIssueId: string;
    sku: string;
    qty: number;
    unitCost: number;
    issuedAt: string;
    actorId: string;
  };
}

export interface ManufacturingWorkorderCompleted extends NexaEventBase {
  type: "manufacturing.workorder.completed";
  payload: {
    workOrderId: string;
    number: string;
    itemCode: string;
    quantity: number;
    completedAt: string;
    actorId: string;
  };
}

export interface ManufacturingVariancePosted extends NexaEventBase {
  type: "manufacturing.variance.posted";
  payload: {
    varianceReportId: string;
    workOrderId: string;
    materialVariance: number;
    labourVariance: number;
    overheadVariance: number;
    postedAt: string;
    actorId: string;
  };
}

/**
 * User Management Events (Phase 27)
 */
export interface UserCreated extends NexaEventBase {
  type: "user.created";
  payload: {
    userId: string;
    email: string;
    role: string | null;
    actorId: string;
  };
}

export interface UserRolesChanged extends NexaEventBase {
  type: "user.roles.changed";
  payload: {
    userId: string;
    oldRole: string | null;
    newRole: string;
    actorId: string;
  };
}

export interface UserDeactivated extends NexaEventBase {
  type: "user.deactivated";
  payload: {
    userId: string;
    actorId: string;
  };
}

export interface UserReactivated extends NexaEventBase {
  type: "user.reactivated";
  payload: {
    userId: string;
    actorId: string;
  };
}

export interface UserPasswordResetTriggered extends NexaEventBase {
  type: "user.passwordreset.triggered";
  payload: {
    userId: string;
    actorId: string;
  };
}

export interface SuperadminSupportViewOpened extends NexaEventBase {
  type: "superadmin.supportview.opened";
  payload: {
    targetTenantId: string;
    targetUserId: string;
    superAdminUserId: string;
  };
}

/**
 * Union of all event types
 */
export type NexaEventType =
  | "finance.invoice.created"
  | "finance.invoice.paid"
  | "finance.payment.applied"
  | "inventory.transfer.created"
  | "inventory.stock.adjusted"
  | "manufacturing.workorder.released"
  | "manufacturing.workorder.completed"
  | "purchasing.po.approved"
  | "hr.payroll.run.committed"
  | "pos.cashup.previewed"
  | "pos.cashup.submitted"
  | "tax.vat.return.drafted"
  | "analytics.snapshot.generated"
  | "ai.task.completed"
  | "healthcare.claim.previewed"
  | "attachments.attachment.created"
  | "imports.job.completed"
  | "workflow.state.changed"
  | "workflow.transition.denied"
  | "customfields.definition.changed"
  | "customfields.values.changed"
  | "planning.plan.generated"
  | "user.created"
  | "user.roles.changed"
  | "user.deactivated"
  | "user.reactivated"
  | "user.passwordreset.triggered"
  | "superadmin.supportview.opened"
  | "crm.lead.converted"
  | "crm.opportunity.created"
  | "crm.opportunity.updated"
  | "crm.opportunity.closed"
  | "sales.quote.created"
  | "sales.quote.sent"
  | "sales.quote.accepted"
  | "sales.quote.rejected"
  | "sales.order.created"
  | "sales.order.fulfilled"
  | "sales.invoice.created"
  | "projects.timesheet.posted"
  | "projects.expense.approved"
  | "projects.wip.posted"
  | "projects.invoice.created"
  | "pos.session.opened"
  | "pos.session.closed"
  | "pos.sale.completed"
  | "pos.refund.created"
  | "wms.grn.received"
  | "wms.putaway.completed"
  | "wms.pick.completed"
  | "wms.shipment.confirmed"
  | "wms.cyclecount.variance"
  | "manufacturing.workorder.material.issued"
  | "manufacturing.workorder.completed"
  | "manufacturing.variance.posted";

/**
 * Union of all event interfaces
 */
export type NexaEvent =
  | FinanceInvoiceCreated
  | FinanceInvoicePaid
  | FinancePaymentApplied
  | InventoryTransferCreated
  | InventoryStockAdjusted
  | ManufacturingWorkorderReleased
  | ManufacturingWorkorderCompleted
  | PurchasingPoApproved
  | HrPayrollRunCommitted
  | PosCashupPreviewed
  | PosCashupSubmitted
  | TaxVatReturnDrafted
  | AnalyticsSnapshotGenerated
  | AiTaskCompleted
  | HealthcareClaimPreviewed
  | AttachmentsAttachmentCreated
  | ImportsJobCompleted
  | WorkflowStateChanged
  | WorkflowTransitionDenied
  | CustomFieldsDefinitionChanged
  | CustomFieldsValuesChanged
  | PlanningPlanGenerated
  | UserCreated
  | UserRolesChanged
  | UserDeactivated
  | UserReactivated
  | UserPasswordResetTriggered
  | SuperadminSupportViewOpened
  | CrmLeadConverted
  | CrmOpportunityCreated
  | CrmOpportunityUpdated
  | CrmOpportunityClosed
  | SalesQuoteCreated
  | SalesQuoteSent
  | SalesQuoteAccepted
  | SalesQuoteRejected
  | SalesOrderCreated
  | SalesOrderFulfilled
  | SalesInvoiceCreated
  | ProjectsTimesheetPosted
  | ProjectsExpenseApproved
  | ProjectsWipPosted
  | ProjectsInvoiceCreated
  | PosSessionOpened
  | PosSessionClosed
  | PosSaleCompleted
  | PosRefundCreated
  | WmsGrnReceived
  | WmsPutawayCompleted
  | WmsPickCompleted
  | WmsShipmentConfirmed
  | WmsCycleCountVariance
  | ManufacturingWorkorderMaterialIssued
  | ManufacturingWorkorderCompleted
  | ManufacturingVariancePosted;

/**
 * Generate new event ID (UUID)
 */
export function newEventId(): string {
  return randomUUID();
}

/**
 * Get current ISO timestamp
 */
export function nowIso(): string {
  return new Date().toISOString();
}

