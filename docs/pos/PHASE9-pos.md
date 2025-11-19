Last updated: 2025-11-16

Purpose
- Implement POS (Phase 9) on the locked schema with safe subsets only.

Schema inventory (from prisma/schema.prisma)
- Available: Invoice (header), CustomerInvoice, CustomerPayment, JournalEntry, JournalLine.
- Missing: POS-specific entities such as Session/Till/CashDrawer, Promotion, Receipt header/lines, POS Order/Line, Shift/Cash declarations.

Supported now vs 501
- Sessions: list returns empty with schema-gap meta; open/close 501; get 404/null via API.
- Cash-up: preview supported using CustomerPayment and CustomerInvoice summaries; submit 501.
- Till variance: list empty; record 501.
- Promotions: list empty; create/update 501.
- Z/X Reports: read-only summaries using CustomerPayment/CustomerInvoice; if models unavailable, return structured { supported: false, message }.

APIs added
- Sessions: /api/pos/sessions/{list,open,close,get}
- Cash-up: /api/pos/cashup/{preview,submit}
- Variance: /api/pos/variance/{list,record}
- Promotions: /api/pos/promotions/{list,create,update}
- Reports: /api/pos/reports/{z,x}

UI pages added
- /pos/cashup, /pos/variance, /pos/promotions, /pos/reports
- Note: /pos/sessions already existed; left intact.


