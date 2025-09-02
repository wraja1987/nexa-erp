export default function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pages = ['/', '/solutions', '/industries', '/features', '/docs', '/contact', '/legal/privacy', '/legal/terms', '/legal/cookies']
  const now = new Date()
  return pages.map((p) => ({ url: `${site}${p}`, lastModified: now }))
}
