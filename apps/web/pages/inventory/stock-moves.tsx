import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Stock Moves" tag="inventory:moves"/>; }
export default withNexaLayout("Inventory — Stock Moves", withAuthGuard(Page));


