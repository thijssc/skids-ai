'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Skid } from '@/lib/types'
import SkidIconWrapper from '@/components/SkidIconWrapper'

interface Field { key: string; label: string; unit?: string; type?: string }

const FIELDS: Field[] = [
  { key: 'location', label: 'Installation location', type: 'select' },
  { key: 'pool_volume_m3', label: 'Pool volume', unit: 'm³' },
  { key: 'filter_pump_m3h', label: 'Filter pump capacity', unit: 'm³/h' },
  { key: 'jetstream_pump_a_m3h', label: 'Jetstream pump', unit: 'm³/h' },
  { key: 'heater_total_kw', label: 'Total heater capacity', unit: 'kW' },
  { key: 'heat_exchanger_kw', label: 'Heat exchanger', unit: 'kW' },
  { key: 'suction_dn', label: 'Suction pipe', unit: 'DN' },
  { key: 'awt_dosing_pumps', label: 'AWT dosing pumps', unit: 'pcs' },
]

export default function MatchPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Skid[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleMatch = async () => {
    setLoading(true)
    setSearched(true)
    const body: Record<string, string | number | boolean> = {}
    for (const [k, v] of Object.entries(form)) {
      if (v === '') continue
      if (k === 'location') body[k] = v
      else if (k === 'seawater_system') body[k] = v === 'true'
      else body[k] = parseFloat(v)
    }
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setResults(data.matches || [])
    setLoading(false)
  }

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
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm" style={{ color: 'var(--text-dim)' }}>Database</Link>
            <span className="text-sm font-medium" style={{ color: 'var(--blue)' }}>RFQ Matcher</span>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">RFQ Matcher</h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Enter the specs from a new request. We&apos;ll find the closest existing skid design.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                  {f.label}{f.unit && <span className="ml-1 normal-case">({f.unit})</span>}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <option value="">Select...</option>
                    <option value="main_deck">Main deck</option>
                    <option value="upper_deck">Upper deck</option>
                    <option value="lower_deck">Lower deck</option>
                    <option value="workshop">Workshop</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="—"
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace' }}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleMatch}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg text-sm font-semibold transition-opacity"
            style={{ background: 'var(--blue)', color: 'white', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Matching...' : 'Find closest skid'}
          </button>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              {results.length} match{results.length !== 1 ? 'es' : ''} found
            </div>
            <div className="space-y-3">
              {results.map((skid, i) => (
                <Link key={skid.id} href={`/skid/${skid.id}`}>
                  <div className="rounded-xl p-4 flex items-center gap-4 transition-colors skid-row"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${i === 0 ? 'var(--blue)' : 'var(--border)'}` }}>
                    <div className="text-xl font-bold w-6 text-center" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      #{i + 1}
                    </div>
                    <SkidIconWrapper
                      length={skid.length_mm} width={skid.width_mm}
                      height={skid.height_mm} isStandard={skid.is_standard} size={48}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white" style={{ fontFamily: 'monospace' }}>{skid.project_number}</span>
                        {skid.vessel_name && <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{skid.vessel_name}</span>}
                        <span className="px-2 py-0.5 rounded-full text-xs ml-1" style={{
                          background: skid.is_standard ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: skid.is_standard ? '#10b981' : 'var(--amber)',
                        }}>
                          {skid.is_standard ? 'Standard' : 'Custom'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {skid.pool_volume_m3 && <span>Pool {skid.pool_volume_m3}m³</span>}
                        {skid.filter_pump_m3h && <span>Filter {skid.filter_pump_m3h}m³/h</span>}
                        {skid.jetstream_pump_a_m3h && <span>Jet {skid.jetstream_pump_a_m3h}m³/h</span>}
                        {skid.heater_total_kw && <span>Heat {skid.heater_total_kw}kW</span>}
                      </div>
                    </div>
                    {skid.similarity !== undefined && (
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: i === 0 ? 'var(--blue)' : 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {Math.round(skid.similarity * 100)}%
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>match</div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
