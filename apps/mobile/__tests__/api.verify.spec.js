const axios = require("axios");
const API_BASE_URL = process.env.API_BASE_URL || "https://api.nexaai.co.uk";
const API_TOKEN = process.env.API_TOKEN || "";
const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000, headers: API_TOKEN ? { Authorization:`Bearer ${API_TOKEN}` } : {} });

const endpoints = [
  "/health", "/version",
  "/api/finance/gl", "/api/finance/ap", "/api/finance/ar", "/api/finance/vat/mtd", "/api/finance/fa",
  "/api/hr/employees", "/api/payroll/runs",
  "/api/inventory/items", "/api/wms/warehouses", "/api/wms/quality/holds",
  "/api/mfg/work-orders", "/api/mfg/mrp",
  "/api/sales/orders", "/api/sales/returns",
  "/api/purchasing/po", "/api/purchasing/invoices",
  "/api/projects",
  "/api/compliance/gdpr/audit", "/api/compliance/cis",
  "/api/billing/plans", "/api/billing/invoices", "/api/open-banking/status",
  "/api/analytics/kpis", "/api/observability/status",
  "/api/ai/insights", "/api/workflows/jobs",
  "/api/mobile/push/status",
  "/api/connectors", "/api/admin/api-keys", "/api/admin/backups/status",
  "/api/pos/config", "/api/pos/reconciliation"
];

describe("API endpoints exist (200/204/401/403 acceptable)", ()=>{
  it("pings representative endpoints", async ()=>{
    for (const path of endpoints){
      try{
        const res = await client.get(path);
        expect([200,204]).toContain(res.status);
      }catch(err){
        const rc = err?.response?.status;
        expect([401,403]).toContain(rc); // auth-protected is acceptable
      }
    }
  }, 30000);
});
