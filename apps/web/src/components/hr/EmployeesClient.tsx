"use client";

import * as React from "react";

export default function EmployeesClient() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [empNo, setEmpNo] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [msg, setMsg] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/hr/employees/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ empNo, firstName, lastName, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.["ok"]) {
        setMsg(`Created employee ${data?.employee?.empNo || ""}`);
        setFirstName(""); setLastName(""); setEmpNo(""); setEmail("");
      } else {
        setMsg(`Error: ${data?.error || "failed"}`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="font-medium mb-2">Create Employee</div>
      <form onSubmit={submit} className="grid grid-cols-4 gap-3">
        <label className="text-sm">
          Emp No
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={empNo} onChange={e => setEmpNo(e.target.value)} required />
        </label>
        <label className="text-sm">
          First name
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </label>
        <label className="text-sm">
          Last name
          <input className="block mt-1 border rounded-md px-2 py-1 w-full" value={lastName} onChange={e => setLastName(e.target.value)} required />
        </label>
        <label className="text-sm">
          Email
          <input type="email" className="block mt-1 border rounded-md px-2 py-1 w-full" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <div className="col-span-4">
          <button className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} disabled={busy}>Create</button>
        </div>
      </form>
      {msg && <div className="text-sm mt-2">{msg}</div>}
    </div>
  );
}


