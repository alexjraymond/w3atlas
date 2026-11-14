import type { Camp, CreepInstance, CreepUnit, Difficulty, GameMap, LootClass } from '../types'
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

/**
 * Creep levels are fixed per unit type on melee maps, so they live here rather than per camp.
 * Only levels that have been verified are listed; anything else falls back to the map JSON.
 * Verified against warcraft-gym XP numbers (e.g. Sasquatch camp: trolls +116, Sasquatch +92).
 */
export const CREEP_LEVELS: Record<string, number> = {
  Sasquatch: 5,
  'Forest Troll Berserker': 4,
  'Forest Troll Trapper': 3,
  'Ogre Magi': 5,
  'Frost Wolf': 2,
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

/** "Sasquatch +2": the item dropper (or strongest creep) plus how many others are in the camp. */
function campTitle(units: CreepUnit[]): string {
  if (!units.length) return 'Empty camp'
  const lead = units.find((u) => u.loot) ?? units.reduce((a, b) => (b.level > a.level ? b : a))
  const others = units.reduce((n, u) => n + u.count, 0) - 1
  return others > 0 ? `${lead.name} +${others}` : lead.name
}

function normalize(slug: string, raw: RawMap): GameMap {
  const camps: Camp[] = raw.camps.map((c) => {
    const units: CreepUnit[] = c.units.map((u) => ({
      name: u.name,
      count: u.count ?? 1,
      level: CREEP_LEVELS[u.name] ?? u.level,
      loot: u.loot
        ? {
            level: u.loot.level,
            type: LOOT_CLASS[u.loot.type.toLowerCase()] ?? 'custom',
            items: u.loot.items.filter(Boolean),
          }
        : undefined,
    }))
    return {
      id: c.id,
      name: c.name ?? campName(c.id),
      title: campTitle(units),
      difficulty: difficulty(c.id),
      level: units.reduce((n, u) => n + u.level * u.count, 0),
      position: c.position,
      units,
    }
  })
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

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  green: 'Easy',
  orange: 'Medium',
  red: 'Hard',
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
