'use client'

import { useEffect, useRef } from 'react'

interface Props {
  length: number | null
  width: number | null
  height: number | null
  isStandard: boolean | null
  size?: number
}

export default function SkidIcon3D({ length, width, height, isStandard, size = 52 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    // Normalize dims
    const maxDim = Math.max(length ?? 2400, width ?? 1800, height ?? 1600)
    const L = ((length ?? 2400) / maxDim) * 0.95
    const W = ((width  ?? 1800) / maxDim) * 0.95
    const H = ((height ?? 1600) / maxDim) * 0.95

    const accent = isStandard ? '#4f8ef7' : '#f59e0b'
    const steel  = '#7a9ab5'
    const pipe   = '#5a7a95'
    const dark   = '#1e2a35'

    // Isometric projection
    const iso = (x: number, y: number, z: number, angle: number): [number, number] => {
      const rx = x * Math.cos(angle) - z * Math.sin(angle)
      const rz = x * Math.sin(angle) + z * Math.cos(angle)
      const s = size * 0.38
      const cx = size / 2
      const cy = size * 0.54
      return [
        cx + (rx - rz) * s * 0.7,
        cy - y * s + (rx + rz) * s * 0.35,
      ]
    }

    const drawFace = (
      pts: [number, number][],
      fill: string,
      stroke: string,
      alpha = 1
    ) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.6
      ctx.stroke()
      ctx.restore()
    }

    const drawLine = (a: [number, number], b: [number, number], col: string, w = 0.8, alpha = 1) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = col
      ctx.lineWidth = w
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(b[0], b[1])
      ctx.stroke()
      ctx.restore()
    }

    const drawCylinder = (
      cx: number, cy: number, cz: number,
      r: number, h: number,
      angle: number,
      fill: string, top: string
    ) => {
      // Draw as simple isometric cylinder approximation
      const b0 = iso(cx - r, cy,     cz, angle)
      const b1 = iso(cx + r, cy,     cz, angle)
      const t0 = iso(cx - r, cy + h, cz, angle)
      const t1 = iso(cx + r, cy + h, cz, angle)

      // Body
      ctx.save()
      ctx.globalAlpha = 0.92
      ctx.beginPath()
      ctx.moveTo(b0[0], b0[1])
      ctx.lineTo(t0[0], t0[1])
      ctx.lineTo(t1[0], t1[1])
      ctx.lineTo(b1[0], b1[1])
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.strokeStyle = top
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.restore()

      // Top ellipse
      const topCenter = iso(cx, cy + h, cz, angle)
      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.ellipse(topCenter[0], topCenter[1], r * size * 0.38 * 0.7, r * size * 0.38 * 0.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = top
      ctx.fill()
      ctx.restore()
    }

    let frame: number
    let angle = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // ── Box faces ────────────────────────────────────────
      const x0 = -L / 2, x1 = L / 2
      const y0 = 0,       y1 = H
      const z0 = -W / 2,  z1 = W / 2

      // Bottom face
      drawFace([
        iso(x0, y0, z0, angle), iso(x1, y0, z0, angle),
        iso(x1, y0, z1, angle), iso(x0, y0, z1, angle),
      ], dark, steel, 0.5)

      // Back-left face
      drawFace([
        iso(x0, y0, z0, angle), iso(x0, y1, z0, angle),
        iso(x0, y1, z1, angle), iso(x0, y0, z1, angle),
      ], '#1a2530', accent, 0.25)

      // Back-right face
      drawFace([
        iso(x0, y0, z0, angle), iso(x1, y0, z0, angle),
        iso(x1, y1, z0, angle), iso(x0, y1, z0, angle),
      ], '#1a2530', accent, 0.18)

      // ── Base rails ───────────────────────────────────────
      const railY = 0.03
      drawLine(iso(x0, railY, z0 + 0.08, angle), iso(x1, railY, z0 + 0.08, angle), steel, 1.2, 0.8)
      drawLine(iso(x0, railY, z1 - 0.08, angle), iso(x1, railY, z1 - 0.08, angle), steel, 1.2, 0.8)
      // cross beams
      for (let i = 0; i <= 3; i++) {
        const bx = x0 + (L / 3) * i
        drawLine(iso(bx, railY, z0 + 0.08, angle), iso(bx, railY, z1 - 0.08, angle), steel, 0.7, 0.6)
      }

      // ── Vertical corner posts ────────────────────────────
      const posts = [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04],
                     [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]] as [number, number][]
      for (const [px, pz] of posts) {
        drawLine(iso(px, 0, pz, angle), iso(px, H, pz, angle), steel, 1, 0.7)
      }

      // ── Pump cylinders ───────────────────────────────────
      const pumpH = H * 0.42
      const pR = Math.min(L, W) * 0.1
      drawCylinder(-L * 0.22, 0.06, 0, pR, pumpH, angle, accent + 'cc', accent)
      drawCylinder( L * 0.08, 0.06, 0, pR, pumpH, angle, accent + '99', accent + 'bb')

      // ── Filter vessel ─────────────────────────────────────
      const fH = H * 0.65
      const fR = Math.min(L, W) * 0.085
      drawCylinder(L * 0.33, 0.06, 0, fR, fH, angle, steel + 'cc', '#aac8e0')

      // ── Horizontal pipe ──────────────────────────────────
      const pipeY = H * 0.48
      drawLine(iso(x0 + 0.08, pipeY, 0, angle), iso(x1 - 0.06, pipeY, 0, angle), pipe, 1.4, 0.85)

      // ── Top frame ────────────────────────────────────────
      drawFace([
        iso(x0, y1, z0, angle), iso(x1, y1, z0, angle),
        iso(x1, y1, z1, angle), iso(x0, y1, z1, angle),
      ], '#223040', accent, 0.18)

      // Top + front edges
      const topEdgePts = [
        iso(x0, y1, z0, angle), iso(x1, y1, z0, angle),
        iso(x1, y1, z1, angle), iso(x0, y1, z1, angle),
      ]
      ctx.save()
      ctx.globalAlpha = 0.65
      ctx.strokeStyle = accent
      ctx.lineWidth = 0.9
      ctx.beginPath()
      ctx.moveTo(topEdgePts[0][0], topEdgePts[0][1])
      for (const p of topEdgePts) ctx.lineTo(p[0], p[1])
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Front faces (semi-transparent)
      drawFace([
        iso(x1, y0, z0, angle), iso(x1, y1, z0, angle),
        iso(x1, y1, z1, angle), iso(x1, y0, z1, angle),
      ], '#1e3040', accent, 0.2)
      drawFace([
        iso(x0, y0, z1, angle), iso(x1, y0, z1, angle),
        iso(x1, y1, z1, angle), iso(x0, y1, z1, angle),
      ], '#1e3040', accent, 0.15)

      // Accent dot (standard indicator)
      if (isStandard) {
        const dot = iso(x1 - 0.08, y1 + 0.04, z0 + 0.08, angle)
        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.arc(dot[0], dot[1], 2, 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.fill()
        ctx.restore()
      }

      angle += 0.012
      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [length, width, height, isStandard, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: size, height: size }}
    />
  )
}
