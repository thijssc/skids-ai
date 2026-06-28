'use client'

import dynamic from 'next/dynamic'

const SkidIcon3D = dynamic(() => import('./SkidIcon3D'), { ssr: false })

interface Props {
  length: number | null
  width: number | null
  height: number | null
  isStandard: boolean | null
  size?: number
}

export default function SkidIconWrapper({ length, width, height, isStandard, size = 56 }: Props) {
  if (!length || !width || !height) {
    // Fallback placeholder when no dimensions available
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded border border-[#1e2d45] bg-[#0d1421]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="1" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </div>
    )
  }

  return <SkidIcon3D length={length} width={width} height={height} isStandard={!!isStandard} size={size} />
}
