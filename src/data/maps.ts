import type { Camp, CreepInstance, Difficulty, GameMap, LootClass } from '../types'
import { creepXp } from '../game/xp'

interface RawUnit {
  name: string
  count?: number
  level: number
  loot?: { level: number; type: string; items: string[] }
}
interface RawMap {
  mapName: string
  dimensions: { width: number; height: number }
  camps: { id: string; name?: string; position: { x: number; y: number }; units: RawUnit[] }[]
}

// Every JSON file in ./maps becomes a map. To add a map: drop `<slug>.json` here and
// `<slug>.png` into /public/maps with the same slug.
const files = import.meta.glob<RawMap>('./maps/*.json', { eager: true, import: 'default' })

const LOOT_CLASS: Record<string, LootClass> = {
  permanent: 'permanent',
  charged: 'charged',
  'power up': 'powerup',
  powerup: 'powerup',
  artifact: 'artifact',
  custom: 'custom',
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())

function campName(id: string): string {
  // "orange-camp-expo-frontal-1" -> "Expo Frontal 1"
  return titleCase(id.replace(/^(green|orange|red)-camp-/, '').replace(/-/g, ' '))
}

function difficulty(id: string): Difficulty {
  if (id.startsWith('red')) return 'red'
  if (id.startsWith('orange')) return 'orange'
  return 'green'
}

function normalize(slug: string, raw: RawMap): GameMap {
  const camps: Camp[] = raw.camps.map((c) => ({
    id: c.id,
    name: c.name ?? campName(c.id),
    difficulty: difficulty(c.id),
    position: c.position,
    units: c.units.map((u) => ({
      name: u.name,
      count: u.count ?? 1,
      level: u.level,
      loot: u.loot
        ? {
            level: u.loot.level,
            type: LOOT_CLASS[u.loot.type.toLowerCase()] ?? 'custom',
            items: u.loot.items.filter(Boolean),
          }
        : undefined,
    })),
  }))
  return {
    id: slug,
    name: raw.mapName,
    width: raw.dimensions.width,
    height: raw.dimensions.height,
    image: `${import.meta.env.BASE_URL}maps/${slug}.png`,
    camps,
  }
}

export const MAPS: GameMap[] = Object.entries(files)
  .map(([path, raw]) => normalize(path.replace(/^.*\/(.*)\.json$/, '$1'), raw))
  .sort((a, b) => a.name.localeCompare(b.name))

export const MAP_BY_ID: Record<string, GameMap> = Object.fromEntries(MAPS.map((m) => [m.id, m]))

// ---------- camp helpers ----------

const instanceCache = new WeakMap<Camp, CreepInstance[]>()

export function campInstances(camp: Camp): CreepInstance[] {
  let list = instanceCache.get(camp)
  if (!list) {
    list = camp.units.flatMap((u, ui) =>
      Array.from({ length: u.count }, (_, ii) => ({
        uid: `${ui}-${ii}`,
        name: u.name,
        level: u.level,
        // loot is carried by one instance only
        loot: ii === 0 ? u.loot : undefined,
      })),
    )
    instanceCache.set(camp, list)
  }
  return list
}

export function campLevel(camp: Camp): number {
  return campInstances(camp).reduce((sum, c) => sum + c.level, 0)
}

export function campRawXp(camp: Camp): number {
  return campInstances(camp).reduce((sum, c) => sum + creepXp(c.level), 0)
}

export function campDrops(camp: Camp) {
  return camp.units.filter((u) => u.loot).map((u) => ({ from: u.name, ...u.loot! }))
}

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  green: '#3ddc4a',
  orange: '#ffad33',
  red: '#ff4d4d',
}

export const LOOT_LABEL: Record<LootClass, string> = {
  permanent: 'Permanent',
  charged: 'Charged',
  powerup: 'Power Up',
  artifact: 'Artifact',
  custom: 'Custom',
}

export const LOOT_COLOR: Record<LootClass, string> = {
  permanent: 'blue',
  charged: 'grape',
  powerup: 'green',
  artifact: 'orange',
  custom: 'yellow',
}

export function itemName(id: string): string {
  return titleCase(id.replace(/_/g, ' ').replace(/'S\b/g, "'s"))
}

export function iconSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+?\d+$/g, '')
    .replace(/[^a-z0-9]/g, '')
}
