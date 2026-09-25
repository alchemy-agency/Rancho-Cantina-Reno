// Interactive parking map: MapLibre GL (served untouched from /vendor) on OpenFreeMap vector tiles,
// styled to match the static map. Loaded only when the Visit section comes near.
import { PIN, LOT_LABEL, VIEW, PARKING, LOT } from './pmap-data.js'

const LIB = '/vendor/maplibre-gl-6.11.2/'
const GOOGLE = 'https://www.google.com/maps/dir/?api=1&destination=700+Riverside+Drive%2C+Reno%2C+NV+89503'

const C = {
  land: '#f3f0ea', park: '#dde4d4', grass: '#e4e8dc', water: '#c6d6d9', bank: '#a3b9bd', building: '#e5dfd4', buildingEdge: '#dad3c6',
  casing: '#d3cbbd', road: '#ffffff', path: '#93a596', rail: '#c9c1b3', parking: '#eebd22', label: '#4a4741', waterLabel: '#4d6b72', parkLabel: '#3e4a3a',
}
// real-world widths: at this latitude a zoom-18 pixel is about 0.46 m
const W = {
  major: ['interpolate', ['exponential', 2], ['zoom'], 12, 1.2, 14, 3.5, 16, 10, 18, 32, 20, 118],
  minor: ['interpolate', ['exponential', 2], ['zoom'], 13, 0.4, 14, 1.8, 16, 6.8, 18, 24, 20, 96],
  service: ['interpolate', ['exponential', 2], ['zoom'], 14, 0.6, 16, 2.6, 18, 9, 20, 34],
}
const casing = (w, extra) => ['interpolate', ['exponential', 2], ['zoom'], ...w.slice(3).flatMap((v, i) => (i % 2 ? [v + extra] : [v]))]

