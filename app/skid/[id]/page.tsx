import { supabase } from '@/lib/supabase'
import { Skid } from '@/lib/types'
import Link from 'next/link'
import SkidIconWrapper from '@/components/SkidIconWrapper'
import { notFound } from 'next/navigation'

export default async function SkidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await supabase.from('skids').select('*').eq('id', id).single()
  if (!data) notFound()
  const skid: Skid = data

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
          <Link href="/" className="text-sm flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
            ← Back to database
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Top section */}
        <div className="flex items-start gap-8 mb-8">
          <SkidIconWrapper
            length={skid.length_mm} width={skid.width_mm} height={skid.height_mm}
            isStandard={skid.is_standard} size={120}
          />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
                {skid.project_number}
              </h1>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
                background: skid.is_standard ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                color: skid.is_standard ? '#10b981' : 'var(--amber)',
              }}>
                {skid.is_standard ? 'Standard' : 'Custom'}
              </span>
            </div>
            {skid.vessel_name && (
              <div className="text-lg mb-1" style={{ color: 'var(--text-dim)' }}>{skid.vessel_name}</div>
            )}
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-dim)' }}>
              {skid.yard && <span>{skid.yard}</span>}
              {skid.location && <span>{skid.location.replace('_', ' ')}</span>}
              {skid.date && <span>{new Date(skid.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</span>}
            </div>
          </div>
        </div>

        {/* Spec grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Section title="Physical">
            <SpecRow label="Dimensions" value={skid.length_mm ? `${skid.length_mm} × ${skid.width_mm} × ${skid.height_mm} mm` : null} />
            <SpecRow label="Weight empty" value={skid.weight_empty_kg ? `${skid.weight_empty_kg} kg` : null} />
            <SpecRow label="Weight operational" value={skid.weight_operational_kg ? `${skid.weight_operational_kg} kg` : null} />
            <SpecRow label="Frame material" value={skid.frame_material} />
            <SpecRow label="Finish" value={skid.frame_finish} />
          </Section>

          <Section title="Pool System">
            <SpecRow label="Pool volume" value={skid.pool_volume_m3 ? `${skid.pool_volume_m3} m³` : null} />
            <SpecRow label="Dump tank" value={skid.dump_tank_volume_m3 ? `${skid.dump_tank_volume_m3} m³` : null} />
            <SpecRow label="Filter pump" value={skid.filter_pump_m3h ? `${skid.filter_pump_m3h} m³/h` : null} />
            <SpecRow label="Sand filter" value={skid.sand_filter_m3h ? `${skid.sand_filter_m3h} m³/h` : null} />
            <SpecRow label="UV steriliser" value={skid.uv_sterilizer_m3h ? `${skid.uv_sterilizer_m3h} m³/h` : null} />
          </Section>

          <Section title="Pumps">
            <SpecRow label="Jetstream A" value={skid.jetstream_pump_a_m3h ? `${skid.jetstream_pump_a_m3h} m³/h` : null} />
            <SpecRow label="Jetstream B" value={skid.jetstream_pump_b_m3h ? `${skid.jetstream_pump_b_m3h} m³/h` : null} />
            <SpecRow label="Fill pump" value={skid.fill_pump_m3h ? `${skid.fill_pump_m3h} m³/h` : null} />
            <SpecRow label="Seawater pump" value={skid.seawater_pump_m3h ? `${skid.seawater_pump_m3h} m³/h` : null} />
          </Section>

          <Section title="Heating & Treatment">
            <SpecRow label="Heaters" value={skid.heater_total_kw ? `${skid.heater_total_kw} kW (${skid.heater_count}×)` : null} />
            <SpecRow label="Heat exchanger" value={skid.heat_exchanger_kw ? `${skid.heat_exchanger_kw} kW` : null} />
            <SpecRow label="AWT dosing pumps" value={skid.awt_dosing_pumps?.toString() ?? null} />
            <SpecRow label="Seawater system" value={skid.seawater_system != null ? (skid.seawater_system ? 'Yes' : 'No') : null} />
          </Section>

          <Section title="Pipe Connections">
            <SpecRow label="Suction" value={skid.suction_dn ? `DN${skid.suction_dn}` : null} />
            <SpecRow label="Pressure" value={skid.pressure_dn ? `DN${skid.pressure_dn}` : null} />
            <SpecRow label="Overboard" value={skid.overboard_dn ? `DN${skid.overboard_dn}` : null} />
            <SpecRow label="Drain" value={skid.drain_dn ? `DN${skid.drain_dn}` : null} />
          </Section>

          {skid.notes && (
            <Section title="Notes">
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{skid.notes}</p>
            </Section>
          )}
        </div>

        {/* Source files */}
        {(skid.source_skid_url || skid.source_pid_url) && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-dim)' }}>Source files</div>
            <div className="flex gap-3">
              {skid.source_skid_url && (
                <a href={skid.source_skid_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: '#1e2d45', color: 'var(--blue)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Skid Drawing
                </a>
              )}
              {skid.source_pid_url && (
                <a href={skid.source_pid_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#1e2d45', color: 'var(--blue)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  P&amp;ID
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-dim)' }}>{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: value ? 'var(--text)' : 'var(--text-muted)', fontFamily: 'monospace' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}
