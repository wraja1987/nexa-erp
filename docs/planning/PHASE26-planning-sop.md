# Phase 26 — Planning / S&OP (Sales & Operations Planning)

**Last updated**: 2025-01-18  
**Status**: ✅ Complete

---

## Purpose

Implement a schema-safe, read-only Planning / S&OP layer that:
- Computes demand plans (forecasts and derived demand) by item/location/channel
- Computes supply plans (open POs, WOs, on-hand, safety stock, lead times)
- Produces suggested actions (POs, WOs, transfers)
- Exposes capacity views across work centres
- Provides S&OP dashboards and integrates with Purchasing, Manufacturing, Inventory, and Analytics

All planning logic is **read-only** and **additive**—no destructive changes to core state without explicit user actions.

---

## Schema Inventory

### Demand Sources

1. **CustomerInvoice**
   - `id`, `tenantId`, `number`, `customerId`, `total`, `status`, `issuedAt`, `dueAt`
   - **Gap**: No line items (InvoiceLineItem model missing)
   - **Workaround**: Use aggregate invoice totals as approximate demand signals (limited accuracy)

2. **WorkOrder** (Component Demand via BOM)
   - `id`, `tenantId`, `itemCode`, `quantity`, `status`, `startPlanned`, `endPlanned`
   - **Usage**: Planned/in-progress WOs create demand for components via `BomItem` explosion
   - **Supported**: ✅ Full support

3. **Historical Demand** (Future Enhancement)
   - **Gap**: No dedicated demand history table
   - **Workaround**: Aggregate from historical invoices/WOs (limited without line items)

### Supply Sources

1. **InventoryItem**
   - `id`, `tenantId`, `sku`, `qtyOnHand`, `warehouseId`, `locationId`
   - **Supported**: ✅ Full support for on-hand by warehouse/location

2. **PurchaseOrder + PoLine**
   - `PurchaseOrder`: `id`, `tenantId`, `supplierId`, `number`, `status`, `expectedAt`
   - `PoLine`: `poId`, `sku`, `qty`, `price`
   - **Supported**: ✅ Full support for open POs (status: draft, approved)

3. **WorkOrder** (Finished Goods Supply)
   - `id`, `tenantId`, `itemCode`, `quantity`, `status`, `startPlanned`, `endPlanned`
   - **Supported**: ✅ Full support for open WOs producing finished goods

4. **Asn** (Advance Shipment Notice)
   - `id`, `tenantId`, `number`, `status`, `eta`, `receivedAt`
   - **Gap**: No line items (AsnLine model missing)
   - **Workaround**: Use ASN ETA as approximate supply signal (limited accuracy)

5. **Safety Stock**
   - **Gap**: No explicit safety stock field on InventoryItem or Warehouse
   - **Workaround**: Compute naive defaults (e.g., 10% of average demand) or mark as unspecific

### Capacity Sources

1. **CapacityCalendar**
   - `id`, `tenantId`, `resourceCode`, `date`, `availableMins`
   - **Supported**: ✅ Full support for work centre capacity

2. **RoutingStep**
   - `id`, `tenantId`, `workOrderId`, `resourceCode`, `durationMins`, `status`
   - **Supported**: ✅ Full support for routing-based capacity load

3. **WorkOrder**
   - `startPlanned`, `endPlanned`, `startActual`, `endActual`
   - **Supported**: ✅ Full support for planned vs actual capacity usage

### Planning Tables

1. **MrpPlan**
   - `id`, `tenantId`, `itemCode`, `planDate`, `suggestedQty`, `recommendation`
   - **Usage**: Read-only (can enrich results from existing plans)
   - **Write Policy**: Do not write new plans (treat as schema-gap for persistence)

### Warehouses & Locations

1. **Warehouse**
   - `id`, `tenantId`, `code`, `name`
   - **Supported**: ✅ Full support

2. **Location**
   - `id`, `tenantId`, `warehouseId`, `code`, `type`
   - **Supported**: ✅ Full support

---

## Input Dimensions

- **By Item**: `sku` / `itemCode`
- **By Warehouse**: `warehouseId` / `warehouse.code`
- **By Location**: `locationId` / `location.code` (optional)
- **By Time Bucket**: Week or Month (ISO date ranges)

---

## Decision Outputs

### Suggested Purchase Orders
- `supplierId`: Supplier to order from
- `itemId`: Item SKU
- `quantityMinor`: Quantity to order
- `dueDate`: Required delivery date
- `reason`: Why this recommendation was generated
- `confidence`: Low/Medium/High

### Suggested Work Orders
- `itemCode`: Finished good to produce
- `quantityMinor`: Quantity to produce
- `startDate`: Planned start date
- `completeDate`: Planned completion date
- `reason`: Why this recommendation was generated
- `confidence`: Low/Medium/High

