export default async function DocsPage() {
  const links = [
    { href: '/docs/modules/billing', label: 'Billing' },
    { href: '/docs/modules/open-banking', label: 'Open Banking' },
    { href: '/docs/modules/hmrc', label: 'HMRC' },
    { href: '/docs/modules/notifications', label: 'Notifications' },
  ]
  return (
    <div>
      <h1>Documentation</h1>
      <p>See the in-repo docs under apps/web/docs for full details.</p>
      <ul>
        {links.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
      </ul>
    </div>
  )
}
