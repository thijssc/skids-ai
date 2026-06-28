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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page header */}
        <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Skid Database</h1>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>Historical filtration skid designs</p>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, fontFamily: 'monospace' }}>
            <Stat value={allSkids.length} label="total" color="var(--text-dim)" />
            <Stat value={standardCount} label="standard" color="#10b981" />
            <Stat value={allSkids.length - standardCount} label="custom" color="var(--amber)" />
            <Stat value={yards.length} label="yards" color="var(--text-dim)" />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <SkidTable skids={allSkids} />
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <span style={{ fontWeight: 600, color }}>{value}</span>
      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{label}</span>
    </div>
  )
}
