#!/usr/bin/env node
// Reads Warcraft III map files (.w3x / .w3m) and writes W3Atlas camp data to src/data/maps/<slug>.json.
//
//   npm run import-map                      # every map in ./map-files
//   npm run import-map -- path/to/map.w3x   # specific files or folders
//   npm run import-map -- map.w3x --slug autumn_leaves
//   npm run import-map -- --minimaps          # also redraw minimap images from the map files
//
// What comes from the map: camp positions, which creeps are in each camp, and what each creep drops.
// What comes from src/data/creeps.json: creep names and levels (maps only store a 4-letter unit id).
// Existing camp ids/names are kept when a camp is still in about the same place, so saved routes keep working.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { Archive } from 'mopaq'
import { drawMinimap, minimapBase, PLAYER_COLORS } from './lib/minimap.mjs'

const require = createRequire(import.meta.url)
const T5 = require('wc3maptranslator')
const T4 = require('wc3maptranslator-v4')
const { units: gameUnits } = require('wc3data')

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const MAPS_DIR = path.join(ROOT, 'src/data/maps')
const IMG_DIR = path.join(ROOT, 'public/maps')
const CREEPS_FILE = path.join(ROOT, 'src/data/creeps.json')

const PLAYER_NEUTRAL_HOSTILE = 24
const CAMP_RADIUS = 700 // world units: creeps closer than this (chained) are one camp
const MATCH_RADIUS = 90 // px: reuse an existing camp's id if one is this close
const LOOT_CLASS = { i: 'permanent', j: 'charged', k: 'powerup', l: 'artifact', m: 'custom', Y: 'any' }

// ---------- args ----------
const args = process.argv.slice(2)
let forcedSlug = null
let redrawMinimaps = false
const inputs = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--slug') forcedSlug = args[++i]
  else if (args[i] === '--minimaps') redrawMinimaps = true
  else inputs.push(args[i])
}
if (!inputs.length) inputs.push(path.join(ROOT, 'map-files'))
const files = inputs.flatMap((p) =>
  fs.existsSync(p) && fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).filter((f) => /\.w3[xm]$/i.test(f)).map((f) => path.join(p, f))
    : [p],
)
if (!files.length) {
  console.error('No .w3x/.w3m files found. Put maps in ./map-files or pass paths.')
  process.exit(1)
}
if (forcedSlug && files.length > 1) {
  console.error('--slug only works with a single map file.')
  process.exit(1)
}

const creepTable = JSON.parse(fs.readFileSync(CREEPS_FILE, 'utf8')).creeps

for (const file of files) {
  try {
    importMap(file)
  } catch (e) {
    console.error(`✗ ${path.basename(file)}: ${e.message}`)
    process.exitCode = 1
  }
}

// ---------- import ----------

