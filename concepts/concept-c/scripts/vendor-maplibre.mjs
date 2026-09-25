// Copies MapLibre GL's browser build into public/vendor/maplibre-gl-<version>/.
// It is served untouched (not bundled) because the library resolves its web worker
// relative to its own file. Run after upgrading: npm run vendor:maplibre
import { cpSync, mkdirSync, readFileSync, rmSync, readdirSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8'))
const dest = `public/vendor/maplibre-gl-${pkg.version}`
for (const d of readdirSync('public/vendor', { withFileTypes: true }).filter((d) => d.name.startsWith('maplibre-gl-'))) rmSync(`public/vendor/${d.name}`, { recursive: true })
mkdirSync(dest, { recursive: true })
for (const f of ['maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs', 'maplibre-gl.css']) cpSync(`node_modules/maplibre-gl/dist/${f}`, `${dest}/${f}`)
cpSync('node_modules/maplibre-gl/LICENSE.txt', `${dest}/LICENSE.txt`)
console.log(`MapLibre GL ${pkg.version} -> ${dest}`)
