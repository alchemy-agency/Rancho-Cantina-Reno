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
const burger = q('.hdr__burger')
const mnav = q('#mnav')
// white band once the page moves, all the way to the very bottom (a toggleClass trigger drops it at the end)
const syncHdr = () => hdr.classList.toggle('is-scrolled', window.scrollY > 80 || !mnav.hidden)
window.addEventListener('scroll', syncHdr, { passive: true })
syncHdr()
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

/* ---------- hero: self-hosted brand film ---------- */
const film = q('#heroVideo')
const soundBtn = q('#heroSound')
const mountFilm = () => {
  if (reduce || !film) return
  const hd = window.innerWidth >= 900 && !(navigator.connection?.saveData)
  // H.264 everywhere it is supported, VP9/WebM for builds without it (Linux Chromium, some Firefox)
  const canH264 = film.canPlayType('video/mp4; codecs="avc1.4d401f"') !== ''
  film.src = canH264 ? (hd ? film.dataset.srcHd : film.dataset.srcSd) : film.dataset.srcWebm
  film.muted = true
  film.addEventListener('playing', () => film.classList.add('is-playing'), { once: true })
  film.play().catch(() => { /* autoplay blocked: poster stays */ })
}
window.addEventListener('load', () => setTimeout(mountFilm, 200))
soundBtn?.addEventListener('click', () => {
  if (!film) return
  film.muted = !film.muted
  if (film.paused) film.play().catch(() => {})
  soundBtn.setAttribute('aria-pressed', String(!film.muted))
  soundBtn.setAttribute('aria-label', film.muted ? 'Turn sound on' : 'Turn sound off')
})
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onLeave: () => film?.pause(), onEnterBack: () => film?.play().catch(() => {}) })

/* ---------- entrance ---------- */
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__wm', { y: 40, opacity: 0, duration: 1.4 }, 0.2)
    .from('.hero__sub', { y: 24, opacity: 0, duration: 1.1 }, 0.55)
    .from('.hero__actions > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.8)
    .from('.hero__sound, .hdr', { opacity: 0, duration: 1 }, 0.9)
}

/* ---------- statement: lines rise, the roping cowboy draws on ---------- */
if (!reduce) {
  gsap.from('.statement__line .w', { y: 36, opacity: 0, duration: 1.2, stagger: 0.14, ease: 'power3.out', scrollTrigger: { trigger: '.statement', start: 'top 72%' } })
  gsap.from('.statement__body', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.statement__body', start: 'top 85%' } })
  const ink = q('[data-ink-reveal]')
  if (ink) {
    // draw on as the cowboy comes up, and finish while all of it is on screen below the header
    gsap.set(ink, { clipPath: 'inset(0 100% 0 0)' })
    gsap.to(ink, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: ink.parentElement, start: 'top 85%', end: 'center 58%', scrub: 0.6 } })
    // a gentle drift centred on zero, so it never lifts the drawing under the header
    gsap.fromTo(ink, { y: 24 }, { y: -24, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } })
  }
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

/* ---------- visit: the ghosted building drifts ---------- */
if (!reduce) {
  gsap.fromTo('.visit__bg img', { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true } })
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
const labelRoot = q('[data-table-labels]')
const supportsWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
const saveData = navigator.connection?.saveData === true
if (!supportsWebGL || reduce || saveData) document.body.classList.add('no-webgl')
tableCanvas?.addEventListener('webglcontextlost', () => document.body.classList.add('no-webgl'))
let tableScene = null
let tableProgress = 0
if (supportsWebGL && !reduce && !saveData && table) {
  ScrollTrigger.create({
    trigger: table, start: 'top 140%', once: true,
    onEnter: async () => {
      try {
        const { createTable } = await import('./table3d.js')
        tableScene = await createTable(tableCanvas, labelRoot)
        tableScene.setProgress(tableProgress)
      } catch (err) { console.warn('table scene failed', err); document.body.classList.add('no-webgl') }
    },
  })
  ScrollTrigger.create({
    trigger: table, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => { tableProgress = self.progress; tableScene?.setProgress(self.progress) },
  })
  // Render whenever any part of the section is on screen, so the eased camera always settles where the scroll left it
  ScrollTrigger.create({ trigger: table, start: 'top bottom', end: 'bottom top', onToggle: (self) => tableScene?.setActive(self.isActive) })
  gsap.from('.table__head > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: table, start: 'top 40%' } })
  // the title bows out before the first arches swing past it
  gsap.to('.table__head', { opacity: 0, y: -24, ease: 'none', scrollTrigger: { trigger: table, start: () => `top+=${window.innerHeight * 0.12} top`, end: () => `top+=${window.innerHeight * 0.42} top`, scrub: true, invalidateOnRefresh: true } })
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
    gsap.fromTo(ink, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: stop, start: 'left 100%', end: 'left 62%', scrub: true } })
    gsap.from([stop.querySelector('h2'), stop.querySelector('p'), stop.querySelector('.btn')].filter(Boolean), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { containerAnimation: tween, trigger: stop, start: 'left 75%' } })
  })
  return () => {}
})
mm.add('(max-width: 899px)', () => {
  qa('.stop [data-ink]').forEach((ink) => gsap.set(ink, { clipPath: 'none' }))
})

