Last updated: 2025-11-16

Purpose
- Define the manufacturing layer implemented on top of the locked schema. Summarise what’s available now vs missing for BOM, work orders, routings/centres, variances and MRP. All behaviour below uses existing tables only; no schema edits.

Existing models (from prisma/schema.prisma)

- WorkOrder
  - Fields: id, number (unique), tenantId, itemCode, quantity (Decimal), status (WorkOrderStatus: planned|released|completed|cancelled), startPlanned/endPlanned?, startActual/endActual?, createdAt/updatedAt, relation: steps: RoutingStep[].
  - Indexes: tenantId, itemCode.
- BomItem
  - Fields: id, tenantId, parentItemCode, componentItemCode, quantity (Decimal), createdAt/updatedAt.
  - Indexes: tenantId, parentItemCode.
  - Acts as BOM lines by parent item code. No explicit BOM header table.
- RoutingStep
  - Fields: id, tenantId, workOrderId?, seq (Int), resourceCode?, durationMins?, status (TaskStatus: pending|in_progress|done|blocked), createdAt/updatedAt.
  - Relations: workOrder (optional).
  - Indexes: workOrderId, tenantId.
  - Acts as minimal routing/operation rows, usually attached to a WorkOrder; no routing master.
- MrpPlan
  - Fields: id, tenantId, itemCode, planDate, suggestedQty (Decimal), recommendation?, createdAt/updatedAt.
  - Index: (tenantId, itemCode).
  - Optional target store for MRP suggestions (we keep Phase 5 suggestions read-only).
- CapacityCalendar
  - Fields: id, tenantId, resourceCode, date, availableMins, createdAt/updatedAt.
  - Index: (tenantId, resourceCode, date).
  - Provides capacity snapshots per resource (used to list “work centres”).
- Inventory/related (used for integration points)
  - InventoryItem (qtyOnHand by sku/warehouse/bin), InventoryLot, Warehouse, Location. No StockMove ledger.

Available now (used in this phase)
- BOM: BomItem (single-level per parentItemCode).
- Work orders: WorkOrder with statuses planned|released|completed|cancelled.
- Routing: RoutingStep attached to WorkOrder (no routing master).
- Work centres: derived from distinct resourceCode across CapacityCalendar and RoutingStep.
- Light MRP: MrpPlan table exists; InventoryItem qtyOnHand and WorkOrder provide basic demand/supply signals; CapacityCalendar provides capacity awareness (not fully used).

Missing / Task 2 required
- No BOM header entity, no alternates/phantoms flags on BomItem.
- No dedicated WorkCenter table; only resourceCode string references.
- No routing master (by item); only RoutingStep tied to WorkOrder.
- No StockMove ledger; no production issue/return tables; no labour logs or cost fields.
- No cost breakdown per WorkOrder or variance journal mapping.
- MrpPlan exists but demand (SalesOrders/Forecast) and full supply (open POs/WOs by due dates) modelling is limited; lead-time fields on items/vendors are not present.

Safe-subset decisions (Phase 5)
- BOM: list/get and create/update BomItem lines per parentItemCode. Multi-level traversal: compute recursively via parent/child codes if chains exist; otherwise single-level. Alternates/phantoms are documented gaps (read-only notes).
- Work orders: lifecycle implemented with planned → released → completed and cancel, constrained by enum values. RoutingStep treated read-only; deeper editing of steps is 501.
- Work centres: list distinct resourceCode; create/update return 501 (no table).
- Material/labour posting: return 501 to avoid hidden qty changes (no StockMove/cost/labour models).
- Variance: calculate/post return 501 (no cost fields or ledger).
- MRP: compute read-only net requirements from planned WorkOrders vs InventoryItem.qtyOnHand; suggestions are not persisted (MrpPlan kept untouched for safety).

RBAC and tenancy
- All endpoints require permissions (ui:manufacturing:view for reads; ui:manufacturing:edit for mutations) and assert tenant/legal entity scope. No cross-tenant reads or writes.


