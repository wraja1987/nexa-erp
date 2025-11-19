Last updated: 2025-11-16

Purpose
- Establish full Inventory & WMS (Phase 4) on top of the locked schema. Summarise available capabilities and gaps. All logic implemented uses existing tables only; no schema changes.

Schema recon (available models)

- Warehouse
  - `id`, `tenantId`, `code` (unique per tenant), `name`, `createdAt`, `updatedAt`
  - Relations: `locations: Location[]`, `InventoryItem[]`
- Location (Bin)
  - `id`, `tenantId`, `warehouseId`, `code`, `type?`, `createdAt`, `updatedAt`
  - Relations: `warehouse: Warehouse`, `InventoryItem[]`
- InventoryItem (Item-at-location/warehouse with balance)
  - `id`, `tenantId`, `sku`, `qtyOnHand` (Decimal), `warehouseId?`, `locationId?`, `createdAt`, `updatedAt`
  - Relations: `warehouse?: Warehouse`, `location?: Location`
  - Acts as both item master (via `sku`) and location-level balance record
- InventoryLot (lot/batch level)
  - `id`, `tenantId`, `sku`, `qty`, `unitCost` (default 0), `receivedAt`, `warehouseId`, `locationId`, `createdAt`, `updatedAt`
  - No explicit linkage back to Purchase Order or ASN (gap)
- PurchaseOrder / PoLine
  - `PurchaseOrder`: `id`, `tenantId`, `supplierId`, `number`, dates/status; `lines: PoLine[]`
  - `PoLine`: `poId`, `sku`, `qty`, `price`, `tenantId`
- ASN (Advance Shipment Notice)
  - `id`, `tenantId`, `number` (unique), `supplierRef?`, `status (created|received|closed)`, `eta?`, `receivedAt?`
  - No line items or linkage to lots (gap)
- WMS execution
  - `Wave`: `id`, `number` (unique), `status (planned|released|dispatched)`, `pickTasks: PickTask[]`
  - `PickTask`: `id`, `waveId?`, `sku`, `qty`, `fromLocId?`, `toLocId?`, `status (queued|picked|short|cancelled)`
- AuditLog
  - `id`, `tenantId`, `actorId`, `action`, `target`, `at`, `data (Json)`
  - Used to log inventory events (transfers, variances) since no dedicated stock movement ledger exists

Capabilities inferred from schema
- Warehouses: create/list/update supported (code/name).
- Bins (Locations): create/list/update supported (code/type, warehouse scoped).
- Item master + balances: `InventoryItem` provides SKU + per-warehouse/bin `qtyOnHand`.
- Lot tracking: `InventoryLot` supports per‑lot quantity and unit cost; no explicit “issue”/“consume” fields.
- Stock calcs: can derive stock by summing `InventoryItem.qtyOnHand` or `InventoryLot.qty`.
- Receiving: `Asn` exists but lacks line linkage; safe pattern is: on receipt, create `InventoryLot` and adjust `InventoryItem.qtyOnHand`, log to `AuditLog` with `Asn` reference in `target`.
- Picking/Waves: `PickTask` exists with statuses but no explicit reservation/shipments; safe to read-only list pick tasks; mutating to `picked` is possible but without reservation or shipment linkage is ambiguous.

Gaps impacting Phase 4 (handled via safe subset or 501)
- No canonical `Item` master (only `sku` on `InventoryItem`/`PoLine`). No attributes (UoM, description, dimensions), no item master references.
- No `StockMove` (issue/receipt/transfer) ledger; `InventoryLot` doesn’t carry issue/consume or reference to source doc.
- No explicit reservation/allocations (pick/pack/ship flows), no shipment entity (only `ShipmentExternal` for marketplace).
- No `CycleCountPlan`/`CycleCountLine` tables.
- No serial/batch attributes beyond `InventoryLot.qty`/`unitCost`; no expiry/best-before fields.
- No per‑bin reorder points, capacity constraints, or putaway rules.
- No explicit variance table; use `AuditLog` to record adjustments if enabled or return 501.

Design choices (safe subset)
- All writes are tenant‑scoped and wrapped in transactions where applicable.
- Balance source of truth is `InventoryItem.qtyOnHand`. `InventoryLot` is appended on inbound (receive/transfer‑in) with `unitCost` defaulted to 0 when unknown; no negative lots are created on outbound (gap).
- Warehouse↔Warehouse and Bin↔Bin transfers adjust `InventoryItem` balances atomically and append an `AuditLog` entry; if desired, a corresponding inbound `InventoryLot` is created for the destination to preserve batch visibility. Outbound “issue lot” is not persisted (gap).
- Cycle counting provided as read‑only scaffold; recording variances returns 501 and is documented. (Optional future: allow variance to adjust `InventoryItem` with `AuditLog` and optional lot append.)
- Pick/Pack/Ship exposed as read-only using `PickTask`; mutating steps return 501 due to missing reservation/ship/pack entities.

Phase 4 deliverables (implemented)
- Core master data services/APIs/UI for Warehouses, Bins (Locations), and Items (`InventoryItem`).
- Stock views by bin and per‑item summary from existing balances/lots.
- Transfer services/APIs to move stock between warehouses or bins w/ no negative stock enforcement.
- Cycle count scaffolding (list only), record/variance return 501.
- Fulfilment scaffolding (list pick tasks only); state changes return 501.
- Variance handling: read‑only scaffold (record returns 501). Option to extend later to adjust balances with `AuditLog`.

RBAC & tenancy
- All endpoints use `assertTenantScope` and `resolve/validate legal entity` helpers; mutation endpoints require `inventory:manage` and read endpoints require `inventory:view`.
- No cross‑tenant operations; warehouse/bin membership validated to tenant before transfers.

Known limitations (documented for Task 2)
- Introduce proper Item master + attributes.
- Introduce StockMove / Movement & Reservation models to record all inventory changes with references to source docs (PO/ASN/SO/WO).
- Add CycleCountPlan/Result tables and variance journal linkage.
- Add Shipment (outbound) and Receipt (inbound) line‑level linkage to lots and movements.
- Add serialisation/lot attributes (expiry, batch no.), putaway and capacity rules, multi‑UoM if required.


