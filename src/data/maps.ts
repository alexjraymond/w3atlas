import type { Camp, CreepInstance, CreepUnit, Difficulty, GameMap, Loot, LootClass } from '../types'
import { creepXp } from '../game/xp'
import creepData from './creeps.json'
import itemPools from './itemPools.json'

interface RawUnit {
  name: string
  count?: number
  level: number
  /** one drop, or several */
  loot?: RawLoot | RawLoot[]
}
interface RawLoot {
  level: number
  type: string
  items?: string[]
}
interface RawMap {
  mapName: string
  /** not in the current ladder pool: hidden from lists, but saved routes still open */
  hidden?: boolean
  dimensions: { width: number; height: number }
  camps: { id: string; name?: string; position: { x: number; y: number }; units: RawUnit[] }[]
}

// Every JSON file in ./maps becomes a map. Generate one from a map file with `npm run import-map`
// (see README), and put the minimap image at /public/maps/<slug>.png.
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
 * Creep levels are fixed per unit type on melee maps, so src/data/creeps.json is the source of
 * truth; a level in a map's JSON is only used for creeps missing from that table.
 */
type CreepDef = { name: string; level: number | null; xpFactor?: number }
const CREEP_DEFS = Object.values(creepData.creeps as Record<string, CreepDef>)

const levelsByName = new Map<string, Set<number>>()
for (const c of CREEP_DEFS) if (c.level != null) levelsByName.set(c.name, (levelsByName.get(c.name) ?? new Set()).add(c.level))
/** name -> level, only for names that mean one level (some campaign variants share a name) */
export const CREEP_LEVELS: Record<string, number> = Object.fromEntries(
  [...levelsByName].filter(([, s]) => s.size === 1).map(([name, s]) => [name, [...s][0]]),
)
/** Creeps that give a share of normal XP (e.g. Skeleton Warrior: 0.5). */
const XP_FACTOR: Record<string, number> = Object.fromEntries(
  CREEP_DEFS.filter((c) => c.xpFactor != null).map((c) => [c.name, c.xpFactor as number]),
)

const POOLS = itemPools.pools as Record<string, string[]>

function toLoot(raw: RawLoot): Loot {
  const type = LOOT_CLASS[raw.type.toLowerCase()] ?? 'custom'
  const items = (raw.items ?? []).filter(Boolean)
  // map files only say "random level 2 permanent": fill in what that can be
  return { level: raw.level, type, items: items.length ? items : (POOLS[`${type}-${raw.level}`] ?? []) }
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
  const lead = units.find((u) => u.drops.length) ?? units.reduce((a, b) => (b.level > a.level ? b : a))
  const others = units.reduce((n, u) => n + u.count, 0) - 1
  return others > 0 ? `${lead.name} +${others}` : lead.name
}

function normalize(slug: string, raw: RawMap): GameMap {
  const camps: Camp[] = raw.camps.map((c) => {
    const units: CreepUnit[] = c.units.map((u) => {
      const level = CREEP_LEVELS[u.name] ?? u.level
      return {
        name: u.name,
        count: u.count ?? 1,
        level,
        xp: creepXp(level) * (XP_FACTOR[u.name] ?? 1),
        drops: (Array.isArray(u.loot) ? u.loot : u.loot ? [u.loot] : []).map(toLoot),
      }
    })
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
    hidden: !!raw.hidden,
    camps,
  }
}

export const MAPS: GameMap[] = Object.entries(files)
  .map(([path, raw]) => normalize(path.replace(/^.*\/(.*)\.json$/, '$1'), raw))
  .sort((a, b) => a.name.localeCompare(b.name))

export const MAP_BY_ID: Record<string, GameMap> = Object.fromEntries(MAPS.map((m) => [m.id, m]))

/** Maps shown in lists (the current ladder pool). */
export const POOL_MAPS: GameMap[] = MAPS.filter((m) => !m.hidden)

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
        xp: u.xp,
        // drops are carried by one instance only
        drops: ii === 0 ? u.drops : [],
      })),
    )
    instanceCache.set(camp, list)
  }
  return list
}

export function campRawXp(camp: Camp): number {
  return campInstances(camp).reduce((sum, c) => sum + c.xp, 0)
}

export function campDrops(camp: Camp) {
  return camp.units.flatMap((u) => u.drops.map((d) => ({ from: u.name, ...d })))
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
