import type { BuildStep, GameMap, Loot, Route, RouteStep } from '../types'
import { campInstances } from '../data/maps'
import { heroLevelForXp, levelProgress, xpFromKill, type LevelProgress } from './xp'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function newRoute(mapId: string, partial: Partial<Route> = {}): Route {
  const now = Date.now()
  return {
    id: uid(),
    version: 1,
    name: 'New route',
    mapId,
    race: null,
    vs: 'any',
    hero: null,
    skills: Array(10).fill(''),
    steps: [],
    build: [],
    mapNotes: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function newStep(campId: string): RouteStep {
  return { id: uid(), campId, skipped: [], helpers: {}, note: '' }
}

export interface StepResult {
  step: RouteStep
  index: number
  xpGained: number
  levelBefore: number
  after: LevelProgress
  /** hero levels reached during this step, e.g. [2] or [3, 4] */
  levelUps: number[]
  drops: (Loot & { from: string })[]
  killed: number
  total: number
}

/** Walks the route in order, applying XP per kill (rate depends on level at kill time). */
export function simulateRoute(map: GameMap, steps: RouteStep[]): { results: StepResult[]; final: LevelProgress } {
  let xp = 0
  const results: StepResult[] = []
  steps.forEach((step, index) => {
    const camp = map.camps.find((c) => c.id === step.campId)
    const levelBefore = heroLevelForXp(xp)
    const skipped = new Set(step.skipped)
    const instances = camp ? campInstances(camp) : []
    const killed = instances.filter((c) => !skipped.has(c.uid))
    // kill weakest first so the higher XP-rate applies to cheap creeps (order barely matters)
    const start = xp
    for (const c of [...killed].sort((a, b) => a.level - b.level)) xp += xpFromKill(xp, c.level)
    const levelAfter = heroLevelForXp(xp)
    const levelUps: number[] = []
    for (let l = levelBefore + 1; l <= levelAfter; l++) levelUps.push(l)
    results.push({
      step,
      index,
      xpGained: xp - start,
      levelBefore,
      after: levelProgress(xp),
      levelUps,
      drops: killed.filter((c) => c.loot).map((c) => ({ from: c.name, ...c.loot! })),
      killed: killed.length,
      total: instances.length,
    })
  })
  return { results, final: levelProgress(xp) }
}

// ---------- build order text import ----------

const TIME_RE = /^(\d{1,2}:\d{2})\s*[-–:|]?\s*/
const SUPPLY_RE = /^(\d{1,3}(?:\/\d{1,3})?)\s*[-–:.|)]?\s*/

/**
 * Parses free text like
 *   "5 - Altar"
 *   "6 Barracks"
 *   "1:45 12/20 Hero"
 *   "Farm" (no supply)
 * one step per line.
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
