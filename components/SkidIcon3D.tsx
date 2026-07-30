'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

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

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(3.2, 2.2, 3.2)
    camera.lookAt(0, 0, 0)

    // Normalize to unit scale
    const max = Math.max(length ?? 2400, width ?? 1200, height ?? 1600)
    const l = ((length ?? 2400) / max) * 1.6
    const w = ((width ?? 1200) / max) * 1.6
    const h = ((height ?? 1600) / max) * 1.6

    const accentColor = isStandard ? 0x4f8ef7 : 0xf59e0b
    const steelColor  = 0x8899aa
    const pipeColor   = 0x6688aa

    const root = new THREE.Group()
    scene.add(root)

    // ── Frame box (wireframe) ──────────────────────────────
    const frameGeo = new THREE.BoxGeometry(l, h, w)
    const frameMat = new THREE.MeshPhongMaterial({
      color: accentColor, transparent: true, opacity: 0.06,
    })
    root.add(new THREE.Mesh(frameGeo, frameMat))

    const edges = new THREE.EdgesGeometry(frameGeo)
    const edgeMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.75 })
    root.add(new THREE.LineSegments(edges, edgeMat))

    // ── Helper: tube ──────────────────────────────────────
    const tube = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      r: number, col: number, op = 1
    ) => {
      const dir = new THREE.Vector3(bx - ax, by - ay, bz - az)
      const len = dir.length()
      const geo = new THREE.CylinderGeometry(r, r, len, 6)
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: op < 1, opacity: op })
      const m = new THREE.Mesh(geo, mat)
      const mid = new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2)
      m.position.copy(mid)
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
      root.add(m)
    }

    // ── Base frame rails ──────────────────────────────────
    const rr = 0.035
    const hy = -h / 2 + 0.04
    tube(-l / 2, hy, -w / 2 + 0.07, l / 2, hy, -w / 2 + 0.07, rr, steelColor)
    tube(-l / 2, hy,  w / 2 - 0.07, l / 2, hy,  w / 2 - 0.07, rr, steelColor)
    // cross beams
    const beams = 3
    for (let i = 0; i <= beams; i++) {
      const x = -l / 2 + (l / beams) * i
      tube(x, hy, -w / 2 + 0.07, x, hy, w / 2 - 0.07, rr * 0.7, steelColor)
    }

    // ── Vertical corner posts ─────────────────────────────
    const pr = 0.03
    const corners = [
      [-l / 2 + 0.05, -w / 2 + 0.05],
      [ l / 2 - 0.05, -w / 2 + 0.05],
      [-l / 2 + 0.05,  w / 2 - 0.05],
      [ l / 2 - 0.05,  w / 2 - 0.05],
    ]
    for (const [cx, cz] of corners) {
      tube(cx, -h / 2, cz, cx, h / 2, cz, pr, steelColor)
    }

    // ── Pump cylinders ────────────────────────────────────
    const pumpPositions = [
      { x: -l * 0.28, z: 0 },
      {  x: l * 0.1,  z: 0 },
    ]
    const pumpH = h * 0.45
    const pumpR = Math.min(w, l) * 0.12
    for (const { x, z } of pumpPositions) {
      // body
      const pg = new THREE.CylinderGeometry(pumpR, pumpR, pumpH, 10)
      const pm = new THREE.MeshPhongMaterial({ color: accentColor, transparent: true, opacity: 0.85 })
      const pm2 = new THREE.Mesh(pg, pm)
      pm2.position.set(x, -h / 2 + pumpH / 2 + 0.06, z)
      root.add(pm2)
      // top cap ring
      const rg = new THREE.TorusGeometry(pumpR, 0.018, 6, 16)
      const rm = new THREE.MeshPhongMaterial({ color: steelColor })
      const ring = new THREE.Mesh(rg, rm)
      ring.rotation.x = Math.PI / 2
      ring.position.set(x, -h / 2 + pumpH + 0.04, z)
      root.add(ring)
    }

    // ── Filter vessel (tall cylinder on right) ───────────
    const fH = h * 0.72
    const fR = Math.min(w, l) * 0.10
    const fx = l * 0.35
    const fg = new THREE.CylinderGeometry(fR, fR * 0.95, fH, 12)
    const fm = new THREE.MeshPhongMaterial({ color: steelColor, transparent: true, opacity: 0.9 })
    const fmesh = new THREE.Mesh(fg, fm)
    fmesh.position.set(fx, -h / 2 + fH / 2 + 0.06, 0)
    root.add(fmesh)
    // filter dome
    const dg = new THREE.SphereGeometry(fR, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2)
    const dm = new THREE.MeshPhongMaterial({ color: steelColor, transparent: true, opacity: 0.7 })
    const dome = new THREE.Mesh(dg, dm)
    dome.position.set(fx, -h / 2 + fH + 0.06, 0)
    root.add(dome)

    // ── Horizontal piping ─────────────────────────────────
    const py = -h / 2 + pumpH + 0.12
    tube(-l / 2 + 0.1, py, 0, l / 2 - 0.1, py, 0, 0.025, pipeColor, 0.9)
    // branch down to pumps
    for (const { x, z } of pumpPositions) {
      tube(x, -h / 2 + pumpH + 0.06, z, x, py, z, 0.022, pipeColor, 0.9)
    }
    // branch to filter
    tube(fx, py, 0, fx, -h / 2 + fH + 0.06, 0, 0.022, pipeColor, 0.9)

    // ── Lighting ──────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 1.1)
    sun.position.set(3, 5, 3)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(accentColor, 0.4)
    fill.position.set(-3, 1, -2)
    scene.add(fill)

    // ── Animate ───────────────────────────────────────────
    let frame: number
    let angle = Math.random() * Math.PI * 2
    const animate = () => {
      frame = requestAnimationFrame(animate)
      angle += 0.007
      root.rotation.y = angle
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer!.dispose()
    }
  }, [length, width, height, isStandard, size])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block' }} />
}
