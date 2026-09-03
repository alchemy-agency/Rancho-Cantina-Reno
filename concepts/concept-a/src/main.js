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
// pause the film when it leaves the viewport
ScrollTrigger.create({
  trigger: '.hero', start: 'top top', end: 'bottom top',
  onLeave: () => film?.pause(), onEnterBack: () => film?.play().catch(() => {}),
})

/* ---------- entrance ---------- */
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__wm', { y: 40, opacity: 0, duration: 1.4 }, 0.2)
    .from('.hero__sub', { y: 24, opacity: 0, duration: 1.1 }, 0.55)
    .from('.hero__actions > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.8)
    .from('.hero__sound, .hdr', { opacity: 0, duration: 1 }, 0.9)
}

/* ---------- statement + ink reveal ---------- */
if (!reduce) {
  gsap.from('.statement__line .w', {
    y: 36, opacity: 0, duration: 1.2, stagger: 0.14, ease: 'power3.out',
    scrollTrigger: { trigger: '.statement', start: 'top 72%' },
  })
  gsap.from('.statement__body', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.statement__body', start: 'top 85%' } })
  const ink = q('[data-ink-reveal]')
  if (ink) {
    gsap.set(ink, { clipPath: 'inset(0 100% 0 0)' })
    gsap.to(ink, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'center 45%', scrub: 0.6 } })
    gsap.to(ink, { y: -60, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } })
  }
}

/* ---------- parrilla sticky stack ---------- */
const frames = qa('.frame')
if (!reduce) {
  frames.forEach((frame, i) => {
    const next = frames[i + 1]
    if (!next) return
    gsap.to(frame, {
      scale: 0.93, opacity: 0.35, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
    })
    gsap.to(frame.querySelector('img'), { yPercent: -6, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } })
  })
  frames.forEach((frame) => {
    gsap.from(frame.querySelector('.frame__copy h2'), {
      y: 40, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: frame, start: 'top 60%' },
    })
  })
}

/* ---------- forge: 3D bronco (lazy) ---------- */
const forge = q('.forge')
const forgeCanvas = q('#forgeCanvas')
const supportsWebGL = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
})()
const saveData = navigator.connection?.saveData === true
if (!supportsWebGL || reduce || saveData) document.body.classList.add('no-webgl')
forgeCanvas?.addEventListener('webglcontextlost', () => document.body.classList.add('no-webgl'))
let forgeScene = null
let forgeProgress = 0
let forgeBooting = null
let forgeST = null

// GPU warm-up: build the scene, upload the geometry and compile the shaders as soon as
// the browser is idle after load, so the bronco is already drawn by the time it scrolls in.
const bootForge = () => {
  if (forgeBooting) return forgeBooting
  forgeBooting = import('./forge3d.js')
    .then(({ createForge }) => createForge(forgeCanvas))
    .then((scene) => {
      forgeScene = scene
      scene.setProgress(forgeProgress)
      scene.renderOnce()
      scene.setActive(Boolean(forgeST?.isActive))
      return scene
    })
    .catch((err) => {
      console.warn('forge failed', err)
      document.body.classList.add('no-webgl')
    })
  return forgeBooting
}

if (supportsWebGL && !reduce && !saveData && forge) {
  const warm = () => bootForge()
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2000 })
    else setTimeout(warm, 500)
  })
  // safety net: if the warm-up never ran, build it as the section approaches
  ScrollTrigger.create({ trigger: forge, start: 'top 200%', once: true, onEnter: warm })
  forgeST = ScrollTrigger.create({
    trigger: forge, start: 'top bottom', end: 'bottom top', scrub: true,
    onUpdate: (self) => { forgeProgress = self.progress; forgeScene?.setProgress(self.progress) },
    onToggle: (self) => forgeScene?.setActive(self.isActive),
  })
  gsap.from('.forge__copy > *', {
    y: 30, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: forge, start: 'top 20%' },
  })
}

