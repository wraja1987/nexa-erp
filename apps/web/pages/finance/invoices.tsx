import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Invoices" tag="finance:invoices"/>; }
export default withNexaLayout("Finance — Invoices", withAuthGuard(Page));


