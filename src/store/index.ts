import type { Build, Route } from '../types'
import { newBuild, newId, newRoute } from '../game/route'
import { createCollection } from './collection'
import { sanitizeBuild, sanitizeRoute } from './sanitize'

// Everything is stored in this browser (localStorage). Export/Import moves data between devices;
// share links carry one route (and its build) inside the URL.

const ROUTES_KEY = 'w3atlas.routes.v1'
const BUILDS_KEY = 'w3atlas.builds.v1'

export const builds = createCollection<Build>(BUILDS_KEY, sanitizeBuild)

// Routes saved before builds were separate carry their build order inline; split those out once.
const pendingBuilds: Build[] = []
export const routes = createCollection<Route>(ROUTES_KEY, (raw) => {
  const res = sanitizeRoute(raw)
  if (res?.legacyBuild) pendingBuilds.push(res.legacyBuild)
  return res?.route ?? null
})
if (pendingBuilds.length) {
  builds.addMany(pendingBuilds)
  routes.all().forEach((r) => routes.put(r)) // persist the migrated routes
}

// ---------- who owns new things ----------
// Set by the account sync (src/cloud/sync.ts). New routes/builds belong to the signed-in user;
// while signed out they're only saved in this browser (ownerId null).
let currentUserId: string | null = null
export const setCurrentUser = (id: string | null) => {
  currentUserId = id
}
export const getCurrentUser = () => currentUserId

export function createRoute(mapId: string, partial: Partial<Route> = {}): Route {
  return routes.save(newRoute(mapId, { ...partial, ownerId: currentUserId, isPublic: false }))
}

export function createBuild(partial: Partial<Build> = {}): Build {
  return builds.save(newBuild({ ...partial, ownerId: currentUserId, isPublic: false }))
}

export const useRoutes = routes.useAll
export const useRoute = routes.useOne
export const useBuilds = builds.useAll
export const useBuild = builds.useOne

export function duplicateRoute(id: string): Route | undefined {
  const r = routes.get(id)
  if (!r) return
  const now = Date.now()
  return routes.save({ ...structuredClone(r), id: newId(), ownerId: currentUserId, isPublic: false, name: `${r.name} (copy)`, createdAt: now, updatedAt: now })
}

export function duplicateBuild(id: string): Build | undefined {
  const b = builds.get(id)
  if (!b) return
  const now = Date.now()
  return builds.save({ ...structuredClone(b), id: newId(), ownerId: currentUserId, isPublic: false, name: `${b.name} (copy)`, createdAt: now, updatedAt: now })
}

export function deleteBuild(id: string) {
  builds.remove(id)
  routes.all().filter((r) => r.buildId === id).forEach((r) => routes.put({ ...r, buildId: null }))
}

// ---------- export / import ----------

interface Bundle {
  app: 'w3atlas'
  version: 2
  routes: Route[]
  builds: Build[]
}

export function exportBundle(routeList: Route[], buildList?: Build[]): string {
  const linked = buildList ?? builds.all().filter((b) => routeList.some((r) => r.buildId === b.id))
  const bundle: Bundle = { app: 'w3atlas', version: 2, routes: routeList, builds: linked }
  return JSON.stringify(bundle, null, 2)
}

/**
 * Imports a bundle, a single route/build, or a v1 array of routes. Everything gets fresh ids
 * (so nothing existing is overwritten) and route→build links are kept.
 */
export function importData(data: unknown): { routes: Route[]; builds: Build[] } {
  const o = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const rawRoutes: unknown[] = Array.isArray(data) ? data : Array.isArray(o.routes) ? o.routes : 'mapId' in o ? [data] : []
  const rawBuilds: unknown[] = Array.isArray(o.builds) ? o.builds : !('mapId' in o) && 'steps' in o && !Array.isArray(data) ? [data] : []

  const idMap = new Map<string, string>()
  const newBuilds = rawBuilds
    .map(sanitizeBuild)
    .filter((b): b is Build => !!b)
    .map((b) => {
      const id = newId()
      idMap.set(b.id, id)
      return { ...b, id, ownerId: currentUserId, isPublic: false }
    })
  const newRoutes: Route[] = []
  for (const raw of rawRoutes) {
    const res = sanitizeRoute(raw)
    if (!res) continue
    if (res.legacyBuild) newBuilds.push({ ...res.legacyBuild, ownerId: currentUserId })
    const buildId = res.route.buildId ? (idMap.get(res.route.buildId) ?? (res.legacyBuild ? res.route.buildId : null)) : null
    newRoutes.push({ ...res.route, id: newId(), ownerId: currentUserId, isPublic: false, buildId })
  }
  if (newBuilds.length) builds.addMany(newBuilds)
  if (newRoutes.length) routes.addMany(newRoutes)
  return { routes: newRoutes, builds: newBuilds }
}

// ---------- share links ----------

function toBase64Url(text: string) {
  let bin = ''
  new TextEncoder().encode(text).forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string) {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeShare(route: Route): string {
  const build = route.buildId ? builds.get(route.buildId) : undefined
  return toBase64Url(JSON.stringify({ app: 'w3atlas', version: 2, routes: [route], builds: build ? [build] : [] }))
}

export function decodeShare(code: string): { route: Route; build: Build | null; raw: unknown } | null {
  try {
    const raw: unknown = JSON.parse(fromBase64Url(code))
    const o = raw as Record<string, unknown>
    const first = Array.isArray(o.routes) ? o.routes[0] : raw
    const res = sanitizeRoute(first)
    if (!res) return null
    const build = Array.isArray(o.builds) && o.builds[0] ? sanitizeBuild(o.builds[0]) : res.legacyBuild
    return { route: res.route, build, raw }
  } catch {
    return null
  }
}
