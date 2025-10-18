import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function InventoryHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Inventory</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/inventory/items" className="text-blue-600">Items</a></li>
        <li><a href="/inventory/warehouses" className="text-blue-600">Warehouses</a></li>
        <li><a href="/inventory/stock-moves" className="text-blue-600">Stock Moves</a></li>
        <li><a href="/inventory/purchase-orders" className="text-blue-600">Purchase Orders</a></li>
        <li><a href="/inventory/reports" className="text-blue-600">Reports</a></li>
      </ul>
    </div>
  );
}

export default withNexaLayout("Inventory", withAuthGuard(InventoryHome));


