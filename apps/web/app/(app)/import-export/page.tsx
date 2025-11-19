"use client";

import { useState } from "react";
import Page from "@/components/layout/Page";
import ImportSection from "@/components/import/ImportSection";

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<"finance" | "master" | "orders" | "payroll" | "undo">("finance");

  return (
    <Page title="Import / Export">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-2">Import / Export Hub</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Import and export data across the system. Use CSV format for imports. Preview before applying.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "finance" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"
            }`}
          >
            Finance
          </button>
          <button
            onClick={() => setActiveTab("master")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "master" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"
            }`}
          >
            Master Data
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "orders" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "payroll" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => setActiveTab("undo")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "undo" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600"
            }`}
          >
            Undo
          </button>
        </div>

        {/* Finance Tab */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            <ImportSection
              title="Chart of Accounts"
              exportEndpoint="/api/import/coa/export"
              previewEndpoint="/api/import/coa/preview"
              applyEndpoint="/api/import/coa/apply"
              csvFormat="Code,Name,Type,Currency,ParentCode,Active"
            />
            <ImportSection
              title="Opening Balances"
              previewEndpoint="/api/import/opening-balances/preview"
              applyEndpoint="/api/import/opening-balances/apply"
              csvFormat="AccountCode,Debit,Credit"
            />
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-2">Trial Balance Export</h3>
              <a
                href="/api/import/trial-balance/export"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
              >
                Export Trial Balance
              </a>
            </div>
          </div>
        )}

        {/* Master Data Tab */}
        {activeTab === "master" && (
          <div className="space-y-4">
            <ImportSection
              title="Vendors"
              previewEndpoint="/api/import/vendors/preview"
              applyEndpoint="/api/import/vendors/apply"
              csvFormat="Code,Name,Email,Phone,Address"
            />
            <ImportSection
              title="Items"
              previewEndpoint="/api/import/items/preview"
              applyEndpoint="/api/import/items/apply"
              csvFormat="SKU,QtyOnHand,WarehouseCode,LocationCode"
            />
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-2">Customers</h3>
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                Customer imports are not supported (schema gap: no Customer model).
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-2">Price Lists</h3>
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                Price list imports are not supported (schema gap: no PriceList model).
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <ImportSection
              title="Purchase Orders"
              previewEndpoint="/api/import/purchase-orders/preview"
              applyEndpoint="/api/import/purchase-orders/apply"
              csvFormat="Number,SupplierCode,OrderDate,SKU,Qty,Price,ExpectedDate,Currency"
            />
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-2">Sales Orders</h3>
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                Sales order imports are not supported (schema gap: no SalesOrder model).
              </div>
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-4">
            <ImportSection
              title="Payroll"
              previewEndpoint="/api/import/payroll/preview"
              applyEndpoint="/api/import/payroll/apply"
              csvFormat="RunId,EmployeeNo,PeriodStart,PeriodEnd,GrossPay,NetPay"
            />
          </div>
        )}

        {/* Undo Tab */}
        {activeTab === "undo" && (
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-sm font-medium mb-2">Undo Import</h3>
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              Undo functionality is not supported (schema gap: no ImportJob model). Import operations are logged to audit log but cannot be automatically undone.
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

