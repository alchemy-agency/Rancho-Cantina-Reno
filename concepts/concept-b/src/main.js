import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(pointer: fine)').matches
const q = (s, r = document) => r.querySelector(s)
const qa = (s, r = document) => [...r.querySelectorAll(s)]

/* ---------- smooth scroll ---------- */
let lenis = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollTo = (target, offset = -64) => {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
}

/* ---------- header + mobile nav ---------- */
const hdr = q('#hdr')
ScrollTrigger.create({ start: 80, end: 'max', toggleClass: { targets: hdr, className: 'is-scrolled' } })
const burger = q('.hdr__burger')
const mnav = q('#mnav')
const setMnav = (open) => {
  mnav.hidden = !open
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  hdr.classList.toggle('is-scrolled', open || window.scrollY > 80)
  if (lenis) open ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = open ? 'hidden' : ''
}
burger.addEventListener('click', () => setMnav(mnav.hidden))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mnav.hidden) setMnav(false) })
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom 70%', toggleClass: { targets: document.body, className: 'is-hero' } })
qa('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (id.length < 2) return
    const el = q(id)
    if (!el) return
    e.preventDefault()
    if (!mnav.hidden) setMnav(false)
    scrollTo(el, id === '#top' ? 0 : -64)
  })
})

/* ---------- hero film (YouTube placeholder) ---------- */
const yt = q('#heroYt')
const soundBtn = q('#heroSound')
let ytFrame = null
let muted = true
const ytCommand = (func, args = []) => ytFrame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
const mountFilm = () => {
  if (reduce || !yt) return
  const id = yt.dataset.video
  const params = new URLSearchParams({ autoplay: '1', mute: '1', loop: '1', playlist: id, controls: '0', rel: '0', playsinline: '1', modestbranding: '1', iv_load_policy: '3', disablekb: '1', fs: '0', enablejsapi: '1', origin: location.origin })
  ytFrame = document.createElement('iframe')
  ytFrame.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`
  ytFrame.title = 'Rancho Cantina brand film'
  ytFrame.allow = 'autoplay; encrypted-media; picture-in-picture'
  ytFrame.setAttribute('tabindex', '-1')
  ytFrame.addEventListener('load', () => {
    const listen = () => ytFrame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*')
    listen(); setTimeout(listen, 800); setTimeout(listen, 2500)
  })
  window.addEventListener('message', (e) => {
    if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin) || typeof e.data !== 'string') return
    try {
      const d = JSON.parse(e.data)
      const state = d?.info?.playerState
      if (state === 1) yt.classList.add('is-playing')
      if (state === -1 || state === 5) ytCommand('playVideo')
    } catch { /* not a player message */ }
  })
  yt.appendChild(ytFrame)
}
window.addEventListener('load', () => setTimeout(mountFilm, 400))
soundBtn?.addEventListener('click', () => {
  muted = !muted
  ytCommand(muted ? 'mute' : 'unMute')
  if (!muted) ytCommand('playVideo')
  soundBtn.setAttribute('aria-pressed', String(!muted))
  soundBtn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off')
})
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onLeave: () => ytCommand('pauseVideo'), onEnterBack: () => ytCommand('playVideo') })

/* ---------- entrance ---------- */
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__frame', { scale: 0.96, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
    .from('.hero__title .l', { y: 50, opacity: 0, duration: 1.3, stagger: 0.14 }, 0.4)
    .from('.hero__sub', { y: 24, opacity: 0, duration: 1 }, 0.8)
    .from('.hero__actions > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.1 }, 1)
    .from('.hero__sound, .hdr', { opacity: 0, duration: 1 }, 1.1)
}

/* ---------- definition line: word by word ---------- */
if (!reduce) {
  const line = q('.define__line')
  const nodes = []
  const walk = (el) => {
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const frag = document.createDocumentFragment()
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
          const s = document.createElement('span'); s.className = 'wd'; s.style.display = 'inline-block'; s.textContent = part
          frag.appendChild(s); nodes.push(s)
        })
        n.replaceWith(frag)
      } else if (n.nodeType === 1 && !n.classList.contains('glyph')) walk(n)
      else if (n.nodeType === 1) nodes.push(n)
    })
  }
  walk(line)
  gsap.from(nodes, { y: 18, opacity: 0, duration: 0.8, stagger: 0.03, ease: 'power3.out', scrollTrigger: { trigger: line, start: 'top 78%' } })
}

/* ---------- plate parallax ---------- */
if (!reduce) {
  gsap.fromTo('[data-parallax] img', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.plate', start: 'top bottom', end: 'bottom top', scrub: true } })
  gsap.from('.plate__copy > *', { y: 28, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.plate__copy', start: 'top 80%' } })
  gsap.from('.plate__fig', { clipPath: 'inset(0 0 100% 0)', duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: '.plate', start: 'top 70%' } })
}

/* ---------- the table: 3D scroll gallery (lazy) ---------- */
const table = q('.table')
const tableCanvas = q('#tableCanvas')
const caption = q('[data-table-caption]')
const supportsWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
const saveData = navigator.connection?.saveData === true
if (!supportsWebGL || reduce || saveData) document.body.classList.add('no-webgl')
tableCanvas?.addEventListener('webglcontextlost', () => document.body.classList.add('no-webgl'))
let tableScene = null
let tableProgress = 0
let captionKey = ''
const setCaption = (text) => {
  if (text === captionKey) return
  captionKey = text
  if (reduce) { caption.textContent = text; return }
  gsap.to(caption, { y: -8, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { caption.textContent = text; gsap.fromTo(caption, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }) } })
}
if (supportsWebGL && !reduce && !saveData && table) {
  ScrollTrigger.create({
    trigger: table, start: 'top 140%', once: true,
    onEnter: async () => {
      try {
        const { createTable } = await import('./table3d.js')
        tableScene = await createTable(tableCanvas, setCaption)
        tableScene.setProgress(tableProgress)
      } catch (err) { console.warn('table scene failed', err); document.body.classList.add('no-webgl') }
    },
  })
  ScrollTrigger.create({
    trigger: table, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => { tableProgress = self.progress; tableScene?.setProgress(self.progress) },
    onToggle: (self) => tableScene?.setActive(self.isActive),
  })
  gsap.from('.table__head > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: table, start: 'top 40%' } })
}

/* ---------- cantina tiles: pointer tilt ---------- */
if (finePointer && !reduce) {
  qa('[data-tilt]').forEach((tile) => {
    const rx = gsap.quickTo(tile, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(tile, 'rotationY', { duration: 0.6, ease: 'power3' })
    gsap.set(tile, { transformPerspective: 1200 })
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      rx(-py * 6); ry(px * 6)
    })
    tile.addEventListener('pointerleave', () => { rx(0); ry(0) })
  })
}

/* ---------- heritage trail: pinned pan + ink draw-on ---------- */
const mm = gsap.matchMedia()
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const pin = q('[data-trail]')
  const track = q('[data-trail-track]')
  const distance = () => track.scrollWidth - window.innerWidth
  const tween = gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance() * 1.15}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  })
  qa('.stop').forEach((stop) => {
    const ink = stop.querySelector('[data-ink]')
    gsap.fromTo(ink, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: stop, start: 'left 85%', end: 'left 40%', scrub: true } })
    gsap.from([stop.querySelector('h2'), stop.querySelector('p'), stop.querySelector('.btn')].filter(Boolean), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { containerAnimation: tween, trigger: stop, start: 'left 75%' } })
  })
  return () => {}
})
mm.add('(max-width: 899px)', () => {
  qa('.stop [data-ink]').forEach((ink) => gsap.set(ink, { clipPath: 'none' }))
})

/* ---------- batch reveals ---------- */
if (!reduce) {
  const targets = qa('.menu__head, .mgroup, .cantina__intro > *, .tile, .family__copy > *, .family__photo, .visit__head > *, .visit__block, .ftr__brand, .club, .ftr__meta')
  gsap.set(targets, { y: 28, opacity: 0 })
  ScrollTrigger.batch(targets, { start: 'top 90%', once: true, onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true }) })
}

/* ---------- magnetic buttons ---------- */
if (finePointer && !reduce) {
  qa('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' })
    btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); xTo((e.clientX - (r.left + r.width / 2)) * 0.28); yTo((e.clientY - (r.top + r.height / 2)) * 0.28) })
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
  })
}

/* ---------- reserve modal ---------- */
const modal = q('#reserveModal')
const form = q('[data-reserve-form]')
let lastFocus = null
const inertTargets = () => qa('#main, #hdr, footer, .mbar')
const openModal = () => {
  lastFocus = document.activeElement
  modal.hidden = false
  inertTargets().forEach((el) => { el.inert = true })
  if (lenis) lenis.stop()
  document.documentElement.style.overflow = 'hidden'
  const date = q('#rsvDate')
  if (date && !date.value) { const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; const d = new Date(); date.min = fmt(d); d.setDate(d.getDate() + 1); date.value = fmt(d) }
  if (!reduce) gsap.fromTo('.modal__panel', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
  setTimeout(() => q('#rsvParty')?.focus(), 50)
}
const closeModal = () => { modal.hidden = true; inertTargets().forEach((el) => { el.inert = false }); if (lenis) lenis.start(); document.documentElement.style.overflow = ''; lastFocus?.focus?.() }
qa('.js-reserve').forEach((b) => b.addEventListener('click', openModal))
qa('[data-close]', modal).forEach((el) => el.addEventListener('click', closeModal))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal() })
form?.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = new FormData(form)
  let done = form.querySelector('.rsv__done')
  if (!done) { done = document.createElement('p'); done.className = 'rsv__done'; form.appendChild(done) }
  done.textContent = `Placeholder handoff: ${data.get('party')}, ${data.get('date')} at ${data.get('time')}. The live site will open OpenTable with these details.`
})

/* ---------- club signup ---------- */
const club = q('.club')
club?.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = club.querySelector('input'); const msg = club.querySelector('.club__msg')
  if (!input.value || !input.checkValidity()) { msg.textContent = 'Enter a valid email address.'; input.focus(); return }
  msg.textContent = 'You are on the list. We will write before opening night.'; input.value = ''
})

window.addEventListener('load', () => ScrollTrigger.refresh())
document.fonts?.ready.then(() => ScrollTrigger.refresh())
