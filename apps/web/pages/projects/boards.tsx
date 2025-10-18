import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";
import { SimpleCrud } from "@/lib/ui/SimpleCrud";

function Page() { return <SimpleCrud title="Project Boards" tag="projects:boards"/>; }
export default withNexaLayout("Projects — Boards", withAuthGuard(Page));


