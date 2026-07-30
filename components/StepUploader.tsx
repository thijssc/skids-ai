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
  // Renderer owns its own canvas — never attached to React DOM tree
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef    = useRef<THREE.Scene | null>(null)
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef    = useRef<number>(0)

  const [status, setStatus]       = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)  // data URL for <img> preview
  const [skids, setSkids]         = useState<SkidOption[]>([])
  const [selectedSkidId, setSelectedSkidId] = useState<number | null>(null)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [dragOver, setDragOver]   = useState(false)

  useEffect(() => {
    supabase.from('skids').select('id, project_number, vessel_name').order('project_number')
      .then(({ data }) => setSkids(data || []))
    return () => {
      cancelAnimationFrame(frameRef.current)
      rendererRef.current?.dispose()
    }
  }, [])

  const processStepBuffer = useCallback(async (buffer: ArrayBuffer, filename: string) => {
    cancelAnimationFrame(frameRef.current)
    rendererRef.current?.dispose()
    rendererRef.current = null
    setPreviewUrl(null)

    setStatus('parsing')
    setStatusMsg(`Parsing STEP: ${filename}…`)

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const worker = new Worker('/occt-import-js-worker.js')
        worker.onmessage = (e) => { resolve(e.data); worker.terminate() }
        worker.onerror   = (e) => { reject(new Error(e.message)); worker.terminate() }
        worker.postMessage({ format: 'step', buffer: new Uint8Array(buffer), params: null })
      })

      if (!result.success || !result.meshes?.length) {
        setStatus('error')
        setStatusMsg('OCCT kon het STEP bestand niet lezen')
        return
      }

      // Debug: log first mesh structure to console
      const m0 = result.meshes[0]
      console.log('[OCCT] mesh[0] keys:', Object.keys(m0))
      console.log('[OCCT] mesh[0].attributes keys:', m0.attributes ? Object.keys(m0.attributes) : 'no attributes')
      console.log('[OCCT] mesh[0].attributes.position:', m0.attributes?.position)
      console.log('[OCCT] mesh[0].index:', m0.index)
      console.log('[OCCT] full mesh[0]:', JSON.stringify(m0).slice(0, 500))

      setStatus('rendering')
      setStatusMsg(`Rendering ${result.meshes.length} meshes…`)

      // Build scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a2332)
      const group = new THREE.Group()
      scene.add(group)

      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      let minZ = Infinity, maxZ = -Infinity

      const meshColors = [
        0x7a9ab5, 0x4f8ef7, 0x5ba08a, 0xc0c8d0, 0x8899aa,
        0x6688bb, 0x9ab0c0, 0x4a7a9b, 0xa0b4c4, 0x3d6f8f,
      ]

      result.meshes.forEach((mesh: any, i: number) => {
        if (!mesh.attributes?.position?.array?.length) return
        const geo = new THREE.BufferGeometry()
        const positions = Array.isArray(mesh.attributes.position.array)
          ? new Float32Array(mesh.attributes.position.array)
          : mesh.attributes.position.array
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        if (mesh.attributes.normal?.array?.length) {
          const normals = Array.isArray(mesh.attributes.normal.array)
            ? new Float32Array(mesh.attributes.normal.array)
            : mesh.attributes.normal.array
          geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
        }

        if (mesh.index?.array?.length) {
          const indices = Array.isArray(mesh.index.array)
            ? new Uint32Array(mesh.index.array)
            : mesh.index.array
          geo.setIndex(new THREE.BufferAttribute(indices, 1))
        }

        geo.computeVertexNormals()

        for (let j = 0; j < positions.length; j += 3) {
          if (positions[j]   < minX) minX = positions[j];   if (positions[j]   > maxX) maxX = positions[j]
          if (positions[j+1] < minY) minY = positions[j+1]; if (positions[j+1] > maxY) maxY = positions[j+1]
          if (positions[j+2] < minZ) minZ = positions[j+2]; if (positions[j+2] > maxZ) maxZ = positions[j+2]
        }

        const color = mesh.color
          ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
          : new THREE.Color(meshColors[i % meshColors.length])

        group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
          color, shininess: 60, specular: new THREE.Color(0x334455), side: THREE.DoubleSide,
        })))
      })

      if (!isFinite(minX)) {
        setStatus('error'); setStatusMsg('Geen geldige geometrie gevonden'); return
      }

      group.position.set(-(minX + maxX) / 2, -(minY + maxY) / 2, -(minZ + maxZ) / 2)
      const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ)

      const camera = new THREE.PerspectiveCamera(40, 1, span * 0.001, span * 100)
      camera.position.set(span * 0.8, span * 0.6, span * 0.9)
      camera.lookAt(0, 0, 0)

      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const sun = new THREE.DirectionalLight(0xffffff, 1.2)
      sun.position.set(span, span * 1.5, span); scene.add(sun)
      const fill = new THREE.DirectionalLight(0x88aacc, 0.4)
      fill.position.set(-span, span * 0.5, -span); scene.add(fill)

      // Renderer owns its own canvas — fully offscreen, never in React DOM
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
      renderer.setSize(600, 600)
      renderer.setPixelRatio(1)
      renderer.shadowMap.enabled = false

      group.rotation.x = -0.35
      group.rotation.y = 0.65
      renderer.render(scene, camera)

      rendererRef.current = renderer
      sceneRef.current    = scene
      cameraRef.current   = camera

      // Capture initial preview image
      const dataUrl = renderer.domElement.toDataURL('image/png')
      setPreviewUrl(dataUrl)
      setStatus('done')
      setStatusMsg(`${result.meshes.length} meshes geladen`)

      // Spin preview: re-render + update img src
      let angle = group.rotation.y
      const spin = () => {
        frameRef.current = requestAnimationFrame(spin)
        angle += 0.008
        group.rotation.y = angle
        renderer.render(scene, camera)
        // Update preview image every ~15 frames
        if (Math.round(angle * 20) % 15 === 0) {
          setPreviewUrl(renderer.domElement.toDataURL('image/png'))
        }
      }
      spin()

    } catch (e: any) {
      setStatus('error')
      setStatusMsg('Fout: ' + e.message)
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setSaved(false); setSelectedSkidId(null)
    if (file.name.toLowerCase().endsWith('.zip')) {
      setStatus('extracting'); setStatusMsg('ZIP uitpakken…')
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(await file.arrayBuffer())
      const stepFile = Object.keys(zip.files).find(n =>
        n.toLowerCase().endsWith('.stp') || n.toLowerCase().endsWith('.step'))
      if (!stepFile) { setStatus('error'); setStatusMsg('Geen .stp of .step in ZIP'); return }
      setStatusMsg(`Gevonden: ${stepFile}`)
      await processStepBuffer(await zip.files[stepFile].async('arraybuffer'), stepFile)
    } else if (file.name.match(/\.(stp|step)$/i)) {
      await processStepBuffer(await file.arrayBuffer(), file.name)
    } else {
      setStatus('error'); setStatusMsg('Alleen .zip, .stp of .step bestanden')
    }
  }, [processStepBuffer])

  const saveThumbnail = async () => {
    if (!selectedSkidId || !rendererRef.current || !sceneRef.current || !cameraRef.current) return
    setSaving(true)

    // Render a clean frame and capture
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    const blob = await new Promise<Blob | null>(resolve =>
      rendererRef.current!.domElement.toBlob(resolve, 'image/png'))

    if (!blob) { setStatusMsg('Canvas capture mislukt'); setSaving(false); return }

    const filename = `skid_${selectedSkidId}_${Date.now()}.png`
    const { error: upErr } = await supabase.storage
      .from('thumbnails').upload(filename, blob, { contentType: 'image/png', upsert: true })
    if (upErr) { setStatusMsg('Storage fout: ' + upErr.message); setSaving(false); return }

    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(filename)
    const { error: dbErr } = await supabase.from('skids')
      .update({ thumbnail_url: publicUrl }).eq('id', selectedSkidId)

    if (dbErr) { setStatusMsg('DB fout: ' + dbErr.message) }
    else { setSaved(true); setStatusMsg('Thumbnail opgeslagen!') }
    setSaving(false)
  }

  const statusColor = status === 'error' ? 'var(--red)' : status === 'done' ? 'var(--green)' : 'var(--blue)'
  const statusBg    = status === 'error' ? 'rgba(239,68,68,0.1)' : status === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(79,142,247,0.08)'

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById('step-input')?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(79,142,247,0.05)' : 'var(--bg-card)', transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>Sleep ZIP of STEP bestand hier</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>.zip (production package) · .stp · .step</div>
        <input id="step-input" type="file" accept=".zip,.stp,.step" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} style={{ display: 'none' }} />
      </div>

      {/* Status */}
      {status !== 'idle' && (
        <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, background: statusBg, color: statusColor, border: `1px solid ${statusColor}33`, display: 'flex', alignItems: 'center', gap: 8 }}>
          {status !== 'done' && status !== 'error' && (
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          )}
          {statusMsg}
        </div>
      )}

      {/* Preview */}
      {status === 'done' && previewUrl && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* img tag — shows offscreen canvas output */}
          <div style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={previewUrl} alt="STEP preview" style={{ display: 'block', width: 280, height: 280, objectFit: 'contain' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>KOPPEL AAN PROJECT</label>
              <select value={selectedSkidId ?? ''} onChange={e => setSelectedSkidId(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, fontSize: 13, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                <option value="">— selecteer project —</option>
                {skids.map(s => <option key={s.id} value={s.id}>{s.project_number}{s.vessel_name ? ` — ${s.vessel_name}` : ''}</option>)}
              </select>
            </div>

            <button onClick={saveThumbnail} disabled={!selectedSkidId || saving || saved}
              style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none',
                cursor: selectedSkidId && !saving && !saved ? 'pointer' : 'default',
                background: saved ? 'var(--green)' : 'var(--blue)', color: 'white',
                opacity: (!selectedSkidId || saving) ? 0.5 : 1, transition: 'all 0.15s' }}>
              {saved ? '✓ Opgeslagen' : saving ? 'Uploaden…' : 'Opslaan als thumbnail'}
            </button>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              De thumbnail wordt opgeslagen in Supabase Storage en verschijnt als preview-icon in de database tabel.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
