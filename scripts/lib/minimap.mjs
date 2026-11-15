// Builds minimap images for maps.
//
// Base picture (covers exactly the playable area):
//   1. a high-res render in scripts/assets/renders/<slug>.jpg|png, if there is one
//      (aligned with scripts/align-render.py), else
//   2. the map's own war3mapMap.blp (256px, letterboxed inside a square).
// Icons on top: gold mines and neutral buildings use Liquipedia's minimap icons
// (scripts/assets/minimap-*.png); buildings with a sprite in scripts/assets/buildings/<kind>.png
// (e.g. tavern) are drawn as that building instead; start locations are coloured crosses.

import fs from 'node:fs'
import path from 'node:path'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

const ASSETS = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../assets')

// ---------- image io ----------

/** { width, height, data: RGBA Uint8 } */
function readImage(file) {
  const buf = fs.readFileSync(file)
  if (/\.png$/i.test(file)) {
    const png = PNG.sync.read(buf)
    return { width: png.width, height: png.height, data: png.data }
  }
  const img = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true })
  return { width: img.width, height: img.height, data: img.data }
}

function writePng(img) {
  const png = new PNG({ width: img.width, height: img.height })
  Buffer.from(img.data.buffer, img.data.byteOffset, img.data.length).copy(png.data)
  return PNG.sync.write(png)
}

/** BLP1 (JPEG-compressed) -> RGBA image of the full-size mipmap. */
export function decodeBlp1(buf) {
  if (buf.toString('latin1', 0, 4) !== 'BLP1') throw new Error('minimap is not BLP1')
  if (buf.readUInt32LE(4) !== 0) throw new Error('only JPEG-compressed BLP minimaps are supported')
  const offset = buf.readUInt32LE(28) // first mipmap offset (offsets start at byte 28)
  const size = buf.readUInt32LE(28 + 64) // first mipmap size (sizes follow 16 offsets)
  const headerSize = buf.readUInt32LE(156)
  let jpegData = Buffer.concat([buf.subarray(160, 160 + headerSize), buf.subarray(offset, offset + size)])
  // Blizzard's 4-channel (BGRA) JPEGs have no Adobe APP14 marker, which jpeg-js needs for 4 channels.
  // Insert one saying "no colour transform": with an opaque 4th channel jpeg-js's CMYK maths then
  // passes the first three channels through unchanged.
  const adobe = Buffer.from([0xff, 0xee, 0x00, 0x0e, 0x41, 0x64, 0x6f, 0x62, 0x65, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00])
  if (jpegData[0] === 0xff && jpegData[1] === 0xd8) jpegData = Buffer.concat([jpegData.subarray(0, 2), adobe, jpegData.subarray(2)])
  const img = jpeg.decode(jpegData, { useTArray: true, formatAsRGBA: true })
  // BLP stores channels as BGR(A)
  for (let i = 0; i < img.data.length; i += 4) {
    const b = img.data[i]
    img.data[i] = img.data[i + 2]
    img.data[i + 2] = b
    img.data[i + 3] = 255
  }
  return img
}

// ---------- sampling ----------

/** Bilinear sample of channel c at (x, y) in pixel coordinates (clamped). */
function sample(img, x, y, c) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = x - x0
  const ty = y - y0
  const at = (xx, yy) => img.data[(Math.min(img.height - 1, Math.max(0, yy)) * img.width + Math.min(img.width - 1, Math.max(0, xx))) * 4 + c]
  return (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) + (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty
}

/** Resample the region (sx, sy, sw, sh) of src to a new w x h image. */
function resize(src, w, h, sx = 0, sy = 0, sw = src.width, sh = src.height) {
  const out = { width: w, height: h, data: new Uint8Array(w * h * 4) }
  const kx = sw / w
  const ky = sh / h
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const fx = sx + (x + 0.5) * kx - 0.5
      const fy = sy + (y + 0.5) * ky - 0.5
      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c++) out.data[i + c] = sample(src, fx, fy, c)
      out.data[i + 3] = 255
    }
  return out
}

/** Alpha-composite `sprite`, scaled by `scale`, centred at (cx, cy) on `img`. */
function stamp(img, sprite, cx, cy, scale) {
  const w = sprite.width * scale
  const h = sprite.height * scale
  const x0 = Math.floor(cx - w / 2)
  const y0 = Math.floor(cy - h / 2)
  for (let y = Math.max(0, y0); y < Math.min(img.height, y0 + h + 1); y++)
    for (let x = Math.max(0, x0); x < Math.min(img.width, x0 + w + 1); x++) {
      const sx = (x + 0.5 - (cx - w / 2)) / scale - 0.5
      const sy = (y + 0.5 - (cy - h / 2)) / scale - 0.5
      if (sx < -0.5 || sy < -0.5 || sx > sprite.width - 0.5 || sy > sprite.height - 0.5) continue
      const a = sample(sprite, sx, sy, 3) / 255
      if (a <= 0) continue
      const i = (y * img.width + x) * 4
      for (let c = 0; c < 3; c++) img.data[i + c] = img.data[i + c] * (1 - a) + sample(sprite, sx, sy, c) * a
    }
}

