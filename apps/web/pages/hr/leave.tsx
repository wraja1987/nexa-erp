import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Leave" tag="hr:leave"/>; }
export default withNexaLayout("HR — Leave", withAuthGuard(Page));


