/**
 * Night Elf wisp spots: places a wisp can stand that enemies cannot reach or attack.
 * Tied to the map (not to a camp or route). Positions are in minimap pixels (the map's
 * 512-wide coordinate space); pictures live in public/wisp/<map id>/<spot id>.webp.
 */
export interface WispSpot {
  id: string
  /** short place name, e.g. "Bottom merchant" */
  label: string
  x: number
  y: number
  image: string
}

const SPOTS: Record<string, Omit<WispSpot, 'image'>[]> = {
  hammerfall: [{ id: 'bottom-merchant', label: 'Bottom merchant', x: 209, y: 368 }],
}

export function wispSpots(mapId: string): WispSpot[] {
  return (SPOTS[mapId] ?? []).map((s) => ({ ...s, image: `${import.meta.env.BASE_URL}wisp/${mapId}/${s.id}.webp` }))
}
