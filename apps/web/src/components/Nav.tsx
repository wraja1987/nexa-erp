import Link from 'next/link'
import { appModules } from '../config/modules'
import ComingSoonBadge from './ui/ComingSoonBadge'

export default function Nav() {
  return (
    <nav style={{ marginBottom: 16 }} aria-label="Primary">
      <ul className="site-nav-fixed" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 18, alignItems: 'center', whiteSpace: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' as any }}>
        {appModules.map((mod) => (
          <li key={mod.id} style={{ position: 'relative', flex: '0 0 auto' }}>
            <Link href={mod.path} style={{ textDecoration: 'none' }}>
              <span style={{ padding: '8px 12px', borderRadius: 9999, border: '1px solid #E5E7EB', background: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span>{mod.title}</span>
                {mod.title.includes('(Coming Soon)') && <ComingSoonBadge />}
                <span aria-hidden>›</span>
              </span>
            </Link>
            {mod.children && mod.children.length > 0 && (
              <ul aria-label={`${mod.title} subsections`} style={{ listStyle: 'none', paddingLeft: 12, marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {mod.children.map((child) => (
                  <li key={child.id}>
                    <Link href={child.path} style={{ textDecoration: 'none' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 9999, background: '#eef0f3', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span>{child.title}</span>
                        {child.title.includes('(Coming Soon)') && <ComingSoonBadge />}
                        <span aria-hidden>›</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}


