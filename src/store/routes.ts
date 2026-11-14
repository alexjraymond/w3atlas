import { useSyncExternalStore } from 'react'
import type { Route } from '../types'
import { newRoute, uid } from '../game/route'
import { MAP_BY_ID } from '../data/maps'

// Routes are stored in the browser (localStorage). Use Export / Import to back them up
// or move them between devices; share links embed a single route in the URL.

const KEY = 'w3atlas.routes.v1'

let routes: Route[] = load()
const listeners = new Set<() => void>()

function load(): Route[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(sanitizeRoute).filter((r): r is Route => !!r) : []
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(routes))
  } catch (e) {
    console.error('Could not save routes', e)
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

// keep multiple tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      routes = load()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useRoutes(): Route[] {
  return useSyncExternalStore(subscribe, () => routes)
}

export function useRoute(id: string | undefined): Route | undefined {
  const all = useRoutes()
  return all.find((r) => r.id === id)
}

export function getRoute(id: string) {
  return routes.find((r) => r.id === id)
}

export function saveRoute(route: Route) {
  const next = { ...route, updatedAt: Date.now() }
  const idx = routes.findIndex((r) => r.id === route.id)
  routes = idx === -1 ? [next, ...routes] : routes.map((r, i) => (i === idx ? next : r))
  emit()
  return next
}

export function updateRoute(id: string, patch: Partial<Route> | ((r: Route) => Partial<Route>)) {
  const current = getRoute(id)
  if (!current) return
  const p = typeof patch === 'function' ? patch(current) : patch
  saveRoute({ ...current, ...p })
}

export function deleteRoute(id: string) {
  routes = routes.filter((r) => r.id !== id)
  emit()
}

export function duplicateRoute(id: string): Route | undefined {
  const r = getRoute(id)
  if (!r) return
  const now = Date.now()
  return saveRoute({ ...structuredClone(r), id: uid(), name: `${r.name} (copy)`, createdAt: now, updatedAt: now })
}

/** Imports routes (always as new copies so nothing is overwritten). Returns count imported. */
export function importRoutes(data: unknown): Route[] {
  const list = Array.isArray(data) ? data : [data]
  const imported = list
    .map(sanitizeRoute)
    .filter((r): r is Route => !!r)
    .map((r) => ({ ...r, id: uid() }))
  routes = [...imported, ...routes]
  emit()
  return imported
}

export function exportJson(list: Route[]) {
  return JSON.stringify(list, null, 2)
}

// ---------- validation / migration ----------

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

export function sanitizeRoute(input: unknown): Route | null {
  if (!input || typeof input !== 'object') return null
  const r = input as Record<string, unknown>
  const mapId = str(r.mapId)
  if (!MAP_BY_ID[mapId]) return null
  const base = newRoute(mapId)
  const skills = arr<string>(r.skills).map((s) => str(s))
  return {
    ...base,
    id: str(r.id, base.id),
    name: str(r.name, base.name),
    race: (['human', 'orc', 'nightelf', 'undead'].includes(r.race as string) ? r.race : null) as Route['race'],
    vs: (['human', 'orc', 'nightelf', 'undead', 'random', 'any'].includes(r.vs as string) ? r.vs : 'any') as Route['vs'],
    hero: typeof r.hero === 'string' ? r.hero : null,
    skills: [...skills, ...Array(10).fill('')].slice(0, 10),
    steps: arr<Record<string, unknown>>(r.steps)
      .filter((s) => s && typeof s.campId === 'string')
      .map((s) => ({
        id: str(s.id, uid()),
        campId: s.campId as string,
        skipped: arr<string>(s.skipped).filter((x) => typeof x === 'string'),
        helpers:
          s.helpers && typeof s.helpers === 'object'
            ? Object.fromEntries(
                Object.entries(s.helpers as Record<string, unknown>).filter(
                  ([, n]) => typeof n === 'number' && n > 0,
                ) as [string, number][],
              )
            : {},
        note: str(s.note),
      })),
    build: arr<Record<string, unknown>>(r.build).map((b) => ({
      id: str(b?.id, uid()),
      supply: str(b?.supply),
      time: str(b?.time),
      action: str(b?.action),
    })),
    mapNotes: arr<Record<string, unknown>>(r.mapNotes)
      .filter((n) => n && typeof n.x === 'number' && typeof n.y === 'number')
      .map((n) => ({ id: str(n.id, uid()), x: n.x as number, y: n.y as number, text: str(n.text) })),
    notes: str(r.notes),
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : base.createdAt,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : base.updatedAt,
  }
}

// ---------- share links ----------

export function encodeShare(route: Route): string {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = route
  void _id
  void _c
  void _u
  const bytes = new TextEncoder().encode(JSON.stringify(rest))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare(code: string): Route | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return sanitizeRoute(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
