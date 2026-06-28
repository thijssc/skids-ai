'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skid } from '@/lib/types'
import SkidIconWrapper from './SkidIconWrapper'

interface Props { skids: Skid[] }

const COL_HEADER = 'text-xs uppercase tracking-wider px-4 py-3 text-left select-none'
const CELL = 'px-4 py-4 text-sm'

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
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search project or vessel..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              width: 260,
            }}
          />
        </div>
        <select
          value={yardFilter}
          onChange={e => setYardFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="all">All yards</option>
          {yards.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-dim)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)', width: 72 }}></th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Project</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Vessel</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Yard</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Location</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Pool m³</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Filter m³/h</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Jetstream m³/h</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Heater kW</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Type</th>
              <th className={COL_HEADER} style={{ color: 'var(--text-dim)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(skid => (
              <tr
                key={skid.id}
                className="skid-row"
                style={{ background: 'var(--bg-card)' }}
                onClick={() => router.push(`/skid/${skid.id}`)}
              >
                {/* 3D Icon */}
                <td className="px-3 py-2">
                  <SkidIconWrapper
                    length={skid.length_mm}
                    width={skid.width_mm}
                    height={skid.height_mm}
                    isStandard={skid.is_standard}
                    size={52}
                  />
                </td>

                {/* Project number */}
                <td className={CELL}>
                  <span className="font-bold text-white" style={{ fontFamily: 'monospace' }}>
                    {skid.project_number}
                  </span>
                </td>

                {/* Vessel */}
                <td className={CELL} style={{ color: 'var(--text-dim)' }}>
                  {skid.vessel_name || '—'}
                </td>

                {/* Yard */}
                <td className={CELL}>
                  <span className="px-2 py-0.5 rounded text-xs" style={{
                    background: skid.yard === 'Damen' ? 'rgba(59,130,246,0.1)' : 'rgba(6,182,212,0.1)',
                    color: skid.yard === 'Damen' ? 'var(--blue)' : 'var(--cyan)',
                    fontFamily: 'monospace',
                  }}>
                    {skid.yard || '—'}
                  </span>
                </td>

                {/* Location */}
                <td className={CELL} style={{ color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: 12 }}>
                  {skid.location?.replace('_', ' ') || '—'}
                </td>

                {/* Pool volume */}
                <td className={CELL}>
                  <span style={{ color: skid.pool_volume_m3 ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {skid.pool_volume_m3 ?? '—'}
                  </span>
                </td>

                {/* Filter pump */}
                <td className={CELL}>
                  <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
                    {skid.filter_pump_m3h ?? '—'}
                  </span>
                </td>

                {/* Jetstream */}
                <td className={CELL}>
                  <span style={{ fontFamily: 'monospace', color: skid.jetstream_pump_a_m3h ? 'var(--text)' : 'var(--text-muted)' }}>
                    {skid.jetstream_pump_a_m3h
                      ? `${skid.jetstream_pump_a_m3h}${skid.jetstream_pump_b_m3h ? ` + ${skid.jetstream_pump_b_m3h}` : ''}`
                      : '—'}
                  </span>
                </td>

                {/* Heater */}
                <td className={CELL}>
                  <span style={{ fontFamily: 'monospace', color: skid.heater_total_kw ? 'var(--amber)' : 'var(--text-muted)' }}>
                    {skid.heater_total_kw ?? '—'}
                  </span>
                </td>

                {/* Standard/Custom badge */}
                <td className={CELL}>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                    background: skid.is_standard ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: skid.is_standard ? '#10b981' : 'var(--amber)',
                  }}>
                    {skid.is_standard ? 'Standard' : 'Custom'}
                  </span>
                </td>

                {/* Date */}
                <td className={CELL} style={{ color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: 12 }}>
                  {skid.date ? new Date(skid.date).getFullYear() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            No skids match your search.
          </div>
        )}
      </div>
    </div>
  )
}
