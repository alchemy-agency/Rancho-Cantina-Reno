import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import fs from 'node:fs'
const BASE = 'http://127.0.0.1:8187'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
const mkctx = async (vp) => {
  const ctx = await browser.newContext({ viewport: vp })
  await ctx.addInitScript(() => { try { localStorage.setItem('rc-club-giveaway', JSON.stringify({ state: 'joined', at: 1 })) } catch {} })
  return ctx
}
const results = {}

async function probe(label, vp = { width: 1440, height: 900 }) {
  const ctx = await mkctx(vp); const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()))
  await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(1500)
  const H = await page.evaluate(() => document.documentElement.scrollHeight)
  // scroll down in steps so every ScrollTrigger fires
  for (let y = 0; y < H; y += 450) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(110) }
  await page.waitForTimeout(800)
  // menu
  await page.evaluate(() => document.querySelector('#menu').scrollIntoView()); await page.waitForTimeout(1600)
  const menu = await page.evaluate(() => ({
    groups: [...document.querySelectorAll('.mgroup')].map((g) => ({ h3: g.querySelector('h3').textContent.trim(), items: g.querySelectorAll('dt').length, opacity: getComputedStyle(g).opacity })),
  }))
  await page.locator('#menu').screenshot({ path: `shots/${label}-menu.png` })
  // trail pin
  const trail = await page.evaluate(async () => {
    const pin = document.querySelector('.trail'); const spacer = pin.closest('.pin-spacer') || pin.parentElement
    const r = spacer.getBoundingClientRect(); const top = r.top + window.scrollY
    const out = {}
    out.spacers = document.querySelectorAll('.pin-spacer').length
    window.scrollTo(0, top + 5); await new Promise((r) => setTimeout(r, 500))
    const t0 = getComputedStyle(document.querySelector('[data-trail-track]')).transform
    window.scrollTo(0, top + r.height * 0.55); await new Promise((r) => setTimeout(r, 900))
    out.t0 = t0; out.t1 = getComputedStyle(document.querySelector('[data-trail-track]')).transform
    out.pinnedFixed = getComputedStyle(document.querySelector('[data-trail]')).position
    return out
  })
  // visit + hours
  await page.evaluate(() => document.querySelector('#visit').scrollIntoView()); await page.waitForTimeout(1500)
  const hours = await page.evaluate(() => [...document.querySelectorAll('.hours > div')].map((d) => d.innerText.replace(/\s+/g, ' ').trim() + (d.classList.contains('hours__extra') ? ' [extra]' : '') + ' op=' + getComputedStyle(d.parentElement).opacity))
  await page.locator('.visit__main').screenshot({ path: `shots/${label}-visit.png` })
  const misc = await page.evaluate(() => ({
    giveawayInDom: !!document.querySelector('#giveaway'),
    announce: document.querySelector('.hero__announce')?.textContent ?? null,
    noWebgl: document.body.classList.contains('no-webgl'),
    tableCanvas: (() => { const c = document.querySelector('#tableCanvas'); return c ? [c.width, c.height] : null })(),
    hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
    famSrc: document.querySelector('.family__photo img')?.getAttribute('src'),
    pageH: document.documentElement.scrollHeight,
  }))
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(900)
  await page.screenshot({ path: `shots/${label}-hero.png` })
  await page.evaluate(() => document.querySelector('#family').scrollIntoView()); await page.waitForTimeout(1700)
  await page.locator('#family').screenshot({ path: `shots/${label}-family.png` })
  await ctx.close()
  results[label] = { errors, menu, trail, hours, misc }
  return results[label]
}

// 1. baseline (freshly baked from default content)
await probe('1-baseline')

// 2. owner flow through the real admin UI
const ctx = await mkctx({ width: 1100, height: 1000 }); const page = await ctx.newPage()
await page.goto(BASE + '/admin/')
// wrong password first
await page.fill('input[name=password]', 'nope'); await page.click('button'); await page.waitForSelector('.e')
results.wrongPassword = await page.textContent('.e')
await page.fill('input[name=password]', process.env.EDITOR_PASSWORD || ''); await page.click('button')
await page.waitForSelector('#hours .row')
await page.screenshot({ path: 'shots/admin-1-loaded.png', fullPage: true })
// announcement + giveaway off
await page.check('#ann_on'); await page.fill('#ann_text', 'Soft opening Dec 12. Reservations open Dec 1.')
await page.uncheck('#giveaway')
// edit Sunday hours (4th row)
const timeInputs = page.locator('#hours input[name$="[time]"]')
await timeInputs.nth(3).fill('9 am to 8 pm')
// add a new hours row
await page.click('[data-act=add-hour]')
const lastRow = page.locator('#hours .row').last()
await lastRow.locator('input[name$="[label]"]').fill('Thanksgiving Day'); await lastRow.locator('input[name$="[time]"]').fill('Closed')
// add dishes to Del Mar (2nd group) - add 2 and one with HTML/script to prove escaping
const del = page.locator('#menu [data-group]').nth(1)
for (const [n, d] of [['Grilled Octopus', 'Charred over mesquite, salsa verde, crispy potatoes'], ['<script>alert(1)</script>Tuna Tostada', 'Ahi & avocado, "chile crunch"']]) {
  await del.locator('[data-act=add-item]').click()
  const it = del.locator('.item').last(); await it.locator('input').fill(n); await it.locator('textarea').fill(d)
}
// move the new section: add a Postres group with 3 dishes, move it up above Cantina
await page.click('[data-act=add-group]')
const g4 = page.locator('#menu [data-group]').last(); await g4.locator('input').first().fill('Postres')
for (const [n, d] of [['Tres Leches', 'Brulee top, fresh berries'], ['Churros', 'Cinnamon sugar, cajeta'], ['Flan', 'Burnt orange caramel']]) {
  await g4.locator('[data-act=add-item]').click(); const it = g4.locator('.item').last(); await it.locator('input').fill(n); await it.locator('textarea').fill(d)
}
await g4.locator('[data-act=up]').first().click()
// remove one existing dish (Housemade Ceviche) with confirm dialog
page.once('dialog', (d) => d.accept())
await del.locator('.item', { hasText: '' }).filter({ has: page.locator('input[value="Housemade Ceviche"]') }).locator('[data-act=del]').click()
await page.screenshot({ path: 'shots/admin-2-edited.png', fullPage: true })
await page.click('.bar button'); await page.waitForSelector('.ok'); results.saveMsg = await page.textContent('.ok')
// photo upload to the family slot
const fam = page.locator('form:has(input[name=slot][value=family])')
await fam.locator('input[type=file]').setInputFiles('test-photo.jpg'); await fam.locator('button').click(); await page.waitForSelector('.ok')
results.photoMsg = await page.textContent('.ok')
// bad upload: a text file renamed .jpg
fs.writeFileSync('fake.jpg', 'not an image')
const fam2 = page.locator('form:has(input[name=slot][value=family])')
await fam2.locator('input[type=file]').setInputFiles('fake.jpg'); await fam2.locator('button').click(); await page.waitForSelector('.er')
results.badUploadMsg = await page.textContent('.er')
// CSRF check: forged POST without token
results.csrfStatus = await page.evaluate(async () => (await fetch('/admin/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'do=save&ann_on=1&ann_text=hacked' })).status)
await ctx.close()

// 3. after-edit probes (desktop + phone)
await probe('2-after-edit')
await probe('3-after-edit-phone', { width: 390, height: 844 })
fs.writeFileSync('results.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
await browser.close()
