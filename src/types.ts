// ---------- Static game / map data ----------

export type Difficulty = 'green' | 'orange' | 'red'
export type LootClass = 'permanent' | 'charged' | 'powerup' | 'artifact' | 'custom'

export interface Loot {
  level: number
  type: LootClass
  items: string[]
}

export interface CreepUnit {
  name: string
  count: number
  level: number
  /** raw XP this creep is worth (usually set by level; some creeps give less) */
  xp: number
  /** item drops (a creep can drop more than one item) */
  drops: Loot[]
}

export interface Camp {
  id: string
  /** where the camp is, e.g. "Shop 1" */
  name: string
  /** what the camp is, e.g. "Sasquatch +2" (item dropper, or strongest creep) */
  title: string
  difficulty: Difficulty
  /** sum of creep levels in the camp */
  level: number
  position: { x: number; y: number }
  units: CreepUnit[]
}

/** One creep instance in a camp (a unit with count 2 becomes two instances). */
export interface CreepInstance {
  uid: string // `${unitIndex}-${instanceIndex}` - stable within a camp
  name: string
  level: number
  xp: number
  drops: Loot[]
}

export interface GameMap {
  id: string // slug, also the image filename
  name: string
  width: number
  height: number
  image: string
  hidden: boolean
  camps: Camp[]
}

// ---------- User data ----------

export type Race = 'human' | 'orc' | 'nightelf' | 'undead'
export type Matchup = Race | 'any'

export interface RouteStep {
  id: string
  kind: 'camp' | 'waypoint'
  /** kind === 'camp' */
  campId?: string
  /** kind === 'waypoint': position in map pixels */
  point?: { x: number; y: number }
  /** kind === 'waypoint': what happens here, e.g. "Shop: buy TP" */
  label?: string
  /** Kill order: groups of creep uids. Creeps in one group die in any order. */
  groups: string[][]
  /** What happens to creeps not in any group. */
  rest: 'clear' | 'skip'
  /** units brought along, e.g. { Footman: 5 } */
  helpers: Record<string, number>
  condition: string
  note: string
}

export interface BuildStep {
  id: string
  supply: string
  time: string
  action: string
}

export interface MapNote {
  id: string
  x: number // percent of map width
  y: number // percent of map height
  text: string
}

export interface Route {
  id: string
  version: 2
  name: string
  mapId: string
  race: Race | null
  vs: Matchup
  hero: string | null
  /** ability names for hero levels 1..10 ('' = not set) */
  skills: string[]
  steps: RouteStep[]
  /** companion build order */
  buildId: string | null
  mapNotes: MapNote[]
  notes: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface Build {
  id: string
  version: 1
  name: string
  race: Race | null
  vs: Matchup
  notes: string
  tags: string[]
  steps: BuildStep[]
  createdAt: number
  updatedAt: number
}
