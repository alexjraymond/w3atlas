import type { Build, BuildStep, GameMap, Matchup, Race, Route, RouteStep } from '../types'
import { campInstances, MAP_BY_ID } from '../data/maps'
import { newBuild, newRoute, uid } from '../game/route'

// Validation + migration for anything read from storage, files or share links.

const RACES = ['human', 'orc', 'nightelf', 'undead']

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null)
const race = (v: unknown): Race | null => (RACES.includes(v as string) ? (v as Race) : null)
const matchup = (v: unknown): Matchup => (RACES.includes(v as string) ? (v as Race) : 'any')
const tags = (v: unknown) => arr(v).filter((t): t is string => typeof t === 'string' && !!t.trim()).slice(0, 12)

export function sanitizeBuildSteps(v: unknown): BuildStep[] {
  return arr(v)
    .map(obj)
    .filter((b): b is Record<string, unknown> => !!b)
    .map((b) => ({ id: str(b.id, uid()), supply: str(b.supply), time: str(b.time), action: str(b.action) }))
}

function sanitizeStep(raw: unknown, map: GameMap): RouteStep | null {
  const s = obj(raw)
  if (!s) return null
  const helpers = Object.fromEntries(
    Object.entries(obj(s.helpers) ?? {}).filter(([, n]) => typeof n === 'number' && n > 0),
  ) as Record<string, number>
  const step: RouteStep = {
    id: str(s.id, uid()),
    kind: 'camp',
    groups: arr(s.groups)
      .map((g) => arr(g).filter((u): u is string => typeof u === 'string'))
      .filter((g) => g.length),
    rest: s.rest === 'skip' ? 'skip' : 'clear',
    helpers,
    condition: str(s.condition),
    note: str(s.note),
    ...(typeof s.aowNote === 'string' ? { aowNote: s.aowNote } : {}),
  }
  const point = obj(s.point)
  if (s.kind === 'waypoint' && point && typeof point.x === 'number' && typeof point.y === 'number') {
    return { ...step, kind: 'waypoint', point: { x: point.x, y: point.y }, label: str(s.label) }
  }
  const camp = map.camps.find((c) => c.id === s.campId)
  if (!camp) return null
  step.campId = camp.id
  // v1 stored `skipped` creeps: kill everything else, skip the rest
  const skipped = arr(s.skipped)
  if (!step.groups.length && skipped.length) {
    step.groups = [campInstances(camp).map((c) => c.uid).filter((u) => !skipped.includes(u))]
    step.rest = 'skip'
  }
  return step
}

/** Returns the route plus, for v1 data, the build order that used to be embedded in it. */
export function sanitizeRoute(input: unknown): { route: Route; legacyBuild: Build | null } | null {
  const r = obj(input)
  if (!r) return null
  const mapId = str(r.mapId)
  const map = MAP_BY_ID[mapId]
  if (!map) return null
  const base = newRoute(mapId)
  const steps = arr(r.steps)
    .map((s) => sanitizeStep(s, map))
    .filter((s): s is RouteStep => !!s)
  const skills = arr(r.skills).map((x) => str(x))
  const route: Route = {
    ...base,
    id: str(r.id, base.id),
    ownerId: typeof r.ownerId === 'string' ? r.ownerId : null,
    isPublic: r.isPublic === true,
    name: str(r.name, base.name),
    race: race(r.race),
    vs: matchup(r.vs),
    hero: typeof r.hero === 'string' ? r.hero : null,
    skills: [...skills, ...Array(10).fill('')].slice(0, 10),
    steps,
    buildId: typeof r.buildId === 'string' ? r.buildId : null,
    mapNotes: arr(r.mapNotes)
      .map(obj)
      .filter((n): n is Record<string, unknown> => !!n && typeof n.x === 'number' && typeof n.y === 'number')
      .map((n) => ({ id: str(n.id, uid()), x: n.x as number, y: n.y as number, text: str(n.text) })),
    aowPath: arr(r.aowPath)
      .map(obj)
      .filter((n): n is Record<string, unknown> => !!n && typeof n.x === 'number' && typeof n.y === 'number')
      .map((n) => ({ id: str(n.id, uid()), x: n.x as number, y: n.y as number, note: str(n.note) })),
    notes: str(r.notes),
    tags: tags(r.tags),
    createdAt: num(r.createdAt, base.createdAt),
    updatedAt: num(r.updatedAt, base.updatedAt),
  }
  const legacySteps = sanitizeBuildSteps(r.build)
  const legacyBuild =
    !route.buildId && legacySteps.length
      ? newBuild({ name: `${route.name} build`, race: route.race, vs: route.vs, steps: legacySteps })
      : null
  if (legacyBuild) route.buildId = legacyBuild.id
  return { route, legacyBuild }
}

export function sanitizeBuild(input: unknown): Build | null {
  const b = obj(input)
  if (!b) return null
  const base = newBuild()
  return {
    ...base,
    id: str(b.id, base.id),
    ownerId: typeof b.ownerId === 'string' ? b.ownerId : null,
    isPublic: b.isPublic === true,
    name: str(b.name, base.name),
    race: race(b.race),
    vs: matchup(b.vs),
    notes: str(b.notes),
    tags: tags(b.tags),
    steps: sanitizeBuildSteps(b.steps),
    createdAt: num(b.createdAt, base.createdAt),
    updatedAt: num(b.updatedAt, base.updatedAt),
  }
}