### Suggested Transfers
- `fromWarehouseId`: Source warehouse
- `toWarehouseId`: Destination warehouse
- `itemId`: Item SKU
- `quantityMinor`: Quantity to transfer
- `dueDate`: Required transfer date
- `reason`: Why this recommendation was generated
- `confidence`: Low/Medium/High

---

## Feature Matrix

| Feature | Supported | Schema Gap | Notes |
|---------|-----------|------------|-------|
| **Demand Planning** | | | |
| Demand from Work Orders (BOM explosion) | ✅ Yes | — | Full support via WorkOrder + BomItem |
| Demand from Customer Invoices | ⚠️ Partial | Missing InvoiceLineItem | Aggregate totals only (limited accuracy) |
| Historical demand forecasting | ❌ No | Missing demand history table | Would require new schema |
| **Supply Planning** | | | |
| On-hand inventory by warehouse/location | ✅ Yes | — | Full support via InventoryItem |
| Open Purchase Orders | ✅ Yes | — | Full support via PurchaseOrder + PoLine |
| Open Work Orders (finished goods) | ✅ Yes | — | Full support via WorkOrder |
| ASN-based supply signals | ⚠️ Partial | Missing AsnLine | ETA only (no line items) |
| Safety stock calculation | ⚠️ Partial | Missing safety stock field | Naive defaults only |
| **Recommendations** | | | |
| Suggested Purchase Orders | ✅ Yes | — | Compute-only (no auto-create) |
| Suggested Work Orders | ✅ Yes | — | Compute-only (no auto-create) |
| Suggested Transfers | ✅ Yes | — | Compute-only (no auto-create) |
| Persist recommendations | ❌ No | — | Treat as schema-gap (read-only suggestions) |
| **Capacity Planning** | | | |
| Work centre capacity view | ✅ Yes | — | Full support via CapacityCalendar |
| Routing-based load | ✅ Yes | — | Full support via RoutingStep |
| Planned vs actual capacity | ✅ Yes | — | Full support via WorkOrder dates |
| **Integration** | | | |
| Purchasing module integration | ✅ Yes | — | Links to PO recommendations |
| Manufacturing module integration | ✅ Yes | — | Links to WO recommendations |
| Inventory module integration | ✅ Yes | — | Links to demand/supply plans |
| Analytics KPIs | ✅ Yes | — | Planning KPIs added to analytics |

---

## Schema Gaps Summary

1. **InvoiceLineItem model missing**: Cannot derive item-level demand from invoices accurately
2. **AsnLine model missing**: Cannot derive item-level supply from ASNs accurately
3. **Safety stock field missing**: No explicit safety stock configuration per item/warehouse
4. **Demand history table missing**: No dedicated table for historical demand patterns
5. **Plan persistence**: `MrpPlan` exists but writes are treated as schema-gap (read-only enrichment)

---

## Persistence Policy

- **Read-Only**: All planning services are compute-only
- **No Writes**: Recommendations are transient (calculated on request)
- **Enrichment**: Can read from existing `MrpPlan` records to enrich results, but do not write new plans
- **Future**: Full persistence would require:
  - `DemandPlan` table (item, warehouse, bucket, quantity)
  - `SupplyPlan` table (item, warehouse, bucket, quantity, source)
  - `PlanRecommendation` table (type, item, quantity, dates, status)

---

## Integration Points

### Purchasing Module
- Link from PO list page to planning recommendations
- Show suggested POs in planning UI

### Manufacturing Module
- Link from WO list page to capacity view
- Show suggested WOs in planning UI

### Inventory Module
- Link from stock page to demand/supply plans for selected item/warehouse
- Show planning recommendations in inventory context

### Analytics Module
- Planning KPIs:
  - `planning_constrained_items`: Count of items with net shortage
  - `planning_net_shortage_value`: Total value of net shortages
  - `planning_suggested_actions_count`: Count of recommendations

---

## Events

- `planning.plan.generated`: Published when recommendations are generated (non-critical, additive)

---

## Metrics

- `planning_recommendations_generated_total` (labels: result, horizon, bucket)
- `planning_capacity_view_requests_total`

---

## RBAC Permissions

- `ui:planning:view`: View planning data (all roles)
- `ui:planning:admin`: Admin planning features (ADMIN, SUPER_ADMIN)

---

## Implementation Notes

- All planning logic is **pure** (no side effects)
- All adapters are **read-only** (no DB writes)
- All services are **tenant-scoped** and **RBAC-guarded**
- All recommendations are **suggestions only** (no auto-apply)
- All schema gaps are **explicitly documented** and return `supported:false` with clear messages