function fillCross(img, cx, cy, size, thickness, color) {
  for (let y = Math.floor(cy - size - 1); y <= cy + size + 1; y++)
    for (let x = Math.floor(cx - size - 1); x <= cx + size + 1; x++) {
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue
      let hits = 0
      for (const [dx, dy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
        const px = x + dx - cx
        const py = y + dy - cy
        if (Math.abs(px) <= size && Math.abs(py) <= size && (Math.abs(px - py) <= thickness || Math.abs(px + py) <= thickness)) hits++
      }
      if (!hits) continue
      const a = hits / 4
      const i = (y * img.width + x) * 4
      for (let c = 0; c < 3; c++) img.data[i + c] = img.data[i + c] * (1 - a) + color[c] * a
    }
}

// ---------- sprites ----------

const spriteCache = new Map()
function sprite(name) {
  if (!spriteCache.has(name)) {
    const file = path.join(ASSETS, `${name}.png`)
    spriteCache.set(name, fs.existsSync(file) ? readImage(file) : null)
  }
  return spriteCache.get(name)
}

/** On-map height (px at 512 wide) for building sprites, by kind. */
const BUILDING_HEIGHT = { tavern: 46 }

// ---------- public api ----------

/**
 * The base picture for a map, covering the playable area, as RGBA.
 * @param slug  map slug (looks for scripts/assets/renders/<slug>.jpg|png)
 * @param blp   war3mapMap.blp contents (fallback)
 * @param dims  playable area size in map JSON units (e.g. 512 x 366)
 */
export function minimapBase(slug, blp, dims) {
  for (const ext of ['jpg', 'png']) {
    const file = path.join(ASSETS, 'renders', `${slug}.${ext}`)
    if (fs.existsSync(file)) {
      const img = readImage(file)
      // renders are stored already cropped to the playable area; keep up to 2x resolution
      const w = Math.min(img.width, dims.width * 2)
      return { image: resize(img, w, Math.round((w * dims.height) / dims.width)), source: 'render' }
    }
  }
  if (!blp) return null
  const src = decodeBlp1(blp)
  const S = src.width
  const aspect = dims.width / dims.height
  const cw = aspect >= 1 ? S : S * aspect
  const ch = aspect >= 1 ? S / aspect : S
  return { image: resize(src, dims.width, dims.height, (S - cw) / 2, (S - ch) / 2, cw, ch), source: 'generated' }
}

/**
 * Draws icons and returns PNG contents.
 * @param base   RGBA image covering the playable area
 * @param icons  [{ kind: 'goldmine' | 'building' | 'start', building?: 'tavern' | ..., fx, fy, color? }]
 *               with fx/fy as 0..1 fractions of the playable area (fy from the top)
 */
export function drawMinimap(base, icons) {
  const img = { width: base.width, height: base.height, data: new Uint8Array(base.data) }
  const k = img.width / 512 // icons are sized for a 512px-wide map
  const order = { goldmine: 0, building: 1, start: 2 }
  for (const icon of [...icons].sort((a, b) => order[a.kind] - order[b.kind])) {
    const x = icon.fx * img.width
    const y = icon.fy * img.height
    if (icon.kind === 'start') {
      fillCross(img, x, y, 12 * k, 4.6 * k, [20, 20, 20])
      fillCross(img, x, y, 10.5 * k, 2.8 * k, icon.color ?? [255, 0, 0])
      continue
    }
    const special = icon.kind === 'building' && icon.building ? sprite(`buildings/${icon.building}`) : null
    if (special) {
      stamp(img, special, x, y, ((BUILDING_HEIGHT[icon.building] ?? 44) * k) / special.height)
      continue
    }
    const s = sprite(icon.kind === 'goldmine' ? 'minimap-goldmine' : 'minimap-building')
    if (s) stamp(img, s, x, y, k)
  }
  return writePng(img)
}

/** Player colours for start-location crosses (player index -> RGB). */
export const PLAYER_COLORS = [
  [255, 3, 3],
  [0, 66, 255],
  [28, 230, 185],
  [84, 0, 129],
  [255, 252, 1],
  [254, 138, 14],
  [32, 192, 0],
  [229, 91, 176],
]
