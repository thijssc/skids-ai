import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a filtration skid expert assistant for Seable&Co., a yacht systems engineering company. You help engineers find the best matching skid design from the historical project database.

When a user describes a new RFQ or asks about skid requirements, use the search_skids tool to find matches. Then give a clear recommendation in plain language — which skid fits best and why, and what modifications might be needed.

Be concise and technical. Use metric units. Always call search_skids before giving a recommendation.`

const tools: Anthropic.Tool[] = [
  {
    name: 'search_skids',
    description: 'Search the skid database for matching designs based on specifications. Returns the top matching skids with similarity scores.',
    input_schema: {
      type: 'object' as const,
      properties: {
        location: { type: 'string', enum: ['main_deck', 'upper_deck', 'lower_deck', 'workshop'], description: 'Installation location on the vessel' },
        pool_volume_m3: { type: 'number', description: 'Pool volume in cubic metres' },
        filter_pump_m3h: { type: 'number', description: 'Filter pump capacity in m³/h' },
        jetstream_pump_a_m3h: { type: 'number', description: 'Jetstream pump capacity in m³/h' },
        heater_total_kw: { type: 'number', description: 'Total heater capacity in kW' },
        heat_exchanger_kw: { type: 'number', description: 'Heat exchanger capacity in kW' },
        is_standard: { type: 'boolean', description: 'Filter for standard designs only' },
      },
      required: [],
    },
  },
  {
    name: 'get_skid_details',
    description: 'Get full details of a specific skid by project number.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_number: { type: 'string', description: 'The project number, e.g. DYA8001' },
      },
      required: ['project_number'],
    },
  },
]

async function searchSkids(params: Record<string, unknown>) {
  let query = supabaseAdmin.from('skids').select('*')
  if (params.location) query = query.eq('location', params.location)
  if (params.is_standard !== undefined) query = query.eq('is_standard', params.is_standard)
  const { data } = await query.order('date', { ascending: false })
  if (!data) return []

  const scored = data.map(skid => {
    let score = 100
    let factors = 0
    if (params.pool_volume_m3 && skid.pool_volume_m3) {
      const diff = Math.abs((params.pool_volume_m3 as number) - skid.pool_volume_m3) / (params.pool_volume_m3 as number)
      score -= diff * 40; factors++
    }
    if (params.filter_pump_m3h && skid.filter_pump_m3h) {
      const diff = Math.abs((params.filter_pump_m3h as number) - skid.filter_pump_m3h) / (params.filter_pump_m3h as number)
      score -= diff * 30; factors++
    }
    if (params.jetstream_pump_a_m3h && skid.jetstream_pump_a_m3h) {
      const diff = Math.abs((params.jetstream_pump_a_m3h as number) - skid.jetstream_pump_a_m3h) / (params.jetstream_pump_a_m3h as number)
      score -= diff * 20; factors++
    }
    if (params.heater_total_kw && skid.heater_total_kw) {
      const diff = Math.abs((params.heater_total_kw as number) - skid.heater_total_kw) / (params.heater_total_kw as number)
      score -= diff * 10; factors++
    }
    return { ...skid, match_score: Math.max(0, Math.round(score)), factors }
  })

  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, 3)
}

async function getSkidDetails(projectNumber: string) {
  const { data } = await supabaseAdmin.from('skids').select('*').eq('project_number', projectNumber).single()
  return data
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM,
    tools,
    messages,
  })

  // Handle tool use
  if (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock
    let toolResult: unknown

    if (toolUse.name === 'search_skids') {
      toolResult = await searchSkids(toolUse.input as Record<string, unknown>)
    } else if (toolUse.name === 'get_skid_details') {
      toolResult = await getSkidDetails((toolUse.input as { project_number: string }).project_number)
    }

    // Continue with tool result
    const followUp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      tools,
      messages: [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(toolResult) }] },
      ],
    })

    const text = followUp.content.find(b => b.type === 'text') as Anthropic.TextBlock
    return NextResponse.json({ reply: text?.text ?? '', tool_used: toolUse.name, tool_result: toolResult })
  }

  const text = response.content.find(b => b.type === 'text') as Anthropic.TextBlock
  return NextResponse.json({ reply: text?.text ?? '' })
}
