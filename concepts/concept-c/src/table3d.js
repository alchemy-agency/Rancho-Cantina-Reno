import * as THREE from 'three'

// Dish photographs cut into rancho arches, hung in space. The camera walks the table as you scroll.
// Each name is matched to what is actually on the plate.
const DISHES = [
  { src: '/img/food-plate-edit-720.webp', name: 'Carne Asada' },
  { src: '/img/food-whole-fish-720.webp', name: 'Whole Fish' },
  { src: '/img/food-tacos-45-720.webp', name: 'Taco Trio' },
  { src: '/img/food-bbq-oysters-720.webp', name: 'BBQ Oysters' },
  { src: '/img/food-chicken-wings-720.webp', name: 'Mexican Chicken Wings' },
  { src: '/img/food-skillet-sizzling-720.webp', name: 'Vaquero Platter' },
]

function archAlpha() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320
  const g = c.getContext('2d')
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 320)
  g.fillStyle = '#fff'
  g.beginPath(); g.moveTo(0, 320); g.lineTo(0, 128); g.arc(128, 128, 128, Math.PI, 0); g.lineTo(256, 320); g.closePath(); g.fill()
  const t = new THREE.CanvasTexture(c); return t
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

export async function createTable(canvas, labelRoot) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const FOG_NEAR = 7, FOG_FAR = 17
  scene.fog = new THREE.Fog(0xffffff, FOG_NEAR, FOG_FAR)
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)

  const loader = new THREE.TextureLoader()
  const alpha = archAlpha()
  const textures = await Promise.all(DISHES.map((d) => loader.loadAsync(d.src).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t })))

  const group = new THREE.Group()
  const planes = []
  const W = 2.3, H = 2.9
  const geo = new THREE.PlaneGeometry(W, H)
  DISHES.forEach((d, i) => {
    const tex = textures[i]
    // cover-fit the texture into the 4:5 arch
    const ta = tex.image.width / tex.image.height, pa = W / H
    if (ta > pa) { tex.repeat.set(pa / ta, 1); tex.offset.set((1 - pa / ta) / 2, 0) } else { tex.repeat.set(1, ta / pa); tex.offset.set(0, (1 - ta / pa) / 2) }
    const mat = new THREE.MeshBasicMaterial({ map: tex, alphaMap: alpha, transparent: true, fog: true })
    const mesh = new THREE.Mesh(geo, mat)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1f1e1b, alphaMap: alpha, transparent: true, opacity: 0.14, fog: true })
    const shadow = new THREE.Mesh(geo, shadowMat)
    shadow.position.set(0.18, -0.22, -0.06)
    const holder = new THREE.Group()
    holder.add(shadow); holder.add(mesh)
    // plates alternate left and right; the last one hangs dead centre as the finale
    const side = i === DISHES.length - 1 ? 0 : i % 2 ? 1 : -1
    holder.position.set(side * (2.4 + (i % 3) * 0.3), (i % 3 - 1) * 0.45, 3 - i * 3.6)
    holder.rotation.y = -side * 0.22
    holder.userData = { z: holder.position.z, name: d.name, side, mat, shadowMat, fade: 1 }
    group.add(holder); planes.push(holder)
  })
  scene.add(group)

  // One label per plate, positioned every frame from the arch's bottom edge
  labelRoot.textContent = ''
  const labels = DISHES.map((d) => {
    const el = document.createElement('span')
    el.className = 'table__label'
    el.textContent = d.name
    labelRoot.appendChild(el)
    return { el, w: 0, h: 0, o: 0, shown: -1 }
  })
  const measure = () => labels.forEach((l) => { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight })
  measure()
  document.fonts?.ready.then(measure)

  let active = true
  let raf = 0
  const START = 10
  const LAST_Z = 3 - (DISHES.length - 1) * 3.6
  // how far in front of the centred finale the camera comes to rest (world units)
  const REST = { wide: 6.4, narrow: 4.2 }
  let END = LAST_Z + REST.wide
  const cam = { z: START, x: 0, y: 0 }
  const cur = { z: START, x: 0, y: 0 }
  let vw = 1, vh = 1
  let progress = 0
  // each arch dissolves as the camera reaches it instead of filling the screen (earlier on a narrow phone view)
  let FADE = [0.7, 1.9]

  const resize = () => {
    vw = canvas.clientWidth || canvas.parentElement.clientWidth
    vh = canvas.clientHeight || canvas.parentElement.clientHeight
    renderer.setSize(vw, vh, false)
    const narrow = vw < 900
    FADE = narrow ? [1.4, 3.0] : [0.7, 1.9]
    camera.aspect = vw / vh
    camera.fov = narrow ? 62 : 40
    camera.updateProjectionMatrix()
    const s = narrow ? 0.72 : 1
    group.scale.setScalar(s)
    planes.forEach((p, i) => { p.position.x = p.userData.side * (narrow ? 1.15 : 2.4 + (i % 3) * 0.3) })
    // Stop square in front of the last plate, in world units so the phone scale stops in the same place
    END = LAST_Z * s + (narrow ? REST.narrow : REST.wide)
    measure()
    applyProgress()
  }

  const applyProgress = () => {
    const p = progress
    cam.z = START + (END - START) * p
    cam.x = Math.sin(p * Math.PI * 2) * 0.35
    cam.y = Math.cos(p * Math.PI * 1.5) * 0.25
  }

  const v = new THREE.Vector3()
  const world = new THREE.Vector3()
  const corners = [[-W / 2, -H / 2], [W / 2, -H / 2], [-W / 2, H / 2], [W / 2, H / 2]]
  const rects = planes.map(() => ({ x0: 0, x1: 0, y0: 0, y1: 0, dz: 0, on: false }))
  const toScreen = (p, lx, ly) => {
    v.set(lx, ly, 0); p.localToWorld(v); v.project(camera)
    return [(v.x + 1) / 2 * vw, (1 - v.y) / 2 * vh, v.z]
  }
  const placeLabels = () => {
    const margin = 14
    // screen footprint of every arch, so a label can step aside when a nearer photo covers it
    planes.forEach((p, i) => {
      const r = rects[i]
      p.getWorldPosition(world)
      r.dz = cur.z - world.z
      const f = smooth(FADE[0], FADE[1], r.dz)
      p.userData.fade = f
      p.userData.mat.opacity = f
      p.userData.shadowMat.opacity = 0.14 * f
      p.visible = f > 0.005
      r.on = f > 0.45
      if (!r.on) return
      r.x0 = r.y0 = Infinity; r.x1 = r.y1 = -Infinity
      for (const [lx, ly] of corners) {
        const [x, y] = toScreen(p, lx, ly)
        r.x0 = Math.min(r.x0, x); r.x1 = Math.max(r.x1, x); r.y0 = Math.min(r.y0, y); r.y1 = Math.max(r.y1, y)
      }
    })
    planes.forEach((p, i) => {
      const l = labels[i]
      const dz = rects[i].dz
      // fade in as the arch comes out of the fog, out as the camera walks past it
      let target = smooth(FOG_FAR - 3, FOG_NEAR + 1, dz) * smooth(FADE[0] + 0.4, FADE[1] + 0.4, dz)
      const [sx, sy, sz] = toScreen(p, 0, -H / 2 - 0.3)
      if (sz > 1 || sz < -1 || sy > vh - 8 || sy < 0) target = 0
      const scale = Math.min(1.15, Math.max(0.62, 5.2 / Math.max(dz, 0.1)))
      const half = (l.w * scale) / 2
      const x = Math.min(vw - half - margin, Math.max(half + margin, sx))
      if (target > 0) {
        const bx0 = x - half, bx1 = x + half, by0 = sy, by1 = sy + l.h * scale
        for (let j = 0; j < rects.length; j++) {
          const r = rects[j]
          if (j === i || !r.on || r.dz >= dz) continue
          if (bx0 < r.x1 && bx1 > r.x0 && by0 < r.y1 && by1 > r.y0) { target = 0; break }
        }
      }
      l.o += (target - l.o) * 0.18
      if (l.o < 0.01) {
        if (l.shown !== 0) { l.el.style.opacity = '0'; l.shown = 0 }
        return
      }
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, 0) scale(${scale.toFixed(3)})`
      l.el.style.opacity = l.o.toFixed(3)
      l.shown = 1
    })
  }

  const clock = new THREE.Clock()
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (!active || document.hidden) return
    const t = clock.getElapsedTime()
    cur.z += (cam.z - cur.z) * 0.08
    cur.x += (cam.x - cur.x) * 0.08
    cur.y += (cam.y - cur.y) * 0.08
    camera.position.set(cur.x, cur.y, cur.z)
    camera.lookAt(cur.x * 0.4, cur.y * 0.4, cur.z - 6)
    planes.forEach((p, i) => { p.position.y = (i % 3 - 1) * 0.45 + Math.sin(t * 0.7 + i) * 0.06 })
    camera.updateMatrixWorld()
    scene.updateMatrixWorld()
    // labels follow the eased camera, the same one that draws the photos
    placeLabels()
    renderer.render(scene, camera)
  }

  resize()
  cur.z = cam.z; cur.x = cam.x; cur.y = cam.y
  window.addEventListener('resize', resize)
  loop()

  return {
    setProgress(p) { progress = p; applyProgress() },
    setActive(val) { active = val },
    resize,
    dispose() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); geo.dispose(); textures.forEach((t) => t.dispose()); alpha.dispose(); renderer.dispose(); labelRoot.textContent = '' },
  }
}
