export default async function SolutionsPage() {
  const modules = await getModules()
  return (
    <div>
      <h1>Solutions</h1>
      <ul>
        {modules.map((m)=> (
          <li key={m.key}>{m.name} — {m.status === 'active' ? 'Active' : 'Coming soon'}</li>
        ))}
      </ul>
    </div>
  )
}

async function getModules() {
  // fallback simple list mirroring ERP registry
  return [
    { key: 'billing', name: 'Billing & Metering (Stripe)', status: 'active' as const },
    { key: 'open_banking', name: 'Open Banking (TrueLayer)', status: 'active' as const },
    { key: 'hmrc', name: 'HMRC MTD VAT', status: 'active' as const },
    { key: 'notifications', name: 'Notifications (Twilio)', status: 'active' as const },
    { key: 'manufacturing', name: 'Manufacturing', status: 'active' as const },
    { key: 'wms', name: 'Warehouse Management', status: 'active' as const },
    { key: 'purchase_orders', name: 'Purchase Orders', status: 'active' as const },
    { key: 'enterprise', name: 'Enterprise', status: 'active' as const },
    { key: 'payroll', name: 'Payroll', status: 'active' as const },
    { key: 'marketplace', name: 'Marketplace / EDI', status: 'active' as const },
    { key: 'industry', name: 'Industry Dashboards', status: 'active' as const },
  ]
}
