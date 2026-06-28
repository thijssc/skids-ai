'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skid } from '@/lib/types'
import SkidIconWrapper from './SkidIconWrapper'

interface Props { skids: Skid[] }

type Tab = 'skid' | 'pool'

export default function SkidTable({ skids }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [tab, setTab] = useState<Tab>('skid')

  const filtered = skids.filter(s =>
    filter === '' ||
    s.project_number.toLowerCase().includes(filter.toLowerCase()) ||
    (s.vessel_name?.toLowerCase().includes(filter.toLowerCase())) ||
    (s.yard?.toLowerCase().includes(filter.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          <TabBtn active={tab === 'skid'} onClick={() => setTab('skid')}>
            <TableIcon /> Skid
          </TabBtn>
          <TabBtn active={tab === 'pool'} onClick={() => setTab('pool')}>
            <TableIcon /> Pool Spec
          </TabBtn>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search..."
            style={{
              paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
              fontSize: 12, borderRadius: 5, outline: 'none',
              background: 'var(--bg-hover)', border: '1px solid var(--border)',
              color: 'var(--text)', width: 180,
            }}
          />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          {filtered.length} records
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        {tab === 'skid' ? (
          <SkidPhysicalTable skids={filtered} onRow={id => router.push(`/skid/${id}`)} />
        ) : (
          <PoolSpecTable skids={filtered} onRow={id => router.push(`/skid/${id}`)} />
        )}
      </div>
    </div>
  )
}

/* ── Skid Physical Table ─────────────────────────── */
function SkidPhysicalTable({ skids, onRow }: { skids: Skid[]; onRow: (id: number) => void }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: 'var(--bg-header)', position: 'sticky', top: 0, zIndex: 10 }}>
          <TH w={52}></TH>
          <TH>Project</TH>
          <TH>Vessel</TH>
          <TH>Yard</TH>
          <TH>Location</TH>
          <TH>L × W × H (mm)</TH>
          <TH>Empty kg</TH>
          <TH>Oper. kg</TH>
          <TH>Frame</TH>
          <TH>Finish</TH>
          <TH>Suction</TH>
          <TH>Pressure</TH>
          <TH>Overboard</TH>
          <TH>Drain</TH>
          <TH>Type</TH>
          <TH>Year</TH>
        </tr>
      </thead>
      <tbody>
        {skids.map((s, i) => (
          <tr key={s.id} className="skid-row" style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)' }} onClick={() => onRow(s.id)}>
            <td style={{ padding: '6px 8px', width: 52 }}>
              <SkidIconWrapper length={s.length_mm} width={s.width_mm} height={s.height_mm} isStandard={s.is_standard} size={30} />
            </td>
            <TD mono bold>{s.project_number}</TD>
            <TD dim>{s.vessel_name}</TD>
            <TD>
              <span style={{ color: s.yard === 'Damen' ? 'var(--blue)' : 'var(--cyan)', fontFamily: 'monospace' }}>{s.yard ?? '—'}</span>
            </TD>
            <TD dim mono>{s.location?.replace(/_/g, ' ')}</TD>
            <TD mono>{s.length_mm ? `${s.length_mm} × ${s.width_mm} × ${s.height_mm}` : null}</TD>
            <TD mono>{s.weight_empty_kg}</TD>
            <TD mono>{s.weight_operational_kg}</TD>
            <TD dim>{s.frame_material}</TD>
            <TD dim>{s.frame_finish}</TD>
            <TD mono>{s.suction_dn ? `DN${s.suction_dn}` : null}</TD>
            <TD mono>{s.pressure_dn ? `DN${s.pressure_dn}` : null}</TD>
            <TD mono>{s.overboard_dn ? `DN${s.overboard_dn}` : null}</TD>
            <TD mono>{s.drain_dn ? `DN${s.drain_dn}` : null}</TD>
            <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <Badge standard={s.is_standard} />
            </td>
            <TD mono dim>{s.date ? new Date(s.date).getFullYear() : null}</TD>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── Pool Spec Table ─────────────────────────────── */
function PoolSpecTable({ skids, onRow }: { skids: Skid[]; onRow: (id: number) => void }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ background: 'var(--bg-header)', position: 'sticky', top: 0, zIndex: 10 }}>
          <TH w={52}></TH>
          <TH>Project</TH>
          <TH>Vessel</TH>
          <TH>Yard</TH>
          <TH>Pool m³</TH>
          <TH>Dump tank m³</TH>
          <TH>Filter m³/h</TH>
          <TH>Sand filter m³/h</TH>
          <TH>Jetstream A m³/h</TH>
          <TH>Jetstream B m³/h</TH>
          <TH>Fill pump m³/h</TH>
          <TH>Heater kW</TH>
          <TH>Heaters</TH>
          <TH>HX kW</TH>
          <TH>UV m³/h</TH>
          <TH>AWT pumps</TH>
          <TH>Seawater</TH>
          <TH>SW pump m³/h</TH>
          <TH>Type</TH>
        </tr>
      </thead>
      <tbody>
        {skids.map((s, i) => (
          <tr key={s.id} className="skid-row" style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)' }} onClick={() => onRow(s.id)}>
            <td style={{ padding: '6px 8px', width: 52 }}>
              <SkidIconWrapper length={s.length_mm} width={s.width_mm} height={s.height_mm} isStandard={s.is_standard} size={30} />
            </td>
            <TD mono bold>{s.project_number}</TD>
            <TD dim>{s.vessel_name}</TD>
            <TD>
              <span style={{ color: s.yard === 'Damen' ? 'var(--blue)' : 'var(--cyan)', fontFamily: 'monospace' }}>{s.yard ?? '—'}</span>
            </TD>
            <TD mono highlight>{s.pool_volume_m3}</TD>
            <TD mono>{s.dump_tank_volume_m3}</TD>
            <TD mono>{s.filter_pump_m3h}</TD>
            <TD mono>{s.sand_filter_m3h}</TD>
            <TD mono>{s.jetstream_pump_a_m3h}</TD>
            <TD mono>{s.jetstream_pump_b_m3h}</TD>
            <TD mono>{s.fill_pump_m3h}</TD>
            <td style={{ padding: '6px 12px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {s.heater_total_kw != null
                ? <span style={{ color: 'var(--amber)' }}>{s.heater_total_kw}</span>
                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </td>
            <TD mono>{s.heater_count}</TD>
            <TD mono>{s.heat_exchanger_kw}</TD>
            <TD mono>{s.uv_sterilizer_m3h}</TD>
            <TD mono>{s.awt_dosing_pumps}</TD>
            <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
              {s.seawater_system != null
                ? <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: s.seawater_system ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', color: s.seawater_system ? 'var(--green)' : 'var(--red)' }}>
                    {s.seawater_system ? 'Yes' : 'No'}
                  </span>
                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </td>
            <TD mono>{s.seawater_pump_m3h}</TD>
            <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <Badge standard={s.is_standard} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── Shared primitives ───────────────────────────── */
function TH({ children, w }: { children?: React.ReactNode; w?: number }) {
  return (
    <th style={{
      padding: '7px 12px', textAlign: 'left', fontWeight: 500,
      fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap',
      borderBottom: '1px solid var(--border)', width: w,
      letterSpacing: '0.02em',
    }}>
      {children}
    </th>
  )
}

function TD({ children, mono, dim, bold, highlight }: {
  children?: React.ReactNode
  mono?: boolean; dim?: boolean; bold?: boolean; highlight?: boolean
}) {
  const val = children !== null && children !== undefined ? children : null
  return (
    <td style={{
      padding: '6px 12px', whiteSpace: 'nowrap',
      fontFamily: mono ? 'monospace' : undefined,
      fontWeight: bold ? 600 : undefined,
      color: val != null
        ? (highlight ? 'var(--blue)' : dim ? 'var(--text-dim)' : 'var(--text)')
        : 'var(--text-muted)',
    }}>
      {val ?? '—'}
    </td>
  )
}

function Badge({ standard }: { standard: boolean | null }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 7px', borderRadius: 3,
      background: standard ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.08)',
      color: standard ? 'var(--green)' : 'var(--amber)',
      fontWeight: 500,
    }}>
      {standard ? 'Standard' : 'Custom'}
    </span>
  )
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: active ? 500 : 400,
        background: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-muted)',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  )
}

function TableIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  )
}