function importMap(file) {
  const archive = Archive.open(fs.readFileSync(file))
  const read = (name) => {
    try {
      return Buffer.from(archive.readFile(name))
    } catch {
      return null
    }
  }

  const strings = parseWts(read('war3map.wts')?.toString('utf8') ?? '')
  const info = parseInfo(read('war3map.w3i'))
  const terrain = parseW3eHeader(read('war3map.w3e'))
  const unitsBuf = read('war3mapUnits.doo')
  if (!unitsBuf) throw new Error('map has no war3mapUnits.doo')
  const units = T5.UnitsTranslator.warToJson(unitsBuf).json

  const fullName = resolveString(info.map.name, strings) || path.basename(file).replace(/\.\w+$/, '')
  const baseName = fullName.replace(/\s+v?\d+(\.\d+)*\s*$/i, '').trim()
  const major = /\s+v?(\d+)(\.\d+)*\s*$/i.exec(fullName)?.[1]
  // existing file wins (e.g. "Echo Isles v2.2" -> echo_isles_v2); new maps get the plain name
  const slug = forcedSlug ?? pickSlug([slugify(baseName), ...(major ? [slugify(`${baseName} v${major}`)] : []), slugify(fullName)])
  const outFile = path.join(MAPS_DIR, `${slug}.json`)
  const existing = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : null

  // Playable area (what minimaps show) = terrain minus the camera-bounds margins, which are given in
  // tiles as [left, right, bottom, top] and are often uneven (so the area isn't always centred).
  const pw = info.map.playableArea.width * 128
  const ph = info.map.playableArea.height * 128
  const [marginLeft, , marginBottom] = info.camera?.complements ?? [0, 0, 0, 0]
  const cx = terrain.offsetX + marginLeft * 128 + pw / 2
  const cy = terrain.offsetY + marginBottom * 128 + ph / 2
  const dims = existing?.dimensions ?? (pw >= ph ? { width: 512, height: Math.round((512 * ph) / pw) } : { width: Math.round((512 * pw) / ph), height: 512 })
  const toPx = (x, y) => ({
    x: Math.round(((x - (cx - pw / 2)) / pw) * dims.width),
    y: Math.round((((cy + ph / 2) - y) / ph) * dims.height),
  })

  const itemTables = new Map((info.randomItemTable ?? []).map((t) => [t.number, t.sets]))
  const warnings = new Set()

  // ----- cluster creeps into camps -----
  const hostile = units.filter((u) => u.player === PLAYER_NEUTRAL_HOSTILE)
  const groups = []
  for (const u of hostile) {
    const near = groups.filter((g) => g.some((o) => dist(u.position, o.position) < CAMP_RADIUS))
    const merged = [u, ...near.flat()]
    for (const g of near) groups.splice(groups.indexOf(g), 1)
    groups.push(merged)
  }

  const camps = groups.map((g) => {
    const x = g.reduce((s, u) => s + u.position[0], 0) / g.length
    const y = g.reduce((s, u) => s + u.position[1], 0) / g.length
    const byType = new Map()
    for (const u of g) {
      const def = creepTable[u.type]
      if (!def) warnings.add(`unknown creep id "${u.type}": add it to src/data/creeps.json`)
      else if (def.level == null) warnings.add(`no level for ${def.name} (${u.type}) in src/data/creeps.json`)
      const name = def?.name ?? u.type
      const level = def?.level ?? 1
      const drops = unitDrops(u, itemTables)
      // creeps with drops stay separate entries; identical plain creeps are counted
      const key = drops.length ? `${u.type}#${u.id}` : u.type
      const entry = byType.get(key) ?? { name, count: 0, level, ...(drops.length ? { loot: drops.length === 1 ? drops[0] : drops } : {}) }
      entry.count++
      byType.set(key, entry)
    }
    const camUnits = [...byType.values()].sort((a, b) => !!b.loot - !!a.loot || b.level - a.level || a.name.localeCompare(b.name))
    const level = camUnits.reduce((s, u) => s + u.level * u.count, 0)
    return { position: toPx(x, y), world: [x, y], units: camUnits, level }
  })

  // ----- keep ids of existing camps that are still in about the same place -----
  const oldCamps = existing?.camps ?? []
  const pairs = []
  camps.forEach((c, i) => oldCamps.forEach((o, j) => pairs.push([dist2(c.position, o.position), i, j])))
  pairs.sort((a, b) => a[0] - b[0])
  const usedNew = new Set()
  const usedOld = new Set()
  for (const [d, i, j] of pairs) {
    if (d > MATCH_RADIUS || usedNew.has(i) || usedOld.has(j)) continue
    usedNew.add(i)
    usedOld.add(j)
    camps[i].id = oldCamps[j].id
    camps[i].name = oldCamps[j].name ?? campNameFromId(oldCamps[j].id)
    camps[i].keepName = true
  }
  // ----- location names for new camps: what's next to them, else a compass direction -----
  const starts = (info.players ?? []).map((p) => [p.startingPos.x, p.startingPos.y])
  const landmarks = units
    .filter((u) => u.player !== PLAYER_NEUTRAL_HOSTILE && gameUnits[u.type]?.stats?.isbldg)
    .map((u) => ({ pos: u.position, label: landmarkLabel(u.type, u.position, starts) }))
    .filter((l) => l.label)
  for (const c of camps) {
    if (c.name) continue
    const near = landmarks
      .map((l) => ({ ...l, d: dist(c.world, l.pos) }))
      .filter((l) => l.d < 1100)
      .sort((a, b) => a.d - b.d)[0]
    c.name = near?.label ?? compass(c.world[0] - cx, c.world[1] - cy, pw, ph)
  }
  // number duplicates ("Shop 1", "Shop 2"), left to right then top to bottom
  const byName = new Map()
  for (const c of camps) if (!c.keepName) (byName.get(c.name) ?? byName.set(c.name, []).get(c.name)).push(c)
  for (const [name, list] of byName) {
    if (list.length < 2) continue
    list.sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y).forEach((c, i) => (c.name = `${name} ${i + 1}`))
  }

  const taken = new Set(camps.map((c) => c.id).filter(Boolean))
  for (const c of camps) {
    if (c.id) continue
    const diff = c.level >= 20 ? 'red' : c.level >= 10 ? 'orange' : 'green'
    const base = `${diff}-camp-${slugify(c.units[0]?.name ?? 'camp').replace(/_/g, '-')}`
    let n = 1
    while (taken.has(`${base}-${n}`)) n++
    c.id = `${base}-${n}`
    taken.add(c.id)
  }

  // ----- minimap -----
  // minimap: 'custom' = a hand-supplied image (e.g. from Liquipedia), never overwritten;
  // 'render' / 'generated' = built by this script, redrawn with --minimaps.
  // render-based minimaps are photo-like, so they're saved as JPEG (much smaller than PNG)
  let image = existing?.image ?? `${slug}.png`
  let img = path.join(IMG_DIR, image)
  let minimap = existing?.minimap ?? (fs.existsSync(img) ? 'custom' : undefined)
  let minimapNote = null
  const blp = read('war3mapMap.blp')
  if (blp) {
    // a clean (icon-free) base for scripts/align-render.py
    const cache = path.join(ROOT, 'map-files', '.cache')
    fs.mkdirSync(cache, { recursive: true })
    fs.writeFileSync(path.join(cache, `${slug}-base.png`), drawMinimap(minimapBase(null, blp, dims).image, []))
  }
  if (!fs.existsSync(img) || (redrawMinimaps && minimap !== 'custom')) {
    try {
      const base = minimapBase(slug, blp, dims)
      if (!base) throw new Error('no minimap in the map file')
      const fx = (x) => (x - (cx - pw / 2)) / pw
      const fy = (y) => ((cy + ph / 2) - y) / ph
      const icons = [
        ...units
          .filter((u) => u.player !== PLAYER_NEUTRAL_HOSTILE)
          .map((u) => ({ u, kind: buildingKind(u.type) }))
          .filter(({ kind }) => kind)
          .map(({ u, kind }) => ({
            kind: kind === 'goldmine' ? 'goldmine' : 'building',
            building: kind === 'goldmine' ? undefined : kind,
            fx: fx(u.position[0]),
            fy: fy(u.position[1]),
          })),
        ...(info.players ?? []).map((p) => ({
          kind: 'start',
          fx: fx(p.startingPos.x),
          fy: fy(p.startingPos.y),
          color: PLAYER_COLORS[p.playerNum] ?? [255, 255, 255],
        })),
      ]
      const format = base.source === 'render' ? 'jpg' : 'png'
      const nextImage = `${slug}.${format}`
      if (nextImage !== image && fs.existsSync(img) && minimap !== 'custom') fs.rmSync(img)
      image = nextImage
      img = path.join(IMG_DIR, image)
      fs.writeFileSync(img, drawMinimap(base.image, icons, format))
      minimap = base.source
      minimapNote = `minimap ${base.source === 'render' ? 'built from the high-res render' : 'generated from the map file'} → public/maps/${image}`
    } catch (e) {
      minimapNote = `! could not build a minimap (${e.message}): save one as public/maps/${slug}.png (${dims.width}×${dims.height}, playable area)`
    }
  }

  const out = {
    mapName: fullName,
    ...(existing?.hidden ? { hidden: true } : {}),
    ...(minimap ? { minimap } : {}),
    ...(image !== `${slug}.png` ? { image } : {}),
    source: { file: path.basename(file), importedAt: new Date().toISOString().slice(0, 10) },
    dimensions: dims,
    camps: camps
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((c) => ({ id: c.id, name: c.name, position: c.position, units: c.units })),
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n')

  // ----- report -----
  console.log(`✓ ${fullName} → src/data/maps/${slug}.json (${camps.length} camps, ${hostile.length} creeps)`)
  if (existing) {
    const dropped = oldCamps.filter((_, j) => !usedOld.has(j)).map((o) => o.id)
    const added = camps.filter((c) => !oldCamps.some((o) => o.id === c.id)).map((c) => c.id)
    if (dropped.length) console.log(`  removed camps: ${dropped.join(', ')}`)
    if (added.length) console.log(`  new camps: ${added.join(', ')}`)
  }
  if (minimapNote) console.log(`  ${minimapNote}`)
  for (const w of warnings) console.log(`  ! ${w}`)
}

