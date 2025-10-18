import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Manufacturing Reports" tag="mfg:reports"/>; }
export default withNexaLayout("Manufacturing — Reports", withAuthGuard(Page));


