import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Build a text description of the RFQ for embedding
  const rfqText = `
    Pool filter skid.
    Location: ${body.location || 'unknown'}.
    Pool volume: ${body.pool_volume_m3 || 'unknown'} m3.
    Filter pump: ${body.filter_pump_m3h || 'unknown'} m3/h.
    Jetstream pump: ${body.jetstream_pump_a_m3h || 'unknown'} m3/h.
    Heater total: ${body.heater_total_kw || 'unknown'} kW.
    Heat exchanger: ${body.heat_exchanger_kw || 'unknown'} kW.
    Seawater system: ${body.seawater_system ? 'yes' : 'no'}.
    AWT dosing pumps: ${body.awt_dosing_pumps || 'unknown'}.
    Suction DN: ${body.suction_dn || 'unknown'}.
  `.trim()

  // Generate embedding for the RFQ
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: rfqText,
  })
  const embedding = embeddingRes.data[0].embedding

  // Query Supabase for nearest matches
  const { data, error } = await supabaseAdmin.rpc('match_skids', {
    query_embedding: embedding,
    match_count: 3,
  })

  if (error) {
    // Fallback: if no embeddings yet, do structured matching
    const { data: all } = await supabaseAdmin.from('skids').select('*')
    if (!all) return NextResponse.json({ matches: [] })

    const scored = all.map(skid => {
      let score = 0
      if (body.location && skid.location === body.location) score += 30
      if (body.pool_volume_m3 && skid.pool_volume_m3) {
        const diff = Math.abs(body.pool_volume_m3 - skid.pool_volume_m3) / body.pool_volume_m3
        score += Math.max(0, 25 - diff * 100)
      }
      if (body.filter_pump_m3h && skid.filter_pump_m3h) {
        const diff = Math.abs(body.filter_pump_m3h - skid.filter_pump_m3h) / body.filter_pump_m3h
        score += Math.max(0, 20 - diff * 80)
      }
      if (body.jetstream_pump_a_m3h && skid.jetstream_pump_a_m3h) {
        const diff = Math.abs(body.jetstream_pump_a_m3h - skid.jetstream_pump_a_m3h) / body.jetstream_pump_a_m3h
        score += Math.max(0, 15 - diff * 60)
      }
      if (body.heater_total_kw && skid.heater_total_kw) {
        const diff = Math.abs(body.heater_total_kw - skid.heater_total_kw) / body.heater_total_kw
        score += Math.max(0, 10 - diff * 40)
      }
      return { ...skid, similarity: score / 100 }
    })

    const matches = scored.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
    return NextResponse.json({ matches })
  }

  return NextResponse.json({ matches: data || [] })
}
