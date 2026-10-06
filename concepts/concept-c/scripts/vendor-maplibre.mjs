// Copies MapLibre GL's browser build into public/vendor/maplibre-gl-<version>/.
// It is served as plain files (not bundled) because the library finds its web worker next to itself.
// Run after upgrading: npm run vendor:maplibre
//
// The three modules are renamed from .mjs to .js and the four places that name each other are
// patched to match. A .js file is served as JavaScript by every web server, while some hosts
// (and SiteGround's static-file front end) do not know .mjs, which browsers refuse as a module.
// Nothing else in the library is touched.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8'))
const dest = `public/vendor/maplibre-gl-${pkg.version}`
for (const d of readdirSync('public/vendor', { withFileTypes: true }).filter((d) => d.name.startsWith('maplibre-gl-'))) rmSync(`public/vendor/${d.name}`, { recursive: true })
mkdirSync(dest, { recursive: true })

const patch = (name, rules) => {
  let src = readFileSync(`node_modules/maplibre-gl/dist/${name}.mjs`, 'utf8')
  for (const [from, to, expected] of rules) {
    const found = src.split(from).length - 1
    if (found !== expected) throw new Error(`${name}.mjs: expected ${expected} x ${from}, found ${found}. MapLibre changed; review this script.`)
    src = src.split(from).join(to)
  }
  src = src.replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n')
  writeFileSync(`${dest}/${name}.js`, src)
}
patch('maplibre-gl', [
  ['./maplibre-gl-shared.mjs', './maplibre-gl-shared.js', 1],
  ['maplibre-gl-worker-dev.mjs', 'maplibre-gl-worker-dev.js', 1],
  ['maplibre-gl-worker.mjs', 'maplibre-gl-worker.js', 1],
  ['-dev.mjs', '-dev.js', 1],
])
patch('maplibre-gl-worker', [['./maplibre-gl-shared.mjs', './maplibre-gl-shared.js', 1]])
patch('maplibre-gl-shared', [])

cpSync('node_modules/maplibre-gl/dist/maplibre-gl.css', `${dest}/maplibre-gl.css`)
cpSync('node_modules/maplibre-gl/LICENSE.txt', `${dest}/LICENSE.txt`)
console.log(`MapLibre GL ${pkg.version} -> ${dest}`)
