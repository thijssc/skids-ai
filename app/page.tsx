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
      <header style={{ borderBottom: '1px solid var(--border)', background: 'rgba(8,12,20,0.95)' }}
        className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="1" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: 'monospace' }}>SKIDS.AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e2d45', color: '#64748b', fontFamily: 'monospace' }}>BETA</span>
          </div>
          <nav className="flex items-center gap-6">
            <span className="text-sm font-medium" style={{ color: 'var(--blue)' }}>Database</span>
            <Link href="/match" className="text-sm" style={{ color: 'var(--text-dim)' }}>
              RFQ Matcher
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero stats bar */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-white mb-1">Filtration Skid Database</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
            AI-powered matching of historical skid designs — Seable&amp;Co.
          </p>
          <div className="flex items-center gap-10">
            <Stat value={allSkids.length} label="Skids indexed" color="var(--blue)" />
            <Stat value={standardCount} label="Standard designs" color="#10b981" />
            <Stat value={allSkids.length - standardCount} label="Custom builds" color="var(--amber)" />
            <Stat value={yards.length} label="Yards" color="var(--cyan)" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SkidTable skids={allSkids} />
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="text-3xl font-bold" style={{ color, fontFamily: 'monospace' }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{label}</div>
    </div>
  )
}
