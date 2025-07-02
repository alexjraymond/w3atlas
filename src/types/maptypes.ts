export interface Loot {
  level: number
  type: string
  items: string[]
}

export interface Unit {
  name: string
  count: number
  level: number
  xp: number
  loot?: Loot
}

export interface Position {
  x: number
  y: number
}

export interface Camp {
  id: string
  position: Position
  units: Unit[]
}

export interface MapData {
  mapName: string
  dimensions: { width: number; height: number }
  camps: Camp[]
}
