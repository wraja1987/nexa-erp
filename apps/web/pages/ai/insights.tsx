import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="AI Insights" tag="ai:insights"/>; }
export default withNexaLayout("AI — Insights", withAuthGuard(Page));


