'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  length: number
  width: number
  height: number
  isStandard: boolean
  size?: number
}

export default function SkidIcon3D({ length, width, height, isStandard, size = 56 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(2.5, 1.8, 2.5)
    camera.lookAt(0, 0, 0)

    // Normalize dimensions
    const max = Math.max(length, width, height)
    const l = (length / max) * 1.4
    const w = (width / max) * 1.4
    const h = (height / max) * 1.4

    const color = isStandard ? 0x3b82f6 : 0xf59e0b

    // Solid box
    const geo = new THREE.BoxGeometry(l, h, w)
    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.15,
    })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    // Wireframe edges
    const edges = new THREE.EdgesGeometry(geo)
    const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    scene.add(wireframe)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(color, 1.2)
    dir.position.set(2, 3, 2)
    scene.add(dir)

    // Animate slow rotation
    let frame: number
    let angle = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      angle += 0.008
      mesh.rotation.y = angle
      wireframe.rotation.y = angle
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
    }
  }, [length, width, height, isStandard, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}
