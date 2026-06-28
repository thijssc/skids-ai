import { supabase } from '@/lib/supabase'
import { Skid } from '@/lib/types'
import SkidIconWrapper from '@/components/SkidIconWrapper'
import Sidebar from '@/components/Sidebar'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function SkidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await supabase.from('skids').select('*').eq('id', id).single()
  if (!data) notFound()
  const skid: Skid = data

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Page header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SkidIconWrapper length={skid.length_mm} width={skid.width_mm} height={skid.height_mm} isStandard={skid.is_standard} size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: 0, fontFamily: 'monospace' }}>{skid.project_number}</h1>
                {skid.vessel_name && <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{skid.vessel_name}</span>}
                <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: skid.is_standard ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: skid.is_standard ? '#10b981' : 'var(--amber)' }}>
                  {skid.is_standard ? 'Standard' : 'Custom'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {[skid.yard, skid.location?.replace(/_/g, ' '), skid.date ? new Date(skid.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) : null].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        </div>

        {/* Spec grid */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 1000 }}>
          <Section title="Physical">
            <Row label="Dimensions" value={skid.length_mm ? `${skid.length_mm} × ${skid.width_mm} × ${skid.height_mm} mm` : null} />
            <Row label="Weight empty" value={skid.weight_empty_kg ? `${skid.weight_empty_kg} kg` : null} />
            <Row label="Weight operational" value={skid.weight_operational_kg ? `${skid.weight_operational_kg} kg` : null} />
            <Row label="Frame material" value={skid.frame_material} />
            <Row label="Finish" value={skid.frame_finish} />
          </Section>

          <Section title="Pool System">
            <Row label="Pool volume" value={skid.pool_volume_m3 ? `${skid.pool_volume_m3} m³` : null} />
            <Row label="Dump tank" value={skid.dump_tank_volume_m3 ? `${skid.dump_tank_volume_m3} m³` : null} />
            <Row label="Filter pump" value={skid.filter_pump_m3h ? `${skid.filter_pump_m3h} m³/h` : null} />
            <Row label="Sand filter" value={skid.sand_filter_m3h ? `${skid.sand_filter_m3h} m³/h` : null} />
            <Row label="UV steriliser" value={skid.uv_sterilizer_m3h ? `${skid.uv_sterilizer_m3h} m³/h` : null} />
          </Section>

          <Section title="Pumps">
            <Row label="Jetstream A" value={skid.jetstream_pump_a_m3h ? `${skid.jetstream_pump_a_m3h} m³/h` : null} />
            <Row label="Jetstream B" value={skid.jetstream_pump_b_m3h ? `${skid.jetstream_pump_b_m3h} m³/h` : null} />
            <Row label="Fill pump" value={skid.fill_pump_m3h ? `${skid.fill_pump_m3h} m³/h` : null} />
            <Row label="Seawater pump" value={skid.seawater_pump_m3h ? `${skid.seawater_pump_m3h} m³/h` : null} />
          </Section>

          <Section title="Heating & Treatment">
            <Row label="Heaters" value={skid.heater_total_kw ? `${skid.heater_total_kw} kW (${skid.heater_count}×)` : null} highlight="amber" />
            <Row label="Heat exchanger" value={skid.heat_exchanger_kw ? `${skid.heat_exchanger_kw} kW` : null} />
            <Row label="AWT dosing pumps" value={skid.awt_dosing_pumps?.toString() ?? null} />
            <Row label="Seawater system" value={skid.seawater_system != null ? (skid.seawater_system ? 'Yes' : 'No') : null} />
          </Section>

          <Section title="Pipe Connections">
            <Row label="Suction" value={skid.suction_dn ? `DN${skid.suction_dn}` : null} />
            <Row label="Pressure" value={skid.pressure_dn ? `DN${skid.pressure_dn}` : null} />
            <Row label="Overboard" value={skid.overboard_dn ? `DN${skid.overboard_dn}` : null} />
            <Row label="Drain" value={skid.drain_dn ? `DN${skid.drain_dn}` : null} />
          </Section>

          {skid.notes && (
            <Section title="Notes">
              <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>{skid.notes}</p>
            </Section>
          )}
        </div>

        {/* Source files */}
        {(skid.source_skid_url || skid.source_pid_url) && (
          <div style={{ margin: '0 24px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Source files</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {skid.source_skid_url && (
                <a href={skid.source_skid_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, background: 'var(--bg-hover)', color: 'var(--blue)', fontSize: 12, textDecoration: 'none' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  Skid Drawing
                </a>
              )}
              {skid.source_pid_url && (
                <a href={skid.source_pid_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6, background: 'var(--bg-hover)', color: 'var(--blue)', fontSize: 12, textDecoration: 'none' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  P&amp;ID
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: value ? (highlight === 'amber' ? 'var(--amber)' : 'var(--text)') : 'var(--text-muted)' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}