// ---------- drops ----------

function decodeItem(code) {
  const m = /^Y([ijklmY])I(\d)$/.exec(code)
  if (m) return { level: Number(m[2]), type: LOOT_CLASS[m[1]] }
  return { level: 0, type: 'custom', items: [code] }
}

function unitDrops(u, itemTables) {
  const sets = u.customItemSets?.length ? u.customItemSets : u.randomItemSetId >= 0 ? toSets(itemTables.get(u.randomItemSetId)) : []
  return sets
    .map((set) => Object.entries(set ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0]) // most likely item in each set
    .filter(Boolean)
    .map((code) => {
      const d = decodeItem(code)
      return { level: d.level, type: d.type === 'any' ? 'custom' : d.type, items: d.items ?? [] }
    })
}

function toSets(tableSets) {
  return (tableSets ?? []).map((set) => Object.fromEntries(set.map((i) => [i.id, i.chance])))
}

// ---------- file parsers ----------

function parseInfo(buf) {
  if (!buf) throw new Error('map has no war3map.w3i')
  for (const T of [T5, T4]) {
    try {
      return T.InfoTranslator.warToJson(buf).json
    } catch {
      /* try the other format version */
    }
  }
  throw new Error('could not read war3map.w3i (unsupported format version)')
}

function parseW3eHeader(buf) {
  if (!buf) throw new Error('map has no war3map.w3e')
  let o = 4 + 4 + 1 + 4 // id, version, tileset, custom flag
  const nGround = buf.readInt32LE(o)
  o += 4 + 4 * nGround
  const nCliff = buf.readInt32LE(o)
  o += 4 + 4 * nCliff
  return { width: buf.readInt32LE(o), height: buf.readInt32LE(o + 4), offsetX: buf.readFloatLE(o + 8), offsetY: buf.readFloatLE(o + 12) }
}

