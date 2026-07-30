'use client'

import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'

const StepUploader = dynamic(() => import('@/components/StepUploader'), { ssr: false })

export default function UploadPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            STEP Thumbnail Generator
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
            Sleep een production ZIP of .stp/.step bestand → thumbnail wordt gegenereerd en opgeslagen
          </p>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <StepUploader />
        </div>
      </main>
    </div>
  )
}
