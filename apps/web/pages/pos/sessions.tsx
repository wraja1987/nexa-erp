import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="POS Sessions" tag="pos:sessions"/>; }
export default withNexaLayout("POS — Sessions", withAuthGuard(Page));


