// Builds a minimap PNG from a map's own files: war3mapMap.blp (the terrain minimap) plus
// war3map.mmp (minimap icons: gold mines, neutral buildings, start locations).
//
// The .blp is always square; a non-square playable area is letterboxed (scaled to fit, centred).
// .mmp icon positions are in that same square, 0-255.

import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

/** BLP1 (JPEG-compressed) -> { width, height, data: RGBA } for the full-size mipmap. */
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

/** war3map.mmp -> [{ type: 0 gold mine | 1 neutral building | 2 start, x, y, color: [r,g,b] }] */
export function parseMmp(buf) {
  const n = buf.readInt32LE(4)
  const icons = []
  for (let i = 0; i < n; i++) {
    const o = 8 + i * 16
    const [b, g, r] = [buf[o + 12], buf[o + 13], buf[o + 14]]
    icons.push({ type: buf.readInt32LE(o), x: buf.readInt32LE(o + 4), y: buf.readInt32LE(o + 8), color: [r, g, b] })
  }
  return icons
}

// ---------- tiny raster helpers (RGBA buffer, width w) ----------

function blend(img, x, y, [r, g, b], a = 1) {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return
  const i = (y * img.width + x) * 4
  img.data[i] = img.data[i] * (1 - a) + r * a
  img.data[i + 1] = img.data[i + 1] * (1 - a) + g * a
  img.data[i + 2] = img.data[i + 2] * (1 - a) + b * a
}

function fillShape(img, cx, cy, radius, inside, color) {
  for (let y = Math.floor(cy - radius - 1); y <= cy + radius + 1; y++)
    for (let x = Math.floor(cx - radius - 1); x <= cx + radius + 1; x++) {
      // 2x2 supersampling for soft edges
      let hits = 0
      for (const [dx, dy] of [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) if (inside(x + dx - cx, y + dy - cy)) hits++
      if (hits) blend(img, x, y, color, hits / 4)
    }
}

const circle = (r) => (x, y) => x * x + y * y <= r * r
// a little house: square body + triangular roof, s = half width
const house = (s) => (x, y) => (y >= -s * 0.15 && y <= s && Math.abs(x) <= s * 0.8) || (y < -s * 0.15 && y >= -s && Math.abs(x) <= (y + s) * 0.95)
const cross = (s, t) => (x, y) => Math.abs(x) <= s && Math.abs(y) <= s && (Math.abs(x - y) <= t || Math.abs(x + y) <= t)

function drawIcon(img, icon, x, y, scale) {
  const k = scale // output px per minimap px: 2 at 512 wide, 4 at 1024
  if (icon.type === 0) {
    fillShape(img, x, y, 7.5 * k, circle(7.5 * k), [20, 20, 10])
    fillShape(img, x, y, 6 * k, circle(6 * k), [255, 212, 0])
    fillShape(img, x - 2 * k, y - 2 * k, 2 * k, circle(2 * k), [255, 245, 170])
  } else if (icon.type === 1) {
    fillShape(img, x, y, 8 * k, house(8 * k), [20, 20, 10])
    fillShape(img, x, y, 6.2 * k, house(6.2 * k), [255, 212, 0])
    fillShape(img, x, y + 2 * k, 2.5 * k, (dx, dy) => Math.abs(dx) <= 1.6 * k && dy >= -1 * k && dy <= 2.5 * k, [20, 20, 10])
  } else if (icon.type === 2) {
    fillShape(img, x, y, 8 * k, cross(8 * k, 3.4 * k), [20, 20, 20])
    fillShape(img, x, y, 7 * k, cross(7 * k, 2 * k), icon.color)
  }
}

/**
 * @param blpBuf  war3mapMap.blp
 * @param mmpBuf  war3map.mmp (optional)
 * @param dims    output size, e.g. { width: 512, height: 408 } (same aspect as the playable area)
 * @returns PNG file contents
 */
export function renderMinimap(blpBuf, mmpBuf, dims) {
  const src = decodeBlp1(blpBuf)
  const S = src.width
  // the playable area inside the square, letterboxed
  const aspect = dims.width / dims.height
  const cw = aspect >= 1 ? S : S * aspect
  const ch = aspect >= 1 ? S / aspect : S
  const cx0 = (S - cw) / 2
  const cy0 = (S - ch) / 2

  const out = { width: dims.width, height: dims.height, data: Buffer.alloc(dims.width * dims.height * 4) }
  const sx = cw / dims.width
  const sy = ch / dims.height
  const at = (x, y, c) => src.data[(Math.min(S - 1, Math.max(0, y)) * S + Math.min(S - 1, Math.max(0, x))) * 4 + c]
  for (let y = 0; y < dims.height; y++)
    for (let x = 0; x < dims.width; x++) {
      // bilinear sample
      const fx = cx0 + (x + 0.5) * sx - 0.5
      const fy = cy0 + (y + 0.5) * sy - 0.5
      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const tx = fx - x0
      const ty = fy - y0
      const i = (y * dims.width + x) * 4
      for (let c = 0; c < 3; c++) {
        const top = at(x0, y0, c) * (1 - tx) + at(x0 + 1, y0, c) * tx
        const bottom = at(x0, y0 + 1, c) * (1 - tx) + at(x0 + 1, y0 + 1, c) * tx
        out.data[i + c] = top * (1 - ty) + bottom * ty
      }
      out.data[i + 3] = 255
    }

  if (mmpBuf) drawIcons(out, mmpBuf)

  const png = new PNG({ width: dims.width, height: dims.height })
  out.data.copy(png.data)
  return PNG.sync.write(png)
}

/** Draws the .mmp icons onto an RGBA image that covers exactly the playable area. */
function drawIcons(img, mmpBuf) {
  const S = 256
  const aspect = img.width / img.height
  const cw = aspect >= 1 ? S : S * aspect
  const ch = aspect >= 1 ? S / aspect : S
  const cx0 = (S - cw) / 2
  const cy0 = (S - ch) / 2
  const scale = img.width / cw
  // buildings and mines first, start locations on top
  for (const icon of parseMmp(mmpBuf).sort((a, b) => (a.type === 2) - (b.type === 2)))
    drawIcon(img, icon, (icon.x - cx0) * scale, (icon.y - cy0) * (img.height / ch), scale)
}

/**
 * Adds gold mine / building / start icons to an existing image (PNG) that shows the playable
 * area, e.g. a high-res render without icons.
 */
export function addMinimapIcons(pngBuf, mmpBuf) {
  const png = PNG.sync.read(pngBuf)
  drawIcons({ width: png.width, height: png.height, data: png.data }, mmpBuf)
  return PNG.sync.write(png)
}
