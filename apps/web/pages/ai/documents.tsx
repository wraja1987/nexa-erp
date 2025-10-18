import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/src/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="AI Documents" tag="ai:documents"/>; }
export default withNexaLayout("AI — Documents", withAuthGuard(Page));


