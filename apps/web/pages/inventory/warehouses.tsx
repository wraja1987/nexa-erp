import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Warehouses" tag="inventory:wh"/>; }
export default withNexaLayout("Inventory — Warehouses", withAuthGuard(Page));


