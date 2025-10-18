import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Finance Reports" tag="finance:reports"/>; }
export default withNexaLayout("Finance — Reports", withAuthGuard(Page));


