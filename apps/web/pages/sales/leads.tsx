import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Leads" tag="sales:leads"/>; }
export default withNexaLayout("Sales — Leads", withAuthGuard(Page));


