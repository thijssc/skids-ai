'use client'

import dynamic from 'next/dynamic'

const SkidIcon3D = dynamic(() => import('./SkidIcon3D'), { ssr: false })

interface Props {
  length: number | null
  width: number | null
  height: number | null
  isStandard: boolean | null
  thumbnailUrl?: string | null
  size?: number
}

export default function SkidIconWrapper({ length, width, height, isStandard, thumbnailUrl, size = 56 }: Props) {
  // Show real photo/render if available
  if (thumbnailUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 5, overflow: 'hidden',
        background: 'var(--bg-hover)', border: '1px solid var(--border)', flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="Skid thumbnail"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  // Fall back to 3D box from dimensions
  if (!length || !width || !height) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 5, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-hover)', border: '1px solid var(--border)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="1" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </div>
    )
  }

  return <SkidIcon3D length={length} width={width} height={height} isStandard={!!isStandard} size={size} />
}