/* ---------- MEX WESTERN cutout ---------- */
if (!reduce) {
  qa('[data-cutout]').forEach((el, i) => {
    gsap.fromTo(el, { backgroundPositionY: i ? '20%' : '60%' }, {
      backgroundPositionY: i ? '70%' : '20%', ease: 'none',
      scrollTrigger: { trigger: '.cutout', start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
  gsap.from('.cutout__txt', { yPercent: 18, opacity: 0, duration: 1.3, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.cutout', start: 'top 70%' } })
}

/* ---------- menu: hover / scroll driven image ---------- */
const dishes = q('[data-dishes]')
const dishItems = qa('.dish')
const menuImgs = qa('.menu__img')
let menuHover = false
const setDish = (key) => {
  dishItems.forEach((d) => d.classList.toggle('is-active', d.dataset.dish === key))
  menuImgs.forEach((m) => m.classList.toggle('is-active', m.dataset.dish === key))
  dishes.classList.add('has-active')
}
dishItems.forEach((d) => {
  const key = d.dataset.dish
  d.addEventListener('pointerenter', () => { if (finePointer) { menuHover = true; setDish(key) } })
  d.addEventListener('pointerleave', () => { menuHover = false })
  d.querySelector('.dish__btn').addEventListener('focus', () => setDish(key))
  d.querySelector('.dish__btn').addEventListener('click', () => setDish(key))
  ScrollTrigger.create({
    trigger: d, start: 'top 62%', end: 'bottom 62%',
    onToggle: (self) => { if (self.isActive && !menuHover) setDish(key) },
  })
})
setDish('ribeye')

/* ---------- cantina horizontal pan (desktop only) ---------- */
const mm = gsap.matchMedia()
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const pin = q('[data-pan]')
  const track = q('[data-pan-track]')
  const distance = () => track.scrollWidth - window.innerWidth
  const tween = gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  })
  gsap.to('.cantina__head', { opacity: 0, y: -20, ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance() * 0.22}`, scrub: true } })
  qa('.card img').forEach((img) => {
    gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: img, start: 'left right', end: 'right left', scrub: true } })
  })
  return () => {}
})

/* ---------- batch reveals ---------- */
if (!reduce) {
  const targets = qa('.menu__head, .dish, .cantina__head > *, .story__copy > *, .story__photo, .visit__addr > *, .hours > div, .cutout__copy > *, .ftr__brand, .club')
  gsap.set(targets, { y: 28, opacity: 0 })
  ScrollTrigger.batch(targets, {
    start: 'top 90%', once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  })
}

/* ---------- magnetic buttons ---------- */
if (finePointer && !reduce) {
  qa('[data-magnetic]').forEach((btn) => {
    const strength = 0.28
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' })
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    })
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
  })
}

/* ---------- reserve modal ---------- */
const modal = q('#reserveModal')
const form = q('[data-reserve-form]')
let lastFocus = null
const inertTargets = () => qa('#main, #hdr, footer')
const openModal = () => {
  lastFocus = document.activeElement
  modal.hidden = false
  inertTargets().forEach((el) => { el.inert = true })
  if (lenis) lenis.stop()
  document.documentElement.style.overflow = 'hidden'
  const date = q('#rsvDate')
  if (date && !date.value) {
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const d = new Date(); date.min = fmt(d); d.setDate(d.getDate() + 1); date.value = fmt(d)
  }
  if (!reduce) gsap.fromTo('.modal__panel', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
  setTimeout(() => q('#rsvParty')?.focus(), 50)
}
const closeModal = () => {
  modal.hidden = true
  inertTargets().forEach((el) => { el.inert = false })
  if (lenis) lenis.start()
  document.documentElement.style.overflow = ''
  lastFocus?.focus?.()
}
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
  const input = club.querySelector('input')
  const msg = club.querySelector('.club__msg')
  if (!input.value || !input.checkValidity()) { msg.textContent = 'Enter a valid email address.'; input.focus(); return }
  msg.textContent = 'You are on the list. We will write before opening night.'
  input.value = ''
})

/* ---------- refresh after assets ---------- */
window.addEventListener('load', () => ScrollTrigger.refresh())
document.fonts?.ready.then(() => ScrollTrigger.refresh())