const STYLE = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': C.land } },
    { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood']]], paint: { 'fill-color': C.grass } },
    { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park } },
    { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
    { id: 'water-bank', type: 'line', source: 'omt', 'source-layer': 'water', paint: { 'line-color': C.bank, 'line-width': 1 } },
    { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': C.bank, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 1.5] } },
    { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': C.building, 'fill-outline-color': C.buildingEdge } },
    { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': C.rail, 'line-width': 1.2, 'line-dasharray': [3, 2] } },
    { id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15, filter: ['==', ['get', 'class'], 'path'], layout: { 'line-cap': 'round' }, paint: { 'line-color': C.path, 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 0.8, 18, 2], 'line-dasharray': [2, 2] } },
    { id: 'service-case', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 14, filter: ['in', ['get', 'class'], ['literal', ['service', 'track']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.casing, 'line-width': casing(W.service, 1.5) } },
    { id: 'minor-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'minor'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.casing, 'line-width': casing(W.minor, 2) } },
    { id: 'major-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.casing, 'line-width': casing(W.major, 2.5) } },
    { id: 'service', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 14, filter: ['in', ['get', 'class'], ['literal', ['service', 'track']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#faf8f4', 'line-width': W.service } },
    { id: 'minor', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'minor'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.road, 'line-width': W.minor } },
    { id: 'major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.road, 'line-width': W.major } },
    { id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14, filter: ['in', ['get', 'class'], ['literal', ['minor', 'secondary', 'tertiary', 'primary', 'trunk']]], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 17, 12.5, 19, 14], 'text-letter-spacing': 0.02, 'text-max-angle': 30 }, paint: { 'text-color': C.label, 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 } },
    { id: 'water-label', type: 'symbol', source: 'omt', 'source-layer': 'waterway', minzoom: 13, filter: ['has', 'name'], layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 17, 15], 'text-letter-spacing': 0.12, 'symbol-spacing': 420 }, paint: { 'text-color': C.waterLabel, 'text-halo-color': C.water, 'text-halo-width': 1 } },
    { id: 'park-label', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 15, filter: ['==', ['get', 'class'], 'park'], layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': 12, 'text-max-width': 7 }, paint: { 'text-color': C.parkLabel, 'text-halo-color': C.park, 'text-halo-width': 1.2 } },
  ],
}

let cssOnce
const loadCss = () => (cssOnce ||= new Promise((resolve, reject) => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'; link.href = `${LIB}maplibre-gl.css`
  link.onload = resolve; link.onerror = reject
  document.head.appendChild(link)
}))

const hatch = () => {
  const s = 16; const c = document.createElement('canvas'); c.width = c.height = s
  const g = c.getContext('2d')
  g.fillStyle = '#ebe5da'; g.fillRect(0, 0, s, s)
  g.strokeStyle = '#d2c8b6'; g.lineWidth = 2.4
  for (const o of [-s, 0, s]) { g.beginPath(); g.moveTo(o, s); g.lineTo(o + s, 0); g.stroke() }
  return g.getImageData(0, 0, s, s)
}

const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild }

export async function createLiveMap(container) {
  const [mod] = await Promise.all([import(/* @vite-ignore */ `${LIB}maplibre-gl.mjs`), loadCss()])
  const maplibregl = mod.default || mod
  const narrow = container.clientWidth < 600
  const map = new maplibregl.Map({
    container,
    style: STYLE,
    ...(narrow ? { center: PIN, zoom: 16.2 } : { bounds: VIEW, fitBoundsOptions: { padding: 16 } }),
    minZoom: 13,
    maxZoom: 19,
    maxBounds: [[-119.875, 39.495], [-119.765, 39.55]],
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    cooperativeGestures: true,
    renderWorldCopies: false,
    attributionControl: { compact: true },
  })
  map.touchZoomRotate.disableRotation()
  map.keyboard.disableRotation()
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

  // back to the restaurant
  const home = {
    onAdd() {
      const box = el('<div class="maplibregl-ctrl maplibregl-ctrl-group pm-live-home"><button type="button" title="Back to Rancho Cantina" aria-label="Back to Rancho Cantina"><span aria-hidden="true"></span></button></div>')
      box.querySelector('button').addEventListener('click', () => (narrow ? map.flyTo({ center: PIN, zoom: 16.2 }) : map.fitBounds(VIEW, { padding: 16 })))
      return box
    },
    onRemove() {},
  }
  map.addControl(home, 'top-right')

  const ready = new Promise((resolve, reject) => {
    let loaded = false
    const timer = setTimeout(() => reject(new Error('map timed out')), 15000)
    map.on('error', (e) => { if (!loaded) { clearTimeout(timer); reject(e.error || new Error('map error')) } })
    map.on('load', () => {
      loaded = true
      map.addImage('pm-hatch', hatch(), { pixelRatio: 2 })
      map.addSource('pm-lot', { type: 'geojson', data: LOT })
      map.addSource('pm-parking', { type: 'geojson', data: PARKING })
      map.addLayer({ id: 'pm-lot', type: 'fill', source: 'pm-lot', paint: { 'fill-pattern': 'pm-hatch' } }, 'road-label')
      map.addLayer({ id: 'pm-lot-edge', type: 'line', source: 'pm-lot', paint: { 'line-color': '#b3a893', 'line-width': 1.2, 'line-dasharray': [3, 2] } }, 'road-label')
      map.addLayer({ id: 'pm-parking', type: 'line', source: 'pm-parking', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.parking, 'line-width': ['interpolate', ['exponential', 2], ['zoom'], 14, 1.2, 16, 2.6, 17, 3.8, 18, 5.6, 19, 8.5] } }, 'road-label')

      new maplibregl.Marker({ element: el('<div class="pm-live-lot" aria-hidden="true">Lot · 90+ spots</div>'), anchor: 'center' }).setLngLat(LOT_LABEL).addTo(map)
      new maplibregl.Marker({
        element: el(`<a class="pm-live-pin" href="${GOOGLE}" target="_blank" rel="noopener" aria-label="Rancho Cantina, 700 Riverside Drive: directions in Google Maps"><span class="pm-live-pin__drop" aria-hidden="true"></span><span class="pm-live-pin__card"><strong>Rancho Cantina</strong><em>700 Riverside Drive</em></span></a>`),
        anchor: 'bottom',
      }).setLngLat(PIN).addTo(map)

      // only reveal once real map tiles have drawn; otherwise the static map stays
      map.once('idle', () => {
        clearTimeout(timer)
        const drawn = map.querySourceFeatures('omt', { sourceLayer: 'transportation' }).length > 0
        drawn ? resolve(map) : reject(new Error('no map tiles'))
      })
    })
  })
  try { return await ready } catch (err) { map.remove(); throw err }
}