function parseWts(text) {
  const map = {}
  const re = /STRING\s+(\d+)[^{]*\{\r?\n?([\s\S]*?)\r?\n?\}/g
  let m
  while ((m = re.exec(text))) map[m[1]] = m[2].trim()
  return map
}

function resolveString(s, strings) {
  const m = /^TRIGSTR_0*(\d+)$/.exec(s ?? '')
  return m ? (strings[m[1]] ?? '') : (s ?? '')
}

// ---------- naming ----------

/** What a neutral building is drawn as on generated minimaps (null = not drawn). */
function buildingKind(type) {
  const name = gameUnits[type]?.text?.Name ?? ''
  if (!gameUnits[type]?.stats?.isbldg) return null
  if (/gold mine/i.test(name)) return 'goldmine'
  if (/tavern/i.test(name)) return 'tavern'
  if (/merchant/i.test(name)) return 'merchant'
  if (/laboratory/i.test(name)) return 'laboratory'
  if (/mercenary/i.test(name)) return 'mercenary'
  if (/marketplace/i.test(name)) return 'marketplace'
  if (/fountain/i.test(name)) return 'fountain'
  if (/dragon roost/i.test(name)) return 'roost'
  return null
}

function landmarkLabel(type, pos, starts) {
  const name = gameUnits[type]?.text?.Name ?? ''
  if (/gold mine/i.test(name)) return starts.some((s) => dist(pos, s) < 1600) ? 'Main' : 'Expo'
  if (/merchant/i.test(name)) return 'Shop'
  if (/laboratory/i.test(name)) return 'Lab'
  if (/mercenary/i.test(name)) return 'Merc'
  if (/tavern/i.test(name)) return 'Tavern'
  if (/marketplace/i.test(name)) return 'Market'
  if (/fountain/i.test(name)) return 'Fountain'
  if (/dragon roost/i.test(name)) return 'Roost'
  return null
}

function compass(dx, dy, w, h) {
  const nx = dx / (w / 2)
  const ny = dy / (h / 2)
  if (Math.hypot(nx, ny) < 0.3) return 'Center'
  const ns = ny > 0.33 ? 'North' : ny < -0.33 ? 'South' : ''
  const ew = nx > 0.33 ? 'east' : nx < -0.33 ? 'west' : ''
  return ns ? ns + ew : ew ? ew[0].toUpperCase() + ew.slice(1) : 'Center'
}

function campNameFromId(id) {
  return id.replace(/^(green|orange|red)-camp-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------- utils ----------

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function pickSlug(candidates) {
  return candidates.find((c) => fs.existsSync(path.join(MAPS_DIR, `${c}.json`))) ?? candidates[0]
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

function dist2(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