/* ---------- batch reveals ---------- */
if (!reduce) {
  const targets = qa('.menu__head, .mgroup, .cantina__intro > *, .tile, .family__copy > *, .family__photo, .visit__addr > *, .hours, .visit__map, .ftr__brand, .club, .ftr__meta')
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
const inertTargets = () => qa('.skip, #main, #hdr, footer')
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

/* ---------- giveaway lightbox: once per new visitor ---------- */
// Remembered per browser: 'joined' never shows again, a dismissal rests for 30 days. Add ?giveaway to the URL to preview it.
const GW_KEY = 'rc-club-giveaway'
const GW_REST = 30 * 24 * 60 * 60 * 1000
const gwStore = {
  get() { try { return JSON.parse(localStorage.getItem(GW_KEY) || 'null') } catch { return null } },
  set(v) { try { localStorage.setItem(GW_KEY, JSON.stringify(v)) } catch { /* storage blocked: the page still works */ } },
}
const gw = q('#giveaway')
const gwPanel = gw && q('.gw', gw)
const gwForm = gw && q('.gw__form', gw)
let gwFocus = null
let gwShown = false
let gwJoined = false
const gwJoin = () => { gwJoined = true; gwStore.set({ state: 'joined', at: Date.now() }) }
const gwOpen = () => {
  if (gwShown || !gw) return
  gwShown = true
  gwFocus = document.activeElement
  gw.hidden = false
  inertTargets().forEach((el) => { el.inert = true })
  if (lenis) lenis.stop()
  document.documentElement.style.overflow = 'hidden'
  if (!reduce) {
    gsap.fromTo(q('.modal__backdrop', gw), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    gsap.fromTo(gwPanel, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
  }
  // focus the dialog itself so phones do not jump straight into the keyboard
  gwPanel.focus({ preventScroll: true })
}
const gwClose = () => {
  if (!gw || gw.hidden) return
  gw.hidden = true
  inertTargets().forEach((el) => { el.inert = false })
  if (lenis) lenis.start()
  document.documentElement.style.overflow = ''
  if (!gwJoined && gwStore.get()?.state !== 'joined') gwStore.set({ state: 'dismissed', at: Date.now() })
  gwFocus?.focus?.({ preventScroll: true })
}
if (gw) {
  qa('[data-gw-close]', gw).forEach((el) => el.addEventListener('click', gwClose))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !gw.hidden) gwClose() })
  gwForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = q('input', gwForm); const msg = q('.gw__msg', gwForm)
    if (!input.value || !input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true')
      msg.textContent = 'Enter a valid email address.'
      input.focus()
      return
    }
    input.removeAttribute('aria-invalid')
    gwJoin()
    gwPanel.classList.add('is-done')
    q('.gw__skip', gw).textContent = 'Back to the site'
    msg.textContent = 'You are on the list. We will write before opening night.'
    input.value = ''
    gwPanel.focus({ preventScroll: true })
  })
}

// Show it once the visitor is settled in: past the hero film, or 20 seconds on the page, never in the first 6.
// Only visible time counts, and it waits while a dialog, the phone menu, a scroll, or typing is in progress.
const gwPreview = new URLSearchParams(location.search).has('giveaway')
const gwSeen = gwStore.get()
const gwResting = gwSeen?.state === 'joined' ||
  (gwSeen?.state === 'dismissed' && Number.isFinite(gwSeen.at) && gwSeen.at <= Date.now() && Date.now() - gwSeen.at < GW_REST)
if (gw && (gwPreview || !gwResting)) {
  const STEP = 500
  const minWait = gwPreview ? 1200 : 6000
  let seen = 0
  const busy = () => !modal.hidden || !mnav.hidden || !!lenis?.isScrolling || !!document.activeElement?.matches?.('input, textarea, select')
  const pastHero = () => { const hero = q('.hero'); return !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.5 }
  // fetch the photo after the page has loaded so it is ready when the lightbox opens
  const warm = () => { const im = q('.gw__photo img', gw); if (im) im.loading = 'eager' }
  if (document.readyState === 'complete') warm(); else window.addEventListener('load', warm, { once: true })
  const tick = () => {
    if (gwShown || (!gwPreview && gwJoined)) return
    if (!document.hidden) seen += STEP
    if (seen >= minWait && !busy() && (gwPreview || pastHero() || seen >= 20000)) { gwOpen(); return }
    setTimeout(tick, STEP)
  }
  setTimeout(tick, STEP)
}

/* ---------- club signup ---------- */
const club = q('.club')
club?.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = club.querySelector('input'); const msg = club.querySelector('.club__msg')
  if (!input.value || !input.checkValidity()) { msg.textContent = 'Enter a valid email address.'; input.focus(); return }
  msg.textContent = 'You are on the list. We will write before opening night.'; input.value = ''
  gwJoin()
})

window.addEventListener('load', () => ScrollTrigger.refresh())
document.fonts?.ready.then(() => ScrollTrigger.refresh())
