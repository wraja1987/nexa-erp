-- KPI aggregation composite indexes (apply on staging first)
create index if not exists idx_customerinvoice_tenant_issuedat on "CustomerInvoice" ("tenantId", "issuedAt");
create index if not exists idx_supplierbill_tenant_receivedat on "SupplierBill" ("tenantId", "receivedAt");
create index if not exists idx_customerpayment_tenant_paidat on "CustomerPayment" ("tenantId", "paidAt");
create index if not exists idx_possale_tenant_createdat on "PosSale" ("tenantId", "createdAt");
create index if not exists idx_payslip_tenant_createdat on "Payslip" ("tenantId", "createdAt");


