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

  return <SkidIcon3D length={length} width={width} height={height} isStandard={isStandard} size={size} />
}
