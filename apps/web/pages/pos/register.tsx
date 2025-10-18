import React from "react";
import { withNexaLayout } from "@/lib/layout/withNexaLayout";
import { withAuthGuard } from "@/lib/auth/withAuthGuard";

function RegisterPage() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">POS Register</h2>
      <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>setOpen(v=>!v)}>
        {open ? "Close Register" : "Open Register"}
      </button>
    </div>
  );
}

export default withNexaLayout("POS — Register", withAuthGuard(RegisterPage));


