'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Skid } from '@/lib/types'
import SkidIconWrapper from '@/components/SkidIconWrapper'
import Sidebar from '@/components/Sidebar'

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Page header */}
        <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0 }}>RFQ Matcher</h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>Enter specs to find the closest existing skid design</p>
        </div>

        <div style={{ padding: 24, maxWidth: 800 }}>
          {/* Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {f.label}{f.unit && <span style={{ marginLeft: 4, textTransform: 'none', fontWeight: 400 }}>({f.unit})</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.key] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, outline: 'none', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
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
                      style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, outline: 'none', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleMatch}
              disabled={loading}
              style={{ marginTop: 20, width: '100%', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: 'var(--blue)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Matching...' : 'Find closest skid'}
            </button>
          </div>

          {/* Results */}
          {searched && !loading && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
                {results.length} match{results.length !== 1 ? 'es' : ''} found
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map((skid, i) => (
                  <Link key={skid.id} href={`/skid/${skid.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${i === 0 ? 'var(--blue)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      cursor: 'pointer',
                    }}>
                      <div style={{ fontWeight: 700, width: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        #{i + 1}
                      </div>
                      <SkidIconWrapper length={skid.length_mm} width={skid.width_mm} height={skid.height_mm} isStandard={skid.is_standard} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace', fontSize: 13 }}>{skid.project_number}</span>
                          {skid.vessel_name && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{skid.vessel_name}</span>}
                          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: skid.is_standard ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: skid.is_standard ? '#10b981' : 'var(--amber)' }}>
                            {skid.is_standard ? 'Standard' : 'Custom'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {skid.pool_volume_m3 && <span>Pool {skid.pool_volume_m3}m³</span>}
                          {skid.filter_pump_m3h && <span>Filter {skid.filter_pump_m3h}m³/h</span>}
                          {skid.jetstream_pump_a_m3h && <span>Jet {skid.jetstream_pump_a_m3h}m³/h</span>}
                          {skid.heater_total_kw && <span>Heat {skid.heater_total_kw}kW</span>}
                        </div>
                      </div>
                      {skid.similarity !== undefined && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? 'var(--blue)' : 'var(--text-dim)', fontFamily: 'monospace' }}>
                            {Math.round(skid.similarity * 100)}%
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>match</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
