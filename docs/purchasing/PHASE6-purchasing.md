Last updated: 2025-11-16

Purpose
- Define the Purchasing/Procurement layer implemented on top of the locked schema. Summarise what’s available vs missing. All behaviour below uses existing tables; no schema edits.

Existing models (from prisma/schema.prisma)

- Supplier
  - Fields: id, tenantId, code (unique), name, email?, phone?, createdAt/updatedAt.
  - Relation: PurchaseOrder[].
- PurchaseOrder
  - Fields: id, supplierId, currency, expectedAt?, number (unique), orderDate, tenantId, status (PoStatus), createdAt/updatedAt.
  - Status enum PoStatus: draft | approved | sent | received | closed | cancelled.
  - Relations: supplier (Supplier), lines (PoLine[]).
- PoLine
  - Fields: id, poId, lineNo (unique with poId), sku, qty (Decimal), price (Decimal), tenantId, createdAt/updatedAt.
- Asn (Advance Shipment Notice)
  - Fields: id, tenantId, number (unique), supplierRef?, status (created|received|closed), eta?, receivedAt?, createdAt/updatedAt.
  - No explicit line linkage to PO or lots (gap).
- Inventory/related (for receiving): InventoryItem / InventoryLot exist; there is no StockMove ledger.

Available now (Phase 6)
- Supplier master CRUD.
- Purchase Orders: header CRUD with lifecycle transitions draft → approved and cancel to cancelled. PoLine exists; however, safe subset: do not mutate PoLine in this phase (no lines API).
- ASN / Receipts: Asn exists but without line linkage and without stock movement ledger; we provide read‑only list/get and return 501 for receipt posting.

Missing / Task 2 required
- Blanket POs/entities.
- Supplier contracts/pricing tables (price lists).
- Landed cost allocation models.
- Supplier performance metrics (OTIF/quality) tables.
- Full receiving pipeline with line linkage and stock moves.

Safe-subset decisions
- Suppliers: CRUD on Supplier.
- POs: header CRUD + Approve/Cancel only (no lines CRUD this phase). “Sent/Received/Closed” transitions are not driven here; remain read‑only statuses.
- Receipts: read‑only list/get from Asn; `receiveAgainstPO` returns 501.
- Blanket POs, Contracts/Pricing, Landed Costs, Supplier Performance: read‑only stubs and 501 mutations; clearly documented gaps.

RBAC and tenancy
- All endpoints require ui:purchasing:view (reads) or ui:purchasing:edit (mutations).
- All queries are tenant-scoped and assert legal entity access; no cross-tenant visibility.


