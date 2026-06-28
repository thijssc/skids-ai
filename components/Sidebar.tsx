'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    label: 'Database',
    href: '/',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v5c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 10v5c0 1.66 4.03 3 9 3s9-1.34 9-3v-5" />
      </svg>
    ),
  },
  {
    label: 'RFQ Matcher',
    href: '/match',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo banner */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="2" y="7" width="20" height="14" rx="1.5" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', letterSpacing: '0.04em' }}>
              SKIDS.AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
              Seable&amp;Co. · Internal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 4px' }}>
          Tools
        </div>
        {NAV.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 6, marginBottom: 2,
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-dim)',
                fontSize: 13, fontWeight: active ? 500 : 400,
                cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
              }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = 'var(--text-dim)' } }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>v0.1 · Beta</div>
      </div>
    </aside>
  )
}
