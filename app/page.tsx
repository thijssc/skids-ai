import { supabase } from '@/lib/supabase'
import { Skid } from '@/lib/types'
import SkidTable from '@/components/SkidTable'
import Link from 'next/link'

export const revalidate = 60

export default async function Home() {
  const { data: skids, error } = await supabase
    .from('skids')
    .select('*')
    .order('date', { ascending: false })

  if (error) console.error(error)

  const allSkids: Skid[] = skids || []
  const standardCount = allSkids.filter(s => s.is_standard).length
  const yards = [...new Set(allSkids.map(s => s.yard).filter(Boolean))]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        className="sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="1" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest" style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.15em' }}>SKIDS.AI</span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 10 }}>BETA</span>

            <div className="ml-4 flex items-center gap-1" style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
              <NavItem active>Database</NavItem>
              <Link href="/match"><NavItem>RFQ Matcher</NavItem></Link>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            <span>{allSkids.length} skids</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: '#10b981' }}>{standardCount} standard</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--amber)' }}>{allSkids.length - standardCount} custom</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>{yards.length} yards</span>
          </div>
        </div>
      </header>

      {/* Table — full width, no container padding */}
      <SkidTable skids={allSkids} />
    </div>
  )
}

function NavItem({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className="px-3 py-1.5 rounded text-xs cursor-pointer" style={{
      color: active ? 'var(--text)' : 'var(--text-dim)',
      background: active ? 'var(--bg-hover)' : 'transparent',
      fontFamily: 'monospace',
    }}>
      {children}
    </span>
  )
}
