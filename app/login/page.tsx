'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/'

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/auth?from=${encodeURIComponent(from)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      const { redirect } = await res.json()
      router.push(redirect)
    } else {
      setError('Wachtwoord onjuist')
      setLoading(false)
      setPassword('')
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-jakarta), sans-serif',
    }}>
      <div style={{
        width: 360, padding: '40px 36px', borderRadius: 16,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            SKIDS<span style={{ color: 'var(--blue)' }}>.AI</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6 }}>
            Seable&amp;Co. — intern portaal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Wachtwoord
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
                background: 'var(--bg-hover)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
            />
            {error && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6 }}>{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || loading}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', cursor: password && !loading ? 'pointer' : 'default',
              background: 'var(--blue)', color: 'white',
              opacity: !password || loading ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
