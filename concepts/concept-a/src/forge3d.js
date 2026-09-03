import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// The bronc and lariat, extruded into cast iron and lit by the fire.
export async function createForge(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 10)

  scene.add(new THREE.HemisphereLight(0xede7db, 0x0e0c0b, 0.28))
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2)
  key.position.set(3.5, 4, 6)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc9c1b3, 0.35)
  fill.position.set(-4, 2, 3)
  scene.add(fill)
  const ember = new THREE.PointLight(0xff5a1f, 26, 40, 1.7)
  ember.position.set(-4.5, -2.5, -2)
  scene.add(ember)
  const ember2 = new THREE.PointLight(0xba2e28, 14, 30, 1.8)
  ember2.position.set(4.5, -3, 2.5)
  scene.add(ember2)

  const data = await new SVGLoader().loadAsync('/ink/bronco-3d.svg')
  const geos = []
  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path)
    for (const shape of shapes) {
      try {
        geos.push(new THREE.ExtrudeGeometry(shape, { depth: 70, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 2, curveSegments: 3 }))
      } catch { /* skip degenerate strokes */ }
    }
  }
  const merged = mergeGeometries(geos, false)
  merged.computeBoundingBox()
  const box = merged.boundingBox
  const size = new THREE.Vector3(); box.getSize(size)
  const center = new THREE.Vector3(); box.getCenter(center)
  merged.translate(-center.x, -center.y, -center.z)
  merged.computeVertexNormals()

  const iron = new THREE.MeshStandardMaterial({ color: 0x6b5d54, metalness: 0.7, roughness: 0.42, envMapIntensity: 0.75 })
  const horse = new THREE.Mesh(merged, iron)
  const pivot = new THREE.Group()
  pivot.add(horse)
  const s = 5.2 / Math.max(size.x, size.y)
  pivot.scale.set(s, -s, s) // SVG y runs downward
  scene.add(pivot)

  // brand ring: the iron head the mark is cast into
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.06, 18, 160), new THREE.MeshStandardMaterial({ color: 0x7a6a5f, metalness: 0.8, roughness: 0.35, envMapIntensity: 0.7 }))
  ring.position.z = -0.4
  scene.add(ring)

  let active = true
  let needsRender = true
  let progress = 0
  const target = { ry: 0, rx: 0, cz: 10 }
  const current = { ry: -0.7, rx: 0.25, cz: 11 }

  const resize = () => {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth
    const h = canvas.clientHeight || canvas.parentElement.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const narrow = w < 900
    pivot.position.x = narrow ? 0 : 2.1
    ring.position.x = pivot.position.x
    camera.position.z = narrow ? 13 : 10
    target.cz = camera.position.z
    needsRender = true
  }
  resize()
  window.addEventListener('resize', resize)

  const clock = new THREE.Clock()
  const loop = () => {
    requestAnimationFrame(loop)
    if (!active) return
    const t = clock.getElapsedTime()
    current.ry += (target.ry - current.ry) * 0.06
    current.rx += (target.rx - current.rx) * 0.06
    current.cz += (target.cz - current.cz) * 0.06
    pivot.rotation.y = current.ry + Math.sin(t * 0.6) * 0.03
    pivot.rotation.x = current.rx + Math.cos(t * 0.5) * 0.02
    ring.rotation.y = current.ry * 0.6
    ring.rotation.x = current.rx * 0.6
    camera.position.z = current.cz
    ember.intensity = 24 + Math.sin(t * 2.3) * 5 + Math.sin(t * 7.1) * 2
    ember2.intensity = 12 + Math.cos(t * 1.7) * 3
    renderer.render(scene, camera)
  }
  loop()

  return {
    setProgress(p) {
      progress = p
      // sweep from left profile to right profile as the section scrolls through
      target.ry = -0.95 + p * 1.9
      target.rx = 0.3 - p * 0.5
      target.cz = (canvas.clientWidth < 900 ? 13 : 10) - Math.sin(p * Math.PI) * 1.6
      needsRender = true
    },
    setActive(v) { active = v },
    resize,
  }
}
