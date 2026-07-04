'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface SkidResult {
  project_number: string
  vessel_name?: string
  yard?: string
  pool_volume_m3?: number
  heater_total_kw?: number
  match_score?: number
  is_standard?: boolean
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  tool_result?: SkidResult[]
}

const SUGGESTIONS = [
  'I need a skid for a 20m³ pool on main deck with 120 m³/h jetstream',
  'Find the closest match to DYA8001 but with a larger pool',
  'What standard designs do we have for Damen projects?',
  'Compare options for a 90 kW heater requirement',
]

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        tool_result: data.tool_result,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            Skid Agent
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            Describe a new RFQ and the agent finds and explains the best match
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {messages.length === 0 && (
            <div>
              <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>Ask anything about the skid database</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 640, margin: '0 auto' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s)} style={{
                    padding: '12px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.5,
                    transition: 'border-color 0.1s, color 0.1s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--blue)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                  background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-hover)',
                  color: m.role === 'user' ? 'white' : 'var(--text-dim)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  {m.role === 'user' ? 'U' : 'AI'}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-card)',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}

                  {/* Show matched skids if tool was used */}
                  {m.tool_result && Array.isArray(m.tool_result) && m.tool_result.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(m.tool_result as Array<{project_number: string; vessel_name?: string; yard?: string; pool_volume_m3?: number; heater_total_kw?: number; match_score?: number; is_standard?: boolean}>).map((skid, j) => (
                        <div key={j} style={{
                          padding: '8px 12px', borderRadius: 6, fontSize: 12,
                          background: 'var(--bg)', border: `1px solid ${j === 0 ? 'var(--blue)' : 'var(--border)'}`,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text)' }}>{skid.project_number}</span>
                            {skid.vessel_name && <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>{skid.vessel_name}</span>}
                            <span style={{ color: 'var(--text-dim)', marginLeft: 8, fontSize: 11 }}>
                              {skid.yard} · {skid.pool_volume_m3 ? `${skid.pool_volume_m3}m³` : ''} · {skid.heater_total_kw ? `${skid.heater_total_kw}kW` : ''}
                            </span>
                          </div>
                          {skid.match_score !== undefined && (
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: j === 0 ? 'var(--blue)' : 'var(--text-dim)', fontSize: 13 }}>
                              {skid.match_score}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>AI</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Describe the RFQ requirements or ask a question..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 13, outline: 'none',
                background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
            >
              Send
            </button>
          </div>
          <div style={{ maxWidth: 720, margin: '6px auto 0', fontSize: 11, color: 'var(--text-muted)' }}>
            Press Enter to send · The agent searches the live database
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
