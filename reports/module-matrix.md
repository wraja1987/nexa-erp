## Nexa ERP — Module Matrix (baseline after Task 5)

Legend: ✅ Implemented, ⚙️ Partial, ⛔ Missing

Notes:
- Status reflects current repo state. Most submodules have UI scaffolds; deeper CRUD/RBAC/Audit are pending unless noted.
- Links are paths under `apps/web/app/(app)` (UI) and `apps/web/app/api` (APIs).

| Module | Submodule | Status | Notes | UI Path | API Path (if present) |
|---|---|---|---|---|---|
| Finance | Reports | ✅ | Client-gated; ADMIN 200; STAFF 200 with Not authorised | `/finance/reports` | — |
| Finance | GL | ✅ | Journal post API + TB/P&L/BS reports | `/finance/gl` | `/api/finance/gl/post`, `/api/finance/reports/*` |
| Finance | AR (Invoices) | ⚙️ | UI scaffold + approve/pay endpoints exist | `/finance/ar` `/finance/invoices` | `/api/finance/ar/invoice/approve`, `/api/finance/ar/invoice/pay` |
| Finance | AP (Bills) | ⚙️ | UI scaffold present | `/finance/ap` `/finance/bills` | — |
| Finance | Banking | ⚙️ | UI scaffold present | `/finance/bank` `/finance/banking` `/finance/reconciliation` | — |
| Finance | VAT/Tax | ⚙️ | UI scaffold present | `/finance/vat` | — |
| Finance | Fixed Assets | ⚙️ | UI scaffold present | `/finance/fa` | — |
| Finance | Close | ⚙️ | UI scaffold present | `/finance/close` | — |
| Inventory | Items, Categories, Warehouses | ⚙️ | UI scaffold present | `/inventory/items` `/inventory/categories` `/inventory/warehouses` | — |
| Inventory | Stock Movements | ⚙️ | UI scaffold present | `/inventory/stock-movements` | — |
| Inventory | GRN | ⚙️ | API exists | `/inventory` | `/api/inventory/grn` |
| Purchasing | Suppliers, POs | ⚙️ | UI scaffold present | `/purchasing/suppliers` `/purchasing/orders` | — |
| Sales | Customers, Leads, Opportunities, Orders, Quotes | ⚙️ | UI scaffold present | `/sales/*` | — |
| Manufacturing | BOMs, Routings, Resources, WOs | ⚙️ | UI scaffold + consume-bom API exists | `/manufacturing/*` | `/api/manufacturing/workorder/consume-bom` |
| POS | Products, Receipts, Register, Sessions | ⚙️ | Finalise posts GL entries + COGS (WAVG) | `/pos/*` | `/api/pos/sale/finalise` |
| Projects | Boards, Tasks, Time, Timesheets, Billing | ⚙️ | UI scaffold + rollup API exists | `/projects/*` | `/api/projects/timesheets/rollup` |
| HR | Employees, Leave, Payroll | ⚙️ | UI scaffold present | `/hr/*` | — |
| AI | Workbench, Automations, Logs | ⚙️ | UI scaffold present | `/ai/*` | `/api/ai/audit/logs` |

Follow-ups required per submodule for ✅:
- CRUD pages + APIs, Zod validation (server+client), RBAC per role, audit events on mutating actions, list/detail with search/sort/pagination, CSV import/export (where sensible), at least one KPI/report, Playwright E2E and unit tests, seeds for demo.

Verification pointers:
- RBAC matrix: `apps/web/RBAC_MATRIX.md`
- Admin user management (API): `/api/admin/users/create`, `/api/admin/users/role`


