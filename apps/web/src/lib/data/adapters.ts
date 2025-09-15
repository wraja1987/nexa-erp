/** Replace with real DB/services. These return demo data with shape used by NexaLayout. */
export async function fetchKPIs(module: string) {
  return [
    { id: "k1", label: "Records", value: 120 },
    { id: "k2", label: "Open Items", value: 9 },
    { id: "k3", label: "Errors (24h)", value: 0 }
  ];
}
export async function fetchTable(module: string) {
  return { title: "Recent Items", columns: ["ID","Name","Status"], rows: [["#101","Example","OK"]] };
}
