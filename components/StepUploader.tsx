'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'idle' | 'extracting' | 'parsing' | 'rendering' | 'done' | 'error'

interface SkidOption { id: number; project_number: string; vessel_name: string | null }

export default function StepUploader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [skids, setSkids] = useState<SkidOption[]>([])
  const [selectedSkidId, setSelectedSkidId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    supabase.from('skids').select('id, project_number, vessel_name').order('project_number')
      .then(({ data }) => setSkids(data || []))
  }, [])

  const processStepBuffer = useCallback(async (buffer: ArrayBuffer, filename: string) => {
    setStatus('parsing')
    setStatusMsg(`Parsing STEP: ${filename}…`)

    try {
      // Run OCCT in a Web Worker to avoid blocking the main thread
      const result = await new Promise<any>((resolve, reject) => {
        const worker = new Worker('/occt-import-js-worker.js')
        worker.onmessage = (e) => { resolve(e.data); worker.terminate() }
        worker.onerror = (e) => { reject(new Error(e.message)); worker.terminate() }
        worker.postMessage({ format: 'step', buffer: new Uint8Array(buffer), params: null })
      })

      if (!result.success) {
        setStatus('error')
        setStatusMsg('OCCT kon het STEP bestand niet lezen')
        return
      }

      setStatus('rendering')
      setStatusMsg('Rendering 3D model…')

      // Build Three.js scene from OCCT mesh data
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a2332)

      const group = new THREE.Group()
      scene.add(group)

      let minY = Infinity, maxY = -Infinity
      let minX = Infinity, maxX = -Infinity
      let minZ = Infinity, maxZ = -Infinity

      const meshColors = [
        0x7a9ab5, 0x4f8ef7, 0x5ba08a, 0xc0c8d0, 0x8899aa,
        0x6688bb, 0x9ab0c0, 0x4a7a9b, 0xa0b4c4, 0x3d6f8f,
      ]

      result.meshes.forEach((mesh: any, i: number) => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3))
        if (mesh.attributes.normal) {
          geo.setAttribute('normal', new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3))
        }
        if (mesh.index) {
          geo.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.index.array), 1))
        }
        geo.computeBoundingBox()
        geo.computeVertexNormals()

        // Track bounds
        const pos = mesh.attributes.position.array
        for (let j = 0; j < pos.length; j += 3) {
          if (pos[j]   < minX) minX = pos[j]
          if (pos[j]   > maxX) maxX = pos[j]
          if (pos[j+1] < minY) minY = pos[j+1]
          if (pos[j+1] > maxY) maxY = pos[j+1]
          if (pos[j+2] < minZ) minZ = pos[j+2]
          if (pos[j+2] > maxZ) maxZ = pos[j+2]
        }

        const color = mesh.color
          ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
          : new THREE.Color(meshColors[i % meshColors.length])

        const mat = new THREE.MeshPhongMaterial({
          color,
          shininess: 60,
          specular: new THREE.Color(0x334455),
          side: THREE.DoubleSide,
        })
        group.add(new THREE.Mesh(geo, mat))
      })

      // Center model
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      const cz = (minZ + maxZ) / 2
      group.position.set(-cx, -cy, -cz)

      // Camera
      const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ)
      const camera = new THREE.PerspectiveCamera(40, 1, span * 0.001, span * 100)
      camera.position.set(span * 0.8, span * 0.6, span * 0.9)
      camera.lookAt(0, 0, 0)

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const sun = new THREE.DirectionalLight(0xffffff, 1.2)
      sun.position.set(span, span * 1.5, span)
      scene.add(sun)
      const fill = new THREE.DirectionalLight(0x88aacc, 0.4)
      fill.position.set(-span, span * 0.5, -span)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.3)
      rim.position.set(0, -span, 0)
      scene.add(rim)

      // Render to canvas
      const SIZE = 400
      const canvas = canvasRef.current!
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
      renderer.setSize(SIZE, SIZE)
      renderer.setPixelRatio(2)
      renderer.shadowMap.enabled = true
      rendererRef.current = renderer

      // Render a nice angle (isometric-ish)
      group.rotation.x = -0.35
      group.rotation.y = 0.65
      renderer.render(scene, camera)

      // Capture PNG
      const png = canvas.toDataURL('image/png')
      setThumbnailUrl(png)
      setStatus('done')
      setStatusMsg(`${result.meshes.length} meshes geladen`)

      // Start slow spin for preview
      let angle = group.rotation.y
      let frame: number
      const spin = () => {
        frame = requestAnimationFrame(spin)
        angle += 0.008
        group.rotation.y = angle
        renderer.render(scene, camera)
        // Update PNG periodically for the "best angle" save
        if (Math.abs((angle % (Math.PI * 2)) - 0.65) < 0.01) {
          setThumbnailUrl(canvas.toDataURL('image/png'))
        }
      }
      spin()

      return () => cancelAnimationFrame(frame)
    } catch (e: any) {
      setStatus('error')
      setStatusMsg('Fout: ' + e.message)
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setSaved(false)
    setThumbnailUrl(null)
    rendererRef.current?.dispose()

    if (file.name.toLowerCase().endsWith('.zip')) {
      setStatus('extracting')
      setStatusMsg('ZIP uitpakken…')
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(await file.arrayBuffer())
      const stepFile = Object.keys(zip.files).find(n =>
        n.toLowerCase().endsWith('.stp') || n.toLowerCase().endsWith('.step')
      )
      if (!stepFile) {
        setStatus('error')
        setStatusMsg('Geen .stp of .step bestand gevonden in ZIP')
        return
      }
      setStatusMsg(`Gevonden: ${stepFile}`)
      const buf = await zip.files[stepFile].async('arraybuffer')
      await processStepBuffer(buf, stepFile)
    } else if (file.name.match(/\.(stp|step)$/i)) {
      await processStepBuffer(await file.arrayBuffer(), file.name)
    } else {
      setStatus('error')
      setStatusMsg('Alleen .zip, .stp of .step bestanden')
    }
  }, [processStepBuffer])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const saveThumbnail = async () => {
    if (!thumbnailUrl || !selectedSkidId) return
    setSaving(true)

    // Convert dataURL to blob
    const res = await fetch(thumbnailUrl)
    const blob = await res.blob()
    const filename = `skid_${selectedSkidId}_${Date.now()}.png`

    const { error: upErr } = await supabase.storage
      .from('thumbnails')
      .upload(filename, blob, { contentType: 'image/png', upsert: true })

    if (upErr) {
      setStatusMsg('Storage fout: ' + upErr.message)
      setSaving(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(filename)

    const { error: dbErr } = await supabase.from('skids')
      .update({ thumbnail_url: publicUrl })
      .eq('id', selectedSkidId)

    if (dbErr) {
      setStatusMsg('DB fout: ' + dbErr.message)
    } else {
      setSaved(true)
      setStatusMsg('Thumbnail opgeslagen!')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById('step-input')?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(79,142,247,0.05)' : 'var(--bg-card)',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
          Sleep ZIP of STEP bestand hier
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          .zip (production package) · .stp · .step
        </div>
        <input id="step-input" type="file" accept=".zip,.stp,.step" onChange={onFileInput} style={{ display: 'none' }} />
      </div>

      {/* Status */}
      {status !== 'idle' && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 12,
          background: status === 'error' ? 'rgba(239,68,68,0.1)' : status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(79,142,247,0.08)',
          color: status === 'error' ? 'var(--red)' : status === 'done' ? 'var(--green)' : 'var(--blue)',
          border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.2)' : status === 'done' ? 'rgba(34,197,94,0.2)' : 'rgba(79,142,247,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {status !== 'done' && status !== 'error' && (
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          )}
          {statusMsg}
        </div>
      )}

      {/* Preview + save */}
      {status === 'done' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Canvas preview */}
          <div style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: 280, height: 280 }} />
          </div>

          {/* Save controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                KOPPEL AAN PROJECT
              </label>
              <select
                value={selectedSkidId ?? ''}
                onChange={e => setSelectedSkidId(Number(e.target.value))}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13,
                  background: 'var(--bg-hover)', border: '1px solid var(--border)',
                  color: 'var(--text)', outline: 'none',
                }}
              >
                <option value="">— selecteer project —</option>
                {skids.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.project_number}{s.vessel_name ? ` — ${s.vessel_name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveThumbnail}
              disabled={!selectedSkidId || saving || saved}
              style={{
                padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: selectedSkidId && !saving && !saved ? 'pointer' : 'default',
                background: saved ? 'var(--green)' : 'var(--blue)',
                color: 'white', opacity: (!selectedSkidId || saving) ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {saved ? '✓ Opgeslagen' : saving ? 'Uploaden…' : 'Opslaan als thumbnail'}
            </button>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              De thumbnail wordt opgeslagen in Supabase Storage en verschijnt direct als preview-icon in de database tabel.
            </p>
          </div>
        </div>
      )}

      {/* Canvas hidden until file loaded */}
      {status !== 'done' && (
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
