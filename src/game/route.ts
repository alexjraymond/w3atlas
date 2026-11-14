import type { Build, BuildStep, Camp, CreepInstance, GameMap, Loot, Route, RouteStep } from '../types'
import { campInstances } from '../data/maps'
import { heroLevelForXp, levelProgress, xpFromKill, type LevelProgress } from './xp'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function newRoute(mapId: string, partial: Partial<Route> = {}): Route {
  const now = Date.now()
  return {
    id: uid(),
    version: 2,
    name: 'New route',
    mapId,
    race: null,
    vs: 'any',
    level: 'standard',
    hero: null,
    skills: Array(10).fill(''),
    steps: [],
    buildId: null,
    mapNotes: [],
    notes: '',
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function newBuild(partial: Partial<Build> = {}): Build {
  const now = Date.now()
  return {
    id: uid(),
    version: 1,
    name: 'New build',
    race: null,
    vs: 'any',
    level: 'standard',
    notes: '',
    tags: [],
    steps: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function newStep(campId: string): RouteStep {
  return { id: uid(), kind: 'camp', campId, groups: [], rest: 'clear', helpers: {}, condition: '', note: '' }
}

export function newWaypoint(x: number, y: number, label = ''): RouteStep {
  return { id: uid(), kind: 'waypoint', point: { x, y }, label, groups: [], rest: 'clear', helpers: {}, condition: '', note: '' }
}

export function stepPosition(map: GameMap, step: RouteStep): { x: number; y: number } | undefined {
  if (step.kind === 'waypoint') return step.point
  return map.camps.find((c) => c.id === step.campId)?.position
}

/** The creeps killed on a step, as ordered groups (the "rest" becomes a final group). */
export function killGroups(camp: Camp, step: RouteStep): { creeps: CreepInstance[]; isRest: boolean }[] {
  const all = campInstances(camp)
  const byUid = new Map(all.map((c) => [c.uid, c]))
  const used = new Set<string>()
  const groups = step.groups
    .map((g) =>
      g
        .map((u) => byUid.get(u))
        .filter((c): c is CreepInstance => !!c && !used.has(c.uid) && (used.add(c.uid), true)),
    )
    .filter((g) => g.length)
    .map((creeps) => ({ creeps, isRest: false }))
  const rest = all.filter((c) => !used.has(c.uid))
  if (rest.length && step.rest === 'clear') groups.push({ creeps: rest, isRest: true })
  return groups
}

export interface GroupResult {
  creeps: CreepInstance[]
  isRest: boolean
  xpGained: number
  levelUps: number[]
}

export interface StepResult {
  step: RouteStep
  index: number
  camp?: Camp
  groups: GroupResult[]
  xpGained: number
  levelBefore: number
  after: LevelProgress
  levelUps: number[]
  drops: (Loot & { from: string })[]
  killed: number
  total: number
}

/** Walks the route in order, applying XP per kill (the XP rate depends on hero level at that kill). */
export function simulateRoute(map: GameMap, steps: RouteStep[]): { results: StepResult[]; final: LevelProgress } {
  let xp = 0
  const results: StepResult[] = steps.map((step, index) => {
    const camp = step.kind === 'camp' ? map.camps.find((c) => c.id === step.campId) : undefined
    const levelBefore = heroLevelForXp(xp)
    const stepStart = xp
    const groups: GroupResult[] = (camp ? killGroups(camp, step) : []).map((g) => {
      const before = heroLevelForXp(xp)
      const start = xp
      // inside a group kills happen in any order; take weakest first (differences are tiny)
      for (const c of [...g.creeps].sort((a, b) => a.level - b.level)) xp += xpFromKill(xp, c.level)
      const after = heroLevelForXp(xp)
      return { ...g, xpGained: xp - start, levelUps: range(before + 1, after) }
    })
    const killed = groups.flatMap((g) => g.creeps)
    return {
      step,
      index,
      camp,
      groups,
      xpGained: xp - stepStart,
      levelBefore,
      after: levelProgress(xp),
      levelUps: range(levelBefore + 1, heroLevelForXp(xp)),
      drops: killed.flatMap((c) => c.drops.map((d) => ({ from: c.name, ...d }))),
      killed: killed.length,
      total: camp ? campInstances(camp).length : 0,
    }
  })
  return { results, final: levelProgress(xp) }
}

function range(from: number, to: number) {
  const out: number[] = []
  for (let i = from; i <= to; i++) out.push(i)
  return out
}

// ---------- build order text import ----------

const TIME_RE = /^(\d{1,2}:\d{2})\s*[-–:|]?\s*/
const SUPPLY_RE = /^(\d{1,3}(?:\/\d{1,3})?)\s*[-–:.|)]?\s*/

/**
 * Parses free text like "5 - Altar", "6 Barracks", "1:45 12/20 Hero", "Farm" — one step per line.
 */
export function parseBuildOrder(text: string): BuildStep[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean)
    .map((line) => {
      let rest = line
      let time = ''
      let supply = ''
      let m = rest.match(TIME_RE)
      if (m) {
        time = m[1]
        rest = rest.slice(m[0].length)
      }
      m = rest.match(SUPPLY_RE)
      if (m && rest.length > m[0].length) {
        supply = m[1]
        rest = rest.slice(m[0].length)
      }
      if (!time) {
        m = rest.match(TIME_RE)
        if (m) {
          time = m[1]
          rest = rest.slice(m[0].length)
        }
      }
      return { id: uid(), supply, time, action: rest.trim() }
    })
}

export function buildOrderToText(steps: BuildStep[]): string {
  return steps.map((s) => [s.time, s.supply, s.action].filter(Boolean).join(' ')).join('\n')
}
