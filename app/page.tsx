import { supabase } from '@/lib/supabase'
import { Skid } from '@/lib/types'
import SkidTable from '@/components/SkidTable'
import Sidebar from '@/components/Sidebar'

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
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
                Skid Database
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '1px 8px', borderRadius: 4 }}>
                  {allSkids.length}
                </span>
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                Historical filtration skid designs — Seable&amp;Co.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
              <Stat value={standardCount} label="Standard" color="var(--green)" />
              <Stat value={allSkids.length - standardCount} label="Custom" color="var(--amber)" />
              <Stat value={yards.length} label="Yards" color="var(--text-dim)" />
            </div>
          </div>
        </div>

        {/* Table — fills remaining height */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <SkidTable skids={allSkids} />
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <span style={{ fontWeight: 600, color, fontFamily: 'monospace' }}>{value}</span>
      <span style={{ color: 'var(--text-muted)', marginLeft: 5, fontSize: 11 }}>{label}</span>
    </div>
  )
}
