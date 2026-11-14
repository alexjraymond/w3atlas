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
  loot?: Loot
}

export interface Camp {
  id: string
  name: string
  difficulty: Difficulty
  position: { x: number; y: number }
  units: CreepUnit[]
}

/** One creep instance in a camp (a unit with count 2 becomes two instances). */
export interface CreepInstance {
  uid: string // `${unitIndex}-${instanceIndex}` - stable within a camp
  name: string
  level: number
  loot?: Loot
}

export interface GameMap {
  id: string // slug, also the image filename
  name: string
  width: number
  height: number
  image: string
  camps: Camp[]
}

// ---------- User data (saved routes) ----------

export type Race = 'human' | 'orc' | 'nightelf' | 'undead'
export type Matchup = Race | 'random' | 'any'

export interface RouteStep {
  id: string
  campId: string
  /** uids of creeps in the camp that are NOT killed on this step */
  skipped: string[]
  /** helper units brought along, e.g. { Militia: 4 } */
  helpers: Record<string, number>
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
  version: 1
  name: string
  mapId: string
  race: Race | null
  vs: Matchup
  hero: string | null
  /** ability names for hero levels 1..10 ('' = not set) */
  skills: string[]
  steps: RouteStep[]
  build: BuildStep[]
  mapNotes: MapNote[]
  notes: string
  createdAt: number
  updatedAt: number
}
