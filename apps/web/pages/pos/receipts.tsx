import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="POS Receipts" tag="pos:receipts"/>; }
export default withNexaLayout("POS — Receipts", withAuthGuard(Page));


