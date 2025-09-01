import Link from 'next/link'
import { appModules } from '../config/modules'
import ComingSoonBadge from './ui/ComingSoonBadge'

export default function Nav() {
  return (
    <nav style={{ marginBottom: 16 }} aria-label="Primary">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {appModules.map((mod) => (
          <li key={mod.id} style={{ position: 'relative' }}>
            <Link href={mod.path} style={{ textDecoration: 'none' }}>
              <span style={{ padding: '6px 10px', borderRadius: 8, background: '#f5f5f7', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
                      <span style={{ padding: '4px 8px', borderRadius: 8, background: '#eef0f3', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
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


