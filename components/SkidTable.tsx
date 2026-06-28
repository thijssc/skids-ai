'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skid } from '@/lib/types'
import SkidIconWrapper from './SkidIconWrapper'

interface Props { skids: Skid[] }

export default function SkidTable({ skids }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [yardFilter, setYardFilter] = useState('all')

  const yards = [...new Set(skids.map(s => s.yard).filter(Boolean))] as string[]

  const filtered = skids.filter(s => {
    const matchText = filter === '' ||
      s.project_number.toLowerCase().includes(filter.toLowerCase()) ||
      (s.vessel_name?.toLowerCase().includes(filter.toLowerCase()))
    const matchYard = yardFilter === 'all' || s.yard === yardFilter
    return matchText && matchYard
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs rounded outline-none"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              width: 200,
            }}
          />
        </div>
        <select
          value={yardFilter}
          onChange={e => setYardFilter(e.target.value)}
          className="px-2 py-1.5 text-xs rounded outline-none"
          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="all">All yards</option>
          {yards.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-dim)' }}>
          {filtered.length} records
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full border-collapse" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border)' }}>
              <Th w={48}></Th>
              <Th>Project</Th>
              <Th>Vessel</Th>
              <Th>Yard</Th>
              <Th>Location</Th>
              <Th>Dimensions (mm)</Th>
              <Th>Pool m³</Th>
              <Th>Filter m³/h</Th>
              <Th>Jetstream m³/h</Th>
              <Th>Heater kW</Th>
              <Th>HX kW</Th>
              <Th>Type</Th>
              <Th>Year</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((skid, i) => (
              <tr
                key={skid.id}
                className="skid-row"
                style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)' }}
                onClick={() => router.push(`/skid/${skid.id}`)}
              >
                <td className="px-2 py-1.5" style={{ width: 48 }}>
                  <SkidIconWrapper
                    length={skid.length_mm} width={skid.width_mm}
                    height={skid.height_mm} isStandard={skid.is_standard} size={32}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <span className="font-semibold" style={{ fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.02em' }}>
                    {skid.project_number}
                  </span>
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--text-dim)' }}>
                  {skid.vessel_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-3 py-1.5">
                  <span style={{
                    color: skid.yard === 'Damen' ? 'var(--blue)' : 'var(--cyan)',
                    fontFamily: 'monospace',
                  }}>
                    {skid.yard || '—'}
                  </span>
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  {skid.location?.replace(/_/g, ' ') || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  {skid.length_mm ? `${skid.length_mm} × ${skid.width_mm} × ${skid.height_mm}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <Num value={skid.pool_volume_m3} />
                <Num value={skid.filter_pump_m3h} />
                <td className="px-3 py-1.5" style={{ fontFamily: 'monospace' }}>
                  {skid.jetstream_pump_a_m3h
                    ? <span style={{ color: 'var(--text)' }}>{skid.jetstream_pump_a_m3h}{skid.jetstream_pump_b_m3h ? ` + ${skid.jetstream_pump_b_m3h}` : ''}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-3 py-1.5" style={{ fontFamily: 'monospace' }}>
                  {skid.heater_total_kw
                    ? <span style={{ color: 'var(--amber)' }}>{skid.heater_total_kw}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-3 py-1.5" style={{ fontFamily: 'monospace' }}>
                  {skid.heat_exchanger_kw
                    ? <span style={{ color: 'var(--text-dim)' }}>{skid.heat_exchanger_kw}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-3 py-1.5">
                  <span className="px-1.5 py-0.5 rounded text-xs" style={{
                    background: skid.is_standard ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    color: skid.is_standard ? '#10b981' : 'var(--amber)',
                  }}>
                    {skid.is_standard ? 'Standard' : 'Custom'}
                  </span>
                </td>
                <td className="px-3 py-1.5" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  {skid.date ? new Date(skid.date).getFullYear() : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs" style={{ color: 'var(--text-dim)' }}>
            No records match your search.
          </div>
        )}
      </div>
    </div>
  )
}

function Th({ children, w }: { children?: React.ReactNode; w?: number }) {
  return (
    <th className="px-3 py-2 text-left font-medium select-none" style={{
      color: 'var(--text-dim)',
      fontSize: 11,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      width: w,
      whiteSpace: 'nowrap',
      borderRight: '1px solid var(--border-light)',
    }}>
      {children}
    </th>
  )
}

function Num({ value }: { value: number | null | undefined }) {
  return (
    <td className="px-3 py-1.5" style={{ fontFamily: 'monospace' }}>
      {value != null
        ? <span style={{ color: 'var(--text)' }}>{value}</span>
        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
    </td>
  )
}
