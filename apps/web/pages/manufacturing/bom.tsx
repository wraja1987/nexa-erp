import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="BOM" tag="mfg:bom"/>; }
export default withNexaLayout("Manufacturing — BOM", withAuthGuard(Page));


