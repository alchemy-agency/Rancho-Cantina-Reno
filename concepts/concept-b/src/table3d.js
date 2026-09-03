import * as THREE from 'three'

// Dish photographs cut into rancho arches, hung in space. The camera walks the table as you scroll.
const DISHES = [
  { src: '/img/food-plate-edit-720.webp', name: 'Prime Cowboy Cut Ribeye' },
  { src: '/img/food-whole-fish-720.webp', name: 'Whole Fish' },
  { src: '/img/food-tacos-45-720.webp', name: 'Taco Trio' },
  { src: '/img/food-bbq-oysters-720.webp', name: 'BBQ Oysters' },
  { src: '/img/food-skillet-sizzling-720.webp', name: 'Vaquero Platter' },
  { src: '/img/food-chicken-wings-720.webp', name: 'Mexican Chicken Wings' },
  { src: '/img/food-spread-overhead-720.webp', name: 'Carne Asada' },
]

function archAlpha() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320
  const g = c.getContext('2d')
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 320)
  g.fillStyle = '#fff'
  g.beginPath(); g.moveTo(0, 320); g.lineTo(0, 128); g.arc(128, 128, 128, Math.PI, 0); g.lineTo(256, 320); g.closePath(); g.fill()
  const t = new THREE.CanvasTexture(c); return t
}

export async function createTable(canvas, onCaption) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const paper = new THREE.Color(0xece9e3)
  scene.fog = new THREE.Fog(paper, 7, 17)
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
    const shadow = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x1f1e1b, alphaMap: alpha, transparent: true, opacity: 0.16, fog: true }))
    shadow.position.set(0.18, -0.22, -0.06)
    const holder = new THREE.Group()
    holder.add(shadow); holder.add(mesh)
    const side = i % 2 ? 1 : -1
    holder.position.set(side * (2.4 + (i % 3) * 0.3), (i % 3 - 1) * 0.45, 3 - i * 3.6)
    holder.rotation.y = -side * 0.22
    holder.userData = { z: holder.position.z, name: d.name, side }
    group.add(holder); planes.push(holder)
  })
  scene.add(group)

  let active = true
  let raf = 0
  const cam = { z: 10, x: 0, y: 0 }
  const cur = { z: 10, x: 0, y: 0 }
  const START = 10, END = 3 - (DISHES.length - 1) * 3.6 - 4.5

  const resize = () => {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth
    const h = canvas.clientHeight || canvas.parentElement.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    const narrow = w < 900
    camera.fov = narrow ? 62 : 40; camera.updateProjectionMatrix()
    group.scale.setScalar(narrow ? 0.72 : 1)
    planes.forEach((p, i) => { p.position.x = p.userData.side * (narrow ? 1.35 : 2.4 + (i % 3) * 0.3) })
  }
  resize()
  window.addEventListener('resize', resize)

  let lastCaption = -1
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
    renderer.render(scene, camera)
  }
  loop()

  return {
    setProgress(p) {
      cam.z = START + (END - START) * p
      cam.x = Math.sin(p * Math.PI * 2) * 0.35
      cam.y = Math.cos(p * Math.PI * 1.5) * 0.25
      // caption: nearest plane just ahead of the camera
      let idx = 0
      for (let i = 0; i < planes.length; i++) if (planes[i].userData.z < cam.z - 1.2) { idx = i; break }
      if (cam.z - 1.2 < planes[planes.length - 1].userData.z) idx = planes.length - 1
      if (idx !== lastCaption) { lastCaption = idx; onCaption?.(DISHES[idx].name) }
    },
    setActive(v) { active = v },
    resize,
    dispose() { cancelAnimationFrame(raf); geo.dispose(); textures.forEach((t) => t.dispose()); alpha.dispose(); renderer.dispose() },
  }
}
