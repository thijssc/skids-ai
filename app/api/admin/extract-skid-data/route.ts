import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { project_number } = await req.json()

  // Get skid drawing URL from database
  const { data: skid } = await supabase
    .from('skids')
    .select('id, project_number, source_skid_url, vessel_name')
    .eq('project_number', project_number)
    .single()

  if (!skid?.source_skid_url || skid.source_skid_url === 'MISSING') {
    return NextResponse.json({ error: 'No skid drawing URL' }, { status: 400 })
  }

  // Download PDF from SharePoint
  let pdfResponse: Response
  try {
    pdfResponse = await fetch(skid.source_skid_url, {
      headers: {
        'Accept': 'application/pdf,*/*',
      },
    })
    if (!pdfResponse.ok) throw new Error(`HTTP ${pdfResponse.status}`)
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not fetch PDF: ' + e.message }, { status: 502 })
  }

  const pdfBuffer = await pdfResponse.arrayBuffer()
  const base64Pdf = Buffer.from(pdfBuffer).toString('base64')

  // Send to OpenAI Vision as a file
  const prompt = `You are analyzing a yacht pool filtration SKID DRAWING (technical engineering drawing / assembly drawing).

Extract the following information from this drawing:
1. Skid dimensions: length (mm), width (mm), height (mm) - look in the title block, revision block, or dimension annotations
2. Location on the vessel: where is the skid installed? (e.g. "Engine Room Deck 2", "Spa Room", "Technical Space Deck 1", etc.)
3. Pool volume in m³ (if mentioned)
4. Filter type (Sandfilter, Cartridge filter, Multimedia filter, etc.)
5. Year of the drawing (from title block date, e.g. "2024")
6. Is this a standard/modular skid design? (true if it follows a repeated template, false if fully custom)

Return ONLY valid JSON (no markdown, no explanation):
{
  "length_mm": <number or null>,
  "width_mm": <number or null>,
  "height_mm": <number or null>,
  "location": <string or null>,
  "pool_volume_m3": <number or null>,
  "filter_type": <string or null>,
  "year": <number or null>,
  "is_standard": <boolean or null>,
  "confidence": "high" | "medium" | "low",
  "notes": "<brief note on what was found>"
}`

  let extracted: any = null
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${base64Pdf}`,
              detail: 'high',
            },
          },
        ],
      }],
    })

    const text = response.choices[0].message.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) extracted = JSON.parse(jsonMatch[0])
  } catch (e: any) {
    return NextResponse.json({ error: 'OpenAI error: ' + e.message }, { status: 500 })
  }

  if (!extracted) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  // Update database with extracted data
  const updatePayload: any = {}
  if (extracted.length_mm)     updatePayload.length_mm = extracted.length_mm
  if (extracted.width_mm)      updatePayload.width_mm = extracted.width_mm
  if (extracted.height_mm)     updatePayload.height_mm = extracted.height_mm
  if (extracted.location)      updatePayload.location = extracted.location
  if (extracted.pool_volume_m3) updatePayload.pool_volume_m3 = extracted.pool_volume_m3
  if (extracted.filter_type)   updatePayload.filter_type = extracted.filter_type
  if (extracted.year)          updatePayload.year = extracted.year
  if (extracted.is_standard !== null) updatePayload.is_standard = extracted.is_standard

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from('skids').update(updatePayload).eq('id', skid.id)
  }

  return NextResponse.json({ success: true, extracted, updated: updatePayload })
}
