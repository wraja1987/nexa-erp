export default function FeaturesPage() {
  const features = [
    'AI throughout',
    'Governance & RBAC',
    'Security by default',
    'Mobile & PWA',
    'Performance at scale',
    'Integrations & webhooks',
  ]
  return (
    <div>
      <h1>Features</h1>
      <ul>
        {features.map(f => <li key={f}>{f}</li>)}
      </ul>
    </div>
  )
}
