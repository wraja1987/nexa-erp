import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Work Orders" tag="mfg:wo"/>; }
export default withNexaLayout("Manufacturing — Work Orders", withAuthGuard(Page));


