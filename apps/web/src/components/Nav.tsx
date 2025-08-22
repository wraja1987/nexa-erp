import Link from 'next/link'
import { appModules } from '../config/modules'

export default function Nav() {
  return (
    <nav style={{ marginBottom: 16 }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {appModules.map((mod) => (
          <li key={mod.id} style={{ position: 'relative' }}>
            <Link href={mod.path} style={{ textDecoration: 'none' }}>
              <span style={{ padding: '6px 10px', borderRadius: 8, background: '#f5f5f7', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span>{mod.title}</span>
                <span aria-hidden>›</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}


